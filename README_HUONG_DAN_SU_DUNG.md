# HỆ THỐNG QUẢN LÝ DẠY HỌC THÔNG MINH - ÁNH SAO KHUÊ AI (TEACHER MANAGEMENT PRO)
Phiên bản: 3.6.0 PRO (Bản phát hành đầy đủ mới nhất)
Tác giả: Ánh Sao Khuê AI - Miss Yến Còi (Hotline/Zalo: 0346513056)

## 📦 NỘI DUNG GÓI MÃ NGUỒN TỔNG HỢP TOÀN DIỆN NÀY (ALL-IN-ONE):
1. **Toàn bộ mã nguồn gốc (Source Code)**:
   - `src/`: Toàn bộ components, views, hooks, types, data mẫu phong phú (AI Soạn giáo án CV 5512, Điểm danh, Lớp học, Kho học liệu, Chấm bài AI, Thời khóa biểu, Kiểm tra miệng AI, Dashboard Data SDK,...).
   - `public/`: Toàn bộ tài nguyên, icons, ảnh minh họa, redirects.
   - `package.json`, `tsconfig.json`, `vite.config.ts`, `server.ts`, `tailwind.config.js`.
   - `_redirects`, `netlify.toml`, `vercel.json`: Cấu hình chống lỗi 404 cho Netlify & Vercel.

2. **Thư mục Bản dựng chạy ngay (`dist/`)**:
   - Chứa sản phẩm đã biên dịch hoàn chỉnh (HTML, CSS, JS, Assets).
   - Bạn có thể lấy trực tiếp thư mục `dist/` này kéo thả vào https://app.netlify.com/drop để có web chạy ngay lập tức mà không cần cài đặt nodejs!

## 🚀 HƯỚNG DẪN CHẠY TRÊN MÁY TÍNH (LOCAL / VS CODE):
1. Cài đặt NodeJS (phiên bản 18 trở lên).
2. Mở thư mục này trong Visual Studio Code hoặc Terminal.
3. Chạy lệnh:
   npm install
   npm run dev
4. Mở trình duyệt tại http://localhost:3000

## 🌐 HƯỚNG DẪN DEPLOY LÊN NETLIFY / VERCEL:
- Cách 1 (Kéo thả Netlify Drop nhanh nhất): Kéo thả trực tiếp thư mục dist/ vào trang https://app.netlify.com/drop
- Cách 2 (Deploy từ GitHub lên Vercel / Netlify):
  - Đẩy toàn bộ source code này lên repository GitHub của bạn.
  - Kết nối repository với Vercel hoặc Netlify.
  - Build command: npm run build
  - Output directory: dist
