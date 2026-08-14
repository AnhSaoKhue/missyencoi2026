import React, { useState, useMemo } from 'react';
import { Classroom, Assignment, HomeworkSubmission, TabType } from '../types';
import { COMPREHENSIVE_SUBJECTS } from '../constants';
import {
  FileCheck,
  PlusCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  PieChart,
  Trash2,
  ListCheck,
  Clock,
} from 'lucide-react';

interface HomeworkViewProps {
  classrooms: Classroom[];
  assignments: Assignment[];
  addAssignment: (asg: Omit<Assignment, 'id' | 'createdAt'>) => Assignment;
  deleteAssignment: (id: string) => void;
  homeworkSubmissions: HomeworkSubmission[];
  toggleHomeworkSubmission: (assignmentId: string, studentId: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const HomeworkView: React.FC<HomeworkViewProps> = ({
  classrooms,
  assignments,
  addAssignment,
  deleteAssignment,
  homeworkSubmissions,
  toggleHomeworkSubmission,
  onNavigateTab,
}) => {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [classId, setClassId] = useState<string>(classrooms.length > 0 ? classrooms[0].id : '');
  const [subject, setSubject] = useState<string>(classrooms.length > 0 ? classrooms[0].subject : 'Toán');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState<string>('');

  // Selected assignment detail
  const activeAssignment = useMemo(() => {
    if (selectedAssignmentId) {
      return assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];
    }
    return assignments[0] || null;
  }, [assignments, selectedAssignmentId]);

  // Target class for active assignment
  const targetClass = useMemo(() => {
    if (!activeAssignment) return null;
    return classrooms.find((c) => c.id === activeAssignment.classId) || null;
  }, [classrooms, activeAssignment]);

  // Submissions stats for active assignment
  const stats = useMemo(() => {
    if (!activeAssignment || !targetClass) return { total: 0, submitted: 0, rate: 0 };
    const total = targetClass.students.length;
    let submitted = 0;

    targetClass.students.forEach((st) => {
      const rec = homeworkSubmissions.find(
        (s) => s.assignmentId === activeAssignment.id && s.studentId === st.id
      );
      if (rec && rec.isSubmitted) submitted++;
    });

    const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return { total, submitted, rate };
  }, [activeAssignment, targetClass, homeworkSubmissions]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !classId) return;

    const cls = classrooms.find((c) => c.id === classId);
    const newAsg = addAssignment({
      title: title.trim(),
      classId,
      className: cls ? cls.name : 'Lớp học',
      subject,
      dueDate,
      description: description.trim(),
    });

    setSelectedAssignmentId(newAsg.id);
    setTitle('');
    setDescription('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#001f3f] flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-orange-500" />
            Theo Dõi & Quản Lý Bài Tập Về Nhà
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Giao bài tập, đánh dấu học sinh đã nộp bài và thống kê tỷ lệ hoàn thành
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Bài Tập Mới</span>
        </button>
      </div>

      {/* Main Layout: Left = Assignments List, Right = Student Submissions Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments List (1 Col) */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm px-1 flex items-center gap-2">
            <ListCheck className="w-4 h-4 text-orange-500" />
            Danh Sách Bài Tập ({assignments.length})
          </h3>

          {assignments.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-medium">
              Chưa tạo bài tập nào. Bấm nút "Tạo Bài Tập Mới".
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((asg) => {
                const isActive = activeAssignment?.id === asg.id;

                return (
                  <div
                    key={asg.id}
                    onClick={() => setSelectedAssignmentId(asg.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#001f3f] text-white border-slate-800 shadow-md ring-2 ring-orange-500/50'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-orange-500 text-white'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {asg.className} • {asg.subject}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAssignment(asg.id);
                        }}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Xóa bài tập"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-sm mt-2 leading-snug">{asg.title}</h4>

                    <div
                      className={`flex items-center gap-1.5 text-[11px] font-semibold mt-2 ${
                        isActive ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      <span>Hạn nộp: {asg.dueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Assignment Submissions (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          {activeAssignment && targetClass ? (
            <>
              {/* Stats Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                      Đang xem bài tập:
                    </span>
                    <h3 className="text-base font-extrabold text-[#001f3f]">
                      {activeAssignment.title}
                    </h3>
                  </div>

                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-xl text-xs font-bold self-start sm:self-auto">
                    Hạn nộp: {activeAssignment.dueDate}
                  </span>
                </div>

                {activeAssignment.description && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    📌 {activeAssignment.description}
                  </p>
                )}

                {/* Progress Bar & KPIs */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl text-center border border-slate-100">
                    <div className="text-lg font-black text-slate-900">{stats.total}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Tổng học sinh</div>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-xl text-center border border-emerald-100">
                    <div className="text-lg font-black text-emerald-600">{stats.submitted}</div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase">Đã nộp bài</div>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-xl text-center border border-orange-100">
                    <div className="text-lg font-black text-orange-600">{stats.rate}%</div>
                    <div className="text-[10px] text-orange-700 font-bold uppercase">Tỷ lệ hoàn thành</div>
                  </div>
                </div>

                {/* Completion Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${stats.rate}%` }}
                  />
                </div>
              </div>

              {/* Student Checklist Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Danh Sách Học Sinh ({targetClass.name})
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tích vào ô để đánh dấu bài tập
                  </span>
                </div>

                <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                  {targetClass.students.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Lớp này chưa có học sinh nào.
                    </div>
                  ) : (
                    targetClass.students.map((student) => {
                      const subRecord = homeworkSubmissions.find(
                        (s) => s.assignmentId === activeAssignment.id && s.studentId === student.id
                      );
                      const isSubmitted = subRecord?.isSubmitted || false;

                      return (
                        <div
                          key={student.id}
                          onClick={() =>
                            toggleHomeworkSubmission(activeAssignment.id, student.id)
                          }
                          className={`p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                            isSubmitted ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSubmitted}
                              onChange={() => {}} // handled by parent onClick
                              className="w-4 h-4 accent-emerald-600 cursor-pointer rounded-md"
                            />
                            <div>
                              <div className="text-xs font-extrabold text-slate-900">
                                {student.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {student.code}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isSubmitted ? (
                              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã nộp bài
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-slate-400" /> Chưa nộp
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
              Hãy chọn bài tập từ danh sách bên trái hoặc tạo bài tập mới.
            </div>
          )}
        </div>
      </div>

      {/* Create Homework Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-[#001f3f] text-base">Tạo Bài Tập Về Nhà Mới</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên bài tập *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Bài tập tuần 1 - Đại lượng tỷ lệ thuận"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp giao bài *</label>
                  <select
                    value={classId}
                    onChange={(e) => {
                      setClassId(e.target.value);
                      const cls = classrooms.find((c) => c.id === e.target.value);
                      if (cls) setSubject(cls.subject);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    {classrooms.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Môn học *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {COMPREHENSIVE_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hạn nộp *</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung / Yêu cầu bài tập</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Yêu cầu làm các bài tập SGK hay nộp qua file..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs cursor-pointer"
                >
                  Tạo bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
