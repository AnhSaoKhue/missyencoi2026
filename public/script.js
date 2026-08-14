// script.js - AI Education Platform (Anh Sao Khue - 0346513056)
lucide.createIcons();

function switchTab(tabId) {
  document.querySelectorAll('.tab-view').forEach(el => el.classList.add('hidden'));
  const targetView = document.getElementById('view-' + tabId);
  if (targetView) targetView.classList.remove('hidden');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-amber-400', 'text-slate-950');
    btn.classList.add('bg-slate-800', 'text-slate-300');
  });

  const activeBtn = document.getElementById('tab-' + tabId);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-800', 'text-slate-300');
    activeBtn.classList.add('bg-amber-400', 'text-slate-950');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadPreset(type) {
  if (type === 'math') {
    document.getElementById('subject').value = 'TOÁN';
    document.getElementById('lessonTitle').value = 'Bài 5: Góc và đường thẳng song song (Tiết 1)';
  } else if (type === 'science') {
    document.getElementById('subject').value = 'KHOA HỌC TỰ NHIÊN';
    document.getElementById('lessonTitle').value = 'Bài 12: Tế bào - Đơn vị cơ sở của sự sống';
  } else if (type === 'english') {
    document.getElementById('subject').value = 'TIẾNG ANH';
    document.getElementById('lessonTitle').value = 'Unit 3: Community Service - Lesson 1: Getting Started';
  }
  generateLesson();
}

function generateLesson() {
  const school = document.getElementById('schoolName').value || 'THCS Kết Nối Tri Thức';
  const teacher = document.getElementById('teacherName').value || 'Cô Nguyễn Thị Hồng Yến';
  const subject = document.getElementById('subject').value || 'TIẾNG ANH';
  const grade = document.getElementById('gradeLevel').value || 'Lớp 7';
  const title = document.getElementById('lessonTitle').value || 'Bài Học Chuẩn';
  const duration = document.getElementById('durationText').value || '1 tiết (45 phút)';

  const html = `
    <div class="text-center font-bold uppercase space-y-1 border-b border-slate-300 pb-4 mb-6">
      <p class="text-xs">TRƯỜNG ${school.toUpperCase()}</p>
      <p class="text-xs">TỔ CHUYÊN MÔN: KHOA HỌC XÃ HỘI / NGOẠI NGỮ</p>
      <p class="text-base text-blue-900 mt-2">KẾ HOẠCH BÀI DẠY (GIÁO ÁN CHUẨN CÔNG VĂN 5512)</p>
      <p class="text-xs text-amber-700">MÔN: ${subject} - ${grade.toUpperCase()}</p>
      <p class="text-xs text-slate-700">Giáo viên thực hiện: ${teacher}</p>
    </div>

    <div class="space-y-4">
      <h3 class="font-bold text-blue-900 border-b border-blue-900 pb-1 uppercase">TÊN BÀI HỌC: ${title.toUpperCase()}</h3>
      <p><strong>Thời lượng thực hiện:</strong> ${duration}</p>

      <h4 class="font-bold text-slate-900 mt-4">I. MỤC TIÊU BÀI HỌC</h4>
      <p><strong>1. Về kiến thức:</strong> Học sinh nắm vững từ vựng, cấu trúc ngữ pháp trọng tâm bài học ${title}.</p>
      <p><strong>2. Về năng lực:</strong> Phát triển năng lực giao tiếp, hợp tác nhóm và tự học cá nhân.</p>
      <p><strong>3. Về phẩm chất:</strong> Rèn luyện tinh thần trách nhiệm, chăm chỉ và yêu thích môn học.</p>

      <h4 class="font-bold text-slate-900 mt-4">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h4>
      <p><strong>1. Giáo viên:</strong> Giáo án điện tử, máy chiếu, bảng phụ, tệp nghe audio.</p>
      <p><strong>2. Học sinh:</strong> Sách giáo khoa, vở ghi, đồ dùng học tập.</p>

      <h4 class="font-bold text-slate-900 mt-4">III. TIẾN TRÌNH DẠY HỌC (CÔNG VĂN 5512)</h4>
      <div class="space-y-3">
        <div class="bg-slate-50 p-3 rounded border border-slate-200">
          <p class="font-bold text-blue-900">1. Hoạt động 1: Mở đầu (Warm-up - 5 phút)</p>
          <p>- <em>Mục tiêu:</em> Tạo khí thế học tập, kết nối kiến thức cũ và bài mới.</p>
          <p>- <em>Nội dung:</em> Chơi trò chơi khởi động ngẫu nhiên.</p>
        </div>
        <div class="bg-slate-50 p-3 rounded border border-slate-200">
          <p class="font-bold text-blue-900">2. Hoạt động 2: Hình thành kiến thức mới (20 phút)</p>
          <p>- <em>Mục tiêu:</em> Khám phá từ vựng và mẫu câu mới của bài học.</p>
          <p>- <em>Sản phẩm:</em> Học sinh hoàn thành phiếu học tập cá nhân.</p>
        </div>
        <div class="bg-slate-50 p-3 rounded border border-slate-200">
          <p class="font-bold text-blue-900">3. Hoạt động 3: Luyện tập (12 phút)</p>
          <p>- <em>Mục tiêu:</em> Củng cố kiến thức thông qua bài tập thực hành.</p>
        </div>
        <div class="bg-slate-50 p-3 rounded border border-slate-200">
          <p class="font-bold text-blue-900">4. Hoạt động 4: Vận dụng & Dặn dò (8 phút)</p>
          <p>- <em>Mục tiêu:</em> Ứng dụng kiến thức vào thực tiễn cuộc sống.</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('lessonContent').innerHTML = html;
}

function pickRandomStudent() {
  const students = [
    "Nguyễn Văn An (HS001)",
    "Trần Thị Bình (HS002)",
    "Lê Hoàng Cường (HS003)",
    "Phạm Minh Đức (HS004)",
    "Hoàng Thị Giang (HS005)",
    "Đỗ Hải Nam (HS006)"
  ];
  const random = students[Math.floor(Math.random() * students.length)];
  document.getElementById('selectedStudentName').innerText = random;
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const history = document.getElementById('chatHistory');
  
  const userDiv = document.createElement('div');
  userDiv.className = 'bg-slate-900 p-3 rounded-xl border border-slate-800 ml-auto max-w-lg text-right';
  userDiv.innerHTML = `<p class="font-bold text-cyan-300">Thầy/Cô:</p><p class="text-slate-200 mt-1">${text}</p>`;
  history.appendChild(userDiv);

  input.value = '';
  history.scrollTop = history.scrollHeight;

  setTimeout(() => {
    const botDiv = document.createElement('div');
    botDiv.className = 'bg-slate-900 p-3 rounded-xl border border-slate-800 max-w-lg';
    botDiv.innerHTML = `<p class="font-bold text-amber-300">Miss Yến còi:</p><p class="text-slate-200 mt-1">Dạ, em nhận được câu hỏi "${text}" của Thầy/Cô rồi ạ! Thầy/Cô có thể áp dụng trò chơi nhóm hoặc tạo câu hỏi tương tác để học sinh hứng thú hơn ạ!</p>`;
    history.appendChild(botDiv);
    history.scrollTop = history.scrollHeight;
  }, 600);
}

generateLesson();
