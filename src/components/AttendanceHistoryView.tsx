import React, { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  RotateCcw,
  Users,
  AlertCircle,
  Save,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { Classroom, AttendanceSession, AttendanceStatus, StudentAttendance, TabType } from '../types';
import { ExportAttendanceModal } from './ExportAttendanceModal';

interface AttendanceHistoryViewProps {
  classrooms: Classroom[];
  attendanceSessions: AttendanceSession[];
  saveAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'savedAt'>) => AttendanceSession;
  deleteAttendanceSession: (sessionId: string) => void;
  onNavigateTab?: (tab: TabType, options?: { classId?: string; date?: string }) => void;
}

export const AttendanceHistoryView: React.FC<AttendanceHistoryViewProps> = ({
  classrooms,
  attendanceSessions,
  saveAttendanceSession,
  deleteAttendanceSession,
  onNavigateTab,
}) => {
  // Filter States
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');

  // Modal States
  const [viewSession, setViewSession] = useState<AttendanceSession | null>(null);
  const [editSession, setEditSession] = useState<AttendanceSession | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<AttendanceSession | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Edit session temporary state
  const [editRecords, setEditRecords] = useState<StudentAttendance[]>([]);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper: Format date YYYY-MM-DD to DD/MM/YYYY
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Helper: Format saved timestamp ISO to HH:mm DD/MM/YYYY
  const formatSavedAt = (isoStr: string) => {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes} ngày ${day}/${month}/${year}`;
    } catch {
      return isoStr;
    }
  };

  // Compute detailed metrics for a single session
  const getSessionStats = (session: AttendanceSession) => {
    const total = session.records.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    session.records.forEach((r) => {
      if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
      else present++;
    });

    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

    return { total, present, absent, late, excused, rate };
  };

  // Filtered Sessions List
  const filteredSessions = useMemo(() => {
    return attendanceSessions.filter((session) => {
      // Filter by Class
      if (selectedClassFilter !== 'ALL' && session.classId !== selectedClassFilter) {
        return false;
      }

      // Filter by Date Range (startDateFilter & endDateFilter)
      if (startDateFilter && session.date < startDateFilter) {
        return false;
      }
      if (endDateFilter && session.date > endDateFilter) {
        return false;
      }

      // Filter by Student Name or Code or Class Name
      if (studentSearchTerm.trim() !== '') {
        const query = studentSearchTerm.trim().toLowerCase();
        const matchesClassName = session.className.toLowerCase().includes(query);
        const matchesStudent = session.records.some(
          (r) =>
            r.studentName.toLowerCase().includes(query) ||
            r.studentCode.toLowerCase().includes(query)
        );
        if (!matchesClassName && !matchesStudent) {
          return false;
        }
      }

      return true;
    });
  }, [attendanceSessions, selectedClassFilter, startDateFilter, endDateFilter, studentSearchTerm]);

  // Overall Statistics across filtered sessions
  const overallStats = useMemo(() => {
    const sessionCount = filteredSessions.length;
    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;

    filteredSessions.forEach((s) => {
      const stats = getSessionStats(s);
      totalStudents += stats.total;
      totalPresent += stats.present;
      totalAbsent += stats.absent;
      totalLate += stats.late;
      totalExcused += stats.excused;
    });

    const avgAttendanceRate =
      totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : '0.0';

    return {
      sessionCount,
      totalStudents,
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
      avgAttendanceRate,
    };
  }, [filteredSessions]);

  // Check if active filters exist
  const hasActiveFilters =
    selectedClassFilter !== 'ALL' ||
    startDateFilter !== '' ||
    endDateFilter !== '' ||
    studentSearchTerm.trim() !== '';

  const clearFilters = () => {
    setSelectedClassFilter('ALL');
    setStartDateFilter('');
    setEndDateFilter('');
    setStudentSearchTerm('');
  };

  // Open Edit Modal
  const handleOpenEdit = (session: AttendanceSession) => {
    setEditSession(session);
    setEditRecords(JSON.parse(JSON.stringify(session.records)));
  };

  // Change status in edit records
  const handleEditStatusChange = (studentId: string, status: AttendanceStatus) => {
    setEditRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  // Change note in edit records
  const handleEditNoteChange = (studentId: string, note: string) => {
    setEditRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, note } : r))
    );
  };

  // Mark all present in edit mode
  const handleEditMarkAllPresent = () => {
    setEditRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })));
  };

  // Save Edit Handler
  const handleSaveEdit = () => {
    if (!editSession) return;

    saveAttendanceSession({
      classId: editSession.classId,
      className: editSession.className,
      date: editSession.date,
      records: editRecords,
    });

    showToast(`Đã cập nhật điểm danh lớp ${editSession.className} ngày ${formatDateDisplay(editSession.date)}!`, 'success');
    setEditSession(null);
    setEditRecords([]);
    
    // If detail modal is currently showing this session, update it as well
    if (viewSession && viewSession.id === editSession.id) {
      setViewSession({
        ...viewSession,
        records: editRecords,
        savedAt: new Date().toISOString(),
      });
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteAttendanceSession(sessionToDelete.id);
      showToast(`Đã xóa buổi điểm danh lớp ${sessionToDelete.className} ngày ${formatDateDisplay(sessionToDelete.date)}!`, 'info');
      setSessionToDelete(null);
      if (viewSession && viewSession.id === sessionToDelete.id) {
        setViewSession(null);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-3 animate-bounce border ${
            toastMessage.type === 'success'
              ? 'bg-[#001f3f] text-white border-orange-500/50'
              : toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-500'
              : 'bg-slate-800 text-white border-slate-600'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-orange-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#001f3f] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-800 border-l-4 border-l-orange-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <History className="w-3.5 h-3.5" />
              <span>Nhật Ký & Thống Kê Điểm Danh</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
              LỊCH SỬ <span className="text-orange-400">ĐIỂM DANH</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Tổng hợp dữ liệu chuyên cần, xem lại chi tiết từng buổi học, chỉnh sửa khi nhập nhầm và theo dõi tỷ lệ học sinh tham gia học tập.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <FileSpreadsheet className="w-4.5 h-4.5" />
              <span>Xuất báo cáo điểm danh</span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('attendance')}
                className="px-5 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Calendar className="w-4 h-4" />
                <span>Thực hiện điểm danh mới</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Sessions */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-[#001f3f]">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Buổi điểm danh</div>
          <div className="text-2xl font-extrabold text-slate-900">{overallStats.sessionCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đã lưu trong lịch sử</div>
        </div>

        {/* Avg Rate */}
        <div className="bg-gradient-to-br from-[#001f3f] to-slate-900 text-white rounded-2xl p-4 shadow-md border-l-4 border-l-orange-500">
          <div className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">Tỷ lệ chuyên cần</div>
          <div className="text-2xl font-extrabold text-white">{overallStats.avgAttendanceRate}%</div>
          <div className="text-[10px] text-slate-300 mt-1">Trung bình các buổi</div>
        </div>

        {/* Total Present */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-emerald-500">
          <div className="text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">Có mặt</div>
          <div className="text-2xl font-extrabold text-emerald-600">{overallStats.totalPresent}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lượt tham gia học</div>
        </div>

        {/* Total Absent */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-rose-500">
          <div className="text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">Vắng mặt</div>
          <div className="text-2xl font-extrabold text-rose-600">{overallStats.totalAbsent}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lượt nghỉ học</div>
        </div>

        {/* Total Late */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-amber-500">
          <div className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">Đi muộn</div>
          <div className="text-2xl font-extrabold text-amber-600">{overallStats.totalLate}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lượt đến muộn</div>
        </div>

        {/* Total Excused */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 border-l-4 border-l-sky-500">
          <div className="text-sky-700 text-xs font-bold uppercase tracking-wider mb-1">Có phép</div>
          <div className="text-2xl font-extrabold text-sky-600">{overallStats.totalExcused}</div>
          <div className="text-[11px] text-slate-500 mt-1">Lượt có đơn xin</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 border-l-4 border-l-[#001f3f]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-orange-500" />
            <span>Bộ lọc lịch sử điểm danh</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Xuất dữ liệu điểm danh ra file CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất báo cáo CSV</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter by Class */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">1. Lớp học</label>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-medium"
            >
              <option value="ALL">Tất cả lớp học ({classrooms.length})</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Start Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">2. Từ ngày</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Filter by End Date */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">3. Đến ngày</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
            />
          </div>

          {/* Search by Student Name / Code */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase">4. Tìm học sinh</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tên học sinh hoặc mã HS..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all font-medium"
              />
              {studentSearchTerm && (
                <button
                  onClick={() => setStudentSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden border-l-4 border-l-[#001f3f]">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
              Bảng Tổng Hop Các Buổi Điểm Danh
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-semibold">
            Hiển thị <strong>{filteredSessions.length}</strong> / {attendanceSessions.length} buổi
          </span>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <History className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">Không tìm thấy dữ liệu điểm danh</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Thử điều chỉnh khoảng ngày hoặc bỏ bớt các điều kiện lọc đang chọn.'
                : 'Thầy/cô chưa thực hiện buổi điểm danh nào. Hãy chuyển sang màn hình "Điểm danh" để bắt đầu.'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            ) : onNavigateTab ? (
              <button
                onClick={() => onNavigateTab('attendance')}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Điểm danh ngay</span>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 font-extrabold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Ngày học</th>
                  <th className="py-3.5 px-4">Tên lớp</th>
                  <th className="py-3.5 px-4 text-center">Tổng học sinh</th>
                  <th className="py-3.5 px-4 text-center text-emerald-700">Có mặt</th>
                  <th className="py-3.5 px-4 text-center text-rose-700">Vắng</th>
                  <th className="py-3.5 px-4 text-center text-amber-700">Đi muộn</th>
                  <th className="py-3.5 px-4 text-center text-sky-700">Có phép</th>
                  <th className="py-3.5 px-4 text-center">Tỷ lệ chuyên cần</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredSessions.map((session) => {
                  const stats = getSessionStats(session);

                  return (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      {/* Ngày học */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>{formatDateDisplay(session.date)}</span>
                        </div>
                      </td>

                      {/* Tên lớp */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 whitespace-nowrap font-bold text-[#001f3f]"
                      >
                        <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-lg">
                          {session.className}
                        </span>
                      </td>

                      {/* Tổng số học sinh */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 text-center font-extrabold"
                      >
                        {stats.total}
                      </td>

                      {/* Có mặt */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 text-center font-bold text-emerald-600 bg-emerald-50/20"
                      >
                        {stats.present}
                      </td>

                      {/* Vắng */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 text-center font-bold text-rose-600 bg-rose-50/20"
                      >
                        {stats.absent}
                      </td>

                      {/* Đi muộn */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 text-center font-bold text-amber-600 bg-amber-50/20"
                      >
                        {stats.late}
                      </td>

                      {/* Có phép */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 text-center font-bold text-sky-600 bg-sky-50/20"
                      >
                        {stats.excused}
                      </td>

                      {/* Tỷ lệ chuyên cần */}
                      <td
                        onClick={() => setViewSession(session)}
                        className="py-3.5 px-4 text-center font-extrabold"
                      >
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs border ${
                            Number(stats.rate) >= 90
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : Number(stats.rate) >= 75
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}
                        >
                          {stats.rate}%
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewSession(session);
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            title="Xem chi tiết điểm danh"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-600" />
                            <span className="hidden sm:inline">Chi tiết</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(session);
                            }}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
                            title="Sửa lại điểm danh"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sửa</span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSessionToDelete(session);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                            title="Xóa buổi điểm danh"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {viewSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 my-auto max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#001f3f] text-white p-5 flex items-center justify-between border-b border-slate-800 border-l-4 border-l-orange-500 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold uppercase">
                    Chi Tiết Điểm Danh — {viewSession.className}
                  </h3>
                  <p className="text-xs text-orange-300">
                    Ngày học: {formatDateDisplay(viewSession.date)} • Lưu lúc: {formatSavedAt(viewSession.savedAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewSession(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Session Metrics Bar */}
              {(() => {
                const stats = getSessionStats(viewSession);
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Sĩ số</div>
                      <div className="text-lg font-extrabold text-slate-900">{stats.total}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-emerald-600 uppercase">Có mặt</div>
                      <div className="text-lg font-extrabold text-emerald-600">{stats.present}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-rose-600 uppercase">Vắng</div>
                      <div className="text-lg font-extrabold text-rose-600">{stats.absent}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-600 uppercase">Đi muộn</div>
                      <div className="text-lg font-extrabold text-amber-600">{stats.late}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-sky-600 uppercase">Có phép</div>
                      <div className="text-lg font-extrabold text-sky-600">{stats.excused}</div>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-[#001f3f] text-white rounded-lg p-1.5 flex flex-col justify-center">
                      <div className="text-[10px] font-bold text-orange-400 uppercase">Chuyên cần</div>
                      <div className="text-base font-extrabold">{stats.rate}%</div>
                    </div>
                  </div>
                );
              })()}

              {/* Student Attendance List */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Danh sách trạng thái học sinh ({viewSession.records.length})
                </h4>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                  <div className="bg-slate-100 p-3 grid grid-cols-12 font-bold text-slate-600 uppercase text-[11px]">
                    <div className="col-span-1">STT</div>
                    <div className="col-span-4">Mã & Họ tên</div>
                    <div className="col-span-3 text-center">Trạng thái</div>
                    <div className="col-span-4">Ghi chú</div>
                  </div>

                  {viewSession.records.map((r, idx) => {
                    const statusTag =
                      r.status === 'present'
                        ? { label: 'Có mặt', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
                        : r.status === 'absent'
                        ? { label: 'Vắng', cls: 'bg-rose-100 text-rose-800 border-rose-200' }
                        : r.status === 'late'
                        ? { label: 'Đi muộn', cls: 'bg-amber-100 text-amber-800 border-amber-200' }
                        : { label: 'Có phép', cls: 'bg-sky-100 text-sky-800 border-sky-200' };

                    return (
                      <div key={r.studentId} className="p-3 grid grid-cols-12 items-center hover:bg-slate-50">
                        <div className="col-span-1 text-slate-400 font-bold">#{idx + 1}</div>
                        <div className="col-span-4 font-bold text-slate-900">
                          {r.studentName}
                          <span className="block text-[10px] font-mono font-normal text-slate-400">{r.studentCode}</span>
                        </div>
                        <div className="col-span-3 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${statusTag.cls}`}>
                            {statusTag.label}
                          </span>
                        </div>
                        <div className="col-span-4 text-slate-600 italic">
                          {r.note ? r.note : <span className="text-slate-400 font-medium italic">Không có ghi chú</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  const current = viewSession;
                  setViewSession(null);
                  setSessionToDelete(current);
                }}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-all cursor-pointer border border-rose-200"
              >
                Xóa buổi này
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const current = viewSession;
                    setViewSession(null);
                    handleOpenEdit(current);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                  <span>Sửa buổi này</span>
                </button>
                <button
                  onClick={() => setViewSession(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 my-auto max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#001f3f] text-white p-5 flex items-center justify-between border-b border-slate-800 border-l-4 border-l-orange-500 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold uppercase">
                    Cập Nhật Lịch Sử Điểm Danh
                  </h3>
                  <p className="text-xs text-orange-300">
                    Lớp: {editSession.className} • Ngày: {formatDateDisplay(editSession.date)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditSession(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">
                  Chỉnh sửa trạng thái điểm danh từng học sinh:
                </span>
                <button
                  type="button"
                  onClick={handleEditMarkAllPresent}
                  className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 transition-all cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đánh dấu tất cả có mặt</span>
                </button>
              </div>

              {/* Student List in Edit Mode */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {editRecords.map((r, idx) => (
                  <div key={r.studentId} className="p-3 sm:p-4 bg-white hover:bg-slate-50/50 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>{r.studentName}</span>
                        <span className="text-xs text-slate-400 font-mono">({r.studentCode})</span>
                      </div>

                      {/* Status Selector */}
                      <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
                        {(
                          [
                            { id: 'present', label: 'Có mặt', icon: CheckCircle2, activeCls: 'bg-emerald-600 text-white' },
                            { id: 'absent', label: 'Vắng', icon: XCircle, activeCls: 'bg-rose-600 text-white' },
                            { id: 'late', label: 'Đi muộn', icon: Clock, activeCls: 'bg-amber-600 text-white' },
                            { id: 'excused', label: 'Có phép', icon: UserCheck, activeCls: 'bg-sky-600 text-white' },
                          ] as const
                        ).map((st) => {
                          const Icon = st.icon;
                          const isActive = r.status === st.id;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => handleEditStatusChange(r.studentId, st.id)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                isActive ? st.activeCls : 'text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{st.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Note Input */}
                    <input
                      type="text"
                      placeholder="Ghi chú thêm..."
                      value={r.note}
                      onChange={(e) => handleEditNoteChange(r.studentId, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:bg-white focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setEditSession(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cập nhật</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa điểm danh</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Bạn có chắc chắn muốn xóa dữ liệu điểm danh của lớp{' '}
              <strong className="text-slate-900 font-extrabold">{sessionToDelete.className}</strong> ngày{' '}
              <strong className="text-slate-900 font-extrabold">{formatDateDisplay(sessionToDelete.date)}</strong> không?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Xóa buổi điểm danh này
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT REPORT MODAL */}
      <ExportAttendanceModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        classrooms={classrooms}
        attendanceSessions={attendanceSessions}
        initialClassId={selectedClassFilter}
        initialStartDate={startDateFilter}
        initialEndDate={endDateFilter}
        onShowToast={showToast}
      />
    </div>
  );
};
