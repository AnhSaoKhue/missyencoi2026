import React, { useState } from 'react';
import { Classroom, ScheduleItem, TabType } from '../types';
import { COMPREHENSIVE_SUBJECTS } from '../constants';
import {
  Calendar,
  Clock,
  PlusCircle,
  Building,
  Trash2,
  Filter,
  CheckCircle2,
  MapPin,
  BookOpen,
} from 'lucide-react';

interface ScheduleViewProps {
  classrooms: Classroom[];
  scheduleItems: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem;
  updateScheduleItem: (item: ScheduleItem) => void;
  deleteScheduleItem: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

const DAYS_OF_WEEK = [
  { day: 2, label: 'Thứ Hai' },
  { day: 3, label: 'Thứ Ba' },
  { day: 4, label: 'Thứ Tư' },
  { day: 5, label: 'Thứ Năm' },
  { day: 6, label: 'Thứ Sáu' },
  { day: 7, label: 'Thứ Bảy' },
  { day: 8, label: 'Chủ Nhật' },
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  classrooms,
  scheduleItems,
  addScheduleItem,
  updateScheduleItem,
  deleteScheduleItem,
  onNavigateTab,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 = Tất cả các ngày
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  // Form State
  const [dayOfWeek, setDayOfWeek] = useState<number>(2);
  const [period, setPeriod] = useState<number>(1);
  const [subject, setSubject] = useState<string>('Toán');
  const [classId, setClassId] = useState<string>(classrooms.length > 0 ? classrooms[0].id : '');
  const [room, setRoom] = useState<string>('Phòng 201');
  const [notes, setNotes] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('07:30');
  const [endTime, setEndTime] = useState<string>('08:15');

  const filteredItems = scheduleItems.filter(
    (item) => selectedDay === 0 || item.dayOfWeek === selectedDay
  );

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setDayOfWeek(2);
    setPeriod(1);
    setSubject(classrooms.length > 0 ? classrooms[0].subject : 'Toán');
    setClassId(classrooms.length > 0 ? classrooms[0].id : '');
    setRoom('Phòng 201');
    setNotes('');
    setStartTime('07:30');
    setEndTime('08:15');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ScheduleItem) => {
    setEditingItem(item);
    setDayOfWeek(item.dayOfWeek);
    setPeriod(item.period);
    setSubject(item.subject);
    setClassId(item.classId);
    setRoom(item.room);
    setNotes(item.notes || '');
    setStartTime(item.startTime || '07:30');
    setEndTime(item.endTime || '08:15');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classrooms.find((c) => c.id === classId);
    const className = targetClass ? targetClass.name : 'Chưa rõ';

    if (editingItem) {
      updateScheduleItem({
        ...editingItem,
        dayOfWeek,
        period,
        subject,
        classId,
        className,
        room,
        notes,
        startTime,
        endTime,
      });
    } else {
      addScheduleItem({
        dayOfWeek,
        period,
        subject,
        classId,
        className,
        room,
        notes,
        startTime,
        endTime,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#001f3f] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-500" />
            Thời Khóa Biểu & Lịch Giảng Dạy
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý lịch dạy theo tuần, môn học, lớp học và phòng học
          </p>
        </div>

        {/* Highlight Action Button */}
        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm Tiết Dạy Mới</span>
        </button>
      </div>

      {/* Day Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setSelectedDay(0)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDay === 0
                ? 'bg-[#001f3f] text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả các ngày
          </button>
          {DAYS_OF_WEEK.map((d) => (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDay === d.day
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-600 text-sm">Chưa có lịch dạy nào vào ngày này</p>
            <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Tiết Dạy Mới" để bắt đầu xếp lịch.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const dayObj = DAYS_OF_WEEK.find((d) => d.day === item.dayOfWeek);

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase">
                      {dayObj ? dayObj.label : `Thứ ${item.dayOfWeek}`} • Tiết {item.period}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteScheduleItem(item.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-[#001f3f]">{item.subject}</h3>

                  <div className="space-y-1.5 text-xs font-semibold text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>Lớp học: <strong className="text-slate-900">{item.className}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>Phòng học: <strong className="text-slate-900">{item.room}</strong></span>
                    </div>

                    {item.startTime && item.endTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>Thời gian: {item.startTime} - {item.endTime}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                      📝 {item.notes}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Trạng thái: Hoạt động</span>
                  <button
                    onClick={() => onNavigateTab('attendance')}
                    className="text-orange-600 font-bold hover:underline cursor-pointer"
                  >
                    Điểm danh lớp →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Schedule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-[#001f3f] text-base">
              {editingItem ? 'Chỉnh Sửa Tiết Dạy' : 'Thêm Tiết Dạy Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thứ trong tuần *</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.day} value={d.day}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiết dạy *</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        Tiết {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp học *</label>
                  <select
                    value={classId}
                    onChange={(e) => {
                      setClassId(e.target.value);
                      const cls = classrooms.find((c) => c.id === e.target.value);
                      if (cls) setSubject(cls.subject);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800"
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phòng học *</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="VD: Phòng 201"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú tiết dạy</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Mang máy chiếu, kiểm tra 15 phút..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu tiết dạy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
