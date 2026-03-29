"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";
import { useI18n } from "@/app/providers";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
};

export function SupportChatWidget() {
  const { tx } = useI18n();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as Profile;
        const fullName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
        setName(fullName);
        setEmail(data.email ?? "");
      } catch {
        // ignore
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setStatus(tx("Please enter a message.", "Vui long nhap noi dung."));
      return;
    }

    setSending(true);
    setStatus("");
    try {
      const res = await fetch(`${API_URL}/api/support/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || tx("Unable to send message.", "Khong gui duoc tin nhan."));
      }

      setMessage("");
      setStatus(tx("Sent. Our team will reply soon.", "Da gui. Doi ngu se phan hoi som."));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : tx("Something went wrong.", "Co loi xay ra."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {open && (
        <div className="mb-3 w-80 rounded-3xl border border-emerald-100 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-950">
                {tx("Need help?", "Can ho tro?")}
              </p>
              <p className="text-xs text-emerald-700/70">
                {tx("We reply within 24 hours.", "Phan hoi trong vong 24 gio.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-800"
            >
              {tx("Close", "Dong")}
            </button>
          </div>

          <div className="mt-4 space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder={tx("Your name", "Ten cua ban")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-xs"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder={tx("Email", "Email")}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-xs"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              placeholder={tx("How can we help?", "Ban can ho tro gi?")}
              rows={4}
              className="w-full rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-xs"
            />
          </div>

          {status && (
            <p className="mt-2 text-xs text-emerald-700">{status}</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            className="mt-4 w-full rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold text-white"
          >
            {sending ? tx("Sending...", "Dang gui...") : tx("Send message", "Gui tin nhan")}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-emerald-700 px-5 py-3 text-xs font-semibold text-white shadow-lg"
      >
        {open ? tx("Support", "Ho tro") : tx("Chat with us", "Chat ho tro")}
      </button>
    </div>
  );
}
