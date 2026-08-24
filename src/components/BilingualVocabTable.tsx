import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Check, Copy, Play, Square, Globe } from 'lucide-react';
import { BilingualVocab } from '../types';
import { createFemaleUtterance, stopAllSpeech } from '../utils/audioAlert';

interface BilingualVocabTableProps {
  terms?: BilingualVocab[];
  rawTerms?: string;
  title?: string;
  subtitle?: string;
  allowEdit?: boolean;
}

// Utility function to robustly parse raw lines into 3-column vocabulary objects
export function parseRawVocab(rawText?: string): BilingualVocab[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => {
    // Check if delimited by pipe |
    if (line.includes('|')) {
      const parts = line.split('|').map((p) => p.trim());
      return {
        word: parts[0] || '',
        ipa: parts[1] || '',
        meaning: parts[2] || parts[1] || '',
      };
    }

    // Check if delimited by dash or em-dash or colon
    const dashMatch = line.split(/\s*[-—–:]\s*/);
    if (dashMatch.length >= 3) {
      return {
        word: dashMatch[0].trim(),
        ipa: dashMatch[1].trim(),
        meaning: dashMatch.slice(2).join(' - ').trim(),
      };
    } else if (dashMatch.length === 2) {
      // Check if second part has IPA slashes /.../
      const secondPart = dashMatch[1].trim();
      const ipaRegex = /\/(.*?)\//;
      const ipaMatch = secondPart.match(ipaRegex);
      if (ipaMatch) {
        return {
          word: dashMatch[0].trim(),
          ipa: ipaMatch[0],
          meaning: secondPart.replace(ipaRegex, '').trim(),
        };
      }
      return {
        word: dashMatch[0].trim(),
        ipa: '',
        meaning: secondPart,
      };
    }

    return {
      word: line,
      ipa: '',
      meaning: '',
    };
  }).filter((t) => t.word.length > 0);
}

export const BilingualVocabTable: React.FC<BilingualVocabTableProps> = ({
  terms,
  rawTerms,
  title = 'Bảng Từ Vựng & Thuật Ngữ Chuyên Ngành Chuẩn 3 Cột (Anh - IPA - Việt)',
  subtitle,
}) => {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [copiedWord, setCopiedWord] = useState<string | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playAllIndexRef = useRef<number>(-1);

  // Compute terms list from direct prop or parsed rawTerms
  const vocabList: BilingualVocab[] = React.useMemo(() => {
    if (terms && terms.length > 0) return terms;
    if (rawTerms && rawTerms.trim()) return parseRawVocab(rawTerms);
    return [];
  }, [terms, rawTerms]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  const handleSpeak = (text: string, idKey: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (activeWord === idKey) {
      stopAllSpeech();
      setActiveWord(null);
      setIsPlayingAll(false);
      return;
    }

    stopAllSpeech();
    const cleanWord = text.replace(/[^a-zA-Z0-9\s'-]/g, '').trim();
    const utterance = createFemaleUtterance(cleanWord || text, 'en-US');
    utterance.rate = 0.9; // clear educational cadence

    utterance.onstart = () => setActiveWord(idKey);
    utterance.onend = () => {
      setActiveWord(null);
    };
    utterance.onerror = () => {
      setActiveWord(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play entire vocabulary list in sequence
  const handlePlayAll = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || vocabList.length === 0) {
      return;
    }

    if (isPlayingAll) {
      stopAllSpeech();
      setIsPlayingAll(false);
      setActiveWord(null);
      return;
    }

    stopAllSpeech();
    setIsPlayingAll(true);
    let idx = 0;

    const playNext = () => {
      if (idx >= vocabList.length) {
        setIsPlayingAll(false);
        setActiveWord(null);
        return;
      }

      const item = vocabList[idx];
      const wordId = `term-${idx}`;
      playAllIndexRef.current = idx;
      setActiveWord(wordId);

      const cleanWord = item.word.replace(/[^a-zA-Z0-9\s'-]/g, '').trim();
      const utterance = createFemaleUtterance(cleanWord || item.word, 'en-US');
      utterance.rate = 0.88;

      utterance.onend = () => {
        idx++;
        setTimeout(playNext, 600); // 600ms gap between words
      };
      utterance.onerror = () => {
        idx++;
        setTimeout(playNext, 600);
      };

      window.speechSynthesis.speak(utterance);
    };

    playNext();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWord(text);
    setTimeout(() => setCopiedWord(null), 1500);
  };

  if (vocabList.length === 0) {
    return (
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-center text-xs text-amber-900 italic space-y-1">
        <p className="font-semibold">Chưa có dữ liệu từ vựng song ngữ.</p>
        <p className="text-[11px] text-amber-700">
          Nhập từ vựng theo định dạng: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-mono font-bold">Từ tiếng Anh | Phiên âm IPA | Dịch nghĩa tiếng Việt</code> hoặc sử dụng nút <strong>"AI Tự Động Soạn 5512"</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-amber-300 shadow-sm overflow-hidden space-y-0 print:border-slate-400">
      {/* Table Header with Audio Play-All Button */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 px-4 py-2.5 text-white flex items-center justify-between flex-wrap gap-2 print:bg-slate-800 print:text-white">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-200 print:hidden" />
          <div>
            <h5 className="font-extrabold text-xs uppercase tracking-wider">{title}</h5>
            {subtitle && <p className="text-[11px] text-amber-100 opacity-90">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePlayAll}
            className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              isPlayingAll
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-white text-orange-950 hover:bg-amber-100'
            }`}
            title="Phát âm toàn bộ danh sách từ vựng lần lượt"
          >
            {isPlayingAll ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Dừng đọc ({vocabList.length})</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Loa phát âm toàn bộ ({vocabList.length} từ)</span>
              </>
            )}
          </button>
          <span className="text-[10px] font-bold bg-black/20 px-2 py-0.5 rounded-full uppercase tracking-tight text-white border border-white/20">
            3 Cột chuẩn
          </span>
        </div>
      </div>

      {/* 3-Column Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-amber-100/70 border-b border-amber-200 text-amber-950 font-black uppercase text-[11px] tracking-wide print:bg-slate-100 print:border-slate-300">
              <th className="py-2.5 px-3.5 border-r border-amber-200 w-[35%] print:border-slate-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-700 print:hidden" />
                  <span>1. Từ / Thuật ngữ Tiếng Anh</span>
                </span>
              </th>
              <th className="py-2.5 px-3.5 border-r border-amber-200 w-[25%] font-mono print:border-slate-300">
                2. Phiên âm IPA
              </th>
              <th className="py-2.5 px-3.5 w-[40%]">
                3. Dịch nghĩa & Giải thích Tiếng Việt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100 print:divide-slate-200">
            {vocabList.map((item, idx) => {
              const isPlaying = activeWord === `term-${idx}`;
              return (
                <tr
                  key={idx}
                  className={`hover:bg-amber-50/70 transition-colors ${
                    isPlaying
                      ? 'bg-amber-100/90 font-bold border-l-4 border-l-amber-600'
                      : idx % 2 === 1
                      ? 'bg-amber-50/25'
                      : 'bg-white'
                  }`}
                >
                  {/* Column 1: Word + Individual Speaker Button */}
                  <td className="py-2.5 px-3.5 border-r border-amber-200/60 align-middle print:border-slate-300">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {item.word}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0 print:hidden">
                        <button
                          type="button"
                          onClick={() => handleSpeak(item.word, `term-${idx}`)}
                          className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            isPlaying
                              ? 'bg-rose-500 text-white animate-pulse shadow-xs ring-2 ring-rose-300'
                              : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                          }`}
                          title={isPlaying ? 'Dừng đọc' : 'Bấm để loa phát âm từ này (giọng bản ngữ)'}
                        >
                          {isPlaying ? (
                            <VolumeX className="w-3.5 h-3.5" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.word)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Sao chép từ"
                        >
                          {copiedWord === item.word ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Column 2: IPA */}
                  <td className="py-2.5 px-3.5 border-r border-amber-200/60 font-mono text-[11px] sm:text-xs text-slate-700 align-middle print:border-slate-300">
                    {item.ipa ? (
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-indigo-900 font-semibold border border-slate-200">
                        {item.ipa.startsWith('/') ? item.ipa : `/${item.ipa}/`}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">--</span>
                    )}
                  </td>

                  {/* Column 3: Vietnamese Meaning */}
                  <td className="py-2.5 px-3.5 text-slate-800 font-medium text-xs align-middle">
                    {item.meaning || <span className="text-slate-400 italic">Chưa có bản dịch</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
