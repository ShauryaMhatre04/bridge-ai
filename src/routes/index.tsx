import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Ear, ScanText, Siren, Activity, Sparkles, ShieldCheck, Gauge } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/blindbridge/site-chrome";

const TITLE = "BlindBridge AI — Accessibility, Reimagined with AI";
const DESCRIPTION =
  "AI navigation, scene description, live captions and instant text reading for blind and deaf users — in your browser, no hardware required.";

export const Route = createFileRoute("/")({
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
  component: Landing,
});

const MODES = [
  {
    to: "/vision",
    icon: Eye,
    title: "Blind Mode",
    body: "Point your camera and hear what's ahead — obstacles, crossings, signs and full scene descriptions, spoken aloud.",
  },
  {
    to: "/captions",
    icon: Ear,
    title: "Deaf Mode",
    body: "Live, large-type captions of every spoken word, with instant translation and a type-to-speak reply channel.",
  },
  {
    to: "/read",
    icon: ScanText,
    title: "Instant Reader",
    body: "Medicine labels, menus, documents, banknotes and street signs — read out loud in seconds.",
  },
  {
    to: "/sos",
    icon: Siren,
    title: "Emergency SOS",
    body: "One tap shares your live location with trusted contacts and starts a call, hands free.",
  },
] as const;

const STATS = [
  { value: "2.2B", label: "people with vision impairment" },
  { value: "430M", label: "people with hearing loss" },
  { value: "<2s", label: "guidance response target" },
  { value: "WCAG AA", label: "contrast and focus baseline" },
] as const;

function Landing() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-36 pb-16 text-center sm:pt-44">
          <p className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium sm:text-sm">
            <Sparkles className="size-4 text-accent" aria-hidden="true" />
            Live AI assistance, running in your browser
          </p>

          <h1 className="text-gradient mx-auto mt-8 max-w-4xl text-5xl leading-[1.05] font-bold sm:text-7xl">
            Accessibility, reimagined with AI
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            BlindBridge AI removes communication and mobility barriers for deaf and visually impaired
            people — real-time vision, voice and captions on the device you already own.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/vision"
              className="glow inline-flex min-h-12 items-center rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              Start Blind Mode
            </Link>
            <Link
              to="/captions"
              className="glass inline-flex min-h-12 items-center rounded-full px-7 text-base font-semibold transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Start Deaf Mode
            </Link>
          </div>

          <div className="relative mx-auto mt-20 max-w-5xl">
            <div
              className="animate-float glass glow-solar rounded-[2rem] p-4 text-left sm:p-6"
              aria-label="Preview of the BlindBridge assistant interface"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <span className="text-sm font-bold tracking-[0.18em] uppercase">BlindBridge</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-chart-3" />
                    <span className="relative inline-flex size-2 rounded-full bg-chart-3" />
                  </span>
                  AI vision online
                </span>
              </div>

              <div className="grid gap-4 pt-5 sm:grid-cols-3">
                <div className="rounded-2xl bg-secondary/60 p-4 sm:col-span-2">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">Live guidance</p>
                  <p className="mt-2 text-lg font-medium">
                    “Kerb about two metres ahead. Crossing light is green — continue straight.”
                  </p>
                  <div className="mt-4 flex gap-2" aria-hidden="true">
                    {[38, 64, 22, 80, 47, 71, 30].map((h, i) => (
                      <span
                        key={i}
                        className="w-2 rounded-full bg-primary/70"
                        style={{ height: `${h / 2 + 12}px` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-secondary/60 p-4">
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">Signal</p>
                  <p className="mt-2 text-3xl font-bold text-accent">180 ms</p>
                  <p className="text-sm text-muted-foreground">frame to voice</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="modes">
          <h2 id="modes" className="text-3xl font-bold sm:text-4xl">
            Four assistants, one bridge
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {MODES.map((mode) => (
              <Link
                key={mode.to}
                to={mode.to}
                className="glass group rounded-3xl p-6 transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="glow inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <mode.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-semibold">{mode.title}</h3>
                <p className="mt-2 text-muted-foreground">{mode.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="impact">
          <h2 id="impact" className="sr-only">
            Impact
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass flex flex-col-reverse rounded-3xl p-6">
                <dt className="text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="text-3xl font-bold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="principles">
          <h2 id="principles" className="text-3xl font-bold sm:text-4xl">
            Built accessible first
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: Activity, title: "Voice-first", body: "Every screen speaks. Large targets, screen-reader labels, haptic confirmation." },
              { icon: ShieldCheck, title: "Private by design", body: "Frames are analysed on demand and never stored. Contacts stay on your device." },
              { icon: Gauge, title: "Low latency", body: "Compressed frames and short prompts keep spoken guidance under two seconds." },
            ].map((item) => (
              <div key={item.title} className="glass rounded-3xl p-6">
                <item.icon className="size-6 text-accent" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
