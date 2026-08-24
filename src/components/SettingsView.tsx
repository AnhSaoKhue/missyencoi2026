import React, { useState } from 'react';
import {
  Settings,
  User,
  Key,
  Database,
  Download,
  Upload,
  Sparkles,
  HardDrive,
  Globe,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Phone,
  Mail,
  School,
  Award,
  Home,
} from 'lucide-react';
import { TabType } from '../types';

interface TeacherProfile {
  fullName: string;
  email: string;
  phone: string;
  school: string;
  subject: string;
  grade: string;
  geminiApiKey: string;
}

const DEFAULT_PROFILE: TeacherProfile = {
  fullName: 'Cô Hoàng Thị Ánh Tuyết (Miss Yến Còi)',
  email: 'yh2672652@gmail.com',
  phone: '0346513056',
  school: 'Hệ thống Giáo dục Thông minh Ánh Sao Khuê AI',
  subject: 'Khoa học Tự nhiên & STEM - CLIL',
  grade: 'Khối 6, Khối 7, Khối 8, Khối 9',
  geminiApiKey: '',
};

interface SettingsViewProps {
  onNavigateTab?: (tab: TabType) => void;
  onBackToHome?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onNavigateTab,
  onBackToHome,
}) => {
  const [profile, setProfile] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem('ask_teacher_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error'>('success');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ask_teacher_profile', JSON.stringify(profile));
    setStatusMessage('Đã sao lưu & cập nhật thành công Cài đặt hệ thống vào bộ nhớ máy!');
    setStatusType('success');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleExportFullJSON = () => {
    try {
      const allData: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          allData[key] = localStorage.getItem(key);
        }
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `AnhSaoKhue_Full_Backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMessage('Đã xuất toàn bộ dữ liệu cơ sở dữ liệu JSON thành công!');
      setStatusType('success');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage('Lỗi xuất dữ liệu: ' + err.message);
      setStatusType('error');
    }
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        Object.keys(json).forEach((key) => {
          localStorage.setItem(key, json[key]);
        });
        setStatusMessage('Đã phục hồi dữ liệu từ file JSON thành công! Đang tải lại...');
        setStatusType('success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err: any) {
        setStatusMessage('File JSON không hợp lệ: ' + err.message);
        setStatusType('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5" />
              <span>Hệ Thống & Bản Quyền Phần Mềm</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cài Đặt Hệ Thống & Bản Quyền Tác Giả
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Tùy chỉnh thông tin giáo viên, khóa API Gemini AI, sao lưu dữ liệu toàn diện và xuất trọn bộ mã nguồn Full-Stack mới nhất.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(onBackToHome || onNavigateTab) && (
              <button
                type="button"
                onClick={() => (onBackToHome ? onBackToHome() : onNavigateTab && onNavigateTab('dashboard'))}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-2xl border border-slate-700 shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-tight"
                title="Quay lại trang chủ Dashboard"
              >
                <Home className="w-4 h-4 text-orange-400" />
                <span>Quay lại trang chủ</span>
              </button>
            )}

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
              <div className="text-xs font-bold text-amber-300">Phiên Bản</div>
              <div className="text-xl font-black text-white">PRO 3.6.0</div>
              <div className="text-[10px] text-slate-400">Ánh Sao Khuê AI</div>
            </div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
            statusType === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Profile & API Key Form */}
      <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-white">
        <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <User className="w-4 h-4 text-cyan-400" />
          <span>1. Hồ Sơ Giáo Viên & Đơn Vị Công Tác</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Họ và tên giáo viên:</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Đơn vị trường học:</label>
            <input
              type="text"
              value={profile.school}
              onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Môn học phụ trách:</label>
            <input
              type="text"
              value={profile.subject}
              onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Khối lớp giảng dạy:</label>
            <input
              type="text"
              value={profile.grade}
              onChange={(e) => setProfile({ ...profile, grade: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email liên hệ:</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Số điện thoại / Zalo:</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3 pt-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <span>2. Cấu Hình Gemini AI Engine (Tùy Chọn)</span>
        </h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">
            Khóa Gemini API Key cá nhân (Nếu để trống, hệ thống sẽ sử dụng Server AI Backend mặc định):
          </label>
          <input
            type="password"
            value={profile.geminiApiKey}
            onChange={(e) => setProfile({ ...profile, geminiApiKey: e.target.value })}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thông Tin Cài Đặt</span>
          </button>
        </div>
      </form>

      {/* JSON Backup & Restore */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-white">
        <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>3. Sao Lưu & Phục Hồi Dữ Liệu Bộ Nhớ (JSON)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-xs text-slate-200">Xuất file dữ liệu JSON (.json)</div>
            <p className="text-[11px] text-slate-400">
              Lưu toàn bộ danh sách lớp học, học sinh, điểm danh, thời khóa biểu và giáo án đã soạn về máy tính.
            </p>
            <button
              onClick={handleExportFullJSON}
              className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Tải file Backup JSON</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-xs text-slate-200">Nhập dữ liệu từ file JSON</div>
            <p className="text-[11px] text-slate-400">
              Phục hồi lại toàn bộ dữ liệu từ file JSON đã lưu trước đây vào hệ thống.
            </p>
            <label className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Chọn File JSON Để Khôi Phục</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Author & Copyright Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 text-white">
        <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm uppercase tracking-wide">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Thông Tin Tác Giả & Bản Quyền Phần Mềm</span>
        </div>
        <div className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <p>
            <strong>Đơn vị phát triển:</strong> Ánh Sao Khuê AI - Smart Education Ecosystem
          </p>
          <p>
            <strong>Chủ nhiệm tác giả:</strong> Cô Hoàng Thị Ánh Tuyết (Miss Yến Còi)
          </p>
          <p>
            <strong>Hotline & Zalo hỗ trợ kỹ thuật:</strong> <span className="text-cyan-400 font-bold">0346513056</span>
          </p>
          <p>
            <strong>Email:</strong> <span className="text-cyan-400 font-bold">yh2672652@gmail.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};
