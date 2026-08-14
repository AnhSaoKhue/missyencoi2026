import React, { useState, useMemo } from 'react';
import { Classroom, AttendanceSession, TabType } from '../types';
import {
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Filter,
  Search,
  ArrowLeft,
  PieChart,
} from 'lucide-react';

interface AttendanceStatsViewProps {
  classrooms: Classroom[];
  attendanceSessions: AttendanceSession[];
  onNavigateTab: (tab: TabType) => void;
}

export const AttendanceStatsView: React.FC<AttendanceStatsViewProps> = ({
  classrooms,
  attendanceSessions,
  onNavigateTab,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [absenceFilter, setAbsenceFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Calculate statistics for each student
  const studentStats = useMemo(() => {
    const list: Array<{
      studentId: string;
      studentCode: string;
      studentName: string;
      classId: string;
      className: string;
      totalSessions: number;
      presentCount: number;
      absentCount: number; // vắng không phép
      excusedCount: number; // vắng có phép
      lateCount: number; // đi muộn
      totalAbsences: number; // vắng không phép + vắng có phép
      attendanceRate: number; // %
    }> = [];

    // Filter relevant sessions based on class filter
    const relevantSessions =
      selectedClassId === 'ALL'
        ? attendanceSessions
        : attendanceSessions.filter((s) => s.classId === selectedClassId);

    // Map of students
    const targetClassrooms =
      selectedClassId === 'ALL'
        ? classrooms
        : classrooms.filter((c) => c.id === selectedClassId);

    targetClassrooms.forEach((cls) => {
      cls.students.forEach((st) => {
        // Find all attendance records for this student
        const classSessions = relevantSessions.filter((s) => s.classId === cls.id);
        const totalSessions = classSessions.length;

        let present = 0;
        let absent = 0;
        let excused = 0;
        let late = 0;

        classSessions.forEach((sess) => {
          const rec = sess.records.find((r) => r.studentId === st.id);
          if (rec) {
            if (rec.status === 'present') present++;
            else if (rec.status === 'absent') absent++;
            else if (rec.status === 'excused') excused++;
            else if (rec.status === 'late') late++;
          }
        });

        const totalAbsences = absent + excused;
        const attended = present + late;
        const attendanceRate =
          totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 100;

        list.push({
          studentId: st.id,
          studentCode: st.code,
          studentName: st.name,
          classId: cls.id,
          className: cls.name,
          totalSessions,
          presentCount: present,
          absentCount: absent,
          excusedCount: excused,
          lateCount: late,
          totalAbsences,
          attendanceRate,
        });
      });
    });

    return list;
  }, [classrooms, attendanceSessions, selectedClassId]);

  // Filter students based on search and absence filter
  const filteredStudents = useMemo(() => {
    return studentStats.filter((st) => {
      // Search match
      const matchSearch =
        st.studentName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        st.studentCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        st.className.toLowerCase().includes(searchKeyword.toLowerCase());

      if (!matchSearch) return false;

      // Absence filter
      if (absenceFilter === 'HIGH') {
        // Vắng nhiều: từ 2 buổi vắng trở lên HOẶC tỷ lệ chuyên cần < 80%
        return st.totalAbsences >= 2 || (st.totalSessions > 0 && st.attendanceRate < 80);
      } else if (absenceFilter === 'MEDIUM') {
        // Có vắng từ 1 buổi trở lên
        return st.totalAbsences >= 1;
      }

      return true;
    });
  }, [studentStats, searchKeyword, absenceFilter]);

  // Overview summary
  const summary = useMemo(() => {
    const totalStudents = studentStats.length;
    const highAbsenceStudents = studentStats.filter(
      (s) => s.totalAbsences >= 2 || (s.totalSessions > 0 && s.attendanceRate < 80)
    ).length;
    const averageRate =
      totalStudents > 0
        ? Math.round(
            studentStats.reduce((acc, curr) => acc + curr.attendanceRate, 0) / totalStudents
          )
        : 100;

    return { totalStudents, highAbsenceStudents, averageRate };
  }, [studentStats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <button
              onClick={() => onNavigateTab('attendance')}
              className="hover:text-orange-600 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Điểm danh
            </button>
            <span>/</span>
            <span className="text-slate-800 font-bold">Thống kê chuyên cần</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#001f3f] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            Thống Kê Chuyên Cần & Vắng Học
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích số buổi vắng, tỷ lệ đi học và cảnh báo học sinh vắng nhiều
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('attendance')}
          className="bg-[#001f3f] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start md:self-auto"
        >
          <Clock className="w-4 h-4 text-orange-400" />
          <span>Thực hiện điểm danh</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tổng số học sinh
            </div>
            <div className="text-2xl font-black text-[#001f3f] mt-1">{summary.totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-1">Trong danh sách theo dõi</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cảnh báo vắng nhiều
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {summary.highAbsenceStudents} học sinh
            </div>
            <div className="text-[11px] text-rose-500 font-medium mt-1">
              Vắng ≥ 2 buổi hoặc tỉ lệ &lt; 80%
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tỷ lệ chuyên cần TB
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{summary.averageRate}%</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Tính trên {attendanceSessions.length} buổi điểm danh
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Class Selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Lớp học:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="ALL">Tất cả lớp ({classrooms.length} lớp)</option>
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Absence Quick Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setAbsenceFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                absenceFilter === 'ALL'
                  ? 'bg-white text-[#001f3f] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setAbsenceFilter('MEDIUM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                absenceFilter === 'MEDIUM'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Có vắng học
            </button>
            <button
              onClick={() => setAbsenceFilter('HIGH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                absenceFilter === 'HIGH'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚠️ Vắng nhiều (Cảnh báo)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên, mã HS..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#001f3f] text-slate-200 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Mã HS</th>
                <th className="px-4 py-3.5">Họ và tên</th>
                <th className="px-4 py-3.5">Lớp học</th>
                <th className="px-4 py-3.5 text-center">Có mặt</th>
                <th className="px-4 py-3.5 text-center">Vắng (Không phép)</th>
                <th className="px-4 py-3.5 text-center">Vắng (Có phép)</th>
                <th className="px-4 py-3.5 text-center">Đi muộn</th>
                <th className="px-4 py-3.5 text-center">Tỷ lệ chuyên cần</th>
                <th className="px-4 py-3.5 text-center">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    Không tìm thấy học sinh phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isHighAbsence =
                    st.totalAbsences >= 2 || (st.totalSessions > 0 && st.attendanceRate < 80);

                  return (
                    <tr
                      key={st.studentId}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHighAbsence ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-mono text-slate-500">{st.studentCode}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{st.studentName}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px]">
                          {st.className}
                        </span>
                      </td>

                      {/* Status counts with icons & labels */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {st.presentCount}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            st.absentCount > 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {st.absentCount}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            st.excusedCount > 0 ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          {st.excusedCount}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            st.lateCount > 0 ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {st.lateCount}
                        </span>
                      </td>

                      {/* Attendance Bar */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                st.attendanceRate >= 90
                                  ? 'bg-emerald-500'
                                  : st.attendanceRate >= 80
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${st.attendanceRate}%` }}
                            />
                          </div>
                          <span className="font-extrabold text-xs">{st.attendanceRate}%</span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5 text-center">
                        {isHighAbsence ? (
                          <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-extrabold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Vắng nhiều
                          </span>
                        ) : st.attendanceRate >= 95 ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Rất tốt
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">
                            Bình thường
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
