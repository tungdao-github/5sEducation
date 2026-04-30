"use client";

import { useEffect, useState } from "react";
import { createSupportMessage, fetchCurrentUser } from "@/services/api";
import { useI18n } from "@/app/providers";
import SupportChatPanel from "@/components/support/SupportChatPanel";
import SupportChatToggle from "@/components/support/SupportChatToggle";

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
        const data = await fetchCurrentUser();
        const fullName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
        setName(fullName);
        setEmail(data.email ?? "");
      } catch {
        // ignore
      }
    };

    void loadProfile();
  }, []);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setStatus(tx("Please enter a message.", "Vui lòng nhập nội dung."));
      return;
    }

    setSending(true);
    setStatus("");
    try {
      await createSupportMessage(message.trim(), name.trim(), email.trim());
      setMessage("");
      setStatus(tx("Sent. Our team will reply soon.", "Đã gửi. Đội ngũ sẽ phản hồi sớm."));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : tx("Something went wrong.", "Có lỗi xảy ra."));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {open ? (
        <SupportChatPanel
          tx={tx}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          message={message}
          setMessage={setMessage}
          status={status}
          sending={sending}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
      <SupportChatToggle open={open} tx={tx} onToggle={() => setOpen((prev) => !prev)} />
    </div>
  );
}
