import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, User, FileText, Hash, UserPlus } from 'lucide-react';
import { Student } from '../types';

interface StudentModalProps {
  isOpen: boolean;
  initialData?: Student | null;
  defaultCodePrefix?: string;
  onClose: () => void;
  onSave: (data: { name: string; code: string; notes: string }) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  initialData,
  defaultCodePrefix = 'HS',
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setNotes(initialData.notes || '');
    } else {
      setName('');
      // Suggest code
      const randomNum = Math.floor(100 + Math.random() * 900);
      setCode(`${defaultCodePrefix}${randomNum}`);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen, defaultCodePrefix]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên học sinh');
      return;
    }

    const finalCode = code.trim() || `${defaultCodePrefix}${Math.floor(1000 + Math.random() * 9000)}`;

    onSave({
      name: name.trim(),
      code: finalCode,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">
              {initialData ? 'Sửa thông tin học sinh' : 'Thêm học sinh mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Họ và tên học sinh <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mã học sinh
            </label>
            <div className="relative">
              <Hash className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Tự động tạo nếu để trống"
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Ghi chú
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Lớp trưởng, ngồi bàn 1, học tốt môn Toán..."
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm resize-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider"
            >
              <UserPlus className="w-4 h-4" />
              <span>{initialData ? 'Lưu học sinh' : 'Lưu học sinh'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
