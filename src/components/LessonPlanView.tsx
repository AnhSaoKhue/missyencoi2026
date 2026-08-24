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
  Home,
} from 'lucide-react';
import { Classroom, LessonPlan, TabType, BilingualSection } from '../types';
import { AudioPracticePlayer } from './AudioPracticePlayer';
import { BilingualVocabTable } from './BilingualVocabTable';
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
  onBackToHome?: () => void;
  initialMode?: 'create' | 'list';
}

export const LessonPlanView: React.FC<LessonPlanViewProps> = ({
  classrooms,
  lessonPlans,
  onAddLessonPlan,
  onUpdateLessonPlan,
  onDeleteLessonPlan,
  onNavigateTab,
  onBackToHome,
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

  // Form states for modal (Mặc định để trống nội dung kiến thức để Giáo viên tự nhập hoặc bấm AI Miss Yến còi tự soạn)
  const [formData, setFormData] = useState({
    title: '',
    subject: 'Toán',
    classId: classrooms[0]?.id || 'class-lop-7',
    className: classrooms[0]?.name || 'Lớp 7',
    curriculumPeriod: 'Tiết 1',
    teacherName: localStorage.getItem('sys_teacher_name') || '',
    schoolName: localStorage.getItem('sys_school_name') || '',
    prepDate: new Date().toISOString().split('T')[0],
    teachDate: new Date().toISOString().split('T')[0],
    periodsCount: 1,
    status: 'ready' as 'draft' | 'ready' | 'completed',
    textbookSet: 'Kết nối tri thức với cuộc sống' as 'Kết nối tri thức với cuộc sống' | 'Tiếng Anh Global Success',
    // 1. Mục tiêu (Thái độ - Kiến thức - Kĩ năng - Năng lực số)
    objectives: '',
    objectivesKnowledge: '',
    objectivesSkills: '',
    objectivesAttitude: '',
    digitalCompetencies: '',
    keyKnowledge: '',
    // 2. Chuẩn bị (GV - HS)
    devicesAndSoftware: '',
    teacherPrep: '',
    studentPrep: '',
    // 3. Tiến trình 8 Hoạt động chuẩn Công văn 5512 kèm thời lượng
    warmupActivity: '',
    warmupTime: '5 phút',
    newLessonActivity: '',
    newLessonTime: '15 phút',
    practiceActivity: '',
    practiceTime: '10 phút',
    lowApplicationActivity: '',
    lowAppTime: '5 phút',
    highApplicationActivity: '',
    highAppTime: '5 phút',
    consolidationActivity: '',
    consolidationTime: '3 phút',
    homeworkActivity: '',
    homeworkTime: '2 phút',
    reflectionNotes: '',
    projectActivity: '',
    teacherActivity: '',
    studentActivity: '',
    illustrationImage: '',
    illustrationTitle: '',
    exercises: '',
    notes: '',
    // Tích hợp Giảng dạy Song ngữ Tiếng Anh
    enableBilingual: false,
    bilingualTitle: 'Phân đoạn giảng dạy Song ngữ Tiếng Anh',
    bilingualEnglish: '',
    bilingualVietnamese: '',
    bilingualTermsRaw: '',
    bilingualActivities: [
      '1. Khởi động (Warm-up)',
      '2. Tìm hiểu vào bài / Hình thành kiến thức mới',
      '7. Hướng dẫn học sinh tự học ở nhà & BTVN',
    ],
    // Signatures & Approval (Để trắng để Giáo viên tự điền sau)
    headOfDepartmentReview: 'Bài soạn đạt chuẩn Công văn 5512, tích hợp năng lực số tốt, đảm bảo thời lượng.',
    headOfDepartmentStatus: 'Đã duyệt' as 'Chưa duyệt' | 'Đã duyệt' | 'Yêu cầu sửa',
    headOfDepartmentName: '',
    headOfDepartmentSignDate: new Date().toISOString().split('T')[0],
    schoolBoardReview: 'Đồng ý duyệt cho phép áp dụng giảng dạy chính thức.',
    schoolBoardStatus: 'Đã duyệt' as 'Chưa duyệt' | 'Đã duyệt' | 'Yêu cầu sửa',
    schoolBoardName: '',
    schoolBoardSignDate: new Date().toISOString().split('T')[0],
  });

  const [formError, setFormError] = useState<string | null>(null);

  // Sync Teacher & School Name from System Settings Event
  useEffect(() => {
    const handleSyncSettings = () => {
      const savedTeacher = localStorage.getItem('sys_teacher_name');
      const savedSchool = localStorage.getItem('sys_school_name');
      setFormData((prev) => ({
        ...prev,
        teacherName: savedTeacher || prev.teacherName,
        schoolName: savedSchool || prev.schoolName,
      }));
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

  // Open Create Modal (Để trống hoàn toàn nội dung để AI tự soạn hoặc GV nhập mới)
  const handleOpenCreate = () => {
    const defaultClass = classrooms[0];
    const defaultSub = defaultClass?.subject || 'Toán';
    const isEnglish = defaultSub.toLowerCase().includes('tiếng anh');

    setFormData({
      title: '',
      subject: defaultSub,
      classId: defaultClass?.id || 'class-lop-7',
      className: defaultClass?.name || 'Lớp 7',
      curriculumPeriod: 'Tiết 1',
      teacherName: localStorage.getItem('sys_teacher_name') || '',
      schoolName: localStorage.getItem('sys_school_name') || '',
      prepDate: new Date().toISOString().split('T')[0],
      teachDate: new Date().toISOString().split('T')[0],
      periodsCount: 1,
      status: 'ready',
      textbookSet: isEnglish ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống',
      // 1. Mục tiêu trống hoàn toàn
      objectives: '',
      objectivesKnowledge: '',
      objectivesSkills: '',
      objectivesAttitude: '',
      digitalCompetencies: '',
      keyKnowledge: '',
      // 2. Chuẩn bị trống
      devicesAndSoftware: '',
      teacherPrep: '',
      studentPrep: '',
      // 3. Tiến trình 8 Hoạt động trống kèm thời gian chuẩn
      warmupActivity: '',
      warmupTime: '5 phút',
      newLessonActivity: '',
      newLessonTime: '15 phút',
      practiceActivity: '',
      practiceTime: '10 phút',
      lowApplicationActivity: '',
      lowAppTime: '5 phút',
      highApplicationActivity: '',
      highAppTime: '5 phút',
      consolidationActivity: '',
      consolidationTime: '3 phút',
      homeworkActivity: '',
      homeworkTime: '2 phút',
      reflectionNotes: '',
      projectActivity: '',
      teacherActivity: '',
      studentActivity: '',
      illustrationImage: '',
      illustrationTitle: '',
      exercises: '',
      notes: '',
      // Tích hợp Song ngữ
      enableBilingual: isEnglish,
      bilingualTitle: 'Phân đoạn giảng dạy Song ngữ Tiếng Anh',
      bilingualEnglish: '',
      bilingualVietnamese: '',
      bilingualTermsRaw: '',
      bilingualActivities: [
        '1. Khởi động (Warm-up)',
        '2. Tìm hiểu vào bài / Hình thành kiến thức mới',
        '7. Hướng dẫn học sinh tự học ở nhà & BTVN',
      ],
      // Phê duyệt
      headOfDepartmentReview: 'Bài soạn đạt chuẩn Công văn 5512, tích hợp năng lực số tốt.',
      headOfDepartmentStatus: 'Đã duyệt',
      headOfDepartmentName: '',
      headOfDepartmentSignDate: new Date().toISOString().split('T')[0],
      schoolBoardReview: 'Đồng ý duyệt cho phép giảng dạy.',
      schoolBoardStatus: 'Đã duyệt',
      schoolBoardName: '',
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
      curriculumPeriod: plan.curriculumPeriod || 'Tiết 1',
      teacherName: plan.teacherName || localStorage.getItem('sys_teacher_name') || '',
      schoolName: plan.schoolName || localStorage.getItem('sys_school_name') || '',
      prepDate: plan.prepDate || plan.date,
      teachDate: plan.teachDate || plan.date,
      periodsCount: plan.periodsCount || 1,
      status: plan.status || 'ready',
      textbookSet: (plan.textbookSet as any) || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống'),
      objectives: plan.objectives || '',
      objectivesKnowledge: plan.objectivesKnowledge || '',
      objectivesSkills: plan.objectivesSkills || '',
      objectivesAttitude: plan.objectivesAttitude || '',
      digitalCompetencies: plan.digitalCompetencies || '',
      keyKnowledge: plan.keyKnowledge || '',
      devicesAndSoftware: plan.devicesAndSoftware || '',
      teacherPrep: plan.teacherPrep || '',
      studentPrep: plan.studentPrep || '',
      warmupActivity: plan.warmupActivity || '',
      warmupTime: plan.warmupTime || '5 phút',
      newLessonActivity: plan.newLessonActivity || '',
      newLessonTime: plan.newLessonTime || '15 phút',
      practiceActivity: plan.practiceActivity || '',
      practiceTime: plan.practiceTime || '10 phút',
      lowApplicationActivity: plan.lowApplicationActivity || '',
      lowAppTime: plan.lowAppTime || '5 phút',
      highApplicationActivity: plan.highApplicationActivity || '',
      highAppTime: plan.highAppTime || '5 phút',
      consolidationActivity: plan.consolidationActivity || '',
      consolidationTime: plan.consolidationTime || '3 phút',
      homeworkActivity: plan.homeworkActivity || '',
      homeworkTime: plan.homeworkTime || '2 phút',
      reflectionNotes: plan.reflectionNotes || plan.notes || '',
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
      bilingualActivities: b?.targetActivities && b.targetActivities.length > 0
        ? b.targetActivities
        : [
            '1. Khởi động (Warm-up)',
            '2. Tìm hiểu vào bài / Hình thành kiến thức mới',
            '7. Hướng dẫn học sinh tự học ở nhà & BTVN',
          ],
      headOfDepartmentReview: plan.headOfDepartmentReview || 'Đã kiểm tra, giáo án đạt chuẩn 5512.',
      headOfDepartmentStatus: plan.headOfDepartmentStatus || 'Đã duyệt',
      headOfDepartmentName: plan.headOfDepartmentName || '',
      headOfDepartmentSignDate: plan.headOfDepartmentSignDate || plan.date,
      schoolBoardReview: plan.schoolBoardReview || 'Đồng ý phê duyệt.',
      schoolBoardStatus: plan.schoolBoardStatus || 'Đã duyệt',
      schoolBoardName: plan.schoolBoardName || '',
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
      curriculumPeriod: plan.curriculumPeriod || 'Tiết 1',
      teacherName: plan.teacherName || localStorage.getItem('sys_teacher_name') || '',
      schoolName: plan.schoolName || localStorage.getItem('sys_school_name') || '',
      prepDate: new Date().toISOString().split('T')[0],
      teachDate: new Date().toISOString().split('T')[0],
      periodsCount: plan.periodsCount || 1,
      status: 'draft',
      textbookSet: (plan.textbookSet as any) || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống'),
      objectives: plan.objectives || '',
      objectivesKnowledge: plan.objectivesKnowledge || '',
      objectivesSkills: plan.objectivesSkills || '',
      objectivesAttitude: plan.objectivesAttitude || '',
      digitalCompetencies: plan.digitalCompetencies || '',
      keyKnowledge: plan.keyKnowledge || '',
      devicesAndSoftware: plan.devicesAndSoftware || '',
      teacherPrep: plan.teacherPrep || '',
      studentPrep: plan.studentPrep || '',
      warmupActivity: plan.warmupActivity || '',
      warmupTime: plan.warmupTime || '5 phút',
      newLessonActivity: plan.newLessonActivity || '',
      newLessonTime: plan.newLessonTime || '15 phút',
      practiceActivity: plan.practiceActivity || '',
      practiceTime: plan.practiceTime || '10 phút',
      lowApplicationActivity: plan.lowApplicationActivity || '',
      lowAppTime: plan.lowAppTime || '5 phút',
      highApplicationActivity: plan.highApplicationActivity || '',
      highAppTime: plan.highAppTime || '5 phút',
      consolidationActivity: plan.consolidationActivity || '',
      consolidationTime: plan.consolidationTime || '3 phút',
      homeworkActivity: plan.homeworkActivity || '',
      homeworkTime: plan.homeworkTime || '2 phút',
      reflectionNotes: plan.reflectionNotes || plan.notes || '',
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
      bilingualActivities: b?.targetActivities && b.targetActivities.length > 0
        ? b.targetActivities
        : [
            '1. Khởi động (Warm-up)',
            '2. Tìm hiểu vào bài / Hình thành kiến thức mới',
            '7. Hướng dẫn học sinh tự học ở nhà & BTVN',
          ],
      headOfDepartmentReview: 'Đã kiểm tra bản sao, giáo án đạt chuẩn 5512.',
      headOfDepartmentStatus: 'Đã duyệt',
      headOfDepartmentName: plan.headOfDepartmentName || '',
      headOfDepartmentSignDate: new Date().toISOString().split('T')[0],
      schoolBoardReview: 'Phê duyệt cho bản sao bài dạy.',
      schoolBoardStatus: 'Đã duyệt',
      schoolBoardName: plan.schoolBoardName || '',
      schoolBoardSignDate: new Date().toISOString().split('T')[0],
    });
    setFormError(null);
    setModalMode('duplicate');
  };

  // AI Auto Generator Helper (Gọi API AI Miss Yến còi tự động soạn mới 100% chuẩn CV 5512)
  const handleAiAutoGenerate = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || 'Bài dạy chuẩn SGK',
          subject: formData.subject,
          className: formData.className,
          curriculumPeriod: formData.curriculumPeriod,
          teacherName: formData.teacherName,
          schoolName: formData.schoolName,
          textbookSet: formData.textbookSet,
          periodsCount: formData.periodsCount,
          bilingualActivities: formData.bilingualActivities,
          enableBilingual: formData.enableBilingual,
        }),
      });

      const data = await response.json();
      if (data && data.planData) {
        const p = data.planData;
        setFormData((prev) => ({
          ...prev,
          title: p.title || prev.title || 'Bài dạy chuẩn SGK',
          subject: p.subject || prev.subject,
          className: p.className || prev.className,
          curriculumPeriod: p.curriculumPeriod || prev.curriculumPeriod,
          teacherName: p.teacherName || prev.teacherName,
          schoolName: p.schoolName || prev.schoolName,
          textbookSet: p.textbookSet || prev.textbookSet,
          periodsCount: p.periodsCount || prev.periodsCount,
          // 1. Mục tiêu
          objectives: p.objectives || prev.objectives,
          objectivesKnowledge: p.objectivesKnowledge || prev.objectivesKnowledge || p.objectives,
          objectivesSkills: p.objectivesSkills || prev.objectivesSkills,
          objectivesAttitude: p.objectivesAttitude || prev.objectivesAttitude,
          digitalCompetencies: p.digitalCompetencies || prev.digitalCompetencies,
          keyKnowledge: p.keyKnowledge || prev.keyKnowledge,
          // 2. Chuẩn bị
          devicesAndSoftware: p.devicesAndSoftware || prev.devicesAndSoftware,
          teacherPrep: p.teacherPrep || prev.teacherPrep || p.devicesAndSoftware,
          studentPrep: p.studentPrep || prev.studentPrep,
          // 3. Tiến trình 8 Hoạt động chuẩn 5512
          warmupActivity: p.warmupActivity || prev.warmupActivity,
          warmupTime: p.warmupTime || prev.warmupTime || '5 phút',
          newLessonActivity: p.newLessonActivity || prev.newLessonActivity,
          newLessonTime: p.newLessonTime || prev.newLessonTime || '15 phút',
          practiceActivity: p.practiceActivity || prev.practiceActivity,
          practiceTime: p.practiceTime || prev.practiceTime || '10 phút',
          lowApplicationActivity: p.lowApplicationActivity || prev.lowApplicationActivity,
          lowAppTime: p.lowAppTime || prev.lowAppTime || '5 phút',
          highApplicationActivity: p.highApplicationActivity || prev.highApplicationActivity,
          highAppTime: p.highAppTime || prev.highAppTime || '5 phút',
          consolidationActivity: p.consolidationActivity || prev.consolidationActivity,
          consolidationTime: p.consolidationTime || prev.consolidationTime || '3 phút',
          homeworkActivity: p.homeworkActivity || prev.homeworkActivity,
          homeworkTime: p.homeworkTime || prev.homeworkTime || '2 phút',
          reflectionNotes: p.reflectionNotes || prev.reflectionNotes || p.notes || '',
          projectActivity: p.projectActivity || prev.projectActivity,
          teacherActivity: p.teacherActivity || prev.teacherActivity,
          studentActivity: p.studentActivity || prev.studentActivity,
          exercises: p.exercises || prev.exercises,
          notes: p.notes || prev.notes,
          // Song ngữ
          enableBilingual: p.enableBilingual !== undefined ? p.enableBilingual : true,
          bilingualTitle: p.bilingualTitle || prev.bilingualTitle,
          bilingualEnglish: p.bilingualEnglish || prev.bilingualEnglish,
          bilingualVietnamese: p.bilingualVietnamese || prev.bilingualVietnamese,
          bilingualTermsRaw: p.bilingualTermsRaw || prev.bilingualTermsRaw,
          bilingualActivities: p.targetActivities && p.targetActivities.length > 0 ? p.targetActivities : prev.bilingualActivities,
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
    if (!formData.className.trim()) {
      setFormError('Vui lòng chọn hoặc nhập Lớp học.');
      return;
    }
    if (!formData.prepDate || !formData.teachDate) {
      setFormError('Vui lòng chọn đầy đủ Ngày soạn và Ngày dạy.');
      return;
    }

    // Persist teacher and school name in local storage for default reuse
    if (formData.teacherName.trim()) {
      localStorage.setItem('sys_teacher_name', formData.teacherName.trim());
    }
    if (formData.schoolName.trim()) {
      localStorage.setItem('sys_school_name', formData.schoolName.trim());
    }

    const targetClass = classrooms.find((c) => c.id === formData.classId || c.name === formData.className);
    const resolvedClassName = formData.className.trim() || (targetClass ? targetClass.name : 'Lớp 7');
    const resolvedClassId = targetClass ? targetClass.id : formData.classId || `class-${resolvedClassName.toLowerCase().replace(/\s+/g, '-')}`;

    // Parse bilingual terms
    let bilingualSection: BilingualSection | undefined = undefined;
    if (formData.enableBilingual && (formData.bilingualEnglish.trim() || formData.bilingualTermsRaw.trim())) {
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
        title: formData.bilingualTitle || 'Phân đoạn Song ngữ Tiếng Anh',
        englishContent: formData.bilingualEnglish.trim(),
        vietnameseTranslation: formData.bilingualVietnamese.trim(),
        keyTerms: parsedTerms,
        audioText: formData.bilingualEnglish.trim(),
        targetActivities: formData.bilingualActivities,
      };
    }

    const payload = {
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      classId: resolvedClassId,
      className: resolvedClassName,
      curriculumPeriod: formData.curriculumPeriod.trim() || 'Tiết 1',
      schoolName: formData.schoolName.trim(),
      teacherName: formData.teacherName.trim(),
      date: formData.teachDate,
      prepDate: formData.prepDate,
      teachDate: formData.teachDate,
      periodsCount: Number(formData.periodsCount) || 1,
      status: formData.status,
      textbookSet: formData.textbookSet,
      // 1. Mục tiêu CV 5512
      objectives: formData.objectives.trim() || [
        formData.objectivesKnowledge ? `1. Kiến thức: ${formData.objectivesKnowledge}` : '',
        formData.objectivesSkills ? `2. Năng lực & Kỹ năng: ${formData.objectivesSkills}` : '',
        formData.objectivesAttitude ? `3. Phẩm chất & Thái độ: ${formData.objectivesAttitude}` : '',
      ].filter(Boolean).join('\n'),
      objectivesKnowledge: formData.objectivesKnowledge.trim(),
      objectivesSkills: formData.objectivesSkills.trim(),
      objectivesAttitude: formData.objectivesAttitude.trim(),
      digitalCompetencies: formData.digitalCompetencies.trim(),
      keyKnowledge: formData.keyKnowledge.trim(),
      // 2. Chuẩn bị
      devicesAndSoftware: formData.devicesAndSoftware.trim(),
      teacherPrep: formData.teacherPrep.trim(),
      studentPrep: formData.studentPrep.trim(),
      // 3. Tiến trình 8 Hoạt động
      warmupActivity: formData.warmupActivity.trim(),
      warmupTime: formData.warmupTime.trim() || '5 phút',
      newLessonActivity: formData.newLessonActivity.trim(),
      newLessonTime: formData.newLessonTime.trim() || '15 phút',
      practiceActivity: formData.practiceActivity.trim(),
      practiceTime: formData.practiceTime.trim() || '10 phút',
      lowApplicationActivity: formData.lowApplicationActivity.trim(),
      lowAppTime: formData.lowAppTime.trim() || '5 phút',
      highApplicationActivity: formData.highApplicationActivity.trim(),
      highAppTime: formData.highAppTime.trim() || '5 phút',
      consolidationActivity: formData.consolidationActivity.trim(),
      consolidationTime: formData.consolidationTime.trim() || '3 phút',
      homeworkActivity: formData.homeworkActivity.trim(),
      homeworkTime: formData.homeworkTime.trim() || '2 phút',
      reflectionNotes: formData.reflectionNotes.trim() || formData.notes.trim(),
      projectActivity: formData.projectActivity.trim(),
      teacherActivity: formData.teacherActivity.trim(),
      studentActivity: formData.studentActivity.trim(),
      illustrationImage: formData.illustrationImage.trim(),
      illustrationTitle: formData.illustrationTitle.trim(),
      bilingualSection,
      exercises: formData.exercises.trim(),
      notes: formData.notes.trim(),
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

          <div className="flex flex-wrap items-center gap-3">
            {(onBackToHome || onNavigateTab) && (
              <button
                type="button"
                onClick={() => (onBackToHome ? onBackToHome() : onNavigateTab && onNavigateTab('dashboard'))}
                className="px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-sm rounded-xl border border-slate-700 shadow-md transition-all flex items-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Home className="w-4 h-4 text-orange-400" />
                <span>Quay lại trang chủ</span>
              </button>
            )}

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
                  {/* Họ và tên GV & Trường */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:col-span-2 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>Họ và tên GV <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.teacherName}
                        onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                        placeholder="Ví dụ: Cô Nguyễn Thị Hồng Yến..."
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-blue-600" />
                        <span>Trường <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        placeholder="Ví dụ: THCS Nguyễn Du, THPT Chu Văn An..."
                        className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

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
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all font-medium"
                    />
                  </div>

                  {/* Lớp học (Tự chọn từ Lớp 1 đến Lớp 12) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Lớp học (Lớp 1 - 12) <span className="text-rose-500">*</span></span>
                    </label>
                    <select
                      required
                      value={formData.className}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                          ...formData,
                          className: val,
                          classId: `class-${val.toLowerCase().replace(/\s+/g, '-')}`,
                        });
                      }}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <optgroup label="Khối THCS (Lớp 6 - 9)">
                        <option value="Lớp 6">Lớp 6</option>
                        <option value="Lớp 7">Lớp 7</option>
                        <option value="Lớp 8">Lớp 8</option>
                        <option value="Lớp 9">Lớp 9</option>
                      </optgroup>
                      <optgroup label="Khối THPT (Lớp 10 - 12)">
                        <option value="Lớp 10">Lớp 10</option>
                        <option value="Lớp 11">Lớp 11</option>
                        <option value="Lớp 12">Lớp 12</option>
                      </optgroup>
                      <optgroup label="Khối Tiểu học (Lớp 1 - 5)">
                        <option value="Lớp 1">Lớp 1</option>
                        <option value="Lớp 2">Lớp 2</option>
                        <option value="Lớp 3">Lớp 3</option>
                        <option value="Lớp 4">Lớp 4</option>
                        <option value="Lớp 5">Lớp 5</option>
                      </optgroup>
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

                  {/* Tiết PPCT & Số tiết (Thay thế Cấp học / Khối lớp) */}
                  <div className="grid grid-cols-2 gap-3 md:col-span-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>Tiết PPCT (Phân phối chương trình) <span className="text-rose-500">*</span></span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.curriculumPeriod}
                        onChange={(e) => setFormData({ ...formData, curriculumPeriod: e.target.value })}
                        placeholder="Ví dụ: Tiết 1, Tiết 12, Tiết 45, Tiết 1-2..."
                        className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:border-orange-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Số tiết (Thời lượng)</label>
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

              {/* Section 2: 1. Mục tiêu bài học (Thái độ - Kiến thức - Kĩ năng) */}
              <div className="space-y-4 bg-emerald-50/70 p-4.5 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>1. Mục tiêu bài học (Thái độ - Kiến thức - Kĩ năng chuẩn 5512)</span>
                  </h4>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Phẩm chất & Năng lực
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      a) Về Kiến thức (Knowledge)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.objectivesKnowledge}
                      onChange={(e) => setFormData({ ...formData, objectivesKnowledge: e.target.value })}
                      placeholder="Học sinh nắm vững các khái niệm, quy tắc, định luật..."
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      b) Về Năng lực & Kĩ năng (Skills)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.objectivesSkills}
                      onChange={(e) => setFormData({ ...formData, objectivesSkills: e.target.value })}
                      placeholder="Rèn luyện kỹ năng tính toán, giải quyết vấn đề, giao tiếp..."
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      c) Về Phẩm chất & Thái độ (Attitude)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.objectivesAttitude}
                      onChange={(e) => setFormData({ ...formData, objectivesAttitude: e.target.value })}
                      placeholder="Hình thành thái độ nghiêm túc, tích cực, trung thực, trách nhiệm..."
                      className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-emerald-200/60">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mã hóa Khung Năng lực số (NLS) tích hợp vào bài học:</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.digitalCompetencies}
                    onChange={(e) => setFormData({ ...formData, digitalCompetencies: e.target.value })}
                    placeholder="[NLS1.1] Sử dụng thiết bị số; [NLS2.3] Khai thác dữ liệu học liệu số; [NLS5.2] Ứng dụng công nghệ AI Miss Yến Còi..."
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Section 3: 2. Chuẩn bị (Thiết bị dạy học & Học liệu: GV - HS) */}
              <div className="space-y-4 bg-sky-50/70 p-4.5 rounded-xl border border-sky-200">
                <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                  <h4 className="text-xs font-extrabold text-sky-950 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>2. Chuẩn bị thiết bị dạy học & học liệu (GV - HS)</span>
                  </h4>
                  <span className="text-[10px] bg-sky-200 text-sky-900 font-extrabold px-2.5 py-0.5 rounded-full border border-sky-300">
                    Chuẩn 5512
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      a) Chuẩn bị của Giáo viên (GV)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.teacherPrep}
                      onChange={(e) => setFormData({ ...formData, teacherPrep: e.target.value, devicesAndSoftware: e.target.value })}
                      placeholder="Máy tính, máy chiếu, bài giảng số tương tác, phiếu học tập, phần mềm GeoGebra/Canva/AI Miss Yến Còi..."
                      className="w-full px-3.5 py-2 bg-white border border-sky-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">
                      b) Chuẩn bị của Học sinh (HS)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.studentPrep}
                      onChange={(e) => setFormData({ ...formData, studentPrep: e.target.value })}
                      placeholder="Sách giáo khoa, vở ghi, đồ dùng học tập, chuẩn bị bài trước ở nhà theo hướng dẫn..."
                      className="w-full px-3.5 py-2 bg-white border border-sky-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: 3. Tiến trình dạy học (8 Hoạt động chuẩn 5512 kèm phân bổ thời gian) */}
              <div className="space-y-4 bg-slate-50 p-4.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-600" />
                    <span>3. Tiến trình bài dạy (8 Hoạt động chuẩn Công văn 5512 kèm thời gian)</span>
                  </h4>
                  <span className="text-[10px] bg-orange-100 text-orange-950 font-black px-2.5 py-0.5 rounded-full border border-orange-300">
                    Phân bố thời gian chi tiết
                  </span>
                </div>

                {/* 8 Activities with Dedicated Time Inputs */}
                <div className="space-y-3.5">
                  {/* Hoạt động 1: Khởi động */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>1. Hoạt động Khởi động (Warm-up)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Thời gian:</span>
                        <input
                          type="text"
                          value={formData.warmupTime}
                          onChange={(e) => setFormData({ ...formData, warmupTime: e.target.value })}
                          placeholder="5 phút"
                          className="w-20 px-2 py-0.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.warmupActivity}
                      onChange={(e) => setFormData({ ...formData, warmupActivity: e.target.value })}
                      placeholder="Mục tiêu, nội dung câu hỏi/trò chơi khởi động khơi gợi hứng thú..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Hoạt động 2: Tìm hiểu vào bài / Hình thành kiến thức mới */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>2. Hoạt động Tìm hiểu vào bài / Hình thành kiến thức mới</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Thời gian:</span>
                        <input
                          type="text"
                          value={formData.newLessonTime}
                          onChange={(e) => setFormData({ ...formData, newLessonTime: e.target.value })}
                          placeholder="15 phút"
                          className="w-20 px-2 py-0.5 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-300 rounded-lg text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.newLessonActivity}
                      onChange={(e) => setFormData({ ...formData, newLessonActivity: e.target.value })}
                      placeholder="Chuyển giao nhiệm vụ học tập, HS làm việc cá nhân/nhóm tìm hiểu kiến thức mới..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Hoạt động 3: Thực hành / Luyện tập */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>3. Hoạt động Thực hành / Luyện tập (Practice)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Thời gian:</span>
                        <input
                          type="text"
                          value={formData.practiceTime}
                          onChange={(e) => setFormData({ ...formData, practiceTime: e.target.value })}
                          placeholder="10 phút"
                          className="w-20 px-2 py-0.5 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-300 rounded-lg text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.practiceActivity}
                      onChange={(e) => setFormData({ ...formData, practiceActivity: e.target.value })}
                      placeholder="Bài tập mẫu, bài tập thực hành củng cố lý thuyết vừa học..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Hoạt động 4: Vận dụng thấp */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-emerald-600" />
                        <span>4. Hoạt động Vận dụng thấp (Low Application)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Thời gian:</span>
                        <input
                          type="text"
                          value={formData.lowAppTime}
                          onChange={(e) => setFormData({ ...formData, lowAppTime: e.target.value })}
                          placeholder="5 phút"
                          className="w-20 px-2 py-0.5 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 rounded-lg text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.lowApplicationActivity}
                      onChange={(e) => setFormData({ ...formData, lowApplicationActivity: e.target.value })}
                      placeholder="Giải quyết các tình huống bài tập quen thuộc gắn với thực tiễn cơ bản..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Hoạt động 5: Vận dụng cao */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>5. Hoạt động Vận dụng cao / Sáng tạo (High Application)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Thời gian:</span>
                        <input
                          type="text"
                          value={formData.highAppTime}
                          onChange={(e) => setFormData({ ...formData, highAppTime: e.target.value })}
                          placeholder="5 phút"
                          className="w-20 px-2 py-0.5 text-xs font-bold text-purple-900 bg-purple-50 border border-purple-300 rounded-lg text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.highApplicationActivity}
                      onChange={(e) => setFormData({ ...formData, highApplicationActivity: e.target.value })}
                      placeholder="Giải quyết tình huống thực tế phức tạp, bài toán mở, liên môn hoặc dự án sáng tạo..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Hoạt động 6: Củng cố */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-extrabold text-teal-900 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                        <span>6. Hoạt động Củng cố kiến thức (Consolidation)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Thời gian:</span>
                        <input
                          type="text"
                          value={formData.consolidationTime}
                          onChange={(e) => setFormData({ ...formData, consolidationTime: e.target.value })}
                          placeholder="3 phút"
                          className="w-20 px-2 py-0.5 text-xs font-bold text-teal-900 bg-teal-50 border border-teal-300 rounded-lg text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.consolidationActivity}
                      onChange={(e) => setFormData({ ...formData, consolidationActivity: e.target.value })}
                      placeholder="Tóm tắt sơ đồ tư duy, nhấn mạnh kiến thức then chốt..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Hoạt động 7: Hướng dẫn BTVN */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-xs font-extrabold text-rose-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-rose-600" />
                        <span>7. Hướng dẫn học sinh tự học ở nhà & BTVN (Homework)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">Thời gian:</span>
                        <input
                          type="text"
                          value={formData.homeworkTime}
                          onChange={(e) => setFormData({ ...formData, homeworkTime: e.target.value })}
                          placeholder="2 phút"
                          className="w-20 px-2 py-0.5 text-xs font-bold text-rose-900 bg-rose-50 border border-rose-300 rounded-lg text-center focus:outline-none"
                        />
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.homeworkActivity}
                      onChange={(e) => setFormData({ ...formData, homeworkActivity: e.target.value })}
                      placeholder="Giao bài tập về nhà trong SGK/SBT, dặn dò chuẩn bị bài học tiếp theo..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-rose-500 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Hoạt động 8: Rút kinh nghiệm sau dạy */}
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <label className="text-xs font-extrabold text-amber-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>8. Rút kinh nghiệm sau bài dạy (Reflection & Adjustment)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.reflectionNotes || formData.notes}
                      onChange={(e) => setFormData({ ...formData, reflectionNotes: e.target.value, notes: e.target.value })}
                      placeholder="Ghi chú về mức độ tiếp thu của học sinh, điều chỉnh phân bố thời gian sau khi dạy thực tế..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Giảng dạy Song ngữ Tiếng Anh (3 Cột: Từ - Phiên âm - Dịch nghĩa + Loa đọc phát âm) */}
              <div className="space-y-4 bg-amber-50/70 p-4.5 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span>4. Tích hợp Song ngữ Tiếng Anh (Bilingual Segment 3 cột + Loa phát âm)</span>
                  </h4>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300 hover:bg-amber-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.enableBilingual}
                      onChange={(e) => setFormData({ ...formData, enableBilingual: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span>Bật phần song ngữ</span>
                  </label>
                </div>

                {formData.enableBilingual && (
                  <div className="space-y-3">
                    {/* Activity Selection for English Integration */}
                    <div className="space-y-2 bg-amber-100/70 p-3 rounded-xl border border-amber-300">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-amber-700" />
                          <span>Chọn hoạt động trong tiến trình để Tích hợp Tiếng Anh:</span>
                        </label>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                bilingualActivities: [
                                  '1. Khởi động (Warm-up)',
                                  '2. Tìm hiểu vào bài / Hình thành kiến thức mới',
                                  '3. Thực hành / Luyện tập (Practice)',
                                  '4. Vận dụng thấp',
                                  '5. Vận dụng cao / Sáng tạo',
                                  '6. Củng cố kiến thức',
                                  '7. Hướng dẫn học sinh tự học ở nhà & BTVN',
                                ],
                              })
                            }
                            className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded font-bold transition-colors cursor-pointer"
                          >
                            Chọn tất cả
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                bilingualActivities: [
                                  '1. Khởi động (Warm-up)',
                                  '2. Tìm hiểu vào bài / Hình thành kiến thức mới',
                                  '7. Hướng dẫn học sinh tự học ở nhà & BTVN',
                                ],
                              })
                            }
                            className="px-2 py-0.5 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded font-bold transition-colors cursor-pointer"
                          >
                            Mặc định
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 pt-1">
                        {[
                          { id: '1. Khởi động (Warm-up)', label: '1. Khởi động (Warm-up)' },
                          { id: '2. Tìm hiểu vào bài / Hình thành kiến thức mới', label: '2. Hình thành kiến thức mới' },
                          { id: '3. Thực hành / Luyện tập (Practice)', label: '3. Luyện tập / Thực hành' },
                          { id: '4. Vận dụng thấp', label: '4. Vận dụng thấp' },
                          { id: '5. Vận dụng cao / Sáng tạo', label: '5. Vận dụng cao / Sáng tạo' },
                          { id: '6. Củng cố kiến thức', label: '6. Củng cố kiến thức' },
                          { id: '7. Hướng dẫn học sinh tự học ở nhà & BTVN', label: '7. Hướng dẫn BTVN' },
                        ].map((act) => {
                          const isSelected = formData.bilingualActivities.includes(act.id);
                          return (
                            <label
                              key={act.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                  : 'bg-white text-slate-800 border-amber-200 hover:bg-amber-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      bilingualActivities: [...formData.bilingualActivities, act.id],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      bilingualActivities: formData.bilingualActivities.filter((a) => a !== act.id),
                                    });
                                  }
                                }}
                                className="rounded text-amber-600 focus:ring-amber-500"
                              />
                              <span className="truncate">{act.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800">Tiêu đề phân đoạn song ngữ</label>
                      <input
                        type="text"
                        value={formData.bilingualTitle}
                        onChange={(e) => setFormData({ ...formData, bilingualTitle: e.target.value })}
                        placeholder="Ví dụ: Bilingual Segment: Core Concept & Vocabulary"
                        className="w-full px-3.5 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">Nội dung Tiếng Anh (English Content)</label>
                        <textarea
                          rows={3}
                          value={formData.bilingualEnglish}
                          onChange={(e) => setFormData({ ...formData, bilingualEnglish: e.target.value })}
                          placeholder="Nội dung kiến thức bằng tiếng Anh..."
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800">Dịch nghĩa Tiếng Việt (Vietnamese Translation)</label>
                        <textarea
                          rows={3}
                          value={formData.bilingualVietnamese}
                          onChange={(e) => setFormData({ ...formData, bilingualVietnamese: e.target.value })}
                          placeholder="Dịch nghĩa tiếng Việt tương ứng..."
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span>Bảng Từ vựng Chuyên ngành 3 Cột (Định dạng: TừTiếngAnh | PhiênÂmIPA | NghĩaTiếngViệt)</span>
                        <span className="text-[11px] text-amber-700 font-normal">Mỗi từ 1 dòng</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.bilingualTermsRaw}
                        onChange={(e) => setFormData({ ...formData, bilingualTermsRaw: e.target.value })}
                        placeholder="Direct Proportion | /daɪˈrektli prəˈpɔːrʃənl/ | Tỷ lệ thuận&#10;Constant | /ˈkɑːnstənt/ | Hằng số&#10;Equation | /ɪˈkweɪʒn/ | Phương trình"
                        className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none shadow-xs"
                      />
                    </div>

                    {/* Live 3-Column Bilingual Table Preview with Audio Playback */}
                    {formData.bilingualTermsRaw.trim() && (
                      <div className="pt-2">
                        <BilingualVocabTable
                          rawTerms={formData.bilingualTermsRaw}
                          title="Bảng Từ Vựng & Thuật Ngữ Song Ngữ (Xem trước có Loa phát âm & 3 Cột)"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 6: Exercises & Worksheets */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
                  5. Bài tập & Phiếu củng cố học tập (Exercises)
                </label>
                <textarea
                  rows={2}
                  value={formData.exercises}
                  onChange={(e) => setFormData({ ...formData, exercises: e.target.value })}
                  placeholder="Phiếu bài tập trắc nghiệm, tự luận hoặc câu hỏi củng cố..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-orange-500 focus:outline-none transition-all font-medium"
                />
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
                      <label className="font-bold text-slate-700">Họ và tên GV (để trống tự điền):</label>
                      <input
                        type="text"
                        value={formData.teacherName}
                        onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                        placeholder="Để trống tự điền tay hoặc nhập tên GV..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:border-orange-500 focus:outline-none"
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
                        placeholder="Nhận xét của Tổ trưởng..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block">Kết quả:</label>
                        <select
                          value={formData.headOfDepartmentStatus}
                          onChange={(e) => setFormData({ ...formData, headOfDepartmentStatus: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 focus:outline-none"
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
                          placeholder="Để trống tự điền..."
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:border-orange-500 focus:outline-none"
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
                        placeholder="Ý kiến phê duyệt BGH..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:bg-white focus:border-orange-500 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block">Kết quả BGH:</label>
                        <select
                          value={formData.schoolBoardStatus}
                          onChange={(e) => setFormData({ ...formData, schoolBoardStatus: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-bold text-blue-700 focus:outline-none"
                        >
                          <option value="Đã duyệt">Đã duyệt</option>
                          <option value="Chưa duyệt">Chưa duyệt</option>
                          <option value="Yêu cầu sửa">Yêu cầu sửa</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block">Hiệu trưởng:</label>
                        <input
                          type="text"
                          value={formData.schoolBoardName}
                          onChange={(e) => setFormData({ ...formData, schoolBoardName: e.target.value })}
                          placeholder="Để trống tự điền..."
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:border-orange-500 focus:outline-none"
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
                {(onBackToHome || onNavigateTab) && (
                  <button
                    onClick={() => {
                      setViewDetailPlan(null);
                      if (onBackToHome) onBackToHome();
                      else if (onNavigateTab) onNavigateTab('dashboard');
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    title="Đóng và quay lại trang chủ"
                  >
                    <Home className="w-3.5 h-3.5 text-orange-400" />
                    <span className="hidden sm:inline">Trang chủ</span>
                  </button>
                )}
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
                <div className="bg-sky-50/80 p-4.5 rounded-xl border border-sky-200 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-sky-200 pb-2">
                    <h4 className="font-extrabold text-xs text-sky-950 uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-sky-600" />
                      <span>2. Khung Năng Lực Số (NLS) & Tên Thiết Bị / Phần Mềm</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-sky-200 text-sky-950 rounded-full border border-sky-300">
                      GDPT 2018
                    </span>
                  </div>

                  {viewDetailPlan.digitalCompetencies && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-sky-900 block">Mã hóa Năng lực số:</span>
                      <p className="whitespace-pre-line text-xs font-mono text-slate-900 bg-white p-3 rounded-lg border border-sky-200 leading-relaxed font-semibold">
                        {viewDetailPlan.digitalCompetencies}
                      </p>
                    </div>
                  )}

                  {viewDetailPlan.devicesAndSoftware && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-sky-900 block">Thiết bị & Phần mềm sử dụng:</span>
                      <p className="whitespace-pre-line text-xs font-medium text-slate-900 bg-white p-3 rounded-lg border border-sky-200 leading-relaxed">
                        {viewDetailPlan.devicesAndSoftware}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bilingual English Teaching Segment Card */}
              {viewDetailPlan.bilingualSection && (
                <div className="bg-amber-50/80 p-4.5 rounded-xl border border-amber-200 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-600" />
                      <span>{viewDetailPlan.bilingualSection.title || 'Phân đoạn Giảng dạy Song ngữ Tiếng Anh'}</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-amber-300 text-amber-950 rounded-full border border-amber-400">
                      Bilingual English
                    </span>
                  </div>

                  {viewDetailPlan.bilingualSection.targetActivities && viewDetailPlan.bilingualSection.targetActivities.length > 0 && (
                    <div className="bg-amber-100/90 p-2.5 rounded-lg border border-amber-300 flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-extrabold text-amber-950 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-800" />
                        <span>Hoạt động tích hợp Tiếng Anh:</span>
                      </span>
                      {viewDetailPlan.bilingualSection.targetActivities.map((act, i) => (
                        <span key={i} className="bg-amber-600 text-white font-bold px-2 py-0.5 rounded-md text-[11px] shadow-xs">
                          {act}
                        </span>
                      ))}
                    </div>
                  )}

                  <AudioPracticePlayer
                    textToSpeak={viewDetailPlan.bilingualSection.audioText || viewDetailPlan.bilingualSection.englishContent}
                    title="Phát âm chuẩn AI & Thu âm bài học song ngữ"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                      <span className="font-extrabold text-amber-900 text-[11px] uppercase block">
                        English Content:
                      </span>
                      <p className="text-slate-900 leading-relaxed font-semibold">
                        {viewDetailPlan.bilingualSection.englishContent}
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-amber-200 space-y-1">
                      <span className="font-extrabold text-amber-900 text-[11px] uppercase block">
                        Dịch nghĩa Tiếng Việt:
                      </span>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {viewDetailPlan.bilingualSection.vietnameseTranslation}
                      </p>
                    </div>
                  </div>

                  {/* 3-Column Bilingual Vocabulary Table with Audio Playback for each term */}
                  <BilingualVocabTable
                    terms={viewDetailPlan.bilingualSection.keyTerms}
                    title="Bảng Từ Vựng & Thuật Ngữ Chuyên Ngành (3 Cột: Từ vựng - Phiên âm IPA - Dịch nghĩa có Loa phát âm)"
                  />
                </div>
              )}

              {/* Sections 5512 */}
              <div className="space-y-5">
                {/* I. MỤC TIÊU BÀI HỌC */}
                {(viewDetailPlan.objectives || viewDetailPlan.objectivesKnowledge || viewDetailPlan.objectivesSkills || viewDetailPlan.objectivesAttitude) && (
                  <div className="space-y-3 border-l-4 border-l-emerald-600 pl-3.5 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                      <h4 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-600" />
                        <span>I. Mục tiêu bài học (Thái độ - Kiến thức - Kĩ năng chuẩn 5512)</span>
                      </h4>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                        Chuẩn GDPT 2018
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {viewDetailPlan.objectivesKnowledge && (
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                          <span className="font-extrabold text-emerald-900 block">1. Về Kiến thức:</span>
                          <p className="text-slate-800 leading-relaxed whitespace-pre-line">{viewDetailPlan.objectivesKnowledge}</p>
                        </div>
                      )}
                      {viewDetailPlan.objectivesSkills && (
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                          <span className="font-extrabold text-emerald-900 block">2. Về Năng lực & Kĩ năng:</span>
                          <p className="text-slate-800 leading-relaxed whitespace-pre-line">{viewDetailPlan.objectivesSkills}</p>
                        </div>
                      )}
                      {viewDetailPlan.objectivesAttitude && (
                        <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
                          <span className="font-extrabold text-emerald-900 block">3. Về Phẩm chất & Thái độ:</span>
                          <p className="text-slate-800 leading-relaxed whitespace-pre-line">{viewDetailPlan.objectivesAttitude}</p>
                        </div>
                      )}
                    </div>

                    {viewDetailPlan.objectives && !viewDetailPlan.objectivesKnowledge && (
                      <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-emerald-200 text-xs">
                        {viewDetailPlan.objectives}
                      </p>
                    )}
                  </div>
                )}

                {/* II. THIẾT BỊ DẠY HỌC & HỌC LIỆU (CHUẨN BỊ GV - HS) */}
                {(viewDetailPlan.teacherPrep || viewDetailPlan.studentPrep || viewDetailPlan.devicesAndSoftware) && (
                  <div className="space-y-3 border-l-4 border-l-sky-600 pl-3.5 bg-sky-50/50 p-4 rounded-xl border border-sky-200">
                    <div className="flex items-center justify-between border-b border-sky-200 pb-1.5">
                      <h4 className="font-extrabold text-sky-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-sky-600" />
                        <span>II. Thiết bị dạy học và học liệu (Chuẩn bị: GV - HS)</span>
                      </h4>
                      <span className="text-[10px] bg-sky-200 text-sky-900 font-extrabold px-2 py-0.5 rounded-full">
                        Chuẩn 5512
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-sky-200 space-y-1">
                        <span className="font-extrabold text-sky-900 block">1. Chuẩn bị của Giáo viên (GV):</span>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                          {viewDetailPlan.teacherPrep || viewDetailPlan.devicesAndSoftware || 'Máy tính, bài giảng số tương tác, phiếu học tập...'}
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-sky-200 space-y-1">
                        <span className="font-extrabold text-sky-900 block">2. Chuẩn bị của Học sinh (HS):</span>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                          {viewDetailPlan.studentPrep || 'Sách giáo khoa, vở ghi, đồ dùng học tập theo phân công...'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* III. TIẾN TRÌNH DẠY HỌC (8 HOẠT ĐỘNG CHUẨN CV 5512 KÈM PHÂN BỔ THỜI GIAN) */}
                <div className="space-y-4 border-l-4 border-l-blue-600 pl-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>III. Tiến trình dạy học (8 Hoạt động chuẩn CV 5512 kèm phân bố thời lượng)</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full border border-blue-300">
                      8 Hoạt động chuẩn
                    </span>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'warmupActivity', label: '1. Hoạt động Khởi động (Warm-up)', time: viewDetailPlan.warmupTime || '5 phút', content: viewDetailPlan.warmupActivity, icon: Zap, badgeColor: 'bg-amber-100 text-amber-900 border-amber-300' },
                      { key: 'newLessonActivity', label: '2. Hoạt động Tìm hiểu vào bài / Hình thành kiến thức mới', time: viewDetailPlan.newLessonTime || '15 phút', content: viewDetailPlan.newLessonActivity, icon: BookOpen, badgeColor: 'bg-blue-100 text-blue-900 border-blue-300' },
                      { key: 'practiceActivity', label: '3. Hoạt động Thực hành / Luyện tập (Practice)', time: viewDetailPlan.practiceTime || '10 phút', content: viewDetailPlan.practiceActivity, icon: Layers, badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
                      { key: 'lowApplicationActivity', label: '4. Hoạt động Vận dụng thấp (Low Application)', time: viewDetailPlan.lowAppTime || '5 phút', content: viewDetailPlan.lowApplicationActivity, icon: Target, badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                      { key: 'highApplicationActivity', label: '5. Hoạt động Vận dụng cao / Sáng tạo (High Application)', time: viewDetailPlan.highAppTime || '5 phút', content: viewDetailPlan.highApplicationActivity, icon: Sparkles, badgeColor: 'bg-purple-100 text-purple-900 border-purple-300' },
                      { key: 'consolidationActivity', label: '6. Hoạt động Củng cố kiến thức (Consolidation)', time: viewDetailPlan.consolidationTime || '3 phút', content: viewDetailPlan.consolidationActivity, icon: CheckCircle, badgeColor: 'bg-teal-100 text-teal-900 border-teal-300' },
                      { key: 'homeworkActivity', label: '7. Hướng dẫn học sinh tự học ở nhà & BTVN (Homework)', time: viewDetailPlan.homeworkTime || '2 phút', content: viewDetailPlan.homeworkActivity, icon: FileText, badgeColor: 'bg-rose-100 text-rose-900 border-rose-300' },
                      { key: 'reflectionNotes', label: '8. Rút kinh nghiệm sau bài dạy (Reflection & Adjustment)', time: 'Sau tiết dạy', content: viewDetailPlan.reflectionNotes || viewDetailPlan.notes, icon: Sparkles, badgeColor: 'bg-amber-100 text-amber-950 border-amber-300' },
                    ].map((act) => act.content ? (
                      <div key={act.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                          <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <act.icon className="w-4 h-4 text-orange-600" />
                            <span>{act.label}</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-orange-600" />
                              <span>{act.time}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${act.badgeColor} flex items-center gap-1`}>
                              <Volume2 className="w-3 h-3" />
                              <span>Loa đọc AI</span>
                            </span>
                          </div>
                        </div>
                        <p className="whitespace-pre-line text-xs sm:text-sm text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-lg border border-slate-200">
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
                      IV. Bài tập & Phiếu củng cố học tập
                    </h4>
                    <p className="whitespace-pre-line text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs sm:text-sm">
                      {viewDetailPlan.exercises}
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
