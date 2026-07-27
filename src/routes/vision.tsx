import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Play, Square, Volume2, VolumeX } from "lucide-react";
import { PageShell } from "@/components/blindbridge/page-shell";
import { useCamera } from "@/hooks/use-camera";
import { analyzeImage } from "@/lib/ai.functions";
import { speak, stopSpeaking, vibrate } from "@/lib/speech";

const TITLE = "Blind Mode — Live AI Navigation | BlindBridge AI";
const DESCRIPTION =
  "Point your camera and hear obstacles, crossings and scene descriptions spoken aloud in real time.";

export const Route = createFileRoute("/vision")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VisionPage,
});

type Entry = { id: number; text: string; at: string };

function VisionPage() {
  const { videoRef, active, error, start, stop, capture } = useCamera("environment");
  const analyze = useServerFn(analyzeImage);
  const [guiding, setGuiding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState("Camera off.");
  const [log, setLog] = useState<Entry[]>([]);
  const runningRef = useRef(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const runAnalysis = useCallback(
    async (mode: "navigation" | "scene") => {
      const image = capture();
      if (!image) {
        setStatus("No camera frame available yet.");
        return;
      }
      setBusy(true);
      try {
        const { text } = await analyze({ data: { image, mode } });
        setStatus(text);
        setLog((prev) => [
          { id: Date.now(), text, at: new Date().toLocaleTimeString() },
          ...prev.slice(0, 29),
        ]);
        if (!mutedRef.current) speak(text);
        vibrate(mode === "navigation" ? 30 : [20, 40, 20]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed.";
        setStatus(message);
        if (!mutedRef.current) speak(message);
      } finally {
        setBusy(false);
      }
    },
    [analyze, capture],
  );

  const startGuidance = useCallback(async () => {
    if (!active) await start();
    runningRef.current = true;
    setGuiding(true);
    const loop = async () => {
      while (runningRef.current) {
        await runAnalysis("navigation");
        if (!runningRef.current) break;
        await new Promise((r) => setTimeout(r, 1200));
      }
    };
    void loop();
  }, [active, runAnalysis, start]);

  const stopGuidance = useCallback(() => {
    runningRef.current = false;
    setGuiding(false);
    stopSpeaking();
    setStatus("Guidance paused.");
  }, []);

  useEffect(
    () => () => {
      runningRef.current = false;
      stopSpeaking();
    },
    [],
  );

  return (
    <PageShell
      title="Blind Mode"
      intro="Continuous walking guidance and on-demand scene description. Keep the camera facing forward — chest height works best."
    >
      <div className="glass overflow-hidden rounded-3xl">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            playsInline
            muted
            className="size-full object-cover"
            aria-label="Live camera preview"
          />
          {!active ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <CameraOff className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-muted-foreground">Camera is off</p>
            </div>
          ) : null}
          {busy ? (
            <span className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
              Analysing…
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 p-4">
          <button
            type="button"
            onClick={active ? stop : start}
            className="glass inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Camera className="size-5" aria-hidden="true" />
            {active ? "Stop camera" : "Start camera"}
          </button>
          <button
            type="button"
            onClick={guiding ? stopGuidance : startGuidance}
            className="glow inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {guiding ? <Square className="size-5" aria-hidden="true" /> : <Play className="size-5" aria-hidden="true" />}
            {guiding ? "Stop guidance" : "Start guidance"}
          </button>
          <button
            type="button"
            onClick={() => void runAnalysis("scene")}
            disabled={!active || busy}
            className="glass inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Describe scene
          </button>
          <button
            type="button"
            onClick={() => {
              setMuted((v) => !v);
              stopSpeaking();
            }}
            aria-pressed={muted}
            className="glass inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {muted ? <VolumeX className="size-5" aria-hidden="true" /> : <Volume2 className="size-5" aria-hidden="true" />}
            {muted ? "Voice off" : "Voice on"}
          </button>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-destructive/15 p-4 text-destructive-foreground">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="guidance" className="mt-6">
        <h2 id="guidance" className="sr-only">
          Current guidance
        </h2>
        <p
          aria-live="assertive"
          className="glass rounded-3xl p-6 text-2xl leading-snug font-semibold sm:text-3xl"
        >
          {status}
        </p>
      </section>

      {log.length > 0 ? (
        <section aria-labelledby="history" className="mt-6">
          <h2 id="history" className="text-xl font-semibold">
            Recent guidance
          </h2>
          <ul className="mt-3 space-y-2">
            {log.map((entry) => (
              <li key={entry.id} className="glass rounded-2xl px-4 py-3">
                <span className="text-sm text-muted-foreground">{entry.at}</span>
                <p>{entry.text}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageShell>
  );
}
