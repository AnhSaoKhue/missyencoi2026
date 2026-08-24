export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface StudentAttendance {
  studentId: string;
  studentCode: string;
  studentName: string;
  status: AttendanceStatus;
  note: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  records: StudentAttendance[];
  savedAt: string;
}

export interface Student {
  id: string;
  code: string; // Mã học sinh
  name: string; // Họ và tên
  notes?: string; // Ghi chú
  createdAt: string; // Ngày tạo
}

export interface Classroom {
  id: string;
  name: string; // Tên lớp, ví dụ "Lớp 7A1"
  subject: string; // Môn học, ví dụ "Toán"
  schoolYear: string; // Năm học, ví dụ "2026–2027"
  teacher: string; // Giáo viên phụ trách
  createdAt: string;
  students: Student[];
}

export interface BilingualVocab {
  word: string;
  ipa?: string;
  meaning: string;
}

export interface BilingualSection {
  title: string;
  englishContent: string;
  vietnameseTranslation: string;
  keyTerms?: BilingualVocab[];
  audioText?: string;
  targetActivities?: string[]; // Danh sách các hoạt động chọn tích hợp Tiếng Anh (vd: Khởi động, Luyện tập, BTVN...)
}

export interface LessonPlan {
  id: string;
  title: string; // Tên bài học (Bắt buộc)
  subject: string; // Môn học (Bắt buộc)
  classId: string; // ID lớp học (Bắt buộc)
  className: string; // Tên lớp học
  date: string; // Ngày dạy YYYY-MM-DD (Bắt buộc)
  prepDate?: string; // Ngày soạn YYYY-MM-DD
  teachDate?: string; // Ngày dạy YYYY-MM-DD
  periodsCount: number; // Số tiết (mặc định 1)
  curriculumPeriod?: string; // Tiết PPCT (Phân phối chương trình, vd: Tiết 1, Tiết 15, Tiết 45...)
  status: 'draft' | 'ready' | 'completed'; // Trạng thái
  gradeLevel?: string; // Cấp học/Lớp (vd: THCS - Khối 7, THPT - Lớp 10)
  textbookSet?: string; // Bộ sách ('Kết nối tri thức với cuộc sống' | 'Tiếng Anh Global Success')
  digitalCompetencies?: string; // Mã hóa Năng lực số (NLS1.1, NLS2.3, NLS3.2, NLS4.1, NLS5.2...)
  devicesAndSoftware?: string; // Thiết bị & Phần mềm
  
  // I. Mục tiêu chuẩn CV 5512 (Thái độ - Kiến thức - Kĩ năng)
  objectives: string; // Tổng hợp mục tiêu bài học
  objectivesKnowledge?: string; // 1. Về Kiến thức
  objectivesSkills?: string; // 2. Về Kĩ năng & Năng lực
  objectivesAttitude?: string; // 3. Về Phẩm chất / Thái độ
  keyKnowledge?: string; // Kiến thức trọng tâm / Bổ trợ
  
  // II. Thiết bị dạy học và học liệu (Chuẩn bị: GV - HS)
  teacherPrep?: string; // Chuẩn bị của Giáo viên (Thiết bị, kế hoạch bài dạy, bài giảng số, phiếu học tập...)
  studentPrep?: string; // Chuẩn bị của Học sinh (SGK, vở ghi, đồ dùng học tập, chuẩn bị bài trước...)

  // III. Tiến trình dạy học chuẩn 8 hoạt động kèm Thời lượng (Phút)
  warmupTime?: string; // Thời gian HĐ 1 (vd: "5 phút")
  warmupActivity: string; // 1. Khởi động (Warm-up)
  
  newLessonTime?: string; // Thời gian HĐ 2 (vd: "15 phút")
  newLessonActivity?: string; // 2. Hình thành kiến thức mới / Tìm hiểu vào bài
  
  practiceTime?: string; // Thời gian HĐ 3 (vd: "10 phút")
  practiceActivity?: string; // 3. Luyện tập / Thực hành
  
  lowAppTime?: string; // Thời gian HĐ 4 (vd: "5 phút")
  lowApplicationActivity?: string; // 4. Vận dụng thấp
  
  highAppTime?: string; // Thời gian HĐ 5 (vd: "5 phút")
  highApplicationActivity?: string; // 5. Vận dụng cao / Sáng tạo
  
  consolidationTime?: string; // Thời gian HĐ 6 (vd: "3 phút")
  consolidationActivity?: string; // 6. Củng cố kiến thức
  
  homeworkTime?: string; // Thời gian HĐ 7 (vd: "2 phút")
  homeworkActivity?: string; // 7. Hướng dẫn học ở nhà (BTVN)
  
  reflectionNotes?: string; // 8. Rút kinh nghiệm sau tiết dạy
  
  projectActivity?: string; // Hoạt động mở rộng / Dự án STEM
  teacherActivity: string; // Chi tiết Hoạt động của giáo viên
  studentActivity: string; // Chi tiết Hoạt động của học sinh
  bilingualSection?: BilingualSection; // Phân đoạn giảng dạy Song ngữ Tiếng Anh
  illustrationImage?: string; // Hình minh họa đúng trọng tâm sắc nét, nổi bật
  illustrationTitle?: string; // Tiêu đề hình minh họa bài học
  exercises: string; // Bài tập hoặc câu hỏi
  notes: string; // Ghi chú / Điều chỉnh bổ sung sau bài dạy
  
  // Chữ ký và Phê duyệt cuối bài
  schoolName?: string; // Tên trường học (VD: THCS Nguyễn Du)
  specialRequirements?: string; // Yêu cầu riêng của tiết dạy
  durationText?: string; // Thời lượng (1 tiết - 45 phút, 2 tiết...)
  teacherName?: string; // Họ tên Giáo viên soạn bài
  headOfDepartmentReview?: string; // Nhận xét / kiểm tra của Tổ chuyên môn
  headOfDepartmentStatus?: 'Chưa duyệt' | 'Đã duyệt' | 'Yêu cầu sửa';
  headOfDepartmentSignDate?: string;
  headOfDepartmentName?: string; // Họ tên Tổ trưởng chuyên môn
  schoolBoardReview?: string; // Nhận xét / kiểm tra của BGH - Nhà trường
  schoolBoardStatus?: 'Chưa duyệt' | 'Đã duyệt' | 'Yêu cầu sửa';
  schoolBoardSignDate?: string;
  schoolBoardName?: string; // Họ tên Hiệu trưởng / BGH

  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'teacher' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  schoolName: string;
  subject?: string;
  phone?: string;
}

// Phương án 2: Kiểm tra miệng đầu giờ
export interface Question {
  id: string;
  subject: string;
  classId?: string;
  content: string;
  answerKey?: string;
  level?: 'Dễ' | 'Trung bình' | 'Khó';
}

export interface OralTestResult {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  questionContent: string;
  score: number;
  comment: string;
  date: string;
  createdAt: string;
}

// Phương án 3: Thời khóa biểu
export interface ScheduleItem {
  id: string;
  dayOfWeek: number; // 2 = Thứ 2, 3 = Thứ 3, ..., 8 = Chủ Nhật
  period: number; // Tiết 1, 2, 3, 4, 5...
  subject: string;
  classId: string;
  className: string;
  room: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

// Phương án 4: Kho học liệu
export interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  textbookSet?: string; // Kết nối tri thức với cuộc sống | Global Success | Khác
  gradeLevel?: string; // Lớp 6, Lớp 7, Lớp 8, Lớp 9, Lớp 10, Lớp 11, Lớp 12
  curriculumVersion?: string; // Chương trình GDPT 2018 (Áp dụng 2026-2027)
  classId?: string;
  className?: string;
  linkUrl: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'youtube' | 'facebook' | 'hoclieu' | 'drive' | 'website' | 'other';
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
}

// Phương án 5: Bài tập & nộp bài
export interface Assignment {
  id: string;
  title: string;
  classId: string;
  className: string;
  subject: string;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  isSubmitted: boolean;
  submittedAt?: string;
  note?: string;
}

export interface GradingRecord {
  id: string;
  studentName: string;
  className: string;
  subject: string;
  type: 'multiple_choice' | 'essay' | 'english_4skills';
  title: string;
  score: number; // Max 10
  details: any;
  createdAt: string;
}

export type TabType =
  | 'dashboard'
  | 'lesson_plan'
  | 'lesson_history'
  | 'resources'
  | 'dashboard_data'
  | 'admin'
  | 'settings'
  | 'classes'
  | 'attendance'
  | 'attendance_stats'
  | 'attendance_history'
  | 'oral_test'
  | 'schedule'
  | 'homework'
  | 'grading';


