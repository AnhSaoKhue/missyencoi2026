/**
 * ============================================================================
 * GOOGLE APPS SCRIPT SERVER CODE: Code.gs
 * Hệ Thống Quản Lý Lớp Học, Điểm Danh, Soạn Giáo Án & Kho Học Liệu - Anh Sao Khue
 * Triển khai trên Google Sheets hoặc Google Apps Script Web App
 * ============================================================================
 */

/**
 * Tự động tạo Menu khi mở Google Sheet
 */
function onOpen(e) {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🌟 Anh Sao Khue Platform')
      .addItem('🚀 Mở Ứng Dụng (Cửa Sổ Lớn)', 'showAppDialog')
      .addItem('📱 Mở Cột Bên (Sidebar)', 'showAppSidebar')
      .addSeparator()
      .addItem('🔄 Khởi Tạo / Làm Mới Bảng Dữ Liệu', 'initializeSheets')
      .addToUi();
  } catch (err) {
    Logger.log('Không thể tạo Menu trên Sheet (Có thể đang chạy Web App độc lập): ' + err);
  }
}

/**
 * Phục vụ Web App khi truy cập qua URL Web App
 */
function doGet(e) {
  var templateName = 'AITeacherPlatform';
  try {
    return HtmlService.createHtmlOutputFromFile(templateName)
      .setTitle('Anh Sao Khue - AI Education Platform')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Anh Sao Khue - AI Education Platform')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Hiển thị ứng dụng trong Dialog Lớn trên Google Sheets
 */
function showAppDialog() {
  var html = HtmlService.createHtmlOutputFromFile('AITeacherPlatform')
    .setWidth(1280)
    .setHeight(820)
    .setTitle('Anh Sao Khue - AI Education Platform');
  SpreadsheetApp.getUi().showModalDialog(html, 'Anh Sao Khue - AI Education Platform');
}

/**
 * Hiển thị ứng dụng trong Sidebar trên Google Sheets
 */
function showAppSidebar() {
  var html = HtmlService.createHtmlOutputFromFile('AITeacherPlatform')
    .setTitle('Anh Sao Khue');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Khởi tạo cấu trúc các Sheet cần thiết trong Google Spreadsheet
 */
function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return 'Không tìm thấy Google Sheet active!';

  getOrCreateSheet(ss, 'Lớp Học');
  getOrCreateSheet(ss, 'Học Sinh');
  getOrCreateSheet(ss, 'Điểm Danh');
  getOrCreateSheet(ss, 'Giáo Án');
  getOrCreateSheet(ss, 'Kho Học Liệu');
  getOrCreateSheet(ss, 'Bài Tập');

  var defaultData = getInitialDefaultData();
  saveData(defaultData);

  SpreadsheetApp.getUi().alert('✅ Đã khởi tạo các trang tính Google Sheet thành công!');
  return 'OK';
}

/**
 * Khởi tạo & Đọc tất cả dữ liệu từ Google Sheets hoặc PropertiesService
 */
function getData() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      var props = PropertiesService.getUserProperties();
      var raw = props.getProperty('ANH_SAO_KHUE_DATA');
      if (raw) {
        return JSON.parse(raw);
      }
      return getInitialDefaultData();
    }

    var classroomsSheet = getOrCreateSheet(ss, 'Lớp Học');
    var studentsSheet = getOrCreateSheet(ss, 'Học Sinh');
    var attendanceSheet = getOrCreateSheet(ss, 'Điểm Danh');
    var lessonPlansSheet = getOrCreateSheet(ss, 'Giáo Án');
    var resourcesSheet = getOrCreateSheet(ss, 'Kho Học Liệu');
    var homeworkSheet = getOrCreateSheet(ss, 'Bài Tập');

    var classrooms = readClassroomsFromSheet(classroomsSheet, studentsSheet);
    var attendanceSessions = readAttendanceFromSheet(attendanceSheet);
    var lessonPlans = readLessonPlansFromSheet(lessonPlansSheet);
    var resources = readResourcesFromSheet(resourcesSheet);
    var homework = readHomeworkFromSheet(homeworkSheet);

    if (classrooms.length === 0) {
      var initData = getInitialDefaultData();
      saveData(initData);
      return initData;
    }

    return {
      classrooms: classrooms,
      attendanceSessions: attendanceSessions,
      lessonPlans: lessonPlans,
      resources: resources,
      homework: homework
    };
  } catch (e) {
    return getInitialDefaultData();
  }
}

/**
 * Lưu toàn bộ dữ liệu ứng dụng vào Google Sheet / Script Properties
 */
function saveData(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      var props = PropertiesService.getUserProperties();
      props.setProperty('ANH_SAO_KHUE_DATA', JSON.stringify(data));
      return { success: true, message: 'Đã lưu dữ liệu vào bộ nhớ ứng dụng thành công!' };
    }

    var classroomsSheet = getOrCreateSheet(ss, 'Lớp Học');
    var studentsSheet = getOrCreateSheet(ss, 'Học Sinh');
    var attendanceSheet = getOrCreateSheet(ss, 'Điểm Danh');
    var lessonPlansSheet = getOrCreateSheet(ss, 'Giáo Án');
    var resourcesSheet = getOrCreateSheet(ss, 'Kho Học Liệu');
    var homeworkSheet = getOrCreateSheet(ss, 'Bài Tập');

    writeClassroomsToSheet(classroomsSheet, studentsSheet, data.classrooms || []);
    writeAttendanceToSheet(attendanceSheet, data.attendanceSessions || []);
    writeLessonPlansToSheet(lessonPlansSheet, data.lessonPlans || []);
    writeResourcesToSheet(resourcesSheet, data.resources || []);
    writeHomeworkToSheet(homeworkSheet, data.homework || []);

    return { success: true, message: 'Đã đồng bộ dữ liệu vào Google Sheets thành công!' };
  } catch (err) {
    return { success: false, message: 'Lỗi khi lưu dữ liệu: ' + err.toString() };
  }
}

// ----------------------------------------------------------------------------
// HÀM BỔ TRỢ ĐỌC/GHI GOOGLE SHEETS
// ----------------------------------------------------------------------------

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getInitialDefaultData() {
  return {
    classrooms: [
      {
        id: 'cls_7a1',
        name: 'Lớp 7A1',
        subject: 'Toán Học',
        schoolYear: '2026–2027',
        teacher: 'Thầy / Cô Anh Sao Khue',
        createdAt: new Date().toISOString(),
        students: [
          { id: 'st_1', code: 'HS01', name: 'Nguyễn Văn An', notes: 'Học sinh giỏi Toán', createdAt: new Date().toISOString() },
          { id: 'st_2', code: 'HS02', name: 'Trần Thị Bình', notes: 'Tích cực phát biểu', createdAt: new Date().toISOString() },
          { id: 'st_3', code: 'HS03', name: 'Lê Hoàng Cường', notes: 'Cần chú ý bài tập về nhà', createdAt: new Date().toISOString() }
        ]
      }
    ],
    attendanceSessions: [],
    lessonPlans: [
      {
        id: 'lp_1',
        title: 'Bài 1: Tập hợp các số hữu tỉ',
        subject: 'Toán Học',
        classId: 'cls_7a1',
        className: 'Lớp 7A1',
        date: new Date().toISOString().split('T')[0],
        periodsCount: 1,
        status: 'completed',
        objectives: 'Học sinh hiểu khái niệm số hữu tỉ, biểu diễn số hữu tỉ trên trục số.',
        keyKnowledge: 'Số hữu tỉ là số viết được dưới dạng a/b với a, b thuộc Z, b khác 0.',
        warmupActivity: 'Trò chơi nhanh: Tìm các số thực tế xung quanh.',
        teacherActivity: 'Giảng giải lý thuyết và đưa ra ví dụ minh họa.',
        studentActivity: 'Làm bài tập nhóm và trình bày lên bảng.',
        exercises: 'Bài 1, 2, 3 trang 10 SGK.',
        notes: 'Học sinh hiểu bài tốt, cần rèn luyện thêm bài tập nâng cao.',
        createdAt: new Date().toISOString()
      }
    ],
    resources: [
      {
        id: 'res_1',
        title: 'Bộ Bài Giảng Điện Tử Toán 7 - Chương 1',
        subject: 'Toán Học',
        linkUrl: 'https://drive.google.com',
        type: 'drive',
        description: 'Tổng hợp slide PowerPoint và đề ôn tập Toán 7.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'res_2',
        title: 'Video Hướng Dẫn Soạn Giáo Án Theo Công Văn 5512',
        subject: 'Phương Pháp Dạy Học',
        linkUrl: 'https://youtube.com',
        type: 'youtube',
        description: 'Bài giảng video hướng dẫn thiết kế kế hoạch bài dạy.',
        createdAt: new Date().toISOString()
      }
    ],
    homework: []
  };
}

function readClassroomsFromSheet(classSheet, studentSheet) {
  var classrooms = [];
  var classData = classSheet.getDataRange().getValues();
  var studentData = studentSheet.getDataRange().getValues();

  if (classData.length <= 1) return classrooms;

  for (var i = 1; i < classData.length; i++) {
    var row = classData[i];
    if (!row[0]) continue;
    var cId = String(row[0]);
    var cls = {
      id: cId,
      name: String(row[1] || ''),
      subject: String(row[2] || ''),
      schoolYear: String(row[3] || ''),
      teacher: String(row[4] || ''),
      createdAt: String(row[5] || new Date().toISOString()),
      students: []
    };

    for (var j = 1; j < studentData.length; j++) {
      var sRow = studentData[j];
      if (String(sRow[1]) === cId) {
        cls.students.push({
          id: String(sRow[0]),
          code: String(sRow[2] || ''),
          name: String(sRow[3] || ''),
          notes: String(sRow[4] || ''),
          createdAt: String(sRow[5] || new Date().toISOString())
        });
      }
    }

    classrooms.push(cls);
  }
  return classrooms;
}

function writeClassroomsToSheet(classSheet, studentSheet, classrooms) {
  classSheet.clearContents();
  studentSheet.clearContents();

  classSheet.appendRow(['ID Lớp', 'Tên Lớp', 'Môn Học', 'Năm Học', 'Giáo Viên', 'Ngày Tạo']);
  studentSheet.appendRow(['ID Học Sinh', 'ID Lớp', 'Mã Học Sinh', 'Họ Và Tên', 'Ghi Chú', 'Ngày Tạo']);

  classrooms.forEach(function(cls) {
    classSheet.appendRow([cls.id, cls.name, cls.subject, cls.schoolYear, cls.teacher, cls.createdAt]);
    (cls.students || []).forEach(function(st) {
      studentSheet.appendRow([st.id, cls.id, st.code, st.name, st.notes || '', st.createdAt]);
    });
  });
}

function readAttendanceFromSheet(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var sessions = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    try {
      sessions.push({
        id: String(row[0]),
        classId: String(row[1]),
        className: String(row[2]),
        date: String(row[3]),
        records: JSON.parse(row[4] || '[]'),
        savedAt: String(row[5])
      });
    } catch(e) {}
  }
  return sessions;
}

function writeAttendanceToSheet(sheet, sessions) {
  sheet.clearContents();
  sheet.appendRow(['ID Buổi', 'ID Lớp', 'Tên Lớp', 'Ngày', 'Dữ Liệu Bảng JSON', 'Thời Gian Lưu']);

  sessions.forEach(function(s) {
    sheet.appendRow([s.id, s.classId, s.className, s.date, JSON.stringify(s.records || []), s.savedAt]);
  });
}

function readLessonPlansFromSheet(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var plans = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    var bSection = null;
    if (row[21]) {
      try {
        bSection = JSON.parse(row[21]);
      } catch(e) {}
    }

    plans.push({
      id: String(row[0]),
      title: String(row[1] || ''),
      subject: String(row[2] || ''),
      classId: String(row[3] || ''),
      className: String(row[4] || ''),
      date: String(row[5] || ''),
      periodsCount: Number(row[6] || 1),
      status: String(row[7] || 'draft'),
      objectives: String(row[8] || ''),
      keyKnowledge: String(row[9] || ''),
      warmupActivity: String(row[10] || ''),
      teacherActivity: String(row[11] || ''),
      studentActivity: String(row[12] || ''),
      exercises: String(row[13] || ''),
      notes: String(row[14] || ''),
      createdAt: String(row[15] || ''),
      updatedAt: String(row[16] || ''),
      gradeLevel: String(row[17] || 'THCS - Khối 7'),
      textbookSet: String(row[18] || 'Kết nối tri thức với cuộc sống'),
      digitalCompetencies: String(row[19] || ''),
      devicesAndSoftware: String(row[20] || ''),
      bilingualSection: bSection
    });
  }
  return plans;
}

function writeLessonPlansToSheet(sheet, plans) {
  sheet.clearContents();
  sheet.appendRow([
    'ID Giáo Án', 'Tên Bài Học', 'Môn Học', 'ID Lớp', 'Tên Lớp', 'Ngày Dạy',
    'Số Tiết', 'Trạng Thái', 'Mục Tiêu', 'Kiến Thức Trọng Tâm', 'Khởi Động',
    'Hoạt Động GV', 'Hoạt Động HS', 'Bài Tập', 'Ghi Chú', 'Ngày Tạo', 'Cập Nhật',
    'Cấp Học', 'Bộ Sách', 'Mã Năng Lực Số', 'Thiết Bị & Phần Mềm', 'Bilingual JSON'
  ]);

  plans.forEach(function(p) {
    var bJson = p.bilingualSection ? JSON.stringify(p.bilingualSection) : '';
    sheet.appendRow([
      p.id, p.title, p.subject, p.classId, p.className, p.date,
      p.periodsCount, p.status, p.objectives, p.keyKnowledge, p.warmupActivity,
      p.teacherActivity, p.studentActivity, p.exercises, p.notes, p.createdAt, p.updatedAt,
      p.gradeLevel || 'THCS - Khối 7', p.textbookSet || 'Kết nối tri thức với cuộc sống',
      p.digitalCompetencies || '', p.devicesAndSoftware || '', bJson
    ]);
  });
}

function readResourcesFromSheet(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var resources = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    resources.push({
      id: String(row[0]),
      title: String(row[1] || ''),
      subject: String(row[2] || ''),
      linkUrl: String(row[3] || ''),
      type: String(row[4] || 'drive'),
      description: String(row[5] || ''),
      createdAt: String(row[6] || '')
    });
  }
  return resources;
}

function writeResourcesToSheet(sheet, resources) {
  sheet.clearContents();
  sheet.appendRow(['ID Học Liệu', 'Tiêu Đề', 'Môn Học', 'Đường Dẫn Link', 'Loại', 'Mô Tả', 'Ngày Tạo']);
  resources.forEach(function(r) {
    sheet.appendRow([r.id, r.title, r.subject, r.linkUrl, r.type, r.description, r.createdAt]);
  });
}

function readHomeworkFromSheet(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    try {
      list.push({
        id: String(row[0]),
        title: String(row[1] || ''),
        classId: String(row[2] || ''),
        className: String(row[3] || ''),
        dueDate: String(row[4] || ''),
        description: String(row[5] || ''),
        submissions: JSON.parse(row[6] || '[]')
      });
    } catch(e) {}
  }
  return list;
}

function writeHomeworkToSheet(sheet, list) {
  sheet.clearContents();
  sheet.appendRow(['ID Bài Tập', 'Tiêu Đề', 'ID Lớp', 'Tên Lớp', 'Hạn Nộp', 'Mô Tả', 'Trạng Thái Nộp Bài JSON']);
  list.forEach(function(h) {
    sheet.appendRow([h.id, h.title, h.classId, h.className, h.dueDate, h.description, JSON.stringify(h.submissions || [])]);
  });
}
