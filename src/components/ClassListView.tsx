import React, { useState } from 'react';
import { Classroom } from '../types';
import { School, BookOpen, Calendar, Users, Edit3, Trash2, PlusCircle, Search, ChevronRight, CalendarCheck } from 'lucide-react';

interface ClassListViewProps {
  classrooms: Classroom[];
  onSelectClass: (classId: string) => void;
  onOpenCreateClass: () => void;
  onEditClass: (cls: Classroom) => void;
  onDeleteClass: (classId: string, className: string) => void;
  onGoToAttendance?: (classId: string) => void;
}

export const ClassListView: React.FC<ClassListViewProps> = ({
  classrooms,
  onSelectClass,
  onOpenCreateClass,
  onEditClass,
  onDeleteClass,
  onGoToAttendance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClassrooms = classrooms.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.schoolYear.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm border-l-4 border-l-[#001f3f]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <School className="w-6 h-6 text-orange-500" />
            <span>Danh sách Lớp học ({classrooms.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý, thêm mới, cập nhật thông tin lớp học, học sinh và thực hiện điểm danh
          </p>
        </div>

        <button
          onClick={onOpenCreateClass}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo lớp học mới</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên lớp, môn học, giáo viên, năm học..."
          className="w-full pl-11 pr-4 py-2.5 text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all text-sm shadow-xs"
        />
      </div>

      {/* Class Grid */}
      {filteredClassrooms.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm">
          <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-base mb-1">
            {searchTerm ? 'Không tìm thấy lớp học phù hợp' : 'Chưa có lớp học nào'}
          </p>
          <p className="text-slate-400 text-xs max-w-sm mx-auto mb-4">
            {searchTerm
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm nút Tạo lớp học mới.'
              : 'Hãy bắt đầu tạo lớp học đầu tiên của thầy/cô ngay bây giờ.'}
          </p>
          <button
            onClick={onOpenCreateClass}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
          >
            + Tạo lớp học mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClassrooms.map((cls, idx) => (
            <div
              key={cls.id}
              className={`bg-white rounded-2xl border border-slate-200/90 hover:border-orange-500/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group border-l-4 ${
                idx % 2 === 0 ? 'border-l-[#001f3f]' : 'border-l-orange-500'
              }`}
            >
              {/* Card top bar */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    onClick={() => onSelectClass(cls.id)}
                    className="cursor-pointer"
                  >
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                      {cls.name}
                    </h3>
                    <span className="inline-block mt-1 bg-orange-100 text-orange-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
                      Môn {cls.subject}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClass(cls);
                      }}
                      title="Sửa thông tin lớp"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClass(cls.id, cls.name);
                      }}
                      title="Xóa lớp học"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Năm học:
                    </span>
                    <span className="font-semibold text-slate-800">{cls.schoolYear}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      Giáo viên phụ trách:
                    </span>
                    <span className="font-semibold text-slate-800">{cls.teacher}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Sĩ số học sinh:
                    </span>
                    <span className="font-extrabold text-orange-600 text-sm">
                      {cls.students?.length || 0} HS
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="grid grid-cols-2 border-t border-slate-100">
                {onGoToAttendance && (
                  <button
                    onClick={() => onGoToAttendance(cls.id)}
                    className="bg-slate-100 hover:bg-orange-500 text-slate-800 hover:text-white font-bold text-xs py-3 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer border-r border-slate-200"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Điểm danh</span>
                  </button>
                )}
                <button
                  onClick={() => onSelectClass(cls.id)}
                  className={`bg-[#001f3f] hover:bg-slate-800 text-white font-bold text-xs py-3 px-3 flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                    !onGoToAttendance ? 'col-span-2' : ''
                  }`}
                >
                  <span>Học sinh</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

