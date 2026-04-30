"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { fetchSearchSuggestions, type SearchSuggestionDto } from "@/services/api";
import { useI18n } from "@/app/providers";
import SearchSuggestionsList from "@/components/search/SearchSuggestionsList";

type SearchSuggestInputProps = {
  name: string;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  defaultValue?: string;
  enableVoice?: boolean;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results?: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function SearchSuggestInput({ name, placeholder, className, inputClassName, defaultValue, enableVoice = false }: SearchSuggestInputProps) {
  const router = useRouter();
  const { tx } = useI18n();
  const [query, setQuery] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SearchSuggestionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [listening, setListening] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (typeof defaultValue === "string") {
      setQuery(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (!enableVoice) return;

    const SpeechRecognition =
      typeof window !== "undefined"
        ? (window as Window & { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
          (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognition) {
      setVoiceError(tx("Voice search is not supported in this browser.", "Trình duyệt này không hỗ trợ tìm kiếm giọng nói."));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = typeof navigator !== "undefined" ? navigator.language : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (transcript) {
        setQuery(transcript);
        setOpen(false);
      }
    };

    recognition.onerror = () => {
      setVoiceError(tx("Voice input failed. Please try again.", "Không thể nhận diện giọng nói. Hãy thử lại."));
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [enableVoice, tx]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const data = await fetchSearchSuggestions(trimmedQuery, controller.signal);
        setItems(data);
        setOpen(data.length > 0);
      } catch {
        if (!controller.signal.aborted) {
          setItems([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (item: SearchSuggestionDto) => {
    setOpen(false);
    if (item.type === "path") {
      router.push(`/paths/${item.slug}`);
      return;
    }
    router.push(`/courses/${item.slug}`);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          name={name}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          className={`${inputClassName ?? ""} ${enableVoice ? "pr-10" : ""}`.trim()}
          autoComplete="off"
        />
        {enableVoice ? (
          <button
            type="button"
            onClick={() => {
              if (!recognitionRef.current) {
                setVoiceError(tx("Voice search is not supported in this browser.", "Trình duyệt này không hỗ trợ tìm kiếm giọng nói."));
                return;
              }
              setVoiceError("");
              if (listening) {
                recognitionRef.current.stop();
                setListening(false);
                return;
              }
              try {
                recognitionRef.current.start();
                setListening(true);
              } catch {
                setListening(false);
              }
            }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[11px] font-semibold ${
              listening ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600"
            }`}
            aria-label={tx("Start voice search", "Bắt đầu tìm kiếm bằng giọng nói")}
          >
            {listening ? tx("Listening", "Đang nghe") : tx("Voice", "Giọng nói")}
          </button>
        ) : null}
      </div>

      {voiceError ? <div className="mt-2 text-[11px] text-amber-700">{voiceError}</div> : null}
      {open ? <SearchSuggestionsList items={items} loading={loading} tx={tx} onSelect={handleSelect} /> : null}
    </div>
  );
}
