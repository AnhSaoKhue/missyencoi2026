import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Classroom, AttendanceSession } from '../types';
import { generateAttendanceCSV, downloadCSVFile } from '../utils/csvExporter';

interface ExportAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classrooms: Classroom[];
  attendanceSessions: AttendanceSession[];
  initialClassId?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const ExportAttendanceModal: React.FC<ExportAttendanceModalProps> = ({
  isOpen,
  onClose,
  classrooms,
  attendanceSessions,
  initialClassId = 'ALL',
  initialStartDate = '',
  initialEndDate = '',
  onShowToast,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [startDate, setStartDate] = useState<string>(initialStartDate);
  const [endDate, setEndDate] = useState<string>(initialEndDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate matching stats in real-time
  const previewStats = useMemo(() => {
    const result = generateAttendanceCSV({
      sessions: attendanceSessions,
      classrooms,
      selectedClassId,
      startDate,
      endDate,
    });
    return result;
  }, [attendanceSessions, classrooms, selectedClassId, startDate, endDate]);

  if (!isOpen) return null;

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = generateAttendanceCSV({
      sessions: attendanceSessions,
      classrooms,
      selectedClassId,
      startDate,
      endDate,
    });

    if (!result.success || !result.csvContent || !result.fileName) {
      const errorMsg = result.message || 'Không có dữ liệu điểm danh phù hợp để xuất.';
      setErrorMessage(errorMsg);
      if (onShowToast) {
        onShowToast(errorMsg, 'error');
      }
      return;
    }

    // Trigger CSV File Download
    downloadCSVFile(result.csvContent, result.fileName);

    if (onShowToast) {
      onShowToast(`Đã xuất báo cáo điểm danh (${result.totalRecords} lượt) thành công!`, 'success');
    }

    onClose();
  };

  const clearForm = () => {
    setSelectedClassId('ALL');
    setStartDate('');
    setEndDate('');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 my-auto overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-[#001f3f] text-white p-5 flex items-center justify-between border-b border-slate-800 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold uppercase tracking-tight">
                Xuất Báo Cáo Điểm Danh CSV
              </h3>
              <p className="text-xs text-orange-300">
                Tải về dữ liệu điểm danh dạng bảng tính Microsoft Excel / Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleExport} className="p-5 sm:p-6 space-y-5">
          {/* Alert Message if error */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* 1. Lớp học */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-orange-500" />
                <span>1. Lớp học</span>
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="ALL">--- Tất cả lớp học ({classrooms.length}) ---</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.subject})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range: Start Date & End Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 2. Ngày bắt đầu */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>2. Từ ngày (Ngày bắt đầu)</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-medium"
                />
              </div>

              {/* 3. Ngày kết thúc */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500" />
                  <span>3. Đến ngày (Ngày kết thúc)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-medium"
                />
              </div>
            </div>
          </div>

          {/* Quick Clear filters button */}
          {(selectedClassId !== 'ALL' || startDate !== '' || endDate !== '') && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearForm}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
              >
                Đặt lại tùy chọn xuất
              </button>
            </div>
          )}

          {/* Data Summary Preview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Xem trước kết quả xuất</span>
            </div>

            {previewStats.success ? (
              <div className="flex items-center justify-between text-xs text-slate-700 bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Tìm thấy <strong>{previewStats.sessionCount}</strong> buổi điểm danh</span>
                </div>
                <span className="font-semibold text-emerald-700">
                  Tổng <strong>{previewStats.totalRecords}</strong> dòng dữ liệu
                </span>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Không có dữ liệu điểm danh phù hợp để xuất.</span>
              </div>
            )}

            <div className="text-[11px] text-slate-500 leading-relaxed pt-1">
              • Cấu trúc file CSV bao gồm 6 cột: <strong>Ngày học, Tên lớp, Mã học sinh, Họ tên học sinh, Trạng thái, Ghi chú</strong>.<br />
              • Mã hóa tiếng Việt <strong>UTF-8 BOM</strong> tương thích hoàn toàn với Excel và Google Sheets.
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!previewStats.success}
              className={`px-6 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
                previewStats.success
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo CSV</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
