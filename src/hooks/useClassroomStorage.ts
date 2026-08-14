import { useState, useEffect } from 'react';
import {
  Classroom,
  Student,
  AttendanceSession,
  LessonPlan,
  Question,
  OralTestResult,
  ScheduleItem,
  ResourceItem,
  Assignment,
  HomeworkSubmission,
} from '../types';
import {
  INITIAL_CLASSROOMS,
  INITIAL_LESSON_PLANS,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_QUESTIONS,
  INITIAL_SCHEDULE,
  INITIAL_RESOURCES,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
} from '../data/sampleData';

const STORAGE_KEY = 'lop_hoc_cua_toi_data_v1';
const ATTENDANCE_STORAGE_KEY = 'lop_hoc_diem_danh_v1';
const LESSON_PLANS_STORAGE_KEY = 'lop_hoc_giao_an_v1';
const QUESTIONS_STORAGE_KEY = 'lop_hoc_cau_hoi_v1';
const ORAL_RESULTS_STORAGE_KEY = 'lop_hoc_kiem_tra_v1';
const SCHEDULE_STORAGE_KEY = 'lop_hoc_thoi_khoa_bieu_v1';
const RESOURCES_STORAGE_KEY = 'lop_hoc_hoc_lieu_v1';
const ASSIGNMENTS_STORAGE_KEY = 'lop_hoc_bai_tap_v1';
const SUBMISSIONS_STORAGE_KEY = 'lop_hoc_nop_bai_v1';

export function useClassroomStorage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc dữ liệu từ localStorage:', e);
    }
    return INITIAL_CLASSROOMS;
  });

  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>(() => {
    try {
      const saved = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc lịch sử điểm danh:', e);
    }
    return INITIAL_ATTENDANCE_SESSIONS;
  });

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem(LESSON_PLANS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc danh sách giáo án:', e);
    }
    return INITIAL_LESSON_PLANS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(QUESTIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc câu hỏi kiểm tra:', e);
    }
    return INITIAL_QUESTIONS;
  });

  const [oralTestResults, setOralTestResults] = useState<OralTestResult[]>(() => {
    try {
      const saved = localStorage.getItem(ORAL_RESULTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc kết quả kiểm tra miệng:', e);
    }
    return [];
  });

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc thời khóa biểu:', e);
    }
    return INITIAL_SCHEDULE;
  });

  const [resourceItems, setResourceItems] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem(RESOURCES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc kho học liệu:', e);
    }
    return INITIAL_RESOURCES;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc danh sách bài tập:', e);
    }
    return INITIAL_ASSIGNMENTS;
  });

  const [homeworkSubmissions, setHomeworkSubmissions] = useState<HomeworkSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc danh sách nộp bài:', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendanceSessions));
  }, [attendanceSessions]);

  useEffect(() => {
    localStorage.setItem(LESSON_PLANS_STORAGE_KEY, JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(ORAL_RESULTS_STORAGE_KEY, JSON.stringify(oralTestResults));
  }, [oralTestResults]);

  useEffect(() => {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(scheduleItems));
  }, [scheduleItems]);

  useEffect(() => {
    localStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(resourceItems));
  }, [resourceItems]);

  useEffect(() => {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(homeworkSubmissions));
  }, [homeworkSubmissions]);

  // Quản lý Lớp học
  const addClassroom = (newClass: Omit<Classroom, 'id' | 'createdAt' | 'students'>) => {
    const created: Classroom = {
      ...newClass,
      id: 'class-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
      students: [],
    };
    setClassrooms((prev) => [created, ...prev]);
    return created;
  };

  const updateClassroom = (updatedClass: Classroom) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === updatedClass.id ? updatedClass : c))
    );
  };

  const deleteClassroom = (classId: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== classId));
  };

  // Quản lý Học sinh
  const addStudent = (classId: string, studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...studentData,
      id: 'hs-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };

    setClassrooms((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            students: [newStudent, ...c.students],
          };
        }
        return c;
      })
    );
    return newStudent;
  };

  const addMultipleStudents = (
    classId: string,
    studentList: Array<Omit<Student, 'id' | 'createdAt'>>
  ) => {
    const now = Date.now();
    const newStudents: Student[] = studentList.map((s, idx) => ({
      ...s,
      id: 'hs-' + (now + idx) + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    }));

    setClassrooms((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            students: [...newStudents, ...c.students],
          };
        }
        return c;
      })
    );
    return newStudents.length;
  };

  const updateStudent = (classId: string, updatedStudent: Student) => {
    setClassrooms((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            students: c.students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
          };
        }
        return c;
      })
    );
  };

  const deleteStudent = (classId: string, studentId: string) => {
    setClassrooms((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            students: c.students.filter((s) => s.id !== studentId),
          };
        }
        return c;
      })
    );
  };

  // Quản lý Điểm danh
  const getAttendanceSession = (classId: string, date: string): AttendanceSession | undefined => {
    return attendanceSessions.find((s) => s.classId === classId && s.date === date);
  };

  const saveAttendanceSession = (session: Omit<AttendanceSession, 'id' | 'savedAt'>) => {
    const existingIndex = attendanceSessions.findIndex(
      (s) => s.classId === session.classId && s.date === session.date
    );

    const savedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      // Cập nhật phiên đã tồn tại
      const updated: AttendanceSession = {
        ...attendanceSessions[existingIndex],
        ...session,
        savedAt,
      };
      setAttendanceSessions((prev) =>
        prev.map((s, idx) => (idx === existingIndex ? updated : s))
      );
      return updated;
    } else {
      // Tạo phiên mới
      const newSession: AttendanceSession = {
        ...session,
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        savedAt,
      };
      setAttendanceSessions((prev) => [newSession, ...prev]);
      return newSession;
    }
  };

  const deleteAttendanceSession = (sessionId: string) => {
    setAttendanceSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Quản lý Giáo án
  const addLessonPlan = (newPlan: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const created: LessonPlan = {
      ...newPlan,
      id: 'lp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: now,
      updatedAt: now,
    };
    setLessonPlans((prev) => [created, ...prev]);
    return created;
  };

  const updateLessonPlan = (updatedPlan: LessonPlan) => {
    const now = new Date().toISOString();
    setLessonPlans((prev) =>
      prev.map((lp) => (lp.id === updatedPlan.id ? { ...updatedPlan, updatedAt: now } : lp))
    );
  };

  const deleteLessonPlan = (id: string) => {
    setLessonPlans((prev) => prev.filter((lp) => lp.id !== id));
  };

  // Phương án 2: Quản lý Câu hỏi & Kết quả kiểm tra miệng
  const addQuestion = (q: Omit<Question, 'id'>) => {
    const created: Question = {
      ...q,
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    };
    setQuestions((prev) => [created, ...prev]);
    return created;
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const saveOralTestResult = (result: Omit<OralTestResult, 'id' | 'createdAt'>) => {
    const created: OralTestResult = {
      ...result,
      id: 'oral-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    setOralTestResults((prev) => [created, ...prev]);
    return created;
  };

  const deleteOralTestResult = (id: string) => {
    setOralTestResults((prev) => prev.filter((r) => r.id !== id));
  };

  // Phương án 3: Quản lý Thời khóa biểu
  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const created: ScheduleItem = {
      ...item,
      id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    };
    setScheduleItems((prev) => [...prev, created]);
    return created;
  };

  const updateScheduleItem = (item: ScheduleItem) => {
    setScheduleItems((prev) => prev.map((s) => (s.id === item.id ? item : s)));
  };

  const deleteScheduleItem = (id: string) => {
    setScheduleItems((prev) => prev.filter((s) => s.id !== id));
  };

  // Phương án 4: Quản lý Kho học liệu
  const addResourceItem = (item: Omit<ResourceItem, 'id' | 'createdAt'>) => {
    const created: ResourceItem = {
      ...item,
      id: 'res-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    setResourceItems((prev) => [created, ...prev]);
    return created;
  };

  const deleteResourceItem = (id: string) => {
    setResourceItems((prev) => prev.filter((r) => r.id !== id));
  };

  // Phương án 5: Quản lý Bài tập & Nộp bài
  const addAssignment = (asg: Omit<Assignment, 'id' | 'createdAt'>) => {
    const created: Assignment = {
      ...asg,
      id: 'asg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => [created, ...prev]);
    return created;
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setHomeworkSubmissions((prev) => prev.filter((s) => s.assignmentId !== id));
  };

  const toggleHomeworkSubmission = (assignmentId: string, studentId: string) => {
    setHomeworkSubmissions((prev) => {
      const existing = prev.find((s) => s.assignmentId === assignmentId && s.studentId === studentId);
      if (existing) {
        return prev.map((s) =>
          s.assignmentId === assignmentId && s.studentId === studentId
            ? { ...s, isSubmitted: !s.isSubmitted, submittedAt: !s.isSubmitted ? new Date().toISOString() : undefined }
            : s
        );
      } else {
        return [
          ...prev,
          {
            id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            assignmentId,
            studentId,
            isSubmitted: true,
            submittedAt: new Date().toISOString(),
          },
        ];
      }
    });
  };

  const resetToSampleData = () => {
    setClassrooms(INITIAL_CLASSROOMS);
    setAttendanceSessions(INITIAL_ATTENDANCE_SESSIONS);
    setLessonPlans(INITIAL_LESSON_PLANS);
    setQuestions(INITIAL_QUESTIONS);
    setOralTestResults([]);
    setScheduleItems(INITIAL_SCHEDULE);
    setResourceItems(INITIAL_RESOURCES);
    setAssignments(INITIAL_ASSIGNMENTS);
    setHomeworkSubmissions(INITIAL_SUBMISSIONS);
  };

  return {
    classrooms,
    addClassroom,
    updateClassroom,
    deleteClassroom,
    addStudent,
    addMultipleStudents,
    updateStudent,
    deleteStudent,
    attendanceSessions,
    getAttendanceSession,
    saveAttendanceSession,
    deleteAttendanceSession,
    lessonPlans,
    addLessonPlan,
    updateLessonPlan,
    deleteLessonPlan,
    // Phương án 1-5 mới
    questions,
    addQuestion,
    deleteQuestion,
    oralTestResults,
    saveOralTestResult,
    deleteOralTestResult,
    scheduleItems,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    resourceItems,
    addResourceItem,
    deleteResourceItem,
    assignments,
    addAssignment,
    deleteAssignment,
    homeworkSubmissions,
    toggleHomeworkSubmission,
    resetToSampleData,
  };
}

