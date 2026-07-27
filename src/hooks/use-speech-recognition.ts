import { useCallback, useEffect, useRef, useState } from "react";

type RecognitionResult = { transcript: string; isFinal: boolean };

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function useSpeechRecognition(lang: string, onResult: (r: RecognitionResult) => void) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const callbackRef = useRef(onResult);
  const wantedRef = useRef(false);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  callbackRef.current = onResult;

  useEffect(() => {
    setSupported(getRecognition() !== null);
  }, []);

  const stop = useCallback(() => {
    wantedRef.current = false;
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const recognition = getRecognition();
    if (!recognition) {
      setSupported(false);
      return;
    }
    setError(null);
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        callbackRef.current({ transcript: result[0].transcript, isFinal: result.isFinal });
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed") setError("Microphone permission was denied.");
      else if (event.error !== "no-speech" && event.error !== "aborted") setError(`Microphone error: ${event.error}`);
    };
    recognition.onend = () => {
      if (wantedRef.current) recognition.start();
      else setListening(false);
    };
    recognitionRef.current = recognition;
    wantedRef.current = true;
    recognition.start();
    setListening(true);
  }, [lang]);

  useEffect(() => () => {
    wantedRef.current = false;
    recognitionRef.current?.stop();
  }, []);

  return { listening, supported, error, start, stop };
}
