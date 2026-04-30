"use client";

type Props = {
  open: boolean;
  tx: (en: string, vi: string) => string;
  onToggle: () => void;
};

export default function SupportChatToggle({ open, tx, onToggle }: Props) {
  return (
    <button type="button" onClick={onToggle} className="rounded-full bg-emerald-700 px-5 py-3 text-xs font-semibold text-white shadow-lg">
      {open ? tx("Support", "Hỗ trợ") : tx("Chat with us", "Chat hỗ trợ")}
    </button>
  );
}
