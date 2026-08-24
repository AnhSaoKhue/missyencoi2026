import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, School, BookOpen, Calendar, UserCheck, Sparkles, Check } from 'lucide-react';
import { Classroom } from '../types';
import { COMPREHENSIVE_SUBJECTS } from '../constants';

const GRADES_LIST = [
  { value: '1', label: 'Khối 1 (Lớp 1)' },
  { value: '2', label: 'Khối 2 (Lớp 2)' },
  { value: '3', label: 'Khối 3 (Lớp 3)' },
  { value: '4', label: 'Khối 4 (Lớp 4)' },
  { value: '5', label: 'Khối 5 (Lớp 5)' },
  { value: '6', label: 'Khối 6 (Lớp 6)' },
  { value: '7', label: 'Khối 7 (Lớp 7)' },
  { value: '8', label: 'Khối 8 (Lớp 8)' },
  { value: '9', label: 'Khối 9 (Lớp 9)' },
  { value: '10', label: 'Khối 10 (Lớp 10)' },
  { value: '11', label: 'Khối 11 (Lớp 11)' },
  { value: '12', label: 'Khối 12 (Lớp 12)' },
];

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
  const [selectedGrade, setSelectedGrade] = useState<string>('7');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [teacher, setTeacher] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSubject(initialData.subject || 'Toán');
      setSchoolYear(initialData.schoolYear || '2026–2027');
      setTeacher(initialData.teacher || 'Giáo viên phụ trách');
      
      // Try to extract grade from name
      const match = initialData.name.match(/\b(1[0-2]|[1-9])\b/);
      if (match) {
        setSelectedGrade(match[1]);
      } else {
        setSelectedGrade('');
      }
    } else {
      setSelectedGrade('7');
      setName('Lớp 7A1');
      setSubject('Toán');
      setSchoolYear('2026–2027');
      setTeacher('Giáo viên phụ trách');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSelectGrade = (gradeVal: string) => {
    setSelectedGrade(gradeVal);
    if (!name || name.startsWith('Lớp ') || name === '') {
      setName(`Lớp ${gradeVal}A1`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Default fallback values if left completely empty (Optional)
    const finalName = name.trim() || (selectedGrade ? `Lớp ${selectedGrade}A1` : 'Lớp học chung');
    const finalSubject = subject.trim() || 'Toán';
    const finalSchoolYear = schoolYear.trim() || '2026–2027';
    const finalTeacher = teacher.trim() || 'Giáo viên phụ trách';

    onSave({
      name: finalName,
      subject: finalSubject,
      schoolYear: finalSchoolYear,
      teacher: finalTeacher,
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
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {initialData ? 'Sửa thông tin lớp học' : 'Tạo lớp học mới'}
              </h3>
              <p className="text-[11px] text-slate-300">Tùy chọn khối lớp từ Lớp 1 đến Lớp 12 hoặc nhập tự do</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Quick Grade 1 - 12 Selector */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Chọn khối lớp (Tùy chọn từ Lớp 1 - 12):</span>
              </label>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                Không bắt buộc
              </span>
            </div>

            {/* Quick Pills for Grades 1 to 12 */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 pt-1">
              {GRADES_LIST.map((g) => {
                const isSelected = selectedGrade === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => handleSelectGrade(g.value)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-xs scale-102 ring-2 ring-orange-400'
                        : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 border border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                    <span>Lớp {g.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Tên lớp học
              </label>
              <span className="text-[11px] text-slate-400 font-medium">(Tùy chọn)</span>
            </div>
            <div className="relative">
              <School className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Lớp 1A, Lớp 7A1, Lớp 10 Chuyên Toán..."
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Môn học
              </label>
              <span className="text-[11px] text-slate-400 font-medium">(Tùy chọn)</span>
            </div>
            <div className="relative">
              <BookOpen className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-slate-900 font-semibold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm"
              >
                <option value="">-- Chọn hoặc để mặc định --</option>
                {COMPREHENSIVE_SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* School Year */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Năm học
              </label>
              <span className="text-[11px] text-slate-400 font-medium">(Tùy chọn)</span>
            </div>
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

          {/* Teacher */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Giáo viên phụ trách
              </label>
              <span className="text-[11px] text-slate-400 font-medium">(Tùy chọn)</span>
            </div>
            <div className="relative">
              <UserCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="Ví dụ: Thầy Nguyễn Văn A..."
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
              <span>{initialData ? 'Lưu thông tin' : 'Tạo lớp ngay'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
