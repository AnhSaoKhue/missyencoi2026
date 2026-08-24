import React, { useState, useEffect } from 'react';
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
  Pencil,
  Trash2,
  UserPlus,
  X,
  Save,
  Shield,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { LessonPlan, UserRole, TabType } from '../types';

export type ExtendedRole = 'admin' | 'head_of_department' | 'teacher' | 'homeroom_teacher' | 'staff' | 'student';

export interface TeacherAccount {
  uid: string;
  name: string;
  email: string;
  subject: string;
  school: string;
  role: ExtendedRole;
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

const ROLE_LABELS: Record<ExtendedRole, { label: string; color: string; bg: string; border: string }> = {
  admin: {
    label: 'Quản trị viên (Admin)',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  head_of_department: {
    label: 'Tổ trưởng chuyên môn',
    color: 'text-purple-300',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  teacher: {
    label: 'Giáo viên bộ môn',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  homeroom_teacher: {
    label: 'Giáo viên chủ nhiệm',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  staff: {
    label: 'Cán bộ / Nhân viên',
    color: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  student: {
    label: 'Học sinh / Học viên',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
  },
};

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
    role: 'head_of_department',
    lastLogin: 'Hôm nay 08:30',
    status: 'active',
    plansCount: 12,
  },
  {
    uid: 'TCH-003',
    name: 'Cô Trần Thị Mai',
    email: 'mai.tran@edu.vn',
    subject: 'Ngữ văn & KHXH',
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    role: 'homeroom_teacher',
    lastLogin: 'Hôm qua 16:45',
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
    timestamp: 'Hôm nay 14:15:22',
    user: 'Miss Yến Còi (Admin)',
    action: 'Đăng nhập thành công qua mã PIN bảo mật',
    status: 'success',
    ipAddress: '192.168.1.10 (Hà Nội, VN)',
  },
  {
    id: 'LOG-102',
    timestamp: 'Hôm nay 12:40:10',
    user: 'Thầy Nguyễn Văn An',
    action: 'Tạo mới giáo án CV 5512 môn Toán 6',
    status: 'info',
    ipAddress: '113.190.23.45 (Đà Nẵng, VN)',
  },
  {
    id: 'LOG-103',
    timestamp: 'Hôm nay 10:20:05',
    user: 'Hệ thống tự động',
    action: 'Kiểm tra sao lưu cơ sở dữ liệu định kỳ',
    status: 'success',
    ipAddress: 'Server Internal (Cloud Engine)',
  },
];

export const AdminView: React.FC<AdminViewProps> = ({
  lessonPlans,
  onNavigateTab,
  onBackToHome,
}) => {
  const [teachers, setTeachers] = useState<TeacherAccount[]>(() => {
    try {
      const saved = localStorage.getItem('ASK_ADMIN_USERS');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TEACHERS;
  });

  const [logs, setLogs] = useState<SecurityLog[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeacherAccount | null>(null);
  const [formData, setFormData] = useState<{
    uid: string;
    name: string;
    email: string;
    subject: string;
    school: string;
    role: ExtendedRole;
    status: 'active' | 'locked';
  }>({
    uid: '',
    name: '',
    email: '',
    subject: '',
    school: '',
    role: 'teacher',
    status: 'active',
  });

  // Delete confirmation modal state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<TeacherAccount | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ASK_ADMIN_USERS', JSON.stringify(teachers));
    } catch (e) {
      console.error(e);
    }
  }, [teachers]);

  const addLog = (user: string, action: string, status: 'success' | 'warning' | 'info' = 'info') => {
    const newLog: SecurityLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user,
      action,
      status,
      ipAddress: 'Client Session (Hệ thống)',
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Open modal for Adding new user
  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFormData({
      uid: `TCH-${String(teachers.length + 1).padStart(3, '0')}`,
      name: '',
      email: '',
      subject: 'Toán học & Khoa học Tự nhiên',
      school: 'Hệ thống Giáo dục Ánh Sao Khuê AI',
      role: 'teacher',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  // Open modal for Editing existing user
  const handleOpenEditModal = (user: TeacherAccount) => {
    setEditingUser(user);
    setFormData({
      uid: user.uid,
      name: user.name,
      email: user.email,
      subject: user.subject,
      school: user.school,
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  // Save Add/Edit user
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập họ và tên!');
      return;
    }

    if (editingUser) {
      // Update existing
      setTeachers((prev) =>
        prev.map((t) =>
          t.uid === editingUser.uid
            ? {
                ...t,
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                school: formData.school.trim(),
                role: formData.role,
                status: formData.status,
              }
            : t
        )
      );
      addLog('Quản trị viên', `Đã cập nhật thông tin và phân quyền cho "${formData.name}" (${ROLE_LABELS[formData.role].label})`, 'success');
      showNotification(`Đã cập nhật thông tin và phân quyền cho "${formData.name}" thành công!`);
    } else {
      // Create new
      const newUser: TeacherAccount = {
        uid: formData.uid || `TCH-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim() || `user_${Date.now()}@anhsaokhue.edu.vn`,
        subject: formData.subject.trim() || 'Chưa phân công',
        school: formData.school.trim() || 'Hệ thống Giáo dục Ánh Sao Khuê AI',
        role: formData.role,
        lastLogin: 'Mới tạo tài khoản',
        status: formData.status,
        plansCount: 0,
      };
      setTeachers((prev) => [newUser, ...prev]);
      addLog('Quản trị viên', `Đã thêm đối tượng phân quyền mới: "${newUser.name}" với vai trò ${ROLE_LABELS[newUser.role].label}`, 'success');
      showNotification(`Đã thêm mới đối tượng "${newUser.name}" vào danh sách phân quyền!`);
    }

    setIsModalOpen(false);
  };

  // Delete user handler
  const handleConfirmDelete = () => {
    if (!deleteConfirmUser) return;
    setTeachers((prev) => prev.filter((t) => t.uid !== deleteConfirmUser.uid));
    addLog('Quản trị viên', `Đã xóa đối tượng / tài khoản "${deleteConfirmUser.name}" (${deleteConfirmUser.uid})`, 'warning');
    showNotification(`Đã xóa tài khoản "${deleteConfirmUser.name}" khỏi hệ thống!`);
    setDeleteConfirmUser(null);
  };

  // Toggle user status (active / locked)
  const toggleTeacherStatus = (uid: string) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.uid === uid) {
          const newStatus: 'active' | 'locked' = t.status === 'active' ? 'locked' : 'active';
          addLog('Quản trị viên', `Đã chuyển trạng thái "${t.name}" sang ${newStatus === 'active' ? 'Hoạt động' : 'Tạm khóa'}`, 'info');
          return { ...t, status: newStatus };
        }
        return t;
      })
    );
    showNotification(`Đã thay đổi trạng thái kích hoạt tài khoản!`);
  };

  // Quick change role directly
  const handleQuickRoleChange = (uid: string, newRole: ExtendedRole) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.uid === uid) {
          addLog('Quản trị viên', `Đổi vai trò "${t.name}" thành ${ROLE_LABELS[newRole].label}`, 'info');
          return { ...t, role: newRole };
        }
        return t;
      })
    );
    showNotification(`Đã thay đổi phân quyền đối tượng thành công!`);
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.school.toLowerCase().includes(searchQuery.toLowerCase());
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
              <span>Admin Security & Dynamic Role Permission Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Trung Tâm Quản Trị & Phân Quyền Hệ Thống
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Quản lý danh sách giáo viên, chỉnh sửa phân quyền linh hoạt theo từng đối tượng, thêm mới hoặc xóa đối tượng và giám sát nhật ký an toàn bảo mật.
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

            <button
              onClick={handleOpenAddModal}
              className="px-4 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-tight"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Đối Tượng Mới</span>
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Teachers List & Security Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Teachers Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                    Danh Sách Đối Tượng & Phân Quyền Linh Hoạt
                  </h3>
                  <p className="text-[11px] text-slate-400">Tổng cộng {teachers.length} tài khoản trong hệ thống</p>
                </div>
              </div>

              {/* Search & Filter & Add Button */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm đối tượng, môn..."
                    className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  style={{ color: '#ffffff', backgroundColor: '#020617' }}
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="head_of_department">Tổ trưởng chuyên môn</option>
                  <option value="homeroom_teacher">Giáo viên chủ nhiệm</option>
                  <option value="teacher">Giáo viên bộ môn</option>
                  <option value="staff">Cán bộ / Nhân viên</option>
                  <option value="student">Học sinh / Học viên</option>
                </select>
                <button
                  onClick={handleOpenAddModal}
                  className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Thêm đối tượng mới"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Teachers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 bg-slate-950/60">
                    <th className="p-3 font-semibold">Đối Tượng / Họ Tên</th>
                    <th className="p-3 font-semibold">Chuyên Môn & Đơn Vị</th>
                    <th className="p-3 font-semibold">Vai Trò Phân Quyền</th>
                    <th className="p-3 font-semibold">Trạng Thái</th>
                    <th className="p-3 font-semibold text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500 text-xs">
                        Không tìm thấy đối tượng nào phù hợp với bộ lọc tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((tch) => {
                      const roleConfig = ROLE_LABELS[tch.role] || ROLE_LABELS.teacher;
                      return (
                        <tr key={tch.uid} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{tch.name}</span>
                              {tch.role === 'admin' && (
                                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Quản trị viên" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{tch.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-200 font-medium">{tch.subject}</span>
                            <div className="text-[10px] text-slate-500">{tch.school}</div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <select
                                value={tch.role}
                                onChange={(e) => handleQuickRoleChange(tch.uid, e.target.value as ExtendedRole)}
                                className={`px-2 py-1 rounded-lg font-bold text-[10px] border outline-none cursor-pointer bg-slate-950 ${roleConfig.color} ${roleConfig.border}`}
                              >
                                <option value="admin">Quản trị viên (Admin)</option>
                                <option value="head_of_department">Tổ trưởng chuyên môn</option>
                                <option value="homeroom_teacher">Giáo viên chủ nhiệm</option>
                                <option value="teacher">Giáo viên bộ môn</option>
                                <option value="staff">Cán bộ / Nhân viên</option>
                                <option value="student">Học sinh / Học viên</option>
                              </select>
                            </div>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => toggleTeacherStatus(tch.uid)}
                              className={`px-2.5 py-1 rounded-full font-bold text-[10px] transition-all cursor-pointer flex items-center gap-1 w-fit ${
                                tch.status === 'active'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                              }`}
                              title="Bấm để bật/tắt kích hoạt tài khoản"
                            >
                              {tch.status === 'active' ? (
                                <>
                                  <UserCheck className="w-3 h-3" />
                                  <span>Hoạt động</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3 h-3" />
                                  <span>Tạm khóa</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit Button */}
                              <button
                                onClick={() => handleOpenEditModal(tch)}
                                className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/40 hover:border-blue-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Chỉnh sửa thông tin và phân quyền đối tượng"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Chỉnh sửa</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setDeleteConfirmUser(tch)}
                                className="px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 hover:border-rose-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Xóa đối tượng khỏi danh sách phân quyền"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
                  Nhật Ký An Ninh & Thao Tác
                </h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                Trực tiếp
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-200">{log.user}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{log.action}</p>
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
              <span>Chính Sách Phân Quyền Đối Tượng</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>Quản trị viên:</strong> Toàn quyền cấu hình hệ thống, quản lý tài khoản và duyệt giáo án.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Tổ trưởng chuyên môn:</strong> Duyệt giáo án 5512 của tổ, xem báo cáo điểm danh và học liệu.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong>Giáo viên bộ môn / Chủ nhiệm:</strong> Soạn giáo án AI, điểm danh, chấm bài, kiểm tra miệng.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-white animate-scaleIn">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  {editingUser ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">
                    {editingUser ? 'Chỉnh Sửa Phân Quyền Đối Tượng' : 'Thêm Mới Đối Tượng Phân Quyền'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingUser ? `Mã đối tượng: ${editingUser.uid}` : 'Khởi tạo tài khoản và gán vai trò truy cập'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Họ và tên đối tượng <span className="text-rose-400">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Thầy Trần Quang Khải..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  style={{ color: '#ffffff', backgroundColor: '#020617' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Địa chỉ Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@anhsaokhue.edu.vn"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Chuyên môn / Bộ môn:</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ví dụ: Tin học, Tiếng Anh..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Đơn vị / Trường học:</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  placeholder="Ví dụ: Hệ thống Giáo dục Ánh Sao Khuê AI..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  style={{ color: '#ffffff', backgroundColor: '#020617' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Vai trò & Phân quyền:</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as ExtendedRole })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    style={{ backgroundColor: '#020617' }}
                  >
                    <option value="admin">Quản trị viên (Admin)</option>
                    <option value="head_of_department">Tổ trưởng chuyên môn</option>
                    <option value="homeroom_teacher">Giáo viên chủ nhiệm</option>
                    <option value="teacher">Giáo viên bộ môn</option>
                    <option value="staff">Cán bộ / Nhân viên</option>
                    <option value="student">Học sinh / Học viên</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Trạng thái hoạt động:</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    style={{ color: '#ffffff', backgroundColor: '#020617' }}
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="locked">Tạm khóa tài khoản</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingUser ? 'Lưu Thay Đổi' : 'Tạo Đối Tượng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-white animate-scaleIn">
            <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-rose-950/40">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Xác Nhận Xóa Đối Tượng</h3>
                <p className="text-[11px] text-rose-300">Hành động này không thể khôi phục tự động</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300">
              <p>
                Thầy/Cô có chắc chắn muốn xóa đối tượng phân quyền{' '}
                <strong className="text-white">"{deleteConfirmUser.name}"</strong> (Email:{' '}
                <span className="font-mono text-cyan-300">{deleteConfirmUser.email}</span>) khỏi hệ thống không?
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                Vai trò hiện tại: <strong className="text-amber-300">{ROLE_LABELS[deleteConfirmUser.role]?.label}</strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xác Nhận Xóa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
