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
        h3 { font-size: 13pt; font-weight: bold; color: #001f3f; margin-top: 15px; margin-bottom: 5px; border-bottom: 1.5px solid #001f3f; padding-bottom: 3px; }
        h4 { font-size: 12pt; font-weight: bold; color: #1e3a8a; margin-top: 10px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        td, th { border: 1px solid #000; padding: 6px 10px; font-size: 12pt; vertical-align: top; }
        .meta-table td { border: none; padding: 4px 0; }
        .bg-gray { background-color: #f2f4f7; }
        .activity-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; margin-bottom: 10px; }
        .bilingual-box { background-color: #f0f7ff; border: 1px solid #0056b3; padding: 10px; margin-bottom: 15px; border-radius: 4px; }
        .vocab-table th { background-color: #001f3f; color: #fff; text-align: left; }
        .badge-time { display: inline-block; background-color: #e0f2fe; color: #0369a1; font-weight: bold; font-size: 11pt; padding: 2px 8px; border-radius: 4px; margin-left: 8px; }
      </style>
    </head>
    <body>
      <div style="text-align:center;">
        <p style="font-size:11pt; text-transform:uppercase; margin:0; color:#475569;">BỘ GIÁO DỤC VÀ ĐÀO TẠO — GDPT 2018 (CÔNG VĂN 5512)</p>
        <h1>KẾ HOẠCH BÀI DẠY (GIÁO ÁN)</h1>
        <h2>BÀI: ${plan.title.toUpperCase()}</h2>
      </div>

      <table class="meta-table">
        <tr>
          <td><strong>Trường:</strong> ${plan.schoolName || 'Trường THCS/THPT'}</td>
          <td><strong>Họ và tên GV:</strong> ${plan.teacherName || 'Giáo viên bộ môn'}</td>
        </tr>
        <tr>
          <td><strong>Môn học:</strong> ${plan.subject}</td>
          <td><strong>Lớp học:</strong> ${plan.className}</td>
        </tr>
        <tr>
          <td><strong>Tiết PPCT:</strong> ${plan.curriculumPeriod || 'Tiết 1'} (${plan.periodsCount || 1} tiết)</td>
          <td><strong>Bộ sách giáo khoa:</strong> ${plan.textbookSet || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống')}</td>
        </tr>
        <tr>
          <td><strong>Ngày soạn:</strong> ${plan.prepDate || plan.date}</td>
          <td><strong>Ngày dạy:</strong> ${plan.teachDate || plan.date}</td>
        </tr>
      </table>

      <hr style="border: 0.5px solid #ccc; margin: 10px 0;" />

      <h3>I. MỤC TIÊU BÀI HỌC (CHUẨN CÔNG VĂN 5512)</h3>
      ${
        plan.objectivesKnowledge
          ? `<p><strong>1. Về Kiến thức:</strong><br/>${plan.objectivesKnowledge.replace(/\n/g, '<br/>')}</p>`
          : plan.objectives
          ? `<p><strong>1. Về Kiến thức & Mục tiêu chung:</strong><br/>${plan.objectives.replace(/\n/g, '<br/>')}</p>`
          : ''
      }
      ${
        plan.objectivesSkills
          ? `<p><strong>2. Về Kĩ năng & Năng lực:</strong><br/>${plan.objectivesSkills.replace(/\n/g, '<br/>')}</p>`
          : ''
      }
      ${
        plan.objectivesAttitude
          ? `<p><strong>3. Về Phẩm chất & Thái độ:</strong><br/>${plan.objectivesAttitude.replace(/\n/g, '<br/>')}</p>`
          : ''
      }
      ${
        plan.digitalCompetencies
          ? `<p><strong>* Khung Năng lực số (NLS):</strong><br/>${plan.digitalCompetencies.replace(/\n/g, '<br/>')}</p>`
          : ''
      }

      <h3>II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU (CHUẨN BỊ)</h3>
      <p><strong>1. Chuẩn bị của Giáo viên (GV):</strong><br/>${(plan.teacherPrep || plan.devicesAndSoftware || 'Kế hoạch bài dạy, bài giảng trình chiếu, phiếu học tập, thiết bị dạy học.').replace(/\n/g, '<br/>')}</p>
      <p><strong>2. Chuẩn bị của Học sinh (HS):</strong><br/>${(plan.studentPrep || 'Sách giáo khoa, vở ghi bài, đồ dùng học tập, chuẩn bị bài học trước ở nhà.').replace(/\n/g, '<br/>')}</p>

      ${
        b
          ? `
        <div class="bilingual-box">
          <h3 style="margin-top:0; border-bottom:1px solid #0056b3;">TÍCH HỢP GIẢNG DẠY SONG NGỮ TIẾNG ANH (BILINGUAL INTEGRATION)</h3>
          <p><strong>English Content:</strong> ${b.englishContent}</p>
          <p><strong>Dịch nghĩa Tiếng Việt:</strong> ${b.vietnameseTranslation}</p>
          ${
            b.keyTerms && b.keyTerms.length > 0
              ? `
            <p><strong>Bảng Từ Vựng & Thuật Ngữ Chuyên Ngành (3 Cột Chuẩn Quốc Tế):</strong></p>
            <table class="vocab-table">
              <thead>
                <tr>
                  <th style="width: 35%;">1. Từ / Thuật ngữ Tiếng Anh</th>
                  <th style="width: 25%;">2. Phiên âm IPA</th>
                  <th style="width: 40%;">3. Dịch nghĩa & Giải thích Tiếng Việt</th>
                </tr>
              </thead>
              <tbody>
                ${b.keyTerms
                  .map(
                    (t) => `
                  <tr>
                    <td><strong>${t.word}</strong></td>
                    <td style="font-family: 'Consolas', monospace;">${t.ipa || ''}</td>
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

      <h3>III. TIẾN TRÌNH DẠY HỌC (8 HOẠT ĐỘNG CHUẨN CÔNG VĂN 5512)</h3>
      
      ${plan.warmupActivity ? `
        <div class="activity-box">
          <h4>1. Hoạt động 1: Mở đầu / Khởi động (Warm-up) <span class="badge-time">⏱️ ${plan.warmupTime || '5 phút'}</span></h4>
          <p>${plan.warmupActivity.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      ${plan.newLessonActivity ? `
        <div class="activity-box">
          <h4>2. Hoạt động 2: Hình thành kiến thức mới / Tìm hiểu vào bài <span class="badge-time">⏱️ ${plan.newLessonTime || '15 phút'}</span></h4>
          <p>${plan.newLessonActivity.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      ${plan.practiceActivity ? `
        <div class="activity-box">
          <h4>3. Hoạt động 3: Luyện tập / Thực hành (Practice) <span class="badge-time">⏱️ ${plan.practiceTime || '10 phút'}</span></h4>
          <p>${plan.practiceActivity.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      ${plan.lowApplicationActivity ? `
        <div class="activity-box">
          <h4>4. Hoạt động 4: Vận dụng thấp (Low Application) <span class="badge-time">⏱️ ${plan.lowAppTime || '5 phút'}</span></h4>
          <p>${plan.lowApplicationActivity.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      ${plan.highApplicationActivity ? `
        <div class="activity-box">
          <h4>5. Hoạt động 5: Vận dụng cao / Sáng tạo (High Application) <span class="badge-time">⏱️ ${plan.highAppTime || '5 phút'}</span></h4>
          <p>${plan.highApplicationActivity.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      ${plan.consolidationActivity ? `
        <div class="activity-box">
          <h4>6. Hoạt động 6: Củng cố kiến thức (Consolidation) <span class="badge-time">⏱️ ${plan.consolidationTime || '3 phút'}</span></h4>
          <p>${plan.consolidationActivity.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      ${plan.homeworkActivity ? `
        <div class="activity-box">
          <h4>7. Hoạt động 7: Hướng dẫn học ở nhà & BTVN <span class="badge-time">⏱️ ${plan.homeworkTime || '2 phút'}</span></h4>
          <p>${plan.homeworkActivity.replace(/\n/g, '<br/>')}</p>
        </div>
      ` : ''}

      ${(plan.teacherActivity || plan.studentActivity) ? `
        <table>
          <thead>
            <tr class="bg-gray">
              <th style="width: 50%;">Hoạt động của Giáo viên</th>
              <th style="width: 50%;">Hoạt động của Học sinh</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${(plan.teacherActivity || 'GV chuyển giao nhiệm vụ và hướng dẫn học sinh.').replace(/\n/g, '<br/>')}</td>
              <td>${(plan.studentActivity || 'HS tiếp nhận nhiệm vụ, thảo luận và báo cáo sản phẩm.').replace(/\n/g, '<br/>')}</td>
            </tr>
          </tbody>
        </table>
      ` : ''}

      ${plan.exercises ? `<h3>IV. BÀI TẬP VÀ PHIẾU CỦNG CỐ</h3><p>${plan.exercises.replace(/\n/g, '<br/>')}</p>` : ''}
      
      <h3>V. RÚT KINH NGHIỆM SAU TIẾT DẠY (HOẠT ĐỘNG 8)</h3>
      <p><em>${(plan.reflectionNotes || plan.notes || '- Phân bổ thời gian: Đảm bảo đúng thời lượng phân phối chương trình.\n- Mức độ tiếp thu: Học sinh nắm vững nội dung bài dạy.\n- Hướng điều chỉnh: Phát huy tính tích cực, chủ động của học sinh trong các tiết tiếp theo.').replace(/\n/g, '<br/>')}</em></p>

      <h3>VI. PHẦN KIỂM TRA, NHẬN XÉT VÀ KÝ PHÊ DUYỆT</h3>
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
              <p style="text-align:center;"><strong>Giáo viên ký tên:</strong></p>
              <p style="text-align:center; margin-top:35px;"><strong>${plan.teacherName || ''}</strong></p>
            </td>
            <td style="height: 120px; vertical-align:top; font-size:11pt;">
              <p><strong>Ý kiến nhận xét:</strong> ${plan.headOfDepartmentReview || 'Đã kiểm tra, bài soạn đạt chuẩn Công văn 5512.'}</p>
              <p><strong>Kết quả:</strong> <span style="color:green; font-weight:bold;">${plan.headOfDepartmentStatus || 'Đã duyệt'}</span></p>
              <br/>
              <p style="text-align:center;"><strong>Tổ trưởng ký tên:</strong></p>
              <p style="text-align:center; margin-top:25px;"><strong>${plan.headOfDepartmentName || ''}</strong></p>
            </td>
            <td style="height: 120px; vertical-align:top; font-size:11pt;">
              <p><strong>Ý kiến BGH:</strong> ${plan.schoolBoardReview || 'Đồng ý phê duyệt cho phép đưa vào giảng dạy.'}</p>
              <p><strong>Kết quả:</strong> <span style="color:blue; font-weight:bold;">${plan.schoolBoardStatus || 'Đã duyệt'}</span></p>
              <br/>
              <p style="text-align:center;"><strong>Hiệu trưởng / BGH ký tên:</strong></p>
              <p style="text-align:center; margin-top:25px;"><strong>${plan.schoolBoardName || ''}</strong></p>
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
  const fileName = `GiaoAn_5512_${plan.subject}_${plan.title.replace(/[^a-zA-Z0-9_]/g, '_')}.doc`;
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
                <th style="border:1px solid #333; padding:6px; font-size:10.5pt; text-align:left; width:35%;">1. Từ / Thuật ngữ Tiếng Anh</th>
                <th style="border:1px solid #333; padding:6px; font-size:10.5pt; text-align:left; width:25%;">2. Phiên âm IPA</th>
                <th style="border:1px solid #333; padding:6px; font-size:10.5pt; text-align:left; width:40%;">3. Dịch nghĩa & Giải thích Tiếng Việt</th>
              </tr>
            </thead>
            <tbody>
              ${b.keyTerms.map(t => `
                <tr>
                  <td style="border:1px solid #cbd5e1; padding:6px; font-weight:bold; font-size:10.5pt;">${t.word}</td>
                  <td style="border:1px solid #cbd5e1; padding:6px; font-size:10.5pt; font-family:monospace; color:#475569;">${t.ipa || ''}</td>
                  <td style="border:1px solid #cbd5e1; padding:6px; font-size:10.5pt;">${t.meaning}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
        : '';

      const bilingualHtml = b
        ? `
          <div style="background-color:#f0f9ff; border:1.5px solid #0284c7; padding:12px; margin-bottom:16px; border-radius:6px;">
            <h3 style="font-size:12pt; font-weight:bold; color:#0369a1; margin-top:0; margin-bottom:6px; text-transform:uppercase; border-bottom: 1px solid #0284c7; padding-bottom: 3px;">
              TÍCH HỢP GIẢNG DẠY SONG NGỮ TIẾNG ANH (BILINGUAL INTEGRATION)
            </h3>
            <p style="margin:4px 0; font-size:11pt;"><strong>English Content:</strong> ${b.englishContent}</p>
            <p style="margin:4px 0; font-size:11pt;"><strong>Dịch nghĩa Tiếng Việt:</strong> ${b.vietnameseTranslation}</p>
            ${keyTermsHtml}
          </div>
        `
        : '';

      const activities = [
        { label: 'Hoạt động 1: Mở đầu / Khởi động (Warm-up)', time: plan.warmupTime || '5 phút', content: plan.warmupActivity },
        { label: 'Hoạt động 2: Hình thành kiến thức mới / Tìm hiểu vào bài', time: plan.newLessonTime || '15 phút', content: plan.newLessonActivity },
        { label: 'Hoạt động 3: Luyện tập / Thực hành (Practice)', time: plan.practiceTime || '10 phút', content: plan.practiceActivity },
        { label: 'Hoạt động 4: Vận dụng thấp (Low Application)', time: plan.lowAppTime || '5 phút', content: plan.lowApplicationActivity },
        { label: 'Hoạt động 5: Vận dụng cao / Sáng tạo (High Application)', time: plan.highAppTime || '5 phút', content: plan.highApplicationActivity },
        { label: 'Hoạt động 6: Củng cố kiến thức (Consolidation)', time: plan.consolidationTime || '3 phút', content: plan.consolidationActivity },
        { label: 'Hoạt động 7: Hướng dẫn học ở nhà & BTVN', time: plan.homeworkTime || '2 phút', content: plan.homeworkActivity },
      ].filter(a => !!a.content);

      const activitiesHtml = activities.length > 0
        ? activities.map(a => `
            <div style="background-color:#f8fafc; border:1px solid #e2e8f0; padding:10px; margin-bottom:10px; border-radius:6px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong style="color:#001f3f; font-size:11pt; text-transform:uppercase;">${a.label}</strong>
                <span style="background-color:#e0f2fe; color:#0369a1; font-weight:bold; font-size:10pt; padding:2px 8px; border-radius:4px;">⏱️ ${a.time}</span>
              </div>
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
            <td style="padding:4px 0; width:50%;"><strong>Trường:</strong> ${plan.schoolName || ''}</td>
            <td style="padding:4px 0; width:50%;"><strong>Họ và tên GV:</strong> ${plan.teacherName || ''}</td>
          </tr>
          <tr>
            <td style="padding:4px 0; width:50%;"><strong>Môn học:</strong> ${plan.subject}</td>
            <td style="padding:4px 0; width:50%;"><strong>Lớp học:</strong> ${plan.className}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><strong>Tiết PPCT:</strong> ${plan.curriculumPeriod || 'Tiết 1'} (${plan.periodsCount || 1} tiết)</td>
            <td style="padding:4px 0;"><strong>Bộ sách:</strong> ${plan.textbookSet || (plan.subject === 'Tiếng Anh' ? 'Tiếng Anh Global Success' : 'Kết nối tri thức với cuộc sống')}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><strong>Ngày soạn:</strong> ${plan.prepDate || plan.date}</td>
            <td style="padding:4px 0;"><strong>Ngày dạy:</strong> ${plan.teachDate || plan.date}</td>
          </tr>
        </table>

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          I. MỤC TIÊU BÀI HỌC (CHUẨN CÔNG VĂN 5512)
        </h3>
        ${
          plan.objectivesKnowledge
            ? `<p style="margin:2px 0 6px 0; font-size:11pt;"><strong>1. Về Kiến thức:</strong><br/>${plan.objectivesKnowledge.replace(/\n/g, '<br/>')}</p>`
            : plan.objectives
            ? `<p style="margin:2px 0 6px 0; font-size:11pt;"><strong>1. Về Kiến thức & Mục tiêu:</strong><br/>${plan.objectives.replace(/\n/g, '<br/>')}</p>`
            : ''
        }
        ${
          plan.objectivesSkills
            ? `<p style="margin:2px 0 6px 0; font-size:11pt;"><strong>2. Về Kĩ năng & Năng lực:</strong><br/>${plan.objectivesSkills.replace(/\n/g, '<br/>')}</p>`
            : ''
        }
        ${
          plan.objectivesAttitude
            ? `<p style="margin:2px 0 6px 0; font-size:11pt;"><strong>3. Về Phẩm chất & Thái độ:</strong><br/>${plan.objectivesAttitude.replace(/\n/g, '<br/>')}</p>`
            : ''
        }
        ${
          plan.digitalCompetencies
            ? `<p style="margin:2px 0 6px 0; font-size:11pt;"><strong>* Khung Năng lực số (NLS):</strong><br/>${plan.digitalCompetencies.replace(/\n/g, '<br/>')}</p>`
            : ''
        }

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU (CHUẨN BỊ)
        </h3>
        <p style="margin:2px 0 4px 0; font-size:11pt;"><strong>1. Chuẩn bị của Giáo viên (GV):</strong><br/>${(plan.teacherPrep || plan.devicesAndSoftware || 'Kế hoạch bài dạy, bài giảng trình chiếu, phiếu học tập, thiết bị số.').replace(/\n/g, '<br/>')}</p>
        <p style="margin:2px 0 6px 0; font-size:11pt;"><strong>2. Chuẩn bị của Học sinh (HS):</strong><br/>${(plan.studentPrep || 'Sách giáo khoa, vở ghi bài, đồ dùng học tập.').replace(/\n/g, '<br/>')}</p>

        ${bilingualHtml}

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          III. TIẾN TRÌNH DẠY HỌC (8 HOẠT ĐỘNG CHUẨN CÔNG VĂN 5512)
        </h3>
        ${activitiesHtml}

        ${plan.exercises ? `
          <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
            IV. BÀI TẬP VÀ PHIẾU CỦNG CỐ
          </h3>
          <p style="margin:0 0 12px 0; font-size:11pt; white-space:pre-line;">${plan.exercises}</p>
        ` : ''}

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:14px; margin-bottom:6px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          V. RÚT KINH NGHIỆM SAU TIẾT DẠY (HOẠT ĐỘNG 8)
        </h3>
        <p style="margin:0 0 12px 0; font-size:11pt; font-style:italic; color:#334155; white-space:pre-line;">${plan.reflectionNotes || plan.notes || '- Phân bổ thời gian: Đảm bảo đúng thời lượng.\n- Mức độ tiếp thu: Học sinh tiếp thu bài tốt.\n- Hướng điều chỉnh: Tiếp tục phát huy tính chủ động của học sinh.'}</p>

        <h3 style="font-size:12pt; font-weight:bold; color:#001f3f; margin-top:18px; margin-bottom:8px; border-bottom:1.5px solid #001f3f; padding-bottom:2px; text-transform:uppercase;">
          VI. PHẦN KIỂM TRA, NHẬN XÉT VÀ KÝ PHÊ DUYỆT
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
                <p style="text-align:center; margin:0;"><strong>${plan.teacherName || ''}</strong></p>
              </td>
              <td style="height:110px; vertical-align:top; border:1px solid #333; padding:8px; font-size:10pt;">
                <p style="margin:0 0 4px 0;"><strong>Nhận xét:</strong> ${plan.headOfDepartmentReview || 'Đã kiểm tra, bài soạn đạt chuẩn 5512.'}</p>
                <p style="margin:0 0 16px 0;"><strong>Kết quả:</strong> <span style="color:#15803d; font-weight:bold;">${plan.headOfDepartmentStatus || 'Đã duyệt'}</span></p>
                <p style="text-align:center; margin:0;"><strong>${plan.headOfDepartmentName || ''}</strong></p>
              </td>
              <td style="height:110px; vertical-align:top; border:1px solid #333; padding:8px; font-size:10pt;">
                <p style="margin:0 0 4px 0;"><strong>Ý kiến BGH:</strong> ${plan.schoolBoardReview || 'Đồng ý phê duyệt cho phép giảng dạy.'}</p>
                <p style="margin:0 0 16px 0;"><strong>Kết quả:</strong> <span style="color:#1d4ed8; font-weight:bold;">${plan.schoolBoardStatus || 'Đã duyệt'}</span></p>
                <p style="text-align:center; margin:0;"><strong>${plan.schoolBoardName || ''}</strong></p>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:20px; text-align:center; font-size:9pt; color:#64748b; font-style:italic;">
          Hệ thống Quản lý Kế hoạch bài dạy GDPT 2018 — Chuẩn Công văn 5512 / BGDĐT
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

