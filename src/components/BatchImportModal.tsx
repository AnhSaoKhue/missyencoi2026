import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, ClipboardList, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface BatchImportModalProps {
  isOpen: boolean;
  classNameTitle: string;
  defaultCodePrefix?: string;
  existingCount?: number;
  onClose: () => void;
  onImport: (students: Array<{ name: string; code: string; notes: string }>) => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  classNameTitle,
  defaultCodePrefix = 'HS',
  existingCount = 0,
  onClose,
  onImport,
}) => {
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');

  // Sample placeholder text
  const placeholderText = `Mẫu danh sách có thể dán (mỗi học sinh 1 dòng):

Nguyễn Văn An
Trần Thị Bích
HS001 - Phạm Minh Cường
04. Lê Hoàng Dũng
5/ Vũ Thị Thu Giang (Lớp phó)`;

  // Parse lines into structured student items
  const parsedStudents = useMemo(() => {
    if (!rawText.trim()) return [];

    const lines = rawText.split('\n');
    const result: Array<{ name: string; code: string; notes: string }> = [];

    let autoCodeIndex = existingCount + 1;

    lines.forEach((line) => {
      let clean = line.trim();
      if (!clean) return;

      // Strip leading sequence numbers like "1. ", "01/ ", "1) ", "- "
      clean = clean.replace(/^(?:\d+[\.\)\/\\-]|[\-\*•])\s*/, '').trim();

      if (!clean) return;

      let code = '';
      let name = clean;
      let notes = '';

      // Check for inline notes in parentheses, e.g., "Nguyễn Văn A (Lớp trưởng)"
      const noteMatch = name.match(/^(.*?)\((.*?)\)$/);
      if (noteMatch) {
        name = noteMatch[1].trim();
        notes = noteMatch[2].trim();
      }

      // Check if line contains separator for Code - Name, e.g. "HS101 - Nguyễn Văn A" or "HS101: Nguyễn Văn A"
      const sepMatch = name.match(/^([A-Za-z0-9_]+)\s*[\-:\t]\s*(.*)$/);
      if (sepMatch) {
        code = sepMatch[1].trim();
        name = sepMatch[2].trim();
      }

      if (!code) {
        // Auto generate code
        const codeNum = String(autoCodeIndex).padStart(3, '0');
        code = `${defaultCodePrefix}${codeNum}`;
        autoCodeIndex++;
      }

      if (name) {
        result.push({
          name,
          code,
          notes,
        });
      }
    });

    return result;
  }, [rawText, defaultCodePrefix, existingCount]);

  if (!isOpen) return null;

  const handleImportSubmit = () => {
    if (parsedStudents.length === 0) {
      setError('Chưa có học sinh hợp lệ nào được tìm thấy. Vui lòng dán danh sách tên học sinh.');
      return;
    }
    onImport(parsedStudents);
    setRawText('');
    setError('');
    onClose();
  };

  const handleLoadSample = () => {
    setRawText(`Nguyễn Văn An
Trần Thị Bảo Châm
Lê Hoàng Dũng
Phạm Minh Đức
Vũ Thu Giang
Đặng Ngọc Hương
Bùi Quang Khánh
Đỗ Phương Linh
Hoàng Nhật Minh
Ngo Thi Thanh Nhi`);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500 rounded-lg text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Nhập nhanh nhiều học sinh</h3>
              <p className="text-xs text-slate-300">Lớp: {classNameTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 space-y-1">
            <p className="font-semibold flex items-center gap-1.5 text-amber-900">
              💡 Hướng dẫn dán danh sách:
            </p>
            <p>• Dán danh sách tên học sinh (mỗi học sinh nằm trên 1 dòng riêng biệt).</p>
            <p>• Có thể dán từ Excel, Word hoặc file văn bản.</p>
            <p>• Hệ thống sẽ tự động loại bỏ số thứ tự đầu dòng (1., 2., 3...) và tự đánh mã học sinh.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Dán danh sách vào ô bên dưới:
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Thử danh sách mẫu
              </button>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setError('');
              }}
              placeholder={placeholderText}
              className="w-full p-3.5 text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 text-sm font-mono leading-relaxed"
            />
          </div>

          {/* Preview list */}
          {parsedStudents.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Xem trước danh sách phát hiện ({parsedStudents.length} học sinh):
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {parsedStudents.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3.5 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400 text-[11px] w-6">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800">{item.name}</span>
                      {item.notes && (
                        <span className="text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md text-[11px]">
                          {item.notes}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                      {item.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={parsedStudents.length === 0}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 ${
              parsedStudents.length > 0
                ? 'bg-orange-600 hover:bg-orange-700 focus:ring-2 focus:ring-orange-500/30'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Nhập {parsedStudents.length > 0 ? `${parsedStudents.length} học sinh` : 'danh sách'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
