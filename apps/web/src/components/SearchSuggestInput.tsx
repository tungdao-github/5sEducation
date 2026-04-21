"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";
import { Search } from "lucide-react";

type Suggestion = {
  type: string;
  title: string;
  slug: string;
  subtitle?: string;
};

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

export function SearchSuggestInput({
  name,
  placeholder,
  className,
  inputClassName,
  defaultValue,
  enableVoice = false,
}: SearchSuggestInputProps) {
  const router = useRouter();
  const { tx } = useI18n();
  const [query, setQuery] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [listening, setListening] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const grouped = useMemo(() => {
    const courses = items.filter((item) => item.type === "course");
    const paths = items.filter((item) => item.type === "path");
    return { courses, paths };
  }, [items]);

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
        ? (window as Window & {
            SpeechRecognition?: new () => SpeechRecognitionLike;
            webkitSpeechRecognition?: new () => SpeechRecognitionLike;
          }).SpeechRecognition ||
          (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
            .webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognition) {
      setVoiceError(tx("Voice search is not supported in this browser.", "Trinh duyet nay khong ho tro tim kiem giong noi."));
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
      setVoiceError(tx("Voice input failed. Please try again.", "Khong the nhan dien giong noi. Hay thu lai."));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

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
        const res = await fetch(
          `${API_URL}/api/search/suggestions?query=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          setItems([]);
          setOpen(false);
          return;
        }
        const data = (await res.json()) as Suggestion[];
        setItems(data);
        setOpen(data.length > 0);
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        setItems([]);
        setOpen(false);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (item: Suggestion) => {
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
        {enableVoice && (
          <button
            type="button"
            onClick={() => {
              if (!recognitionRef.current) {
                setVoiceError(tx("Voice search is not supported in this browser.", "Trinh duyet nay khong ho tro tim kiem giong noi."));
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
            aria-label={tx("Start voice search", "Bat dau tim kiem bang giong noi")}
          >
            {listening ? tx("Listening", "Dang nghe") : tx("Voice", "Giong noi")}
          </button>
        )}
      </div>
      {voiceError && (
        <div className="mt-2 text-[11px] text-amber-700">
          {voiceError}
        </div>
      )}
      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-2xl border border-[color:var(--stroke)] bg-white p-2 shadow-lg">
          {loading && (
            <div className="px-3 py-2 text-xs text-gray-500">
              {tx("Searching...", "Dang tim...")}
            </div>
          )}
          {!loading && items.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-500">
              {tx("No matches yet.", "Chua co goi y.")}
            </div>
          )}
          {grouped.paths.length > 0 && (
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              {tx("Paths", "Lo trinh")}
            </div>
          )}
          {grouped.paths.map((item) => (
            <button
              key={`path-${item.slug}`}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left text-xs font-semibold text-gray-900 hover:bg-blue-50"
            >
              <span>{item.title}</span>
              {item.subtitle && <span className="text-[11px] text-gray-500">{item.subtitle}</span>}
            </button>
          ))}
          {grouped.courses.length > 0 && (
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              {tx("Courses", "Khoa hoc")}
            </div>
          )}
          {grouped.courses.map((item) => (
            <button
              key={`course-${item.slug}`}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left text-xs font-semibold text-gray-900 hover:bg-blue-50"
            >
              <span>{item.title}</span>
              {item.subtitle && <span className="text-[11px] text-gray-500">{item.subtitle}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


