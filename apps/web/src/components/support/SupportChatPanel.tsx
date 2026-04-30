"use client";

type Props = {
  tx: (en: string, vi: string) => string;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  status: string;
  sending: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function SupportChatPanel({ tx, name, setName, email, setEmail, message, setMessage, status, sending, onClose, onSubmit }: Props) {
  return (
    <div className="mb-3 w-80 rounded-3xl surface-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-emerald-950">{tx("Need help?", "Cần hỗ trợ?")}</p>
          <p className="text-xs text-emerald-700/70">{tx("We reply within 24 hours.", "Phản hồi trong vòng 24 giờ.")}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-[color:var(--stroke)] px-2 py-1 text-[10px] font-semibold text-emerald-800">
          {tx("Close", "Đóng")}
        </button>
      </div>

      <div className="mt-4 space-y-2">
        <input value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder={tx("Your name", "Tên của bạn")} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-3 py-2 text-xs" />
        <input value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder={tx("Email", "Email")} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-3 py-2 text-xs" />
        <textarea value={message} onChange={(e) => setMessage(e.currentTarget.value)} placeholder={tx("How can we help?", "Bạn cần hỗ trợ gì?")} rows={4} className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-3 py-2 text-xs" />
      </div>

      {status ? <p className="mt-2 text-xs text-emerald-700">{status}</p> : null}

      <button type="button" onClick={onSubmit} disabled={sending} className="mt-4 w-full rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white">
        {sending ? tx("Sending...", "Đang gửi...") : tx("Send message", "Gửi tin nhắn")}
      </button>
    </div>
  );
}
