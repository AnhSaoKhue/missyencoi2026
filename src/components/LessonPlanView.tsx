import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Clock,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Printer,
  Sparkles,
  School,
  FileText,
  Save,
  RotateCcw,
  Cpu,
  Globe,
  Download,
  QrCode,
  UserCheck,
  Award,
  Zap,
  Volume2,
  Mic,
  Image as ImageIcon,
  Layers,
  Target,
  Loader2,
} from 'lucide-react';
import { Classroom, LessonPlan, TabType, BilingualSection } from '../types';
import { AudioPracticePlayer } from './AudioPracticePlayer';
import { LessonIllustration } from './LessonIllustration';
import { exportLessonPlanToWord, exportLessonPlanToPDF } from '../utils/exportHelpers';
import { QRCodeModal } from './QRCodeModal';
import { COMPREHENSIVE_SUBJECTS } from '../constants';

interface LessonPlanViewProps {
  classrooms: Classroom[];
  lessonPlans: LessonPlan[];
  onAddLessonPlan: (plan: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'>) => LessonPlan;
  onUpdateLessonPlan: (plan: LessonPlan) => void;
  onDeleteLessonPlan: (id: string) => void;
  onNavigateTab?: (tab: TabType) => void;
  initialMode?: 'create' | 'list';
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({
  classrooms,
  lessonPlans,
  onAddLessonPlan,
  onUpdateLessonPlan,
  onDeleteLessonPlan,
  onNavigateTab,
  initialMode,
}) => {
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedTextbookFilter, setSelectedTextbookFilter] = useState('ALL');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Modal states
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'duplicate' | null>(initialMode === 'create' ? 'create' : null);
  const [activePlan, setActivePlan] = useState<LessonPlan | null>(null);
  const [viewDetailPlan, setViewDetailPlan] = useState<LessonPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<LessonPlan | null>(null);
  const [qrPlan, setQrPlan] = useState<LessonPlan | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper for live editable signatures in View Detail modal
  const updateDetailSignatureField = (field: keyof LessonPlan, value: any) => {
    if (!viewDetailPlan) return;
    const updated = { ...viewDetailPlan, [field]: value };
    setViewDetailPlan(updated);
    onUpdateLessonPlan(updated);
  };

  // Extract unique subjects for filtering
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    COMPREHENSIVE_SUBJECTS.forEach((s) => set.add(s));
    classrooms.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    lessonPlans.forEach((lp) => {
      if (lp.subject) set.add(lp.subject);
    });
    return Array.from(set);
  }, [classrooms, lessonPlans]);

  // Form states for modal
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Toán',
    classId: classrooms[0]?.id || '',
    className: classrooms[0]?.name || '',
    prepDate: new Date().toISOString().split('T')[0],
    teachDate: new Date().toISOString().split('T')[0],
    periodsCount: 1,
    status: 'ready' as 'draft' | 'ready' | 'completed',
    gradeLevel: 'THCS - Khối 7',
    textbookSet: 'Kết nối tri thức với cuộc sống' as 'Kết nối tri thức với cuộc sống' | 'Tiếng Anh Global Success',
    digitalCompetencies: '[NLS1.1] Sử dụng thiết bị số & phần mềm dạy học.\n[NLS2.3] Khai thác và đánh giá dữ liệu học liệu số.\n[NLS5.2] Giải quyết vấn đề bài học bằng công cụ AI Miss Yến Còi & mô phỏng.',
    devicesAndSoftware: 'Thiết bị: Máy tính, Bảng tương tác Smartboard, Micro thu âm song ngữ.\nPhần mềm: GeoGebra, Canva Education, PhET, Quizizz, AI Miss Yến Còi.',
    objectives: '',
    keyKnowledge: '',
    warmupActivity: '',
    newLessonActivity: '',
    practiceActivity: '',
    lowApplicationActivity: '',
    highApplicationActivity: '',
    consolidationActivity: '',
    homeworkActivity: '',
    projectActivity: '',
    teacherActivity: '',
    studentActivity: '',
    illustrationImage: '',
    illustrationTitle: '',
    exercises: '',
    notes: '',
    // Bilingual Segment
    enableBilingual: true,
    bilingualTitle: 'Phân đoạn giảng dạy Song ngữ Tiếng Anh',
    bilingualEnglish: 'Two quantities x and y are directly proportional if y = kx for a non-zero constant k.',
    bilingualVietnamese: 'Hai đại lượng x và y tỷ lệ thuận với nhau nếu y = kx với k là hằng số khác 0.',
    bilingualTermsRaw: 'Directly Proportional | /daɪˈrektli prəˈpɔːrʃənl/ | Tỷ lệ thuận\nConstant | /ˈkɑːnstənt/ | Hằng số',
    // Signatures & Approval
    teacherName: localStorage.getItem('sys_teacher_name') || 'Cô Nguyễn Thị Hồng Yến',
    headOfDepartmentReview: 'Bài soạn đạt chuẩn Công văn 5512, tích hợp năng lực số tốt, đảm bảo thời lượng.',
    headOfDepartmentStatus: 'Đã duyệt' as 'Chưa duyệt' | 'Đã duyệt' | 'Yêu cầu sửa',
    headOfDepartmentName: 'Trần Thị Tổ Trưởng',
    headOfDepartmentSignDate: new Date().toISOString().split('T')[0],
    schoolBoardReview: 'Đồng ý duyệt cho phép áp dụng giảng dạy chính thức.',
    schoolBoardStatus: 'Đã duyệt' as 'Chưa duyệt' | 'Đã duyệt' | 'Yêu cầu sửa',
    schoolBoardName: 'Lê Văn Hiệu Trưởng',
    schoolBoardSignDate: new Date().toISOString().split('T')[0],
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Sync Teacher Name from System Settings Event
  useEffect(() => {
    const handleSyncSettings = () => {
      const savedTeacher = localStorage.getItem('sys_teacher_name');
      if (savedTeacher) {
        setFormData((prev) => ({ ...prev, teacherName: savedTeacher }));
      }
    };
    window.addEventListener('app_settings_updated', handleSyncSettings);
    return () => window.removeEventListener('app_settings_updated', handleSyncSettings);
  }, []);

  // Direct Print Handler
  const handleDirectPrint = (plan: LessonPlan) => {
    setViewDetailPlan(plan);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Auto Select Textbook based on Subject
  const handleSubjectChange = (newSubject: string) => {
    const isEnglish = newSubject.toLowerCase().includes('tiếng anh') || newSubject.toLowerCase().includes('english');
    const defaultBook = isEnglish ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống';
    setFormData((prev) => ({
      ...prev,
      subject: newSubject,
      textbookSet: defaultBook,
      enableBilingual: isEnglish ? true : prev.enableBilingual,
    }));
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const defaultClass = classrooms[0];
    const defaultSub = defaultClass?.subject || 'Toán';
    const isEnglish = defaultSub.toLowerCase().includes('tiếng anh');

    setFormData({
      title: '',
      subject: defaultSub,
      classId: defaultClass?.id || '',
      className: defaultClass?.name || '',
      prepDate: new Date().toISOString().split('T')[0],
      teachDate: new Date().toISOString().split('T')[0],
      periodsCount: 1,
      status: 'ready',
      gradeLevel: 'THCS - Khối 7',
      textbookSet: isEnglish ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống',
      digitalCompetencies: '[NLS1.1] Vận dụng thiết bị kỹ thuật số trong giảng dạy.\n[NLS2.3] Thu thập dữ liệu mô phỏng bài học.\n[NLS5.2] Giải quyết vấn đề bằng công nghệ AI.',
      devicesAndSoftware: 'Thiết bị: Máy tính GV/HS, Bảng tương tác, Micro thu âm song ngữ.\nPhần mềm: GeoGebra, Canva, PhET, AI Miss Yến Còi.',
      objectives: '',
      keyKnowledge: '',
      warmupActivity: '',
      newLessonActivity: '',
      practiceActivity: '',
      lowApplicationActivity: '',
      highApplicationActivity: '',
      consolidationActivity: '',
      homeworkActivity: '',
      projectActivity: '',
      teacherActivity: '',
      studentActivity: '',
      illustrationImage: '',
      illustrationTitle: '',
      exercises: '',
      notes: '',
      enableBilingual: isEnglish,
      bilingualTitle: 'Phân đoạn giảng dạy Song ngữ Tiếng Anh',
      bilingualEnglish: 'Key concept explained in English with clear terminology.',
      bilingualVietnamese: 'Khái niệm trọng tâm được giải thích bằng tiếng Anh kèm từ vựng chuyên ngành.',
      bilingualTermsRaw: 'Vocabulary | /vəˈkæbjəleri/ | Từ vựng\nPronunciation | /prəˌnʌnsiˈeɪʃn/ | Phát âm',
      teacherName: localStorage.getItem('sys_teacher_name') || 'Cô Nguyễn Thị Hồng Yến',
      headOfDepartmentReview: 'Bài soạn đạt chuẩn Công văn 5512, tích hợp năng lực số tốt.',
      headOfDepartmentStatus: 'Đã duyệt',
      headOfDepartmentName: 'Trần Thị Tổ Trưởng',
      headOfDepartmentSignDate: new Date().toISOString().split('T')[0],
      schoolBoardReview: 'Đồng ý duyệt cho phép giảng dạy.',
      schoolBoardStatus: 'Đã duyệt',
      schoolBoardName: 'Lê Văn Hiệu Trưởng',
      schoolBoardSignDate: new Date().toISOString().split('T')[0],
    });
    setFormError(null);
    setActivePlan(null);
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: LessonPlan) => {
    setActivePlan(plan);
    const b = plan.bilingualSection;
    const termsStr = b?.keyTerms ? b.keyTerms.map((t) => `${t.word} | ${t.ipa || ''} | ${t.meaning}`).join('\n') : '';

    setFormData({
      title: plan.title,
      subject: plan.subject,
      classId: plan.classId,
      className: plan.className,
      prepDate: plan.prepDate || plan.date,
      teachDate: plan.teachDate || plan.date,
      periodsCount: plan.periodsCount || 1,
      status: plan.status || 'ready',
      gradeLevel: plan.gradeLevel || 'THCS - Khối 7',
      textbookSet: (plan.textbookSet as any) || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống'),
      digitalCompetencies: plan.digitalCompetencies || '',
      devicesAndSoftware: plan.devicesAndSoftware || '',
      objectives: plan.objectives || '',
      keyKnowledge: plan.keyKnowledge || '',
      warmupActivity: plan.warmupActivity || '',
      newLessonActivity: plan.newLessonActivity || '',
      practiceActivity: plan.practiceActivity || '',
      lowApplicationActivity: plan.lowApplicationActivity || '',
      highApplicationActivity: plan.highApplicationActivity || '',
      consolidationActivity: plan.consolidationActivity || '',
      homeworkActivity: plan.homeworkActivity || '',
      projectActivity: plan.projectActivity || '',
      teacherActivity: plan.teacherActivity || '',
      studentActivity: plan.studentActivity || '',
      illustrationImage: plan.illustrationImage || '',
      illustrationTitle: plan.illustrationTitle || '',
      exercises: plan.exercises || '',
      notes: plan.notes || '',
      enableBilingual: !!b,
      bilingualTitle: b?.title || 'Phân đoạn giảng dạy Song ngữ Tiếng Anh',
      bilingualEnglish: b?.englishContent || '',
      bilingualVietnamese: b?.vietnameseTranslation || '',
      bilingualTermsRaw: termsStr,
      teacherName: plan.teacherName || 'Nguyễn Văn A',
      headOfDepartmentReview: plan.headOfDepartmentReview || 'Đã kiểm tra, giáo án đạt chuẩn 5512.',
      headOfDepartmentStatus: plan.headOfDepartmentStatus || 'Đã duyệt',
      headOfDepartmentName: plan.headOfDepartmentName || 'Trần Thị Tổ Trưởng',
      headOfDepartmentSignDate: plan.headOfDepartmentSignDate || plan.date,
      schoolBoardReview: plan.schoolBoardReview || 'Đồng ý phê duyệt.',
      schoolBoardStatus: plan.schoolBoardStatus || 'Đã duyệt',
      schoolBoardName: plan.schoolBoardName || 'Lê Văn Hiệu Trưởng',
      schoolBoardSignDate: plan.schoolBoardSignDate || plan.date,
    });
    setFormError(null);
    setModalMode('edit');
  };

  // Open Duplicate Modal
  const handleOpenDuplicate = (plan: LessonPlan) => {
    setActivePlan(plan);
    const b = plan.bilingualSection;
    const termsStr = b?.keyTerms ? b.keyTerms.map((t) => `${t.word} | ${t.ipa || ''} | ${t.meaning}`).join('\n') : '';

    setFormData({
      title: `Bản sao - ${plan.title}`,
      subject: plan.subject,
      classId: plan.classId,
      className: plan.className,
      prepDate: new Date().toISOString().split('T')[0],
      teachDate: new Date().toISOString().split('T')[0],
      periodsCount: plan.periodsCount || 1,
      status: 'draft',
      gradeLevel: plan.gradeLevel || 'THCS - Khối 7',
      textbookSet: (plan.textbookSet as any) || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống'),
      digitalCompetencies: plan.digitalCompetencies || '',
      devicesAndSoftware: plan.devicesAndSoftware || '',
      objectives: plan.objectives || '',
      keyKnowledge: plan.keyKnowledge || '',
      warmupActivity: plan.warmupActivity || '',
      teacherActivity: plan.teacherActivity || '',
      studentActivity: plan.studentActivity || '',
      exercises: plan.exercises || '',
      notes: plan.notes || '',
      enableBilingual: !!b,
      bilingualTitle: b?.title || 'Phân đoạn giảng dạy Song ngữ Tiếng Anh',
      bilingualEnglish: b?.englishContent || '',
      bilingualVietnamese: b?.vietnameseTranslation || '',
      bilingualTermsRaw: termsStr,
      teacherName: plan.teacherName || 'Nguyễn Văn A',
      headOfDepartmentReview: 'Đã kiểm tra bản sao, giáo án đạt chuẩn 5512.',
      headOfDepartmentStatus: 'Đã duyệt',
      headOfDepartmentName: plan.headOfDepartmentName || 'Trần Thị Tổ Trưởng',
      headOfDepartmentSignDate: new Date().toISOString().split('T')[0],
      schoolBoardReview: 'Phê duyệt cho bản sao bài dạy.',
      schoolBoardStatus: 'Đã duyệt',
      schoolBoardName: plan.schoolBoardName || 'Lê Văn Hiệu Trưởng',
      schoolBoardSignDate: new Date().toISOString().split('T')[0],
    });
    setFormError(null);
    setModalMode('duplicate');
  };

  // AI Auto Generator Helper
  const handleAiAutoGenerate = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || 'Bài dạy chuẩn SGK',
          subject: formData.subject,
          gradeLevel: formData.gradeLevel,
          textbookSet: formData.textbookSet,
          periodsCount: formData.periodsCount,
        }),
      });

      const data = await response.json();
      if (data && data.planData) {
        const p = data.planData;
        setFormData((prev) => ({
          ...prev,
          title: p.title || prev.title || 'Bài dạy chuẩn SGK',
          subject: p.subject || prev.subject,
          gradeLevel: p.gradeLevel || prev.gradeLevel,
          textbookSet: p.textbookSet || prev.textbookSet,
          periodsCount: p.periodsCount || prev.periodsCount,
          digitalCompetencies: p.digitalCompetencies || prev.digitalCompetencies,
          devicesAndSoftware: p.devicesAndSoftware || prev.devicesAndSoftware,
          objectives: p.objectives || prev.objectives,
          keyKnowledge: p.keyKnowledge || prev.keyKnowledge,
          warmupActivity: p.warmupActivity || prev.warmupActivity,
          newLessonActivity: p.newLessonActivity || prev.newLessonActivity,
          practiceActivity: p.practiceActivity || prev.practiceActivity,
          lowApplicationActivity: p.lowApplicationActivity || prev.lowApplicationActivity,
          highApplicationActivity: p.highApplicationActivity || prev.highApplicationActivity,
          consolidationActivity: p.consolidationActivity || prev.consolidationActivity,
          homeworkActivity: p.homeworkActivity || prev.homeworkActivity,
          projectActivity: p.projectActivity || prev.projectActivity,
          teacherActivity: p.teacherActivity || prev.teacherActivity,
          studentActivity: p.studentActivity || prev.studentActivity,
          exercises: p.exercises || prev.exercises,
          notes: p.notes || prev.notes,
          enableBilingual: p.enableBilingual !== undefined ? p.enableBilingual : true,
          bilingualTitle: p.bilingualTitle || prev.bilingualTitle,
          bilingualEnglish: p.bilingualEnglish || prev.bilingualEnglish,
          bilingualVietnamese: p.bilingualVietnamese || prev.bilingualVietnamese,
          bilingualTermsRaw: p.bilingualTermsRaw || prev.bilingualTermsRaw,
        }));
        showToast('AI Miss Yến còi đã tự động soạn bài chuẩn CV 5512 & SGK thành công!');
      }
    } catch (err) {
      console.error('Error generating lesson plan:', err);
      showToast('Đã tự động áp dụng bộ mẫu bài dạy chuẩn 5512!');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save Form Handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setFormError('Vui lòng nhập Tên bài học.');
      return;
    }
    if (!formData.subject.trim()) {
      setFormError('Vui lòng chọn hoặc nhập Môn học.');
      return;
    }
    if (!formData.classId) {
      setFormError('Vui lòng chọn Lớp học.');
      return;
    }
    if (!formData.prepDate || !formData.teachDate) {
      setFormError('Vui lòng chọn đầy đủ Ngày soạn và Ngày dạy.');
      return;
    }

    const targetClass = classrooms.find((c) => c.id === formData.classId);
    const resolvedClassName = targetClass ? targetClass.name : formData.className || 'Lớp học';

    // Parse bilingual terms
    let bilingualSection: BilingualSection | undefined = undefined;
    if (formData.enableBilingual && formData.bilingualEnglish.trim()) {
      const parsedTerms = formData.bilingualTermsRaw
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split('|').map((p) => p.trim());
          return {
            word: parts[0] || '',
            ipa: parts[1] || '',
            meaning: parts[2] || parts[1] || '',
          };
        });

      bilingualSection = {
        title: formData.bilingualTitle || 'Phân đoạn Song ngữ',
        englishContent: formData.bilingualEnglish.trim(),
        vietnameseTranslation: formData.bilingualVietnamese.trim(),
        keyTerms: parsedTerms,
        audioText: formData.bilingualEnglish.trim(),
      };
    }

    const payload = {
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      classId: formData.classId,
      className: resolvedClassName,
      date: formData.teachDate,
      prepDate: formData.prepDate,
      teachDate: formData.teachDate,
      periodsCount: Number(formData.periodsCount) || 1,
      status: formData.status,
      gradeLevel: formData.gradeLevel,
      textbookSet: formData.textbookSet,
      digitalCompetencies: formData.digitalCompetencies.trim(),
      devicesAndSoftware: formData.devicesAndSoftware.trim(),
      objectives: formData.objectives.trim(),
      keyKnowledge: formData.keyKnowledge.trim(),
      warmupActivity: formData.warmupActivity.trim(),
      newLessonActivity: formData.newLessonActivity.trim(),
      practiceActivity: formData.practiceActivity.trim(),
      lowApplicationActivity: formData.lowApplicationActivity.trim(),
      highApplicationActivity: formData.highApplicationActivity.trim(),
      consolidationActivity: formData.consolidationActivity.trim(),
      homeworkActivity: formData.homeworkActivity.trim(),
      projectActivity: formData.projectActivity.trim(),
      teacherActivity: formData.teacherActivity.trim(),
      studentActivity: formData.studentActivity.trim(),
      illustrationImage: formData.illustrationImage.trim(),
      illustrationTitle: formData.illustrationTitle.trim(),
      bilingualSection,
      exercises: formData.exercises.trim(),
      notes: formData.notes.trim(),
      teacherName: formData.teacherName.trim(),
      headOfDepartmentReview: formData.headOfDepartmentReview.trim(),
      headOfDepartmentStatus: formData.headOfDepartmentStatus,
      headOfDepartmentName: formData.headOfDepartmentName.trim(),
      headOfDepartmentSignDate: formData.headOfDepartmentSignDate,
      schoolBoardReview: formData.schoolBoardReview.trim(),
      schoolBoardStatus: formData.schoolBoardStatus,
      schoolBoardName: formData.schoolBoardName.trim(),
      schoolBoardSignDate: formData.schoolBoardSignDate,
    };

    if (modalMode === 'create' || modalMode === 'duplicate') {
      onAddLessonPlan(payload);
      showToast(modalMode === 'duplicate' ? 'Đã sao chép giáo án thành công!' : 'Đã tạo giáo án mới thành công!');
    } else if (modalMode === 'edit' && activePlan) {
      onUpdateLessonPlan({
        ...activePlan,
        ...payload,
      });
      showToast('Đã cập nhật giáo án thành công!');
    }

    setModalMode(null);
    setActivePlan(null);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (planToDelete) {
      onDeleteLessonPlan(planToDelete.id);
      showToast(`Đã xóa giáo án "${planToDelete.title}"!`);
      setPlanToDelete(null);
    }
  };

  // Filtered Lesson Plans
  const filteredLessonPlans = useMemo(() => {
    return lessonPlans.filter((lp) => {
      // Search by title or objectives
      const matchesSearch =
        searchQuery.trim() === '' ||
        lp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lp.objectives?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by subject
      const matchesSubject =
        selectedSubjectFilter === 'ALL' || lp.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();

      // Filter by class
      const matchesClass = selectedClassFilter === 'ALL' || lp.classId === selectedClassFilter;

      // Filter by textbook
      const matchesTextbook =
        selectedTextbookFilter === 'ALL' || lp.textbookSet === selectedTextbookFilter;

      // Filter by date
      const matchesDate =
        !selectedDateFilter || lp.teachDate === selectedDateFilter || lp.date === selectedDateFilter;

      return matchesSearch && matchesSubject && matchesClass && matchesTextbook && matchesDate;
    });
  }, [lessonPlans, searchQuery, selectedSubjectFilter, selectedClassFilter, selectedTextbookFilter, selectedDateFilter]);

  // Format date helper (YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedSubjectFilter !== 'ALL' ||
    selectedClassFilter !== 'ALL' ||
    selectedTextbookFilter !== 'ALL' ||
    selectedDateFilter !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubjectFilter('ALL');
    setSelectedClassFilter('ALL');
    setSelectedTextbookFilter('ALL');
    setSelectedDateFilter('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#001f3f] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-orange-500/50 flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#001f3f] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-slate-800 border-l-4 border-l-orange-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>AI Soạn Giáo Án Tự Động GDPT 2018</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">
              LỊCH SỬ <span className="text-orange-400">SOẠN BÀI & GIÁO ÁN AI</span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Tự động sinh giáo án chuẩn 5512 cho bộ sách <strong className="text-amber-300">Kết nối tri thức với cuộc sống</strong> và <strong className="text-cyan-300">Tiếng Anh Global Success</strong>. Đầy đủ Ngày soạn, Ngày dạy, Xuất Word, PDF, Mã QR và chữ ký phê duyệt.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider active:scale-95 flex-shrink-0"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Tạo / Sinh giáo án AI mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 border-l-4 border-l-[#001f3f]">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <Filter className="w-4 h-4 text-orange-500" />
            <span>Tìm kiếm & Bộ lọc Lịch sử soạn bài</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search input */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài học..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Textbook */}
          <div>
            <select
              value={selectedTextbookFilter}
              onChange={(e) => setSelectedTextbookFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-bold text-slate-800"
            >
              <option value="ALL">Tất cả bộ sách</option>
              <option value="Kết nối tri thức với cuộc sống">Kết nối tri thức với cuộc sống</option>
              <option value="Tiếng Anh Global Success">Tiếng Anh Global Success</option>
            </select>
          </div>

          {/* Subject filter */}
          <div>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả môn học ({availableSubjects.length})</option>
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  Môn: {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Class filter */}
          <div>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="ALL">Tất cả lớp học ({classrooms.length})</option>
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.subject})
                </option>
              ))}
            </select>
          </div>

          {/* Date filter */}
          <div className="relative">
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
            />
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter('')}
                className="absolute right-8 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Lịch sử soạn bài: <strong>{filteredLessonPlans.length}</strong> / {lessonPlans.length} bài đã lưu
        </span>
      </div>

      {/* Lesson Plans List / Grid */}
      {filteredLessonPlans.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 text-center space-y-4">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy bài soạn nào trong lịch sử</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {hasActiveFilters
                ? 'Thử điều chỉnh lại từ khóa tìm kiếm hoặc bỏ bộ lọc đang chọn.'
                : 'Thầy/cô chưa có giáo án nào. Bấm nút bên dưới để tạo bài soạn đầu tiên.'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo bài soạn mới</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessonPlans.map((plan) => {
            const statusConfig =
              plan.status === 'completed'
                ? { label: 'Đã dạy', color: 'bg-sky-100 text-sky-800 border-sky-200' }
                : plan.status === 'draft'
                ? { label: 'Đang soạn', color: 'bg-amber-100 text-amber-800 border-amber-200' }
                : { label: 'Sẵn sàng dạy', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };

            const bookDisplay = plan.textbookSet || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống');

            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 border-l-4 border-l-[#001f3f] group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#001f3f] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">
                        Môn {plan.subject}
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-slate-200">
                        {plan.className}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Textbook Tag */}
                  <div className="inline-block bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                    📖 {bookDisplay}
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setViewDetailPlan(plan)}
                    className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-2 leading-snug"
                  >
                    {plan.title}
                  </h3>

                  {/* Dates Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-y border-slate-100 py-2 bg-slate-50/70 px-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Soạn: <strong>{formatDate(plan.prepDate || plan.date)}</strong></span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Dạy: <strong>{formatDate(plan.teachDate || plan.date)}</strong></span>
                    </span>
                  </div>

                  {/* Objective preview */}
                  {plan.objectives && (
                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{plan.objectives}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <button
                      onClick={() => setViewDetailPlan(plan)}
                      className="px-3 py-1.5 bg-[#001f3f] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      title="Xem lại bài soạn"
                    >
                      <Eye className="w-3.5 h-3.5 text-orange-400" />
                      <span>Xem lại</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => exportLessonPlanToWord(plan)}
                        className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="Tải File Word (.doc)"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600" />
                        <span>Word</span>
                      </button>

                      <button
                        onClick={() => exportLessonPlanToPDF(plan)}
                        className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="In hoặc lưu PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-rose-600" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => setQrPlan(plan)}
                        className="p-1.5 text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="Tạo Mã QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-600" />
                        <span>QR</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100/60">
                    <button
                      onClick={() => handleOpenDuplicate(plan)}
                      className="p-1 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Sao chép giáo án"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                      title="Chỉnh sửa giáo án"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                      <span>Chỉnh sửa</span>
                    </button>
                    <button
                      onClick={() => setPlanToDelete(plan)}
                      className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Xóa giáo án"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT / DUPLICATE MODAL */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 my-auto max-h-[94vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#001f3f] text-white p-5 flex items-center justify-between border-b border-slate-800 border-l-4 border-l-orange-500 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-extrabold uppercase">
                  {modalMode === 'create'
                    ? 'Tạo & Sinh giáo án AI mới'
                    : modalMode === 'edit'
                    ? 'Chỉnh sửa bài soạn'
                    : 'Sao chép bài soạn'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGeneratingAi}
                  onClick={handleAiAutoGenerate}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer uppercase tracking-tight disabled:opacity-60"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Đang dùng AI soạn SGK...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>AI Tự Động Soạn 5512</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setModalMode(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveForm} className="p-5 sm:p-6 space-y-5 overflow-y-auto">
              {/* Error Alert */}
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Informative banner for Duplicate Mode */}
              {modalMode === 'duplicate' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Chế độ sao chép:</strong> Đã giữ lại Mục tiêu, Kiến thức trọng tâm, Hoạt động 5512. Vui lòng cập nhật Tên bài học, Ngày dạy phù hợp.
                  </div>
                </div>
              )}

              {/* Section 1: Required Basic Info */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center justify-between">
                  <span>1. Thông tin chung bài dạy (Chuẩn Công văn 5512)</span>
                  <span className="text-[11px] text-orange-600 font-bold">GDPT 2018</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tên bài học * */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Tên bài học <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ví dụ: Unit 1: Hobbies (Global Success) hoặc Bài 3: Đại lượng tỷ lệ thuận..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Môn học * */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Môn học <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => handleSubjectChange(e.target.value)}
                      placeholder="Ví dụ: Tiếng Anh, Toán, Ngữ văn..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Lớp học * */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Lớp học <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.classId}
                      onChange={(e) => {
                        const selectedCls = classrooms.find((c) => c.id === e.target.value);
                        setFormData({
                          ...formData,
                          classId: e.target.value,
                          className: selectedCls ? selectedCls.name : '',
                          subject: selectedCls ? selectedCls.subject : formData.subject,
                        });
                      }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-medium"
                    >
                      {classrooms.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} — {cls.subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ngày soạn & Ngày dạy */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Ngày soạn <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.prepDate}
                      onChange={(e) => setFormData({ ...formData, prepDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Ngày dạy <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.teachDate}
                      onChange={(e) => setFormData({ ...formData, teachDate: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-semibold"
                    />
                  </div>

                  {/* Bộ sách giáo khoa (Giới hạn chuẩn 2 bộ sách) */}
                  <div className="space-y-1.5 md:col-span-2 bg-amber-100/80 p-3 rounded-2xl border-2 border-amber-400 shadow-sm">
                    <label className="text-xs font-black text-amber-950 flex items-center justify-between">
                      <span className="text-amber-950 font-black flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-700" />
                        Bộ sách giáo khoa (Áp dụng 2026 - 2027)
                      </span>
                      <span className="text-[11px] bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-md font-black uppercase tracking-tight border border-amber-400">
                        Bộ chuẩn duy nhất
                      </span>
                    </label>
                    <select
                      value={formData.textbookSet}
                      onChange={(e) => setFormData({ ...formData, textbookSet: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-amber-400 rounded-xl text-sm text-slate-950 font-black focus:border-amber-600 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all cursor-pointer shadow-sm"
                    >
                      <option value="Kết nối tri thức với cuộc sống" className="bg-white text-slate-950 font-bold py-1.5">
                        📖 Bộ sách: Kết nối tri thức với cuộc sống (Tất cả các môn)
                      </option>
                      <option value="Tiếng Anh Global Success" className="bg-white text-slate-950 font-bold py-1.5">
                        🇬🇧 Bộ sách: Tiếng Anh Global Success (NXB Giáo dục Việt Nam)
                      </option>
                    </select>
                  </div>

                  {/* Khối lớp & Số tiết */}
                  <div className="grid grid-cols-2 gap-3 md:col-span-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Cấp học / Khối lớp</label>
                      <select
                        value={formData.gradeLevel}
                        onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all cursor-pointer font-medium"
                      >
                        <option value="THCS - Khối 6">THCS - Khối 6</option>
                        <option value="THCS - Khối 7">THCS - Khối 7</option>
                        <option value="THCS - Khối 8">THCS - Khối 8</option>
                        <option value="THCS - Khối 9">THCS - Khối 9</option>
                        <option value="THPT - Khối 10">THPT - Khối 10</option>
                        <option value="THPT - Khối 11">THPT - Khối 11</option>
                        <option value="THPT - Khối 12">THPT - Khối 12</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Số tiết</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.periodsCount}
                        onChange={(e) => setFormData({ ...formData, periodsCount: parseInt(e.target.value) || 1 })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Digital Competency & Equipment */}
              <div className="space-y-4 bg-gradient-to-br from-slate-900 to-indigo-950 p-4.5 rounded-xl border border-cyan-500/30 text-white">
                <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                  <h4 className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>2. Khung Năng lực số (NLS) & Thiết bị, Phần mềm</span>
                  </h4>
                  <span className="text-[10px] bg-amber-400 text-blue-950 font-black px-2 py-0.5 rounded-full">
                    Khung chuẩn GDPT
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cyan-200">
                      Mã hóa chi tiết Năng lực số (VD: [NLS1.1], [NLS2.3], [NLS3.2], [NLS5.2]...)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.digitalCompetencies}
                      onChange={(e) => setFormData({ ...formData, digitalCompetencies: e.target.value })}
                      placeholder="Ghi chi tiết các mã năng lực số được phát triển..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-cyan-500/40 rounded-xl text-xs text-cyan-100 focus:border-cyan-400 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-cyan-200">
                      Thiết bị dạy học & Phần mềm sử dụng
                    </label>
                    <textarea
                      rows={2}
                      value={formData.devicesAndSoftware}
                      onChange={(e) => setFormData({ ...formData, devicesAndSoftware: e.target.value })}
                      placeholder="Thiết bị: Máy tính, Bảng tương tác Smartboard... Phần mềm: GeoGebra, Canva, PhET, Quizizz, AI Miss Yến Còi..."
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-cyan-500/40 rounded-xl text-xs text-cyan-100 focus:border-cyan-400 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Bilingual Teaching Segment */}
              <div className="space-y-4 bg-gradient-to-br from-blue-950 to-slate-900 p-4.5 rounded-xl border border-amber-500/30 text-white">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                  <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>3. Giảng dạy Song ngữ Tiếng Anh (Bilingual Segment)</span>
                  </h4>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-200">
                    <input
                      type="checkbox"
                      checked={formData.enableBilingual}
                      onChange={(e) => setFormData({ ...formData, enableBilingual: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>Bật phần song ngữ</span>
                  </label>
                </div>

                {formData.enableBilingual && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-200">Tiêu đề phân đoạn song ngữ</label>
                      <input
                        type="text"
                        value={formData.bilingualTitle}
                        onChange={(e) => setFormData({ ...formData, bilingualTitle: e.target.value })}
                        placeholder="Ví dụ: Bilingual Segment: Direct Proportion"
                        className="w-full px-3.5 py-2 bg-slate-950/80 border border-amber-500/40 rounded-xl text-xs text-amber-100 focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-200">Nội dung Tiếng Anh (English Content)</label>
                        <textarea
                          rows={3}
                          value={formData.bilingualEnglish}
                          onChange={(e) => setFormData({ ...formData, bilingualEnglish: e.target.value })}
                          placeholder="English text content..."
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-amber-500/40 rounded-xl text-xs text-amber-100 focus:border-amber-400 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-amber-200">Dịch nghĩa Tiếng Việt</label>
                        <textarea
                          rows={3}
                          value={formData.bilingualVietnamese}
                          onChange={(e) => setFormData({ ...formData, bilingualVietnamese: e.target.value })}
                          placeholder="Dịch nội dung tiếng Việt..."
                          className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-amber-500/40 rounded-xl text-xs text-amber-100 focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-amber-200">
                        Từ vựng chuyên ngành (TừTiếngAnh | PhiênÂmIPA | NghĩaTiếngViệt)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.bilingualTermsRaw}
                        onChange={(e) => setFormData({ ...formData, bilingualTermsRaw: e.target.value })}
                        placeholder="Direct Proportion | /daɪˈrektli prəˈpɔːrʃənl/ | Tỷ lệ thuận&#10;Constant | /ˈkɑːnstənt/ | Hằng số"
                        className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-amber-500/40 rounded-xl text-xs text-amber-100 focus:border-amber-400 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 4: 5512 Lesson Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                  4. Tiến trình bài dạy (Công văn 5512)
                </h4>

                {/* Mục tiêu bài học */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mục tiêu bài học (Kiến thức, Kỹ năng, Thái độ)</label>
                  <textarea
                    rows={3}
                    value={formData.objectives}
                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                    placeholder="Mục tiêu kiến thức, kỹ năng..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Kiến thức trọng tâm */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Kiến thức trọng tâm</label>
                  <textarea
                    rows={3}
                    value={formData.keyKnowledge}
                    onChange={(e) => setFormData({ ...formData, keyKnowledge: e.target.value })}
                    placeholder="Nội dung kiến thức cốt lõi..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Hoạt động khởi động */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Hoạt động khởi động</label>
                  <textarea
                    rows={2}
                    value={formData.warmupActivity}
                    onChange={(e) => setFormData({ ...formData, warmupActivity: e.target.value })}
                    placeholder="Trò chơi hoặc tình huống dẫn dắt..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Hoạt động của GV & HS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hoạt động của giáo viên</label>
                    <textarea
                      rows={3}
                      value={formData.teacherActivity}
                      onChange={(e) => setFormData({ ...formData, teacherActivity: e.target.value })}
                      placeholder="Chuyển giao nhiệm vụ, điều hành..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hoạt động của học sinh</label>
                    <textarea
                      rows={3}
                      value={formData.studentActivity}
                      onChange={(e) => setFormData({ ...formData, studentActivity: e.target.value })}
                      placeholder="Tiếp nhận, thảo luận, báo cáo..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Bài tập */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Bài tập & Củng cố</label>
                  <textarea
                    rows={2}
                    value={formData.exercises}
                    onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                    placeholder="Bài tập củng cố..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>

                {/* Ghi chú */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Ghi chú thêm</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Dặn dò học sinh..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Section 5: Signatures & Department Approvals */}
              <div className="space-y-4 bg-slate-100 p-4.5 rounded-xl border border-slate-300">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-2 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>5. Ký Tên GV & Phần Phê Duyệt Của Tổ Chuyên Môn, Ban Giám Hiệu</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* GV Soạn */}
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-900 block text-xs border-b pb-1">① Giáo Viên Soạn Bài</span>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Họ và tên GV:</label>
                      <input
                        type="text"
                        value={formData.teacherName}
                        onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Tổ CM */}
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-900 block text-xs border-b pb-1">② Kiểm Tra Của Tổ Chuyên Môn</span>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Ý kiến nhận xét:</label>
                      <textarea
                        rows={2}
                        value={formData.headOfDepartmentReview}
                        onChange={(e) => setFormData({ ...formData, headOfDepartmentReview: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block">Kết quả:</label>
                        <select
                          value={formData.headOfDepartmentStatus}
                          onChange={(e) => setFormData({ ...formData, headOfDepartmentStatus: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                        >
                          <option value="Đã duyệt">Đã duyệt</option>
                          <option value="Chưa duyệt">Chưa duyệt</option>
                          <option value="Yêu cầu sửa">Yêu cầu sửa</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block">Tổ trưởng:</label>
                        <input
                          type="text"
                          value={formData.headOfDepartmentName}
                          onChange={(e) => setFormData({ ...formData, headOfDepartmentName: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BGH */}
                  <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="font-extrabold text-slate-900 block text-xs border-b pb-1">③ Kiểm Tra Của Ban Giám Hiệu</span>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Ý kiến BGH:</label>
                      <textarea
                        rows={2}
                        value={formData.schoolBoardReview}
                        onChange={(e) => setFormData({ ...formData, schoolBoardReview: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block">Kết quả BGH:</label>
                        <select
                          value={formData.schoolBoardStatus}
                          onChange={(e) => setFormData({ ...formData, schoolBoardStatus: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-blue-700"
                        >
                          <option value="Đã duyệt">Đã duyệt</option>
                          <option value="Chưa duyệt">Chưa duyệt</option>
                          <option value="Yêu cầu sửa">Yêu cầu sửa</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block">Hiệu trưởng/BGH:</label>
                        <input
                          type="text"
                          value={formData.schoolBoardName}
                          onChange={(e) => setFormData({ ...formData, schoolBoardName: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu bài soạn</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAIL MODAL ("Xem lại") */}
      {viewDetailPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 my-auto max-h-[94vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#001f3f] text-white p-5 flex items-center justify-between border-b border-slate-800 border-l-4 border-l-orange-500 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-base font-extrabold uppercase line-clamp-1">{viewDetailPlan.title}</h3>
                  <p className="text-xs text-orange-300">
                    Môn {viewDetailPlan.subject} — {viewDetailPlan.className} | Bộ sách: {viewDetailPlan.textbookSet || 'Kết nối tri thức với cuộc sống'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDirectPrint(viewDetailPlan)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="In trực tiếp giáo án 5512"
                >
                  <Printer className="w-4 h-4 text-emerald-200" />
                  <span>In trực tiếp</span>
                </button>
                <button
                  onClick={() => setViewDetailPlan(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Display */}
            <div className="p-6 space-y-6 overflow-y-auto text-slate-800 text-sm printable-area">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Ngày soạn</div>
                  <div className="font-extrabold text-slate-900">{formatDate(viewDetailPlan.prepDate || viewDetailPlan.date)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Ngày dạy</div>
                  <div className="font-extrabold text-emerald-700">{formatDate(viewDetailPlan.teachDate || viewDetailPlan.date)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Bộ sách giáo khoa</div>
                  <div className="font-extrabold text-[#001f3f]">{viewDetailPlan.textbookSet || 'Kết nối tri thức'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Trạng thái bài soạn</div>
                  <div className="font-extrabold text-orange-600">
                    {viewDetailPlan.status === 'completed'
                      ? 'Đã dạy'
                      : viewDetailPlan.status === 'draft'
                      ? 'Đang soạn'
                      : 'Sẵn sàng dạy'}
                  </div>
                </div>
              </div>

              {/* Visual Illustration Section */}
              <LessonIllustration
                subject={viewDetailPlan.subject}
                title={viewDetailPlan.title}
                illustrationImage={viewDetailPlan.illustrationImage}
                illustrationTitle={viewDetailPlan.illustrationTitle}
              />

              {/* Digital Competencies & Equipment Card */}
              {(viewDetailPlan.digitalCompetencies || viewDetailPlan.devicesAndSoftware) && (
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-4.5 rounded-xl border border-cyan-500/30 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <h4 className="font-extrabold text-xs text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <span>Khung Năng Lực Số (NLS) & Tên Thiết Bị / Phần Mềm</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-cyan-400 text-blue-950 rounded-full">
                      GDPT 2018
                    </span>
                  </div>

                  {viewDetailPlan.digitalCompetencies && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-cyan-300 block">Mã hóa Năng lực số:</span>
                      <p className="whitespace-pre-line text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20 font-mono leading-relaxed">
                        {viewDetailPlan.digitalCompetencies}
                      </p>
                    </div>
                  )}

                  {viewDetailPlan.devicesAndSoftware && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-cyan-300 block">Thiết bị & Phần mềm sử dụng:</span>
                      <p className="whitespace-pre-line text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-cyan-500/20 leading-relaxed">
                        {viewDetailPlan.devicesAndSoftware}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bilingual English Teaching Segment Card */}
              {viewDetailPlan.bilingualSection && (
                <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white p-4.5 rounded-xl border border-amber-500/30 space-y-4 shadow-md">
                  <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                    <h4 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>{viewDetailPlan.bilingualSection.title || 'Bài dạy Song ngữ Tiếng Anh'}</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-400 text-blue-950 rounded-full">
                      Bilingual English
                    </span>
                  </div>

                  <AudioPracticePlayer
                    textToSpeak={viewDetailPlan.bilingualSection.audioText || viewDetailPlan.bilingualSection.englishContent}
                    title="Phát âm chuẩn AI & Thu âm bài học song ngữ"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 space-y-1">
                      <span className="font-extrabold text-amber-300 text-[11px] uppercase block">
                        English Content:
                      </span>
                      <p className="text-slate-100 leading-relaxed font-medium">
                        {viewDetailPlan.bilingualSection.englishContent}
                      </p>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 space-y-1">
                      <span className="font-extrabold text-amber-300 text-[11px] uppercase block">
                        Dịch nghĩa Tiếng Việt:
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {viewDetailPlan.bilingualSection.vietnameseTranslation}
                      </p>
                    </div>
                  </div>

                  {viewDetailPlan.bilingualSection.keyTerms && viewDetailPlan.bilingualSection.keyTerms.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-extrabold text-amber-300 uppercase block">
                        Từ vựng & Thuật ngữ Chuyên ngành:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {viewDetailPlan.bilingualSection.keyTerms.map((term, idx) => (
                          <div key={idx} className="bg-slate-900/90 p-2.5 rounded-lg border border-amber-500/20 text-xs flex items-center justify-between gap-2">
                            <div>
                              <span className="font-extrabold text-amber-200">{term.word}</span>
                              {term.ipa && <span className="text-[11px] text-slate-400 ml-1.5 font-mono">[{term.ipa}]</span>}
                            </div>
                            <span className="text-[11px] text-amber-400/90 font-medium">{term.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sections 5512 */}
              <div className="space-y-5">
                {viewDetailPlan.objectives && (
                  <div className="space-y-1.5 border-l-4 border-l-orange-500 pl-3">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-orange-600">
                      I. Mục tiêu bài học
                    </h4>
                    <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {viewDetailPlan.objectives}
                    </p>
                  </div>
                )}

                {viewDetailPlan.keyKnowledge && (
                  <div className="space-y-1.5 border-l-4 border-l-[#001f3f] pl-3">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-[#001f3f]">
                      II. Kiến thức trọng tâm
                    </h4>
                    <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {viewDetailPlan.keyKnowledge}
                    </p>
                  </div>
                )}

                {/* III. TIẾN TRÌNH DẠY HỌC (8 HOẠT ĐỘNG CHUẨN CV 5512 + AUDIO PLAYER) */}
                <div className="space-y-4 border-l-4 border-l-blue-600 pl-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>III. Tiến trình dạy học (8 Hoạt động chuẩn CV 5512 + Audio Song ngữ)</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full border border-blue-300">
                      Tích hợp Âm thanh Thu & Phát
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'warmupActivity', label: 'Hoạt động 1: Khởi động (Warm-up)', content: viewDetailPlan.warmupActivity, icon: Zap },
                      { key: 'newLessonActivity', label: 'Hoạt động 2: Tìm hiểu bài mới (Discovery & Presentation)', content: viewDetailPlan.newLessonActivity, icon: BookOpen },
                      { key: 'practiceActivity', label: 'Hoạt động 3: Thực hành (Practice)', content: viewDetailPlan.practiceActivity, icon: Layers },
                      { key: 'lowApplicationActivity', label: 'Hoạt động 4: Vận dụng thấp (Low Application)', content: viewDetailPlan.lowApplicationActivity, icon: Target },
                      { key: 'highApplicationActivity', label: 'Hoạt động 5: Vận dụng cao (High Application / Deep Learning)', content: viewDetailPlan.highApplicationActivity, icon: Sparkles },
                      { key: 'consolidationActivity', label: 'Hoạt động 6: Củng cố kiến thức (Consolidation)', content: viewDetailPlan.consolidationActivity, icon: CheckCircle },
                      { key: 'homeworkActivity', label: 'Hoạt động 7: Hướng dẫn về nhà (Homework Guidance)', content: viewDetailPlan.homeworkActivity, icon: FileText },
                      { key: 'projectActivity', label: 'Hoạt động 8: Dự án Project (STEM / English Project)', content: viewDetailPlan.projectActivity, icon: Cpu },
                    ].map((act) => act.content ? (
                      <div key={act.key} className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-700 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="font-extrabold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                            <act.icon className="w-4 h-4 text-amber-400" />
                            <span>{act.label}</span>
                          </span>
                          <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-cyan-400" />
                            <span>Audio AI & Micro</span>
                          </span>
                        </div>
                        <p className="whitespace-pre-line text-xs text-slate-200 leading-relaxed font-medium">
                          {act.content}
                        </p>
                        
                        {/* Audio Player for this stage */}
                        <div className="pt-1">
                          <AudioPracticePlayer
                            textToSpeak={act.content}
                            title={`Luyện nghe & Ghi âm: ${act.label}`}
                          />
                        </div>
                      </div>
                    ) : null)}

                    {(viewDetailPlan.teacherActivity || viewDetailPlan.studentActivity) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {viewDetailPlan.teacherActivity && (
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <span className="font-bold text-slate-900 text-xs block mb-1 text-blue-900">
                              Hoạt động phân công của Giáo viên:
                            </span>
                            <p className="whitespace-pre-line text-slate-700 text-xs leading-relaxed">{viewDetailPlan.teacherActivity}</p>
                          </div>
                        )}

                        {viewDetailPlan.studentActivity && (
                          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                            <span className="font-bold text-slate-900 text-xs block mb-1 text-emerald-900">
                              Hoạt động phối hợp của Học sinh:
                            </span>
                            <p className="whitespace-pre-line text-slate-700 text-xs leading-relaxed">{viewDetailPlan.studentActivity}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {viewDetailPlan.exercises && (
                  <div className="space-y-1.5 border-l-4 border-l-emerald-500 pl-3">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-emerald-700">
                      IV. Bài tập & Phiếu củng cố
                    </h4>
                    <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                      {viewDetailPlan.exercises}
                    </p>
                  </div>
                )}

                {/* V. MỤC ĐIỀU CHỈNH BỔ SUNG & RÚT KINH NGHIỆM SAU BÀI DẠY */}
                {viewDetailPlan.notes && (
                  <div className="space-y-2 border-l-4 border-l-amber-500 pl-3.5 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                    <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>V. Mục điều chỉnh bổ sung & Rút kinh nghiệm sau bài dạy</span>
                    </h4>
                    <p className="whitespace-pre-line text-xs text-amber-950 font-medium leading-relaxed italic">
                      {viewDetailPlan.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Section: Signatures & Department Approvals Display (Editable) */}
              <div className="space-y-3 pt-4 border-t-2 border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Phần Kiểm Tra, Nhận Xét & Ký Phê Duyệt Cuối Bài (Có thể nhập liệu tay)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 italic font-medium">
                    (Thầy/Cô có thể gõ trực tiếp tên và ý kiến phê duyệt bên dưới)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* GV */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-extrabold text-slate-900 text-center uppercase border-b pb-1">
                      Giáo Viên Soạn Bài
                    </div>
                    <p><strong>Ngày soạn:</strong> {formatDate(viewDetailPlan.prepDate || viewDetailPlan.date)}</p>
                    <p><strong>Trạng thái:</strong> <span className="text-emerald-700 font-extrabold">Hoàn thành</span></p>
                    <div className="pt-2 text-center space-y-1">
                      <span className="text-slate-400 text-[10px] italic block mb-1">(Ký & Gõ tên GV)</span>
                      <input
                        type="text"
                        value={viewDetailPlan.teacherName || ''}
                        onChange={(e) => updateDetailSignatureField('teacherName', e.target.value)}
                        placeholder="Nhập tên Giáo viên..."
                        className="w-full text-center font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Tổ CM */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-extrabold text-slate-900 text-center uppercase border-b pb-1">
                      Tổ Chuyên Môn Kiểm Tra
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block text-[11px] mb-0.5">Ý kiến nhận xét:</label>
                      <textarea
                        rows={2}
                        value={viewDetailPlan.headOfDepartmentReview || ''}
                        onChange={(e) => updateDetailSignatureField('headOfDepartmentReview', e.target.value)}
                        placeholder="Nhận xét của Tổ trưởng..."
                        className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-700 text-[11px]">Kết quả:</span>
                      <select
                        value={viewDetailPlan.headOfDepartmentStatus || 'Đã duyệt'}
                        onChange={(e) => updateDetailSignatureField('headOfDepartmentStatus', e.target.value as any)}
                        className="text-xs font-extrabold text-emerald-700 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="Đã duyệt">Đã duyệt</option>
                        <option value="Chưa duyệt">Chưa duyệt</option>
                        <option value="Yêu cầu sửa">Yêu cầu sửa</option>
                      </select>
                    </div>
                    <div className="pt-1 text-center space-y-1">
                      <span className="text-slate-400 text-[10px] italic block mb-1">(Ký & Gõ tên Tổ trưởng)</span>
                      <input
                        type="text"
                        value={viewDetailPlan.headOfDepartmentName || ''}
                        onChange={(e) => updateDetailSignatureField('headOfDepartmentName', e.target.value)}
                        placeholder="Nhập tên Tổ trưởng..."
                        className="w-full text-center font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* BGH */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="font-extrabold text-slate-900 text-center uppercase border-b pb-1">
                      Ban Giám Hiệu / Nhà Trường
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block text-[11px] mb-0.5">Ý kiến BGH:</label>
                      <textarea
                        rows={2}
                        value={viewDetailPlan.schoolBoardReview || ''}
                        onChange={(e) => updateDetailSignatureField('schoolBoardReview', e.target.value)}
                        placeholder="Ý kiến phê duyệt BGH..."
                        className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-700 text-[11px]">Kết quả BGH:</span>
                      <select
                        value={viewDetailPlan.schoolBoardStatus || 'Đã duyệt'}
                        onChange={(e) => updateDetailSignatureField('schoolBoardStatus', e.target.value as any)}
                        className="text-xs font-extrabold text-blue-700 bg-white border border-slate-300 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="Đã duyệt">Đã duyệt</option>
                        <option value="Chưa duyệt">Chưa duyệt</option>
                        <option value="Yêu cầu sửa">Yêu cầu sửa</option>
                      </select>
                    </div>
                    <div className="pt-1 text-center space-y-1">
                      <span className="text-slate-400 text-[10px] italic block mb-1">(Ký & Gõ tên Hiệu trưởng)</span>
                      <input
                        type="text"
                        value={viewDetailPlan.schoolBoardName || ''}
                        onChange={(e) => updateDetailSignatureField('schoolBoardName', e.target.value)}
                        placeholder="Nhập tên Hiệu trưởng/BGH..."
                        className="w-full text-center font-extrabold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleDirectPrint(viewDetailPlan)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                  title="In giáo án trực tiếp qua máy in"
                >
                  <Printer className="w-4 h-4 text-emerald-200" />
                  <span>In giáo án trực tiếp</span>
                </button>

                <button
                  onClick={() => exportLessonPlanToWord(viewDetailPlan)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-blue-200" />
                  <span>Tải File Word (.doc)</span>
                </button>

                <button
                  onClick={() => exportLessonPlanToPDF(viewDetailPlan)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-rose-200" />
                  <span>Tải PDF</span>
                </button>

                <button
                  onClick={() => setQrPlan(viewDetailPlan)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <QrCode className="w-4 h-4 text-slate-950" />
                  <span>Mã QR</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const plan = viewDetailPlan;
                    setViewDetailPlan(null);
                    handleOpenDuplicate(plan);
                  }}
                  className="px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold rounded-xl border border-orange-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Sao chép</span>
                </button>
                <button
                  onClick={() => {
                    const plan = viewDetailPlan;
                    setViewDetailPlan(null);
                    handleOpenEdit(plan);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-4 h-4 text-orange-400" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      <QRCodeModal
        isOpen={!!qrPlan}
        onClose={() => setQrPlan(null)}
        title={qrPlan ? `Giáo án: ${qrPlan.title}` : ''}
        subtitle={qrPlan ? `Môn ${qrPlan.subject} - Lớp ${qrPlan.className}` : ''}
        dataContent={
          qrPlan
            ? `GIÁO ÁN: ${qrPlan.title} | Môn: ${qrPlan.subject} | Lớp: ${qrPlan.className} | Ngày soạn: ${qrPlan.prepDate || qrPlan.date} | Ngày dạy: ${qrPlan.teachDate || qrPlan.date} | Bộ sách: ${qrPlan.textbookSet || 'Kết nối tri thức'}`
            : ''
        }
      />

      {/* DELETE CONFIRMATION MODAL */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa giáo án</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác.</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Bạn có chắc chắn muốn xóa giáo án <strong className="text-slate-900 font-extrabold">"{planToDelete.title}"</strong> không?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                Xóa giáo án này
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
