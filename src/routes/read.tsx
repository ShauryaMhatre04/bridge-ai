import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Camera, Upload, Volume2, Square } from "lucide-react";
import { PageShell } from "@/components/blindbridge/page-shell";
import { useCamera } from "@/hooks/use-camera";
import { analyzeImage } from "@/lib/ai.functions";
import { speak, stopSpeaking, vibrate } from "@/lib/speech";

const TITLE = "Instant Reader — OCR for Labels, Menus & Money | BlindBridge AI";
const DESCRIPTION =
  "Read medicine labels, documents, menus, street signs, banknotes and colours out loud with one tap.";

export const Route = createFileRoute("/read")({
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
  component: ReaderPage,
});

const MODES = [
  { value: "ocr", label: "Text & documents" },
  { value: "medicine", label: "Medicine label" },
  { value: "currency", label: "Money" },
  { value: "color", label: "Colour" },
  { value: "scene", label: "Describe" },
] as const;

type Mode = (typeof MODES)[number]["value"];

function ReaderPage() {
  const { videoRef, active, error, start, stop, capture } = useCamera("environment");
  const analyze = useServerFn(analyzeImage);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<Mode>("ocr");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const run = async (image: string) => {
    setBusy(true);
    setMessage("Reading…");
    try {
      const { text } = await analyze({ data: { image, mode } });
      setResult(text);
      setMessage("");
      speak(text);
      vibrate(30);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Reading failed.";
      setMessage(msg);
      speak(msg);
    } finally {
      setBusy(false);
    }
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") void run(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageShell
      title="Instant Reader"
      intro="Capture with your camera or upload a photo. BlindBridge reads it aloud and keeps the text on screen in large type."
    >
      <fieldset className="glass rounded-3xl p-4">
        <legend className="px-2 text-sm text-muted-foreground">What are you reading?</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={mode === m.value}
              onClick={() => setMode(m.value)}
              className={`min-h-12 rounded-full px-5 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                mode === m.value ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="glass mt-4 overflow-hidden rounded-3xl">
        <div className="relative aspect-video bg-black">
          <video ref={videoRef} playsInline muted className="size-full object-cover" aria-label="Camera preview" />
          {!active ? (
            <p className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Camera is off
            </p>
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
            disabled={!active || busy}
            onClick={() => {
              const image = capture();
              if (image) void run(image);
            }}
            className="glow inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Capture & read
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="glass inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Upload className="size-5" aria-hidden="true" />
            Upload photo
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Upload a photo to read"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-destructive/15 p-4">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="result" className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="result" className="text-xl font-semibold">
            Result
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => speak(result)}
              disabled={!result}
              className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-5 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Volume2 className="size-5" aria-hidden="true" />
              Read again
            </button>
            <button
              type="button"
              onClick={stopSpeaking}
              className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Square className="size-5" aria-hidden="true" />
              Stop
            </button>
          </div>
        </div>
        <p aria-live="polite" className="glass mt-3 min-h-40 rounded-3xl p-6 text-2xl leading-relaxed whitespace-pre-wrap">
          {busy ? "Reading…" : result || message || "Captured text will appear here."}
        </p>
      </section>
    </PageShell>
  );
}
