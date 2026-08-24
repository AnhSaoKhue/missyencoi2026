import React, { useState } from 'react';
import { LessonPlan, TabType } from '../types';
import { QRCodeModal } from './QRCodeModal';
import {
  Table,
  QrCode,
  Calendar,
  BookOpen,
  User,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  FileText,
  Printer,
  Download,
  Home,
} from 'lucide-react';

interface DashboardDataViewProps {
  lessonPlans: LessonPlan[];
  onSelectLessonPlan?: (plan: LessonPlan) => void;
  onNavigateTab?: (tab: TabType) => void;
  onBackToHome?: () => void;
}

export const DashboardDataView: React.FC<DashboardDataViewProps> = ({
  lessonPlans,
  onSelectLessonPlan,
  onNavigateTab,
  onBackToHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPlanForQR, setSelectedPlanForQR] = useState<LessonPlan | null>(null);

  // Filter plans
  const filteredPlans = lessonPlans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.teacherName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'all' || plan.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  const uniqueSubjects = Array.from(new Set(lessonPlans.map((p) => p.subject)));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border-2 border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Dashboard Data SDK — System Management</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-cyan-200 tracking-tight mt-1">
            Bảng Quản Lý Dữ Liệu Bài Soạn Data SDK
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Hiển thị đầy đủ thông tin STT, Họ tên giáo viên, Môn học, Ngày soạn/dạy, Chỉnh sửa bổ sung & Mã QR cho từng bài dạy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(onBackToHome || onNavigateTab) && (
            <button
              type="button"
              onClick={() => (onBackToHome ? onBackToHome() : onNavigateTab && onNavigateTab('dashboard'))}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-600 shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-tight"
            >
              <Home className="w-4 h-4 text-orange-400" />
              <span>Quay lại trang chủ</span>
            </button>
          )}

          <div className="bg-slate-900/90 px-4 py-2.5 rounded-xl border border-cyan-400/30 text-center">
            <div className="text-xs text-slate-400 font-bold">Tổng số bài soạn</div>
            <div className="text-xl font-black text-amber-400">{lessonPlans.length}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo bài học, giáo viên, môn..."
            className="w-full bg-slate-950 text-white text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-700 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Lọc theo môn:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-950 text-white font-bold text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="all" className="bg-slate-900 text-white font-bold py-1">Tất cả môn học</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub} className="bg-slate-900 text-white font-bold py-1">
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data SDK Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-cyan-300 font-extrabold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">STT</th>
                <th className="px-4 py-3.5">Họ và tên</th>
                <th className="px-4 py-3.5">Tên Bài Học</th>
                <th className="px-4 py-3.5">Môn & Lớp</th>
                <th className="px-4 py-3.5 text-center">Ngày soạn</th>
                <th className="px-4 py-3.5 text-center">Ngày dạy</th>
                <th className="px-4 py-3.5">Chỉnh sửa bổ sung</th>
                <th className="px-4 py-3.5 text-center">Mã QR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                    Chưa có bài soạn nào khớp với dữ liệu tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan, index) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-slate-800/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectLessonPlan && onSelectLessonPlan(plan)}
                  >
                    {/* STT */}
                    <td className="px-4 py-3 text-center font-black text-amber-400 bg-slate-950/40">
                      {index + 1}
                    </td>

                    {/* Họ tên */}
                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-900 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black text-xs shrink-0">
                          {(plan.teacherName || 'GV').charAt(0)}
                        </div>
                        <div>
                          <div>{plan.teacherName || 'Giáo viên Anh Sao Khue'}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {plan.schoolName || 'THCS Kết nối tri thức'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Tên bài học */}
                    <td className="px-4 py-3 font-extrabold text-cyan-200 max-w-xs">
                      <div className="line-clamp-2">{plan.title}</div>
                      {plan.bilingualSection && (
                        <span className="inline-block bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.2 rounded mt-1 border border-amber-400/40 font-mono">
                          Song ngữ CLIL
                        </span>
                      )}
                    </td>

                    {/* Môn & Lớp */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="bg-blue-950 text-cyan-300 font-extrabold px-2.5 py-1 rounded-lg border border-blue-800 inline-block text-[11px]">
                        {plan.subject} ({plan.className || plan.gradeLevel || 'Lớp 7'})
                      </span>
                    </td>

                    {/* Ngày soạn */}
                    <td className="px-4 py-3 text-center font-mono text-slate-300 whitespace-nowrap">
                      {plan.prepDate || plan.date || '04/08/2026'}
                    </td>

                    {/* Ngày dạy */}
                    <td className="px-4 py-3 text-center font-mono text-emerald-400 font-bold whitespace-nowrap">
                      {plan.teachDate || plan.date || '05/08/2026'}
                    </td>

                    {/* Chỉnh sửa bổ sung */}
                    <td className="px-4 py-3 max-w-xs text-slate-300">
                      <p className="line-clamp-2 italic text-[11px]">
                        {plan.notes || 'Đã tích hợp năng lực số & bổ sung hình minh họa sắc nét.'}
                      </p>
                    </td>

                    {/* Mã QR */}
                    <td className="px-4 py-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedPlanForQR(plan)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 mx-auto transition-all cursor-pointer shadow-md active:scale-95"
                        title="Xem & Tải Mã QR Bài Soạn"
                      >
                        <QrCode className="w-4 h-4 text-slate-950" />
                        <span>Mã QR</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Modal */}
      {selectedPlanForQR && (
        <QRCodeModal
          isOpen={!!selectedPlanForQR}
          onClose={() => setSelectedPlanForQR(null)}
          title={selectedPlanForQR.title}
          subject={selectedPlanForQR.subject}
          teacherName={selectedPlanForQR.teacherName || 'Giáo viên Anh Sao Khue'}
          date={selectedPlanForQR.date}
        />
      )}
    </div>
  );
};
