import React, { useState, useEffect } from 'react';
import { TabType, Classroom, Student } from './types';
import { useClassroomStorage } from './hooks/useClassroomStorage';
import { stopAllSpeech } from './utils/audioAlert';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ClassListView } from './components/ClassListView';
import { ClassDetailView } from './components/ClassDetailView';
import { AttendanceView } from './components/AttendanceView';
import { AttendanceHistoryView } from './components/AttendanceHistoryView';
import { LessonPlanView } from './components/LessonPlanView';
import { AttendanceStatsView } from './components/AttendanceStatsView';
import { OralTestView } from './components/OralTestView';
import { ScheduleView } from './components/ScheduleView';
import { ResourceView } from './components/ResourceView';
import { HomeworkView } from './components/HomeworkView';
import { GradingEvaluationView } from './components/GradingEvaluationView';
import { DashboardDataView } from './components/DashboardDataView';
import { ClassModal } from './components/ClassModal';
import { StudentModal } from './components/StudentModal';
import { BatchImportModal } from './components/BatchImportModal';
import { ConfirmModal } from './components/ConfirmModal';
import { MissYenCoiChatbot } from './components/MissYenCoiChatbot';
import { GoogleWorkspaceIntegrationModal } from './components/GoogleWorkspaceIntegrationModal';
import { triggerCelebration } from './lib/celebration';

export default function App() {
  const {
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
    // Extensions
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
  } = useClassroomStorage();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Classroom | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [isGoogleWorkspaceModalOpen, setIsGoogleWorkspaceModalOpen] = useState(false);

  // Delete Confirmations
  const [classToDelete, setClassToDelete] = useState<{ id: string; name: string } | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{
    id: string;
    name: string;
    classId: string;
  } | null>(null);

  // Computed total stats
  const totalClasses = classrooms.length;
  const totalStudents = classrooms.reduce((sum, c) => sum + (c.students?.length || 0), 0);

  // Get active class object if selected
  const activeClassroom = classrooms.find((c) => c.id === selectedClassId) || null;

  // Handlers for Navigation & Selection
  const handleSelectClass = (classId: string) => {
    setSelectedClassId(classId);
    setActiveTab('classes');
  };

  const handleGoToAttendance = (classId?: string) => {
    if (classId) {
      setSelectedClassId(classId);
    }
    setActiveTab('attendance');
  };

  const handleBackToClasses = () => {
    setSelectedClassId(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'classes' && tab !== 'attendance') {
      setSelectedClassId(null);
    }
  };

  // Class Modal Handlers
  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: Classroom) => {
    setEditingClass(cls);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (data: { name: string; subject: string; schoolYear: string; teacher: string }) => {
    if (editingClass) {
      updateClassroom({
        ...editingClass,
        ...data,
      });
      triggerCelebration('stars');
    } else {
      const created = addClassroom(data);
      // Auto open newly created class
      setSelectedClassId(created.id);
      setActiveTab('classes');
      triggerCelebration('confetti');
    }
  };

  const handlePromptDeleteClass = (classId: string, className: string) => {
    setClassToDelete({ id: classId, name: className });
  };

  const handleConfirmDeleteClass = () => {
    if (classToDelete) {
      deleteClassroom(classToDelete.id);
      if (selectedClassId === classToDelete.id) {
        setSelectedClassId(null);
      }
      setClassToDelete(null);
    }
  };

  // Student Modal Handlers
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (data: { name: string; code: string; notes: string }) => {
    if (!selectedClassId) return;

    if (editingStudent) {
      updateStudent(selectedClassId, {
        ...editingStudent,
        ...data,
      });
      triggerCelebration('stars');
    } else {
      addStudent(selectedClassId, data);
      triggerCelebration('hearts');
    }
  };

  const handlePromptDeleteStudent = (studentId: string, studentName: string) => {
    if (!selectedClassId) return;
    setStudentToDelete({
      id: studentId,
      name: studentName,
      classId: selectedClassId,
    });
  };

  const handleConfirmDeleteStudent = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.classId, studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  // Batch Import Handler
  const handleBatchImportStudents = (studentsList: Array<{ name: string; code: string; notes: string }>) => {
    if (!selectedClassId) return;
    addMultipleStudents(selectedClassId, studentsList);
    triggerCelebration('confetti');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-white">
      {/* Header & Sidebar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onOpenCreateClass={handleOpenCreateClass}
        onOpenGoogleWorkspaceModal={() => setIsGoogleWorkspaceModalOpen(true)}
        totalClasses={totalClasses}
        totalStudents={totalStudents}
      />

      {/* Main Content Area (Offset by md:pl-72 for Desktop Sidebar) */}
      <div className="md:pl-72 flex-1 flex flex-col min-h-screen">
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              classrooms={classrooms}
              lessonPlans={lessonPlans}
              onSelectClass={handleSelectClass}
              onOpenCreateClass={handleOpenCreateClass}
              onNavigateTab={handleTabChange}
              onResetSampleData={resetToSampleData}
            />
          )}

          {activeTab === 'classes' && (
            <>
              {selectedClassId && activeClassroom ? (
                <ClassDetailView
                  classroom={activeClassroom}
                  onBack={handleBackToClasses}
                  onEditClass={handleOpenEditClass}
                  onDeleteClass={handlePromptDeleteClass}
                  onOpenAddStudent={handleOpenAddStudent}
                  onOpenBatchImport={() => setIsBatchImportOpen(true)}
                  onEditStudent={handleOpenEditStudent}
                  onDeleteStudent={handlePromptDeleteStudent}
                  onGoToAttendance={handleGoToAttendance}
                />
              ) : (
                <ClassListView
                  classrooms={classrooms}
                  onSelectClass={handleSelectClass}
                  onOpenCreateClass={handleOpenCreateClass}
                  onEditClass={handleOpenEditClass}
                  onDeleteClass={handlePromptDeleteClass}
                  onGoToAttendance={handleGoToAttendance}
                />
              )}
            </>
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              classrooms={classrooms}
              initialClassId={selectedClassId || undefined}
              onBack={() => handleTabChange('classes')}
              getAttendanceSession={getAttendanceSession}
              saveAttendanceSession={(session) => {
                saveAttendanceSession(session);
                triggerCelebration('confetti');
              }}
              deleteAttendanceSession={deleteAttendanceSession}
              attendanceSessions={attendanceSessions}
            />
          )}

          {activeTab === 'attendance_stats' && (
            <AttendanceStatsView
              classrooms={classrooms}
              attendanceSessions={attendanceSessions}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'attendance_history' && (
            <AttendanceHistoryView
              classrooms={classrooms}
              attendanceSessions={attendanceSessions}
              saveAttendanceSession={saveAttendanceSession}
              deleteAttendanceSession={deleteAttendanceSession}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'oral_test' && (
            <OralTestView
              classrooms={classrooms}
              questions={questions}
              addQuestion={(q) => {
                addQuestion(q);
                triggerCelebration('stars');
              }}
              deleteQuestion={deleteQuestion}
              oralTestResults={oralTestResults}
              saveOralTestResult={(res) => {
                saveOralTestResult(res);
                triggerCelebration('hearts');
              }}
              deleteOralTestResult={deleteOralTestResult}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              classrooms={classrooms}
              scheduleItems={scheduleItems}
              addScheduleItem={(item) => {
                addScheduleItem(item);
                triggerCelebration('stars');
              }}
              updateScheduleItem={updateScheduleItem}
              deleteScheduleItem={deleteScheduleItem}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'resources' && (
            <ResourceView
              classrooms={classrooms}
              resourceItems={resourceItems}
              addResourceItem={(item) => {
                addResourceItem(item);
                triggerCelebration('confetti');
              }}
              deleteResourceItem={deleteResourceItem}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'homework' && (
            <HomeworkView
              classrooms={classrooms}
              assignments={assignments}
              addAssignment={(a) => {
                addAssignment(a);
                triggerCelebration('confetti');
              }}
              deleteAssignment={deleteAssignment}
              homeworkSubmissions={homeworkSubmissions}
              toggleHomeworkSubmission={(assignmentId, studentId) => {
                toggleHomeworkSubmission(assignmentId, studentId);
                triggerCelebration('stars');
              }}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'grading' && (
            <GradingEvaluationView classrooms={classrooms} />
          )}

          {activeTab === 'lesson_plan' && (
            <LessonPlanView
              key="lesson_plan_create"
              classrooms={classrooms}
              lessonPlans={lessonPlans}
              initialMode="create"
              onAddLessonPlan={(lp) => {
                addLessonPlan(lp);
                triggerCelebration('stars');
              }}
              onUpdateLessonPlan={updateLessonPlan}
              onDeleteLessonPlan={deleteLessonPlan}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'lesson_history' && (
            <LessonPlanView
              key="lesson_plan_list"
              classrooms={classrooms}
              lessonPlans={lessonPlans}
              initialMode="list"
              onAddLessonPlan={(lp) => {
                addLessonPlan(lp);
                triggerCelebration('stars');
              }}
              onUpdateLessonPlan={updateLessonPlan}
              onDeleteLessonPlan={deleteLessonPlan}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'dashboard_data' && (
            <DashboardDataView
              lessonPlans={lessonPlans}
              onSelectLessonPlan={(plan) => {
                setActiveTab('lesson_plan');
              }}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 text-slate-400 border-t border-blue-900/60 py-6 text-center text-xs mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="font-extrabold text-cyan-300 tracking-wide uppercase">AI Education Platform - Anh Sao Khue</span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-amber-300 font-bold">ĐT: 0346513056</span>
            </div>
            <p className="text-slate-400">
              Trợ lý ảo Miss Yến còi hỗ trợ 24/7 • Dữ liệu tự động lưu an toàn trên máy
            </p>
          </div>
        </footer>
      </div>

      {/* Floating Interactive Chatbot Miss Yến còi */}
      <MissYenCoiChatbot />

      {/* Class Form Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        initialData={editingClass}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
      />

      {/* Student Form Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        initialData={editingStudent}
        defaultCodePrefix={activeClassroom ? activeClassroom.name.replace(/[^A-Za-z0-9]/g, '') : 'HS'}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
      />

      {/* Batch Import Modal */}
      <BatchImportModal
        isOpen={isBatchImportOpen}
        classNameTitle={activeClassroom?.name || ''}
        defaultCodePrefix={activeClassroom ? activeClassroom.name.replace(/[^A-Za-z0-9]/g, '') : 'HS'}
        existingCount={activeClassroom?.students?.length || 0}
        onClose={() => setIsBatchImportOpen(false)}
        onImport={handleBatchImportStudents}
      />

      {/* Confirm Delete Class Modal */}
      <ConfirmModal
        isOpen={!!classToDelete}
        title="Xác nhận xóa lớp học"
        message={`Thầy/cô có chắc chắn muốn xóa "${classToDelete?.name}"? Toàn bộ danh sách học sinh thuộc lớp này cũng sẽ bị xóa khỏi hệ thống.`}
        confirmText="Xác nhận xóa lớp"
        cancelText="Hủy bỏ"
        isDanger={true}
        onConfirm={handleConfirmDeleteClass}
        onCancel={() => setClassToDelete(null)}
      />

      {/* Confirm Delete Student Modal */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Xác nhận xóa học sinh"
        message={`Thầy/cô có chắc chắn muốn xóa học sinh "${studentToDelete?.name}" khỏi danh sách lớp?`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isDanger={true}
        onConfirm={handleConfirmDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
      />

      {/* Google Workspace Integration Modal */}
      <GoogleWorkspaceIntegrationModal
        isOpen={isGoogleWorkspaceModalOpen}
        onClose={() => setIsGoogleWorkspaceModalOpen(false)}
        classrooms={classrooms}
        onImportStudentsToClass={(classId, students) => {
          addMultipleStudents(classId, students);
        }}
      />
    </div>
  );
}
