import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Key,
  Activity,
  UserCheck,
  UserX,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Laptop,
  Check,
  Home,
} from 'lucide-react';
import { LessonPlan, UserRole, TabType } from '../types';

interface TeacherAccount {
  uid: string;
  name: string;
  email: string;
  subject: string;
  school: string;
  role: UserRole;
  lastLogin: string;
  status: 'active' | 'locked';
  plansCount: number;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'success' | 'warning' | 'info';
  ipAddress: string;
}

interface AdminViewProps {
  lessonPlans: LessonPlan[];
  onNavigateTab?: (tab: TabType) => void;
  onBackToHome?: () => void;
}

const INITIAL_TEACHERS: TeacherAccount[] = [
  {
    uid: 'TCH-001',
    name: 'Cô Hoàng Thị Ánh Tuyết (Miss Yến Còi)',
    email: 'yh2672652@gmail.com',
    subject: 'Khoa học Tự nhiên & STEM',
    school: 'Hệ thống Giáo dục Ánh Sao Khuê AI',
    role: 'admin',
    lastLogin: 'Vừa mới đây (Hôm nay)',
    status: 'active',
    plansCount: 18,
  },
  {
    uid: 'TCH-002',
    name: 'Thầy Nguyễn Văn An',
    email: 'an.nguyen@edu.vn',
    subject: 'Toán học & Tin học',
    school: 'THCS Lê Quý Đôn',
    role: 'teacher',
    lastLogin: '14/08/2026 08:30',
    status: 'active',
    plansCount: 12,
  },
  {
    uid: 'TCH-003',
    name: 'Cô Trần Thị Mai',
    email: 'mai.tran@edu.vn',
    subject: 'Ngữ văn & KHXH',
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    role: 'teacher',
    lastLogin: '13/08/2026 16:45',
    status: 'active',
    plansCount: 9,
  },
  {
    uid: 'TCH-004',
    name: 'Thầy Lê Hoàng Long',
    email: 'long.le@edu.vn',
    subject: 'Tiếng Anh CLIL',
    school: 'THCS Chu Văn An',
    role: 'teacher',
    lastLogin: '12/08/2026 14:20',
    status: 'active',
    plansCount: 15,
  },
];

const INITIAL_LOGS: SecurityLog[] = [
  {
    id: 'LOG-101',
    timestamp: '14/08/2026 14:15:22',
    user: 'Miss Yến Còi (Admin)',
    action: 'Đăng nhập thành công qua mã PIN ASK2002',
    status: 'success',
    ipAddress: '192.168.1.10 (Hà Nội, VN)',
  },
  {
    id: 'LOG-102',
    timestamp: '14/08/2026 12:40:10',
    user: 'Thầy Nguyễn Văn An',
    action: 'Tạo mới giáo án CV 5512 môn Toán 6',
    status: 'info',
    ipAddress: '113.190.23.45 (Đà Nẵng, VN)',
  },
  {
    id: 'LOG-103',
    timestamp: '14/08/2026 10:20:05',
    user: 'Hệ thống tự động',
    action: 'Kiểm tra sao lưu cơ sở dữ liệu định kỳ',
    status: 'success',
    ipAddress: 'Server Internal (Cloud Engine)',
  },
  {
    id: 'LOG-104',
    timestamp: '13/08/2026 18:32:15',
    user: 'Khách vãng lai (Guest)',
    action: 'Nhập sai mã PIN Admin 1 lần (Đã chặn)',
    status: 'warning',
    ipAddress: '14.232.102.88 (Hồ Chí Minh, VN)',
  },
];

export const AdminView: React.FC<AdminViewProps> = ({
  lessonPlans,
  onNavigateTab,
  onBackToHome,
}) => {
  const [teachers, setTeachers] = useState<TeacherAccount[]>(INITIAL_TEACHERS);
  const [logs] = useState<SecurityLog[]>(INITIAL_LOGS);
  const [activeRole, setActiveRole] = useState<UserRole>('admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'teacher'>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleTeacherRole = (uid: string) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.uid === uid) {
          const newRole: UserRole = t.role === 'admin' ? 'teacher' : 'admin';
          return { ...t, role: newRole };
        }
        return t;
      })
    );
    setSuccessMsg(`Đã cập nhật phân quyền tài khoản thành công!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleTeacherStatus = (uid: string) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.uid === uid) {
          const newStatus: 'active' | 'locked' = t.status === 'active' ? 'locked' : 'active';
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
    setSuccessMsg(`Đã thay đổi trạng thái kích hoạt tài khoản!`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || t.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Security & Role Permission Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trung Tâm Quản Trị & Bảo Mật Hệ Thống
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Giám sát an toàn bảo mật, quản lý danh sách giáo viên, phân quyền truy cập và kiểm tra nhật ký truy cập hệ thống Ánh Sao Khuê AI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {(onBackToHome || onNavigateTab) && (
              <button
                type="button"
                onClick={() => (onBackToHome ? onBackToHome() : onNavigateTab && onNavigateTab('dashboard'))}
                className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-2xl border border-slate-700 shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-tight"
                title="Quay lại trang chủ Dashboard"
              >
                <Home className="w-4 h-4 text-orange-400" />
                <span>Quay lại trang chủ</span>
              </button>
            )}

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
              <div className="text-2xl font-black text-cyan-400">{teachers.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Tài khoản</div>
            </div>
            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
              <div className="text-2xl font-black text-amber-400">{lessonPlans.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Giáo án hệ thống</div>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveRole('admin')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeRole === 'admin'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Quản Trị Viên (Admin View)</span>
        </button>
        <button
          onClick={() => setActiveRole('teacher')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeRole === 'teacher'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Giáo Viên (Teacher View)</span>
        </button>
      </div>

      {/* Main Grid: Teachers List & Security Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Teachers Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                  Danh Sách Giáo Viên & Phân Quyền
                </h3>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm giáo viên, email..."
                    className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="all">Tất cả quyền</option>
                  <option value="admin">Admin</option>
                  <option value="teacher">Giáo viên</option>
                </select>
              </div>
            </div>

            {/* Teachers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/50">
                    <th className="p-3 font-semibold">Giáo Viên</th>
                    <th className="p-3 font-semibold">Chuyên Môn</th>
                    <th className="p-3 font-semibold">Vai Trò</th>
                    <th className="p-3 font-semibold">Trạng Thái</th>
                    <th className="p-3 font-semibold text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTeachers.map((tch) => (
                    <tr key={tch.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-white">{tch.name}</div>
                        <div className="text-[11px] text-slate-400">{tch.email}</div>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-300 font-medium">{tch.subject}</span>
                        <div className="text-[10px] text-slate-500">{tch.school}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                            tch.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {tch.role === 'admin' ? 'Quản trị viên' : 'Giáo viên'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tch.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {tch.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => toggleTeacherRole(tch.uid)}
                          title="Đổi vai trò Admin / Giáo viên"
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-slate-300 hover:text-white transition-colors"
                        >
                          Đổi quyền
                        </button>
                        <button
                          onClick={() => toggleTeacherStatus(tch.uid)}
                          title="Khóa / Mở khóa tài khoản"
                          className={`p-1.5 rounded-lg border transition-colors ${
                            tch.status === 'active'
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {tch.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Security Logs & Audit */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">
                  Nhật Ký An Ninh & Truy Cập
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                Trực tiếp
              </span>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200">{log.user}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{log.action}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-0.5">
                    <Laptop className="w-3 h-3 text-cyan-400" />
                    <span>IP: {log.ipAddress}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Chính Sách Bảo Mật Hệ Thống</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Mã hóa AES cho dữ liệu sao lưu cục bộ.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Yêu cầu mã PIN khi truy cập khu vực nhạy cảm.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Tự động chặn truy cập bất thường sau 5 lần thử sai.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
