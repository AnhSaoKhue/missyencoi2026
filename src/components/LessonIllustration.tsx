import React from 'react';
import {
  BookOpen,
  Globe,
  Compass,
  Zap,
  Sparkles,
  PieChart,
  Target,
  Layers,
  CheckCircle2,
  Cpu,
  Star,
  Activity,
} from 'lucide-react';

interface LessonIllustrationProps {
  subject: string;
  title: string;
  illustrationImage?: string;
  illustrationTitle?: string;
}

export const LessonIllustration: React.FC<LessonIllustrationProps> = ({
  subject,
  title,
  illustrationImage,
  illustrationTitle,
}) => {
  const isEnglish = subject.toLowerCase().includes('tiếng anh') || subject.toLowerCase().includes('english');
  const isMath = subject.toLowerCase().includes('toán') || subject.toLowerCase().includes('math');
  const isScience = subject.toLowerCase().includes('lý') || subject.toLowerCase().includes('hóa') || subject.toLowerCase().includes('sinh');

  // If a direct image URL is provided and valid, render high-res image container
  if (illustrationImage && (illustrationImage.startsWith('http') || illustrationImage.startsWith('data:'))) {
    return (
      <div className="bg-slate-900 rounded-2xl p-4 border-2 border-amber-400 shadow-xl space-y-3 my-4">
        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{illustrationTitle || 'Hình minh họa trọng tâm bài học (Sắc nét - Nổi bật)'}</span>
          </span>
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
            Sắc nét HD
          </span>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center min-h-[220px]">
          <img
            src={illustrationImage}
            alt={illustrationTitle || title}
            className="max-h-[380px] w-auto object-contain rounded-lg shadow-md"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  // Otherwise, render a custom dynamic vector diagram & visual graphic tailored to the subject
  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-5 border-2 border-cyan-400/80 shadow-2xl space-y-4 my-4 text-white">
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-white shadow-md">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-cyan-200 uppercase tracking-wide">
              {illustrationTitle || `Sơ đồ Visual & Hình Minh Họa Trọng Tâm — Môn ${subject}`}
            </h4>
            <p className="text-[11px] text-slate-300">Đúng nội dung kiến thức cốt lõi • Màu sắc sắc nét • Dễ ghi nhớ</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 rounded-full shadow-sm">
          Sơ đồ Minh họa 5512
        </span>
      </div>

      {isMath ? (
        /* Math Geometry & Coordinate Vector Diagram */
        <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Biểu đồ Tỷ lệ thuận & Đồ thị đường thẳng y = kx (k ≠ 0)</span>
            </span>
            <span className="text-amber-300 font-mono text-[11px]">y = 2x | Gốc O(0;0)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Vector Graph Illustration Box */}
            <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
              <svg viewBox="0 0 320 200" className="w-full h-44 drop-shadow-lg">
                {/* Grid Lines */}
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="lineGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <rect width="320" height="200" fill="url(#grid)" />

                {/* Axes */}
                <line x1="40" y1="170" x2="300" y2="170" stroke="#94a3b8" strokeWidth="2.5" markerEnd="url(#arrow)" />
                <line x1="60" y1="190" x2="60" y2="20" stroke="#94a3b8" strokeWidth="2.5" />
                <text x="295" y="190" fill="#38bdf8" fontSize="12" fontWeight="bold">X (Đại lượng 1)</text>
                <text x="20" y="30" fill="#38bdf8" fontSize="12" fontWeight="bold">Y (Đại lượng 2)</text>

                {/* Function line y = 2x */}
                <line x1="60" y1="170" x2="260" y2="30" stroke="url(#lineGrad)" strokeWidth="4" strokeLinecap="round" />

                {/* Points */}
                <circle cx="60" cy="170" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x="45" y="185" fill="#f59e0b" fontSize="11" fontWeight="extrabold">O(0,0)</text>

                <circle cx="160" cy="100" r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />
                <line x1="160" y1="170" x2="160" y2="100" stroke="#06b6d4" strokeDasharray="3,3" strokeWidth="1.5" />
                <line x1="60" y1="100" x2="160" y2="100" stroke="#06b6d4" strokeDasharray="3,3" strokeWidth="1.5" />
                <text x="165" y="95" fill="#38bdf8" fontSize="11" fontWeight="bold">A(x₁, y₁)</text>

                <circle cx="230" cy="51" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <line x1="230" y1="170" x2="230" y2="51" stroke="#10b981" strokeDasharray="3,3" strokeWidth="1.5" />
                <line x1="60" y1="51" x2="230" y2="51" stroke="#10b981" strokeDasharray="3,3" strokeWidth="1.5" />
                <text x="235" y="45" fill="#10b981" fontSize="11" fontWeight="bold">B(x₂, y₂)</text>
              </svg>
              <div className="text-[11px] font-bold text-slate-300 text-center mt-2">
                Đồ thị đường thẳng đi qua gốc tọa độ O • Tỷ số <span className="text-amber-400">y/x = k</span> không đổi
              </div>
            </div>

            {/* Key Properties Card */}
            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-amber-400 font-extrabold text-[11px] uppercase block">Công thức cốt lõi:</span>
                <p className="text-white font-mono font-bold text-sm bg-slate-900 px-2 py-1 rounded text-center border border-amber-500/40">
                  y = k · x (k ≠ 0)
                </p>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-cyan-300 font-extrabold text-[11px] uppercase block">Tính chất tỷ số:</span>
                <p className="text-slate-200 text-[11px] leading-relaxed">
                  y₁/x₁ = y₂/x₂ = y₃/x₃ = <strong>k</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : isEnglish ? (
        /* English Bilingual Flashcard Mind Map */
        <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Sơ đồ Mind Map Từ Vựng & Mẫu Câu Song Ngữ (Global Success)</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">Audio AI Supported</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-gradient-to-b from-blue-900/80 to-slate-950 p-3 rounded-xl border border-blue-500/40 space-y-1.5 shadow">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-300">Target Vocab</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-white font-extrabold text-sm">Volunteer</p>
              <p className="text-slate-300 text-[11px] font-mono">/ˌvɑːlənˈtɪr/</p>
              <span className="inline-block bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                Tình nguyện viên
              </span>
            </div>

            <div className="bg-gradient-to-b from-emerald-900/80 to-slate-950 p-3 rounded-xl border border-emerald-500/40 space-y-1.5 shadow">
              <div className="flex items-center justify-between">
                <span className="font-black text-emerald-300">Action Verb</span>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-white font-extrabold text-sm">Donate</p>
              <p className="text-slate-300 text-[11px] font-mono">/ˈdoʊneɪt/</p>
              <span className="inline-block bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                Quyên góp, ủng hộ
              </span>
            </div>

            <div className="bg-gradient-to-b from-purple-900/80 to-slate-950 p-3 rounded-xl border border-purple-500/40 space-y-1.5 shadow">
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-300">Phrase</span>
                <Layers className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="text-white font-extrabold text-sm">Community</p>
              <p className="text-slate-300 text-[11px] font-mono">/kəˈmjuːnəti/</p>
              <span className="inline-block bg-purple-950 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">
                Cộng đồng
              </span>
            </div>

            <div className="bg-gradient-to-b from-rose-900/80 to-slate-950 p-3 rounded-xl border border-rose-500/40 space-y-1.5 shadow">
              <div className="flex items-center justify-between">
                <span className="font-black text-rose-300">Sentence Pattern</span>
                <Zap className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <p className="text-white font-extrabold text-xs leading-snug">"We donate warm clothes..."</p>
              <span className="inline-block bg-rose-950 text-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
                Mẫu câu giao tiếp
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* General Subject Concept Chart */
        <div className="bg-slate-900/90 p-4 rounded-xl border border-cyan-500/40 space-y-3">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-bold">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Sơ đồ Tư duy & Tiến trình Kiến thức Cốt lõi — {title}</span>
            </span>
            <span className="text-amber-300 font-mono text-[11px]">Chuẩn CV 5512</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-500/30 space-y-1">
              <span className="text-cyan-400 font-extrabold text-[11px] uppercase block">1. Nhận thức kiến thức</span>
              <p className="text-slate-200 text-xs">Khám phá khái niệm, nguyên lý & quy luật thực tiễn.</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 space-y-1">
              <span className="text-emerald-400 font-extrabold text-[11px] uppercase block">2. Thực hành & Ứng dụng</span>
              <p className="text-slate-200 text-xs">Vận dụng công cụ số, làm bài tập & thảo luận nhóm.</p>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 space-y-1">
              <span className="text-amber-400 font-extrabold text-[11px] uppercase block">3. Đánh giá Năng lực số</span>
              <p className="text-slate-200 text-xs">Tổng hợp bài thu âm, phiếu bài tập và thuyết trình.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
