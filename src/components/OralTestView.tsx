import React, { useState, useEffect, useRef } from 'react';
import { Classroom, Student, Question, OralTestResult, TabType } from '../types';
import {
  HelpCircle,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Clock,
  Award,
  Sparkles,
  User,
  BookOpen,
  Mic,
  Square,
  Volume2,
  Download,
  RefreshCw,
} from 'lucide-react';

interface OralTestViewProps {
  classrooms: Classroom[];
  questions: Question[];
  addQuestion: (q: Omit<Question, 'id'>) => Question;
  deleteQuestion: (id: string) => void;
  oralTestResults: OralTestResult[];
  saveOralTestResult: (result: Omit<OralTestResult, 'id' | 'createdAt'>) => OralTestResult;
  deleteOralTestResult: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const OralTestView: React.FC<OralTestViewProps> = ({
  classrooms,
  questions,
  addQuestion,
  deleteQuestion,
  oralTestResults,
  saveOralTestResult,
  deleteOralTestResult,
  onNavigateTab,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classrooms.length > 0 ? classrooms[0].id : ''
  );

  const currentClass = classrooms.find((c) => c.id === selectedClassId);
  const classStudents = currentClass ? currentClass.students : [];

  // Random selection states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPickingStudent, setIsPickingStudent] = useState<boolean>(false);
  const [pickedQuestion, setPickedQuestion] = useState<Question | null>(null);

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [timerInitial, setTimerInitial] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Live Microphone Recording states (Nút Nói)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recTimerRef = useRef<any>(null);

  // Score & evaluation form
  const [score, setScore] = useState<number>(8);
  const [comment, setComment] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');

  // Modal to add new Question
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [newQuestionContent, setNewQuestionContent] = useState<string>('');
  const [newQuestionAnswer, setNewQuestionAnswer] = useState<string>('');
  const [newQuestionLevel, setNewQuestionLevel] = useState<'Dễ' | 'Trung bình' | 'Khó'>('Trung bình');

  // Mic Recording Handlers
  const handleStartRecording = async () => {
    setAudioError(null);
    setRecordedAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      const recorderOptions = mimeType ? { mimeType } : undefined;
      mediaRecorderRef.current = new MediaRecorder(stream, recorderOptions);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const finalType = mediaRecorderRef.current?.mimeType || mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: finalType });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
      };

      mediaRecorderRef.current.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      if (recTimerRef.current) clearInterval(recTimerRef.current);
      recTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setAudioError(`⚠️ Lỗi kết nối Micro: ${err?.message || 'Quyền Micro bị chặn'}. Hướng dẫn: Bấm biểu tượng 🔒 (Cài đặt trang web) ở góc thanh địa chỉ trình duyệt ➔ Chọn 'Microphone' ➔ 'Cho phép' (Allow), hoặc bấm nút mở ứng dụng trong Tab mới.`);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Pick Random Student with shuffling animation
  const handlePickRandomStudent = () => {
    if (classStudents.length === 0) return;
    setIsPickingStudent(true);

    let count = 0;
    const maxShuffle = 15;
    const shuffleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * classStudents.length);
      setSelectedStudent(classStudents[randomIndex]);
      count++;

      if (count >= maxShuffle) {
        clearInterval(shuffleInterval);
        setIsPickingStudent(false);
      }
    }, 100);
  };

  // Pick Random Question
  const handlePickRandomQuestion = () => {
    const classSubject = currentClass ? currentClass.subject : '';
    // Filter questions matching subject or class
    const subjectQuestions = questions.filter(
      (q) => !q.subject || q.subject.toLowerCase() === classSubject.toLowerCase()
    );
    const pool = subjectQuestions.length > 0 ? subjectQuestions : questions;

    if (pool.length === 0) return;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setPickedQuestion(pool[randomIndex]);
  };

  // Timer controls
  const handleStartTimer = () => setIsTimerRunning(true);
  const handlePauseTimer = () => setIsTimerRunning(false);
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerInitial);
  };
  const handleSetTimerPreset = (secs: number) => {
    setIsTimerRunning(false);
    setTimerInitial(secs);
    setTimerSeconds(secs);
  };

  // Handle Save evaluation
  const handleSaveResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !currentClass) return;

    saveOralTestResult({
      classId: currentClass.id,
      className: currentClass.name,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentCode: selectedStudent.code,
      questionContent: pickedQuestion ? pickedQuestion.content : 'Câu hỏi tự chọn',
      score,
      comment,
      date: new Date().toISOString().split('T')[0],
    });

    setSaveSuccessMsg(`Đã lưu kết quả ${score} điểm cho học sinh ${selectedStudent.name}!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    setComment('');
  };

  // Add Question submission
  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionContent.trim()) return;

    addQuestion({
      subject: currentClass ? currentClass.subject : 'Chung',
      classId: currentClass ? currentClass.id : undefined,
      content: newQuestionContent.trim(),
      answerKey: newQuestionAnswer.trim(),
      level: newQuestionLevel,
    });

    setNewQuestionContent('');
    setNewQuestionAnswer('');
    setIsQuestionModalOpen(false);
  };

  // Download Individual Scorecard Report
  const handleDownloadScorecard = (res: {
    studentName: string;
    className: string;
    date: string;
    questionContent: string;
    score: number;
    comment: string;
  }) => {
    const reportText = `=====================================================
PHIẾU ĐÁNH GIÁ KIỂM TRA MIỆNG (ORAL TEST SCORECARD)
=====================================================
Họ và tên Học sinh : ${res.studentName}
Lớp                : ${res.className}
Ngày kiểm tra      : ${res.date}

NỘI DUNG CÂU HỎI KIỂM TRA:
${res.questionContent}

ĐIỂM SỐ KẾT QUẢ    : ${res.score} / 10 Điểm
NHẬN XÉT CỦA GV    : ${res.comment || 'Chưa có ghi chú thêm.'}

=====================================================
Hệ thống AI Quản Lý Giáo Án & Chấm Điểm Học Sinh
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PhieuChamKiemTraMieng_${res.studentName.replace(/\s+/g, '_')}_${res.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#001f3f] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            Kiểm Tra Miệng Đầu Giờ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn học sinh & câu hỏi ngẫu nhiên, tính giờ đếm ngược và lưu kết quả đánh giá
          </p>
        </div>

        {/* Class selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-700">Chọn lớp:</span>
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedStudent(null);
            }}
            className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-xs"
          >
            {classrooms.map((cls) => (
              <option key={cls.id} value={cls.id} className="text-slate-900">
                {cls.name} ({cls.students.length} học sinh)
              </option>
            ))}
          </select>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Interactive Stage (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Random Pickers & Question */}
        <div className="space-y-6">
          {/* Card 1: Random Student Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Học Sinh Được Gọi Kiểm Tra
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                Sĩ số: {classStudents.length} học sinh
              </span>
            </div>

            {/* Display Box */}
            <div className="bg-gradient-to-br from-[#001f3f] to-[#001730] text-white p-6 rounded-2xl text-center shadow-inner my-3 relative">
              {selectedStudent ? (
                <div className={`space-y-1 ${isPickingStudent ? 'animate-pulse' : ''}`}>
                  <div className="text-xs text-orange-300 font-bold uppercase tracking-wider">
                    {selectedStudent.code}
                  </div>
                  <div className="text-2xl font-black text-amber-300 tracking-tight">
                    {selectedStudent.name}
                  </div>
                  {selectedStudent.notes && (
                    <div className="text-[11px] text-slate-300 italic font-medium pt-1">
                      "{selectedStudent.notes}"
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-slate-400 text-xs font-medium">
                  Bấm nút bên dưới để chọn ngẫu nhiên một học sinh
                </div>
              )}
            </div>

            {/* Action button: Nút nổi bật */}
            <button
              onClick={handlePickRandomStudent}
              disabled={classStudents.length === 0 || isPickingStudent}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 px-4 rounded-xl shadow-md hover:shadow-orange-500/20 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Shuffle className={`w-4 h-4 ${isPickingStudent ? 'animate-spin' : ''}`} />
              <span>Gọi Học Sinh Ngẫu Nhiên</span>
            </button>
          </div>

          {/* Card 2: Question Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-orange-500" />
                Câu Hỏi Kiểm Tra Miệng
              </h3>

              <button
                onClick={() => setIsQuestionModalOpen(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Thêm câu hỏi
              </button>
            </div>

            {/* Display Question */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl min-h-[90px] flex flex-col justify-center my-3">
              {pickedQuestion ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-orange-600">Môn {pickedQuestion.subject}</span>
                    {pickedQuestion.level && (
                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                        Độ khó: {pickedQuestion.level}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {pickedQuestion.content}
                  </p>
                  {pickedQuestion.answerKey && (
                    <p className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                      💡 Đáp án gợi ý: {pickedQuestion.answerKey}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 text-xs text-center font-medium">
                  Chưa chọn câu hỏi. Bấm nút chọn câu hỏi ngẫu nhiên.
                </div>
              )}
            </div>

            <button
              onClick={handlePickRandomQuestion}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-orange-400" />
              <span>Rút Câu Hỏi Ngẫu Nhiên</span>
            </button>
          </div>
        </div>

        {/* Right Column: Timer & Evaluation Grading */}
        <div className="space-y-6">
          {/* Card 3: Countdown Timer */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-orange-500" />
              Đồng Hồ Đếm Ngược Trả Lời
            </h3>

            {/* Presets */}
            <div className="flex items-center gap-2 mb-4">
              {[30, 60, 90, 120].map((secs) => (
                <button
                  key={secs}
                  onClick={() => handleSetTimerPreset(secs)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timerInitial === secs
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {secs} giây
                </button>
              ))}
            </div>

            {/* Display Clock */}
            <div
              className={`p-5 rounded-2xl text-center border-2 transition-all my-2 ${
                timerSeconds <= 10 && timerSeconds > 0
                  ? 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse'
                  : timerSeconds === 0
                  ? 'bg-slate-100 border-slate-300 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-[#001f3f]'
              }`}
            >
              <div className="text-4xl font-black font-mono tracking-wider">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">
                {timerSeconds === 0 ? 'Hết giờ trả lời!' : 'Thời gian còn lại'}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  disabled={timerSeconds === 0}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4" /> Bắt đầu
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Pause className="w-4 h-4" /> Tạm dừng
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Đặt lại
              </button>
            </div>
          </div>

          {/* Card 4: Evaluation Form & Mic Recording */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-500" />
              Chấm Điểm, Đánh Giá & Ghi Âm Bài Nói
            </h3>

            {/* Mic Recording Box (Nút Nói) */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-4 rounded-xl border border-orange-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-orange-400" />
                  <span>Thu âm câu trả lời học sinh (Nút Nói):</span>
                </span>
                {isRecording && (
                  <span className="text-xs font-mono font-extrabold text-rose-400 animate-pulse">
                    🔴 Đang thu âm: {recordingSeconds}s
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Thu Âm Trực Tiếp</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse"
                  >
                    <Square className="w-4 h-4" />
                    <span>Dừng & Lưu Thu Âm</span>
                  </button>
                )}
              </div>

              {recordedAudioUrl && (
                <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Nghe lại bài nói vừa thu âm:</span>
                    </span>
                    <a
                      href={recordedAudioUrl}
                      download={`BaiNoi_${selectedStudent?.name || 'HocSinh'}.webm`}
                      className="text-[11px] text-cyan-300 hover:text-cyan-100 flex items-center gap-1 underline"
                    >
                      <Download className="w-3 h-3" /> Tải tệp âm thanh
                    </a>
                  </div>
                  <audio controls src={recordedAudioUrl} className="w-full h-8 rounded-lg" />
                </div>
              )}

              {audioError && (
                <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                  ⚠️ {audioError}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveResult} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Điểm số (0 - 10): <span className="text-orange-600 font-black text-base">{score} điểm</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={score}
                  onChange={(e) => setScore(parseFloat(e.target.value))}
                  className="w-full accent-orange-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                  <span>0 điểm</span>
                  <span>5 điểm</span>
                  <span>10 điểm</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nhận xét của giáo viên:</label>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ví dụ: Trả lời to rõ ràng, tự tin, đúng trọng tâm..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="submit"
                  disabled={!selectedStudent}
                  className="flex-1 w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu Đánh Giá</span>
                </button>

                <button
                  type="button"
                  disabled={!selectedStudent}
                  onClick={() => {
                    if (selectedStudent) {
                      handleDownloadScorecard({
                        studentName: selectedStudent.name,
                        className: currentClass ? currentClass.name : 'Chung',
                        date: new Date().toLocaleDateString('vi-VN'),
                        questionContent: pickedQuestion ? pickedQuestion.content : 'Câu hỏi ngẫu nhiên',
                        score,
                        comment,
                      });
                    }
                  }}
                  className="flex-1 w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold py-3 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-amber-400/30"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Tải Phiếu Chấm (TXT)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-extrabold text-[#001f3f] text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-orange-500" />
            Lịch Sử Đánh Giá Kiểm Tra Miệng
          </span>
          {oralTestResults.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const fullText = `=====================================================
DANH SÁCH TỔNG HỢP ĐÁNH GIÁ KIỂM TRA MIỆNG ĐẦU GIỜ
=====================================================
Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}
Lớp học          : ${currentClass ? currentClass.name : 'Tất cả các lớp'}

${oralTestResults
  .map(
    (res, idx) =>
      `[${idx + 1}] NGÀY: ${res.date} | HỌC SINH: ${res.studentName} (${res.className})
  - Câu hỏi: ${res.questionContent}
  - Điểm số: ${res.score} / 10
  - Nhận xét: ${res.comment || 'Không có'}`
  )
  .join('\n-----------------------------------------------------\n')}
`;
                const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `TongHopKiemTraMieng_${new Date().toLocaleDateString('vi-VN')}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-orange-600" />
              <span>Tải Báo Cáo Tổng Hợp</span>
            </button>
          )}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#001f3f] text-slate-200 font-bold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Học sinh</th>
                <th className="px-4 py-3">Lớp</th>
                <th className="px-4 py-3">Câu hỏi</th>
                <th className="px-4 py-3 text-center">Điểm số</th>
                <th className="px-4 py-3">Nhận xét</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {oralTestResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Chưa có kết quả kiểm tra miệng nào được lưu.
                  </td>
                </tr>
              ) : (
                oralTestResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 font-mono">{res.date}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{res.studentName}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                        {res.className}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate text-slate-600">{res.questionContent}</td>
                    <td className="px-4 py-3 text-center font-black text-orange-600 text-sm">
                      {res.score}
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic">{res.comment || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDownloadScorecard(res)}
                          className="text-cyan-600 hover:text-cyan-800 p-1.5 rounded-lg hover:bg-cyan-50 transition-colors cursor-pointer"
                          title="Tải phiếu chấm của học sinh này"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteOralTestResult(res.id)}
                          className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Question */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-[#001f3f] text-base mb-4">Thêm Câu Hỏi Vào Kho</h3>
            <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi *</label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionContent}
                  onChange={(e) => setNewQuestionContent(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Gợi ý đáp án</label>
                <input
                  type="text"
                  value={newQuestionAnswer}
                  onChange={(e) => setNewQuestionAnswer(e.target.value)}
                  placeholder="Gợi ý đáp án chính..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ</label>
                <select
                  value={newQuestionLevel}
                  onChange={(e) => setNewQuestionLevel(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-xs cursor-pointer"
                >
                  <option value="Dễ" className="text-slate-900">Dễ</option>
                  <option value="Trung bình" className="text-slate-900">Trung bình</option>
                  <option value="Khó" className="text-slate-900">Khó</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs cursor-pointer"
                >
                  Lưu câu hỏi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
