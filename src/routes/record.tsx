import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Check, Keyboard, Mic, Pencil, Square, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { draftToRequest, RequestFields, type RequestDraft } from "@/components/pakodo/RequestFields";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeech } from "@/hooks/use-speech";
import { extractRequest } from "@/lib/extract";
import { addRequest, useProfile } from "@/lib/pakodo-store";
import { LANGUAGES, type LanguageCode } from "@/lib/pakodo-types";

export const Route = createFileRoute("/record")({
  head: () => ({
    meta: [
      { title: "Record a request — PAKODO" },
      { name: "description", content: "Speak or type a customer's product request." },
      { property: "og:title", content: "Record a request — PAKODO" },
      { property: "og:description", content: "Speak or type a customer's product request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecordPage,
});

const EMPTY: RequestDraft = { product: "", customer: "", quantity: "", details: "" };

function RecordPage() {
  const profile = useProfile();
  const navigate = useNavigate();
  const [lang, setLang] = useState<LanguageCode>(profile.language);
  useEffect(() => setLang(profile.language), [profile.language]);
  const speech = useSpeech(lang);
  const [transcript, setTranscript] = useState("");
  const [step, setStep] = useState<"capture" | "confirm">("capture");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RequestDraft>(EMPTY);
  const [showError, setShowError] = useState(false);
  const [manual, setManual] = useState(false);

  // When the recogniser finishes, put its text into the editable box.
  useEffect(() => {
    if (!speech.listening && speech.finalText) setTranscript(speech.finalText);
  }, [speech.listening, speech.finalText]);

  const lowConfidence = speech.confidence !== null && speech.confidence > 0 && speech.confidence < 0.6;
  const unsupported = speech.supported === false;

  function goConfirm() {
    const text = transcript.trim();
    if (!text) {
      toast.error("Please say or type what the customer asked for.");
      return;
    }
    const ex = extractRequest(text);
    setDraft({ product: ex.product, customer: ex.customer ?? "", quantity: ex.quantity ?? "", details: "" });
    setShowError(false);
    setEditing(!ex.product);
    setStep("confirm");
  }

  function save() {
    if (!draft.product.trim()) {
      setShowError(true);
      setEditing(true);
      return;
    }
    try {
      const saved = addRequest({ ...draftToRequest(draft), ...(transcript.trim() ? { transcript: transcript.trim() } : {}) });
      toast.success(`Saved: ${saved.product}`, { description: "Request added to your history." });
      reset();
    } catch {
      toast.error("Could not save the request", {
        description: "Your browser storage may be full or blocked.",
        action: { label: "Retry", onClick: save },
      });
    }
  }

  function reset() {
    setTranscript("");
    setDraft(EMPTY);
    setStep("capture");
    setEditing(false);
    setShowError(false);
  }

  function cancel() {
    speech.stop();
    reset();
    void navigate({ to: "/" });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link to="/"><ArrowLeft className="size-5" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">{step === "capture" ? "New request" : "Confirm request"}</h1>
      </div>

      {step === "capture" && (
        <>
          <div role="radiogroup" aria-label="Speaking language" className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                role="radio"
                aria-checked={lang === l.code}
                onClick={() => setLang(l.code)}
                disabled={speech.listening}
                className="rounded-xl border border-border bg-card px-2 py-3 text-base font-semibold aria-checked:border-primary aria-checked:bg-primary/10 aria-checked:text-primary"
              >
                {l.native}
              </button>
            ))}
          </div>

          {!unsupported && !manual && (
            <section className="rounded-3xl border border-border bg-card p-6 text-center">
              <div className="relative mx-auto size-36">
                {speech.listening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-primary/40 animate-pulse-ring" />
                    <span className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring [animation-delay:0.5s]" />
                  </>
                )}
                <button
                  onClick={speech.listening ? speech.stop : speech.start}
                  disabled={speech.supported === null}
                  aria-label={speech.listening ? "Stop listening" : "Start speaking"}
                  className="relative flex size-36 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-mic transition-transform active:scale-95"
                >
                  {speech.listening ? <Square className="size-12 fill-current" /> : <Mic className="size-14" />}
                </button>
              </div>
              <p className="mt-5 font-display text-xl font-semibold" aria-live="polite">
                {speech.listening ? "Listening… speak now" : transcript ? "Tap to speak again" : "Tap and speak"}
              </p>
              <p className="text-sm text-muted-foreground">
                {speech.listening ? "It stops automatically when you pause." : "The microphone is only on while this button is active."}
              </p>
              {speech.listening && speech.interim && <p className="mt-3 text-lg italic text-muted-foreground">“{speech.interim}”</p>}
            </section>
          )}

          {speech.error && <SpeechErrorNote error={speech.error} onManual={() => setManual(true)} />}
          {unsupported && (
            <Note>
              Voice input isn't supported in this browser. You can type the request below — everything else works the same. (Voice works best in Chrome or Edge.)
            </Note>
          )}

          <section className="space-y-2">
            <label htmlFor="transcript" className="flex items-center gap-2 text-base font-semibold">
              <Keyboard className="size-4" /> {unsupported || manual ? "Type the request" : "Recognised text — check and edit"}
            </label>
            <Textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={3}
              placeholder="A customer asked for millet flour, but it is not available."
              className="text-lg"
            />
            {lowConfidence && transcript === speech.finalText && (
              <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                <AlertTriangle className="size-4" /> This may be misheard. Please check the text, or speak again.
              </p>
            )}
            {!unsupported && !manual && (
              <button onClick={() => setManual(true)} className="text-sm font-semibold text-primary">Prefer typing? Hide microphone</button>
            )}
            {manual && !unsupported && (
              <button onClick={() => setManual(false)} className="text-sm font-semibold text-primary">Use microphone</button>
            )}
          </section>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" className="h-14 text-lg" onClick={cancel}>Cancel</Button>
            <Button size="lg" className="h-14 text-lg" onClick={goConfirm} disabled={speech.listening || !transcript.trim()}>
              Continue
            </Button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          {transcript && (
            <p className="rounded-2xl bg-muted p-4 text-base italic text-muted-foreground">“{transcript}”</p>
          )}
          <section className="rounded-3xl border border-border bg-card p-5">
            {editing ? (
              <RequestFields value={draft} onChange={setDraft} showError={showError} />
            ) : (
              <dl className="grid gap-4">
                <Row label="Product name" value={draft.product} strong />
                <Row label="Customer name" value={draft.customer} />
                <Row label="Quantity" value={draft.quantity} />
                <Row label="Additional details" value={draft.details} />
              </dl>
            )}
            {!editing && <p className="mt-4 text-sm text-muted-foreground">Is this correct? Nothing is saved until you confirm.</p>}
          </section>
          <div className="grid gap-3">
            <Button size="lg" className="h-14 text-lg" onClick={save}>
              <Check className="size-5" /> Confirm and Save
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" className="h-14 text-lg" onClick={() => setEditing((e) => !e)}>
                <Pencil className="size-5" /> {editing ? "Done editing" : "Edit"}
              </Button>
              <Button variant="outline" size="lg" className="h-14 text-lg" onClick={() => setStep("capture")}>
                <X className="size-5" /> Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-display text-2xl font-bold" : "text-lg"}>{value || <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="flex gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-base">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
      <div>{children}</div>
    </div>
  );
}

function SpeechErrorNote({ error, onManual }: { error: string; onManual: () => void }) {
  const text: Record<string, string> = {
    denied: "Microphone permission was blocked. Allow the microphone in your browser's address bar, or type the request instead.",
    "no-speech": "We didn't hear anything. Please tap the microphone and speak again, or type the request.",
    network: "Voice recognition needs an internet connection in this browser. Please try again or type the request.",
    language: "This browser can't recognise speech in the selected language. Try English, or type the request.",
    unknown: "Something went wrong with voice input. Please try again or type the request.",
  };
  return (
    <Note>
      {text[error] ?? text["unknown"]}{" "}
      <button onClick={onManual} className="font-semibold text-primary underline">Type instead</button>
    </Note>
  );
}
