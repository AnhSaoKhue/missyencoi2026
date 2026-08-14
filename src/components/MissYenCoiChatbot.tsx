import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, RefreshCw, Heart, Phone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerCelebration } from '../lib/celebration';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

const QUICK_PROMPTS = [
  "Soạn giúp em câu hỏi kiểm tra miệng",
  "Tư vấn xử lý học sinh vắng học nhiều",
  "Hướng dẫn điểm danh & tính tỷ lệ chuyên cần",
  "Soạn khung giáo án 45 phút môn Toán/Văn",
];

export const MissYenCoiChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Xin chào Thầy/Cô! Em là Miss Yến còi - Trợ lý ảo AI của hệ thống AI Education Platform (Anh Sao Khue - Hotline: 0346513056). Em có thể giúp gì cho Thầy/Cô hôm nay ạ?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.slice(-8).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, history }),
      });

      const data = await res.json();
      const botReply = data.reply || 'Dạ, Miss Yến còi đã ghi nhận thông tin ạ!';

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      
      // Trigger hearts/confetti celebration when assistant provides a complete answer
      triggerCelebration('hearts');
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: 'Dạ Thầy/Cô ơi, kết nối vừa chập chờn một chút. Thầy/Cô cho Miss Yến còi xin lại câu hỏi nhé!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsOpen(true)}
            id="open-miss-yen-coi-chat"
            className="flex items-center gap-3 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white px-5 py-3.5 rounded-full shadow-2xl border-2 border-cyan-300/40 hover:shadow-cyan-500/20 group transition-all"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-cyan-400/20 border border-cyan-300 flex items-center justify-center text-cyan-200 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-white animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-blue-900 rounded-full"></span>
            </div>
            <div className="text-left">
              <div className="text-xs text-cyan-200 font-medium tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" /> Trợ lý ảo AI
              </div>
              <div className="text-sm font-bold text-white tracking-wide">Miss Yến còi</div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            id="miss-yen-coi-chat-window"
            className="w-[360px] sm:w-[420px] h-[580px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-900 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-4 flex items-center justify-between border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow">
                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-cyan-300" />
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-base text-white">
                    <span>Miss Yến còi</span>
                    <ShieldCheck className="w-4 h-4 text-cyan-300" title="Đã xác minh an toàn & chuẩn mực" />
                  </div>
                  <div className="text-xs text-cyan-200 flex items-center gap-2">
                    <span>Anh Sao Khue</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> 0346513056</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                id="close-miss-yen-coi-chat"
                className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Banner info */}
            <div className="bg-blue-50 dark:bg-slate-800/80 px-4 py-2 text-[11px] text-blue-800 dark:text-cyan-200 flex items-center justify-between border-b border-blue-100 dark:border-slate-700">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> Trợ lý thông minh, văn phong thực tế & đạo đức
              </span>
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: Date.now().toString(),
                      sender: 'bot',
                      text: 'Em đã làm mới cuộc trò chuyện. Thầy/Cô cần Miss Yến còi hỗ trợ gì tiếp theo ạ?',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ]);
                }}
                className="text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
                title="Tạo hội thoại mới"
              >
                <RefreshCw className="w-3 h-3" /> Làm mới
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-blue-700 text-cyan-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm font-medium ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none font-medium'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-center text-slate-500 text-xs italic pl-2">
                  <Bot className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Miss Yến còi đang suy nghĩ và chuẩn bị câu trả lời...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Trình gợi ý câu hỏi nhanh:
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-slate-700 text-blue-900 dark:text-cyan-200 text-xs px-2.5 py-1 rounded-full transition-colors shrink-0 shadow-xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi Miss Yến còi bất cứ điều gì..."
                disabled={isLoading}
                className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-950 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-400 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold shadow-xs"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
