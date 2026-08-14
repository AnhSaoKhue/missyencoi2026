// ============================================================================
// HỆ THỐNG BACKEND GOOGLE APPS SCRIPT HOÀN CHỈNH (Code.gs)
// Nền tảng: AI Lesson Plans - Anh Sao Khue (SĐT/Zalo: 0346513056)
// Bộ sách: Kết nối tri thức với cuộc sống & Tiếng Anh Global Success (2026-2027)
// Chức năng: 
//   - Xử lý API trung gian bảo mật (doGet, doPost)
//   - Tạo & Xuất file Google Docs / PDF / Word tự động lưu Google Drive
//   - Soạn Kế hoạch bài dạy AI chuẩn CV 5512 qua Gemini API
//   - Đồng bộ & Lưu trữ dữ liệu hệ thống vào Google Sheets
// ============================================================================

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // Thay thế API Key Gemini của bạn tại đây
const SYSTEM_AUTHOR = "Anh Sao Khue - 0346513056";
const DRIVE_FOLDER_NAME = "AI_Lesson_Plans_AnhSaoKhue";

/**
 * Xử lý yêu cầu HTTP GET từ Frontend / Web App
 */
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "getLessonPlans") {
      return handleGetLessonPlans();
    } else if (action === "ping") {
      return createJsonResponse({
        status: "success",
        message: "Hệ thống AI Lesson Plans - Anh Sao Khue (0346513056) đang hoạt động 24/7!",
        timestamp: new Date().toISOString()
      });
    }

    return createJsonResponse({
      status: "success",
      message: "API Google Apps Script sẵn sàng kết nối!",
      author: SYSTEM_AUTHOR
    });
  } catch (error) {
    return createJsonResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Xử lý yêu cầu HTTP POST từ Frontend / Web App
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: "error", message: "Không tìm thấy dữ liệu POST" });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data;

    switch (action) {
      case "generateLessonPlan":
        return handleGenerateLessonPlan(data);

      case "exportToDoc":
        return handleExportToGoogleDoc(data);

      case "saveToDrive":
        return handleSaveToDriveFolder(data);

      case "saveLessonPlan":
        return handleSaveToSheet(data);

      case "validateLessonData":
        return handleProcessAndValidateLessonData(data);

      default:
        return createJsonResponse({
          status: "error",
          message: "Hành động (action) không được hỗ trợ: " + action
        });
    }
  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: "Lỗi xử lý POST: " + error.toString()
    });
  }
}

// ============================================================================
// 1. TẠO & XUẤT FILE GOOGLE DOCS / DRIVE (GOOGLE INTEGRATION)
// ============================================================================

/**
 * Tạo file Google Doc tự động trình bày chuẩn mẫu Công văn 5512 Bộ GD&ĐT
 */
function handleExportToGoogleDoc(lessonData) {
  try {
    const docTitle = `Kế hoạch bài dạy - ${lessonData.title || "Bài học"} - ${lessonData.teacherName || "Giáo viên"}`;
    const doc = DocumentApp.create(docTitle);
    const body = doc.getBody();

    // Cấu hình lề trang chuẩn văn bản hành chính
    body.setMarginTop(36);
    body.setMarginBottom(36);
    body.setMarginLeft(54);
    body.setMarginRight(36);

    // Tiêu đề đầu bài
    const headerPara = body.appendParagraph("BỘ GIÁO DỤC VÀ ĐÀO TẠO - BỘ SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG");
    headerPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    headerPara.setFontSize(10).setBold(true).setForegroundColor("#1e3a8a");

    const titlePara = body.appendParagraph(`KẾ HOẠCH BÀI DẠY (GIÁO ÁN)\n${(lessonData.title || "BÀI HỌC").toUpperCase()}`);
    titlePara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    titlePara.setFontSize(14).setBold(true).setForegroundColor("#0f172a");

    // Thông tin hành chính
    const adminInfo = body.appendParagraph(
      `Trường: ${lessonData.schoolName || "THCS Kết nối tri thức"}\n` +
      `Giáo viên: ${lessonData.teacherName || "Anh Sao Khue"}\n` +
      `Môn: ${lessonData.subject || "Toán"} - Lớp: ${lessonData.gradeLevel || "Lớp 7"}\n` +
      `Thời lượng: ${lessonData.durationText || "1 tiết (45 phút)"} | Ngày soạn: ${lessonData.prepDate || ""} | Ngày dạy: ${lessonData.teachDate || ""}`
    );
    adminInfo.setFontSize(10).setItalic(true);

    body.appendHorizontalRule();

    // I. MỤC TIÊU BÀI HỌC
    body.appendParagraph("I. MỤC TIÊU BÀI HỌC").setFontSize(12).setBold(true).setForegroundColor("#b45309");
    body.appendParagraph(`1. Kiến thức: ${lessonData.objectives?.knowledge || "Học sinh nắm vững kiến thức cốt lõi."}`);
    body.appendParagraph(`2. Kỹ năng: ${lessonData.objectives?.skills || "Rèn luyện kỹ năng giải quyết vấn đề."}`);
    body.appendParagraph(`3. Phẩm chất: ${lessonData.objectives?.qualities || "Yêu nước, chăm chỉ, trung thực, trách nhiệm."}`);
    body.appendParagraph(`4. Năng lực chung: ${lessonData.objectives?.generalCompetencies || "Tự chủ, giao tiếp và hợp tác."}`);
    body.appendParagraph(`5. Năng lực đặc thù: ${lessonData.objectives?.specificCompetencies || "Năng lực chuyên môn."}`);

    // II. CHUẨN BỊ
    body.appendParagraph("\nII. CHUẨN BỊ").setFontSize(12).setBold(true).setForegroundColor("#b45309");
    body.appendParagraph(`- Giáo viên: ${lessonData.preparation?.teacher || "Máy tính, SGK Kết nối tri thức, thiết bị trình chiếu."}`);
    body.appendParagraph(`- Học sinh: ${lessonData.preparation?.students || "Đọc trước bài, phiếu học tập."}`);

    // III. TIẾN TRÌNH DẠY HỌC (BẢNG 6 BƯỚC)
    body.appendParagraph("\nIII. TIẾN TRÌNH DẠY HỌC (45 PHÚT)").setFontSize(12).setBold(true).setForegroundColor("#b45309");

    const steps = lessonData.teachingSteps || [
      { title: "1. Khởi động (5 phút)", teacher: "Tổ chức trò chơi mở đầu", student: "Tham gia trả lời", product: "Câu trả lời của HS" },
      { title: "2. Hình thành kiến thức (20 phút)", teacher: "Giảng giải, giao nhiệm vụ", student: "Thảo luận nhóm", product: "Sản phẩm thảo luận" },
      { title: "3. Luyện tập (10 phút)", teacher: "Giao bài tập phân hóa", student: "Làm bài tập cá nhân", product: "Đáp án bài tập" },
      { title: "4. Vận dụng (5 phút)", teacher: "Nêu tình huống thực tế", student: "Liên hệ thực tiễn", product: "Giải pháp thực tế" },
      { title: "5. Củng cố (3 phút)", teacher: "Tóm tắt kiến thức", student: "Ghi nhớ kiến thức", product: "Sơ đồ tư duy" },
      { title: "6. Hướng dẫn về nhà (2 phút)", teacher: "Giao nhiệm vụ về nhà", student: "Ghi chép dặn dò", product: "Bài làm ở nhà" }
    ];

    const table = body.appendTable([
      ["Hoạt động dạy học", "Hoạt động của Giáo viên", "Hoạt động của Học sinh", "Sản phẩm dự kiến"]
    ]);

    // Format Header Table
    const headerRow = table.getRow(0);
    for (let i = 0; i < 4; i++) {
      headerRow.getCell(i).setBackgroundColor("#1e293b").getChild(0).asParagraph().setFontSize(10).setBold(true).setForegroundColor("#ffffff");
    }

    steps.forEach((step) => {
      const row = table.appendRow();
      row.appendTableCell(step.title || "").getChild(0).asParagraph().setFontSize(9).setBold(true);
      row.appendTableCell(step.teacher || step.teacherActivity || "").getChild(0).asParagraph().setFontSize(9);
      row.appendTableCell(step.student || step.studentActivity || "").getChild(0).asParagraph().setFontSize(9);
      row.appendTableCell(step.product || step.expectedProduct || "").getChild(0).asParagraph().setFontSize(9);
    });

    // IV. TÍCH HỢP NĂNG LỰC SỐ
    body.appendParagraph("\nIV. TÍCH HỢP NĂNG LỰC SỐ").setFontSize(12).setBold(true).setForegroundColor("#b45309");
    body.appendParagraph(`- Công cụ số: ${lessonData.digitalCompetency?.digitalTools || "Sử dụng Canva, Kahoot, AI Assistant."}`);
    body.appendParagraph(`- Kỹ năng tra cứu & An toàn dữ liệu: ${lessonData.digitalCompetency?.safetySkill || "Hướng dẫn học sinh khai thác thông tin an toàn."}`);

    // V. TÍCH HỢP TIẾNG ANH (ENGLISH INTEGRATION)
    body.appendParagraph("\nV. TÍCH HỢP TIẾNG ANH (ENGLISH INTEGRATION - CLIL)").setFontSize(12).setBold(true).setForegroundColor("#b45309");
    if (lessonData.bilingualSection) {
      body.appendParagraph(`- Thuật ngữ (Vocabulary): ${lessonData.bilingualSection.englishTitle || ""}`);
      body.appendParagraph(`- Câu hỏi song ngữ: ${lessonData.bilingualSection.questionText || ""}`);
      body.appendParagraph(`- Đáp án chi tiết: ${lessonData.bilingualSection.explanation || ""}`);
    } else {
      body.appendParagraph("- Key Terms: Subject Core Concepts (Dịch nghĩa & Phát âm chuẩn quốc tế)");
    }

    // Chữ ký & Bản quyền
    body.appendParagraph(`\nBẢN QUYỀN SẢN PHẨM: ${SYSTEM_AUTHOR}`).setFontSize(9).setItalic(true).setForegroundColor("#64748b");

    doc.saveAndClose();

    // Di chuyển file vào thư mục Google Drive chuyên biệt
    const file = DriveApp.getFileById(doc.getId());
    const folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    const pdfExportUrl = `https://docs.google.com/document/d/${doc.getId()}/export?format=pdf`;
    const docxExportUrl = `https://docs.google.com/document/d/${doc.getId()}/export?format=docx`;

    return createJsonResponse({
      status: "success",
      message: "Đã tạo file Google Doc thành công!",
      docId: doc.getId(),
      docUrl: doc.getUrl(),
      pdfExportUrl: pdfExportUrl,
      docxExportUrl: docxExportUrl,
      folderName: DRIVE_FOLDER_NAME,
      author: SYSTEM_AUTHOR
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Lỗi tạo Google Doc: " + err.toString() });
  }
}

/**
 * Lưu file trực tiếp vào Google Drive folder
 */
function handleSaveToDriveFolder(data) {
  try {
    const folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
    const fileName = `${data.fileName || "Lesson_Plan"}_${new Date().getTime()}.txt`;
    const file = folder.createFile(fileName, data.content || "", MimeType.PLAIN_TEXT);

    return createJsonResponse({
      status: "success",
      message: "Đã lưu file thành công vào Google Drive!",
      fileUrl: file.getUrl(),
      fileName: fileName
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Lỗi lưu file Drive: " + err.toString() });
  }
}

// ============================================================================
// 2. SOẠN BÀI QUA GEMINI AI API (AI ENGINE)
// ============================================================================

function handleGenerateLessonPlan(formData) {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_GEMINI_API_KEY")) {
      return createJsonResponse({
        status: "error",
        message: "Chưa cấu hình GEMINI_API_KEY trong Code.gs. Vui lòng cập nhật API Key của bạn."
      });
    }

    const prompt = `Bạn là Đội ngũ Chuyên gia Thiết kế Hệ thống Giáo dục Phổ thông Việt Nam (Chương trình GDPT 2018).
Hãy soạn Kế hoạch bài dạy hoàn chỉnh theo Công văn 5512 cho môn ${formData.subject}, Lớp ${formData.gradeLevel}.
- Tên bài học: ${formData.title}
- Thời lượng: ${formData.durationText}
- Trường: ${formData.schoolName}
- Giáo viên: ${formData.teacherName}
- Bộ sách: Kết nối tri thức với cuộc sống / Tiếng Anh Global Success (Áp dụng năm 2026-2027).
- Yêu cầu bắt buộc: Tích hợp Năng lực số cụ thể & Tích hợp 1 phần Tiếng Anh song ngữ (CLIL) kèm thuật ngữ, câu hỏi và đáp án giải thích chi tiết.
- Yêu cầu chính xác 100% công thức, kí tự, đơn vị, kiến thức chuyên môn.

Xuất theo chuẩn 6 phần chính:
I. MỤC TIÊU BÀI HỌC (Kiến thức, Kỹ năng, Phẩm chất, Năng lực chung, Năng lực đặc thù)
II. CHUẨN BỊ (Giáo viên & Học sinh)
III. TIẾN TRÌNH DẠY HỌC (1. Khởi động, 2. Hình thành kiến thức, 3. Luyện tập, 4. Vận dụng, 5. Củng cố, 6. Hướng dẫn về nhà)
IV. TÍCH HỢP NĂNG LỰC SỐ
V. TÍCH HỢP TIẾNG ANH (Song ngữ CLIL)
VI. CHATBOT RÚT KINH NGHIỆM SAU DẠY
Bản quyền: Anh Sao Khue - 0346513056`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (json.candidates && json.candidates[0]?.content?.parts[0]?.text) {
      return createJsonResponse({
        status: "success",
        content: json.candidates[0].content.parts[0].text,
        author: SYSTEM_AUTHOR
      });
    } else {
      return createJsonResponse({
        status: "error",
        message: "Gemini API không phản hồi đúng định dạng: " + JSON.stringify(json)
      });
    }
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Lỗi kết nối AI: " + err.toString() });
  }
}

// ============================================================================
// 3. ĐỒNG BỘ CSDL GOOGLE SHEETS (SHEETS DATABASE)
// ============================================================================

function handleSaveToSheet(data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getActiveSheet();

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "STT", "Thời Gian Tạo", "Họ Tên Giáo Viên", "Trường Học",
        "Môn Học", "Lớp", "Tên Bài Học", "Ngày Soạn", "Ngày Dạy",
        "Dữ Liệu Bài Soạn", "Bản Quyền"
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    }

    const nextStt = sheet.getLastRow();
    sheet.appendRow([
      nextStt,
      new Date().toLocaleString("vi-VN"),
      data.teacherName || "Giáo viên Anh Sao Khue",
      data.schoolName || "THCS Kết nối tri thức",
      data.subject || "Môn học",
      data.gradeLevel || "Lớp 7",
      data.title || "Tên bài học",
      data.prepDate || "",
      data.teachDate || "",
      JSON.stringify(data),
      SYSTEM_AUTHOR
    ]);

    return createJsonResponse({
      status: "success",
      message: "Đã lưu dữ liệu bài soạn vào Google Sheets!",
      stt: nextStt
    });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Lỗi lưu Sheets: " + err.toString() });
  }
}

function handleGetLessonPlans() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const rows = sheet.getDataRange().getValues();

    const results = [];
    for (let i = 1; i < rows.length; i++) {
      results.push({
        stt: rows[i][0],
        createdAt: rows[i][1],
        teacherName: rows[i][2],
        schoolName: rows[i][3],
        subject: rows[i][4],
        gradeLevel: rows[i][5],
        title: rows[i][6],
        prepDate: rows[i][7],
        teachDate: rows[i][8],
        author: rows[i][10]
      });
    }

    return createJsonResponse({ status: "success", data: results });
  } catch (err) {
    return createJsonResponse({ status: "error", message: "Lỗi đọc dữ liệu Sheets: " + err.toString() });
  }
}

// ============================================================================
// 4. KIỂM TRA & RÀ SOÁT DỮ LIỆU DẠY HỌC (VALIDATION ENGINE)
// ============================================================================

function handleProcessAndValidateLessonData(data) {
  const issues = [];
  if (!data.title) issues.push("Thiếu tên bài học");
  if (!data.subject) issues.push("Thiếu môn học");
  if (!data.gradeLevel) issues.push("Thiếu khối lớp");

  const isValid = issues.length === 0;

  return createJsonResponse({
    status: isValid ? "success" : "warning",
    isValid: isValid,
    issues: issues,
    author: SYSTEM_AUTHOR
  });
}

// ============================================================================
// UTILITIES HELPERS
// ============================================================================

function getOrCreateDriveFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
