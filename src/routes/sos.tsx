import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Siren, MapPin, Phone, Trash2, Plus } from "lucide-react";
import { PageShell } from "@/components/blindbridge/page-shell";
import { speak, vibrate } from "@/lib/speech";

const TITLE = "Emergency SOS — Share Live Location | BlindBridge AI";
const DESCRIPTION =
  "One tap shares your exact location with trusted contacts and starts a call, hands free.";

export const Route = createFileRoute("/sos")({
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
  component: SosPage,
});

type Contact = { id: string; name: string; phone: string };
const STORAGE_KEY = "blindbridge.contacts";

function SosPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setContacts(JSON.parse(raw) as Contact[]);
    } catch {
      setContacts([]);
    }
  }, []);

  const persist = (next: Contact[]) => {
    setContacts(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addContact = () => {
    const cleanName = name.trim().slice(0, 60);
    const cleanPhone = phone.trim().replace(/[^\d+]/g, "").slice(0, 20);
    if (!cleanName || cleanPhone.length < 5) {
      setStatus("Enter a name and a valid phone number.");
      return;
    }
    persist([...contacts, { id: crypto.randomUUID(), name: cleanName, phone: cleanPhone }]);
    setName("");
    setPhone("");
    setStatus(`${cleanName} added to emergency contacts.`);
  };

  const locate = () =>
    new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Location is not available in this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error("Location permission was denied.")),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });

  const triggerSos = async () => {
    vibrate([120, 60, 120, 60, 240]);
    setStatus("Getting your location…");
    speak("Sending emergency alert.");
    try {
      const position = await locate();
      setCoords(position);
      const mapUrl = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
      const message = `EMERGENCY: I need help. My location: ${mapUrl}`;
      const first = contacts[0];
      if (first) {
        window.location.href = `sms:${first.phone}?&body=${encodeURIComponent(message)}`;
        setStatus(`Alert prepared for ${first.name} with your live location.`);
        speak(`Alert prepared for ${first.name}.`);
      } else {
        await navigator.clipboard?.writeText(message).catch(() => undefined);
        setStatus("No contacts saved. Your location link was copied to the clipboard.");
        speak("No contacts saved. Location copied.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not get your location.";
      setStatus(msg);
      speak(msg);
    }
  };

  return (
    <PageShell
      title="Emergency SOS"
      intro="Save trusted contacts once. When you need help, one large button captures your location and prepares an alert."
    >
      <button
        type="button"
        onClick={() => void triggerSos()}
        className="glow-solar flex min-h-40 w-full flex-col items-center justify-center gap-3 rounded-[2rem] bg-destructive text-destructive-foreground transition-transform hover:scale-[1.01] focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Siren className="size-12" aria-hidden="true" />
        <span className="text-3xl font-bold">Send SOS</span>
        <span className="text-sm opacity-90">Shares your live location with your first contact</span>
      </button>

      <p aria-live="assertive" className="glass mt-4 rounded-3xl p-5 text-lg">
        {status || "Ready."}
      </p>

      {coords ? (
        <a
          href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
          target="_blank"
          rel="noreferrer"
          className="glass mt-3 inline-flex min-h-12 items-center gap-2 rounded-full px-6 font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <MapPin className="size-5" aria-hidden="true" />
          Open my location on the map
        </a>
      ) : null}

      <section aria-labelledby="contacts" className="mt-10">
        <h2 id="contacts" className="text-2xl font-semibold">
          Emergency contacts
        </h2>
        <p className="mt-1 text-muted-foreground">Stored privately on this device only.</p>

        <form
          className="glass mt-4 flex flex-wrap gap-3 rounded-3xl p-4"
          onSubmit={(e) => {
            e.preventDefault();
            addContact();
          }}
        >
          <div className="min-w-48 flex-1">
            <label htmlFor="contact-name" className="text-sm text-muted-foreground">
              Name
            </label>
            <input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </div>
          <div className="min-w-48 flex-1">
            <label htmlFor="contact-phone" className="text-sm text-muted-foreground">
              Phone number
            </label>
            <input
              id="contact-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 min-h-12 w-full rounded-2xl bg-secondary px-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-12 items-center gap-2 self-end rounded-full bg-primary px-6 font-semibold text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="size-5" aria-hidden="true" />
            Add contact
          </button>
        </form>

        <ul className="mt-4 space-y-3">
          {contacts.map((contact) => (
            <li key={contact.id} className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
              <span className="flex-1 text-lg font-medium">{contact.name}</span>
              <span className="text-muted-foreground">{contact.phone}</span>
              <a
                href={`tel:${contact.phone}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call
              </a>
              <button
                type="button"
                aria-label={`Remove ${contact.name}`}
                onClick={() => persist(contacts.filter((c) => c.id !== contact.id))}
                className="inline-flex size-11 items-center justify-center rounded-full bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
          {contacts.length === 0 ? <li className="text-muted-foreground">No contacts saved yet.</li> : null}
        </ul>
      </section>
    </PageShell>
  );
}
