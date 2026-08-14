import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, School, BookOpen, Calendar, UserCheck } from 'lucide-react';
import { Classroom } from '../types';
import { COMPREHENSIVE_SUBJECTS } from '../constants';

interface ClassModalProps {
  isOpen: boolean;
  initialData?: Classroom | null;
  onClose: () => void;
  onSave: (data: { name: string; subject: string; schoolYear: string; teacher: string }) => void;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [teacher, setTeacher] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSubject(initialData.subject || '');
      setSchoolYear(initialData.schoolYear || '');
      setTeacher(initialData.teacher || '');
    } else {
      setName('');
      setSubject('Toán');
      setSchoolYear('2026–2027');
      setTeacher('Nguyễn Văn A');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên lớp học');
      return;
    }
    if (!subject.trim()) {
      setError('Vui lòng nhập môn học');
      return;
    }
    if (!schoolYear.trim()) {
      setError('Vui lòng nhập năm học');
      return;
    }
    if (!teacher.trim()) {
      setError('Vui lòng nhập tên giáo viên phụ trách');
      return;
    }

    onSave({
      name: name.trim(),
      subject: subject.trim(),
      schoolYear: schoolYear.trim(),
      teacher: teacher.trim(),
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
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <School className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">
              {initialData ? 'Sửa thông tin lớp học' : 'Tạo lớp học mới'}
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
              Tên lớp học <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <School className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Lớp 7A1, Lớp 10A2..."
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Môn học <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <BookOpen className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm"
              >
                <option value="">-- Chọn môn học --</option>
                {COMPREHENSIVE_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Năm học <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                placeholder="Ví dụ: 2026–2027"
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Giáo viên phụ trách <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Nhập tên giáo viên chủ nhiệm / bộ môn"
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400"
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
              <School className="w-4 h-4" />
              <span>{initialData ? 'Lưu lớp học' : 'Tạo lớp mới'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
