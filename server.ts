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
      const { title, subject, gradeLevel, textbookSet, periodsCount } = req.body;

      if (!title || !subject) {
        return res.status(400).json({ error: "Title and subject are required." });
      }

      const promptText = `Bạn là một Chuyên gia Giáo dục & Sư phạm bậc cao tại Việt Nam. Hãy soạn một KẾ HOẠCH BÀI DẠY (GIÁO ÁN) CHUẨN CÔNG VĂN 5512 BỘ GD&ĐT Việt Nam cho bài học sau:
- Tên bài học / Tiết dạy: "${title}"
- Môn học: "${subject}"
- Khối lớp: "${gradeLevel || "THCS - Khối 7"}"
- Bộ sách giáo khoa: "${textbookSet || "Kết nối tri thức với cuộc sống"}"
- Số tiết: ${periodsCount || 1}

YÊU CẦU NGHIÊM NGẶT VỀ NỘI DUNG:
1. Bám sát CHÍNH XÁC nội dung Bài học và Khái niệm trong Sách Giáo Khoa (SGK ${textbookSet || "Kết nối tri thức với cuộc sống"}). Không dùng các cụm từ chung chung sơ sài, phải ghi rõ nội dung lý thuyết, công thức, từ vựng, bài tập SGK thật cụ thể, phong phú và sâu sắc.
2. Cấu trúc chuẩn Công văn 5512 với ĐẦY ĐỦ các mục và 8 HOẠT ĐỘNG DẠY HỌC:
   - I. Mục tiêu bài học (1. Kiến thức SGK chi tiết, 2. Năng lực chung & Năng lực đặc thù môn học, 3. Phẩm chất học sinh).
   - II. Khung Năng lực số (NLS) mã hóa như [NLS1.1], [NLS2.3], [NLS5.2] & Thiết bị dạy học, Phần mềm sử dụng.
   - III. Tiến trình dạy học bao gồm đủ 8 Hoạt động:
     + Hoạt động 1: Mở đầu / Khởi động (Mục tiêu, Nội dung, Sản phẩm, Tổ chức B1-B2-B3-B4).
     + Hoạt động 2: Hình thành kiến thức mới / Khám phá SGK (Mục tiêu, Nội dung, Sản phẩm, B1-B2-B3-B4).
     + Hoạt động 3: Luyện tập (Giải bài tập SGK cụ thể).
     + Hoạt động 4: Vận dụng thấp.
     + Hoạt động 5: Vận dụng cao / Deep Learning / Sáng tạo.
     + Hoạt động 6: Củng cố kiến thức.
     + Hoạt động 7: Hướng dẫn học ở nhà.
     + Hoạt động 8: Dự án STEM / Project.
   - Tách biệt rõ "Hoạt động của Giáo viên" và "Hoạt động của Học sinh".
   - Phân đoạn giảng dạy Song ngữ Tiếng Anh (English Content, Dịch tiếng Việt, Từ vựng chuyên ngành kèm phiên âm IPA).

HÃY TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON (KHÔNG BỌC TRONG MARKDOWN CODE BLOCK TRỪ KHI BẮT BUỘC) VỚI CÁC TRƯỜNG CHÍNH XÁC SAU:
{
  "title": "string",
  "subject": "string",
  "gradeLevel": "string",
  "textbookSet": "string",
  "periodsCount": number,
  "digitalCompetencies": "string",
  "devicesAndSoftware": "string",
  "objectives": "string",
  "keyKnowledge": "string",
  "warmupActivity": "string",
  "newLessonActivity": "string",
  "practiceActivity": "string",
  "lowApplicationActivity": "string",
  "highApplicationActivity": "string",
  "consolidationActivity": "string",
  "homeworkActivity": "string",
  "projectActivity": "string",
  "teacherActivity": "string",
  "studentActivity": "string",
  "exercises": "string",
  "notes": "string",
  "enableBilingual": boolean,
  "bilingualTitle": "string",
  "bilingualEnglish": "string",
  "bilingualVietnamese": "string",
  "bilingualTermsRaw": "string"
}`;

      if (ai) {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
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
        planData: generateFallbackLessonPlan(title, subject, gradeLevel, textbookSet, periodsCount),
      });
    } catch (error: any) {
      console.error("Error in generate-lesson-plan API:", error);
      return res.status(500).json({
        error: "Không thể sinh giáo án tự động. Đã sử dụng bộ mẫu bài giảng chuẩn.",
        planData: generateFallbackLessonPlan(
          req.body.title || "Bài dạy chuẩn",
          req.body.subject || "Toán",
          req.body.gradeLevel,
          req.body.textbookSet,
          req.body.periodsCount
        ),
      });
    }
  });

  // Helper function for rich offline fallback lesson plan generation
  function generateFallbackLessonPlan(
    title: string,
    subject: string,
    gradeLevel?: string,
    textbookSet?: string,
    periodsCount?: number
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
        gradeLevel: gradeLevel || "THCS - Khối 7",
        textbookSet: "Tiếng Anh Global Success",
        periodsCount: periodsCount || 1,
        digitalCompetencies:
          "[NLS1.1] Vận dụng từ điển số Cambridge/Oxford và công cụ phát âm AI chuẩn.\n[NLS2.3] Khai thác kho học liệu âm thanh MP3 và bài tập tương tác số.\n[NLS5.2] Luyện hội thoại phản xạ trực tiếp với AI Miss Yến Còi.",
        devicesAndSoftware:
          "Thiết bị: Máy tính GV, Bảng tương tác Smartboard, Loa Bluetooth, Micro thu âm AI.\nPhần mềm: Quizizz, Canva Presentation, Cambridge Dictionary, Miss Yến Còi AI App.",
        objectives:
          "- About Knowledge: Master 8-12 core vocabulary items regarding hobbies, free time activities and community work. Understand grammar patterns (Present Simple for likes/dislikes, verbs of liking + V-ing).\n- About Skills: Develop 4 language skills (Listening, Speaking, Reading, Writing) with accurate IPA pronunciation /s/ and /z/.\n- About Qualities: Encourage positive lifestyle choices, active collaboration and communication in English.",
        keyKnowledge:
          "1. Vocabulary: donate, volunteer, community service, hobby, leisure activity, science fiction,crafts, gardening.\n2. Grammar: Verbs of liking (like, love, enjoy, hate) + V-ing / to-V.\n3. Pronunciation: Phonics sounds /s/ and /z/ in plural nouns and verbs ending.",
        warmupActivity:
          "Hoạt động 1: Warm-up (5 mins)\n- Objective: Activate prior knowledge and warm up class atmosphere.\n- Content: Play 'Guess the Hobby' game. Teacher displays action cards on Smartboard.\n- Product: Students correctly identify at least 5 hobbies in English.\n- Execution (B1-B4): B1 Teacher presents game rules; B2 Students work in 2 teams; B3 Representatives answer; B4 Teacher praises and leads into Unit lesson.",
        newLessonActivity:
          "Hoạt động 2: Presentation & Discovery (15 mins)\n- Objective: Introduce new vocabulary and grammar structure according to SGK Global Success.\n- Content: Read Getting Started section, listen to dialogue between Ann and Minh, repeat key terms.\n- Product: Students write vocabulary with IPA in notebooks and complete activity 2 in SGK.\n- Execution: B1 Teacher plays audio MP3 and highlights vocabulary; B2 Students listen and repeat chorally; B3 Pair reading; B4 Teacher checks pronunciation.",
        practiceActivity:
          "Hoạt động 3: Controlled Practice (10 mins)\n- Objective: Practice verb forms (enjoy/like + V-ing) through SGK exercises.\n- Content: Complete sentences 1-5 in SGK page 10. Pair work speaking drill.\n- Product: Correctly completed sentences and oral practice recording on Miss Yến Còi app.",
        lowApplicationActivity:
          "Hoạt động 4: Production / Low Application (5 mins)\n- Objective: Apply sentence patterns to survey classmates about hobbies.\n- Content: Interview 3 classmates using 'What do you enjoy doing in your free time?'.\n- Product: Completed survey table in student notebook.",
        highApplicationActivity:
          "Hoạt động 5: High Application & Deep Learning (5 mins)\n- Objective: Discuss and write a 60-word passage about benefits of a specific hobby.\n- Content: Group discussion on 'Why gardening is good for mental health'.\n- Product: Group paragraph displayed on Canva or poster.",
        consolidationActivity:
          "Hoạt động 6: Consolidation (3 mins)\n- Objective: Summarize key vocabulary and grammar rules.\n- Content: 5-question Quizizz game.\n- Product: Instant class leaderboards.",
        homeworkActivity:
          "Hoạt động 7: Homework Guidance (2 mins)\n- Learn vocabulary and grammar by heart.\n- Record a 1-minute audio passage on Miss Yến Còi AI app.\n- Prepare for Closer Look 1.",
        projectActivity:
          "Hoạt động 8: Project Work\n- Topic: 'Our Class Hobby Wall Poster'.\n- Product: A bilingual poster presenting favorite hobbies of group members.",
        teacherActivity:
          "1. Present target vocabulary with IPA pronunciation and native audio samples.\n2. Facilitate pair work and group discussions, correcting pronunciation errors gently.\n3. Conclude lesson and summarize core learning points.",
        studentActivity:
          "1. Listen attentively, take notes, and repeat vocabulary with standard stress.\n2. Work actively in pairs/groups to complete tasks and present findings.\n3. Complete self-evaluation on learning app.",
        exercises:
          "Exercise 1, 2, 3 in SGK Global Success Page 10-11.\nExtra Worksheet: Complete 10 multiple choice questions on Present Simple and V-ing.",
        notes:
          "Remind students to practice phonics /s/ and /z/ using the audio practice player on the app before next class.",
        enableBilingual: true,
        bilingualTitle: "Bilingual Segment: Hobbies and Personal Growth",
        bilingualEnglish:
          "A: What do you like doing in your free time?\nB: I love reading books and playing badminton. It keeps me healthy and broadens my mind.",
        bilingualVietnamese:
          "A: Bạn thích làm gì vào thời gian rảnh rỗi?\nB: Mình rất thích đọc sách và chơi cầu lông. Nó giúp mình khỏe mạnh và mở rộng hiểu biết.",
        bilingualTermsRaw:
          "Leisure Activity | /ˈleʒər ækˈtɪvəti/ | Hoạt động giải trí\nBroaden mind | /ˈbrɔːdn maɪnd/ | Mở rộng trí tuệ\nPhysical health | /ˈfɪzɪkl helθ/ | Sức khỏe thể chất",
      };
    }

    // Default Vietnamese Subject (Toán, Ngữ văn, KHTN, Lịch sử - Địa lý, etc.)
    return {
      title: title || `Bài dạy: ${subject} - Kiến thức trọng tâm`,
      subject: subject || "Toán",
      gradeLevel: gradeLevel || "THCS - Khối 7",
      textbookSet: book,
      periodsCount: periodsCount || 1,
      digitalCompetencies:
        "[NLS1.1] Sử dụng thiết bị kỹ thuật số và phần mềm giảng dạy mô phỏng.\n[NLS2.3] Trích xuất và đánh giá nguồn tài liệu học liệu số chuẩn BGD.\n[NLS5.2] Vận dụng công cụ AI Miss Yến Còi kiểm tra đáp án và phân tích bài toán.",
      devicesAndSoftware:
        "Thiết bị: Máy tính giáo viên/học sinh, Máy chiếu Projector, Bảng tương tác Smartboard.\nPhần mềm: GeoGebra, Canva Education, PhET Simulations, Quizizz, AI Miss Yến Còi.",
      objectives:
        "- Về kiến thức: Học sinh nắm vững lý thuyết trọng tâm, các khái niệm, định lý và quy tắc trong SGK " +
        book +
        ". Biểu diễn và giải thành thạo bài tập cơ bản và nâng cao.\n- Về kỹ năng: Phát triển năng lực tư duy logic, phân tích tổng hợp, năng lực giải quyết vấn đề thực tiễn và hợp tác nhóm.\n- Về phẩm chất: Rèn luyện tính trung thực, cẩn thận, ý thức trách nhiệm và tinh thần chủ động sáng tạo.",
      keyKnowledge:
        "1. Khái niệm cốt lõi theo bài dạy SGK " +
        book +
        ": Định nghĩa, tính chất, quy tắc và biểu thức liên hệ.\n2. Phương pháp giải các dạng bài tập điển hình trong bài học.\n3. Mối liên hệ thực tiễn của bài học đối với đời sống.",
      warmupActivity:
        "Hoạt động 1: Mở đầu / Khởi động (5 phút)\n- Mục tiêu: Kích thích sự tò mò, kết nối kiến thức thực tế bài học.\n- Nội dung: GV đưa ra tình huống thực tiễn sinh động qua Slide trình chiếu Smartboard.\n- Sản phẩm: HS phát biểu ý kiến ban đầu và nêu vướng mắc cần giải quyết.\n- Tổ chức thực hiện (B1-B4):\n  + B1 (Chuyển giao): GV giao câu hỏi tình huống trên màn hình.\n  + B2 (Thực hiện): HS thảo luận cặp đôi trong 2 phút.\n  + B3 (Báo cáo): 2 đại diện HS trình bày câu trả lời.\n  + B4 (Kết luận): GV nhận xét và dẫn dắt vào bài học mới.",
      newLessonActivity:
        "Hoạt động 2: Hình thành kiến thức mới / Khám phá SGK (15 phút)\n- Mục tiêu: Học sinh tự khám phá lý thuyết và quy tắc trọng tâm SGK " +
        book +
        ".\n- Nội dung: Đọc nội dung khám phá 1, 2 trong SGK, làm việc với phần mềm mô phỏng.\n- Sản phẩm: Định nghĩa chuẩn mực, công thức đóng khung và tính chất bài học.\n- Tổ chức thực hiện:\n  + B1: GV chia lớp thành 4 nhóm, phát phiếu học tập số 1.\n  + B2: Các nhóm nghiên cứu SGK, thao tác trên phần mềm trực quan.\n  + B3: Đại diện Nhóm 1 & Nhóm 3 lên bảng trình bày kết quả thảo luận.\n  + B4: GV chuẩn hóa kiến thức, ghi bảng và chốt khái niệm.",
      practiceActivity:
        "Hoạt động 3: Luyện tập (10 phút)\n- Mục tiêu: Củng cố kiến thức vừa học qua bài tập SGK " +
        book +
        ".\n- Nội dung: Giải các bài tập Luyện tập 1, Luyện tập 2 trong SGK.\n- Sản phẩm: Lời giải chi tiết trên tập vở và bảng lớp.\n- Tổ chức thực hiện: HS làm việc cá nhân 5 phút, 2 HS lên bảng sửa bài. GV cùng cả lớp nhận xét, đánh giá điểm số.",
      lowApplicationActivity:
        "Hoạt động 4: Vận dụng thấp (5 phút)\n- Mục tiêu: Vận dụng quy tắc bài học để giải bài toán thực tế đơn giản.\n- Nội dung: Bài toán tính toán trong đời sống gắn với gia đình/trường học.\n- Sản phẩm: Đáp số đúng và quy trình giải hợp lý.",
      highApplicationActivity:
        "Hoạt động 5: Vận dụng cao / Deep Learning (5 phút)\n- Mục tiêu: Phát triển năng lực sáng tạo và tư duy phản biện.\n- Nội dung: Bài toán tích hợp liên môn và mô hình hóa dữ liệu trên ứng dụng Canva.\n- Sản phẩm: Báo cáo Infographic hoặc sơ đồ tư duy nhóm.",
      consolidationActivity:
        "Hoạt động 6: Củng cố (3 phút)\n- Mục tiêu: Khái quát hóa toàn bộ sơ đồ bài học.\n- Nội dung: Trả lời 4 câu hỏi trắc nghiệm củng cố trên ứng dụng.\n- Sản phẩm: Kết quả đánh giá trắc nghiệm.",
      homeworkActivity:
        "Hoạt động 7: Hướng dẫn về nhà (2 phút)\n- Học thuộc định nghĩa và công thức trọng tâm.\n- Hoàn thành bài tập còn lại trong SGK và SBT.\n- Đọc trước bài tiếp theo trong kế hoạch giảng dạy.",
      projectActivity:
        "Hoạt động 8: Dự án Project / STEM\n- Chủ đề: 'Ứng dụng kiến thức bài học vào mô hình thực tế'.\n- Sản phẩm: Báo cáo sản phẩm nhóm sau 1 tuần.",
      teacherActivity:
        "1. Chuyển giao nhiệm vụ học tập rõ ràng, khoa học qua bảng tương tác.\n2. Quan sát, động viên và trợ giúp các nhóm gặp vướng mắc.\n3. Đánh giá, nhận xét, chuẩn hóa kiến thức theo đúng Công văn 5512.",
      studentActivity:
        "1. Chủ động nhận nhiệm vụ, thảo luận nhóm nghiêm túc và hiệu quả.\n2. Trình bày sản phẩm học tập trước lớp tự tin, rõ ràng.\n3. Tự đánh giá và đánh giá chéo kết quả học tập của bạn.",
      exercises:
        "1. Toàn bộ bài tập SGK " +
        book +
        " theo nội dung bài dạy.\n2. Phiếu bài tập phân hóa 3 cấp độ: Nhận biết - Thông hiểu - Vận dụng.",
      notes:
        "Nhắc nhở học sinh chuẩn bị đầy đủ đồ dùng học tập và ôn lại công thức cũ trước giờ học sau.",
      enableBilingual: true,
      bilingualTitle: "Phân đoạn Song ngữ Tiếng Anh (Bilingual Segment)",
      bilingualEnglish:
        "Key concepts of this lesson are integrated with standard English academic vocabulary to help students access international education standards.",
      bilingualVietnamese:
        "Nội dung trọng tâm bài học được tích hợp từ vựng học thuật Tiếng Anh chuẩn mực giúp học sinh tiếp cận tiêu chuẩn giáo dục quốc tế.",
      bilingualTermsRaw:
        "Core Concept | /kɔːr ˈkɑːnsept/ | Khái niệm cốt lõi\nApplication | /ˌæplɪˈkeɪʃn/ | Sự vận dụng thực tế\nTheorem | /ˈθɪərəm/ | Định lý",
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
