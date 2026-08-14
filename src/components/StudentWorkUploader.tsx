import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  FileText,
  Camera,
  X,
  Sparkles,
  CheckCircle,
  Eye,
  File,
  Loader2,
  AlertCircle,
  ScanText,
} from 'lucide-react';

interface StudentWorkUploaderProps {
  onFileSelect?: (fileData: { name: string; url: string; extractedText: string; isImage: boolean }) => void;
  title?: string;
  acceptedTypes?: string;
  mode?: 'multiple_choice' | 'essay' | 'general';
}

export const StudentWorkUploader: React.FC<StudentWorkUploaderProps> = ({
  onFileSelect,
  title = 'Tải bài làm / Ảnh chụp bài làm của Học sinh',
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.txt',
  mode = 'essay',
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    type: string;
    url: string;
    isImage: boolean;
  } | null>(null);

  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [previewZoomModal, setPreviewZoomModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const url = URL.createObjectURL(file);
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

    const fileObj = {
      name: file.name,
      size: sizeMb,
      type: file.type || 'Tài liệu bài làm',
      url,
      isImage,
    };

    setSelectedFile(fileObj);
    setOcrSuccess(false);

    // Simulate AI OCR scanning text from student paper
    simulateOcrProcess(fileObj);
  };

  const simulateOcrProcess = (fileObj: typeof selectedFile) => {
    if (!fileObj) return;
    setIsProcessingOcr(true);

    setTimeout(() => {
      setIsProcessingOcr(false);
      setOcrSuccess(true);

      let extracted = '';
      if (mode === 'multiple_choice') {
        extracted = `[AI SCAN OCR BÀI TRẮC NGHIỆM]\n1. C\n2. A\n3. B\n4. D\n5. C`;
      } else {
        extracted = `Bài làm học sinh (Trích xuất từ ${fileObj.name}):\n"Bài thơ Mây và sóng của Ta-go đã thể hiện tình cảm gia đình vô cùng thiêng liêng. Cậu bé đã từ chối lời mời gọi rực rỡ của mây và sóng để ở bên cạnh mẹ. Cậu sáng tạo ra những trò chơi đầy ý nghĩa: làm mây ôm lấy mẹ, làm sóng lăn tròn vào lòng mẹ. Em rất xúc động trước tình cảm ngây thơ và sâu sắc đó."`;
      }

      if (onFileSelect) {
        onFileSelect({
          name: fileObj.name,
          url: fileObj.url,
          extractedText: extracted,
          isImage: fileObj.isImage,
        });
      }
    }, 1200);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setOcrSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-4 sm:p-5 border border-cyan-500/30 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-xl">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-cyan-200 uppercase tracking-wide">{title}</h4>
            <p className="text-[11px] text-slate-300">Tải ảnh bài làm, phiếu trắc nghiệm hoặc file Word/PDF</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-cyan-400 text-blue-950 rounded-full">
          OCR Auto-Scan
        </span>
      </div>

      {!selectedFile ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-900/60 hover:bg-slate-900 p-6 rounded-2xl text-center space-y-3 cursor-pointer transition-all group"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-cyan-100">
              Bấm để <span className="text-amber-300 underline">Tải bài làm</span> hoặc kéo thả file/ảnh bài chụp vào đây
            </p>
            <p className="text-[11px] text-slate-400">
              Hỗ trợ: Ảnh chụp bài làm (JPG, PNG), File Word (.docx), PDF (.pdf)
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-slate-300 font-semibold">
            <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" /> Ảnh chụp giấy
            </span>
            <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-amber-400" /> File bài làm PDF/Word
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 p-3.5 rounded-xl border border-cyan-500/40 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedFile.isImage ? (
                <div
                  onClick={() => setPreviewZoomModal(true)}
                  className="w-14 h-14 rounded-lg overflow-hidden border border-cyan-400/50 shrink-0 cursor-pointer relative group"
                >
                  <img src={selectedFile.url} alt="Bài làm" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/20 text-amber-300 rounded-xl shrink-0">
                  <File className="w-6 h-6" />
                </div>
              )}

              <div className="truncate">
                <p className="text-xs font-bold text-slate-100 truncate">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400">{selectedFile.size}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedFile.isImage && (
                <button
                  type="button"
                  onClick={() => setPreviewZoomModal(true)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Xem ảnh
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Đổi bài làm khác"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* OCR Processing Status */}
          {isProcessingOcr && (
            <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/40 rounded-lg flex items-center gap-2 text-xs text-cyan-300 font-semibold animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>AI đang quét chữ viết tay & nhận diện nội dung từ bài làm học sinh...</span>
            </div>
          )}

          {ocrSuccess && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-lg flex items-start gap-2 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-200">
                  ✅ Đã trích xuất & đọc xong nội dung bài làm!
                </strong>
                <span>Hệ thống đã tự động nhập nội dung bài làm vào ô chấm bên dưới. Thầy/cô có thể bấm nút "Chấm bài AI" để lấy kết quả.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ZOOM MODAL */}
      {previewZoomModal && selectedFile?.isImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Ảnh chụp bài làm: {selectedFile.name}</span>
              </span>
              <button
                onClick={() => setPreviewZoomModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-950 p-2 border border-slate-800 flex justify-center">
              <img src={selectedFile.url} alt="Ảnh zoom" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewZoomModal(false)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
