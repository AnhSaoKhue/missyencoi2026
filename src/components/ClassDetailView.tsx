import React, { useState } from 'react';
import { Classroom, Student } from '../types';
import {
  ArrowLeft,
  UserPlus,
  ClipboardList,
  Search,
  Edit3,
  Trash2,
  CalendarCheck,
  Calendar,
  User,
  Users,
  X,
  FileText,
} from 'lucide-react';

interface ClassDetailViewProps {
  classroom: Classroom;
  onBack: () => void;
  onEditClass: (cls: Classroom) => void;
  onDeleteClass: (classId: string, className: string) => void;
  onOpenAddStudent: () => void;
  onOpenBatchImport: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
  onGoToAttendance?: (classId: string) => void;
}

export const ClassDetailView: React.FC<ClassDetailViewProps> = ({
  classroom,
  onBack,
  onEditClass,
  onDeleteClass,
  onOpenAddStudent,
  onOpenBatchImport,
  onEditStudent,
  onDeleteStudent,
  onGoToAttendance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const students = classroom.students || [];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách lớp</span>
        </button>

        {onGoToAttendance && (
          <button
            onClick={() => onGoToAttendance(classroom.id)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Điểm danh lớp này</span>
          </button>
        )}
      </div>

      {/* Class Banner Card */}
      <div className="bg-[#001f3f] rounded-2xl p-6 text-white shadow-md border border-slate-800 relative overflow-hidden border-l-4 border-l-orange-500">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-orange-500 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                Lớp học
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                Môn {classroom.subject}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {classroom.name}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-400" />
                <span>Năm học: <strong className="text-white">{classroom.schoolYear}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-400" />
                <span>GV phụ trách: <strong className="text-white">{classroom.teacher}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" />
                <span>Sĩ số: <strong className="text-orange-400">{students.length} học sinh</strong></span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onGoToAttendance && (
              <button
                onClick={() => onGoToAttendance(classroom.id)}
                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Điểm danh ngay</span>
              </button>
            )}
            <button
              onClick={() => onEditClass(classroom)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Sửa thông tin</span>
            </button>
            <button
              onClick={() => onDeleteClass(classroom.id, classroom.name)}
              className="px-3.5 py-2 bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa lớp</span>
            </button>
          </div>
        </div>
      </div>


      {/* Student List Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span>Danh sách Học Sinh ({students.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Thêm, chỉnh sửa thông tin hoặc tìm kiếm học sinh trong lớp
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddStudent}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span>Thêm 1 học sinh</span>
            </button>
            <button
              onClick={onOpenBatchImport}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Nhập nhanh nhiều học sinh</span>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm học sinh theo tên, mã học sinh, ghi chú..."
            className="w-full pl-10 pr-9 py-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 text-sm transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Student List View */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-base mb-1">
            {searchTerm
              ? `Không tìm thấy học sinh nào khớp với "${searchTerm}"`
              : 'Lớp học hiện chưa có học sinh nào'}
          </p>
          <p className="text-slate-400 text-xs max-w-md mx-auto mb-5">
            {searchTerm
              ? 'Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc bấm nút x để bỏ lọc.'
              : 'Thầy/cô có thể thêm từng học sinh hoặc dán nhanh cả danh sách cả lớp từ file Word/Excel.'}
          </p>
          {!searchTerm && (
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={onOpenAddStudent}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-orange-400" />
                <span>Thêm học sinh thủ công</span>
              </button>
              <button
                onClick={onOpenBatchImport}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                <ClipboardList className="w-4 h-4" />
                <span>Nhập danh sách dán hàng loạt</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3.5 px-4 w-12 text-center">STT</th>
                  <th className="py-3.5 px-4 w-32">Mã Học Sinh</th>
                  <th className="py-3.5 px-4">Họ và Tên Học Sinh</th>
                  <th className="py-3.5 px-4">Ghi Chú</th>
                  <th className="py-3.5 px-4 w-32 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="hover:bg-orange-50/40 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-md inline-block">
                        {student.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-base">
                      {student.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {student.notes ? (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>{student.notes}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium italic">Không có ghi chú</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditStudent(student)}
                          title="Sửa học sinh"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id, student.name)}
                          title="Xóa học sinh"
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredStudents.map((student, index) => (
              <div key={student.id} className="p-4 space-y-2 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-md">
                      #{index + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      {student.name}
                    </h3>
                  </div>

                  <span className="font-mono text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                    {student.code}
                  </span>
                </div>

                {student.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{student.notes}</span>
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => onEditStudent(student)}
                    className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id, student.name)}
                    className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Hiển thị {filteredStudents.length} / {students.length} học sinh</span>
            <span className="text-orange-600 font-semibold">Tự động lưu vào trình duyệt</span>
          </div>
        </div>
      )}
    </div>
  );
};
