import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  googleLogout,
  getCurrentUser,
  getAccessToken,
} from '../lib/googleAuth';
import {
  listDriveFiles,
  readSpreadsheetValues,
  getSpreadsheetDetails,
  createGoogleSheet,
  GoogleFile,
} from '../lib/googleDriveSheets';
import { Classroom } from '../types';
import {
  X,
  FileSpreadsheet,
  HardDrive,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  Sparkles,
  Loader2,
  FolderPlus,
  RefreshCw,
} from 'lucide-react';
import { triggerCelebration } from '../lib/celebration';

interface GoogleWorkspaceIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  classrooms: Classroom[];
  onImportStudentsToClass?: (classId: string, students: Array<{ name: string; code: string; notes: string }>) => void;
}

export const GoogleWorkspaceIntegrationModal: React.FC<GoogleWorkspaceIntegrationModalProps> = ({
  isOpen,
  onClose,
  classrooms,
  onImportStudentsToClass,
}) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Tab mode in Modal
  const [activeTab, setActiveTab] = useState<'drive' | 'import_sheets' | 'export_sheets'>('drive');

  // Drive state
  const [driveFiles, setDriveFiles] = useState<GoogleFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlySpreadsheets, setOnlySpreadsheets] = useState(true);

  // Sheets Import state
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  const [sheetDetails, setSheetDetails] = useState<{ title: string; sheetNames: string[] } | null>(null);
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [targetClassId, setTargetClassId] = useState<string>(classrooms[0]?.id || '');

  // Sheets Export state
  const [exportClassId, setExportClassId] = useState<string>(classrooms[0]?.id || '');
  const [exportTitle, setExportTitle] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);

  // Confirmation Modal for Sheets Creation/Export
  const [confirmExportModal, setConfirmExportModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = initAuth(
        (u, token) => {
          setUser(u);
          setAccessToken(token);
        },
        () => {
          setUser(null);
          setAccessToken(null);
        }
      );
      return () => unsubscribe();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user && accessToken && isOpen) {
      handleLoadDriveFiles();
    }
  }, [user, accessToken, isOpen, onlySpreadsheets]);

  useEffect(() => {
    if (classrooms.length > 0) {
      if (!targetClassId) setTargetClassId(classrooms[0].id);
      if (!exportClassId) setExportClassId(classrooms[0].id);
      const selectedCls = classrooms.find((c) => c.id === exportClassId) || classrooms[0];
      setExportTitle(`Danh sách lớp ${selectedCls.name} - Anh Sao Khue (${new Date().toLocaleDateString('vi-VN')})`);
    }
  }, [classrooms, exportClassId]);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        triggerCelebration('stars');
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Đăng nhập Google thất bại');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setUser(null);
    setAccessToken(null);
    setDriveFiles([]);
  };

  const handleLoadDriveFiles = async (query = searchQuery) => {
    if (!accessToken) return;
    setIsLoadingFiles(true);
    try {
      const files = await listDriveFiles(accessToken, onlySpreadsheets, query);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSelectSheetToPreview = async (fileId: string) => {
    if (!accessToken) return;
    setSelectedSheetId(fileId);
    setIsLoadingPreview(true);
    setPreviewRows([]);
    try {
      const details = await getSpreadsheetDetails(accessToken, fileId);
      setSheetDetails(details);
      const firstSheet = details.sheetNames[0] || 'Sheet1';
      setSelectedSheetName(firstSheet);

      const data = await readSpreadsheetValues(accessToken, fileId, `${firstSheet}!A1:Z30`);
      setPreviewRows(data.values || []);
    } catch (err: any) {
      alert(`Không thể xem trước Google Sheet: ${err.message}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleExecuteImportStudents = () => {
    if (!targetClassId || previewRows.length < 2) {
      alert('Vui lòng chọn tệp Google Sheet có ít nhất 1 hàng tiêu đề và 1 hàng dữ liệu học sinh.');
      return;
    }

    // Skip header (row 0), parse remaining rows
    // Expect Column 0 or 1 to be Name / Code
    const studentsList: Array<{ name: string; code: string; notes: string }> = [];

    const selectedCls = classrooms.find((c) => c.id === targetClassId);
    const prefix = selectedCls ? selectedCls.name.replace(/[^A-Za-z0-9]/g, '') : 'HS';

    for (let i = 1; i < previewRows.length; i++) {
      const row = previewRows[i];
      if (!row || row.length === 0) continue;

      let name = row[0] || '';
      let code = row[1] || '';
      let notes = row[2] || '';

      // If column 0 looks like a code (e.g. HS01), swap with name
      if (name.length < 5 && /\d/.test(name) && row[1]) {
        code = row[0];
        name = row[1];
        notes = row[2] || '';
      }

      if (!name.trim()) continue;

      if (!code.trim()) {
        code = `${prefix}${String(studentsList.length + 1).padStart(2, '0')}`;
      }

      studentsList.push({
        name: name.trim(),
        code: code.trim(),
        notes: notes.trim(),
      });
    }

    if (studentsList.length === 0) {
      alert('Không tìm thấy dữ liệu tên học sinh hợp lệ trong bảng tính.');
      return;
    }

    if (onImportStudentsToClass) {
      onImportStudentsToClass(targetClassId, studentsList);
      triggerCelebration('confetti');
      alert(`Đã nhập thành công ${studentsList.length} học sinh từ Google Sheet vào lớp!`);
      onClose();
    }
  };

  const handlePromptExportToSheets = () => {
    if (!exportClassId || !accessToken) return;
    setConfirmExportModal(true);
  };

  const handleExecuteExportToSheets = async () => {
    setConfirmExportModal(false);
    if (!accessToken || !exportClassId) return;

    const cls = classrooms.find((c) => c.id === exportClassId);
    if (!cls) return;

    setIsExporting(true);
    setExportedSheetUrl(null);

    try {
      const headers = ['STT', 'Mã Học Sinh', 'Họ Và Tên', 'Ghi Chú'];
      const rows = (cls.students || []).map((s, idx) => [
        String(idx + 1),
        s.code || '',
        s.name || '',
        s.notes || '',
      ]);

      const title = exportTitle || `Danh sách lớp ${cls.name}`;
      const result = await createGoogleSheet(accessToken, title, headers, rows);

      setExportedSheetUrl(result.spreadsheetUrl);
      triggerCelebration('confetti');
    } catch (err: any) {
      alert(`Lỗi xuất Google Sheets: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-blue-200 dark:border-blue-900 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white shadow-md">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                <span>Google Workspace & Drive Integration</span>
                <span className="text-xs bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full font-medium border border-cyan-400/30">
                  Google Drive & Sheets
                </span>
              </h2>
              <p className="text-xs text-cyan-200">
                Đồng bộ tệp Google Drive, nhập danh sách học sinh từ Google Sheets & xuất dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* User Account Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            {user ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-10 h-10 rounded-full border-2 border-emerald-500" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                    {user.displayName?.charAt(0) || 'G'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{user.displayName || 'Tài khoản Google'}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Chưa kết nối tài khoản Google. Hãy đăng nhập để truy cập Google Drive & Sheets!</span>
              </div>
            )}

            <div className="w-full sm:w-auto flex justify-end">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Đăng xuất Google
                </button>
              ) : (
                /* Standard Google Material Sign In Button */
                <button
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-xl border border-slate-300 shadow-sm hover:shadow text-sm flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  )}
                  <span>Đăng nhập bằng Google</span>
                </button>
              )}
            </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {user ? (
            <div>
              {/* Internal Tab Navigation */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 mb-4">
                <button
                  onClick={() => setActiveTab('drive')}
                  className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 cursor-pointer ${
                    activeTab === 'drive'
                      ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" /> Google Drive Files
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('import_sheets')}
                  className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 cursor-pointer ${
                    activeTab === 'import_sheets'
                      ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4" /> Nhập học sinh từ Google Sheets
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('export_sheets')}
                  className={`pb-2.5 px-4 font-bold text-sm transition-all border-b-2 cursor-pointer ${
                    activeTab === 'export_sheets'
                      ? 'border-blue-600 text-blue-600 dark:text-cyan-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4" /> Xuất lớp sang Google Sheets
                  </span>
                </button>
              </div>

              {/* TAB 1: GOOGLE DRIVE BROWSER */}
              {activeTab === 'drive' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          handleLoadDriveFiles(e.target.value);
                        }}
                        placeholder="Tìm kiếm tệp trên Google Drive..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlySpreadsheets}
                        onChange={(e) => setOnlySpreadsheets(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>Chỉ hiện Google Sheets</span>
                    </label>

                    <button
                      onClick={() => handleLoadDriveFiles()}
                      className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 transition-colors cursor-pointer"
                      title="Tải lại danh sách"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  {isLoadingFiles ? (
                    <div className="py-12 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Đang tải tệp từ Google Drive...</span>
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                      Không tìm thấy tệp nào trong tài khoản Google Drive.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                      {driveFiles.map((f) => (
                        <div
                          key={f.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 hover:border-blue-500 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{f.name}</div>
                              <div className="text-[10px] text-slate-500">
                                {f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString('vi-VN') : 'Google Sheet'}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                handleSelectSheetToPreview(f.id);
                                setActiveTab('import_sheets');
                              }}
                              className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                            >
                              Nhập bài
                            </button>

                            {f.webViewLink && (
                              <a
                                href={f.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                title="Mở trên Google Drive"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: IMPORT FROM GOOGLE SHEETS */}
              {activeTab === 'import_sheets' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        1. Chọn tệp Google Sheets từ Drive
                      </label>
                      <select
                        value={selectedSheetId}
                        onChange={(e) => handleSelectSheetToPreview(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Chọn bảng tính Google Sheet --</option>
                        {driveFiles.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        2. Chọn lớp học đích cần nhập danh sách
                      </label>
                      <select
                        value={targetClassId}
                        onChange={(e) => setTargetClassId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {classrooms.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} - {cls.subject} ({cls.students?.length || 0} học sinh)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isLoadingPreview ? (
                    <div className="py-8 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Đang đọc bảng tính Google Sheet...</span>
                    </div>
                  ) : previewRows.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Xem trước bảng dữ liệu ({previewRows.length - 1} hàng phát hiện):
                        </div>
                        <span className="text-[11px] text-slate-500">
                          (Hàng đầu làm tiêu đề; Cột 1: Tên, Cột 2: Mã, Cột 3: Ghi chú)
                        </span>
                      </div>

                      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto max-h-52 text-xs">
                        <table className="w-full text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                            <tr>
                              <th className="p-2 border-b border-slate-200 dark:border-slate-700">#</th>
                              <th className="p-2 border-b border-slate-200 dark:border-slate-700">Cột A (Tên)</th>
                              <th className="p-2 border-b border-slate-200 dark:border-slate-700">Cột B (Mã/STT)</th>
                              <th className="p-2 border-b border-slate-200 dark:border-slate-700">Cột C (Ghi chú)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {previewRows.slice(0, 10).map((row, idx) => (
                              <tr
                                key={idx}
                                className={idx === 0 ? 'bg-amber-500/10 font-bold text-amber-900 dark:text-amber-200' : 'border-b border-slate-100 dark:border-slate-800'}
                              >
                                <td className="p-2 text-slate-400">{idx === 0 ? 'Tiêu đề' : idx}</td>
                                <td className="p-2">{row[0] || '-'}</td>
                                <td className="p-2">{row[1] || '-'}</td>
                                <td className="p-2">{row[2] || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        onClick={handleExecuteImportStudents}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Xác nhận nhập học sinh vào lớp học</span>
                      </button>
                    </div>
                  ) : selectedSheetId ? (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-center text-xs text-slate-500">
                      Bảng tính rỗng hoặc chưa có quyền đọc.
                    </div>
                  ) : null}
                </div>
              )}

              {/* TAB 3: EXPORT TO GOOGLE SHEETS */}
              {activeTab === 'export_sheets' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Chọn lớp học cần xuất
                      </label>
                      <select
                        value={exportClassId}
                        onChange={(e) => setExportClassId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {classrooms.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.students?.length || 0} học sinh)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Tên tệp Google Sheets mới
                      </label>
                      <input
                        type="text"
                        value={exportTitle}
                        onChange={(e) => setExportTitle(e.target.value)}
                        placeholder="Nhập tên bảng tính..."
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-cyan-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Xuất trực tiếp lên tài khoản Google Drive:
                    </div>
                    <div>• Tự động khởi tạo tệp Google Sheets với tiêu đề chuẩn mực.</div>
                    <div>• Lưu danh sách STT, Mã Học Sinh, Họ & Tên và Ghi chú đầy đủ.</div>
                  </div>

                  <button
                    onClick={handlePromptExportToSheets}
                    disabled={isExporting}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Đang tạo Google Sheet trên Drive...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Tạo Google Sheet ngay bây giờ</span>
                      </>
                    )}
                  </button>

                  {exportedSheetUrl && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <div>
                          <div className="font-bold">Đã tạo Google Sheet thành công!</div>
                          <div>Tệp đã được lưu trên Google Drive của Thầy/Cô.</div>
                        </div>
                      </div>
                      <a
                        href={exportedSheetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors shrink-0"
                      >
                        <span>Mở Google Sheet</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <FolderPlus className="w-12 h-12 text-blue-400 mx-auto animate-bounce" />
              <div className="text-base font-bold text-slate-800 dark:text-slate-100">
                Hãy đăng nhập tài khoản Google của Thầy/Cô
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Sau khi đăng nhập, Thầy/Cô có thể dễ dàng quản lý các tệp trên Google Drive, nhập danh sách học sinh từ Google Sheets và tạo báo cáo lưu trữ tự động.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Destructive/Creation Google Workspace Operations */}
      {confirmExportModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-blue-600 dark:text-cyan-400">
              <FileSpreadsheet className="w-7 h-7" />
              <h3 className="text-lg font-bold">Xác nhận tạo Google Sheet mới</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Thầy/cô có muốn tạo tệp Google Sheet tên <span className="font-bold text-slate-900 dark:text-white">"{exportTitle}"</span> trực tiếp trên tài khoản Google Drive của mình không?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmExportModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteExportToSheets}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Xác nhận tạo tệp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
