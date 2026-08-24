import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.static(path.join(process.cwd(), "public"), { index: false }));

  // Initialize Gemini AI client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // System instruction for Miss Yến còi
  const SYSTEM_INSTRUCTION = `Bạn là "Miss Yến còi" - Trợ lý ảo AI giáo dục thông minh, trách nhiệm và tâm huyết của hệ thống "AI Education Platform - Anh Sao Khue" (Hotline/ĐIỆN THOẠI: 0346513056).

Nhiệm vụ chính của bạn:
1. Hỗ trợ giáo viên trong việc giảng dạy, tư vấn phương pháp sư phạm, soạn giáo án, tạo đề thi, câu hỏi kiểm tra miệng, quản lý lớp học và theo dõi chuyên cần học sinh.
2. Trả lời câu hỏi thắc mắc về sử dụng phần mềm AI Education Platform (điểm danh, thống kê vắng, rút câu hỏi kiểm tra ngẫu nhiên, quản lý bài tập, kho học liệu Google Drive/YouTube).
3. Trò chuyện tự nhiên, văn phong tinh tế, thân thiện, chân thành như một người đồng nghiệp giảng dạy chuyên nghiệp, dí dỏm nhẹ nhàng.

Yêu cầu nghiêm ngặt:
- Không ảo giác, không phịa thông tin vô căn cứ.
- Luôn tuân thủ đạo đức nhà giáo, chuẩn mực xã hội, an toàn pháp luật.
- Ngôn ngữ: Tiếng Việt chuẩn mực, ấm áp, có trách nhiệm.
- Xưng xưng: xưng "Miss Yến còi" hoặc "em/mình", gọi người dùng là "Thầy/Cô" hoặc "bạn".`;

  // API Route for AI Chatbot Miss Yến còi
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message content is required." });
      }

      if (!ai) {
        // Fallback response if GEMINI_API_KEY is not configured yet
        return res.json({
          reply:
            "Xin chào Thầy/Cô! Em là Miss Yến còi. Hiện tại khóa GEMINI_API_KEY chưa được cấu hình, nhưng em vẫn sẵn sàng hỗ trợ Thầy/Cô sử dụng các tính năng điểm danh, kiểm tra miệng và quản lý bài tập!",
        });
      }

      // Format contents for chat history
      const formattedContents = [];

      if (Array.isArray(history)) {
        history.forEach((item: { sender: string; text: string }) => {
          formattedContents.push({
            role: item.sender === "user" ? "user" : "model",
            parts: [{ text: item.text }],
          });
        });
      }

      // Append latest message
      formattedContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      const reply = response.text || "Em là Miss Yến còi, em luôn sẵn sàng lắng nghe Thầy/Cô ạ!";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Error in Miss Yến còi chatbot API:", error);
      return res.status(500).json({
        reply:
          "Chào Thầy/Cô, hiện tại hệ thống vừa bận một chút ạ. Thầy/Cô thử gửi lại câu hỏi cho Miss Yến còi nhé!",
      });
    }
  });

  // API Route for generating CV 5512 Lesson Plans using Gemini AI
  app.post("/api/generate-lesson-plan", async (req, res) => {
    try {
      const { title, subject, className, curriculumPeriod, schoolName, teacherName, textbookSet, periodsCount, bilingualActivities, enableBilingual } = req.body;

      if (!title || !subject) {
        return res.status(400).json({ error: "Title and subject are required." });
      }

      const activitiesList = Array.isArray(bilingualActivities) && bilingualActivities.length > 0
        ? bilingualActivities.join(", ")
        : "Khởi động (Warm-up), Hình thành kiến thức mới, Hướng dẫn về nhà (BTVN)";

      const promptText = `Bạn là một Chuyên gia Giáo dục & Sư phạm bậc cao tại Việt Nam. Hãy biên soạn một KẾ HOẠCH BÀI DẠY (GIÁO ÁN) CHUẨN CÔNG VĂN 5512/BGDĐT-GDTrH của Bộ Giáo dục & Đào tạo Việt Nam:
- Tên bài học / Tiết dạy: "${title}"
- Môn học: "${subject}"
- Lớp học: "${className || "Lớp 7"}"
- Tiết PPCT (Phân phối chương trình): "${curriculumPeriod || "Tiết 1"}"
- Họ và tên GV: "${teacherName || ""}"
- Trường: "${schoolName || ""}"
- NGUỒN DỮ LIỆU SÁCH GIÁO KHOA CHÍNH XÁC: "${textbookSet || (subject.toLowerCase().includes("tiếng anh") ? "Tiếng Anh Global Success" : "Kết nối tri thức với cuộc sống")}"
- Số tiết: ${periodsCount || 1}
- CÁC HOẠT ĐỘNG CHỌN TÍCH HỢP SONG NGỮ TIẾNG ANH: "${activitiesList}"

QUY CHUẨN SOẠN BÀI NGHIÊM NGẶT THEO CÔNG VĂN 5512:
1. MỤC TIÊU BÀI HỌC (3 MỤC RÕ RÀNG):
   - 1. Về Kiến thức (Knowledge): Chuẩn kiến thức SGK "${textbookSet || "Kết nối tri thức với cuộc sống"}".
   - 2. Về Năng lực (Competencies):
     + Năng lực chung: Tự chủ và tự học, Giao tiếp và hợp tác, Giải quyết vấn đề và sáng tạo.
     + Năng lực đặc thù: Năng lực tư duy và lập luận, mô hình hóa, ngôn ngữ, thực hành thí nghiệm.
   - 3. Về Phẩm chất (Qualities): Chăm chỉ, trung thực, trách nhiệm, tình yêu quê hương đất nước.
   - Tích hợp Khung Năng lực số [NLS1.1], [NLS2.3], [NLS5.2].

2. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU:
   - a) Chuẩn bị của Giáo viên (GV): Kế hoạch bài dạy, bài giảng điện tử số, SGK, bảng tương tác, phiếu học tập số 1, 2, học liệu số.
   - b) Chuẩn bị của Học sinh (HS): Sách giáo khoa, vở ghi bài, đồ dùng học tập, chuẩn bị bài trước ở nhà.

3. TIẾN TRÌNH DẠY HỌC (8 HOẠT ĐỘNG CHUẨN KÈM PHÂN BỔ THỜI GIAN CỤ THỂ):
   - Hoạt động 1: Khởi động (Warm-up) — Thời gian: 5 phút
   - Hoạt động 2: Hình thành kiến thức mới / Tìm hiểu vào bài — Thời gian: 15 phút
   - Hoạt động 3: Thực hành / Luyện tập (Practice) — Thời gian: 10 phút
   - Hoạt động 4: Vận dụng thấp (Low Application) — Thời gian: 5 phút
   - Hoạt động 5: Vận dụng cao / Sáng tạo (High Application) — Thời gian: 5 phút
   - Hoạt động 6: Củng cố kiến thức (Consolidation) — Thời gian: 3 phút
   - Hoạt động 7: Hướng dẫn học sinh tự học ở nhà & BTVN (Homework) — Thời gian: 2 phút
   - Hoạt động 8: Rút kinh nghiệm sau bài dạy (Reflection & Adjustment) — Sau tiết dạy
   * Trong mỗi hoạt động (1-7), trình bày đủ 4 bước kỹ thuật: a) Mục tiêu, b) Nội dung, c) Sản phẩm, d) Tổ chức thực hiện (B1: GV chuyển giao nhiệm vụ -> B2: HS thực hiện -> B3: Báo cáo thảo luận -> B4: GV nhận xét, chuẩn hóa kiến thức).

4. TÍCH HỢP SONG NGỮ TIẾNG ANH (CHO CÁC HOẠT ĐỘNG ĐƯỢC CHỌN: ${activitiesList}):
   - Trong các hoạt động được chọn, lồng ghép thuật ngữ, câu lệnh sư phạm tiếng Anh và câu hỏi tình huống song ngữ.
   - BẢNG TỪ VỰNG CHUYÊN NGÀNH CHUẨN 3 CỘT (bắt buộc dạng: TừTiếngAnh | /PhiênÂmIPA/ | DịchNghĩaTiếngViệt), từ 4 đến 8 thuật ngữ trọng tâm của bài.

HÃY TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON (KHÔNG KÈM BẤT KỲ VĂN BẢN NÀO KHÁC) VỚI CÁC TRƯỜNG:
{
  "title": "string",
  "subject": "string",
  "className": "string",
  "curriculumPeriod": "string",
  "schoolName": "string",
  "teacherName": "string",
  "textbookSet": "string",
  "periodsCount": number,
  "digitalCompetencies": "string",
  "devicesAndSoftware": "string",
  "objectives": "string",
  "objectivesKnowledge": "string",
  "objectivesSkills": "string",
  "objectivesAttitude": "string",
  "teacherPrep": "string",
  "studentPrep": "string",
  "keyKnowledge": "string",
  "warmupTime": "5 phút",
  "warmupActivity": "string",
  "newLessonTime": "15 phút",
  "newLessonActivity": "string",
  "practiceTime": "10 phút",
  "practiceActivity": "string",
  "lowAppTime": "5 phút",
  "lowApplicationActivity": "string",
  "highAppTime": "5 phút",
  "highApplicationActivity": "string",
  "consolidationTime": "3 phút",
  "consolidationActivity": "string",
  "homeworkTime": "2 phút",
  "homeworkActivity": "string",
  "reflectionNotes": "string",
  "projectActivity": "string",
  "teacherActivity": "string",
  "studentActivity": "string",
  "exercises": "string",
  "notes": "string",
  "enableBilingual": true,
  "bilingualTitle": "string",
  "bilingualEnglish": "string",
  "bilingualVietnamese": "string",
  "bilingualTermsRaw": "string",
  "targetActivities": ["string"]
}`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          config: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text || "";
        try {
          const parsedData = JSON.parse(rawText);
          return res.json({ success: true, planData: parsedData });
        } catch (e) {
          console.warn("Failed to parse Gemini JSON response directly, cleaning up markdown tags...");
          const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
          const parsedData = JSON.parse(cleanJson);
          return res.json({ success: true, planData: parsedData });
        }
      }

      // Fallback generator if AI key is missing
      return res.json({
        success: true,
        planData: generateFallbackLessonPlan(title, subject, className, curriculumPeriod, textbookSet, periodsCount, schoolName, teacherName),
      });
    } catch (error: any) {
      console.error("Error in generate-lesson-plan API:", error);
      return res.status(500).json({
        error: "Không thể sinh giáo án tự động. Đã sử dụng bộ mẫu bài giảng chuẩn.",
        planData: generateFallbackLessonPlan(
          req.body.title || "Bài dạy chuẩn",
          req.body.subject || "Toán",
          req.body.className,
          req.body.curriculumPeriod,
          req.body.textbookSet,
          req.body.periodsCount,
          req.body.schoolName,
          req.body.teacherName
        ),
      });
    }
  });

  // Helper function for rich offline fallback lesson plan generation
  function generateFallbackLessonPlan(
    title: string,
    subject: string,
    className?: string,
    curriculumPeriod?: string,
    textbookSet?: string,
    periodsCount?: number,
    schoolName?: string,
    teacherName?: string
  ) {
    const isEnglish =
      subject.toLowerCase().includes("tiếng anh") ||
      subject.toLowerCase().includes("english") ||
      (textbookSet && textbookSet.includes("Global Success"));

    const book = textbookSet || (isEnglish ? "Tiếng Anh Global Success" : "Kết nối tri thức với cuộc sống");

    if (isEnglish) {
      return {
        title: title || "Unit 1: Hobbies and Free Time Activities",
        subject: "Tiếng Anh",
        className: className || "Lớp 7",
        curriculumPeriod: curriculumPeriod || "Tiết 1",
        schoolName: schoolName || "Trường THCS/THPT",
        teacherName: teacherName || "Giáo viên Tiếng Anh",
        textbookSet: "Tiếng Anh Global Success",
        periodsCount: periodsCount || 1,
        digitalCompetencies:
          "[NLS1.1] Vận dụng từ điển số Cambridge/Oxford và công cụ phát âm AI chuẩn.\n[NLS2.3] Khai thác kho học liệu âm thanh MP3 và bài tập tương tác số.\n[NLS5.2] Luyện hội thoại phản xạ trực tiếp với AI Miss Yến Còi.",
        devicesAndSoftware:
          "Thiết bị: Máy tính GV, Bảng tương tác Smartboard, Loa Bluetooth, Micro thu âm AI.\nPhần mềm: Quizizz, Canva Presentation, Cambridge Dictionary, Miss Yến Còi AI App.",
        objectives:
          "1. Về Kiến thức: Master 8-12 core vocabulary items regarding hobbies, free time activities and community work. Understand grammar patterns (Present Simple for likes/dislikes, verbs of liking + V-ing).\n2. Về Kĩ năng: Develop 4 language skills (Listening, Speaking, Reading, Writing) with accurate IPA pronunciation /s/ and /z/.\n3. Về Phẩm chất: Encourage positive lifestyle choices, active collaboration and communication in English.",
        objectivesKnowledge:
          "- Nắm vững 8-12 từ vựng trọng tâm về sở thích, hoạt động thời gian rảnh rỗi (gardening, collecting, cycling, origami...).\n- Sử dụng thành thạo cấu trúc động từ chỉ sự yêu thích (like, love, adore, hate + V-ing/to-V).",
        objectivesSkills:
          "- Nghe hiểu các đoạn hội thoại chủ đề Hobbies trong SGK.\n- Nói lưu loát giới thiệu về sở thích cá nhân với ngữ điệu và phát âm âm đuôi /s/, /z/ chuẩn xác.\n- Kĩ năng hợp tác nhóm, giao tiếp tự tin bằng tiếng Anh.",
        objectivesAttitude:
          "- Hình thành thói quen rèn luyện các sở thích lành mạnh, bổ ích.\n- Tinh thần chăm chỉ, tích cực tham gia các hoạt động cộng đồng.",
        teacherPrep:
          "Giáo án điện tử PowerPoint/Canva, file âm thanh Audio MP3 SGK Global Success, flashcards từ vựng, máy chiếu, loa trợ giảng.",
        studentPrep:
          "Sách giáo khoa Tiếng Anh Global Success, vở ghi từ vựng, chuẩn bị trước bài đọc Getting Started ở nhà.",
        keyKnowledge:
          "1. Vocabulary: donate, volunteer, community service, hobby, leisure activity, science fiction, crafts, gardening.\n2. Grammar: Verbs of liking (like, love, enjoy, hate) + V-ing / to-V.\n3. Pronunciation: Phonics sounds /s/ and /z/ in plural nouns and verbs ending.",
        warmupTime: "5 phút",
        warmupActivity:
          "Hoạt động 1: Khởi động (Warm-up - 5 phút)\n- Mục tiêu: Kích hoạt từ vựng sẵn có, tạo không khí hứng khởi đầu giờ.\n- Nội dung: Chơi trò chơi 'Guess the Hobby' (Đoán hành động qua hình ảnh minh họa trên màn hình).\n- Sản phẩm: Học sinh gọi tên đúng ít nhất 5 sở thích bằng Tiếng Anh.\n- Tổ chức thực hiện:\n  + B1 (Chuyển giao): GV chiếu slide trò chơi, nêu luật chơi.\n  + B2 (Thực hiện): Cả lớp quan sát hình ảnh và suy nghĩ.\n  + B3 (Báo cáo): Học sinh xung phong trả lời nhanh.\n  + B4 (Đánh giá): GV tuyên dương và dẫn dắt vào bài mới.",
        newLessonTime: "15 phút",
        newLessonActivity:
          "Hoạt động 2: Tìm hiểu vào bài / Hình thành kiến thức mới (Presentation - 15 phút)\n- Mục tiêu: Khám phá từ vựng mới và cấu trúc ngữ pháp trọng tâm theo SGK Global Success.\n- Nội dung: Đọc đoạn hội thoại Getting Started, nghe phát âm chuẩn và ghi chép cấu trúc.\n- Sản phẩm: Bảng từ vựng kèm phiên âm IPA trong vở ghi bài của học sinh.\n- Tổ chức thực hiện:\n  + B1 (Chuyển giao): GV bật audio, hướng dẫn HS quan sát tranh.\n  + B2 (Thực hiện): HS nghe, nhắc lại đồng thanh và theo cặp.\n  + B3 (Báo cáo): HS đọc to trước lớp, giải thích nghĩa.\n  + B4 (Đánh giá): GV chuẩn hóa phát âm và giải thích ngữ pháp.",
        practiceTime: "10 phút",
        practiceActivity:
          "Hoạt động 3: Thực hành / Luyện tập (Practice - 10 phút)\n- Mục tiêu: Vận dụng mẫu câu và từ vựng để hoàn thành bài tập SGK.\n- Nội dung: Làm bài tập 1, 2, 3 SGK trang 10 (Điền từ và chia động từ theo mẫu).\n- Sản phẩm: Đáp án chính xác được ghi vào vở bài tập.\n- Tổ chức thực hiện:\n  + B1: GV giao nhiệm vụ làm việc cá nhân 5 phút.\n  + B2: HS làm bài, đổi vở chấm chéo theo cặp.\n  + B3: 3 đại diện HS lên bảng viết câu trả lời.\n  + B4: GV nhận xét, phân tích lỗi sai và chấm điểm.",
        lowAppTime: "5 phút",
        lowApplicationActivity:
          "Hoạt động 4: Vận dụng thấp (Production / Low Application - 5 phút)\n- Mục tiêu: Áp dụng mẫu câu để phỏng vấn bạn cùng bàn về sở thích.\n- Nội dung: Thực hành hỏi đáp cặp đôi: 'What do you like doing in your free time? - I love...'.\n- Sản phẩm: Bảng thông tin khảo sát 2-3 bạn trong lớp.",
        highAppTime: "5 phút",
        highApplicationActivity:
          "Hoạt động 5: Vận dụng cao / Sáng tạo (High Application - 5 phút)\n- Mục tiêu: Thuyết trình ngắn hoặc viết đoạn văn 40-50 từ về lợi ích của một sở thích.\n- Nội dung: Thảo luận nhóm: 'Why gardening is good for mental health?'.\n- Sản phẩm: Áp phích nhỏ hoặc bài chia sẻ trước lớp.",
        consolidationTime: "3 phút",
        consolidationActivity:
          "Hoạt động 6: Củng cố (Consolidation - 3 phút)\n- Mục tiêu: Tổng kết toàn bộ từ vựng và cấu trúc ngữ pháp tiết học.\n- Nội dung: Trả lời 4 câu trắc nghiệm nhanh qua trò chơi tương tác Quizizz / Flashcards.\n- Sản phẩm: Bảng xếp hạng kết quả tổng kết của lớp.",
        homeworkTime: "2 phút",
        homeworkActivity:
          "Hoạt động 7: Hướng dẫn học ở nhà (BTVN - 2 phút)\n- Học thuộc lòng các từ vựng mới và mẫu câu chỉ sở thích.\n- Làm bài tập phần A (Phonetics) và B (Vocabulary) trong Sách bài tập.\n- Luyện phát âm qua loa âm thanh trên ứng dụng và chuẩn bị bài A Closer Look 1.",
        reflectionNotes:
          "Hoạt động 8: Rút kinh nghiệm sau tiết dạy\n- Phân bổ thời gian: Đảm bảo đúng thời lượng 45 phút.\n- Mức độ tiếp thu của học sinh: Đa số phát âm tốt âm đuôi /s/, /z/, một số em cần rèn thêm ngữ điệu tự nhiên.\n- Hướng điều chỉnh: Tăng cường hoạt động giao tiếp nhóm đôi trong các tiết sau.",
        projectActivity:
          "Hoạt động mở rộng: Project Work\n- Topic: 'Our Class Hobby Wall Poster'.\n- Product: A bilingual poster presenting favorite hobbies of group members.",
        teacherActivity:
          "1. Trình chiếu học liệu số, phát âm mẫu chuẩn quốc tế kèm phiên âm IPA.\n2. Tổ chức hoạt động nhóm tương tác, chỉnh sửa phát âm nhẹ nhàng.\n3. Đánh giá sự tiến bộ của từng nhóm học sinh theo định hướng phát triển năng lực.",
        studentActivity:
          "1. Lắng nghe, quan sát, tích cực phát biểu và ghi chép cẩn thận.\n2. Tương tác luyện nói cặp đôi/nhóm tự tin, sôi nổi.\n3. Tự đánh giá và hoàn thành nhiệm vụ được giao.",
        exercises:
          "Exercise 1, 2, 3 in SGK Global Success Page 10-11.\nExtra Worksheet: Complete 10 multiple choice questions on Present Simple and V-ing.",
        notes:
          "Nhắc nhở học sinh luyện phát âm qua loa phát âm âm thanh trên hệ thống trước buổi học tiếp theo.",
        enableBilingual: true,
        bilingualTitle: "Phân đoạn Song ngữ: Hobbies and Personal Growth",
        bilingualEnglish:
          "A: What do you like doing in your free time?\nB: I love reading books and playing badminton. It keeps me healthy and broadens my mind.",
        bilingualVietnamese:
          "A: Bạn thích làm gì vào thời gian rảnh rỗi?\nB: Mình rất thích đọc sách và chơi cầu lông. Nó giúp mình khỏe mạnh và mở rộng hiểu biết.",
        bilingualTermsRaw:
          "Leisure Activity | /ˈleʒər ækˈtɪvəti/ | Hoạt động giải trí\nBroaden mind | /ˈbrɔːdn maɪnd/ | Mở rộng trí tuệ\nPhysical health | /ˈfɪzɪkl helθ/ | Sức khỏe thể chất\nCommunity service | /kəˈmjuːnəti ˈsɜːrvɪs/ | Hoạt động tình nguyện phục vụ cộng đồng",
      };
    }

    // Default Vietnamese Subject (Toán, Ngữ văn, KHTN, Lịch sử - Địa lý, etc.)
    return {
      title: title || `Bài dạy: ${subject} - Kiến thức trọng tâm`,
      subject: subject || "Toán",
      className: className || "Lớp 7",
      curriculumPeriod: curriculumPeriod || "Tiết 1",
      schoolName: schoolName || "Trường THCS/THPT",
      teacherName: teacherName || "Giáo viên bộ môn",
      textbookSet: book,
      periodsCount: periodsCount || 1,
      digitalCompetencies:
        "[NLS1.1] Sử dụng thiết bị kỹ thuật số và phần mềm giảng dạy mô phỏng.\n[NLS2.3] Trích xuất và đánh giá nguồn tài liệu học liệu số chuẩn BGD.\n[NLS5.2] Vận dụng công cụ AI Miss Yến Còi kiểm tra đáp án và phân tích bài toán.",
      devicesAndSoftware:
        "Thiết bị: Máy tính giáo viên/học sinh, Máy chiếu Projector, Bảng tương tác Smartboard.\nPhần mềm: GeoGebra, Canva Education, PhET Simulations, Quizizz, AI Miss Yến Còi.",
      objectives:
        "1. Về Kiến thức: Học sinh nắm vững định nghĩa, tính chất và công thức trọng tâm theo SGK " +
        book +
        ".\n2. Về Kĩ năng: Giải thành thạo bài tập cơ bản và nâng cao, tư duy logic, làm việc nhóm.\n3. Về Thái độ: Trung thực, cẩn thận, chăm chỉ, có tinh thần trách nhiệm trong học tập.",
      objectivesKnowledge:
        "- Nắm vững lý thuyết trọng tâm, các khái niệm, định lý, công thức và quy tắc trong SGK " +
        book +
        ".\n- Hiểu rõ bản chất và vận dụng giải các dạng bài tập toán học/khoa học liên quan.",
      objectivesSkills:
        "- Rèn luyện kĩ năng tính toán, phân tích, tư duy logic và suy luận logic.\n- Phát triển năng lực giải quyết vấn đề thực tiễn, năng lực giao tiếp và hợp tác nhóm.",
      objectivesAttitude:
        "- Rèn luyện tính cẩn thận, trung thực, tỉ mỉ và kiên trì trong học tập.\n- Có hứng thú, say mê nghiên cứu khoa học và ứng dụng kiến thức vào đời sống.",
      teacherPrep:
        "Kế hoạch bài dạy (Giáo án CV 5512), Bài giảng điện tử trình chiếu PowerPoint/Canva, Phiếu học tập số 1, 2, Thiết bị máy chiếu, dụng cụ trực quan.",
      studentPrep:
        "Sách giáo khoa " +
        book +
        ", vở ghi bài, đồ dùng học tập (thước kẻ, bút màu, máy tính cầm tay), đọc trước nội dung bài học ở nhà.",
      keyKnowledge:
        "1. Khái niệm cốt lõi theo bài dạy SGK " +
        book +
        ": Định nghĩa, tính chất, quy tắc và biểu thức liên hệ.\n2. Phương pháp giải các dạng bài tập điển hình trong bài học.\n3. Mối liên hệ thực tiễn của bài học đối với đời sống.",
      warmupTime: "5 phút",
      warmupActivity:
        "Hoạt động 1: Mở đầu / Khởi động (Warm-up - 5 phút)\n- Mục tiêu: Kích thích sự tò mò, tạo tâm thế tích cực và kết nối vào bài học mới.\n- Nội dung: GV đưa ra câu hỏi / hình ảnh tình huống thực tiễn sinh động trên máy chiếu.\n- Sản phẩm: HS suy nghĩ, đưa ra các dự đoán và câu trả lời ban đầu.\n- Tổ chức thực hiện (B1-B4):\n  + B1 (Chuyển giao): GV nêu bài toán tình huống thực tế.\n  + B2 (Thực hiện): HS quan sát, trao đổi cặp đôi nhanh trong 2 phút.\n  + B3 (Báo cáo): 2 học sinh đại diện trình bày suy nghĩ.\n  + B4 (Kết luận): GV nhận xét, khơi gợi vấn đề và dẫn dắt vào bài học mới.",
      newLessonTime: "15 phút",
      newLessonActivity:
        "Hoạt động 2: Tìm hiểu vào bài / Hình thành kiến thức mới (Khám phá - 15 phút)\n- Mục tiêu: Học sinh phát hiện và chiếm lĩnh định nghĩa, quy tắc và công thức trọng tâm SGK " +
        book +
        ".\n- Nội dung: Đọc mục Khám phá 1, 2 trong SGK, thảo luận nhóm và hoàn thành phiếu học tập số 1.\n- Sản phẩm: Khái niệm được phát biểu chính xác, công thức và ví dụ mẫu được trình bày rõ ràng.\n- Tổ chức thực hiện:\n  + B1 (Chuyển giao): GV chia lớp thành 4 nhóm, phát phiếu học tập.\n  + B2 (Thực hiện): Các nhóm trao đổi, làm việc với SGK và phần mềm mô phỏng.\n  + B3 (Báo cáo): Đại diện Nhóm 1 và Nhóm 3 lên bảng trình bày kết quả.\n  + B4 (Kết luận): GV chuẩn hóa kiến thức, ghi bảng nội dung trọng tâm.",
      practiceTime: "10 phút",
      practiceActivity:
        "Hoạt động 3: Thực hành / Luyện tập (10 phút)\n- Mục tiêu: Củng cố và khắc sâu kiến thức vừa tiếp thu qua việc giải bài tập SGK " +
        book +
        ".\n- Nội dung: Học sinh giải bài Luyện tập 1, Luyện tập 2 trong SGK.\n- Sản phẩm: Bài giải chi tiết, chính xác trên tập vở và bảng lớp.\n- Tổ chức thực hiện:\n  + B1: GV yêu cầu HS làm bài cá nhân trong 5 phút.\n  + B2: HS làm bài, đổi vở kiểm tra kết quả chéo.\n  + B3: 2 HS lên bảng trình bày lời giải.\n  + B4: GV nhận xét, chuẩn hóa phương pháp giải và cho điểm khích lệ.",
      lowAppTime: "5 phút",
      lowApplicationActivity:
        "Hoạt động 4: Vận dụng thấp (5 phút)\n- Mục tiêu: Vận dụng trực tiếp quy tắc vừa học để giải quyết bài toán thực tế đơn giản.\n- Nội dung: Bài toán tính toán liên quan đến đời sống gia đình/trường học.\n- Sản phẩm: Đáp án đúng và lập luận chặt chẽ trong vở ghi.",
      highAppTime: "5 phút",
      highApplicationActivity:
        "Hoạt động 5: Vận dụng cao / Sáng tạo (5 phút)\n- Mục tiêu: Phát triển tư duy phản biện, liên hệ liên môn và sáng tạo.\n- Nội dung: Bài toán mở rộng đòi hỏi kết hợp nhiều bước suy luận hoặc mô phỏng trên Canva.\n- Sản phẩm: Sơ đồ tư duy hoặc giải pháp giải toán sáng tạo của nhóm.",
      consolidationTime: "3 phút",
      consolidationActivity:
        "Hoạt động 6: Củng cố (3 phút)\n- Mục tiêu: Khái quát hóa và hệ thống lại toàn bộ sơ đồ bài học.\n- Nội dung: Trả lời 4 câu hỏi trắc nghiệm nhanh trên ứng dụng.\n- Sản phẩm: Học sinh nắm chắc sơ đồ kiến thức cốt lõi.",
      homeworkTime: "2 phút",
      homeworkActivity:
        "Hoạt động 7: Hướng dẫn học ở nhà (BTVN - 2 phút)\n- Học thuộc các định nghĩa, quy tắc và công thức đã học.\n- Hoàn thành các bài tập còn lại trong SGK và Sách bài tập.\n- Chuẩn bị trước bài học tiếp theo theo phân phối chương trình.",
      reflectionNotes:
        "Hoạt động 8: Rút kinh nghiệm sau tiết dạy\n- Tiến trình: Tiết dạy diễn ra đúng kế hoạch, đảm bảo đủ 45 phút.\n- Học sinh: Tích cực tương tác nhóm, phần lớn nắm vững kiến thức trọng tâm.\n- Rút kinh nghiệm: Cần dành thêm 1-2 phút hỗ trợ các học sinh còn lúng túng trong phần Luyện tập.",
      projectActivity:
        "Hoạt động mở rộng: Dự án STEM / Project\n- Chủ đề: 'Ứng dụng kiến thức bài học vào thiết kế mô hình thực tế'.\n- Sản phẩm: Báo cáo sản phẩm nhóm sau 1 tuần.",
      teacherActivity:
        "1. Chuyển giao nhiệm vụ học tập rõ ràng, khoa học qua bảng tương tác và phiếu học tập.\n2. Quan sát, hướng dẫn, hỗ trợ kịp thời các nhóm học sinh còn khó khăn.\n3. Đánh giá, chuẩn hóa kiến thức theo đúng định hướng Công văn 5512.",
      studentActivity:
        "1. Chủ động tiếp nhận nhiệm vụ, tích cực hợp tác thảo luận nhóm.\n2. Trình bày sản phẩm học tập tự tin, mạch lạc trước tập thể lớp.\n3. Lắng nghe, nhận xét và tự đánh giá kết quả học tập.",
      exercises:
        "1. Toàn bộ bài tập SGK " +
        book +
        " theo nội dung bài dạy.\n2. Phiếu bài tập phân hóa 3 cấp độ: Nhận biết - Thông hiểu - Vận dụng.",
      notes:
        "Nhắc nhở học sinh chuẩn bị đầy đủ dụng cụ học tập và làm bài tập về nhà đầy đủ.",
      enableBilingual: true,
      bilingualTitle: "Phân đoạn Song ngữ Tiếng Anh (Bilingual Segment)",
      bilingualEnglish:
        "Key concepts of this lesson are integrated with standard English academic vocabulary to help students access international education standards.",
      bilingualVietnamese:
        "Nội dung trọng tâm bài học được tích hợp từ vựng học thuật Tiếng Anh chuẩn mực giúp học sinh tiếp cận tiêu chuẩn giáo dục quốc tế.",
      bilingualTermsRaw:
        "Core Concept | /kɔːr ˈkɑːnsept/ | Khái niệm cốt lõi\nApplication | /ˌæplɪˈkeɪʃn/ | Sự vận dụng thực tế\nTheorem | /ˈθɪərəm/ | Định lý\nFormula | /ˈfɔːrmjələ/ | Công thức",
    };
  }

  // API Route for downloading Single Standalone HTML bundle
  app.get("/api/download-single-html", (req, res) => {
    const singleHtmlPath = path.join(process.cwd(), "dist", "index.html");
    const fallbackPath = path.join(process.cwd(), "public", "index-single.html");
    const rootIndexPath = path.join(process.cwd(), "index.html");

    let fileToServe: string | null = null;
    if (fs.existsSync(singleHtmlPath)) {
      fileToServe = singleHtmlPath;
    } else if (fs.existsSync(fallbackPath)) {
      fileToServe = fallbackPath;
    } else if (fs.existsSync(rootIndexPath)) {
      fileToServe = rootIndexPath;
    }

    if (fileToServe) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="AI_Education_Platform_Full_SingleFile.html"');
      res.sendFile(fileToServe);
    } else {
      res.status(404).json({ error: "Tệp HTML đơn chưa được đóng gói. Vui lòng thử lại sau giây lát." });
    }
  });

  // API Route for downloading project ZIP source code
  app.get("/api/download-source", (req, res) => {
    const zipPath = path.join(process.cwd(), "public", "anh-sao-khue-source-code.zip");
    if (fs.existsSync(zipPath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="anh-sao-khue-source-code.zip"');
      res.sendFile(zipPath);
    } else {
      res.status(404).json({ error: "Tệp mã nguồn ZIP chưa được tạo." });
    }
  });

  // API Route for downloading Master Prompt Word document (.doc)
  app.get("/api/download-prompt", (req, res) => {
    const docPath = path.join(process.cwd(), "public", "Prompt_He_Thong_Anh_Sao_Khue.doc");
    if (fs.existsSync(docPath)) {
      res.setHeader("Content-Type", "application/msword");
      res.setHeader("Content-Disposition", 'attachment; filename="Prompt_He_Thong_Anh_Sao_Khue.doc"');
      res.sendFile(docPath);
    } else {
      res.status(404).json({ error: "Tệp Prompt Word (.doc) chưa được tạo." });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", botName: "Miss Yến còi" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Education Platform server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
