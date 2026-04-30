"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { PageIntro } from "@/components/shared/PageIntro";
import { SurfaceCard } from "@/components/shared/SurfaceCard";
import { API_URL } from "@/lib/api";
import { createSupportMessage, createSupportReply, fetchSupportMessages, fetchSupportReplies } from "@/services/api";
import { notify } from "@/lib/notify";
import { useI18n } from "@/app/providers";

type SupportMessageDto = {
  id: number;
  message: string;
  status: string;
  createdAt: string;
  updatedAt?: string | null;
};

type SupportReplyDto = {
  id: number;
  supportMessageId: number;
  authorRole: string;
  authorName: string;
  message: string;
  createdAt: string;
};

export default function SupportPage() {
  const { tx } = useI18n();
  const [needsAuth, setNeedsAuth] = useState(false);
  const [messages, setMessages] = useState<SupportMessageDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replies, setReplies] = useState<SupportReplyDto[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const selectedIdRef = useRef<number | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [messages]
  );

  const loadMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const data = await fetchSupportMessages();
      setMessages(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch {
      setNeedsAuth(true);
      return;
    }
  };

  const loadReplies = async (messageId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const data = await fetchSupportReplies(messageId);
      setReplies(data);
    } catch {
      setNeedsAuth(true);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/support`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("support:message:new", (message: SupportMessageDto) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }
        return [message, ...prev];
      });
    });

    connection.on("support:reply:new", (reply: SupportReplyDto) => {
      const current = selectedIdRef.current;
      if (current && reply.supportMessageId === current) {
        setReplies((prev) => [...prev, reply]);
      }
      if (reply.authorRole === "admin") {
        notify({
          title: tx("New reply", "Co tra loi moi"),
          message: reply.message,
        });
      }
    });

    connection
      .start()
      .catch(() => {
        // ignore connection errors
      });

    return () => {
      connection.stop();
    };
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadReplies(selectedId);
      const timer = window.setInterval(() => loadReplies(selectedId), 12000);
      return () => window.clearInterval(timer);
    }
  }, [selectedId]);

  const handleCreateMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      const created = await createSupportMessage(newMessage.trim());
      setNewMessage("");
      await loadMessages();
      if (!selectedId) {
        setSelectedId(created.id);
      }
      notify({
        title: tx("Message sent", "Da gui tin nhan"),
        message: tx("We will reply soon.", "Doi ngu se phan hoi som."),
      });
    } catch {
      notify({
        title: tx("Send failed", "Gui that bai"),
        message: tx("Please try again.", "Vui long thu lai."),
      });
    }
  };

  const handleReply = async () => {
    if (!replyDraft.trim() || !selectedId) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setNeedsAuth(true);
      return;
    }

    try {
      await createSupportReply(selectedId, replyDraft.trim());
      setReplyDraft("");
      await loadReplies(selectedId);
      await loadMessages();
    } catch {
      notify({
        title: tx("Send failed", "Gui that bai"),
        message: tx("Please try again.", "Vui long thu lai."),
      });
    }
  };

  if (needsAuth) {
    return (
      <div className="section-shell py-16 fade-in">
        <SurfaceCard className="p-10 text-center">
          <p className="text-sm text-emerald-800/70">
            {tx("Please sign in to see your support messages.", "Vui long dang nhap de xem ho tro.")}
          </p>
          <Link
            href="/?auth=login&next=%2Fsupport"
            className="mt-4 inline-flex rounded-full bg-emerald-700 px-6 py-2 text-sm font-semibold text-white"
          >
            {tx("Sign in", "Dang nhap")}
          </Link>
        </SurfaceCard>
      </div>
    );
  }

  return (
    <div className="section-shell space-y-10 py-12 fade-in">
      <PageIntro
        backLink={{ href: "/", label: tx("Home", "Trang chu") }}
        title={tx("Support center", "Ho tro khach hang")}
        description={tx("Chat with our team and track your requests.", "Theo doi va trao doi ho tro.")}
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <SurfaceCard className="space-y-4 p-6">
          <h2 className="text-sm font-semibold text-emerald-900">{tx("Your requests", "Yeu cau cua ban")}</h2>
          {sortedMessages.length === 0 && (
            <p className="text-xs text-emerald-700/70">{tx("No messages yet.", "Chua co tin nhan.")}</p>
          )}
          <div className="space-y-2">
            {sortedMessages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => setSelectedId(msg.id)}
                className={`w-full rounded-2xl border px-3 py-2 text-left text-xs ${
                  selectedId === msg.id
                    ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]"
                    : "border-[color:var(--stroke)] bg-white"
                }`}
              >
                <p className="font-semibold text-emerald-900">
                  {tx("Status", "Trang thai")}: {msg.status}
                </p>
                <p className="text-emerald-700/70 line-clamp-2">{msg.message}</p>
              </button>
            ))}
          </div>
        </SurfaceCard>

        <div className="space-y-6">
          <SurfaceCard className="space-y-4 p-6">
            <h2 className="text-sm font-semibold text-emerald-900">{tx("Start a new request", "Gui yeu cau moi")}</h2>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.currentTarget.value)}
              rows={4}
              placeholder={tx("Describe your issue...", "Mo ta van de cua ban...")}
              className="w-full rounded-2xl border border-[color:var(--stroke)] bg-white px-4 py-3 text-sm"
            />
            <button
              type="button"
              onClick={handleCreateMessage}
              className="rounded-full bg-emerald-700 px-5 py-2 text-sm font-semibold text-white"
            >
              {tx("Send request", "Gui yeu cau")}
            </button>
          </SurfaceCard>

          <SurfaceCard className="space-y-4 p-6">
            <h2 className="text-sm font-semibold text-emerald-900">{tx("Conversation", "Hoi thoai")}</h2>
            {selectedId ? (
              <>
                <div className="space-y-2">
                  {replies.length === 0 && (
                    <p className="text-xs text-emerald-700/70">{tx("No replies yet.", "Chua co tra loi.")}</p>
                  )}
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-2xl px-4 py-3 text-xs ${
                        reply.authorRole === "admin"
                          ? "bg-[color:var(--brand-soft)] text-emerald-900"
                          : "bg-white text-emerald-900 border border-[color:var(--stroke)]"
                      }`}
                    >
                      <p className="font-semibold">
                        {reply.authorRole === "admin"
                          ? tx("Admin", "Admin")
                          : reply.authorName || tx("You", "Ban")}
                      </p>
                      <p>{reply.message}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <input
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.currentTarget.value)}
                    placeholder={tx("Reply...", "Tra loi...")}
                    className="flex-1 rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleReply}
                    className="rounded-full border border-[color:var(--stroke)] px-4 py-2 text-xs font-semibold text-emerald-900"
                  >
                    {tx("Send reply", "Gui tra loi")}
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs text-emerald-700/70">{tx("Select a request to view replies.", "Chon yeu cau.")}</p>
            )}
          </SurfaceCard>
        </div>
      </div>
    </div>
  );
}



