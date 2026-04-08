"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  time: string;
}

const botResponses: Record<string, string> = {
  'xin chào': 'Xin chào! Tôi là trợ lý EduCourse. Tôi có thể giúp gì cho bạn hôm nay?',
  'hello': 'Hello! How can I help you today?',
  'giá': 'Các khóa học của chúng tôi có giá từ 99.000đ đến 349.000đ. Thường xuyên có Flash Sale giảm đến 50%!',
  'thanh toán': 'Chúng tôi hỗ trợ thanh toán qua: Thẻ tín dụng/ghi nợ, VNPay và ZaloPay.',
  'hoàn tiền': 'Chúng tôi có chính sách hoàn tiền trong 30 ngày nếu bạn không hài lòng.',
  'chứng chỉ': 'Sau khi hoàn thành khóa học, bạn sẽ nhận được chứng chỉ có giá trị từ EduCourse.',
  'liên hệ': 'Bạn có thể liên hệ: Email: info@educourse.vn | Hotline: +84 123 456 789',
  default: 'Cảm ơn bạn đã liên hệ! Đội ngũ hỗ trợ sẽ phản hồi trong vòng 2 giờ. Bạn cũng có thể email info@educourse.vn.',
};

const getTime = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Xin chào! 👋 Tôi là trợ lý ảo của EduCourse. Tôi có thể giúp gì cho bạn?', sender: 'bot', time: getTime() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const getBotResponse = (text: string): string => {
    const lower = text.toLowerCase();
    for (const key of Object.keys(botResponses)) {
      if (lower.includes(key)) return botResponses[key];
    }
    return botResponses.default;
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user', time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botMsg: Message = { id: Date.now() + 1, text: getBotResponse(userInput), sender: 'bot', time: getTime() };
      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const quickReplies = ['Giá khóa học', 'Thanh toán', 'Hoàn tiền', 'Chứng chỉ'];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className={`mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'w-80 sm:w-96 h-[500px]'}`}
          style={{ width: isMinimized ? 'auto' : undefined }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Hỗ trợ EduCourse</div>
                <div className="flex items-center gap-1 text-xs text-blue-100">
                  <span className="size-2 bg-green-400 rounded-full"></span>
                  Trực tuyến
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)} className="text-white/80 hover:text-white p-1">
                <Minimize2 className="size-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="size-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`size-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs ${msg.sender === 'bot' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      {msg.sender === 'bot' ? <Bot className="size-4" /> : <User className="size-4" />}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.sender === 'bot' ? 'bg-gray-100 text-gray-800 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'}`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'bot' ? 'text-gray-400' : 'text-blue-200'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-2">
                    <div className="size-7 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="size-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="size-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                {quickReplies.map(reply => (
                  <button key={reply} onClick={() => { setInput(reply); setTimeout(() => sendMessage(), 100); }}
                    className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-3 py-1 hover:bg-blue-100 transition-colors">
                    {reply}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input ref={inputRef} type="text" value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button onClick={sendMessage}
                    className="size-9 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0">
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="size-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform relative">
        {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 size-4 bg-red-500 rounded-full flex items-center justify-center text-xs">1</span>
        )}
      </button>
    </div>
  );
}
