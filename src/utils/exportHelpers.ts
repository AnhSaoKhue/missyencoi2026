import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LessonPlan } from '../types';

/**
 * Export Lesson Plan as a Microsoft Word Document (.doc / .docx compatible)
 */
export function exportLessonPlanToWord(plan: LessonPlan) {
  const b = plan.bilingualSection;

  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${plan.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #000; margin: 20px; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; color: #001f3f; margin-bottom: 5px; }
        h2 { font-size: 14pt; font-weight: bold; text-align: center; color: #333; margin-top: 0; margin-bottom: 20px; }
        h3 { font-size: 13pt; font-weight: bold; color: #001f3f; margin-top: 15px; margin-bottom: 5px; border-bottom: 1px solid #001f3f; padding-bottom: 3px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        td, th { border: 1px solid #000; padding: 6px 10px; font-size: 12pt; vertical-align: top; }
        .meta-table td { border: none; padding: 4px 0; }
        .bg-gray { background-color: #f2f4f7; }
        .bilingual-box { background-color: #f0f7ff; border: 1px solid #0056b3; padding: 10px; margin-bottom: 15px; border-radius: 4px; }
        .vocab-table th { background-color: #001f3f; color: #fff; }
      </style>
    </head>
    <body>
      <h1>KẾ HOẠCH BÀI DẠY (GIÁO ÁN)</h1>
      <h2>BÀI: ${plan.title.toUpperCase()}</h2>

      <table class="meta-table">
        <tr>
          <td><strong>Môn học:</strong> ${plan.subject}</td>
          <td><strong>Lớp học:</strong> ${plan.className}</td>
        </tr>
        <tr>
          <td><strong>Khối lớp:</strong> ${plan.gradeLevel || 'THCS - Khối 7'}</td>
          <td><strong>Bộ sách giáo khoa:</strong> ${plan.textbookSet || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống')}</td>
        </tr>
        <tr>
          <td><strong>Số tiết:</strong> ${plan.periodsCount || 1} tiết</td>
          <td><strong>Ngày soạn:</strong> ${plan.prepDate || plan.date} | <strong>Ngày dạy:</strong> ${plan.teachDate || plan.date}</td>
        </tr>
      </table>

      <hr />

      ${
        plan.digitalCompetencies || plan.devicesAndSoftware
          ? `
        <h3>I. KHUNG NĂNG LỰC SỐ (NLS) & THIẾT BỊ DẠY HỌC</h3>
        ${plan.digitalCompetencies ? `<p><strong>Mã hóa Năng lực số:</strong><br/>${plan.digitalCompetencies.replace(/\n/g, '<br/>')}</p>` : ''}
        ${plan.devicesAndSoftware ? `<p><strong>Thiết bị & Phần mềm sử dụng:</strong><br/>${plan.devicesAndSoftware.replace(/\n/g, '<br/>')}</p>` : ''}
      `
          : ''
      }

      ${
        b
          ? `
        <div class="bilingual-box">
          <h3 style="margin-top:0;">PHÂN ĐOẠN GIẢNG DẠY SONG NGỮ (BILINGUAL ENGLISH)</h3>
          <p><strong>English Content:</strong> ${b.englishContent}</p>
          <p><strong>Dịch nghĩa Tiếng Việt:</strong> ${b.vietnameseTranslation}</p>
          ${
            b.keyTerms && b.keyTerms.length > 0
              ? `
            <table class="vocab-table">
              <thead>
                <tr>
                  <th>Từ Tiếng Anh</th>
                  <th>Phiên âm IPA</th>
                  <th>Nghĩa Tiếng Việt</th>
                </tr>
              </thead>
              <tbody>
                ${b.keyTerms
                  .map(
                    (t) => `
                  <tr>
                    <td><strong>${t.word}</strong></td>
                    <td>${t.ipa || ''}</td>
                    <td>${t.meaning}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          `
              : ''
          }
        </div>
      `
          : ''
      }

      <h3>II. MỤC TIÊU BÀI HỌC</h3>
      <p>${(plan.objectives || 'Chưa cập nhật').replace(/\n/g, '<br/>')}</p>

      <h3>III. KIẾN THỨC TRỌNG TÂM</h3>
      <p>${(plan.keyKnowledge || 'Chưa cập nhật').replace(/\n/g, '<br/>')}</p>

      <h3>IV. TIẾN TRÌNH DẠY HỌC (CÔNG VĂN 5512)</h3>
      ${plan.warmupActivity ? `<p><strong>1. Hoạt động Khởi động:</strong><br/>${plan.warmupActivity.replace(/\n/g, '<br/>')}</p>` : ''}

      <table>
        <thead>
          <tr class="bg-gray">
            <th style="width: 50%;">Hoạt động của Giáo viên</th>
            <th style="width: 50%;">Hoạt động của Học sinh</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${(plan.teacherActivity || 'GV hướng dẫn bài học').replace(/\n/g, '<br/>')}</td>
            <td>${(plan.studentActivity || 'HS thảo luận và tiếp thu').replace(/\n/g, '<br/>')}</td>
          </tr>
        </tbody>
      </table>

      ${plan.exercises ? `<h3>V. BÀI TẬP VÀ CỦNG CỐ</h3><p>${plan.exercises.replace(/\n/g, '<br/>')}</p>` : ''}
      ${plan.notes ? `<h3>VI. GHI CHÚ THÊM</h3><p>${plan.notes.replace(/\n/g, '<br/>')}</p>` : ''}

      <h3>VII. PHẦN KIỂM TRA, NHẬN XÉT VÀ KÝ PHÊ DUYỆT</h3>
      <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
          <tr class="bg-gray">
            <th style="width:33%; text-align:center;">GIÁO VIÊN SOẠN BÀI</th>
            <th style="width:33%; text-align:center;">TỔ CHUYÊN MÔN KIỂM TRA</th>
            <th style="width:34%; text-align:center;">BAN GIÁM HIỆU / NHÀ TRƯỜNG</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="height: 120px; vertical-align:top; font-size:11pt;">
              <p><strong>Ngày soạn:</strong> ${plan.prepDate || plan.date}</p>
              <p><strong>Trạng thái:</strong> Hoàn thành</p>
              <br/>
              <p style="text-align:center;"><strong>Ký tên:</strong></p>
              <p style="text-align:center; margin-top:35px;"><strong>${plan.teacherName || 'Giáo viên phụ trách'}</strong></p>
            </td>
            <td style="height: 120px; vertical-align:top; font-size:11pt;">
              <p><strong>Ý kiến nhận xét:</strong> ${plan.headOfDepartmentReview || 'Đã kiểm tra, bài soạn đạt chuẩn 5512, đáp ứng khung NLS.'}</p>
              <p><strong>Kết quả:</strong> <span style="color:green; font-weight:bold;">${plan.headOfDepartmentStatus || 'Đã duyệt'}</span></p>
              <br/>
              <p style="text-align:center;"><strong>Tổ trưởng ký tên:</strong></p>
              <p style="text-align:center; margin-top:25px;"><strong>${plan.headOfDepartmentName || 'Tổ trưởng Chuyên môn'}</strong></p>
            </td>
            <td style="height: 120px; vertical-align:top; font-size:11pt;">
              <p><strong>Ý kiến BGH:</strong> ${plan.schoolBoardReview || 'Đồng ý phê duyệt cho phép đưa vào giảng dạy.'}</p>
              <p><strong>Kết quả:</strong> <span style="color:blue; font-weight:bold;">${plan.schoolBoardStatus || 'Đã duyệt'}</span></p>
              <br/>
              <p style="text-align:center;"><strong>BGH ký & đóng dấu:</strong></p>
              <p style="text-align:center; margin-top:25px;"><strong>${plan.schoolBoardName || 'Ban Giám Hiệu'}</strong></p>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `GiaoAn_${plan.subject}_${plan.title.replace(/[^a-zA-Z0-9_]/g, '_')}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Lesson Plan directly to a professional-looking PDF document using jsPDF and html2canvas
 */
export async function exportLessonPlanToPDF(plan: LessonPlan, targetElement?: HTMLElement | string | null): Promise<void> {
  try {
    let sourceElement: HTMLElement | null = null;

    if (targetElement) {
      if (typeof targetElement === 'string') {
        sourceElement = document.getElementById(targetElement);
      } else {
        sourceElement = targetElement;
      }
    }

    let tempContainer: HTMLElement | null = null;

    if (!sourceElement) {
      const b = plan.bilingualSection;
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = '#ffffff';
      tempContainer.style.color = '#0f172a';
      tempContainer.style.padding = '36px 40px';
      tempContainer.style.fontFamily = "'Times New Roman', Times, serif";
      tempContainer.style.fontSize = '13pt';
      tempContainer.style.lineHeight = '1.5';
      tempContainer.style.boxSizing = 'border-box';

      const keyTermsHtml = b?.keyTerms && b.keyTerms.length > 0
        ? `
          <table style="width:100%; border-collapse:collapse; margin-top:8px;">
            <thead>
              <tr style="background-color:#001f3f; color:#ffffff;">
                <th style="border:1px solid #333; padding:6px; font-size:11pt; text-align:left;">Từ Tiếng Anh</th>
                <th style="border:1px solid #333; padding:6px; font-size:11pt; text-align:left;">Phiên âm IPA</th>
                <th style="border:1px solid #333; padding:6px; font-size:11pt; text-align:left;">Nghĩa Tiếng Việt</th>
              </tr>
            </thead>
            <tbody>
              ${b.keyTerms.map(t => `
                <tr>
                  <td style="border:1px solid #cbd5e1; padding:6px; font-weight:bold; font-size:11pt;">${t.word}</td>
                  <td style="border:1px solid #cbd5e1; padding:6px; font-size:11pt; color:#475569;">${t.ipa || ''}</td>
                  <td style="border:1px solid #cbd5e1; padding:6px; font-size:11pt;">${t.meaning}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        : '';

      const bilingualHtml = b
        ? `
          <div style="background-color:#f0f9ff; border:1.5px solid #0284c7; padding:12px; margin-bottom:16px; border-radius:6px;">
            <h3 style="font-size:12pt; font-weight:bold; color:#0369a1; margin-top:0; margin-bottom:6px; text-transform:uppercase;">
              PHÂN ĐOẠN GIẢNG DẠY SONG NGỮ (BILINGUAL ENGLISH)
            </h3>
            <p style="margin:4px 0; font-size:11pt;"><strong>English Content:</strong> ${b.englishContent}</p>
            <p style="margin:4px 0; font-size:11pt;"><strong>Dịch nghĩa Tiếng Việt:</strong> ${b.vietnameseTranslation}</p>
            ${keyTermsHtml}
          </div>
        `
        : '';

      const digitalHtml = (plan.digitalCompetencies || plan.devicesAndSoftware)
        ? `
          <div style="background-color:#1e293b; color:#f8fafc; padding:12px; margin-bottom:16px; border-radius:6px; border-left:4px solid #38bdf8;">
            <h3 style="font-size:12pt; font-weight:bold; color:#38bdf8; margin-top:0; margin-bottom:6px; text-transform:uppercase;">
              I. KHUNG NĂNG LỰC SỐ (NLS) & THIẾT BỊ DẠY HỌC
            </h3>
            ${plan.digitalCompetencies ? `<p style="margin:4px 0; font-size:11pt;"><strong>Mã hóa Năng lực số:</strong><br/>${plan.digitalCompetencies.replace(/\n/g, '<br/>')}</p>` : ''}
            ${plan.devicesAndSoftware ? `<p style="margin:4px 0; font-size:11pt;"><strong>Thiết bị & Phần mềm:</strong><br/>${plan.devicesAndSoftware.replace(/\n/g, '<br/>')}</p>` : ''}
          </div>
        `
        : '';

      const activities = [
        { label: 'Hoạt động 1: Khởi động (Warm-up)', content: plan.warmupActivity },
        { label: 'Hoạt động 2: Tìm hiểu bài mới (Discovery & Presentation)', content: plan.newLessonActivity },
        { label: 'Hoạt động 3: Thực hành (Practice)', content: plan.practiceActivity },
        { label: 'Hoạt động 4: Vận dụng thấp (Low Application)', content: plan.lowApplicationActivity },
        { label: 'Hoạt động 5: Vận dụng cao (High Application / Deep Learning)', content: plan.highApplicationActivity },
        { label: 'Hoạt động 6: Củng cố kiến thức (Consolidation)', content: plan.consolidationActivity },
        { label: 'Hoạt động 7: Hướng dẫn về nhà (Homework Guidance)', content: plan.homeworkActivity },
        { label: 'Hoạt động 8: Dự án Project (STEM / English Project)', content: plan.projectActivity },
      ].filter(a => !!a.content);

      const activitiesHtml = activities.length > 0
        ? activities.map(a => `
            <div style="background-color:#f8fafc; border:1px solid #e2e8f0; padding:10px; margin-bottom:10px; border-radius:6px;">
              <strong style="color:#001f3f; font-size:11pt; text-transform:uppercase;">${a.label}</strong>
              <p style="margin:6px 0 0 0; font-size:11pt; white-space:pre-line;">${a.content}</p>
            </div>
          `).join('')
        : `
          <table style="width:100%; border-collapse:collapse; margin-bottom:14px;">
            <thead>
              <tr style="background-color:#f1f5f9;">
                <th style="border:1px solid #333; padding:8px; font-size:11pt; width:50%; text-align:left;">Hoạt động của Giáo viên</th>
                <th style="border:1px solid #333; padding:8px; font-size:11pt; width:50%; text-align:left;">Hoạt động của Học sinh</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #333; padding:8px; font-size:11pt;">${(plan.teacherActivity || 'GV hướng dẫn bài học').replace(/\n/g, '<br/>')}</td>
                <td style="border:1px solid #333; padding:8px; font-size:11pt;">${(plan.studentActivity || 'HS thảo luận và thực hành').replace(/\n/g, '<br/>')}</td>
              </tr>
            </tbody>
          </table>
        `;

      tempContainer.innerHTML = `
        <div style="text-align:center; margin-bottom:12px; border-bottom:2px solid #001f3f; padding-bottom:10px;">
          <div style="font-size:10pt; font-weight:bold; color:#475569; text-transform:uppercase; letter-spacing:1px;">
            BỘ GIÁO DỤC VÀ ĐÀO TẠO — GDPT 2018 (CÔNG VĂN 5512)
          </div>
          <h1 style="font-size:16pt; font-weight:bold; color:#001f3f; margin:6px 0 2px 0; text-transform:uppercase;">
            KẾ HOẠCH BÀI DẠY (GIÁO ÁN)
          </h1>
          <h2 style="font-size:13pt; font-weight:bold; color:#0f172a; margin:0;">
            ${plan.title.toUpperCase()}
          </h2>
        </div>

        <table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:11pt;">
          <tr>
            <td style="padding:4px 0; width:50%;"><strong>Môn học:</strong> ${plan.subject}</td>
            <td style="padding:4px 0; width:50%;"><strong>Lớp học:</strong> ${plan.className}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><strong>Khối lớp:</strong> ${plan.gradeLevel || 'THCS - Khối 7'}</td>
            <td style="padding:4px 0;"><strong>Bộ sách:</strong> ${plan.textbookSet || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống')}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><strong>Thời lượng:</strong> ${plan.periodsCount || 1} tiết</td>
            <td style="padding:4px 0;"><strong>Ngày soạn:</strong> ${plan.prepDate || plan.date} | <strong>Ngày dạy:</strong> ${plan.teachDate || plan.date}</td>
          </tr>
        </table>

        ${digitalHtml}
        ${bilingualHtml}

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          II. MỤC TIÊU BÀI HỌC
        </h3>
        <p style="margin:0 0 12px 0; font-size:11pt; white-space:pre-line;">${plan.objectives || 'Chưa cập nhật'}</p>

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          III. KIẾN THỨC TRỌNG TÂM
        </h3>
        <p style="margin:0 0 12px 0; font-size:11pt; white-space:pre-line;">${plan.keyKnowledge || 'Chưa cập nhật'}</p>

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          IV. TIẾN TRÌNH DẠY HỌC (CÔNG VĂN 5512)
        </h3>
        ${activitiesHtml}

        ${plan.exercises ? `
          <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
            V. BÀI TẬP VÀ CỦNG CỐ
          </h3>
          <p style="margin:0 0 12px 0; font-size:11pt; white-space:pre-line;">${plan.exercises}</p>
        ` : ''}

        ${plan.notes ? `
          <h3 style="font-size:12pt; font-weight:bold; color:#b45309; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #b45309; padding-bottom:2px; text-transform:uppercase;">
            VI. MỤC ĐIỀU CHỈNH & RÚT KINH NGHIỆM SAU BÀI DẠY
          </h3>
          <p style="margin:0 0 12px 0; font-size:11pt; font-style:italic; color:#78350f; white-space:pre-line;">${plan.notes}</p>
        ` : ''}

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:18px; margin-bottom:8px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          VII. PHẦN KIỂM TRA, NHẬN XÉT VÀ KÝ PHÊ DUYỆT
        </h3>
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead>
            <tr style="background-color:#f1f5f9;">
              <th style="width:33%; text-align:center; border:1px solid #333; padding:6px; font-size:10pt;">GIÁO VIÊN SOẠN BÀI</th>
              <th style="width:33%; text-align:center; border:1px solid #333; padding:6px; font-size:10pt;">TỔ CHUYÊN MÔN KIỂM TRA</th>
              <th style="width:34%; text-align:center; border:1px solid #333; padding:6px; font-size:10pt;">BAN GIÁM HIỆU / NHÀ TRƯỜNG</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="height:110px; vertical-align:top; border:1px solid #333; padding:8px; font-size:10pt;">
                <p style="margin:0 0 4px 0;"><strong>Ngày soạn:</strong> ${plan.prepDate || plan.date}</p>
                <p style="margin:0 0 16px 0;"><strong>Trạng thái:</strong> Hoàn thành</p>
                <p style="text-align:center; margin:0;"><strong>${plan.teacherName || 'Giáo viên phụ trách'}</strong></p>
              </td>
              <td style="height:110px; vertical-align:top; border:1px solid #333; padding:8px; font-size:10pt;">
                <p style="margin:0 0 4px 0;"><strong>Nhận xét:</strong> ${plan.headOfDepartmentReview || 'Đã kiểm tra, bài soạn đạt chuẩn 5512.'}</p>
                <p style="margin:0 0 16px 0;"><strong>Kết quả:</strong> <span style="color:#15803d; font-weight:bold;">${plan.headOfDepartmentStatus || 'Đã duyệt'}</span></p>
                <p style="text-align:center; margin:0;"><strong>${plan.headOfDepartmentName || 'Tổ trưởng Chuyên môn'}</strong></p>
              </td>
              <td style="height:110px; vertical-align:top; border:1px solid #333; padding:8px; font-size:10pt;">
                <p style="margin:0 0 4px 0;"><strong>Ý kiến BGH:</strong> ${plan.schoolBoardReview || 'Đồng ý phê duyệt cho phép giảng dạy.'}</p>
                <p style="margin:0 0 16px 0;"><strong>Kết quả:</strong> <span style="color:#1d4ed8; font-weight:bold;">${plan.schoolBoardStatus || 'Đã duyệt'}</span></p>
                <p style="text-align:center; margin:0;"><strong>${plan.schoolBoardName || 'Ban Giám Hiệu'}</strong></p>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:20px; text-align:center; font-size:9pt; color:#64748b; font-style:italic;">
          Sản phẩm hệ thống: AI Lesson Plans - Anh Sao Khue (0346513056) — Bộ Giáo dục & Đào tạo GDPT 2018
        </div>
      `;

      document.body.appendChild(tempContainer);
      sourceElement = tempContainer;
    }

    const canvas = await html2canvas(sourceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    if (tempContainer) {
      document.body.removeChild(tempContainer);
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png');

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const safeTitle = plan.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F]/g, '_').substring(0, 30);
    const fileName = `GiaoAn_${plan.subject}_${safeTitle}.pdf`;

    pdf.save(fileName);
  } catch (err) {
    console.error('Lỗi khi xuất PDF bằng jsPDF/html2canvas:', err);
    // Print dialog fallback
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Giáo án: ${plan.title}</title></head>
          <body>
            <h2>KẾ HOẠCH BÀI DẠY: ${plan.title}</h2>
            <p>Môn: ${plan.subject} | Lớp: ${plan.className}</p>
            <button onclick="window.print()">In hoặc Lưu PDF</button>
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  }
}

/**
 * Export Individual or Class Grading Scorecard to MS Word (.doc)
 */
export function exportGradingReportToWord(options: {
  title: string;
  subject: string;
  className: string;
  studentName?: string;
  score?: number | string;
  gradeType?: string;
  detailsHtml: string;
  date?: string;
}) {
  const dateStr = options.date || new Date().toLocaleDateString('vi-VN');
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${options.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #000; margin: 25px; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .header-table td { border: none; padding: 2px 0; vertical-align: top; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; color: #001f3f; margin-bottom: 5px; }
        h2 { font-size: 13pt; font-weight: bold; text-align: center; color: #d97706; margin-top: 0; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        td, th { border: 1px solid #000; padding: 8px 10px; font-size: 12pt; vertical-align: top; }
        th { background-color: #f1f5f9; text-align: left; font-weight: bold; }
        .score-box { background-color: #fef3c7; border: 2px solid #d97706; padding: 12px; margin-bottom: 15px; text-align: center; font-size: 14pt; font-weight: bold; color: #92400e; border-radius: 6px; }
        .signature-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        .signature-table td { border: none; text-align: center; width: 50%; }
      </style>
    </head>
    <body>
      <table class="header-table">
        <tr>
          <td style="width: 50%;">
            <strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
            <strong>TRƯỜNG THCS & THPT CÔNG LẬP</strong>
          </td>
          <td style="width: 50%; text-align: right;">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
            <em>Độc lập - Tự do - Hạnh phúc</em>
          </td>
        </tr>
      </table>

      <h1>PHIẾU ĐÁNH GIÁ & KẾT QUẢ CHẤM ĐIỂM HỌC SINH</h1>
      <h2>MÔN: ${options.subject.toUpperCase()} | LỚP: ${options.className.toUpperCase()}</h2>

      <table class="header-table">
        <tr>
          <td><strong>Họ và tên Học sinh:</strong> ${options.studentName || 'Tất cả Học sinh trong Lớp'}</td>
          <td style="text-align: right;"><strong>Ngày đánh giá:</strong> ${dateStr}</td>
        </tr>
        <tr>
          <td><strong>Hình thức đánh giá:</strong> ${options.gradeType || 'Đánh giá AI tự động'}</td>
          <td style="text-align: right;"><strong>Môn học:</strong> ${options.subject}</td>
        </tr>
      </table>

      ${
        options.score !== undefined
          ? `<div class="score-box">KẾT QUẢ ĐIỂM SỐ TỔNG THỂ: ${options.score} / 10 ĐIỂM</div>`
          : ''
      }

      <div style="margin-top: 15px;">
        ${options.detailsHtml}
      </div>

      <table class="signature-table">
        <tr>
          <td>
            <strong>PHỤ HUYNH HỌC SINH</strong><br/>
            <em>(Xem và ký xác nhận)</em>
          </td>
          <td>
            <strong>GIÁO VIÊN BỘ MÔN / CHỦ NHIỆM</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = `PhieuCham_${options.subject}_${(options.studentName || options.className).replace(/\s+/g, '_')}_${dateStr}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Print Preview & Save PDF for Grading Scorecard
 */
export function exportGradingReportToPDF(options: {
  title: string;
  subject: string;
  className: string;
  studentName?: string;
  score?: number | string;
  gradeType?: string;
  detailsHtml: string;
  date?: string;
}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Vui lòng cho phép mở cửa sổ bật lên (popup) để xem trước và in phiếu.');
    return;
  }

  const dateStr = options.date || new Date().toLocaleDateString('vi-VN');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${options.title}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.5; color: #111; margin: 0; padding: 15px; }
        .no-print { background: #001f3f; color: white; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
        .btn-print { background: #f59e0b; color: #001f3f; font-weight: bold; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 12pt; }
        .btn-print:hover { background: #d97706; color: white; }
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .header-table td { border: none; padding: 2px 0; vertical-align: top; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; color: #001f3f; margin-bottom: 4px; }
        h2 { font-size: 13pt; font-weight: bold; text-align: center; color: #d97706; margin-top: 0; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        td, th { border: 1px solid #333; padding: 8px 10px; font-size: 12pt; vertical-align: top; }
        th { background-color: #f1f5f9; text-align: left; font-weight: bold; }
        .score-box { background-color: #fef3c7; border: 2px solid #d97706; padding: 10px; margin-bottom: 15px; text-align: center; font-size: 14pt; font-weight: bold; color: #92400e; border-radius: 6px; }
        .signature-table { width: 100%; border-collapse: collapse; margin-top: 35px; }
        .signature-table td { border: none; text-align: center; width: 50%; }
        @media print {
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <div>
          <strong>XEM TRƯỚC PHIẾU IN (PRINT PREVIEW)</strong>
          <span style="font-size: 11pt; display: block; opacity: 0.8;">Bấm nút bên cạnh để xuất PDF hoặc gửi tới máy in.</span>
        </div>
        <button class="btn-print" onclick="window.print()">🖨️ XÁC NHẬN IN / LƯU PDF</button>
      </div>

      <table class="header-table">
        <tr>
          <td style="width: 50%;">
            <strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br/>
            <strong>TRƯỜNG THCS & THPT CÔNG LẬP</strong>
          </td>
          <td style="width: 50%; text-align: right;">
            <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br/>
            <em>Độc lập - Tự do - Hạnh phúc</em>
          </td>
        </tr>
      </table>

      <h1>PHIẾU ĐÁNH GIÁ & KẾT QUẢ CHẤM ĐIỂM HỌC SINH</h1>
      <h2>MÔN: ${options.subject.toUpperCase()} | LỚP: ${options.className.toUpperCase()}</h2>

      <table class="header-table">
        <tr>
          <td><strong>Họ và tên Học sinh:</strong> ${options.studentName || 'Tất cả Học sinh trong Lớp'}</td>
          <td style="text-align: right;"><strong>Ngày đánh giá:</strong> ${dateStr}</td>
        </tr>
        <tr>
          <td><strong>Hình thức đánh giá:</strong> ${options.gradeType || 'Đánh giá AI tự động'}</td>
          <td style="text-align: right;"><strong>Môn học:</strong> ${options.subject}</td>
        </tr>
      </table>

      ${
        options.score !== undefined
          ? `<div class="score-box">KẾT QUẢ ĐIỂM SỐ TỔNG THỂ: ${options.score} / 10 ĐIỂM</div>`
          : ''
      }

      <div style="margin-top: 15px;">
        ${options.detailsHtml}
      </div>

      <table class="signature-table">
        <tr>
          <td>
            <strong>PHỤ HUYNH HỌC SINH</strong><br/>
            <em>(Xem và ký xác nhận)</em>
          </td>
          <td>
            <strong>GIÁO VIÊN BỘ MÔN / CHỦ NHIỆM</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

