import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Download, ExternalLink, Smartphone, Sparkles } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  shareUrl?: string;
  dataContent?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle = 'Quét mã QR bằng Camera điện thoại hoặc ứng dụng Zalo/VNeID để tải về & đọc giáo án',
  shareUrl = window.location.href,
  dataContent,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const contentToEncode = dataContent || shareUrl;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(contentToEncode)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentToEncode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrApiUrl;
    a.download = `QRCode_${title.replace(/\s+/g, '_')}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden space-y-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-5 flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-400 text-blue-950 rounded-xl font-black">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-amber-300">Mã QR Code Tải & Xem Trực Tuyến</h3>
              <p className="text-xs text-slate-300 line-clamp-1">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <div className="inline-block p-4 bg-gradient-to-br from-slate-50 to-cyan-50 rounded-2xl border-2 border-cyan-400/40 shadow-inner">
            <img
              src={qrApiUrl}
              alt="QR Code Giáo án"
              className="w-52 h-52 mx-auto rounded-xl shadow-md object-contain bg-white p-2"
              onError={(e) => {
                // Fallback if network offline
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%23001f3f" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h3v3H7zM14 7h3v3h-3zM7 14h3v3H7zM14 14h3v3h-3z"/></svg>';
              }}
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs font-extrabold text-slate-800 flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-600" />
              <span>Quét mã bằng Camera điện thoại</span>
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
          </div>

          {/* Quick Share Link */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-600 truncate font-mono text-[11px] flex-1 text-left">
              {contentToEncode}
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 bg-blue-900 text-amber-300 rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 cursor-pointer hover:bg-blue-800"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleDownloadQR}
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Tải ảnh QR về máy</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
