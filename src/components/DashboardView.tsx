import React from 'react';
import { Classroom, LessonPlan, TabType } from '../types';
import {
  School,
  Users,
  Award,
  UserPlus,
  PlusCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  CalendarCheck,
  History,
  Zap,
  FileCheck,
} from 'lucide-react';

interface DashboardViewProps {
  classrooms: Classroom[];
  lessonPlans?: LessonPlan[];
  onSelectClass: (classId: string) => void;
  onOpenCreateClass: () => void;
  onNavigateTab: (tab: TabType) => void;
  onResetSampleData?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  classrooms,
  lessonPlans = [],
  onSelectClass,
  onOpenCreateClass,
  onNavigateTab,
}) => {
  // Compute Stats
  const totalClasses = classrooms.length;
  const totalStudents = classrooms.reduce((acc, c) => acc + (c.students?.length || 0), 0);
  const totalLessonPlans = lessonPlans.length;
  const ketNoiTriThucCount = lessonPlans.filter(
    (lp) => (lp.textbookSet || '').includes('Kết nối tri thức') || lp.subject !== 'Tiếng Anh'
  ).length;
  const globalSuccessCount = lessonPlans.filter(
    (lp) => (lp.textbookSet || '').includes('Global Success') || lp.subject === 'Tiếng Anh'
  ).length;

  // Class with most students
  const largestClass = classrooms.reduce((max: Classroom | null, current: Classroom) => {
    if (!max) return current;
    return (current.students?.length || 0) > (max.students?.length || 0) ? current : max;
  }, null as Classroom | null);

  // New students added (e.g., added in the last 7 days or recently)
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newStudentsCount = classrooms.reduce((acc, c) => {
    const newInClass = (c.students || []).filter((s) => {
      if (!s.createdAt) return false;
      return new Date(s.createdAt).getTime() >= sevenDaysAgo;
    }).length;
    return acc + newInClass;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Geometric Balance Theme */}
      <div className="bg-[#001f3f] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-800 border-l-4 border-l-orange-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Xin chào Giáo viên!</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
              Chào mừng tới <span className="text-orange-400">LỚP HỌC CỦA TÔI</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Trang tổng quan giúp thầy/cô quản lý lớp học, sĩ số học sinh và điểm danh học sinh dễ dàng.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('lesson_plan')}
              className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider active:scale-95"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>AI Soạn Giáo Án 5512</span>
            </button>
            <button
              onClick={() => onNavigateTab('grading')}
              className="px-4 py-3 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-amber-300 font-extrabold text-sm rounded-xl border border-amber-400/40 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Award className="w-4.5 h-4.5 text-amber-400" />
              <span>Chấm bài AI</span>
            </button>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarCheck className="w-4.5 h-4.5 text-orange-400" />
              <span>Điểm danh</span>
            </button>
            <button
              onClick={onOpenCreateClass}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4.5 h-4.5 text-orange-400" />
              <span>Tạo lớp mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards with Accent Left Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Stat 1: Tổng số lớp học */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 border-l-4 border-l-[#001f3f]">
          <div className="p-3.5 rounded-2xl bg-[#001f3f] text-orange-400 flex-shrink-0">
            <School className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Tổng số lớp học
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalClasses}
              </span>
              <span className="text-xs font-medium text-slate-500">lớp</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Tổng số học sinh */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 border-l-4 border-l-orange-500">
          <div className="p-3.5 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Tổng số học sinh
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalStudents}
              </span>
              <span className="text-xs font-medium text-slate-500">học sinh</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Thư viện giáo án AI */}
        <div
          onClick={() => onNavigateTab('lesson_plan')}
          className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 border-l-4 border-l-amber-500 cursor-pointer group"
        >
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
              Giáo án & Lịch sử soạn bài
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalLessonPlans}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                bài soạn
              </span>
            </div>
          </div>
        </div>

        {/* Stat 4: Chức năng điểm danh */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="bg-gradient-to-br from-[#001f3f] to-slate-900 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-white border-l-4 border-l-orange-500 cursor-pointer group"
        >
          <div className="p-3.5 rounded-2xl bg-orange-500 text-white flex-shrink-0 group-hover:scale-105 transition-transform">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-0.5">
              Điểm danh hôm nay
            </p>
            <div className="text-sm font-extrabold text-white group-hover:text-orange-300 transition-colors flex items-center gap-1">
              <span>Bắt đầu ngay</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Classroom Quick Access Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 border-l-4 border-l-[#001f3f]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <School className="w-5 h-5 text-orange-500" />
              <span>Danh sách các lớp học hiện có</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấn vào lớp học để xem danh sách học sinh hoặc chọn Điểm danh
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('classes')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200"
            >
              <span>Xem tất cả lớp ({totalClasses})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {classrooms.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold mb-1">Chưa có lớp học nào được tạo</p>
            <p className="text-slate-400 text-xs max-w-md mx-auto mb-4">
              Thầy/cô bấm nút bên dưới để tạo lớp học đầu tiên.
            </p>
            <div className="flex justify-center">
              <button
                onClick={onOpenCreateClass}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tạo lớp mới ngay</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((cls) => (
              <div
                key={cls.id}
                className="group bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-orange-500/50 hover:shadow-md p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between border-l-2 border-l-[#001f3f]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      onClick={() => onSelectClass(cls.id)}
                      className="font-extrabold text-base text-slate-900 group-hover:text-orange-600 transition-colors"
                    >
                      {cls.name}
                    </span>
                    <span className="bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {cls.students?.length || 0} học sinh
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 mb-3">
                    <p className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Môn học: <strong className="text-slate-800">{cls.subject}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Năm học: <strong className="text-slate-800">{cls.schoolYear}</strong></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>GV: <strong className="text-slate-800">{cls.teacher}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-orange-600">
                  <button
                    onClick={() => onSelectClass(cls.id)}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>Xem danh sách học sinh</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

