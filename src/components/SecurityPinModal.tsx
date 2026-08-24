import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, KeyRound, X, AlertTriangle } from 'lucide-react';

interface SecurityPinModalProps {
  isOpen: boolean;
  targetTitle: string;
  requiredPin: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  targetTitle,
  requiredPin,
  onSuccess,
  onCancel,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim().toUpperCase() === requiredPin.toUpperCase()) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 text-white relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Yêu Cầu Xác Thực Bảo Mật</h3>
            <p className="text-xs text-slate-400">{targetTitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>Nhập Mã PIN Quản Trị Hệ Thống:</span>
            </label>
            <input
              ref={inputRef}
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Nhập mã PIN..."
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-600 placeholder:text-sm placeholder:tracking-normal"
              autoFocus
            />
            {error && (
              <p className="text-xs text-rose-400 flex items-center gap-1 font-medium animate-shake">
                <AlertTriangle className="w-3.5 h-3.5" />
                Mã PIN không chính xác! Vui lòng kiểm tra lại.
              </p>
            )}
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Gợi ý mã PIN mặc định:</span>
            </div>
            <p className="pl-5 text-slate-400">
              - Quản trị viên (Admin Security): <code className="text-amber-300 font-mono font-bold">ASK2002</code>
            </p>
            <p className="pl-5 text-slate-400">
              - Cài đặt & Bản quyền (Settings): <code className="text-amber-300 font-mono font-bold">ASK2005</code>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all"
            >
              Mở Khóa Phân Hệ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
