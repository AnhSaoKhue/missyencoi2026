import React, { useState, useEffect, useMemo } from 'react';
import { Classroom, AttendanceStatus, StudentAttendance, AttendanceSession } from '../types';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  RotateCcw,
  Save,
  ArrowLeft,
  Users,
  AlertCircle,
  History,
  Trash2,
  Check,
  Calendar,
  Search,
  Filter,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { ExportAttendanceModal } from './ExportAttendanceModal';

interface AttendanceViewProps {
  classrooms: Classroom[];
  initialClassId?: string;
  onBack?: () => void;
  getAttendanceSession: (classId: string, date: string) => AttendanceSession | undefined;
  saveAttendanceSession: (session: Omit<AttendanceSession, 'id' | 'savedAt'>) => AttendanceSession;
  deleteAttendanceSession: (sessionId: string) => void;
  attendanceSessions: AttendanceSession[];
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  classrooms,
  initialClassId,
  onBack,
  getAttendanceSession,
  saveAttendanceSession,
  deleteAttendanceSession,
  attendanceSessions,
}) => {
  // Get today's date YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (initialClassId && classrooms.some((c) => c.id === initialClassId)) {
      return initialClassId;
    }
    return classrooms.length > 0 ? classrooms[0].id : '';
  });

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [records, setRecords] = useState<StudentAttendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // UI Toast & Modal state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const selectedClass = useMemo(() => {
    return classrooms.find((c) => c.id === selectedClassId);
  }, [classrooms, selectedClassId]);

  // Toast auto-hide
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load existing records or default to all 'present' when classId or date changes
  useEffect(() => {
    if (!selectedClass) {
      setRecords([]);
      return;
    }

    const existingSession = getAttendanceSession(selectedClassId, selectedDate);

    if (existingSession) {
      // Map saved records, and make sure any newly added student is also included as 'present'
      const recordMap = new Map(existingSession.records.map((r) => [r.studentId, r]));
      
      const updatedRecords: StudentAttendance[] = selectedClass.students.map((student) => {
        const savedRecord = recordMap.get(student.id);
        if (savedRecord) {
          return savedRecord;
        }
        return {
          studentId: student.id,
          studentCode: student.code,
          studentName: student.name,
          status: 'present',
          note: '',
        };
      });

      setRecords(updatedRecords);
    } else {
      // Default: All students marked 'present' with empty notes
      const initialRecords: StudentAttendance[] = selectedClass.students.map((student) => ({
        studentId: student.id,
        studentCode: student.code,
        studentName: student.name,
        status: 'present',
        note: '',
      }));
      setRecords(initialRecords);
    }
  }, [selectedClassId, selectedDate, selectedClass, getAttendanceSession]);

  // Update status for a single student
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status } : r))
    );
  };

  // Update note for a single student
  const handleNoteChange = (studentId: string, note: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, note } : r))
    );
  };

  // Quick suggestion click
  const handleAddQuickNote = (studentId: string, text: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.studentId === studentId) {
          const newNote = r.note ? `${r.note}, ${text}` : text;
          return { ...r, note: newNote };
        }
        return r;
      })
    );
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    setRecords((prev) => prev.map((r) => ({ ...r, status: 'present' })));
    setToastMessage({ text: 'Đã đánh dấu tất cả học sinh có mặt', type: 'info' });
  };

  // Reset to default
  const handleReset = () => {
    if (!selectedClass) return;
    const initialRecords: StudentAttendance[] = selectedClass.students.map((student) => ({
      studentId: student.id,
      studentCode: student.code,
      studentName: student.name,
      status: 'present',
      note: '',
    }));
    setRecords(initialRecords);
    setToastMessage({ text: 'Đã đặt lại danh sách điểm danh ban đầu', type: 'info' });
  };

  // Save Attendance Attempt
  const handleSaveClick = () => {
    if (!selectedClass) return;

    if (records.length === 0) {
      setToastMessage({ text: 'Lớp học này chưa có học sinh nào!', type: 'error' });
      return;
    }

    // Check if session already exists
    const existing = getAttendanceSession(selectedClassId, selectedDate);
    if (existing) {
      // Show confirmation dialog before overwriting
      setShowDuplicateModal(true);
    } else {
      executeSave();
    }
  };

  // Save function execution
  const executeSave = () => {
    if (!selectedClass) return;

    saveAttendanceSession({
      classId: selectedClass.id,
      className: selectedClass.name,
      date: selectedDate,
      records: records,
    });

    setShowDuplicateModal(false);
    setToastMessage({
      text: `Đã lưu điểm danh cho lớp ${selectedClass.name} ngày ${formatDateDisplay(selectedDate)} thành công!`,
      type: 'success',
    });
  };

  // Calculate Statistics dynamically
  const stats = useMemo(() => {
    const total = records.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    records.forEach((r) => {
      if (r.status === 'absent') absent++;
      else if (r.status === 'late') late++;
      else if (r.status === 'excused') excused++;
      else present++; // Default/fallback to present to guarantee sum equals total
    });

    // Công thức: (Số học sinh có mặt / Tổng số học sinh) × 100%, làm tròn 1 chữ số thập phân
    const attendanceRate = total > 0 ? ((present / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate,
    };
  }, [records]);

  // Filtered records for search & status filter
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [records, searchTerm, statusFilter]);

  // Format YYYY-MM-DD to DD/MM/YYYY
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Helper for status colors
  const getStatusBadgeClass = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
      case 'absent':
        return 'bg-rose-500 text-white border-rose-600 shadow-sm';
      case 'late':
        return 'bg-amber-500 text-white border-amber-600 shadow-sm';
      case 'excused':
        return 'bg-sky-500 text-white border-sky-600 shadow-sm';
      default:
        return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl font-medium text-sm flex items-center gap-3 transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-800 text-emerald-100 border border-emerald-600'
              : toastMessage.type === 'error'
              ? 'bg-rose-800 text-rose-100 border border-rose-600'
              : 'bg-[#001f3f] text-white border border-slate-700'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {toastMessage.type === 'info' && <Sparkles className="w-5 h-5 text-orange-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Controls Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 border-l-4 border-l-[#001f3f]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Quay lại"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-10 h-10 rounded-xl bg-[#001f3f] text-orange-400 flex items-center justify-center font-bold">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Sổ Điểm Danh Học Sinh
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Chọn lớp và ngày học để thực hiện điểm danh
                </p>
              </div>
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất báo cáo điểm danh</span>
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="px-3.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer border border-slate-300"
            >
              <History className="w-4 h-4 text-slate-600" />
              <span>Xem lịch sử ({attendanceSessions.length})</span>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-2 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Selection Form Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mt-5">
          {/* Select Class */}
          <div className="lg:col-span-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Chọn Lớp Học
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 p-2.5 font-semibold cursor-pointer"
            >
              {classrooms.length === 0 ? (
                <option value="">Chưa có lớp học nào</option>
              ) : (
                classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.subject} ({c.students.length} học sinh)
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Select Date */}
          <div className="lg:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Chọn Ngày Học
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 p-2.5 font-semibold cursor-pointer pr-10"
              />
              <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Mark All Present Button */}
          <div className="lg:col-span-3 flex items-end">
            <button
              onClick={handleMarkAllPresent}
              disabled={!selectedClass || selectedClass.students.length === 0}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-300 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đánh dấu tất cả có mặt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-slate-700">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Tổng số HS</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Học sinh trong lớp</div>
        </div>

        {/* Present */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold mb-1">
            <span>Có mặt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{stats.present}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats.attendanceRate}% tổng số
          </div>
        </div>

        {/* Absent */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between text-rose-700 text-xs font-semibold mb-1">
            <span>Vắng mặt</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{stats.absent}</div>
          <div className="text-[11px] text-slate-500 mt-1">Không có mặt</div>
        </div>

        {/* Late */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-amber-700 text-xs font-semibold mb-1">
            <span>Đi muộn</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{stats.late}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đến muộn giờ</div>
        </div>

        {/* Excused */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-sky-700 text-xs font-semibold mb-1">
            <span>Có phép</span>
            <UserCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-sky-600">{stats.excused}</div>
          <div className="text-[11px] text-slate-500 mt-1">Xin nghỉ hợp lệ</div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-[#001f3f] to-slate-900 rounded-2xl p-4 shadow-md text-white border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <span>Chuyên cần</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{stats.attendanceRate}%</div>
          <div className="text-[10px] text-slate-300 mt-1 truncate">
            (Có mặt / Tổng) × 100%
          </div>
        </div>
      </div>

      {/* Main Student List Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên hoặc mã học sinh..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Lọc:
            </span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'present', label: 'Có mặt' },
              { id: 'absent', label: 'Vắng' },
              { id: 'late', label: 'Đi muộn' },
              { id: 'excused', label: 'Có phép' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  statusFilter === f.id
                    ? 'bg-[#001f3f] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Student List Container */}
        {!selectedClass || selectedClass.students.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Chưa có học sinh trong lớp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Vui lòng chọn lớp học có chứa danh sách học sinh hoặc chuyển sang tab Lớp học để thêm danh sách học sinh.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Không tìm thấy học sinh phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Desktop Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-slate-100/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <div className="col-span-1">STT</div>
              <div className="col-span-4">Mã & Họ tên học sinh</div>
              <div className="col-span-4">Trạng thái điểm danh</div>
              <div className="col-span-3">Ghi chú</div>
            </div>

            {/* Student Rows */}
            {filteredRecords.map((item, index) => {
              return (
                <div
                  key={item.studentId}
                  className={`p-4 sm:p-5 transition-colors ${
                    item.status === 'absent'
                      ? 'bg-rose-50/30'
                      : item.status === 'late'
                      ? 'bg-amber-50/30'
                      : item.status === 'excused'
                      ? 'bg-sky-50/30'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Index & Student Info */}
                    <div className="md:col-span-5 flex items-start gap-3">
                      <span className="hidden md:inline-flex w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {item.studentName}
                          </span>
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-mono font-bold px-2 py-0.5 rounded">
                            {item.studentCode}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 md:hidden">
                          STT: #{index + 1}
                        </div>
                      </div>
                    </div>

                    {/* Status Toggles (4 Buttons) */}
                    <div className="md:col-span-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {/* Có mặt */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.studentId, 'present')}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            item.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                              : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Có mặt</span>
                        </button>

                        {/* Vắng */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.studentId, 'absent')}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            item.status === 'absent'
                              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30'
                              : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Vắng</span>
                        </button>

                        {/* Đi muộn */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.studentId, 'late')}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            item.status === 'late'
                              ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                              : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Đi muộn</span>
                        </button>

                        {/* Có phép */}
                        <button
                          type="button"
                          onClick={() => handleStatusChange(item.studentId, 'excused')}
                          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            item.status === 'excused'
                              ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-600/30'
                              : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Có phép</span>
                        </button>
                      </div>
                    </div>

                    {/* Note Input & Quick Tags */}
                    <div className="md:col-span-3 space-y-1.5">
                      <input
                        type="text"
                        placeholder="Nhập ghi chú (ví dụ: Đến muộn 10 phút...)"
                        value={item.note}
                        onChange={(e) => handleNoteChange(item.studentId, e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-800 font-medium"
                      />
                      {/* Quick Note Chip Buttons */}
                      <div className="flex flex-wrap items-center gap-1">
                        {[
                          'Muộn 10p',
                          'Có phép',
                          'Gia đình',
                          'Không lý do',
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleAddQuickNote(item.studentId, suggestion)}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                          >
                            +{suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
            <span className="font-bold text-orange-400">
              Đã chọn: {selectedClass?.name || '---'}
            </span>
            <span>•</span>
            <span>Ngày: {formatDateDisplay(selectedDate)}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{stats.present}/{stats.total} có mặt ({stats.attendanceRate}%)</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-slate-700 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={handleSaveClick}
              disabled={!selectedClass || selectedClass.students.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              <Save className="w-4.5 h-4.5" />
              <span>Lưu điểm danh</span>
            </button>
          </div>
        </div>
      </div>

      {/* DUPLICATE CONFIRMATION MODAL */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center">
              Cảnh báo bản điểm danh đã tồn tại
            </h3>

            <p className="text-sm text-slate-600 text-center mt-2 leading-relaxed">
              Buổi điểm danh lớp <strong className="text-slate-900">{selectedClass?.name}</strong> ngày{' '}
              <strong className="text-slate-900">{formatDateDisplay(selectedDate)}</strong> đã tồn tại. Bạn có muốn cập nhật dữ liệu không?
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={executeSave}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
              >
                Cập nhật dữ liệu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY SESSIONS MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold text-slate-900">
                  Lịch Sử Điểm Danh Đã Lưu ({attendanceSessions.length})
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 space-y-3 pr-1">
              {attendanceSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Chưa có lịch sử điểm danh nào được lưu.
                </div>
              ) : (
                attendanceSessions.map((session) => {
                  const presentCount = session.records.filter((r) => r.status === 'present').length;
                  const totalCount = session.records.length;
                  const rate = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : '0.0';

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl border border-slate-200 hover:border-orange-300 bg-slate-50 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{session.className}</span>
                          <span className="text-xs bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded-full">
                            {formatDateDisplay(session.date)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                          <span>
                            Sĩ số: {totalCount} | Có mặt: {presentCount} ({rate}%)
                          </span>
                          <span>Lưu lúc: {new Date(session.savedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedClassId(session.classId);
                            setSelectedDate(session.date);
                            setShowHistoryModal(false);
                            setToastMessage({
                              text: `Đã tải lại buổi điểm danh ngày ${formatDateDisplay(session.date)}`,
                              type: 'info',
                            });
                          }}
                          className="px-3 py-1.5 bg-[#001f3f] text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          Xem/Sửa
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử điểm danh buổi này không?')) {
                              deleteAttendanceSession(session.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa bản lưu này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 text-right">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-300"
              >
                Đóng
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
        initialClassId={selectedClassId}
        initialStartDate={selectedDate}
        initialEndDate={selectedDate}
        onShowToast={(msg, type) => setToastMessage({ text: msg, type })}
      />
    </div>
  );
};
