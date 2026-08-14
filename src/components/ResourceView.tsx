import React, { useState, useMemo, useRef } from 'react';
import { Classroom, ResourceItem, TabType } from '../types';
import { COMPREHENSIVE_SUBJECTS } from '../constants';
import {
  FolderKanban,
  Search,
  PlusCircle,
  ExternalLink,
  Trash2,
  Video,
  FileText,
  Globe,
  Image as ImageIcon,
  Music,
  Download,
  Share2,
  BookOpen,
  Facebook,
  Youtube,
  Upload,
  Eye,
  X,
  Sparkles,
  Check,
  Play,
  FileSpreadsheet,
  File,
  Layers,
  Link as LinkIcon,
  Copy,
} from 'lucide-react';

interface ResourceViewProps {
  classrooms: Classroom[];
  resourceItems: ResourceItem[];
  addResourceItem: (item: Omit<ResourceItem, 'id' | 'createdAt'>) => ResourceItem;
  deleteResourceItem: (id: string) => void;
  onNavigateTab: (tab: TabType) => void;
}

type FilterType = 'ALL' | 'image' | 'document' | 'audio' | 'video' | 'links';

export const ResourceView: React.FC<ResourceViewProps> = ({
  classrooms,
  resourceItems,
  addResourceItem,
  deleteResourceItem,
  onNavigateTab,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<FilterType>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');

  // Form State
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>('Toán');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [resourceType, setResourceType] = useState<ResourceItem['type']>('drive');
  const [description, setDescription] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
    size: string;
    category: 'image' | 'document' | 'audio' | 'video';
  } | null>(null);

  // Preview Modal for Images
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique subjects list merged with COMPREHENSIVE_SUBJECTS
  const subjects = useMemo(() => {
    const set = new Set<string>(COMPREHENSIVE_SUBJECTS);
    resourceItems.forEach((r) => set.add(r.subject));
    classrooms.forEach((c) => set.add(c.subject));
    return Array.from(set);
  }, [resourceItems, classrooms]);

  // Filter items
  const filteredResources = useMemo(() => {
    return resourceItems.filter((item) => {
      let matchSubject = selectedSubject === 'ALL';
      if (!matchSubject) {
        const itemSubj = item.subject.toLowerCase();
        const selSubj = selectedSubject.toLowerCase();
        matchSubject = itemSubj === selSubj || itemSubj.includes(selSubj) || selSubj.includes(itemSubj);
      }

      let matchType = true;
      if (selectedTypeFilter === 'image') matchType = item.type === 'image';
      else if (selectedTypeFilter === 'document') matchType = item.type === 'document' || item.type === 'drive';
      else if (selectedTypeFilter === 'audio') matchType = item.type === 'audio';
      else if (selectedTypeFilter === 'video') matchType = item.type === 'video' || item.type === 'youtube';
      else if (selectedTypeFilter === 'links')
        matchType = ['hoclieu', 'facebook', 'youtube', 'website', 'drive', 'other'].includes(item.type);

      const matchSearch =
        item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        item.subject.toLowerCase().includes(searchKeyword.toLowerCase());

      return matchSubject && matchType && matchSearch;
    });
  }, [resourceItems, selectedSubject, selectedTypeFilter, searchKeyword]);

  // Open modal pre-configured for a specific category
  const handleOpenUploadFor = (mode: 'file' | 'link', initialCategory?: 'image' | 'document' | 'audio' | 'video' | 'link') => {
    setUploadMode(mode);
    setTitle('');
    setLinkUrl('');
    setDescription('');
    setUploadedFile(null);

    if (mode === 'link') {
      if (initialCategory === 'link') setResourceType('hoclieu');
    }

    setIsModalOpen(true);
    if (mode === 'file' && fileInputRef.current) {
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const size = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    let category: 'image' | 'document' | 'audio' | 'video' = 'document';

    if (file.type.startsWith('image/')) category = 'image';
    else if (file.type.startsWith('audio/')) category = 'audio';
    else if (file.type.startsWith('video/')) category = 'video';
    else category = 'document';

    setUploadedFile({
      url,
      name: file.name,
      size,
      category,
    });

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    setResourceType(category);
    setLinkUrl(url);
  };

  // Select reference link presets
  const applyPresetLink = (presetType: ResourceItem['type'], defaultUrl: string, presetTitle: string) => {
    setResourceType(presetType);
    setLinkUrl(defaultUrl);
    if (!title) setTitle(presetTitle);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalUrl = linkUrl.trim() || uploadedFile?.url || '#';
    if (!title.trim()) return;

    addResourceItem({
      title: title.trim(),
      subject,
      linkUrl: finalUrl,
      type: resourceType,
      description: description.trim(),
      fileUrl: uploadedFile?.url,
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
    });

    setTitle('');
    setLinkUrl('');
    setDescription('');
    setUploadedFile(null);
    setIsModalOpen(false);
  };

  const handleCopyLink = (res: ResourceItem) => {
    const targetUrl = res.fileUrl || res.linkUrl;
    navigator.clipboard.writeText(targetUrl);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderResourceTypeBadge = (res: ResourceItem) => {
    switch (res.type) {
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Tranh Ảnh
          </span>
        );
      case 'document':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-[11px]">
            <FileText className="w-3.5 h-3.5 text-blue-600" /> Tài Liệu
          </span>
        );
      case 'audio':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-extrabold text-[11px]">
            <Music className="w-3.5 h-3.5 text-purple-600" /> File Nhạc
          </span>
        );
      case 'video':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-extrabold text-[11px]">
            <Video className="w-3.5 h-3.5 text-rose-600" /> Video Clip
          </span>
        );
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-extrabold text-[11px]">
            <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Video
          </span>
        );
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-extrabold text-[11px]">
            <Facebook className="w-3.5 h-3.5 text-blue-700" /> Facebook Link
          </span>
        );
      case 'hoclieu':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-extrabold text-[11px]">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" /> Hoclieu.vn
          </span>
        );
      case 'drive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-100 text-cyan-900 font-extrabold text-[11px]">
            <FileText className="w-3.5 h-3.5 text-cyan-700" /> Google Drive
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-extrabold text-[11px]">
            <Globe className="w-3.5 h-3.5 text-slate-600" /> Website
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#001f3f] flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-orange-500" />
            Kho Học Liệu & Đa Phương Tiện Bài Giảng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu trữ tranh ảnh minh họa, file tài liệu, file nhạc âm thanh, video clip và liên kết tham khảo (YouTube, Facebook, Hoclieu.vn, Canva, Drive)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start lg:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Thêm Học Liệu Mới</span>
        </button>
      </div>

      {/* QUICK UPLOAD BUTTONS ACTION BAR */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 rounded-2xl border border-cyan-500/30 text-white space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase text-cyan-300 tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Thêm Nhanh Theo Loại Học Liệu</span>
          </span>
          <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">
            Tải file từ máy tính hoặc chèn đường dẫn tham khảo
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            onClick={() => handleOpenUploadFor('file', 'image')}
            className="p-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 rounded-xl text-left transition-all cursor-pointer group flex items-center gap-2.5"
          >
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-200">📸 Tranh Ảnh</p>
              <p className="text-[10px] text-emerald-300/80">JPG, PNG, WEBP</p>
            </div>
          </button>

          <button
            onClick={() => handleOpenUploadFor('file', 'document')}
            className="p-3 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 rounded-xl text-left transition-all cursor-pointer group flex items-center gap-2.5"
          >
            <div className="p-2 bg-blue-500/20 text-blue-300 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-blue-200">📄 File Tài Liệu</p>
              <p className="text-[10px] text-blue-300/80">PDF, Word, PPTX</p>
            </div>
          </button>

          <button
            onClick={() => handleOpenUploadFor('file', 'audio')}
            className="p-3 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 rounded-xl text-left transition-all cursor-pointer group flex items-center gap-2.5"
          >
            <div className="p-2 bg-purple-500/20 text-purple-300 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-purple-200">🎵 File Nhạc</p>
              <p className="text-[10px] text-purple-300/80">MP3, WAV, M4A</p>
            </div>
          </button>

          <button
            onClick={() => handleOpenUploadFor('file', 'video')}
            className="p-3 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 rounded-xl text-left transition-all cursor-pointer group flex items-center gap-2.5"
          >
            <div className="p-2 bg-rose-500/20 text-rose-300 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-rose-200">🎬 Video / Clip</p>
              <p className="text-[10px] text-rose-300/80">MP4, WEBM</p>
            </div>
          </button>

          <button
            onClick={() => handleOpenUploadFor('link', 'link')}
            className="p-3 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-xl text-left transition-all cursor-pointer group flex items-center gap-2.5 col-span-2 sm:col-span-1"
          >
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg group-hover:scale-110 transition-transform shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-200">🔗 Link Tham Khảo</p>
              <p className="text-[10px] text-amber-300/80">YouTube, Hoclieu.vn...</p>
            </div>
          </button>
        </div>
      </div>

      {/* FILTER AND SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'ALL'
                  ? 'bg-[#001f3f] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tất cả học liệu</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('image')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'image'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Tranh Ảnh</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('document')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'document'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File Tài Liệu</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('audio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'audio'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>File Nhạc</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'video'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Video/Clip</span>
            </button>
            <button
              onClick={() => setSelectedTypeFilter('links')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedTypeFilter === 'links'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Links Tham Khảo</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm tên học liệu, bài giảng..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Subject Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Môn học:</span>
          <button
            onClick={() => setSelectedSubject('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              selectedSubject === 'ALL'
                ? 'bg-orange-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả môn
          </button>
          {subjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedSubject === subj
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* RESOURCE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            <FolderKanban className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-slate-600 text-sm">Chưa tìm thấy học liệu nào trong mục này</p>
            <p className="text-xs text-slate-400 mt-1">
              Bấm các nút "Tải Tranh ảnh", "File tài liệu", "File nhạc", "Video" hoặc "Link tham khảo" ở trên để thêm bài giảng.
            </p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const isLocalImage = res.type === 'image' && (res.fileUrl || res.linkUrl);
            const isAudio = res.type === 'audio';

            return (
              <div
                key={res.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-3">
                  {/* Top Header line */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {renderResourceTypeBadge(res)}
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {res.subject}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteResourceItem(res.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa học liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-[#001f3f] text-sm leading-snug">{res.title}</h3>

                  {/* Image Preview if Image Type */}
                  {isLocalImage && (
                    <div
                      onClick={() => setPreviewImage({ title: res.title, url: res.fileUrl || res.linkUrl })}
                      className="relative h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group cursor-pointer"
                    >
                      <img
                        src={res.fileUrl || res.linkUrl}
                        alt={res.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <Eye className="w-4 h-4 text-amber-300" /> Xem phóng to
                      </div>
                    </div>
                  )}

                  {/* Audio Player if Audio Type */}
                  {isAudio && (
                    <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-purple-900 font-bold">
                        <span className="flex items-center gap-1">
                          <Music className="w-3.5 h-3.5 text-purple-600" /> Nghe file nhạc âm thanh:
                        </span>
                        {res.fileSize && <span className="text-[10px] text-purple-600">{res.fileSize}</span>}
                      </div>
                      <audio controls className="w-full h-8 accent-purple-600">
                        <source src={res.fileUrl || res.linkUrl} type="audio/mpeg" />
                        Trình duyệt không hỗ trợ tệp âm thanh này.
                      </audio>
                    </div>
                  )}

                  {/* Video Clip Player if Video Type */}
                  {res.type === 'video' && (
                    <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-300">
                      <video controls className="w-full max-h-40 object-cover">
                        <source src={res.fileUrl || res.linkUrl} type="video/mp4" />
                        Trình duyệt không hỗ trợ phát video này.
                      </video>
                    </div>
                  )}

                  {/* Description */}
                  {res.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {res.description}
                    </p>
                  )}

                  {/* File name & size info if available */}
                  {res.fileName && (
                    <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="truncate">{res.fileName}</span>
                      {res.fileSize && <span className="shrink-0 text-slate-400 ml-1">{res.fileSize}</span>}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleCopyLink(res)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    title="Sao chép link"
                  >
                    {copiedId === res.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <span>{copiedId === res.id ? 'Đã chép' : 'Sao chép'}</span>
                  </button>

                  <a
                    href={res.fileUrl || res.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {res.fileUrl ? <Download className="w-3.5 h-3.5 text-amber-400" /> : <ExternalLink className="w-3.5 h-3.5 text-orange-400" />}
                    <span>{res.fileUrl ? 'Tải file / Mở' : 'Mở liên kết'}</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL UPLOAD / ADD RESOURCE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-[#001f3f] text-base flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-500" />
                <span>Thêm Học Liệu Mới Vào Kho</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMode === 'file' ? 'bg-white text-orange-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Tải File Từ Máy Tính</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  uploadMode === 'link' ? 'bg-white text-orange-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Chèn Link Tham Khảo</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FILE UPLOAD MODE */}
              {uploadMode === 'file' ? (
                <div className="space-y-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50 p-5 rounded-2xl text-center space-y-2 cursor-pointer transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,audio/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="w-10 h-10 mx-auto rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Bấm để <span className="text-orange-600 underline">chọn tệp từ máy tính</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Hỗ trợ: Tranh ảnh (JPG, PNG), Tài liệu (PDF, Word, PPT), Nhạc (MP3), Video (MP4)
                      </p>
                    </div>
                  </div>

                  {uploadedFile && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        {uploadedFile.category === 'image' && <ImageIcon className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {uploadedFile.category === 'document' && <FileText className="w-5 h-5 text-blue-600 shrink-0" />}
                        {uploadedFile.category === 'audio' && <Music className="w-5 h-5 text-purple-600 shrink-0" />}
                        {uploadedFile.category === 'video' && <Video className="w-5 h-5 text-rose-600 shrink-0" />}

                        <div className="truncate">
                          <p className="font-bold text-emerald-900 truncate">{uploadedFile.name}</p>
                          <p className="text-[10px] text-emerald-700">{uploadedFile.size}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-emerald-700 hover:text-rose-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* LINK MODE WITH PRESETS */
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Chọn nguồn nhanh / Mẫu liên kết:</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => applyPresetLink('hoclieu', 'https://hoclieu.vn', 'Kho Học Liệu Mẫu Hoclieu.vn')}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" /> Hoclieu.vn
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetLink('youtube', 'https://www.youtube.com/watch?v=', 'Video Bài Giảng YouTube')}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-900 border border-red-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Video
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetLink('facebook', 'https://www.facebook.com/', 'Kênh Facebook Bộ Môn')}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Facebook className="w-3.5 h-3.5 text-blue-700" /> Facebook
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetLink('drive', 'https://drive.google.com/', 'Thư mục Google Drive')}
                      className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-700" /> Google Drive
                    </button>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên tài liệu / Bài giảng *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Sơ đồ tư duy cấu tạo nguyên tử / Bài hát Tiếng Anh Unit 3"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Subject & Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Môn học *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    {COMPREHENSIVE_SUBJECTS.map((subj) => (
                      <option key={subj} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân loại học liệu</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="image">📸 Tranh Ảnh</option>
                    <option value="document">📄 File Tài Liệu (PDF/Word)</option>
                    <option value="audio">🎵 File Nhạc (MP3)</option>
                    <option value="video">🎬 Video / Clip</option>
                    <option value="youtube">📺 YouTube Video</option>
                    <option value="facebook">📘 Facebook Link</option>
                    <option value="hoclieu">📚 Hoclieu.vn</option>
                    <option value="drive">📁 Google Drive</option>
                    <option value="website">🌐 Trang Web / Khác</option>
                  </select>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Đường dẫn (URL) / Tệp đính kèm *
                </label>
                <input
                  type="text"
                  required
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://... hoặc đường dẫn tệp"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả thêm</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt nội dung bài giảng, cách sử dụng trong tiết học..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Lưu Học Liệu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ZOOM IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between text-white border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                <span>Tranh ảnh học liệu: {previewImage.title}</span>
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-slate-950 p-2 border border-slate-800 flex justify-center">
              <img src={previewImage.url} alt="Minh họa" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer"
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
