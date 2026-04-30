"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/app/providers";
import type { LearningLesson } from "@/services/api";

type QaItem = {
  id: string;
  user: string;
  avatar: string;
  time: string;
  question: string;
  answer?: string;
  votes: number;
};

type Translate = (en: string, vi: string, es?: string, fr?: string) => string;

function buildInitialQa(tx: Translate): QaItem[] {
  return [
    {
      id: "1",
      user: tx("Nguyen Van An", "Nguyễn Văn An"),
      avatar: "NA",
      time: tx("2 days ago", "2 ngày trước"),
      question: tx(
        "If I retake the quiz, will my progress be lost?",
        "Nếu tôi làm lại bài quiz thì tiến độ có bị mất không?"
      ),
      answer: tx(
        "No. Your progress and quiz results are still saved. You can retake it anytime to improve your score.",
        "Không. Tiến độ và kết quả bài quiz vẫn được lưu. Bạn có thể làm lại để cải thiện điểm bất cứ lúc nào."
      ),
      votes: 12,
    },
    {
      id: "2",
      user: tx("Tran Thi Binh", "Trần Thị Bình"),
      avatar: "TB",
      time: tx("5 days ago", "5 ngày trước"),
      question: tx(
        "Does the backend video URL support YouTube and Vimeo?",
        "Video URL từ backend có hỗ trợ YouTube và Vimeo không?"
      ),
      answer: tx(
        "Yes. The lesson page automatically switches to an iframe embed for YouTube and Vimeo, while direct video files use the native player.",
        "Có. Trang học tự động đổi sang iframe embed cho YouTube và Vimeo, còn video file thì phát bằng player native."
      ),
      votes: 8,
    },
    {
      id: "3",
      user: tx("Le Minh Duc", "Lê Minh Đức"),
      avatar: "LM",
      time: tx("1 week ago", "1 tuần trước"),
      question: tx(
        "Can I seek a video based on timestamp notes?",
        "Ghi chú theo timestamp có tua video được không?"
      ),
      answer: tx(
        "Yes for native videos. If a lesson uses an iframe embed, notes are still saved, but seeking depends on the original player.",
        "Có với video native. Nếu bài học đang dùng iframe embed thì ghi chú vẫn được lưu, nhưng việc tua phụ thuộc player gốc."
      ),
      votes: 15,
    },
  ];
}

type Props = {
  lesson: LearningLesson;
};

export default function CourseLearnQATab({ lesson }: Props) {
  const { tx } = useI18n();
  const [question, setQuestion] = useState("");
  const [items, setItems] = useState<QaItem[]>(() => buildInitialQa(tx));

  useEffect(() => {
    setItems(buildInitialQa(tx));
  }, [tx]);

  const handleSubmit = () => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setItems((current) => [
      {
        id: `local-${Date.now()}`,
        user: tx("You", "Bạn"),
        avatar: "BN",
        time: tx("Just now", "Vừa xong"),
        question: trimmed,
        votes: 0,
      },
      ...current,
    ]);
    setQuestion("");
  };

  const handleVote = (id: string) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item)));
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">{tx("Q&A", "Hỏi & Đáp")}</h2>
          <span className="text-sm text-gray-500">
            {items.length} {tx("questions", "câu hỏi")}
          </span>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 p-4">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">{tx("Ask a question about this lesson", "Đặt câu hỏi cho bài học này")}</h3>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={tx("Enter your question...", "Nhập câu hỏi của bạn...")}
            rows={3}
            className="mb-2 w-full resize-none rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex justify-end">
            <button
              disabled={!question.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:opacity-40"
              onClick={handleSubmit}
            >
              {tx("Send question", "Gửi câu hỏi")}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-gray-200">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {item.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{item.user}</span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{item.question}</p>
                  </div>
                  <button onClick={() => handleVote(item.id)} className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-blue-600">
                    ▲ {item.votes}
                  </button>
                </div>
              </div>
              {item.answer ? (
                <div className="border-t border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      GV
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-900">{tx("Instructor", "Giảng viên")}</span>
                        <span className="rounded bg-blue-200 px-1.5 py-0.5 text-xs text-blue-800">{tx("Instructor", "Giảng viên")}</span>
                      </div>
                      <p className="text-sm text-blue-800">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
