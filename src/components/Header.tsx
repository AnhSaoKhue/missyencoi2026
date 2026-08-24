import React, { useState } from 'react';
import { TabType } from '../types';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  GraduationCap,
  CalendarCheck,
  History,
  BookOpen,
  Menu,
  X,
  PlusCircle,
  Users,
  Building,
  ChevronRight,
  Sparkles,
  BarChart3,
  Calendar,
  FolderKanban,
  FileCheck,
  Phone,
  Bot,
  HardDrive,
  Award,
  Table,
  ShieldCheck,
  Settings,
  HelpCircle,
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenCreateClass: () => void;
  onOpenGoogleWorkspaceModal?: () => void;
  totalClasses: number;
  totalStudents: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateClass,
  onOpenGoogleWorkspaceModal,
  totalClasses,
  totalStudents,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: TabType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Trang chủ (Dashboard)', description: 'Thống kê tổng quan & hoạt động', icon: LayoutDashboard },
    { id: 'lesson_plan', label: 'AI Soạn giáo án', description: 'Soạn Kế hoạch bài dạy chuẩn CV 5512', icon: BookOpen },
    { id: 'resources', label: 'Kho học liệu', description: 'Hình ảnh, Audio, Video, Youtube', icon: FolderKanban },
    { id: 'lesson_history', label: 'Lịch sử bài soạn', description: 'Nhật ký & quản lý bài đã tạo', icon: History },
    { id: 'dashboard_data', label: 'Dashboard Data SDK', description: 'STT, Giáo viên, Ngày, QR code', icon: Table },
    { id: 'admin', label: 'Admin Security', description: 'Phân quyền & giám sát giáo viên', icon: ShieldCheck },
    { id: 'settings', label: 'Cài đặt & Bản quyền', description: 'Tùy chỉnh & Thông tin tác giả', icon: Settings },
    { id: 'classes', label: 'Lớp học', description: 'Danh sách lớp & học sinh', icon: GraduationCap },
    { id: 'attendance', label: 'Điểm danh', description: 'Điểm danh buổi học', icon: CalendarCheck },
    { id: 'oral_test', label: 'Kiểm tra miệng AI', description: 'Chọn ngẫu nhiên học sinh & Chấm điểm', icon: HelpCircle },
    { id: 'schedule', label: 'Thời khóa biểu', description: 'Lịch dạy & phòng học', icon: Calendar },
    { id: 'grading', label: 'Chấm & Chữa Bài AI', description: 'Trắc nghiệm & tự luận AI', icon: Award },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const userImageUrl = "https://i.ibb.co/JwJRM4ZZ/Picture1.png";

  return (
    <>
      {/* ========================================== */}
      {/* MARQUEE RUNNING BANNER HEADER ACROSS ALL   */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 overflow-hidden relative z-50 border-b border-amber-300/40 shadow-md h-8 flex items-center">
        <div className="whitespace-nowrap flex items-center animate-marquee font-black text-xs tracking-wider">
          <span className="flex items-center gap-2 mx-6">
            <img src={userImageUrl} alt="Logo" className="h-5 w-auto rounded inline-block bg-white p-0.5" referrerPolicy="no-referrer" />
            <span>Anh Sao Khue – AI Lesson Plans- 0346513056</span>
          </span>
          <span className="flex items-center gap-2 mx-6">
            <Sparkles className="w-4 h-4 text-slate-900 inline-block" />
            <span>Trợ Lý AI Soạn Kế Hoạch Bài Dạy Chuẩn Bộ GD&ĐT CV 5512 (Từ Lớp 1 - 12)</span>
          </span>
          <span className="flex items-center gap-2 mx-6">
            <img src={userImageUrl} alt="Logo" className="h-5 w-auto rounded inline-block bg-white p-0.5" referrerPolicy="no-referrer" />
            <span>Anh Sao Khue – AI Lesson Plans- 0346513056</span>
          </span>
          <span className="flex items-center gap-2 mx-6">
            <Sparkles className="w-4 h-4 text-slate-900 inline-block" />
            <span>Bộ Sách Kết Nối Tri Thức Với Cuộc Sống & Tiếng Anh Global Success (Áp dụng 2026-2027)</span>
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE TOP BAR (visible on screens < md)   */}
      {/* ========================================== */}
      <header className="md:hidden bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white sticky top-0 z-40 border-b border-cyan-500/30 shadow-lg">
        <div className="px-4 h-16 flex items-center justify-between">
          {/* Logo & Main Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border-2 border-cyan-300/40 shrink-0">
              <img
                src={userImageUrl}
                alt="Anh Sao Khue"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-cyan-200 uppercase leading-tight">
                ANH SAO KHUE
              </h1>
              <p className="text-[10px] text-cyan-300/90 font-medium">AI Lesson Plans - 0346513056</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-cyan-200 hover:text-white hover:bg-blue-800/60 rounded-xl transition-colors cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="bg-blue-950 border-t border-cyan-500/20 px-4 py-3 space-y-1.5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-cyan-400/40'
                      : 'text-slate-300 hover:bg-blue-900/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 shrink-0 text-cyan-400" />
                    <div className="text-left">
                      <div>{item.label}</div>
                      <div className={`text-[10px] font-normal ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ========================================== */}
      {/* DESKTOP SIDEBAR NAVIGATION (md and larger) */}
      {/* ========================================== */}
      <aside className="hidden md:flex flex-col w-72 bg-gradient-to-b from-blue-950 via-slate-900 to-blue-950 text-white fixed left-0 top-8 bottom-0 z-30 border-r border-blue-900/60 shadow-2xl">
        {/* Animated Title & Brand Banner */}
        <div className="p-4 border-b border-blue-900/80 bg-gradient-to-br from-blue-900/60 via-slate-900 to-indigo-950/80">
          <div className="flex items-center gap-3 mb-2">
            {/* User Avatar Image */}
            <div className="relative group shrink-0">
              <div className="w-12 h-12 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-cyan-400 to-indigo-500 shadow-lg overflow-hidden">
                <img
                  src={userImageUrl}
                  alt="Anh Sao Khue"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl bg-slate-900"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> AI EDUCATION
              </div>
              <h1 className="font-extrabold text-sm text-white tracking-tight leading-snug truncate">
                Anh Sao Khue
              </h1>
              <div className="text-xs font-bold text-cyan-300 truncate">
                AI Lesson Plans
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="mt-2">
            <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border border-cyan-400/30 rounded-xl p-2 text-center shadow-inner">
              <div className="text-[10px] font-extrabold text-cyan-200 tracking-wide">
                BẢN QUYỀN & LIÊN HỆ
              </div>
              <a
                href="tel:0346513056"
                className="inline-flex items-center justify-center gap-1.5 text-amber-300 font-black text-xs tracking-widest hover:text-amber-200 transition-colors mt-0.5"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                <span>0346513056</span>
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-3 scrollbar-thin">
          <div className="px-3 py-1 text-[10px] font-extrabold uppercase text-cyan-300/80 tracking-widest flex items-center justify-between">
            <span>Menu chức năng</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded">PRO</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg ring-1 ring-cyan-400/50'
                    : 'text-slate-300 hover:bg-blue-900/50 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-cyan-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-xs font-bold">{item.label}</div>
                  <div className={`text-[10px] font-normal truncate ${isActive ? 'text-cyan-100' : 'text-slate-400'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Stats & Assistant Callout */}
        <div className="p-3 border-t border-blue-900/80 bg-blue-950/90 space-y-2">
          <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 p-2.5 rounded-xl border border-cyan-500/20 text-center">
            <div className="text-[11px] text-cyan-200 font-bold flex items-center justify-center gap-1">
              <Bot className="w-3.5 h-3.5 text-cyan-300" /> Trợ lý AI Miss Yến còi
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">Soạn bài & Rút kinh nghiệm 24/7</div>
          </div>
        </div>
      </aside>
    </>
  );
};

