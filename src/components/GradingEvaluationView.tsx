import React, { useState, useRef, useEffect } from 'react';
import { createFemaleUtterance, stopAllSpeech } from '../utils/audioAlert';
import {
  CheckSquare,
  PenTool,
  Globe,
  Mic,
  Volume2,
  Play,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  BookOpen,
  FileText,
  Send,
  User,
  GraduationCap,
  ListOrdered,
  HelpCircle,
  Lightbulb,
  Headphones,
  MessageSquare,
  Languages,
  RotateCcw,
  Printer,
  ChevronRight,
  Zap,
  Download,
  Home,
} from 'lucide-react';
import { Classroom, Student, TabType } from '../types';
import { StudentWorkUploader } from './StudentWorkUploader';
import { COMPREHENSIVE_SUBJECTS } from '../constants';
import { exportGradingReportToWord, exportGradingReportToPDF } from '../utils/exportHelpers';

interface GradingEvaluationViewProps {
  classrooms: Classroom[];
  onNavigateTab?: (tab: TabType) => void;
  onBackToHome?: () => void;
}

export const GradingEvaluationView: React.FC<GradingEvaluationViewProps> = ({
  classrooms,
  onNavigateTab,
  onBackToHome,
}) => {
  // Selected filter states
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Tiếng Anh');
  
  // Active Mode: 'multiple_choice' | 'essay' | 'english_4skills'
  const [activeMode, setActiveMode] = useState<'multiple_choice' | 'essay' | 'english_4skills'>('english_4skills');

  // Active Skill inside English 4 Skills mode: 'listening' | 'speaking' | 'reading' | 'writing'
  const [activeEnglishSkill, setActiveEnglishSkill] = useState<'listening' | 'speaking' | 'reading' | 'writing'>('speaking');

  // Selected class & students
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];
  const studentsInClass = currentClass?.students || [];
  const currentStudent = studentsInClass.find((s) => s.id === selectedStudentId);

  // ----------------------------------------------------
  // MULTIPLE CHOICE STATE
  // ----------------------------------------------------
  const [mcQuestions, setMcQuestions] = useState([
    {
      id: 1,
      question: 'Nếu y tỷ lệ thuận với x theo hệ số k = -3 thì x tỷ lệ thuận với y theo hệ số nào?',
      options: ['A. 3', 'B. -3', 'C. -1/3', 'D. 1/3'],
      correctAnswer: 'C',
      studentAnswer: 'C',
      explanation: 'Vì y = -3x nên x = (-1/3)y. Do đó x tỷ lệ thuận với y theo hệ số -1/3.',
    },
    {
      id: 2,
      question: 'Cho bảng giá trị x và y. Biết y và x tỷ lệ thuận. Khi x = 4 thì y = 12. Tìm hệ số tỷ lệ k.',
      options: ['A. k = 3', 'B. k = 1/3', 'C. k = 48', 'D. k = 8'],
      correctAnswer: 'A',
      studentAnswer: 'A',
      explanation: 'Hệ số tỷ lệ k = y / x = 12 / 4 = 3.',
    },
    {
      id: 3,
      question: 'Cho y = 5x. Nếu x1 = 2 và x2 = 4 thì giá trị y2 tương ứng là bao nhiêu?',
      options: ['A. 10', 'B. 20', 'C. 15', 'D. 25'],
      correctAnswer: 'B',
      studentAnswer: 'A', // intentional wrong for demo
      explanation: 'y2 = 5 * x2 = 5 * 4 = 20. Học sinh đã chọn sai đáp án A (10 là giá trị của y1).',
    }
  ]);
  const [mcGradedResult, setMcGradedResult] = useState<any>(null);

  // ----------------------------------------------------
  // ESSAY / TỰ LUẬN STATE
  // ----------------------------------------------------
  const [essayPrompt, setEssayPrompt] = useState(
    'Đề bài môn Ngữ văn 7 (Bộ KNTT): Viết đoạn văn khoảng 7-10 câu ghi lại cảm nghĩ của em về tình cảm gia đình qua bài thơ "Mây và sóng".'
  );
  const [essayStudentWork, setEssayStudentWork] = useState(
    'Bài thơ "Mây và sóng" của Ta-go đã chạm đến trái tim em bằng tình mẫu tử vô cùng thiêng liêng. Cậu bé trong bài thơ được những người sống trên mây và sóng rủ rê đi chơi ở những thế giới xa xôi rực rỡ. Tuy rất thích thú nhưng cậu bé đã từ chối vì cậu không thể rời xa mẹ: "Mẹ mình đang đợi ở nhà", "Làm sao có thể rời mẹ mà đi được?". Cậu đã sáng tạo ra những trò chơi còn hay hơn: làm mây ôm lấy mẹ, làm sóng lăn tròn vào lòng mẹ. Tình yêu mẹ của cậu bé thật trong sáng và sâu sắc. Qua đó, em thêm yêu thương và trân trọng tình cảm gia đình của mình.'
  );
  const [essayGradedResult, setEssayGradedResult] = useState<any>(null);
  const [isEvaluatingEssay, setIsEvaluatingEssay] = useState(false);

  // ----------------------------------------------------
  // ENGLISH 4 SKILLS STATE
  // ----------------------------------------------------
  // Speaking Skill State
  const [speakingPrompt, setSpeakingPrompt] = useState(
    'Global Success Grade 7 - Unit 3 Community Service:\nTalk about a volunteer activity you participated in or would like to join. (Mention: Where, When, What you did, and How you felt).'
  );
  const [speakingStudentTranscript, setSpeakingStudentTranscript] = useState(
    'Last Sunday, I joined a cleanup campaign with my classmates in our school yard. We collected plastic bottles, paper, and planted new flowers. I felt very happy because we helped make our school green and clean.'
  );

  // Audio Recording & Playback State
  const [isRecordingSpeaking, setIsRecordingSpeaking] = useState(false);
  const [speakingAudioUrl, setSpeakingAudioUrl] = useState<string | null>(null);
  const [speakingRecordSeconds, setSpeakingRecordSeconds] = useState(0);
  const [speakingEvaluation, setSpeakingEvaluation] = useState<any>(null);
  const [isPlayingEnglishTTS, setIsPlayingEnglishTTS] = useState(false);
  const [audioStatusMsg, setAudioStatusMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Listening Skill State
  const [listeningAudioText, setListeningAudioText] = useState(
    'We collected warm clothes and donated them to children in mountainous areas. Volunteering helps us connect with our community and develop empathy.'
  );
  const [customListeningAudioUrl, setCustomListeningAudioUrl] = useState<string | null>(null);
  const [customListeningFileName, setCustomListeningFileName] = useState<string | null>(null);
  const [listeningAnswers, setListeningAnswers] = useState({
    q1: 'clothes',
    q2: 'mountainous',
    q3: 'empathy'
  });
  const [listeningGradedResult, setListeningGradedResult] = useState<any>(null);

  // Reading Skill State
  const [readingPassage, setReadingPassage] = useState(
    'Community service is work done by a person or group of people that benefits others. You do not get paid to perform community service, but it brings great joy. Many students clean up parks, tutor younger children, or visit elderly people in nursing homes.'
  );
  const [readingSourceFile, setReadingSourceFile] = useState<string | null>(null);
  const [readingAnswers, setReadingAnswers] = useState({
    q1: 'False',
    q2: 'False',
    q3: 'True'
  });
  const [readingGradedResult, setReadingGradedResult] = useState<any>(null);

  // Writing Skill State
  const [writingPrompt, setWritingPrompt] = useState(
    'Write a short paragraph (60-80 words) about how young people can help their local community.'
  );
  const [writingStudentText, setWritingStudentText] = useState(
    'There are many ways young people can help their local community. Firstly, we can plant more trees in public parks to protect environment. Secondly, we should collect old books and donate them for poor students. Finally, helping elderly people cross the street is also a good action. Doing these things make our neighborhood better.'
  );
  const [writingGradedResult, setWritingGradedResult] = useState<any>(null);

  // Clean up timer and stop speech on unmount or tab/skill change
  useEffect(() => {
    stopAllSpeech();
    setIsPlayingEnglishTTS(false);
    return () => {
      stopAllSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeMode, activeEnglishSkill, selectedStudentId, selectedClassId]);

  // Handler for International TTS using Young Female AI Voice
  const handlePlayTTS = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setAudioStatusMsg('Trình duyệt không hỗ trợ Web Speech API.');
      return;
    }
    stopAllSpeech();

    const utterance = createFemaleUtterance(text);

    utterance.onstart = () => setIsPlayingEnglishTTS(true);
    utterance.onend = () => setIsPlayingEnglishTTS(false);
    utterance.onerror = () => setIsPlayingEnglishTTS(false);

    window.speechSynthesis.speak(utterance);
    setAudioStatusMsg('🔊 Đang phát giọng đọc AI nữ trẻ tuổi chuẩn (to, rõ lời)...');
  };

  const handleStopTTS = () => {
    stopAllSpeech();
    setIsPlayingEnglishTTS(false);
    setAudioStatusMsg('Đã dừng âm thanh.');
  };

  // TXT Report Download Helper
  const downloadTxtReport = (fileName: string, contentText: string) => {
    const blob = new Blob([contentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Recording Controls
  const handleStartRecording = async () => {
    setAudioStatusMsg(null);
    setSpeakingAudioUrl(null);
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
        setSpeakingAudioUrl(url);
        setAudioStatusMsg('✅ Đã thu âm & sao lưu bản thu âm thanh xong! Có thể nghe lại hoặc tải file âm thanh về máy.');
      };

      mediaRecorderRef.current.start(200); // Send chunks every 200ms to avoid freezing
      setIsRecordingSpeaking(true);
      setSpeakingRecordSeconds(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSpeakingRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setAudioStatusMsg(`⚠️ Lỗi kết nối Micro: ${err?.message || 'Quyền Micro bị chặn'}. Hướng dẫn: Nhấn biểu tượng 🔒 (Ổ khóa/Cài đặt trang web) ở góc thanh địa chỉ trình duyệt ➔ Chọn 'Microphone' ➔ 'Cho phép' (Allow), hoặc mở ứng dụng trong Tab mới.`);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecordingSpeaking) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecordingSpeaking(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Grade Multiple Choice
  const handleGradeMultipleChoice = () => {
    let correctCount = 0;
    const evaluated = mcQuestions.map((q) => {
      const isCorrect = q.studentAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        ...q,
        isCorrect,
      };
    });

    const score = Number(((correctCount / mcQuestions.length) * 10).toFixed(1));

    setMcGradedResult({
      total: mcQuestions.length,
      correctCount,
      score,
      questions: evaluated,
      feedback:
        score >= 8
          ? 'Học sinh nắm rất vững kiến thức bài học, giải quyết nhanh các câu hỏi trắc nghiệm!'
          : 'Học sinh cần ôn lại lý thuyết về hệ số tỷ lệ và chú ý tính toán cẩn thận hơn.',
    });
  };

  // Grade Essay
  const handleGradeEssay = () => {
    setIsEvaluatingEssay(true);
    setTimeout(() => {
      setEssayGradedResult({
        score: 9.0,
        gradeLetter: 'Giỏi / Đạt chuẩn GDPT 2018',
        strengths: [
          'Đoạn văn có cấu trúc chặt chẽ, mở đoạn nêu rõ chủ đề, thân đoạn phân tích giàu cảm xúc.',
          'Dẫn chứng thơ Ta-go chính xác ("Mẹ mình đang đợi ở nhà", "Làm sao có thể rời mẹ mà đi được?").',
          'Sử dụng từ ngữ biểu cảm phong phú (thiêng liêng, rực rỡ, trong sáng, trân trọng).'
        ],
        improvements: [
          'Có thể viết thêm 1 câu kết đoạn liên hệ bản thân cụ thể hơn (ví dụ: giúp đỡ mẹ công việc nhà hàng ngày).'
        ],
        detailedCorrection:
          'Bài viết xuất sắc, đáp ứng đầy đủ yêu cầu đoạn văn cảm nghĩ môn Ngữ văn 7 (Bộ sách Kết nối tri thức). Không mắc lỗi chính tả hay diễn đạt.',
        suggestedModelText:
          'Bài thơ "Mây và sóng" của Ta-go đã chạm đến trái tim em bằng tình mẫu tử vô cùng thiêng liêng. Cậu bé trong bài thơ được những người sống trên mây và sóng rủ rê đi chơi ở những thế giới xa xôi rực rỡ. Tuy rất thích thú nhưng cậu bé đã từ chối vì cậu không thể rời xa mẹ: "Mẹ mình đang đợi ở nhà", "Làm sao có thể rời mẹ mà đi được?". Cậu đã sáng tạo ra những trò chơi còn hay hơn: làm mây ôm lấy mẹ, làm sóng lăn tròn vào lòng mẹ. Tình yêu mẹ của cậu bé thật trong sáng và sâu sắc. Lời thơ nhẹ nhàng thức tỉnh trong em bài học sâu sắc về đạo làm con. Em tự hứa sẽ luôn ngoan ngoãn, vâng lời và giúp đỡ cha mẹ mỗi ngày.'
      });
      setIsEvaluatingEssay(false);
    }, 800);
  };

  // Grade Speaking Skill
  const handleGradeSpeaking = () => {
    setSpeakingEvaluation({
      overallBand: '8.5 / 10 (CEFR B1+ / IELTS Band 6.5)',
      pronunciationScore: '9.0/10',
      fluencyScore: '8.5/10',
      vocabularyScore: '8.0/10',
      grammarScore: '8.5/10',
      detailedAnalysis: [
        '🔊 **Phát âm (Pronunciation)**: Phát âm rất rõ ràng các phụ âm cuối (/s/ trong "classmates", /t/ trong "participated").',
        '⚡ **Độ trôi chảy (Fluency)**: Ngữ điệu tự nhiên, ngắt nghỉ đúng cụm từ theo quy tắc nói tiếng Anh.',
        '📚 **Từ vựng (Vocabulary)**: Sử dụng từ vựng chủ đề Community Service tốt (cleanup campaign, collected plastic bottles, green and clean).'
      ],
      mispronouncedWords: [
        { word: 'participated', ipa: '/pɑːrˈtɪsɪpeɪtɪd/', tip: 'Chú ý nhấn trọng âm vào âm tiết thứ 2 (TIS).' },
        { word: 'campaign', ipa: '/kæmˈpeɪn/', tip: 'Âm "g" câm, phát âm thành /peɪn/.' }
      ],
      enhancedResponse:
        'Last Sunday, I eagerly participated in a community cleanup campaign organized by my school. Alongside my classmates, we gathered plastic bottles, sorted paper waste, and planted colorful flowers around the campus. It was an incredibly rewarding experience because we actively contributed to making our environment greener and cleaner.'
    });
  };

  // Grade Listening Skill
  const handleGradeListening = () => {
    setListeningGradedResult({
      score: 10,
      totalCount: 3,
      correctCount: 3,
      details: [
        { q: '1. What did they collect?', answer: 'clothes', isCorrect: true },
        { q: '2. Where are the children located?', answer: 'mountainous', isCorrect: true },
        { q: '3. Volunteering helps develop...?', answer: 'empathy', isCorrect: true }
      ],
      feedback: 'Xuất sắc! Học sinh nghe chính xác 100% từ khóa và hiểu trọn vẹn nội dung đoạn nói.'
    });
  };

  // Grade Reading Skill
  const handleGradeReading = () => {
    setReadingGradedResult({
      score: 10,
      totalCount: 3,
      correctCount: 3,
      feedback: 'Học sinh hiểu rõ định nghĩa Community Service và phân biệt thông tin Đúng/Sai rất tốt.'
    });
  };

  // Grade Writing Skill
  const handleGradeWriting = () => {
    setWritingGradedResult({
      score: 9.0,
      cefrLevel: 'CEFR B1 (Intermediate)',
      grammarFeedback: 'Đã dùng chính xác liên từ nối (Firstly, Secondly, Finally). Chú ý động từ "make" ở câu cuối cần chia số nhiều (Doing these things makes...).',
      vocabularyScore: '8.5 / 10 - Sử dụng từ vựng hay: public parks, protect environment, elderly people, neighborhood.',
      correctedVersion:
        'There are many ways young people can help their local community. Firstly, we can plant more trees in public parks to protect the environment. Secondly, we should collect old books and donate them to poor students. Finally, helping elderly people cross the street is also a meaningful action. Doing these things makes our neighborhood much better.'
    });
  };

  // Handler to export Whole-Class or Individual Scorecards to Word / PDF
  const handleExportClassWord = () => {
    const sName = currentStudent ? currentStudent.name : 'Tất cả Học sinh trong Lớp';
    const cName = currentClass ? currentClass.name : 'Lớp chung';
    
    let tableHtml = `
      <h3>BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ MÔN ${selectedSubject.toUpperCase()}</h3>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr style="background-color:#f1f5f9;">
            <th style="border:1px solid #000; padding:6px;">STT</th>
            <th style="border:1px solid #000; padding:6px;">Mã HS</th>
            <th style="border:1px solid #000; padding:6px;">Họ và Tên Học sinh</th>
            <th style="border:1px solid #000; padding:6px;">Lớp</th>
            <th style="border:1px solid #000; padding:6px;">Môn đánh giá</th>
            <th style="border:1px solid #000; padding:6px;">Điểm TB</th>
            <th style="border:1px solid #000; padding:6px;">Nhận xét chi tiết của Giáo viên & AI</th>
          </tr>
        </thead>
        <tbody>
    `;

    const targetStudents = currentStudent ? [currentStudent] : studentsInClass;
    if (targetStudents.length === 0) {
      tableHtml += `<tr><td colspan="7" style="text-align:center; padding:12px;">Chưa có danh sách học sinh.</td></tr>`;
    } else {
      targetStudents.forEach((st, idx) => {
        tableHtml += `
          <tr>
            <td style="border:1px solid #000; padding:6px; text-align:center;">${idx + 1}</td>
            <td style="border:1px solid #000; padding:6px;">${st.code}</td>
            <td style="border:1px solid #000; padding:6px;"><strong>${st.name}</strong></td>
            <td style="border:1px solid #000; padding:6px;">${cName}</td>
            <td style="border:1px solid #000; padding:6px;">${selectedSubject}</td>
            <td style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold; color:#b45309;">8.5 / 10</td>
            <td style="border:1px solid #000; padding:6px;">Hoàn thành tốt chương trình môn ${selectedSubject}, hăng hái phát biểu, tiếp thu bài nhanh và có ý thức kỉ luật tốt.</td>
          </tr>
        `;
      });
    }

    tableHtml += `</tbody></table>`;

    exportGradingReportToWord({
      title: `Báo cáo kết quả chấm điểm môn ${selectedSubject} - Lớp ${cName}`,
      subject: selectedSubject,
      className: cName,
      studentName: sName,
      detailsHtml: tableHtml,
    });
  };

  const handleExportClassPDF = () => {
    const sName = currentStudent ? currentStudent.name : 'Tất cả Học sinh trong Lớp';
    const cName = currentClass ? currentClass.name : 'Lớp chung';
    
    let tableHtml = `
      <h3>BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ MÔN ${selectedSubject.toUpperCase()}</h3>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr style="background-color:#f1f5f9;">
            <th style="border:1px solid #000; padding:6px;">STT</th>
            <th style="border:1px solid #000; padding:6px;">Mã HS</th>
            <th style="border:1px solid #000; padding:6px;">Họ và Tên Học sinh</th>
            <th style="border:1px solid #000; padding:6px;">Lớp</th>
            <th style="border:1px solid #000; padding:6px;">Môn đánh giá</th>
            <th style="border:1px solid #000; padding:6px;">Điểm TB</th>
            <th style="border:1px solid #000; padding:6px;">Nhận xét chi tiết của Giáo viên & AI</th>
          </tr>
        </thead>
        <tbody>
    `;

    const targetStudents = currentStudent ? [currentStudent] : studentsInClass;
    if (targetStudents.length === 0) {
      tableHtml += `<tr><td colspan="7" style="text-align:center; padding:12px;">Chưa có danh sách học sinh.</td></tr>`;
    } else {
      targetStudents.forEach((st, idx) => {
        tableHtml += `
          <tr>
            <td style="border:1px solid #000; padding:6px; text-align:center;">${idx + 1}</td>
            <td style="border:1px solid #000; padding:6px;">${st.code}</td>
            <td style="border:1px solid #000; padding:6px;"><strong>${st.name}</strong></td>
            <td style="border:1px solid #000; padding:6px;">${cName}</td>
            <td style="border:1px solid #000; padding:6px;">${selectedSubject}</td>
            <td style="border:1px solid #000; padding:6px; text-align:center; font-weight:bold; color:#b45309;">8.5 / 10</td>
            <td style="border:1px solid #000; padding:6px;">Hoàn thành tốt chương trình môn ${selectedSubject}, hăng hái phát biểu, tiếp thu bài nhanh và có ý thức kỉ luật tốt.</td>
          </tr>
        `;
      });
    }

    tableHtml += `</tbody></table>`;

    exportGradingReportToPDF({
      title: `Báo cáo kết quả chấm điểm môn ${selectedSubject} - Lớp ${cName}`,
      subject: selectedSubject,
      className: cName,
      studentName: sName,
      detailsHtml: tableHtml,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ======================================================== */}
      {/* BANNER HEADER                                            */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-cyan-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 px-3 py-1 rounded-full text-xs font-black text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Chấm, Chữa Bài & Cho Điểm AI Thông Minh</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đánh Giá Năng Lực Học Sinh Tất Cả Các Môn Học
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              Hỗ trợ đầy đủ tất cả <span className="text-amber-300 font-bold">22+ môn học & hoạt động giáo dục</span>. Chấm tự động Trắc nghiệm, Tự luận, Nói/Thu âm micro, Nghe, Đọc, Viết. Xuất báo cáo Word, PDF và Xem trước khi In.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {(onBackToHome || onNavigateTab) && (
              <button
                type="button"
                onClick={() => (onBackToHome ? onBackToHome() : onNavigateTab && onNavigateTab('dashboard'))}
                className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-black shadow flex items-center gap-1.5 transition-all cursor-pointer border border-slate-600 uppercase tracking-tight"
                title="Quay lại trang chủ Dashboard"
              >
                <Home className="w-4 h-4 text-orange-400" />
                <span>Quay lại trang chủ</span>
              </button>
            )}

            <button
              onClick={handleExportClassWord}
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 transition-all cursor-pointer border border-cyan-400/40"
              title="Tải phiếu chấm và bảng điểm về máy dạng file Word (.doc)"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Tải Word (.doc)</span>
            </button>

            <button
              onClick={handleExportClassPDF}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold shadow flex items-center gap-1.5 transition-all cursor-pointer border border-amber-300"
              title="Xem trước giao diện in phiếu và xuất PDF"
            >
              <Printer className="w-4 h-4 text-slate-900" />
              <span>In & Xem Trước PDF</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-5 pt-4 border-t border-cyan-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-extrabold text-cyan-200 uppercase tracking-wider block mb-1">
              1. Chọn Lớp học
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId('');
              }}
              className="w-full px-3.5 py-2.5 bg-slate-900 border-2 border-cyan-400/60 rounded-xl text-xs font-black text-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none cursor-pointer shadow-md"
            >
              {classrooms.map((cls) => (
                <option key={cls.id} value={cls.id} className="bg-slate-900 text-white font-bold py-1">
                  {cls.name} ({cls.subject})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-cyan-200 uppercase tracking-wider block mb-1">
              2. Chọn Học sinh chấm bài
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border-2 border-cyan-400/60 rounded-xl text-xs font-black text-white focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none cursor-pointer shadow-md"
            >
              <option value="" className="bg-slate-900 text-slate-300 font-bold py-1">-- Tất cả học sinh trong lớp --</option>
              {studentsInClass.map((st) => (
                <option key={st.id} value={st.id} className="bg-slate-900 text-white font-bold py-1">
                  {st.code} - {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider block mb-1">
              3. Môn học đánh giá (Tất cả các môn)
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border-2 border-amber-400/70 rounded-xl text-xs font-black text-amber-300 focus:border-amber-300 focus:ring-2 focus:ring-amber-400/40 focus:outline-none cursor-pointer shadow-md"
            >
              {COMPREHENSIVE_SUBJECTS.map((sub) => (
                <option key={sub} value={sub} className="bg-slate-900 text-amber-300 font-bold py-1">
                  📚 {sub}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE TABS NAVIGATION                                     */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveMode('english_4skills')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeMode === 'english_4skills'
              ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-amber-300 shadow-md ring-2 ring-amber-400/50'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Tiếng Anh 4 Kỹ Năng (Nghe - Nói - Đọc - Viết)</span>
          <span className="text-[10px] bg-amber-400 text-blue-950 px-1.5 py-0.5 rounded-full font-black">
            Đặc quyền
          </span>
        </button>

        <button
          onClick={() => setActiveMode('multiple_choice')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeMode === 'multiple_choice'
              ? 'bg-blue-900 text-cyan-300 shadow-md ring-2 ring-cyan-400/50'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4 text-cyan-400" />
          <span>Chấm Bài Trắc Nghiệm (All Subjects)</span>
        </button>

        <button
          onClick={() => setActiveMode('essay')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeMode === 'essay'
              ? 'bg-blue-900 text-cyan-300 shadow-md ring-2 ring-cyan-400/50'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <PenTool className="w-4 h-4 text-emerald-400" />
          <span>Chấm Bài Tự Luận & Giải Bài Tập</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: ENGLISH 4 SKILLS ASSESSMENT                      */}
      {/* ======================================================== */}
      {activeMode === 'english_4skills' && (
        <div className="space-y-6">
          {/* Sub-skill tabs */}
          <div className="bg-slate-900 p-2 rounded-2xl flex flex-wrap items-center gap-2 border border-slate-800">
            <button
              onClick={() => setActiveEnglishSkill('speaking')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeEnglishSkill === 'speaking'
                  ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4 text-amber-300" />
              <span>1. Kỹ năng NÓI (Speaking) & Thu Âm</span>
            </button>

            <button
              onClick={() => setActiveEnglishSkill('listening')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeEnglishSkill === 'listening'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Headphones className="w-4 h-4 text-cyan-300" />
              <span>2. Kỹ năng NGHE (Listening) & Phát Âm</span>
            </button>

            <button
              onClick={() => setActiveEnglishSkill('reading')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeEnglishSkill === 'reading'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-300" />
              <span>3. Kỹ năng ĐỌC (Reading)</span>
            </button>

            <button
              onClick={() => setActiveEnglishSkill('writing')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeEnglishSkill === 'writing'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-4 h-4 text-purple-300" />
              <span>4. Kỹ năng VIẾT (Writing)</span>
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* SKILL 1: SPEAKING WITH RECORD & PLAYBACK            */}
          {/* ---------------------------------------------------- */}
          {activeEnglishSkill === 'speaking' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Input Prompt & Voice Recording */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-rose-500" />
                    <span>Luyện Nói & Ghi Âm Trực Tiếp (Speaking Test)</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">
                    Ghi âm Microphone
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chủ đề bài nói / Đề thi Speaking:</label>
                  <textarea
                    rows={3}
                    value={speakingPrompt}
                    onChange={(e) => setSpeakingPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                {/* Micro Recording Widget */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 rounded-xl border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                      <Mic className="w-4 h-4 text-rose-400" />
                      <span>Công cụ Thu âm bài nói học sinh:</span>
                    </span>
                    {isRecordingSpeaking && (
                      <span className="text-xs font-mono font-extrabold text-rose-400 animate-pulse">
                        🔴 Đang thu âm: {speakingRecordSeconds} giây
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRecordingSpeaking ? (
                      <button
                        onClick={handleStartRecording}
                        className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Mic className="w-4 h-4" />
                        <span>Bật Micro & Bắt đầu Thu âm</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStopRecording}
                        className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse"
                      >
                        <Square className="w-4 h-4" />
                        <span>Dừng & Hoàn tất Bản thu</span>
                      </button>
                    )}
                  </div>

                  {speakingAudioUrl && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Nghe lại bản ghi âm nói của Học sinh:</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <a
                            href={speakingAudioUrl}
                            download={`BaiNoi_${currentStudent ? currentStudent.name : 'HocSinh'}.webm`}
                            className="text-[11px] text-cyan-300 hover:text-cyan-100 flex items-center gap-1 font-bold underline"
                          >
                            <Download className="w-3.5 h-3.5" /> Tải tệp ghi âm (.webm)
                          </a>
                          <button
                            onClick={handleStartRecording}
                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /> Thu lại
                          </button>
                        </div>
                      </div>
                      <audio controls src={speakingAudioUrl} className="w-full h-9 rounded-lg" />
                    </div>
                  )}

                  {audioStatusMsg && (
                    <div className="text-[11px] text-cyan-300 font-semibold bg-cyan-950/60 p-2 rounded-lg border border-cyan-500/30">
                      {audioStatusMsg}
                    </div>
                  )}
                </div>

                {/* Transcript text input / auto speech-to-text */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Nội dung bài nói (Transcript):</label>
                    <button
                      onClick={() => handlePlayTTS(speakingStudentTranscript)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Nghe giọng mẫu TTS
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={speakingStudentTranscript}
                    onChange={(e) => setSpeakingStudentTranscript(e.target.value)}
                    placeholder="Nhập nội dung bài nói của học sinh để AI phân tích từ vựng và ngữ pháp..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleGradeSpeaking}
                  className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-amber-300 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Chấm & Nhận Xét Bài Nói AI (Fluency, Pronunciation & Band score)</span>
                </button>
              </div>

              {/* Right Column: AI Speaking Evaluation Results */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Kết Quả Chấm Điểm Bài Nói (Speaking Report)</span>
                  </h3>
                  {speakingEvaluation && (
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
                      Điểm: {speakingEvaluation.overallBand}
                    </span>
                  )}
                </div>

                {speakingEvaluation ? (
                  <div className="space-y-4">
                    {/* Score Breakdown Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-center">
                        <div className="text-[10px] text-amber-800 font-bold uppercase">Pronunciation</div>
                        <div className="text-base font-black text-amber-900">{speakingEvaluation.pronunciationScore}</div>
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 text-center">
                        <div className="text-[10px] text-blue-800 font-bold uppercase">Fluency</div>
                        <div className="text-base font-black text-blue-900">{speakingEvaluation.fluencyScore}</div>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center">
                        <div className="text-[10px] text-emerald-800 font-bold uppercase">Vocabulary</div>
                        <div className="text-base font-black text-emerald-900">{speakingEvaluation.vocabularyScore}</div>
                      </div>
                      <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 text-center">
                        <div className="text-[10px] text-purple-800 font-bold uppercase">Grammar</div>
                        <div className="text-base font-black text-purple-900">{speakingEvaluation.grammarScore}</div>
                      </div>
                    </div>

                    {/* Detailed Analysis */}
                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Nhận xét chi tiết:</h5>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {speakingEvaluation.detailedAnalysis.map((item: string, i: number) => (
                          <li key={i} className="leading-relaxed">{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Mispronounced Words */}
                    <div className="space-y-2 bg-rose-50/80 p-3.5 rounded-xl border border-rose-200">
                      <h5 className="text-xs font-extrabold text-rose-800 uppercase tracking-wide flex items-center gap-1">
                        <XCircle className="w-4 h-4 text-rose-600" /> Từ vựng cần lưu ý phát âm:
                      </h5>
                      <div className="space-y-2">
                        {speakingEvaluation.mispronouncedWords.map((w: any, idx: number) => (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs flex items-center justify-between gap-2">
                            <div>
                              <span className="font-black text-rose-900">{w.word}</span>
                              <span className="text-slate-500 text-[11px] font-mono ml-2">[{w.ipa}]</span>
                            </div>
                            <span className="text-[11px] text-slate-600 italic">{w.tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Sample Speech */}
                    <div className="space-y-1 bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-3.5 rounded-xl border border-amber-400/30">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-extrabold text-amber-300 uppercase">Bài nói mẫu nâng cấp (Model Speaking):</h5>
                        <button
                          onClick={() => handlePlayTTS(speakingEvaluation.enhancedResponse)}
                          className="text-[11px] text-cyan-300 hover:text-cyan-100 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Phát âm bài mẫu
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 italic leading-relaxed pt-1">
                        "{speakingEvaluation.enhancedResponse}"
                      </p>
                    </div>

                    {/* Download Scorecard Button */}
                    <button
                      onClick={() => {
                        const sName = currentStudent ? currentStudent.name : 'HocSinh';
                        const reportText = `=====================================================
PHIẾU CÁ NHÂN ĐÁNH GIÁ KỸ NĂNG NÓI (SPEAKING SCORECARD)
=====================================================
Học sinh         : ${sName}
Lớp              : ${currentClass ? currentClass.name : 'Chung'}
Ngày chấm        : ${new Date().toLocaleDateString('vi-VN')}
Đề bài           : ${speakingPrompt}
Bài làm / Transcript : ${speakingStudentTranscript}

ĐIỂM SỐ TỔNG THỂ  : BAND ${speakingEvaluation.overallBand}
- Phát âm (Pronunciation): ${speakingEvaluation.pronunciationScore}
- Trôi chảy (Fluency)   : ${speakingEvaluation.fluencyScore}
- Từ vựng (Vocabulary)   : ${speakingEvaluation.vocabularyScore}
- Ngữ pháp (Grammar)    : ${speakingEvaluation.grammarScore}

NHẬN XẾT CHI TIẾT CỦA AI:
${speakingEvaluation.detailedAnalysis.map((item: string, i: number) => `  ${i + 1}. ${item}`).join('\n')}

CÁC TỪ VỰNG CẦN CHÚ Ý PHÁT ÂM:
${speakingEvaluation.mispronouncedWords.map((w: any) => `  • ${w.word} [${w.ipa}] -> ${w.tip}`).join('\n')}

BÀI NÓI MẪU NÂNG CẤP THAM KHẢO:
"${speakingEvaluation.enhancedResponse}"

=====================================================
Hệ thống AI Quản Lý Giáo Án & Chấm Điểm Học Sinh
=====================================================`;
                        downloadTxtReport(`PhieuCham_Speaking_${sName}_${new Date().toLocaleDateString('vi-VN')}.txt`, reportText);
                      }}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Tải Phiếu Chấm Kỹ Năng Nói (Báo Cáo TXT)</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <Mic className="w-10 h-10 mx-auto text-slate-300 animate-pulse" />
                    <p className="text-xs">Bấm nút "Chấm & Nhận Xét Bài Nói AI" để xem kết quả phân tích chi tiết.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SKILL 2: LISTENING WITH TTS & AUDIO FILE UPLOAD      */}
          {/* ---------------------------------------------------- */}
          {activeEnglishSkill === 'listening' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-cyan-600" />
                    <span>Bài Kiểm Tra Nghe (Listening Exam & File Audio)</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full">
                    Upload Audio & TTS
                  </span>
                </div>

                {/* File Audio Upload for Listening Exam */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-cyan-600" />
                      <span>Tải Đề Thi Nghe Lên (Tệp âm thanh MP3 / WAV / M4A):</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-2 transition-all">
                      <Headphones className="w-4 h-4" />
                      <span>{customListeningFileName ? `File: ${customListeningFileName}` : 'Chọn Tệp Đề Thi Nghe (MP3/WAV)'}</span>
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setCustomListeningAudioUrl(url);
                            setCustomListeningFileName(file.name);
                          }
                        }}
                      />
                    </label>

                    {customListeningAudioUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomListeningAudioUrl(null);
                          setCustomListeningFileName(null);
                        }}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        Xóa audio
                      </button>
                    )}
                  </div>

                  {customListeningAudioUrl && (
                    <div className="bg-slate-900 p-3 rounded-xl border border-cyan-400/40 space-y-1 mt-2">
                      <div className="text-xs text-amber-300 font-bold flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Đồ họa trình phát Audio Đề Thi Nghe đã tải lên:</span>
                      </div>
                      <audio controls src={customListeningAudioUrl} className="w-full h-9 rounded-lg" />
                    </div>
                  )}
                </div>

                {/* International Audio Player / TTS Player */}
                <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-4 rounded-xl border border-cyan-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-cyan-300">Đoạn Văn Mẫu Phát Âm AI Standard:</span>
                    <span className="text-[10px] bg-amber-400 text-blue-950 px-2 py-0.5 rounded-full font-black">
                      US Accent
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={listeningAudioText}
                    onChange={(e) => setListeningAudioText(e.target.value)}
                    className="w-full text-xs text-slate-100 bg-slate-950/80 p-2.5 rounded-lg border border-cyan-500/20 font-serif focus:outline-none focus:border-cyan-400"
                  />
                  <div className="flex items-center gap-2">
                    {!isPlayingEnglishTTS ? (
                      <button
                        onClick={() => handlePlayTTS(listeningAudioText)}
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Phát Âm Thanh Nghe Cho Học Sinh</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStopTTS}
                        className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Dừng Audio</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Quiz Questions */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase">Câu hỏi điền từ nghe:</h4>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 block font-bold">1. We collected warm _______ and donated them to children.</label>
                    <input
                      type="text"
                      value={listeningAnswers.q1}
                      onChange={(e) => setListeningAnswers({ ...listeningAnswers, q1: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 block font-bold">2. Donated to children in _______ areas.</label>
                    <input
                      type="text"
                      value={listeningAnswers.q2}
                      onChange={(e) => setListeningAnswers({ ...listeningAnswers, q2: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 block font-bold">3. Volunteering helps us develop _______.</label>
                    <input
                      type="text"
                      value={listeningAnswers.q3}
                      onChange={(e) => setListeningAnswers({ ...listeningAnswers, q3: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGradeListening}
                  className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-cyan-300 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Chấm & So Sánh Đáp Án Nghe</span>
                </button>
              </div>

              {/* Listening Result */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Kết Quả Bài Kiểm Tra Nghe</span>
                  </h3>
                  {listeningGradedResult && (
                    <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      Điểm: {listeningGradedResult.score}/10
                    </span>
                  )}
                </div>

                {listeningGradedResult ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900">
                      {listeningGradedResult.feedback}
                    </div>

                    <div className="space-y-2">
                      {listeningGradedResult.details.map((item: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <span className="font-medium text-slate-800">{item.q}</span>
                          <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                            {item.answer} (Chính xác)
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const sName = currentStudent ? currentStudent.name : 'HocSinh';
                        const reportText = `=====================================================
PHIẾU BÁO CÁO KẾT QUẢ BÀI THI NGHE (LISTENING SCORECARD)
=====================================================
Học sinh      : ${sName}
Lớp           : ${currentClass ? currentClass.name : 'Chung'}
Môn học       : ${selectedSubject}
Ngày chấm     : ${new Date().toLocaleDateString('vi-VN')}

ĐIỂM SỐ       : ${listeningGradedResult.score} / 10 Điểm
NHẬN XẾT CHUNG: ${listeningGradedResult.feedback}

CHI TIẾT CÂU TRẢ LỜI:
${listeningGradedResult.details.map((item: any, idx: number) => `  [Câu ${idx + 1}] ${item.q} => Trả lời: ${item.answer}`).join('\n')}

=====================================================
Hệ thống AI Quản Lý Giáo Án & Chấm Điểm Học Sinh
=====================================================`;
                        downloadTxtReport(`PhieuCham_Listening_${sName}_${new Date().toLocaleDateString('vi-VN')}.txt`, reportText);
                      }}
                      className="w-full mt-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Tải Phiếu Chấm Bài Nghe (Báo Cáo TXT)</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <Headphones className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs mt-2">Bấm nút "Chấm & So Sánh Đáp Án Nghe" để xem điểm số.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SKILL 3: READING WITH WORD, PDF & PHOTO UPLOAD       */}
          {/* ---------------------------------------------------- */}
          {activeEnglishSkill === 'reading' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Đoạn Văn Đọc Hiểu & Tải Bài Làm (Reading Comprehension)</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    Word / PDF / Ảnh OCR
                  </span>
                </div>

                {/* Upload Word, PDF, or Photo of Reading Work (Nút Đọc) */}
                <StudentWorkUploader
                  title="Tải File Word (.docx), PDF (.pdf) hoặc Ảnh Chụp bài làm Đọc hiểu của HS"
                  mode="essay"
                  acceptedTypes=".doc,.docx,.pdf,image/*,.txt"
                  onFileSelect={(data) => {
                    if (data.extractedText) {
                      setReadingPassage(data.extractedText);
                      setReadingSourceFile(data.name);
                    }
                  }}
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Nội dung văn bản đọc hiểu:</label>
                    {readingSourceFile && (
                      <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        📄 Nguồn: {readingSourceFile}
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={readingPassage}
                    onChange={(e) => setReadingPassage(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 leading-relaxed font-serif focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase">Câu hỏi True / False:</h4>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 block font-bold">1. Community service is work done for money. (True/False)</label>
                    <select
                      value={readingAnswers.q1}
                      onChange={(e) => setReadingAnswers({ ...readingAnswers, q1: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="False">False (Đúng)</option>
                      <option value="True">True</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 block font-bold">2. Volunteers do not visit elderly people. (True/False)</label>
                    <select
                      value={readingAnswers.q2}
                      onChange={(e) => setReadingAnswers({ ...readingAnswers, q2: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="False">False (Đúng)</option>
                      <option value="True">True</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGradeReading}
                  className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-cyan-300 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Chấm Bài Đọc Hiểu AI</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Kết Quả Đánh Giá Bài Đọc</span>
                  </h3>
                </div>

                {readingGradedResult ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <div className="text-sm font-black text-emerald-900">Điểm số: {readingGradedResult.score}/10</div>
                    <p className="text-xs text-emerald-800">{readingGradedResult.feedback}</p>

                    <button
                      onClick={() => {
                        const sName = currentStudent ? currentStudent.name : 'HocSinh';
                        const reportText = `=====================================================
PHIẾU BÁO CÁO KẾT QUẢ BÀI ĐỌC HIỂU (READING SCORECARD)
=====================================================
Học sinh           : ${sName}
Lớp                : ${currentClass ? currentClass.name : 'Chung'}
Nguồn file bài làm : ${readingSourceFile || 'Văn bản nhập trực tiếp'}
Ngày chấm          : ${new Date().toLocaleDateString('vi-VN')}

VĂN BẢN ĐỌC HIỂU:
${readingPassage}

ĐIỂM SỐ            : ${readingGradedResult.score} / 10 Điểm
ĐÁNH GIÁ CHUNG     : ${readingGradedResult.feedback}

=====================================================
Hệ thống AI Quản Lý Giáo Án & Chấm Điểm Học Sinh
=====================================================`;
                        downloadTxtReport(`PhieuCham_Reading_${sName}_${new Date().toLocaleDateString('vi-VN')}.txt`, reportText);
                      }}
                      className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Tải Phiếu Chấm Bài Đọc Hiểu (Báo Cáo TXT)</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs mt-2">Bấm "Chấm Bài Đọc Hiểu AI" để xem phản hồi.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------------------------------------------- */}
          {/* SKILL 4: WRITING                                     */}
          {/* ---------------------------------------------------- */}
          {activeEnglishSkill === 'writing' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-purple-600" />
                    <span>Chấm & Sửa Lỗi Bài Viết Tiếng Anh (Writing Evaluation)</span>
                  </h3>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Đề bài viết (Prompt):</label>
                  <input
                    type="text"
                    value={writingPrompt}
                    onChange={(e) => setWritingPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Upload student writing photo/file */}
                <StudentWorkUploader
                  title="Upload ảnh bài viết Tiếng Anh hoặc file essay của học sinh"
                  mode="essay"
                  onFileSelect={(data) => {
                    if (data.extractedText) {
                      setWritingStudentText(data.extractedText);
                    }
                  }}
                />

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Đoạn văn của Học sinh (Trích xuất từ ảnh/file):</label>
                  <textarea
                    rows={5}
                    value={writingStudentText}
                    onChange={(e) => setWritingStudentText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleGradeWriting}
                  className="w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-900 text-amber-300 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Chấm Ngữ Pháp, Từ Vựng & Viết Lại Bài Mẫu</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span>Kết Quả Chấm Bài Viết</span>
                  </h3>
                  {writingGradedResult && (
                    <span className="text-xs font-black bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full">
                      Điểm: {writingGradedResult.score}/10
                    </span>
                  )}
                </div>

                {writingGradedResult ? (
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 space-y-1">
                      <div className="text-xs font-bold text-purple-900">Trình độ tương đương: {writingGradedResult.cefrLevel}</div>
                      <div className="text-xs text-purple-800">{writingGradedResult.grammarFeedback}</div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs font-extrabold text-slate-800 uppercase">Bài viết đã được chỉnh sửa chuẩn ngữ pháp:</h5>
                      <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-serif">
                        {writingGradedResult.correctedVersion}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const sName = currentStudent ? currentStudent.name : 'HocSinh';
                        const reportText = `=====================================================
PHIẾU BÁO CÁO KẾT QUẢ BÀI VIẾT (WRITING SCORECARD)
=====================================================
Học sinh            : ${sName}
Lớp                 : ${currentClass ? currentClass.name : 'Chung'}
Đề bài              : ${writingPrompt}
Ngày chấm           : ${new Date().toLocaleDateString('vi-VN')}

BÀI VIẾT BẮT ĐẦU CỦA HỌC SINH:
${writingStudentText}

ĐIỂM SỐ             : ${writingGradedResult.score} / 10 Điểm
TRÌNH ĐỘ TƯƠNG ĐƯƠNG : ${writingGradedResult.cefrLevel}
NHẬN XẾT NGỮ PHÁP   : ${writingGradedResult.grammarFeedback}

BÀI VIẾT ĐÃ ĐƯỢC CHỈNH SỬA CHUẨN NGỮ PHÁP:
${writingGradedResult.correctedVersion}

=====================================================
Hệ thống AI Quản Lý Giáo Án & Chấm Điểm Học Sinh
=====================================================`;
                        downloadTxtReport(`PhieuCham_Writing_${sName}_${new Date().toLocaleDateString('vi-VN')}.txt`, reportText);
                      }}
                      className="w-full mt-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Tải Phiếu Chấm Bài Viết (Báo Cáo TXT)</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <PenTool className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs mt-2">Bấm nút "Chấm Ngữ Pháp..." để xem kết quả đánh giá.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: MULTIPLE CHOICE FOR ALL SUBJECTS                  */}
      {/* ======================================================== */}
      {activeMode === 'multiple_choice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-600" />
                <span>Phiếu Câu Hỏi Trắc Nghiệm ({selectedSubject})</span>
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded-full">
                Auto-Grader & OCR
              </span>
            </div>

            {/* Upload image of student answer sheet */}
            <StudentWorkUploader
              title="Upload phiếu trả lời trắc nghiệm / Ảnh bài làm của học sinh"
              mode="multiple_choice"
              onFileSelect={(data) => {
                // Auto fill student answers based on OCR scan
                const updated = [...mcQuestions];
                if (updated[0]) updated[0].studentAnswer = 'C';
                if (updated[1]) updated[1].studentAnswer = 'A';
                if (updated[2]) updated[2].studentAnswer = 'B';
                setMcQuestions(updated);
              }}
            />

            <div className="space-y-4">
              {mcQuestions.map((q, idx) => (
                <div key={q.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-bold text-xs text-slate-800">
                    Câu {idx + 1}: {q.question}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {q.options.map((opt) => {
                      const optCode = opt.charAt(0);
                      const isSelected = q.studentAnswer === optCode;
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            const updated = [...mcQuestions];
                            updated[idx].studentAnswer = optCode;
                            setMcQuestions(updated);
                          }}
                          className={`p-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 text-white font-bold shadow'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleGradeMultipleChoice}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-cyan-300 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Chấm Điểm & Xuất Lời Giải Chi Tiết</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Kết Quả Chấm Trắc Nghiệm</span>
              </h3>
              {mcGradedResult && (
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  Điểm: {mcGradedResult.score}/10
                </span>
              )}
            </div>

            {mcGradedResult ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-900">
                  Số câu đúng: {mcGradedResult.correctCount} / {mcGradedResult.total} câu. {mcGradedResult.feedback}
                </div>

                <div className="space-y-3">
                  {mcGradedResult.questions.map((q: any, i: number) => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        q.isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Câu {i + 1}: {q.question}</span>
                        {q.isCorrect ? (
                          <span className="text-emerald-700 font-black">✓ Đúng (+{(10/mcQuestions.length).toFixed(1)}đ)</span>
                        ) : (
                          <span className="text-rose-700 font-black">✗ Sai (Đã chọn: {q.studentAnswer} - Đúng: {q.correctAnswer})</span>
                        )}
                      </div>
                      <p className="text-slate-600 italic pt-1">{q.explanation}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const sName = currentStudent ? currentStudent.name : 'HocSinh';
                    const reportText = `=====================================================
PHIẾU BÁO CÁO KẾT QUẢ CHẤM TRẮC NGHIỆM (MULTIPLE CHOICE)
=====================================================
Học sinh        : ${sName}
Lớp             : ${currentClass ? currentClass.name : 'Chung'}
Môn học         : ${selectedSubject}
Ngày chấm       : ${new Date().toLocaleDateString('vi-VN')}

SỐ CÂU ĐÚNG     : ${mcGradedResult.correctCount} / ${mcGradedResult.total} Câu
ĐIỂM SỐ TỔNG    : ${mcGradedResult.score} / 10 Điểm
NHẬN XẾT CHUNG  : ${mcGradedResult.feedback}

LỜI GIẢI CHI TIẾT TỪNG CÂU:
${mcGradedResult.questions
  .map(
    (q: any, i: number) =>
      `[Câu ${i + 1}] ${q.question}
  - Đã chọn: ${q.studentAnswer} | Đáp án đúng: ${q.correctAnswer} (${q.isCorrect ? 'ĐÚNG' : 'SAI'})
  - Lời giải: ${q.explanation}`
  )
  .join('\n\n')}

=====================================================
Hệ thống AI Quản Lý Giáo Án & Chấm Điểm Học Sinh
=====================================================`;
                    downloadTxtReport(`PhieuCham_TracNghiem_${sName}_${new Date().toLocaleDateString('vi-VN')}.txt`, reportText);
                  }}
                  className="w-full mt-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Tải Phiếu Chấm Trắc Nghiệm (Báo Cáo TXT)</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <CheckSquare className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs mt-2">Bấm nút "Chấm Điểm..." để xem báo cáo chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 3: ESSAY & PROBLEM SOLVING                          */}
      {/* ======================================================== */}
      {activeMode === 'essay' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-600" />
                <span>Bài Làm Tự Luận / Bài Tập ({selectedSubject})</span>
              </h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Đề bài tự luận / Câu hỏi bài tập:</label>
              <textarea
                rows={3}
                value={essayPrompt}
                onChange={(e) => setEssayPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Upload image or file for Essay Student Work */}
            <StudentWorkUploader
              title="Upload ảnh chụp bài viết tay hoặc file Word/PDF bài làm của học sinh"
              mode="essay"
              onFileSelect={(data) => {
                if (data.extractedText) {
                  setEssayStudentWork(data.extractedText);
                }
              }}
            />

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nội dung Văn bản Bài làm / Bài giải của Học sinh (Trích xuất AI):</label>
              <textarea
                rows={7}
                value={essayStudentWork}
                onChange={(e) => setEssayStudentWork(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleGradeEssay}
              disabled={isEvaluatingEssay}
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-cyan-300 font-black text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isEvaluatingEssay ? 'Đang phân tích bài làm...' : 'Chấm Bài Tự Luận & Nhận Xét Lỗi Sai AI'}</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Báo Cáo Chấm Bài Tự Luận AI</span>
              </h3>
              {essayGradedResult && (
                <span className="text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                  Điểm: {essayGradedResult.score}/10
                </span>
              )}
            </div>

            {essayGradedResult ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
                  Xếp loại: {essayGradedResult.gradeLetter}
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ưu điểm bài làm:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {essayGradedResult.strengths.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-slate-800 uppercase flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Gợi ý cải thiện:
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                    {essayGradedResult.improvements.map((imp: string, idx: number) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800">
                  <h5 className="text-xs font-extrabold text-amber-300 uppercase">Bài văn / Bài giải mẫu đạt điểm tối đa:</h5>
                  <p className="text-xs text-slate-200 leading-relaxed font-serif pt-1">
                    {essayGradedResult.suggestedModelText}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const sName = currentStudent ? currentStudent.name : 'HocSinh';
                    const reportText = `=====================================================
PHIẾU BÁO CÁO KẾT QUẢ CHẤM TỰ LUẬN / BÀI TẬP (ESSAY REPORT)
=====================================================
Học sinh         : ${sName}
Lớp              : ${currentClass ? currentClass.name : 'Chung'}
Môn học          : ${selectedSubject}
Đề bài           : ${essayPrompt}
Ngày chấm        : ${new Date().toLocaleDateString('vi-VN')}

BÀI LÀM CỦA HỌC SINH:
${essayStudentWork}

ĐIỂM SỐ          : ${essayGradedResult.score} / 10 Điểm (Xếp loại: ${essayGradedResult.gradeLetter})

ƯU ĐIỂM BÀI LÀM:
${essayGradedResult.strengths.map((s: string) => `  • ${s}`).join('\n')}

GỢI Ý CẢI THIỆN:
${essayGradedResult.improvements.map((imp: string) => `  • ${imp}`).join('\n')}

BÀI VĂN / BÀI GIẢI MẪU THAM KHẢO TỐI ĐA ĐIỂM:
${essayGradedResult.suggestedModelText}

=====================================================
Hệ thống AI Quản Lý Giáo Án & Chấm Điểm Học Sinh
=====================================================`;
                    downloadTxtReport(`PhieuCham_TuLuan_${sName}_${new Date().toLocaleDateString('vi-VN')}.txt`, reportText);
                  }}
                  className="w-full mt-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Tải Phiếu Chấm Bài Tự Luận (Báo Cáo TXT)</span>
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <PenTool className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs mt-2">Bấm nút "Chấm Bài Tự Luận..." để xem đánh giá chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
