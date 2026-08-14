# Nền tảng Quản lý Giáo dục & Trợ lý Giảng dạy AI Ánh Sao Khuê

Nền tảng quản lý lớp học, điểm danh QR thông minh, chấm chữa bài AI (22+ môn học), kiểm tra miệng & luyện nói thu âm 4 kỹ năng, soạn giáo án GDPT 2018 và Trợ lý ảo Miss Yến Còi.

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN TRÊN MÁY TÍNH CÁ NHÂN (LOCAL)

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản 18.0.0 trở lên.
- **npm** (hoặc yarn / pnpm).

### 2. Cài đặt thư viện dependencies
Mở Terminal / Command Prompt tại thư mục dự án và chạy câu lệnh:
```bash
npm install
```

### 3. Cấu hình Biến Môi Trường (API Key)
Tạo tệp `.env` ở thư mục gốc của dự án (sao chép từ `.env.example`):
```env
GEMINI_API_KEY=KHOA_API_GEMINI_CUA_BAN
NODE_ENV=development
PORT=3000
```
> **Lưu ý quan trọng**: Lấy khóa API Gemini miễn phí tại Google AI Studio: https://aistudio.google.com/app/apikey

### 4. Chạy ứng dụng ở chế độ Phát triển (Development)
Chạy câu lệnh sau để khởi chạy cả Backend Express Server và Frontend Vite:
```bash
npm run dev
```
Sau đó truy cập địa chỉ trên trình duyệt:
👉 **http://localhost:3000**

---

## 📦 HƯỚNG DẪN BUILD & DEPLOY (SẢN XUẤT)

### 1. Đóng gói ứng dụng (Build)
```bash
npm run build
```
Lệnh này sẽ biên dịch Frontend vào thư mục `dist/` và đóng gói Server Node.js thành `dist/server.cjs`.

### 2. Chạy ứng dụng đã Build (Production Start)
```bash
npm run start
```
Ứng dụng sẽ hoạt động tại **http://localhost:3000**.

---

## 📁 CẤU TRÚC MÃ NGUỒN (SOURCE CODE STRUCTURE)

```
├── .env.example                     # Mẫu khai báo biến môi trường
├── README.md                        # Hướng dẫn chi tiết dự án
├── index.html                       # Entry HTML cho Frontend React
├── package.json                     # Khai báo dependencies và scripts
├── server.ts                        # Express Backend proxy cho Gemini API
├── tsconfig.json                    # Cấu hình TypeScript
├── vite.config.ts                   # Cấu hình Vite & Tailwind
├── metadata.json                    # Metadata quyền ứng dụng (Microphone, Camera)
├── public/                          # Tài nguyên tĩnh & Tệp tải về
│   ├── Prompt_He_Thong_Anh_Sao_Khue.doc # Hồ sơ Prompt Master Word
│   ├── anh-sao-khue-source-code.zip     # Mã nguồn nén trọn bộ
│   ├── AITeacherPlatform.html          # Trang HTML đơn lập phụ trợ
│   └── Code.gs                          # Google Apps Script tích hợp
└── src/                             # Mã nguồn chính ứng dụng React
    ├── App.tsx                      # Component chính điều hướng 10 phân hệ
    ├── main.tsx                     # Entry point React 18
    ├── types.ts                     # TypeScript interfaces & types
    ├── constants.ts                 # Danh sách 22+ môn học & hằng số hệ thống
    ├── index.css                    # Global CSS & Tailwind imports
    ├── components/                  # Tất cả 20+ Giao diện Phân hệ & Modals
    │   ├── Header.tsx               # Thanh điều hướng chính & Nút tải
    │   ├── DashboardView.tsx        # Tổng quan hệ thống & Thống kê
    │   ├── ClassListView.tsx        # Quản lý Lớp học
    │   ├── ClassDetailView.tsx      # Chi tiết Lớp & Học sinh
    │   ├── AttendanceView.tsx       # Điểm danh QR & Thủ công
    │   ├── AttendanceHistoryView.tsx# Lịch sử điểm danh
    │   ├── AttendanceStatsView.tsx  # Thống kê chuyên cần
    │   ├── GradingEvaluationView.tsx# Chấm & Chữa Bài AI (22+ môn)
    │   ├── OralTestView.tsx         # Kiểm tra miệng & Thu âm 4 kỹ năng
    │   ├── LessonPlanView.tsx       # Soạn Giáo Án Chuẩn GDPT 2018
    │   ├── HomeworkView.tsx         # Giao & Quản lý bài tập
    │   ├── ScheduleView.tsx         # Thời Khóa Biểu
    │   ├── ResourceView.tsx         # Kho Tài Liệu Số
    │   ├── MissYenCoiChatbot.tsx    # Trợ lý AI Miss Yến Còi
    │   ├── StudentWorkUploader.tsx  # Tải lên bài làm học sinh
    │   ├── AudioPracticePlayer.tsx  # Trình phát âm thanh luyện tập
    │   ├── QRCodeModal.tsx          # Tạo & Hiển thị QR Code học sinh
    │   ├── BatchImportModal.tsx     # Nhập danh sách từ Excel/CSV
    │   ├── ExportAttendanceModal.tsx# Xuất báo cáo điểm danh
    │   ├── GoogleWorkspaceIntegrationModal.tsx # Tích hợp Google Workspace
    │   ├── StudentModal.tsx         # Thêm/Sửa học sinh
    │   ├── ClassModal.tsx           # Thêm/Sửa lớp học
    │   └── ConfirmModal.tsx         # Xóa & Xác nhận hành động
    ├── data/
    │   └── sampleData.ts            # Dữ liệu mẫu ban đầu
    ├── hooks/
    │   └── useClassroomStorage.ts   # Custom hook lưu trữ dữ liệu
    ├── lib/
    │   ├── celebration.ts           # Hiệu ứng pháo hoa chúc mừng
    │   ├── googleAuth.ts            # Tích hợp Google Auth
    │   └── googleDriveSheets.ts     # Tích hợp Google Drive/Sheets
    └── utils/
        ├── csvExporter.ts           # Xuất file CSV/Excel
        └── exportHelpers.ts         # Xuất báo cáo Word (.doc) & PDF
```

---

## ✨ DỊCH VỤ VÀ TÍNH NĂNG CHÍNH
1. **Chấm & Chữa Bài AI**: Hỗ trợ 22+ môn học chuẩn GDPT 2018, tự động tạo Báo cáo Word (.doc) & Bản in PDF.
2. **Kiểm Tra Miệng & Thu Âm Micro**: Tích hợp MediaRecorder đa định dạng, chấm phát âm & trôi chảy 4 kỹ năng Ngoại ngữ.
3. **Quản Lý Lớp & QR Code**: Tạo QR học sinh, quét QR điểm danh nhanh chóng.
4. **Soạn Giáo Án 5512**: AI tự tạo kế hoạch bài dạy 4 hoạt động, xuất file Word.
5. **Trợ Lý AI Miss Yến Còi**: Chatbot tư vấn phương pháp sư phạm & soạn ma trận đề thi.
