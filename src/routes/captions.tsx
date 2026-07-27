import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useState } from "react";
import { Mic, MicOff, Languages, Send, Trash2 } from "lucide-react";
import { PageShell } from "@/components/blindbridge/page-shell";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { translateCaption } from "@/lib/ai.functions";
import { speak } from "@/lib/speech";

const TITLE = "Deaf Mode — Live Captions & Voice Replies | BlindBridge AI";
const DESCRIPTION =
  "Turn every spoken word into large live captions, translate them instantly, and reply with a synthesised voice.";

export const Route = createFileRoute("/captions")({
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
  component: CaptionsPage,
});

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "hi-IN", label: "Hindi" },
  { code: "ar-SA", label: "Arabic" },
  { code: "ur-PK", label: "Urdu" },
] as const;

type Line = { id: number; text: string; translation?: string; who: "them" | "you" };

function CaptionsPage() {
  const [lang, setLang] = useState<string>("en-US");
  const [target, setTarget] = useState<string>("");
  const [interim, setInterim] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [reply, setReply] = useState("");
  const translate = useServerFn(translateCaption);

  const handleResult = useCallback(
    ({ transcript, isFinal }: { transcript: string; isFinal: boolean }) => {
      if (!isFinal) {
        setInterim(transcript);
        return;
      }
      setInterim("");
      const clean = transcript.trim();
      if (!clean) return;
      const id = Date.now() + Math.random();
      setLines((prev) => [...prev.slice(-60), { id, text: clean, who: "them" }]);
      if (target) {
        void translate({ data: { text: clean, target } })
          .then(({ text }) =>
            setLines((prev) => prev.map((l) => (l.id === id ? { ...l, translation: text } : l))),
          )
          .catch(() => undefined);
      }
    },
    [target, translate],
  );

  const { listening, supported, error, start, stop } = useSpeechRecognition(lang, handleResult);

  const sendReply = () => {
    const clean = reply.trim();
    if (!clean) return;
    setLines((prev) => [...prev.slice(-60), { id: Date.now(), text: clean, who: "you" }]);
    speak(clean);
    setReply("");
  };

  return (
    <PageShell
      title="Deaf Mode"
      intro="Live captions of everything said around you, optional translation, and a type-to-speak channel so hearing people hear your reply."
    >
      <div className="glass flex flex-wrap items-end gap-4 rounded-3xl p-4">
        <div className="min-w-48 flex-1">
          <label htmlFor="spoken-language" className="text-sm text-muted-foreground">
            Spoken language
          </label>
          <select
            id="spoken-language"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-48 flex-1">
          <label htmlFor="translate-to" className="text-sm text-muted-foreground">
            Translate captions to
          </label>
          <select
            id="translate-to"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <option value="">No translation</option>
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.label}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={listening ? stop : start}
          className="glow inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {listening ? <MicOff className="size-5" aria-hidden="true" /> : <Mic className="size-5" aria-hidden="true" />}
          {listening ? "Stop captions" : "Start captions"}
        </button>
        <button
          type="button"
          onClick={() => setLines([])}
          aria-label="Clear conversation"
          className="glass inline-flex size-12 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Trash2 className="size-5" aria-hidden="true" />
        </button>
      </div>

      {!supported ? (
        <p role="alert" className="mt-4 rounded-2xl bg-destructive/15 p-4">
          Live captions need a browser with speech recognition, such as Chrome or Edge.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 rounded-2xl bg-destructive/15 p-4">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="transcript" className="mt-6">
        <h2 id="transcript" className="sr-only">
          Live transcript
        </h2>
        <div aria-live="polite" className="glass min-h-64 space-y-3 rounded-3xl p-6">
          {lines.length === 0 && !interim ? (
            <p className="text-muted-foreground">Captions will appear here as people speak.</p>
          ) : null}
          {lines.map((line) => (
            <div
              key={line.id}
              className={
                line.who === "you"
                  ? "ml-auto max-w-[85%] rounded-3xl bg-primary/20 px-5 py-3 text-right"
                  : "max-w-[85%] rounded-3xl bg-secondary px-5 py-3"
              }
            >
              <p className="text-2xl leading-snug font-semibold">{line.text}</p>
              {line.translation ? (
                <p className="mt-1 inline-flex items-start gap-2 text-lg text-muted-foreground">
                  <Languages className="mt-1 size-4 shrink-0" aria-hidden="true" />
                  {line.translation}
                </p>
              ) : null}
            </div>
          ))}
          {interim ? <p className="text-2xl text-muted-foreground italic">{interim}</p> : null}
        </div>
      </section>

      <form
        className="mt-4 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          sendReply();
        }}
      >
        <label htmlFor="reply" className="sr-only">
          Type a reply to speak aloud
        </label>
        <input
          id="reply"
          value={reply}
          maxLength={400}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Type your reply — it will be spoken aloud"
          className="glass min-h-14 flex-1 rounded-full px-6 text-lg placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        <button
          type="submit"
          className="glow inline-flex min-h-14 items-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Send className="size-5" aria-hidden="true" />
          Speak
        </button>
      </form>
    </PageShell>
  );
}
