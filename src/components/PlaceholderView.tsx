import React from 'react';
import { CalendarCheck, BookOpen, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { TabType } from '../types';

interface PlaceholderViewProps {
  type: 'attendance' | 'lesson_plan';
  onNavigateTab: (tab: TabType) => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ type, onNavigateTab }) => {
  const isAttendance = type === 'attendance';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 bg-orange-50 border border-orange-200 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          {isAttendance ? (
            <CalendarCheck className="w-10 h-10" />
          ) : (
            <BookOpen className="w-10 h-10" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Chức năng nâng cao</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isAttendance ? 'Quản Lý Điểm Danh' : 'Quản Lý Giáo Án'}
          </h2>
          <p className="text-orange-600 font-bold text-base sm:text-lg">
            Sẽ được bổ sung ở bước tiếp theo
          </p>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          {isAttendance
            ? 'Tính năng Điểm danh giúp thầy/cô theo dõi sự hiện diện hàng ngày của học sinh, tự động tổng hợp vắng mặt có phép/không phép và báo cáo sĩ số.'
            : 'Tính năng Giáo án hỗ trợ thầy/cô soạn thảo, lưu trữ kế hoạch bài dạy theo từng môn học và quản lý tiến trình giảng dạy các lớp.'}
        </p>

        {/* Planned highlights */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-2 text-xs sm:text-sm text-slate-700 max-w-md mx-auto">
          <p className="font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Dự kiến sẽ bao gồm:
          </p>
          <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
            {isAttendance ? (
              <>
                <li>Điểm danh nhanh theo ngày và theo tiết</li>
                <li>Ghi chú lý do vắng mặt, đi muộn</li>
                <li>Báo cáo thống kê điểm danh theo tháng</li>
              </>
            ) : (
              <>
                <li>Tạo và quản lý thư viện giáo án số</li>
                <li>Gắn giáo án với từng lớp học và tiết dạy</li>
                <li>Xuất file giáo án in ấn tiện lợi</li>
              </>
            )}
          </ul>
        </div>

        {/* Back to classes button */}
        <div className="pt-2">
          <button
            onClick={() => onNavigateTab('classes')}
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Quay lại Quản lý Lớp học</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
