import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic, Square, Play, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { createFemaleUtterance, stopAllSpeech } from '../utils/audioAlert';

interface AudioPracticePlayerProps {
  textToSpeak: string;
  title?: string;
}

export const AudioPracticePlayer: React.FC<AudioPracticePlayerProps> = ({ textToSpeak, title = 'Luyện phát âm Song ngữ' }) => {
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Stop speech when component unmounts or text changes
  useEffect(() => {
    return () => {
      stopAllSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [textToSpeak]);

  // Text to Speech
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      setStatusMessage('Trình duyệt của bạn không hỗ trợ đọc tự động Web Speech.');
      return;
    }
    stopAllSpeech();

    const utterance = createFemaleUtterance(textToSpeak);
    
    utterance.onstart = () => setIsPlayingTTS(true);
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
    setStatusMessage('🔊 Đang phát giọng đọc AI nữ trẻ tuổi chuẩn (to, rõ lời)...');
  };

  const handleStopSpeech = () => {
    stopAllSpeech();
    setIsPlayingTTS(false);
    setStatusMessage('Đã dừng phát âm.');
  };

  // Audio Recorder
  const startRecording = async () => {
    setStatusMessage(null);
    setRecordedAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setStatusMessage('✅ Đã thu âm xong! Thầy/Cô và Học sinh có thể bấm Nghe lại bài thu.');
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatusMessage('⚠️ Không thể bật Micro. Vui lòng cho phép quyền truy cập Micro trên trình duyệt.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 sm:p-5 border border-cyan-500/30 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h5 className="font-extrabold text-sm text-cyan-200 uppercase tracking-wide">{title}</h5>
            <p className="text-xs text-slate-300">Phát âm chuẩn AI & Thu âm kiểm tra trực tiếp</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-400 text-blue-950 rounded-full">
          Song ngữ Voice
        </span>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Text to Speech Button */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between gap-2">
          <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Phát âm mẫu chuẩn (TTS)</span>
          </span>
          <div className="flex items-center gap-2">
            {!isPlayingTTS ? (
              <button
                type="button"
                onClick={handleSpeak}
                className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Nghe phát âm chuẩn</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopSpeech}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer animate-pulse"
              >
                <Square className="w-4 h-4" />
                <span>Dừng âm thanh</span>
              </button>
            )}
          </div>
        </div>

        {/* Audio Recording Button */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between gap-2">
          <span className="text-xs text-slate-300 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-rose-400" />
              <span>Thu âm luyện đọc / phát âm</span>
            </span>
            {isRecording && (
              <span className="text-[10px] font-mono text-rose-400 font-extrabold animate-pulse">
                {recordingSeconds}s
              </span>
            )}
          </span>
          <div>
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-full py-2 px-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Bắt đầu thu âm</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer animate-bounce"
              >
                <Square className="w-4 h-4" />
                <span>Dừng & Lưu ghi âm</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recorded Audio Playback */}
      {recordedAudioUrl && (
        <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Bản thu âm của Thầy/Cô hoặc Học sinh:</span>
            </span>
            <button
              type="button"
              onClick={startRecording}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Thu âm lại
            </button>
          </div>
          <audio controls src={recordedAudioUrl} className="w-full h-9 rounded-lg" />
        </div>
      )}

      {/* Status Alert */}
      {statusMessage && (
        <div className="text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-lg border border-cyan-500/30">
          {statusMessage}
        </div>
      )}
    </div>
  );
};
