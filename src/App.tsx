import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  ChevronDown,
  Factory,
  FileText,
  Globe2,
  HeartPulse,
  Home,
  Languages,
  LineChart,
  LockKeyhole,
  LogOut,
  MapPinned,
  PieChart,
  Search,
  Stethoscope,
  TrendingUp,
  Volume2,
  WalletCards,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

declare global {
  interface Window {
    linkupTranslateToKorean?: (text: string, sourceLanguage?: LanguageCode) => Promise<string> | string;
  }
}

type AppProps = {
  useConvex?: boolean;
};

type LanguageCode = "en" | "ko" | "vi" | "th";

type Situation = {
  id: string;
  tone: string;
  icon: typeof WalletCards;
  label: Record<LanguageCode, string>;
  detail: Record<LanguageCode, string>;
};

type CompletedIntake = {
  answers: string[];
  attachments: Record<number, UploadedFile[]>;
  issueId: string;
  language: LanguageCode;
  region: string;
  selectedOptions: Record<number, string[]>;
};

type UploadedFile = {
  dataUrl?: string;
  name: string;
  type: string;
};

type QuestionMeta = {
  allowUpload?: boolean;
  helpKo?: string;
  optionsKo?: string[];
  textKo?: string;
};

type LocalizedOptions = Partial<Record<LanguageCode, string[]>>;

type CountItem = {
  count: number;
  label: string;
};

type TrendSeries = {
  label: string;
  points: number[];
};

type AdminStats = {
  categoryCounts: CountItem[];
  languageCounts: CountItem[];
  regionCounts: CountItem[];
  trendSeries: TrendSeries[];
  total: number;
};

type Route = "admin" | "home" | "how-it-works";

const ADMIN_CODE = "LINKUP-NGO-2026";
const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL as string | undefined;
const emptyAdminStats: AdminStats = {
  categoryCounts: [],
  languageCounts: [],
  regionCounts: [],
  trendSeries: [],
  total: 0,
};
const regionGroups = [
  {
    cities: ["화성시", "안산시", "평택시", "시흥시", "수원시", "용인시", "김포시", "파주시", "광주시", "안성시"],
    citiesEn: [
      "Hwaseong-si",
      "Ansan-si",
      "Pyeongtaek-si",
      "Siheung-si",
      "Suwon-si",
      "Yongin-si",
      "Gimpo-si",
      "Paju-si",
      "Gwangju-si",
      "Anseong-si",
    ],
    labelEn: "Gyeonggi-do",
    label: "경기도",
  },
  {
    cities: ["구로구", "영등포구", "금천구", "강서구", "중구", "종로구", "용산구"],
    citiesEn: ["Guro-gu", "Yeongdeungpo-gu", "Geumcheon-gu", "Gangseo-gu", "Jung-gu", "Jongno-gu", "Yongsan-gu"],
    labelEn: "Seoul",
    label: "서울특별시",
  },
  {
    cities: ["남동구", "부평구", "서구", "미추홀구", "연수구", "중구"],
    citiesEn: ["Namdong-gu", "Bupyeong-gu", "Seo-gu", "Michuhol-gu", "Yeonsu-gu", "Jung-gu"],
    labelEn: "Incheon",
    label: "인천광역시",
  },
  {
    cities: ["천안시", "아산시", "청주시", "충주시", "음성군", "진천군", "당진시"],
    citiesEn: ["Cheonan-si", "Asan-si", "Cheongju-si", "Chungju-si", "Eumseong-gun", "Jincheon-gun", "Dangjin-si"],
    labelEn: "Chungcheong Region",
    label: "충청권",
  },
  {
    cities: ["김해시", "창원시", "양산시", "구미시", "경주시", "포항시", "대구 달서구"],
    citiesEn: ["Gimhae-si", "Changwon-si", "Yangsan-si", "Gumi-si", "Gyeongju-si", "Pohang-si", "Daegu Dalseo-gu"],
    labelEn: "Gyeongsang Region",
    label: "경상권",
  },
  {
    cities: ["광주 광산구", "익산시", "군산시", "전주시", "여수시", "목포시"],
    citiesEn: ["Gwangju Gwangsan-gu", "Iksan-si", "Gunsan-si", "Jeonju-si", "Yeosu-si", "Mokpo-si"],
    labelEn: "Jeolla Region",
    label: "전라권",
  },
  {
    cities: ["제주시", "서귀포시"],
    citiesEn: ["Jeju-si", "Seogwipo-si"],
    labelEn: "Jeju",
    label: "제주특별자치도",
  },
  {
    cities: ["세부 지역 모름"],
    citiesEn: ["Detailed region unknown"],
    labelEn: "Not sure",
    label: "잘 모르겠어요",
  },
];
const languageNames: Record<string, string> = {
  en: "English",
  ko: "Korean",
  th: "Thai",
  vi: "Vietnamese",
};
const chartColors = ["#1e3a8a", "#10b981", "#38bdf8", "#f59e0b", "#8b5cf6", "#ef4444"];
let activeTtsAudio: HTMLAudioElement | null = null;

const languages: Array<{ code: LanguageCode; flagSrc: string; label: string; shortLabel: string }> = [
  { code: "en", flagSrc: "/flags/us.svg", label: "English", shortLabel: "EN" },
  { code: "ko", flagSrc: "/flags/kr.svg", label: "한국어", shortLabel: "KR" },
  { code: "vi", flagSrc: "/flags/vn.svg", label: "Tiếng Việt", shortLabel: "VI" },
  { code: "th", flagSrc: "/flags/th.svg", label: "ไทย", shortLabel: "TH" },
];

const copy = {
  en: {
    hero: "What problem are you facing right now?",
    heroTitle: "Prepare your situation for support in Korean.",
    support: "Answer a few clear questions. Your private details stay on this device, and the final PDF is prepared in Korean.",
    emergency: "Immediate danger? Call 112 or ask a counselor now.",
    step: "Step 2 of 4",
    stepTitle: "Payday details",
    question: "When was your last payday?",
    help: "It is okay if you are not exact. Choose the closest answer.",
    continue: "Continue safely",
    intakeEyebrow: "Tailored intake",
    intakeHeading: "Simple questions, counselor-ready answers",
    stepOf: (step: number, total: number) => `Step ${step} of ${total}`,
    answerHelp: "Answer in any language. Short, approximate answers are okay.",
    regionLabel: "Workplace region",
    regionHelp: "This helps route your case to the right regional office or counselor.",
    regionParentPlaceholder: "Select province or region",
    subregionLabel: "Select detailed region (city/district)",
    subregionPlaceholder: "Select detailed region (city/district)",
    answerLabel: "Your answer",
    answerPlaceholder: "Type your answer here",
    answerSaved: "Answer saved for this question.",
    answerPending: "You can continue and update this later.",
    back: "Back to previous question",
    finish: "Finish and create PDF",
    reviewTitle: "Review your answers before creating the PDF",
    reviewButton: "Review answers",
    reviewHelp: "Check each answer. You can edit anything before making the counselor PDF.",
    editAnswer: "Edit",
    createPdf: "Create counselor PDF",
    notAnswered: "Not answered yet",
    readQuestion: "Read question aloud",
    ttsMissing: "This browser does not have a voice for this language. Try Chrome or Edge with language voices installed.",
    ttsPlaying: "Reading the question aloud.",
    legalNotice:
      "Privacy and legal notice: LinkUP does not collect or store your private details. This tool helps prepare information for a counselor and is not a law firm, lawyer, or substitute for legal advice.",
    pathwayTitle: "From first concern to counselor-ready support",
    pathwaySteps: ["Choose issue", "Answer safely", "Download PDF", "Share with counselor"],
    triagePanelTitle: "What problem are you facing right now?",
    searchPlaceholder: "Search by issue, keyword, or symptom",
    howThisWorks: "How this works",
    localOnlyLabel: "Saved locally",
    pdfOutputLabel: "PDF in Korean",
    selectedLabel: "Selected issue",
  },
  ko: {
    hero: "지금 어떤 문제가 있나요?",
    heroTitle: "도움이 필요한 문제를 한국어 상담 자료로 준비하세요.",
    support: "간단한 질문에 답하면 개인정보는 이 기기에만 머물고, 최종 PDF는 한국어로 준비됩니다.",
    emergency: "즉시 위험한가요? 112에 전화하거나 상담사에게 요청하세요.",
    step: "4단계 중 2단계",
    stepTitle: "급여일 정보",
    question: "마지막 급여일은 언제였나요?",
    help: "정확하지 않아도 괜찮습니다. 가장 가까운 답을 선택하세요.",
    continue: "안전하게 계속하기",
    intakeEyebrow: "맞춤형 접수",
    intakeHeading: "간단한 질문, 상담사가 바로 확인할 수 있는 답변",
    stepOf: (step: number, total: number) => `${total}단계 중 ${step}단계`,
    answerHelp: "어떤 언어로 답해도 괜찮습니다. 짧고 대략적인 답변도 괜찮습니다.",
    regionLabel: "근무 지역",
    regionHelp: "지역을 선택하면 사건을 담당할 수 있는 관할 기관이나 상담사를 찾는 데 도움이 됩니다.",
    regionParentPlaceholder: "상위 지역 선택",
    subregionLabel: "세부 지역 선택 (시/군/구)",
    subregionPlaceholder: "세부 지역 선택 (시/군/구)",
    answerLabel: "답변",
    answerPlaceholder: "여기에 답변을 입력하세요",
    answerSaved: "이 질문의 답변이 저장되었습니다.",
    answerPending: "계속 진행한 뒤 나중에 수정할 수 있습니다.",
    back: "이전 질문으로 돌아가기",
    finish: "완료하고 PDF 만들기",
    reviewTitle: "PDF를 만들기 전에 답변을 확인하세요",
    reviewButton: "답변 확인하기",
    reviewHelp: "각 답변을 확인하세요. 상담사용 PDF를 만들기 전에 언제든 수정할 수 있습니다.",
    editAnswer: "수정",
    createPdf: "상담사용 PDF 만들기",
    notAnswered: "아직 답변하지 않음",
    readQuestion: "질문 읽어주기",
    ttsMissing: "이 브라우저에 해당 언어 음성이 없습니다. Chrome 또는 Edge에서 언어 음성을 설치해 주세요.",
    ttsPlaying: "질문을 음성으로 읽고 있습니다.",
    legalNotice:
      "개인정보 및 법률 안내: LinkUP은 개인적인 세부 정보를 수집하거나 저장하지 않습니다. 이 도구는 상담사가 확인할 자료를 준비하도록 돕는 서비스이며, 변호사 또는 법률 자문을 대체하지 않습니다.",
    pathwayTitle: "처음 걱정부터 상담 준비까지",
    pathwaySteps: ["문제 선택", "안전하게 답변", "PDF 다운로드", "상담사와 공유"],
    triagePanelTitle: "지금 어떤 문제가 있나요?",
    searchPlaceholder: "문제, 키워드, 증상으로 검색",
    howThisWorks: "이용 방법",
    localOnlyLabel: "기기 안에만 임시 저장",
    pdfOutputLabel: "한국어 PDF 생성",
    selectedLabel: "선택한 문제",
  },
  vi: {
    hero: "Bạn đang gặp vấn đề gì ngay bây giờ?",
    heroTitle: "Chuẩn bị vấn đề của bạn để nhận hỗ trợ bằng tiếng Hàn.",
    support: "Trả lời một vài câu hỏi rõ ràng. Thông tin riêng tư ở lại trên thiết bị này và PDF cuối cùng được chuẩn bị bằng tiếng Hàn.",
    emergency: "Đang nguy hiểm? Gọi 112 hoặc yêu cầu tư vấn viên ngay.",
    step: "Bước 2 / 4",
    stepTitle: "Thông tin ngày trả lương",
    question: "Lần trả lương gần nhất của bạn là khi nào?",
    help: "Không cần chính xác tuyệt đối. Hãy chọn câu trả lời gần nhất.",
    continue: "Tiếp tục an toàn",
    intakeEyebrow: "Tiếp nhận theo tình huống",
    intakeHeading: "Câu hỏi đơn giản, câu trả lời sẵn sàng cho tư vấn viên",
    stepOf: (step: number, total: number) => `Bước ${step} / ${total}`,
    answerHelp: "Bạn có thể trả lời bằng bất kỳ ngôn ngữ nào. Câu trả lời ngắn hoặc ước lượng đều được.",
    regionLabel: "Khu vực làm việc",
    regionHelp: "Thông tin này giúp kết nối vụ việc với văn phòng khu vực hoặc tư vấn viên phù hợp.",
    regionParentPlaceholder: "Select province or region",
    subregionLabel: "Select detailed region (city/district)",
    subregionPlaceholder: "Select detailed region (city/district)",
    answerLabel: "Câu trả lời của bạn",
    answerPlaceholder: "Nhập câu trả lời tại đây",
    answerSaved: "Câu trả lời cho câu hỏi này đã được lưu.",
    answerPending: "Bạn có thể tiếp tục và cập nhật sau.",
    back: "Quay lại câu hỏi trước",
    finish: "Hoàn tất và tạo PDF",
    reviewTitle: "Kiểm tra câu trả lời trước khi tạo PDF",
    reviewButton: "Kiểm tra câu trả lời",
    reviewHelp: "Hãy kiểm tra từng câu trả lời. Bạn có thể sửa trước khi tạo PDF cho tư vấn viên.",
    editAnswer: "Sửa",
    createPdf: "Tạo PDF cho tư vấn viên",
    notAnswered: "Chưa trả lời",
    readQuestion: "Đọc câu hỏi",
    ttsMissing: "Trình duyệt này chưa có giọng đọc cho ngôn ngữ này. Hãy thử Chrome hoặc Edge có cài giọng đọc.",
    ttsPlaying: "Đang đọc câu hỏi.",
    legalNotice:
      "Thông báo về quyền riêng tư và pháp lý: LinkUP không thu thập hoặc lưu trữ thông tin cá nhân chi tiết của bạn. Công cụ này chỉ giúp chuẩn bị thông tin cho tư vấn viên và không phải là dịch vụ pháp lý hay lời khuyên pháp lý.",
    pathwayTitle: "Từ lo lắng ban đầu đến hỗ trợ sẵn sàng cho tư vấn viên",
    pathwaySteps: ["Chọn vấn đề", "Trả lời an toàn", "Tải PDF", "Chia sẻ với tư vấn viên"],
    triagePanelTitle: "Bạn đang gặp vấn đề gì ngay bây giờ?",
    searchPlaceholder: "Tìm theo vấn đề, từ khóa hoặc triệu chứng",
    howThisWorks: "Cách hoạt động",
    localOnlyLabel: "Chỉ lưu trên thiết bị",
    pdfOutputLabel: "PDF tiếng Hàn",
    selectedLabel: "Vấn đề đã chọn",
  },
  th: {
    hero: "ตอนนี้คุณกำลังเจอปัญหาอะไร?",
    heroTitle: "เตรียมปัญหาของคุณเพื่อรับความช่วยเหลือเป็นภาษาเกาหลี",
    support: "ตอบคำถามที่ชัดเจนเพียงไม่กี่ข้อ ข้อมูลส่วนตัวจะอยู่ในอุปกรณ์นี้ และ PDF สุดท้ายจะจัดทำเป็นภาษาเกาหลี",
    emergency: "มีอันตรายทันทีหรือไม่? โทร 112 หรือขอความช่วยเหลือจากที่ปรึกษา",
    step: "ขั้นตอน 2 จาก 4",
    stepTitle: "รายละเอียดวันจ่ายเงิน",
    question: "คุณได้รับค่าจ้างครั้งล่าสุดเมื่อไหร่?",
    help: "ไม่จำเป็นต้องถูกต้องทั้งหมด เลือกคำตอบที่ใกล้เคียงที่สุด",
    continue: "ดำเนินการต่ออย่างปลอดภัย",
    intakeEyebrow: "แบบฟอร์มรับเรื่องเฉพาะสถานการณ์",
    intakeHeading: "คำถามง่าย ๆ คำตอบพร้อมสำหรับที่ปรึกษา",
    stepOf: (step: number, total: number) => `ขั้นตอน ${step} จาก ${total}`,
    answerHelp: "ตอบเป็นภาษาใดก็ได้ คำตอบสั้น ๆ หรือโดยประมาณก็ใช้ได้",
    regionLabel: "พื้นที่ทำงาน",
    regionHelp: "ข้อมูลนี้ช่วยส่งเรื่องไปยังสำนักงานเขตหรือที่ปรึกษาที่เหมาะสม",
    regionParentPlaceholder: "Select province or region",
    subregionLabel: "Select detailed region (city/district)",
    subregionPlaceholder: "Select detailed region (city/district)",
    answerLabel: "คำตอบของคุณ",
    answerPlaceholder: "พิมพ์คำตอบของคุณที่นี่",
    answerSaved: "บันทึกคำตอบสำหรับคำถามนี้แล้ว",
    answerPending: "คุณสามารถดำเนินการต่อและแก้ไขภายหลังได้",
    back: "กลับไปคำถามก่อนหน้า",
    finish: "เสร็จสิ้นและสร้าง PDF",
    reviewTitle: "ตรวจสอบคำตอบก่อนสร้าง PDF",
    reviewButton: "ตรวจสอบคำตอบ",
    reviewHelp: "ตรวจสอบคำตอบแต่ละข้อ คุณสามารถแก้ไขก่อนสร้าง PDF สำหรับที่ปรึกษาได้",
    editAnswer: "แก้ไข",
    createPdf: "สร้าง PDF สำหรับที่ปรึกษา",
    notAnswered: "ยังไม่ได้ตอบ",
    readQuestion: "อ่านคำถาม",
    ttsMissing: "เบราว์เซอร์นี้ยังไม่มีเสียงสำหรับภาษานี้ ลองใช้ Chrome หรือ Edge ที่ติดตั้งเสียงภาษาไว้",
    ttsPlaying: "กำลังอ่านคำถาม",
    legalNotice:
      "ประกาศความเป็นส่วนตัวและกฎหมาย: LinkUP ไม่เก็บหรือบันทึกรายละเอียดส่วนตัวของคุณ เครื่องมือนี้ช่วยเตรียมข้อมูลสำหรับที่ปรึกษาเท่านั้น และไม่ใช่บริการทางกฎหมายหรือคำแนะนำทางกฎหมาย",
    pathwayTitle: "จากปัญหาแรกสู่ข้อมูลพร้อมสำหรับที่ปรึกษา",
    pathwaySteps: ["เลือกปัญหา", "ตอบอย่างปลอดภัย", "ดาวน์โหลด PDF", "แชร์กับที่ปรึกษา"],
    triagePanelTitle: "ตอนนี้คุณกำลังเจอปัญหาอะไร?",
    searchPlaceholder: "ค้นหาตามปัญหา คำสำคัญ หรืออาการ",
    howThisWorks: "วิธีใช้งาน",
    localOnlyLabel: "เก็บไว้ในอุปกรณ์นี้",
    pdfOutputLabel: "PDF ภาษาเกาหลี",
    selectedLabel: "ปัญหาที่เลือก",
  },
};

const howPageCopy: Record<
  LanguageCode,
  {
    ariaPathway: string;
    ariaSteps: string;
    backToWorker: string;
    detailTitle: string;
    detailBodyOne: string;
    detailBodyTwo: string;
    eyebrow: string;
    heroTitle: string;
    heroBody: string;
    steps: Array<{ body: string; title: string }>;
  }
> = {
  en: {
    ariaPathway: "LinkUP support pathway",
    ariaSteps: "LinkUP usage steps",
    backToWorker: "Worker support",
    detailTitle: "Zero-retention worker intake",
    detailBodyOne:
      "Employer names, dates, amounts, contact information, and files are kept in temporary browser memory for PDF creation. Anonymous counts by region, issue, and language can go to the NGO dashboard.",
    detailBodyTwo:
      "When the PDF is downloaded or the tab is closed, private intake details are cleared from the app state.",
    eyebrow: "How this works",
    heroTitle: "From first concern to counselor-ready support",
    heroBody:
      "LinkUP helps workers describe urgent labor problems in plain language, then turns the intake into a structured Korean PDF for a counselor.",
    steps: [
      {
        title: "1. Choose the closest issue",
        body: "The worker starts with a simple triage choice. The first screen avoids legal language and uses clear scenario cards plus search.",
      },
      {
        title: "2. Answer safely",
        body: "Personal details stay only in the browser while the worker answers. Region, issue type, and language are used for anonymous trend data.",
      },
      {
        title: "3. Download the Korean PDF",
        body: "At the end, LinkUP formats the answers into a counselor-ready Korean document with summary, issue sections, evidence, and attachment pages.",
      },
      {
        title: "4. Share with a trusted counselor",
        body: "The worker can hand the PDF to an NGO counselor or staff member. LinkUP is an intake preparation tool, not a law firm or legal service.",
      },
    ],
  },
  ko: {
    ariaPathway: "LinkUP 지원 절차",
    ariaSteps: "LinkUP 이용 단계",
    backToWorker: "노동자 지원",
    detailTitle: "개인정보 비보관 접수 방식",
    detailBodyOne:
      "사업장명, 날짜, 금액, 연락처, 첨부파일은 PDF 생성을 위해 브라우저의 임시 메모리에만 보관됩니다. NGO 대시보드에는 지역, 문제 유형, 언어에 대한 익명 통계만 전송될 수 있습니다.",
    detailBodyTwo:
      "PDF를 다운로드하거나 탭을 닫으면 구체적인 개인정보와 답변 내용은 앱 상태에서 지워집니다.",
    eyebrow: "이용 방법",
    heroTitle: "처음 걱정부터 상담용 자료 준비까지",
    heroBody:
      "LinkUP은 노동자가 긴급한 직장 문제를 쉬운 말로 정리하도록 돕고, 그 내용을 상담사가 볼 수 있는 한국어 PDF로 만듭니다.",
    steps: [
      {
        title: "1. 가장 가까운 문제 선택",
        body: "노동자는 먼저 간단한 상황 카드를 선택합니다. 첫 화면은 어려운 법률 용어를 줄이고, 검색과 명확한 시나리오 카드로 시작합니다.",
      },
      {
        title: "2. 안전하게 답변",
        body: "답변하는 동안 개인정보는 브라우저 안에만 머뭅니다. 지역, 문제 유형, 언어는 익명 통계 데이터로만 사용됩니다.",
      },
      {
        title: "3. 한국어 PDF 다운로드",
        body: "마지막 단계에서 LinkUP은 답변을 상담용 한국어 문서로 정리합니다. 요약표, 문제별 항목, 증거 목록, 첨부 이미지가 포함됩니다.",
      },
      {
        title: "4. 신뢰할 수 있는 상담사에게 공유",
        body: "노동자는 PDF를 NGO 상담사나 담당자에게 전달할 수 있습니다. LinkUP은 접수 준비 도구이며 법률서비스가 아닙니다.",
      },
    ],
  },
  vi: {
    ariaPathway: "Quy trình hỗ trợ LinkUP",
    ariaSteps: "Các bước sử dụng LinkUP",
    backToWorker: "Hỗ trợ người lao động",
    detailTitle: "Tiếp nhận không lưu giữ dữ liệu cá nhân",
    detailBodyOne:
      "Tên chủ sử dụng lao động, ngày tháng, số tiền, thông tin liên hệ và tệp đính kèm chỉ được giữ tạm thời trong bộ nhớ trình duyệt để tạo PDF. Bảng điều khiển NGO chỉ có thể nhận thống kê ẩn danh theo khu vực, vấn đề và ngôn ngữ.",
    detailBodyTwo:
      "Khi tải PDF xuống hoặc đóng tab, các chi tiết riêng tư trong phần tiếp nhận sẽ được xóa khỏi trạng thái của ứng dụng.",
    eyebrow: "Cách hoạt động",
    heroTitle: "Từ lo lắng ban đầu đến hồ sơ sẵn sàng cho tư vấn viên",
    heroBody:
      "LinkUP giúp người lao động mô tả vấn đề lao động khẩn cấp bằng ngôn ngữ đơn giản, sau đó chuyển nội dung đó thành PDF tiếng Hàn có cấu trúc cho tư vấn viên.",
    steps: [
      {
        title: "1. Chọn vấn đề gần nhất",
        body: "Người lao động bắt đầu bằng một lựa chọn phân loại đơn giản. Màn hình đầu tiên tránh thuật ngữ pháp lý khó và dùng thẻ tình huống rõ ràng kèm tìm kiếm.",
      },
      {
        title: "2. Trả lời an toàn",
        body: "Thông tin cá nhân chỉ ở trong trình duyệt khi người lao động trả lời. Khu vực, loại vấn đề và ngôn ngữ được dùng cho dữ liệu xu hướng ẩn danh.",
      },
      {
        title: "3. Tải PDF tiếng Hàn",
        body: "Ở bước cuối, LinkUP định dạng câu trả lời thành tài liệu tiếng Hàn sẵn sàng cho tư vấn viên, gồm tóm tắt, mục theo vấn đề, chứng cứ và trang đính kèm.",
      },
      {
        title: "4. Chia sẻ với tư vấn viên đáng tin cậy",
        body: "Người lao động có thể đưa PDF cho tư vấn viên NGO hoặc nhân viên hỗ trợ. LinkUP là công cụ chuẩn bị tiếp nhận, không phải hãng luật hay dịch vụ pháp lý.",
      },
    ],
  },
  th: {
    ariaPathway: "ขั้นตอนการสนับสนุนของ LinkUP",
    ariaSteps: "ขั้นตอนการใช้งาน LinkUP",
    backToWorker: "การสนับสนุนแรงงาน",
    detailTitle: "การรับข้อมูลแบบไม่เก็บข้อมูลส่วนตัว",
    detailBodyOne:
      "ชื่อสถานที่ทำงาน วันที่ จำนวนเงิน ข้อมูลติดต่อ และไฟล์แนบจะถูกเก็บไว้ชั่วคราวในหน่วยความจำของเบราว์เซอร์เพื่อสร้าง PDF เท่านั้น แดชบอร์ด NGO จะรับได้เฉพาะสถิติแบบไม่ระบุตัวตนตามพื้นที่ ประเภทปัญหา และภาษา",
    detailBodyTwo:
      "เมื่อดาวน์โหลด PDF หรือปิดแท็บ รายละเอียดส่วนตัวในแบบฟอร์มจะถูกลบออกจากสถานะของแอป",
    eyebrow: "วิธีใช้งาน",
    heroTitle: "จากความกังวลแรกสู่เอกสารพร้อมให้ที่ปรึกษาตรวจ",
    heroBody:
      "LinkUP ช่วยให้แรงงานอธิบายปัญหาเร่งด่วนในที่ทำงานด้วยภาษาง่าย ๆ แล้วจัดทำเป็น PDF ภาษาเกาหลีที่มีโครงสร้างสำหรับที่ปรึกษา",
    steps: [
      {
        title: "1. เลือกปัญหาที่ใกล้เคียงที่สุด",
        body: "ผู้ใช้เริ่มจากการเลือกสถานการณ์ง่าย ๆ หน้าแรกหลีกเลี่ยงภาษากฎหมายที่ซับซ้อน และใช้การ์ดสถานการณ์พร้อมช่องค้นหา",
      },
      {
        title: "2. ตอบอย่างปลอดภัย",
        body: "ข้อมูลส่วนตัวจะอยู่ในเบราว์เซอร์ขณะตอบคำถามเท่านั้น พื้นที่ ประเภทปัญหา และภาษาจะใช้สำหรับข้อมูลแนวโน้มแบบไม่ระบุตัวตน",
      },
      {
        title: "3. ดาวน์โหลด PDF ภาษาเกาหลี",
        body: "เมื่อจบขั้นตอน LinkUP จะจัดรูปแบบคำตอบเป็นเอกสารภาษาเกาหลีสำหรับที่ปรึกษา พร้อมสรุป หัวข้อปัญหา หลักฐาน และหน้าไฟล์แนบ",
      },
      {
        title: "4. แชร์กับที่ปรึกษาที่เชื่อถือได้",
        body: "ผู้ใช้สามารถส่ง PDF ให้ที่ปรึกษา NGO หรือเจ้าหน้าที่สนับสนุนได้ LinkUP เป็นเครื่องมือเตรียมข้อมูล ไม่ใช่สำนักงานกฎหมายหรือบริการทางกฎหมาย",
      },
    ],
  },
};

const situations: Situation[] = [
  {
    id: "wages",
    tone: "wage",
    icon: WalletCards,
    label: {
      en: "Unpaid Wages",
      ko: "임금 미지급",
      vi: "Chưa trả lương",
      th: "ไม่ได้รับค่าจ้าง",
    },
    detail: {
      en: "Salary, overtime, severance",
      ko: "월급, 초과근무, 퇴직금",
      vi: "Lương, tăng ca, trợ cấp thôi việc",
      th: "เงินเดือน ล่วงเวลา เงินชดเชย",
    },
  },
  {
    id: "medical",
    tone: "medical",
    icon: Stethoscope,
    label: {
      en: "Medical Emergency",
      ko: "의료 긴급상황",
      vi: "Khẩn cấp y tế",
      th: "เหตุฉุกเฉินทางแพทย์",
    },
    detail: {
      en: "Injury, hospital, insurance",
      ko: "부상, 병원, 보험",
      vi: "Chấn thương, bệnh viện, bảo hiểm",
      th: "บาดเจ็บ โรงพยาบาล ประกัน",
    },
  },
  {
    id: "contract",
    tone: "visa",
    icon: FileText,
    label: {
      en: "Visa / Contract",
      ko: "비자 / 계약 문제",
      vi: "Visa / Hợp đồng",
      th: "วีซ่า / สัญญา",
    },
    detail: {
      en: "E-9, contract, employer change",
      ko: "E-9, 계약서, 사업장 변경",
      vi: "E-9, hợp đồng, đổi nơi làm",
      th: "E-9 สัญญา เปลี่ยนนายจ้าง",
    },
  },
  {
    id: "safety",
    tone: "safety",
    icon: Factory,
    label: {
      en: "Workplace Safety",
      ko: "사업장 안전",
      vi: "An toàn nơi làm việc",
      th: "ความปลอดภัยในงาน",
    },
    detail: {
      en: "Unsafe housing or factory conditions",
      ko: "위험한 숙소 또는 작업환경",
      vi: "Nhà ở hoặc nơi làm không an toàn",
      th: "ที่พักหรือสถานที่ทำงานไม่ปลอดภัย",
    },
  },
  {
    id: "housing",
    tone: "housing",
    icon: Home,
    label: {
      en: "Housing Threat",
      ko: "숙소 퇴거 위협",
      vi: "Đe dọa chỗ ở",
      th: "ถูกขู่ให้ออกจากที่พัก",
    },
    detail: {
      en: "Eviction, deductions, pressure",
      ko: "퇴거, 공제, 압박",
      vi: "Đuổi khỏi nhà, khấu trừ, ép buộc",
      th: "ไล่ออก หักเงิน กดดัน",
    },
  },
];

const situationSearchTerms: Record<string, string> = {
  wages: "pay salary money overtime severance missing unpaid wage 임금 월급 돈 체불 초과근무 퇴직금",
  medical: "injury hurt sick hospital doctor insurance accident emergency 부상 아픔 병원 보험 사고 응급",
  contract: "visa immigration contract employer change release form 비자 체류 계약 사업장 변경",
  safety: "danger unsafe machine factory fumes heat cold safety 위험 안전 기계 공장 유해",
  housing: "home room dormitory eviction rent utilities housing 숙소 집 기숙사 퇴거 월세 공과금",
};

const triageDiscoveryCopy: Record<
  LanguageCode,
  { popular: string; results: string; noResults: string; searchHint: string }
> = {
  en: {
    popular: "Frequently searched",
    results: "Suggested support",
    noResults: "No matching situation yet. Try a simpler word such as pay, hospital, visa, safety, or housing.",
    searchHint: "Describe what happened in a few words",
  },
  ko: {
    popular: "자주 찾는 문제",
    results: "추천 지원 항목",
    noResults: "일치하는 문제가 없습니다. 월급, 병원, 비자, 안전, 숙소처럼 간단한 단어로 검색해 보세요.",
    searchHint: "무슨 일이 있었는지 짧게 검색하세요",
  },
  vi: {
    popular: "Vấn đề thường được tìm",
    results: "Hỗ trợ được đề xuất",
    noResults: "Chưa tìm thấy tình huống phù hợp. Hãy thử từ đơn giản như lương, bệnh viện, visa, an toàn hoặc nhà ở.",
    searchHint: "Mô tả ngắn gọn điều đã xảy ra",
  },
  th: {
    popular: "ปัญหาที่ค้นหาบ่อย",
    results: "ความช่วยเหลือที่แนะนำ",
    noResults: "ยังไม่พบสถานการณ์ที่ตรงกัน ลองใช้คำง่าย ๆ เช่น ค่าจ้าง โรงพยาบาล วีซ่า ความปลอดภัย หรือที่พัก",
    searchHint: "อธิบายสั้น ๆ ว่าเกิดอะไรขึ้น",
  },
};

const scenarioQuestions: Record<string, Record<LanguageCode, string[]>> = {
  wages: {
    en: [
      "What is the official name of your workplace or your employer's name?",
      "For which specific months or dates have you not received your full payment?",
      "Approximately how much total money, including regular salary, overtime, or severance pay, is currently owed to you?",
      "Do you have access to items like your labor contract, bank account statements, timecard records, or text messages showing work hours?",
    ],
    ko: [
      "근무한 사업장의 공식 명칭 또는 고용주의 이름은 무엇인가요?",
      "어느 월 또는 어느 날짜의 임금을 전부 받지 못했나요?",
      "정규 임금, 초과근무수당, 퇴직금 등을 포함해 현재 대략 얼마가 체불되었나요?",
      "근로계약서, 은행 거래내역, 출퇴근 기록, 근무시간을 보여주는 문자 메시지 같은 자료를 가지고 있나요?",
    ],
    vi: [
      "Tên chính thức của nơi làm việc hoặc tên chủ sử dụng lao động của bạn là gì?",
      "Bạn chưa nhận đủ tiền lương cho những tháng hoặc ngày cụ thể nào?",
      "Tổng số tiền hiện còn bị nợ, bao gồm lương thường, tăng ca hoặc trợ cấp thôi việc, khoảng bao nhiêu?",
      "Bạn có hợp đồng lao động, sao kê ngân hàng, bảng chấm công hoặc tin nhắn thể hiện giờ làm việc không?",
    ],
    th: [
      "ชื่ออย่างเป็นทางการของสถานที่ทำงานหรือชื่อนายจ้างของคุณคืออะไร?",
      "คุณยังไม่ได้รับค่าจ้างเต็มจำนวนสำหรับเดือนหรือวันที่ใดบ้าง?",
      "ยอดเงินทั้งหมดที่ยังค้างจ่าย รวมถึงเงินเดือน ค่าล่วงเวลา หรือเงินชดเชย ประมาณเท่าไร?",
      "คุณมีเอกสาร เช่น สัญญาจ้าง รายการเดินบัญชี บันทึกเวลาเข้าออกงาน หรือข้อความที่แสดงชั่วโมงทำงานหรือไม่?",
    ],
  },
  medical: {
    en: [
      "Did your injury or medical condition happen while you were performing work duties at your workplace?",
      "Exactly when did this medical emergency occur, and what part of your body is injured or sick?",
      "Are you currently registered under the Korean National Health Insurance or any private foreigner insurance plans?",
      "Have you already visited a hospital clinic or received emergency treatment, and do you possess medical receipts or diagnoses?",
    ],
    ko: [
      "부상이나 질병이 사업장에서 업무를 수행하는 중에 발생했나요?",
      "이 의료 긴급상황은 정확히 언제 발생했으며, 몸의 어느 부위가 다치거나 아픈가요?",
      "현재 국민건강보험 또는 외국인 대상 민간 보험에 가입되어 있나요?",
      "이미 병원이나 의원을 방문했거나 응급치료를 받았나요? 진료비 영수증이나 진단서를 가지고 있나요?",
    ],
    vi: [
      "Chấn thương hoặc tình trạng y tế của bạn có xảy ra khi bạn đang làm việc tại nơi làm việc không?",
      "Tình huống khẩn cấp y tế này xảy ra chính xác khi nào, và bộ phận nào trên cơ thể bị thương hoặc bị bệnh?",
      "Hiện bạn có đăng ký Bảo hiểm Y tế Quốc dân Hàn Quốc hoặc bảo hiểm tư nhân dành cho người nước ngoài không?",
      "Bạn đã đến bệnh viện, phòng khám hoặc được cấp cứu chưa, và bạn có biên lai y tế hoặc giấy chẩn đoán không?",
    ],
    th: [
      "การบาดเจ็บหรืออาการป่วยเกิดขึ้นขณะที่คุณกำลังปฏิบัติหน้าที่ในที่ทำงานหรือไม่?",
      "เหตุฉุกเฉินทางการแพทย์นี้เกิดขึ้นเมื่อใด และส่วนใดของร่างกายได้รับบาดเจ็บหรือเจ็บป่วย?",
      "ปัจจุบันคุณอยู่ในระบบประกันสุขภาพแห่งชาติของเกาหลี หรือมีประกันเอกชนสำหรับชาวต่างชาติหรือไม่?",
      "คุณได้ไปโรงพยาบาล คลินิก หรือได้รับการรักษาฉุกเฉินแล้วหรือไม่ และมีใบเสร็จหรือใบวินิจฉัยแพทย์หรือไม่?",
    ],
  },
  contract: {
    en: [
      "What is your exact visa status right now, such as E-9, H-2, E-7, or G-1?",
      "When does your current visa stay period expire, and when does your active labor contract end?",
      "Are you looking to change your workplace due to an employer conflict, or has your employer threatened to terminate your contract early?",
      "Has your current employer agreed to sign a Release Form, 이적동의서 or 고용변동신고서, or are they refusing to give you permission to leave?",
    ],
    ko: [
      "현재 정확한 체류자격은 무엇인가요? 예: E-9, H-2, E-7, G-1",
      "현재 비자 체류기간은 언제 만료되며, 현재 근로계약은 언제 종료되나요?",
      "고용주와의 갈등 때문에 사업장 변경을 원하나요? 또는 고용주가 계약을 조기 종료하겠다고 위협했나요?",
      "현재 고용주가 이적동의서 또는 고용변동신고서 서명에 동의했나요, 아니면 퇴사를 허락하지 않고 있나요?",
    ],
    vi: [
      "Tình trạng visa chính xác hiện tại của bạn là gì, ví dụ E-9, H-2, E-7 hoặc G-1?",
      "Thời hạn lưu trú theo visa hiện tại của bạn hết hạn khi nào, và hợp đồng lao động hiện tại kết thúc khi nào?",
      "Bạn có muốn đổi nơi làm việc vì mâu thuẫn với chủ sử dụng lao động, hoặc chủ có đe dọa chấm dứt hợp đồng sớm không?",
      "Chủ hiện tại có đồng ý ký giấy cho chuyển nơi làm việc hoặc báo cáo thay đổi việc làm không, hay họ từ chối cho bạn rời đi?",
    ],
    th: [
      "สถานะวีซ่าที่แน่นอนของคุณตอนนี้คืออะไร เช่น E-9, H-2, E-7 หรือ G-1?",
      "ระยะเวลาพำนักตามวีซ่าปัจจุบันของคุณหมดอายุเมื่อใด และสัญญาจ้างปัจจุบันสิ้นสุดเมื่อใด?",
      "คุณต้องการเปลี่ยนสถานที่ทำงานเพราะมีปัญหากับนายจ้าง หรือถูกนายจ้างขู่ยกเลิกสัญญาก่อนกำหนดหรือไม่?",
      "นายจ้างปัจจุบันยอมลงนามในเอกสารยินยอมให้ย้ายงานหรือรายงานเปลี่ยนแปลงการจ้างงานหรือไม่ หรือปฏิเสธไม่ให้คุณออก?",
    ],
  },
  safety: {
    en: [
      "What is the primary safety danger at your workplace, such as unprotected machinery, lack of safety gear, toxic fumes, or extreme temperatures?",
      "Has an accident or a dangerous near-miss already occurred recently due to this safety issue?",
      "Have you or your coworkers informed your manager or employer about this danger, and what was their reaction?",
      "Are you able to safely take clear photographs or videos of the unsafe machines or factory conditions to use as proof?",
    ],
    ko: [
      "사업장에서 가장 큰 안전 위험은 무엇인가요? 예: 보호장치 없는 기계, 안전장비 부족, 유독가스, 극심한 온도",
      "이 안전 문제 때문에 최근 사고나 위험한 아차사고가 이미 발생했나요?",
      "본인이나 동료가 관리자 또는 고용주에게 이 위험을 알렸나요? 그들의 반응은 어땠나요?",
      "증거로 사용할 수 있도록 위험한 기계나 공장 상태를 안전하게 사진 또는 영상으로 촬영할 수 있나요?",
    ],
    vi: [
      "Mối nguy hiểm chính về an toàn tại nơi làm việc của bạn là gì, ví dụ máy móc không được che chắn, thiếu thiết bị bảo hộ, khí độc hoặc nhiệt độ khắc nghiệt?",
      "Gần đây đã có tai nạn hoặc tình huống suýt gây tai nạn nguy hiểm do vấn đề an toàn này chưa?",
      "Bạn hoặc đồng nghiệp đã báo cho quản lý hoặc chủ sử dụng lao động về nguy hiểm này chưa, và họ phản ứng như thế nào?",
      "Bạn có thể chụp ảnh hoặc quay video rõ ràng về máy móc hoặc điều kiện nhà xưởng không an toàn một cách an toàn để làm bằng chứng không?",
    ],
    th: [
      "อันตรายด้านความปลอดภัยหลักในที่ทำงานคืออะไร เช่น เครื่องจักรไม่มีอุปกรณ์ป้องกัน ขาดอุปกรณ์นิรภัย ควันพิษ หรืออุณหภูมิรุนแรง?",
      "มีอุบัติเหตุหรือเหตุการณ์เกือบเกิดอุบัติเหตุที่อันตรายจากปัญหานี้เมื่อเร็ว ๆ นี้หรือไม่?",
      "คุณหรือเพื่อนร่วมงานได้แจ้งหัวหน้างานหรือนายจ้างเกี่ยวกับอันตรายนี้หรือไม่ และพวกเขาตอบสนองอย่างไร?",
      "คุณสามารถถ่ายภาพหรือวิดีโอเครื่องจักรหรือสภาพโรงงานที่ไม่ปลอดภัยได้อย่างปลอดภัยเพื่อใช้เป็นหลักฐานหรือไม่?",
    ],
  },
  housing: {
    en: [
      "What type of housing does your employer provide for you, such as a temporary container, vinyl greenhouse structure, shared apartment, or motel room?",
      "Is your employer threatening to evict you or lock you out of your accommodation? If yes, what deadline did they give you?",
      "Does your employer deduct housing or utility fees directly from your monthly paycheck without your explicit, written consent?",
      "Does your housing lack basic operational amenities like functioning locks, running water, proper heating, or air conditioning?",
    ],
    ko: [
      "고용주가 제공하는 숙소 유형은 무엇인가요? 예: 임시 컨테이너, 비닐하우스 구조물, 공동 아파트, 모텔 방",
      "고용주가 숙소에서 내보내거나 문을 잠그겠다고 위협하고 있나요? 그렇다면 언제까지 나가라고 했나요?",
      "고용주가 명확한 서면 동의 없이 월급에서 숙소비나 공과금을 직접 공제하나요?",
      "숙소에 작동하는 잠금장치, 수돗물, 난방, 에어컨 같은 기본 설비가 부족한가요?",
    ],
    vi: [
      "Loại chỗ ở mà chủ sử dụng lao động cung cấp cho bạn là gì, ví dụ container tạm, nhà kính nhựa, căn hộ ở chung hoặc phòng motel?",
      "Chủ có đang đe dọa đuổi bạn ra khỏi chỗ ở hoặc khóa cửa không? Nếu có, họ đưa ra hạn chót là khi nào?",
      "Chủ có tự trừ tiền nhà hoặc tiền tiện ích trực tiếp từ lương hằng tháng của bạn mà không có sự đồng ý rõ ràng bằng văn bản không?",
      "Chỗ ở của bạn có thiếu các tiện nghi cơ bản như khóa hoạt động được, nước sinh hoạt, hệ thống sưởi hoặc điều hòa không?",
    ],
    th: [
      "นายจ้างจัดที่พักประเภทใดให้คุณ เช่น ตู้คอนเทนเนอร์ชั่วคราว โครงสร้างโรงเรือนพลาสติก อพาร์ตเมนต์รวม หรือห้องโมเต็ล?",
      "นายจ้างกำลังขู่จะไล่คุณออกจากที่พักหรือล็อกไม่ให้เข้าใช่หรือไม่ หากใช่ เขากำหนดเส้นตายเมื่อใด?",
      "นายจ้างหักค่าที่พักหรือค่าสาธารณูปโภคจากเงินเดือนรายเดือนของคุณโดยตรงโดยไม่มีความยินยอมเป็นลายลักษณ์อักษรหรือไม่?",
      "ที่พักของคุณขาดสิ่งจำเป็นพื้นฐาน เช่น กุญแจที่ใช้งานได้ น้ำประปา เครื่องทำความร้อน หรือเครื่องปรับอากาศหรือไม่?",
    ],
  },
};

const unpaidWagesPetitionQuestions: Record<LanguageCode, string[]> = {
  en: [
    "Worker details: please enter your name, visa type, and contact number.",
    "Workplace details: please enter the company/workplace name and your boss or employer's name.",
    "Employment details: when did you start working, when did you stop or are you still working, and do you have a written labor contract?",
    "Unpaid wage details: what months or dates were unpaid, approximately how much is owed, and what evidence do you have?",
  ],
  ko: [
    "인적사항: 성명, 비자 종류, 연락처를 적어주세요.",
    "사업장 정보: 회사 또는 사업장 이름과 사장님/고용주 이름을 적어주세요.",
    "근로 형태: 언제부터 언제까지 일했는지, 지금도 근무 중인지, 근로계약서가 있는지 알려주세요.",
    "체불 내용: 임금을 받지 못한 기간, 대략적인 체불 금액, 가지고 있는 증거를 알려주세요.",
  ],
  vi: [
    "Thông tin người lao động: vui lòng nhập tên, loại visa và số liên lạc.",
    "Thông tin nơi làm việc: nhập tên công ty/nơi làm việc và tên chủ hoặc người sử dụng lao động.",
    "Chi tiết việc làm: bạn bắt đầu làm khi nào, đã nghỉ hay vẫn đang làm, và có hợp đồng lao động bằng văn bản không?",
    "Chi tiết lương chưa trả: tháng/ngày nào chưa được trả, số tiền khoảng bao nhiêu, và bạn có bằng chứng gì?",
  ],
  th: [
    "ข้อมูลคนงาน: กรุณากรอกชื่อ ประเภทวีซ่า และเบอร์ติดต่อ",
    "ข้อมูลที่ทำงาน: กรอกชื่อบริษัท/สถานที่ทำงาน และชื่อนายจ้างหรือหัวหน้า",
    "รายละเอียดการทำงาน: เริ่มทำงานเมื่อไร หยุดทำงานแล้วหรือยังทำอยู่ และมีสัญญาจ้างเป็นลายลักษณ์อักษรหรือไม่",
    "รายละเอียดค่าจ้างค้างจ่าย: เดือนไหนหรือวันไหนยังไม่ได้รับเงิน จำนวนประมาณเท่าไร และมีหลักฐานอะไรบ้าง",
  ],
};

const questionMeta: Record<string, QuestionMeta[]> = {
  wages: [
    {
      textKo: "어디서 일하셨나요? 회사 이름이나 사장님 이름을 적어주세요.",
    },
    {
      helpKo: "예시: 2026년 3월 전체, 혹은 4월 1일~15일 등 기억나는 대로 적어주세요.",
      textKo: "언제 일한 돈을 받지 못하셨나요?",
    },
    {
      helpKo: "기본 월급, 연장 근무 수당, 퇴직금 등을 모두 합친 대략의 금액을 적어주세요.",
      textKo: "못 받은 돈은 전부 얼마쯤 되나요?",
    },
    {
      allowUpload: true,
      optionsKo: [
        "근로계약서",
        "월급이 들어오던 통장 내역",
        "출퇴근 기록 카드",
        "사장님과 주고받은 문자나 카카오톡 대화",
        "지금은 증거가 없어요",
      ],
      textKo: "일했다는 것을 보여줄 수 있는 증거가 있나요? 있는 것을 모두 골라주세요.",
    },
  ],
  medical: [
    {
      optionsKo: ["예, 일하는 중이었어요", "아니요", "잘 모르겠어요"],
      textKo: "다치거나 아픈 일이 근무 중에 발생했나요?",
    },
    {
      helpKo: "예시: 2026년 5월 20일 오후, 오른손 손가락, 허리 통증 등",
      textKo: "언제 발생했고, 몸의 어느 부분이 다쳤거나 아픈가요?",
    },
    {
      optionsKo: ["국민건강보험이 있어요", "민간 보험이 있어요", "보험이 없어요", "잘 모르겠어요"],
      textKo: "현재 가입된 건강보험이나 외국인 보험이 있나요?",
    },
    {
      allowUpload: true,
      optionsKo: ["병원에 갔어요", "응급 치료를 받았어요", "영수증이 있어요", "진단서가 있어요", "아직 병원에 못 갔어요"],
      textKo: "병원 진료나 응급 치료를 받았나요? 관련 자료가 있으면 올려주세요.",
    },
  ],
  contract: [
    {
      optionsKo: ["E-9", "H-2", "E-7", "G-1", "잘 모르겠어요", "기타"],
      textKo: "현재 비자 종류가 무엇인가요?",
    },
    {
      helpKo: "비자 만료일과 근로계약 종료일을 아는 범위에서 적어주세요.",
      textKo: "비자 체류 기간과 근로계약은 언제 끝나나요?",
    },
    {
      optionsKo: ["사업장을 바꾸고 싶어요", "계약 해지를 위협받았어요", "둘 다 해당돼요", "아니요"],
      textKo: "사업장 변경 문제나 계약 해지 위협이 있나요?",
    },
    {
      allowUpload: true,
      optionsKo: ["동의서를 써주겠다고 했어요", "거부하고 있어요", "아직 물어보지 못했어요", "잘 모르겠어요"],
      textKo: "고용주가 이적동의서 또는 고용변동신고서에 협조하고 있나요?",
    },
  ],
  safety: [
    {
      optionsKo: ["보호 장치 없는 기계", "안전 장비 부족", "유독 가스/냄새", "너무 덥거나 추운 환경", "기타"],
      textKo: "일터에서 가장 위험한 안전 문제는 무엇인가요?",
    },
    {
      optionsKo: ["사고가 이미 있었어요", "사고가 날 뻔했어요", "아직 없지만 위험해요", "잘 모르겠어요"],
      textKo: "최근 사고나 위험한 상황이 있었나요?",
    },
    {
      helpKo: "관리자나 사장님에게 말했는지, 그리고 어떤 반응을 보였는지 적어주세요.",
      textKo: "이 위험을 회사에 알린 적이 있나요?",
    },
    {
      allowUpload: true,
      optionsKo: ["사진을 찍을 수 있어요", "동영상을 찍을 수 있어요", "안전하지 않아서 어렵습니다", "이미 자료가 있어요"],
      textKo: "위험한 기계나 작업환경을 증거로 보여줄 자료가 있나요?",
    },
  ],
  housing: [
    {
      optionsKo: ["컨테이너", "비닐하우스", "공동 아파트/기숙사", "모텔방", "기타"],
      textKo: "고용주가 제공한 숙소는 어떤 형태인가요?",
    },
    {
      helpKo: "퇴거를 요구받았다면 날짜나 마감 시한을 적어주세요.",
      textKo: "숙소에서 나가라고 하거나 문을 잠그겠다고 위협받았나요?",
    },
    {
      optionsKo: ["예, 월급에서 공제돼요", "아니요", "잘 모르겠어요"],
      textKo: "서면 동의 없이 숙소비나 공과금이 월급에서 빠지고 있나요?",
    },
    {
      allowUpload: true,
      optionsKo: ["잠금장치 문제", "수돗물 문제", "난방 문제", "에어컨/환기 문제", "사진이나 영상이 있어요"],
      textKo: "숙소에 기본 시설 문제가 있나요? 사진이나 자료가 있으면 올려주세요.",
    },
  ],
};

const localizedQuestionOptions: Record<string, Record<number, LocalizedOptions>> = {
  wages: {
    2: {
      en: ["Written labor contract exists", "No written contract", "I am not sure"],
      ko: ["근로계약서 보유", "근로계약서 미보유", "잘 모르겠어요"],
      vi: ["Có hợp đồng lao động bằng văn bản", "Không có hợp đồng bằng văn bản", "Tôi không chắc"],
      th: ["มีสัญญาจ้างเป็นลายลักษณ์อักษร", "ไม่มีสัญญาเป็นลายลักษณ์อักษร", "ไม่แน่ใจ"],
    },
    3: {
      en: [
        "Labor contract",
        "Bank statements showing salary deposits",
        "Timecard or attendance records",
        "Text messages or KakaoTalk with employer",
        "I do not have evidence right now",
      ],
      vi: [
        "Hợp đồng lao động",
        "Sao kê ngân hàng có tiền lương",
        "Thẻ chấm công hoặc hồ sơ giờ làm",
        "Tin nhắn hoặc KakaoTalk với chủ sử dụng lao động",
        "Hiện tại tôi chưa có bằng chứng",
      ],
      th: [
        "สัญญาจ้างงาน",
        "รายการบัญชีธนาคารที่แสดงเงินเดือน",
        "บัตรลงเวลาหรือบันทึกการเข้างาน",
        "ข้อความหรือ KakaoTalk กับนายจ้าง",
        "ตอนนี้ยังไม่มีหลักฐาน",
      ],
    },
  },
  medical: {
    0: {
      en: ["Yes, while I was working", "No", "I am not sure"],
      vi: ["Có, khi tôi đang làm việc", "Không", "Tôi không chắc"],
      th: ["ใช่ ระหว่างทำงาน", "ไม่ใช่", "ไม่แน่ใจ"],
    },
    2: {
      en: [
        "Korean National Health Insurance",
        "Private insurance",
        "No insurance",
        "I am not sure",
      ],
      vi: [
        "Bảo hiểm y tế quốc dân Hàn Quốc",
        "Bảo hiểm tư nhân",
        "Không có bảo hiểm",
        "Tôi không chắc",
      ],
      th: [
        "ประกันสุขภาพแห่งชาติของเกาหลี",
        "ประกันเอกชน",
        "ไม่มีประกัน",
        "ไม่แน่ใจ",
      ],
    },
    3: {
      en: [
        "I visited a hospital or clinic",
        "I received emergency treatment",
        "I have receipts",
        "I have a diagnosis document",
        "I have not visited a hospital yet",
      ],
      vi: [
        "Tôi đã đến bệnh viện hoặc phòng khám",
        "Tôi đã được điều trị cấp cứu",
        "Tôi có hóa đơn",
        "Tôi có giấy chẩn đoán",
        "Tôi chưa đến bệnh viện",
      ],
      th: [
        "ไปโรงพยาบาลหรือคลินิกแล้ว",
        "ได้รับการรักษาฉุกเฉินแล้ว",
        "มีใบเสร็จ",
        "มีใบวินิจฉัย",
        "ยังไม่ได้ไปโรงพยาบาล",
      ],
    },
  },
  contract: {
    0: {
      en: ["E-9", "H-2", "E-7", "G-1", "I am not sure", "Other"],
      vi: ["E-9", "H-2", "E-7", "G-1", "Tôi không chắc", "Khác"],
      th: ["E-9", "H-2", "E-7", "G-1", "ไม่แน่ใจ", "อื่น ๆ"],
    },
    2: {
      en: [
        "I want to change workplaces",
        "My employer threatened early termination",
        "Both apply",
        "No",
      ],
      vi: [
        "Tôi muốn đổi nơi làm việc",
        "Chủ sử dụng lao động dọa chấm dứt hợp đồng sớm",
        "Cả hai đều đúng",
        "Không",
      ],
      th: [
        "ต้องการเปลี่ยนที่ทำงาน",
        "นายจ้างขู่ยกเลิกสัญญาก่อนกำหนด",
        "ทั้งสองอย่าง",
        "ไม่ใช่",
      ],
    },
    3: {
      en: [
        "Employer agreed to sign",
        "Employer is refusing",
        "I have not asked yet",
        "I am not sure",
      ],
      vi: [
        "Chủ sử dụng lao động đồng ý ký",
        "Chủ sử dụng lao động từ chối",
        "Tôi chưa hỏi",
        "Tôi không chắc",
      ],
      th: [
        "นายจ้างยอมลงนาม",
        "นายจ้างปฏิเสธ",
        "ยังไม่ได้ถาม",
        "ไม่แน่ใจ",
      ],
    },
  },
  safety: {
    0: {
      en: [
        "Unprotected machinery",
        "Not enough safety gear",
        "Toxic fumes or chemicals",
        "Extreme heat or cold",
        "Other",
      ],
      vi: [
        "Máy móc không có bảo vệ",
        "Thiếu thiết bị an toàn",
        "Khí độc hoặc hóa chất",
        "Quá nóng hoặc quá lạnh",
        "Khác",
      ],
      th: [
        "เครื่องจักรไม่มีอุปกรณ์ป้องกัน",
        "อุปกรณ์ความปลอดภัยไม่เพียงพอ",
        "ควันพิษหรือสารเคมี",
        "ร้อนหรือหนาวจัด",
        "อื่น ๆ",
      ],
    },
    1: {
      en: [
        "An accident already happened",
        "A near-miss happened",
        "No accident yet, but it is dangerous",
        "I am not sure",
      ],
      vi: [
        "Đã xảy ra tai nạn",
        "Đã suýt xảy ra tai nạn",
        "Chưa có tai nạn nhưng rất nguy hiểm",
        "Tôi không chắc",
      ],
      th: [
        "เกิดอุบัติเหตุแล้ว",
        "เกือบเกิดอุบัติเหตุ",
        "ยังไม่เกิด แต่เป็นอันตราย",
        "ไม่แน่ใจ",
      ],
    },
    3: {
      en: [
        "I can take photos",
        "I can take videos",
        "It is not safe to do that",
        "I already have evidence",
      ],
      vi: [
        "Tôi có thể chụp ảnh",
        "Tôi có thể quay video",
        "Làm vậy không an toàn",
        "Tôi đã có bằng chứng",
      ],
      th: [
        "ถ่ายรูปได้",
        "ถ่ายวิดีโอได้",
        "ทำแบบนั้นไม่ปลอดภัย",
        "มีหลักฐานอยู่แล้ว",
      ],
    },
  },
  housing: {
    0: {
      en: [
        "Container",
        "Vinyl greenhouse structure",
        "Shared apartment or dormitory",
        "Motel room",
        "Other",
      ],
      vi: [
        "Container",
        "Nhà kính vinyl",
        "Căn hộ chung hoặc ký túc xá",
        "Phòng motel",
        "Khác",
      ],
      th: [
        "ตู้คอนเทนเนอร์",
        "โครงสร้างโรงเรือนไวนิล",
        "อพาร์ตเมนต์รวมหรือหอพัก",
        "ห้องโมเทล",
        "อื่น ๆ",
      ],
    },
    2: {
      en: ["Yes, deducted from my salary", "No", "I am not sure"],
      vi: ["Có, bị trừ từ lương của tôi", "Không", "Tôi không chắc"],
      th: ["ใช่ หักจากเงินเดือน", "ไม่ใช่", "ไม่แน่ใจ"],
    },
    3: {
      en: [
        "Lock problem",
        "Running water problem",
        "Heating problem",
        "Air conditioning problem",
        "I have photos or videos",
      ],
      vi: [
        "Vấn đề khóa cửa",
        "Vấn đề nước sinh hoạt",
        "Vấn đề sưởi ấm",
        "Vấn đề điều hòa",
        "Tôi có ảnh hoặc video",
      ],
      th: [
        "ปัญหากุญแจหรือล็อก",
        "ปัญหาน้ำใช้",
        "ปัญหาเครื่องทำความร้อน",
        "ปัญหาเครื่องปรับอากาศ",
        "มีรูปภาพหรือวิดีโอ",
      ],
    },
  },
};

const languageDemand = [
  { language: "Vietnamese", value: 41, color: "#1E3A8A" },
  { language: "Thai", value: 27, color: "#10B981" },
  { language: "Tagalog", value: 18, color: "#38BDF8" },
  { language: "Indonesian", value: 14, color: "#F59E0B" },
];

const scenarioDocumentConfig: Record<
  string,
  {
    detailTitle: string;
    documentType: string;
    evidenceTitle: string;
    narrative: (answers: string[], region: string) => string;
    partyTitle: string;
    workTitle: string;
  }
> = {
  contract: {
    detailTitle: "계약/비자 분쟁 경위",
    documentType: "비자/근로계약 상담용 접수서 초안",
    evidenceTitle: "계약 및 고용변동 관련 자료",
    partyTitle: "인적사항 및 체류 정보",
    workTitle: "사업장 및 계약 정보",
    narrative: (answers, region) =>
      `노동자는 ${region} 지역 사업장과 관련하여 비자, 근로계약, 사업장 변경 또는 고용변동 절차에 관한 어려움을 호소하고 있습니다. ` +
      `노동자가 진술한 체류자격 및 계약 상황은 다음과 같으며, 상담사는 사업장 변경 필요성, 고용주의 동의 여부, 계약 종료 위협 여부를 함께 확인해 주시기 바랍니다. ` +
      `${answers[2] || "구체적인 분쟁 내용은 상담 과정에서 추가 확인이 필요합니다."}`,
  },
  housing: {
    detailTitle: "주거 위협 및 숙소 문제 경위",
    documentType: "고용주 제공 숙소 상담용 접수서 초안",
    evidenceTitle: "숙소 상태 및 공제 관련 자료",
    partyTitle: "인적사항 및 숙소 제공자 정보",
    workTitle: "사업장 및 숙소 정보",
    narrative: (answers, region) =>
      `노동자는 ${region} 지역 사업장 또는 고용주가 제공한 숙소와 관련하여 퇴거 압박, 잠금장치, 수도, 냉난방, 숙소비 공제 등의 문제를 진술하였습니다. ` +
      `상담사는 숙소 제공 방식, 임금에서 공제된 금액, 퇴거 통보 또는 위협의 구체적 시점, 안전상 위험 여부를 우선 확인해 주시기 바랍니다. ` +
      `${answers[2] || "구체적인 주거 문제는 상담 과정에서 추가 확인이 필요합니다."}`,
  },
  medical: {
    detailTitle: "의료/산재 발생 경위",
    documentType: "의료 긴급상황 상담용 접수서 초안",
    evidenceTitle: "치료 및 진단 관련 자료",
    partyTitle: "인적사항 및 보험 정보",
    workTitle: "사업장 및 발생 장소 정보",
    narrative: (answers, region) =>
      `노동자는 ${region} 지역 사업장에서 근무 중 또는 근무와 관련된 상황에서 부상이나 질병이 발생했다고 진술하였습니다. ` +
      `상담사는 발생 시각, 다친 부위, 현재 치료 여부, 건강보험 또는 민간보험 가입 여부, 병원 영수증과 진단서 보유 여부를 확인해 주시기 바랍니다. ` +
      `${answers[2] || "구체적인 의료 경위는 상담 과정에서 추가 확인이 필요합니다."}`,
  },
  safety: {
    detailTitle: "사업장 안전 위험 경위",
    documentType: "사업장 안전 상담용 접수서 초안",
    evidenceTitle: "안전 위험 및 신고 관련 자료",
    partyTitle: "인적사항",
    workTitle: "사업장 및 위험 요소 정보",
    narrative: (answers, region) =>
      `노동자는 ${region} 지역 사업장에서 기계, 보호장비, 유해물질, 온도, 작업환경 등과 관련한 안전 위험을 진술하였습니다. ` +
      `상담사는 이미 사고 또는 아차사고가 있었는지, 관리자에게 알렸는지, 사진이나 영상 등 안전하게 확보 가능한 증거가 있는지 확인해 주시기 바랍니다. ` +
      `${answers[2] || "구체적인 안전 위험 내용은 상담 과정에서 추가 확인이 필요합니다."}`,
  },
};

export default function App({ useConvex: _useConvex = false }: AppProps) {
  const [route, setRoute] = useState(() => getRouteFromHash());

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (route === "admin") {
    return <AdminPage />;
  }

  if (route === "how-it-works") {
    return <HowItWorksPage />;
  }

  return <WorkerSite />;
}

function getRouteFromHash(): Route {
  const route = window.location.hash.replace("#/", "");
  return route === "admin" || route === "how-it-works" ? route : "home";
}

function WorkerSite() {
  const [language, setLanguage] = useState<LanguageCode>(() => getSavedLanguage());
  const [selectedIssue, setSelectedIssue] = useState("wages");
  const [isPdfReady, setIsPdfReady] = useState(false);
  const [completedIntake, setCompletedIntake] = useState<CompletedIntake | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [triageSearch, setTriageSearch] = useState("");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(
    () => localStorage.getItem("linkup-language-selected") !== "true",
  );
  const text = copy[language];
  const discoveryText = triageDiscoveryCopy[language];
  const normalizedTriageSearch = triageSearch.trim().toLowerCase();
  const filteredSituations = situations.filter((situation) => {
    const searchText = `${situation.label[language]} ${situation.detail[language]} ${situation.label.en} ${situation.detail.en} ${situationSearchTerms[situation.id] ?? ""}`.toLowerCase();
    return searchText.includes(normalizedTriageSearch);
  });
  const suggestedSituations = normalizedTriageSearch ? filteredSituations.slice(0, 3) : [];
  const popularSituations = situations.slice(0, 3);
  const selectedSituation = useMemo(
    () =>
      situations.find((situation) => situation.id === selectedIssue) ?? situations[0],
    [selectedIssue],
  );

  useEffect(() => {
    window.linkupTranslateToKorean = translateWithFreeApi;
    return () => {
      delete window.linkupTranslateToKorean;
    };
  }, []);

  const chooseLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    localStorage.setItem("linkup-language", nextLanguage);
    localStorage.setItem("linkup-language-selected", "true");
    setShowLanguageModal(false);
    setIsLanguageMenuOpen(false);
  };

  return (
    <main className="site-shell" lang={language}>
      {showLanguageModal ? (
        <LanguageChoiceModal selectedLanguage={language} onSelect={chooseLanguage} />
      ) : null}
      <header className="site-nav">
        <a className="brand-link" href="#top" aria-label="LinkUP home">
          <img alt="LinkUP" className="brand-logo" src="/linkup-wordmark.png" />
        </a>
        <nav aria-label="Primary navigation">
          <LanguageSelector
            isOpen={isLanguageMenuOpen}
            onSelect={chooseLanguage}
            onToggle={() => setIsLanguageMenuOpen((current) => !current)}
            selectedLanguage={language}
          />
          <a href="#/how-it-works">{text.howThisWorks}</a>
          <a href="#/admin">NGO Admin</a>
        </nav>
      </header>

      <section className="worker-hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Safe multilingual triage</p>
          <h1>{text.heroTitle}</h1>
          <p>{text.support}</p>
          <div className="trust-strip" aria-label="LinkUP privacy and output highlights">
            <span>{text.localOnlyLabel}</span>
            <span>{text.pdfOutputLabel}</span>
          </div>
        </div>

      </section>

      <section className="product-workspace" aria-label="LinkUP intake workspace">
        <section className="triage-panel-section" aria-label="Triage choices">
          <div className="triage-panel">
            <div className="triage-panel-topbar">
              <p className="directory-label">Start here</p>
              <div className="product-status-row" aria-label="Current intake status">
                <span>{text.pdfOutputLabel}</span>
                <span>{text.localOnlyLabel}</span>
              </div>
            </div>
            <h2>{text.triagePanelTitle}</h2>
            <p className="triage-search-hint">{discoveryText.searchHint}</p>
            <label className="triage-search">
              <Search size={25} />
              <input
                onChange={(event: { currentTarget: HTMLInputElement }) => setTriageSearch(event.currentTarget.value)}
                placeholder={text.searchPlaceholder}
                type="search"
                value={triageSearch}
              />
            </label>
            {!normalizedTriageSearch ? (
              <div className="popular-situations">
                <p>{discoveryText.popular}</p>
                <div className="popular-situation-list">
                  {popularSituations.map(({ icon: Icon, id, label }) => (
                    <button
                      className={selectedIssue === id ? "selected" : ""}
                      key={id}
                      onClick={() => {
                        setSelectedIssue(id);
                        setIsPdfReady(false);
                        setCompletedIntake(null);
                      }}
                      type="button"
                    >
                      <Icon size={17} />
                      <span>{label[language]}</span>
                      {selectedIssue === id ? <CheckCircle2 size={15} /> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="triage-recommendations" aria-live="polite">
                <div className="recommendation-heading">
                  <p>{discoveryText.results}</p>
                  <span>{suggestedSituations.length}</span>
                </div>
                {suggestedSituations.length ? (
                  <div className="situation-grid">
                    {suggestedSituations.map(({ detail, icon: Icon, id, label, tone }, index) => (
                      <button
                        className={`situation-button ${tone} ${selectedIssue === id ? "selected" : ""}`}
                        key={id}
                        onClick={() => {
                          setSelectedIssue(id);
                          setIsPdfReady(false);
                          setCompletedIntake(null);
                        }}
                        type="button"
                      >
                        <span className="situation-number">{String(index + 1).padStart(2, "0")}</span>
                        <span className="situation-mark">
                          <Icon size={23} />
                        </span>
                        <strong>{label[language]}</strong>
                        <small>{detail[language]}</small>
                        <span className="situation-row-end" aria-hidden="true">
                          {selectedIssue === id ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="triage-no-results">{discoveryText.noResults}</p>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="workflow-section" id="intake">
          <div className="intake-sticky-summary">
            <strong>{selectedSituation.label[language]}</strong>
            <span>{text.stepOf(1, 5)}</span>
            <span>{text.localOnlyLabel}</span>
          </div>
          <div className="section-heading">
            <p className="eyebrow">{text.intakeEyebrow}</p>
            <h2>{text.intakeHeading}</h2>
          </div>
          <div className={`workflow-grid ${isPdfReady ? "with-pdf" : "intake-only"}`}>
            <IntakeCard
              language={language}
              onPdfReady={(intake) => {
                setCompletedIntake(intake);
                setIsPdfReady(true);
              }}
              onPdfReset={() => {
                setIsPdfReady(false);
                setCompletedIntake(null);
              }}
              resetToken={resetToken}
              selectedSituation={selectedSituation}
            />
            {isPdfReady && completedIntake ? (
              <PdfDownloadPanel
                intake={completedIntake}
                onCompleted={() => {
                  setCompletedIntake(null);
                  setIsPdfReady(false);
                  setResetToken((current) => current + 1);
                }}
              />
            ) : null}
          </div>
        </section>
      </section>
      <section className="worker-legal-notice" aria-label="Privacy and legal notice">
        <p>{text.legalNotice}</p>
      </section>
    </main>
  );
}

function getSavedLanguage(): LanguageCode {
  const savedLanguage = localStorage.getItem("linkup-language");
  return savedLanguage === "en" || savedLanguage === "ko" || savedLanguage === "vi" || savedLanguage === "th"
    ? savedLanguage
    : "en";
}

function LanguageSelector({
  isOpen,
  onSelect,
  onToggle,
  selectedLanguage,
}: {
  isOpen: boolean;
  onSelect: (language: LanguageCode) => void;
  onToggle: () => void;
  selectedLanguage: LanguageCode;
}) {
  const selected = languages.find((item) => item.code === selectedLanguage) ?? languages[0];

  return (
    <div className="language-picker">
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="language-current"
        onClick={onToggle}
        type="button"
      >
        <img alt="" aria-hidden="true" className="language-flag-img" src={selected.flagSrc} />
        <span>{selected.label}</span>
        <ChevronDown size={17} />
      </button>
      {isOpen ? (
        <div className="language-menu" role="listbox" aria-label="Choose interface language">
          {languages.map((item) => (
            <button
              aria-selected={item.code === selectedLanguage}
              className={item.code === selectedLanguage ? "selected" : ""}
              key={item.code}
              onClick={() => onSelect(item.code)}
              role="option"
              type="button"
            >
              <img alt="" aria-hidden="true" className="language-flag-img" src={item.flagSrc} />
              <span>{item.label}</span>
              <small>{item.shortLabel}</small>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LanguageChoiceModal({
  onSelect,
  selectedLanguage,
}: {
  onSelect: (language: LanguageCode) => void;
  selectedLanguage: LanguageCode;
}) {
  return (
    <div className="language-modal-backdrop" role="presentation">
      <section className="language-modal" aria-labelledby="language-modal-title" role="dialog" aria-modal="true">
        <p className="eyebrow">Welcome to LinkUP</p>
        <h2 id="language-modal-title">Choose your language</h2>
        <p>This helps LinkUP show questions and guidance in the language that feels safest for you.</p>
        <div className="language-modal-grid">
          {languages.map((item) => (
            <button
              className={item.code === selectedLanguage ? "selected" : ""}
              key={item.code}
              onClick={() => onSelect(item.code)}
              type="button"
            >
              <img alt="" aria-hidden="true" className="language-flag-img" src={item.flagSrc} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function HowItWorksPage() {
  const selectedLanguage = getSavedLanguage();
  const text = copy[selectedLanguage];
  const pageText = howPageCopy[selectedLanguage];
  const [pathwayStep, setPathwayStep] = useState(0);
  const steps = pageText.steps.map((step, index) => ({
    ...step,
    icon: [Globe2, CheckCircle2, Download, MapPinned][index] ?? CheckCircle2,
  }));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPathwayStep((current) => (current + 1) % text.pathwaySteps.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [text.pathwaySteps.length]);

  return (
    <main className="site-shell how-page" lang={selectedLanguage}>
      <header className="site-nav">
        <a className="brand-link" href="#/" aria-label="LinkUP worker site">
          <img alt="LinkUP" className="brand-logo" src="/linkup-wordmark.png" />
        </a>
        <nav aria-label="Primary navigation">
          <a href="#/">{pageText.backToWorker}</a>
          <a href="#/admin">NGO Admin</a>
        </nav>
      </header>

      <section className="how-hero" aria-labelledby="how-title">
        <p className="eyebrow">{pageText.eyebrow}</p>
        <h1 id="how-title">{pageText.heroTitle}</h1>
        <p>{pageText.heroBody}</p>
      </section>

      <section className="how-pathway-section" aria-label={pageText.ariaPathway}>
        <div className="support-pathway">
          <div className="pathway-header">
            <strong>{text.pathwayTitle}</strong>
          </div>
          <div className="pathway-carousel" aria-live="polite" aria-label={text.pathwayTitle}>
            {text.pathwaySteps.map((step, index) => {
              const StepIcon = [Globe2, CheckCircle2, Download, MapPinned][index] ?? CheckCircle2;
              return (
                <article
                  className={`pathway-step ${pathwayStep === index ? "active" : ""}`}
                  key={step}
                  aria-hidden={pathwayStep !== index}
                >
                  <span className="pathway-number">{index + 1}</span>
                  <span className="pathway-icon">
                    <StepIcon size={28} />
                  </span>
                  <span>{step}</span>
                </article>
              );
            })}
            <div className="pathway-controls" aria-label="Choose support step">
              {text.pathwaySteps.map((step, index) => (
                <button
                  className={pathwayStep === index ? "active" : ""}
                  key={step}
                  onClick={() => setPathwayStep(index)}
                  type="button"
                  aria-label={step}
                >
                  <span>{index + 1}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="pathway-note">
            <CheckCircle2 size={18} />
            <span>{text.legalNotice}</span>
          </div>
        </div>
      </section>

      <section className="how-card-grid" aria-label={pageText.ariaSteps}>
        {steps.map(({ body, icon: Icon, title }) => (
          <article className="how-step-card" key={title}>
            <span>
              <Icon size={26} />
            </span>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      <section className="how-detail-panel" aria-label={pageText.detailTitle}>
        <h2>{pageText.detailTitle}</h2>
        <p>{pageText.detailBodyOne}</p>
        <p>{pageText.detailBodyTwo}</p>
      </section>
    </main>
  );
}

function IntakeCard({
  language,
  onPdfReady,
  onPdfReset,
  resetToken,
  selectedSituation,
}: {
  language: LanguageCode;
  onPdfReady: (intake: CompletedIntake) => void;
  onPdfReset: () => void;
  resetToken: number;
  selectedSituation: Situation;
}) {
  const text = copy[language];
  const scenarioQuestionSet =
    selectedSituation.id === "wages"
      ? unpaidWagesPetitionQuestions
      : scenarioQuestions[selectedSituation.id] ?? scenarioQuestions.wages;
  const metadata = questionMeta[selectedSituation.id] ?? questionMeta.wages;
  const baseQuestions = scenarioQuestionSet[language] ?? scenarioQuestionSet.en;
  const questions = [text.regionLabel, ...baseQuestions];
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => Array(baseQuestions.length).fill(""));
  const [attachments, setAttachments] = useState<Record<number, UploadedFile[]>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({});
  const [isReviewing, setIsReviewing] = useState(false);
  const [region, setRegion] = useState("");
  const [subregion, setSubregion] = useState("");
  const [ttsStatus, setTtsStatus] = useState("");
  const answerIndex = questionIndex - 1;
  const isRegionStep = questionIndex === 0;
  const currentAnswer = isRegionStep ? "" : answers[answerIndex] ?? "";
  const currentSelectedOptions = isRegionStep ? [] : selectedOptions[answerIndex] ?? [];
  const currentMeta = isRegionStep ? undefined : metadata[answerIndex];
  const currentOptions = isRegionStep
    ? []
    : getQuestionOptions(selectedSituation.id, answerIndex, language, currentMeta);
  const currentFiles = isRegionStep ? [] : attachments[answerIndex] ?? [];
  const selectedRegionGroup = regionGroups.find((item) => item.label === region);
  const completedRegion = region ? (subregion ? `${region} ${subregion}` : region) : "지역 미선택";
  const displayRegionsInEnglish = language !== "ko";

  useEffect(() => {
    setQuestionIndex(0);
    setAnswers(Array(baseQuestions.length).fill(""));
    setAttachments({});
    setSelectedOptions({});
    setIsReviewing(false);
    setRegion("");
    setSubregion("");
    setTtsStatus("");
    onPdfReset();
  }, [selectedSituation, resetToken]);

  useEffect(() => {
    setTtsStatus("");
  }, [language, questionIndex]);

  const continueToOutput = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      onPdfReset();
      return;
    }
    setIsReviewing(true);
  };

  const createPdfFromReview = () => {
    const completed = {
      answers,
      attachments,
      issueId: selectedSituation.id,
      language,
      region: completedRegion,
      selectedOptions,
    };
    onPdfReady(completed);
    void submitIntakeToConvex(completed).catch((error) => {
      console.warn("LinkUP submission was not saved.", error);
    });
    window.location.hash = "output";
  };

  const goBack = () => {
    setQuestionIndex((current) => Math.max(0, current - 1));
    setIsReviewing(false);
    onPdfReset();
  };

  const toggleOption = (option: string) => {
    const nextSelected = currentSelectedOptions.includes(option)
      ? currentSelectedOptions.filter((item) => item !== option)
      : [...currentSelectedOptions, option];
    setSelectedOptions((current) => ({
      ...current,
      [answerIndex]: nextSelected,
    }));
    onPdfReset();
  };

  const updateFiles = async (fileList: FileList | null) => {
    if (answerIndex < 0) {
      return;
    }

    const files = fileList ? [...fileList] : [];
    const mapped = await Promise.all(files.map(fileToUploadedFile));
    setAttachments((current) => ({
      ...current,
      [answerIndex]: mapped,
    }));
    onPdfReset();
  };

  const updateAnswer = (value: string) => {
    if (answerIndex < 0) {
      return;
    }

    setAnswers((current) => {
      const next = [...current];
      next[answerIndex] = value;
      return next;
    });
    onPdfReset();
  };

  return (
    <section className="intake-card">
      <div className="progress-header">
        <span>{isReviewing ? text.reviewTitle : text.stepOf(questionIndex + 1, questions.length)}</span>
        <strong>{selectedSituation.label[language]}</strong>
        <div className="progress-track" aria-hidden="true">
          <span
            style={{
              "--progress": `${isReviewing ? 100 : ((questionIndex + 1) / questions.length) * 100}%`,
            } as CSSProperties}
          />
        </div>
      </div>
      {isReviewing ? (
        <div className="review-panel">
          <div className="question-card" aria-labelledby="review-title">
            <FileText size={24} />
            <span className="issue-context">{selectedSituation.label[language]}</span>
            <h3 id="review-title">{text.reviewTitle}</h3>
            <p>{text.reviewHelp}</p>
          </div>
          <div className="review-list">
            {baseQuestions.map((question, index) => (
              <article className="review-item" key={question}>
                <div>
                  <span>{text.stepOf(index + 2, questions.length)}</span>
                  <h4>{question}</h4>
                  <p>{answers[index]?.trim() || text.notAnswered}</p>
                  {selectedOptions[index]?.length ? (
                    <p className="review-files">
                      {selectedOptions[index].join(", ")}
                    </p>
                  ) : null}
                  {attachments[index]?.length ? (
                    <p className="review-files">
                      첨부: {attachments[index].map((file) => file.name).join(", ")}
                    </p>
                  ) : null}
                </div>
                <button
                  className="review-edit-button"
                  onClick={() => {
                    setQuestionIndex(index + 1);
                    setIsReviewing(false);
                    onPdfReset();
                  }}
                  type="button"
                >
                  {text.editAnswer}
                </button>
              </article>
            ))}
          </div>
          <div className="wizard-actions">
            <button
              className="secondary-action"
              onClick={() => {
                setQuestionIndex(questions.length - 1);
                setIsReviewing(false);
                onPdfReset();
              }}
              type="button"
            >
              {text.back}
            </button>
            <button className="primary-action" onClick={createPdfFromReview} type="button">
              {text.createPdf}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <>
      <div className="question-card" aria-labelledby="payday-question">
        <BriefcaseBusiness size={24} />
        <span className="issue-context">{selectedSituation.label[language]}</span>
        <h3 id="payday-question">{questions[questionIndex]}</h3>
        <button
          className="tts-button"
          onClick={() => {
            void speakQuestion(questions[questionIndex], language).then((result) => {
              setTtsStatus(result === "playing" ? text.ttsPlaying : text.ttsMissing);
            });
          }}
          type="button"
        >
          <Volume2 size={17} />
          {text.readQuestion}
        </button>
        {ttsStatus ? (
          <p className="tts-status" aria-live="polite">
            {ttsStatus}
          </p>
        ) : null}
      </div>
      {currentOptions.length ? (
        <div className="mcq-group" aria-label="선택지">
          {currentOptions.map((option) => (
            <label className="mcq-option" key={option}>
              <input
                checked={currentSelectedOptions.includes(option)}
                onChange={() => toggleOption(option)}
                type="checkbox"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      ) : null}
      <div className="field-stack">
        {isRegionStep ? (
          <>
            <label className="input-label">
              <span>{text.regionLabel}</span>
              <select
                onChange={(event: { currentTarget: HTMLSelectElement }) => {
                  setRegion(event.currentTarget.value);
                  setSubregion("");
                  onPdfReset();
                }}
                value={region}
              >
                <option value="">{text.regionParentPlaceholder}</option>
                {regionGroups.map((item) => (
                  <option key={item.label} value={item.label}>
                    {displayRegionsInEnglish ? item.labelEn : item.label}
                  </option>
                ))}
              </select>
            </label>
            {selectedRegionGroup ? (
              <label className="input-label subregion-field">
                <span>{text.subregionLabel}</span>
                <select
                  onChange={(event: { currentTarget: HTMLSelectElement }) => {
                    setSubregion(event.currentTarget.value);
                    onPdfReset();
                  }}
                  value={subregion}
                >
                  <option value="">{text.subregionPlaceholder}</option>
                  {selectedRegionGroup.cities.map((city, index) => (
                    <option key={city} value={city}>
                      {displayRegionsInEnglish ? selectedRegionGroup.citiesEn[index] ?? city : city}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </>
        ) : (
          <label className="input-label">
            <span>{text.answerLabel}</span>
            <textarea
              onChange={(event: { currentTarget: HTMLTextAreaElement }) =>
                updateAnswer(event.currentTarget.value)
              }
              placeholder={text.answerPlaceholder}
              value={currentAnswer}
            />
          </label>
        )}
        {currentMeta?.allowUpload ? (
          <label className="input-label upload-label">
            <span>증거 파일 업로드</span>
            <input
              accept="image/*,.pdf"
              multiple
              onChange={(event: { currentTarget: HTMLInputElement }) => updateFiles(event.currentTarget.files)}
              type="file"
            />
            {currentFiles.length ? (
              <small>{currentFiles.map((file) => file.name).join(", ")}</small>
            ) : (
              <small>사진, PDF 등 상담사가 확인할 수 있는 파일을 올릴 수 있습니다.</small>
            )}
          </label>
        ) : null}
      </div>
      <div className="intake-confirmation" aria-live="polite">
        <CheckCircle2 size={17} />
        <span>
          {isRegionStep
            ? region
              ? text.answerSaved
              : text.answerPending
            : currentAnswer || currentSelectedOptions.length
              ? text.answerSaved
              : text.answerPending}
        </span>
      </div>
      <div className="wizard-actions">
        <button
          className="secondary-action"
          disabled={questionIndex === 0}
          onClick={goBack}
          type="button"
        >
          {text.back}
        </button>
        <button className="primary-action" onClick={continueToOutput} type="button">
          {questionIndex === questions.length - 1 ? text.reviewButton : text.continue}
          <ArrowRight size={18} />
        </button>
      </div>
        </>
      )}
    </section>
  );
}

function PdfDownloadPanel({
  intake,
  onCompleted,
}: {
  intake: CompletedIntake;
  onCompleted: () => void;
}) {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleDownload = async () => {
    setIsTranslating(true);
    try {
      await downloadCounselorPdf(intake);
      onCompleted();
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <section className="pdf-ready-panel" id="output" aria-labelledby="pdf-ready-title">
      <span className="pdf-ready-icon">
        <FileText size={30} />
      </span>
      <p className="eyebrow">Ready for counselor review</p>
      <h2 id="pdf-ready-title">Your PDF is ready</h2>
      <p>
        Download the counselor packet and share it with a trusted NGO staff member.
      </p>
      <p className="privacy-note">
        Zero retention: personal answers stay only in this browser until the PDF is downloaded or the tab is closed.
        Only anonymous category, region, and language counts are sent to the dashboard.
      </p>
      <button className="download-button" disabled={isTranslating} onClick={handleDownload} type="button">
        <Download size={19} />
        {isTranslating ? "Preparing Korean PDF..." : "Download PDF for NGO Counselor"}
      </button>
    </section>
  );
}

async function downloadCounselorPdf(intake: CompletedIntake) {
  if (intake.issueId === "wages") {
    await downloadUnpaidWagesPetitionPdf(intake);
    return;
  }

  await downloadScenarioCounselorPdf(intake);
  return;

  const situation = situations.find((item) => item.id === intake.issueId) ?? situations[0];
  const baseKoreanQuestions = scenarioQuestions[intake.issueId]?.ko ?? scenarioQuestions.wages.ko;
  const koreanQuestions = baseKoreanQuestions.map((question, index) =>
    questionMeta[intake.issueId]?.[index]?.textKo ?? question,
  );
  const translatedAnswers = await Promise.all(
    intake.answers.map((answer) => translateAnswerToKorean(answer, intake.language)),
  );
  const allAttachments = Object.entries(intake.attachments).flatMap(([questionIndex, files]) =>
    files.map((file) => ({
      ...file,
      questionNumber: Number(questionIndex) + 1,
    })),
  );
  const answerLines = koreanQuestions.flatMap((question, index) => [
    `질문 ${index + 1}. ${question}`,
    `답변: ${translatedAnswers[index]}`,
    ...(intake.attachments[index]?.length
      ? [`첨부파일: ${intake.attachments[index].map((file) => file.name).join(", ")}`]
      : []),
    "",
  ]);
  const createdAt = new Date();
  const urgency = getUrgencyLabel(intake.issueId);
  const summaryRows = [
    ["시나리오", situation.label.ko],
    ["지역", intake.region],
    ["접수 일시", createdAt.toLocaleString("ko-KR")],
    ["긴급도", urgency],
    ["번역 언어", formatLanguageName(intake.language)],
  ];
  const lines = [
    "LinkUP 고용노동부 상담용 접수 자료",
    "노동자 응답 내용:",
    ...answerLines,
    "첨부자료 요약:",
    ...(allAttachments.length
      ? allAttachments.map((file) => `질문 ${file.questionNumber}: ${file.name}`)
      : ["첨부자료 없음"]),
    "",
    "상담사 요청사항:",
    "상담사는 노동자와 함께 위 응답 내용을 확인하고, 신원 및 증거자료를 검토한 뒤",
    "고용노동부 진정 또는 기타 지원 절차를 준비해 주시기 바랍니다.",
    "",
    "상담 기관명:",
    "[                                                        ]",
    "",
    "개인정보 안내: 신원 정보는 상담사 검토 전까지 숨김 처리됩니다.",
  ];
  const pdf = await createRasterPdf({
    attachmentImages: allAttachments.filter((file) => file.dataUrl),
    lines,
    summaryRows,
  });
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "linkup-korean-counselor-packet.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadScenarioCounselorPdf(intake: CompletedIntake) {
  const situation = situations.find((item) => item.id === intake.issueId) ?? situations[0];
  const config = scenarioDocumentConfig[intake.issueId] ?? scenarioDocumentConfig.contract;
  const translatedAnswers = await Promise.all(
    intake.answers.map((answer) => translateAnswerToKorean(answer, intake.language)),
  );
  const selectedEvidence = intake.selectedOptions[3] ?? [];
  const translatedEvidence = selectedEvidence.length
    ? await translateAnswerToKorean(selectedEvidence.join(", "), intake.language)
    : "선택된 증거 항목 없음";
  const allAttachments = Object.entries(intake.attachments).flatMap(([questionIndex, files]) =>
    files.map((file) => ({
      ...file,
      questionNumber: Number(questionIndex) + 1,
    })),
  );
  const attachmentSummary = allAttachments.length
    ? allAttachments.map((file) => `질문 ${file.questionNumber}: ${file.name}`)
    : ["첨부파일 없음"];
  const createdAt = new Date();
  const summaryRows = [
    ["문서 유형", config.documentType],
    ["시나리오", situation.label.ko],
    ["지역", intake.region],
    ["접수 일시", createdAt.toLocaleString("ko-KR")],
    ["번역 언어", formatLanguageName(intake.language)],
  ];
  const lines = [
    `LinkUP ${config.documentType}`,
    `1. ${config.partyTitle}`,
    `노동자 정보: ${translatedAnswers[0] || "미기재"}`,
    `사업장 지역: ${intake.region}`,
    "",
    `2. ${config.workTitle}`,
    `사업장/고용주 정보: ${translatedAnswers[1] || "미기재"}`,
    "",
    `3. ${config.detailTitle}`,
    config.narrative(translatedAnswers, intake.region),
    `노동자 진술 요약: ${translatedAnswers[2] || "미기재"}`,
    "",
    `4. ${config.evidenceTitle}`,
    `선택 항목: ${translatedEvidence}`,
    `추가 진술: ${translatedAnswers[3] || "미기재"}`,
    "첨부파일:",
    ...attachmentSummary,
    "",
    "상담사 확인 메모",
    "[                                                        ]",
    "",
    "상담 기관명:",
    "[                                                        ]",
    "",
    "개인정보 안내: 인적사항과 구체 답변은 PDF 생성을 위해 브라우저 메모리에만 임시 보관되며, 대시보드에는 익명화된 통계만 전송됩니다.",
    "법률 안내: 본 문서는 상담 및 접수 준비를 돕는 초안이며, 법률 자문 또는 법률서비스가 아닙니다.",
  ];
  const pdf = await createRasterPdf({
    attachmentImages: allAttachments.filter((file) => file.dataUrl),
    lines,
    summaryRows,
  });
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `linkup-${intake.issueId}-counselor-draft.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function downloadUnpaidWagesPetitionPdf(intake: CompletedIntake) {
  const translatedAnswers = await Promise.all(
    intake.answers.map((answer) => translateAnswerToKorean(answer, intake.language)),
  );
  const allAttachments = Object.entries(intake.attachments).flatMap(([questionIndex, files]) =>
    files.map((file) => ({
      ...file,
      questionNumber: Number(questionIndex) + 1,
    })),
  );
  const createdAt = new Date();
  const evidenceOptions = getQuestionOptions("wages", 3, intake.language, questionMeta.wages[3]);
  const selectedEvidence = intake.selectedOptions[3] ?? [];
  const evidenceRows = [
    { ko: "근로계약서", optionIndex: 0 },
    { ko: "통장 거래 내역 또는 급여 입금 내역", optionIndex: 1 },
    { ko: "출퇴근 기록 또는 근무시간 기록", optionIndex: 2 },
    { ko: "문자메시지 또는 카카오톡 대화", optionIndex: 3 },
  ].map((item) => {
    const localizedOption = evidenceOptions[item.optionIndex];
    const hasEvidence = localizedOption ? selectedEvidence.includes(localizedOption) : false;
    return `${hasEvidence ? "보유" : "미보유"} - ${item.ko}`;
  });
  const noEvidenceOption = evidenceOptions[4];
  const contractOptions = getQuestionOptions("wages", 2, intake.language, questionMeta.wages[2]);
  const selectedContract = intake.selectedOptions[2] ?? [];
  const contractStatus = selectedContract.length
    ? selectedContract
        .map((option) => {
          const index = contractOptions.indexOf(option);
          return ["근로계약서 보유", "근로계약서 미보유", "근로계약서 보유 여부 불명"][index] ?? option;
        })
        .join(", ")
    : "미기재";
  const attachmentSummary = allAttachments.length
    ? allAttachments.map((file) => `질문 ${file.questionNumber}: ${file.name}`)
    : ["첨부파일 없음"];

  const workerDetails = translatedAnswers[0] || "미기재";
  const workplaceDetails = translatedAnswers[1] || "미기재";
  const employmentDetails = translatedAnswers[2] || "미기재";
  const delinquencyDetails = translatedAnswers[3] || "미기재";
  const narrative =
    `위 진정인은 위 사업장에서 근무하였고, 아래 체불 내용에 해당하는 임금, 연장근로수당, 퇴직금 등 금품을 현재까지 지급받지 못하였다고 진술합니다. ` +
    `구체적인 근무 기간 및 체불 기간, 금액은 노동자가 제공한 답변을 바탕으로 아래와 같이 정리하였으며, 상담사는 원자료와 증거자료를 확인한 뒤 고용노동부 진정 절차를 준비해 주시기 바랍니다.`;

  const summaryRows = [
    ["문서 유형", "임금체불 진정서 초안"],
    ["지역", intake.region],
    ["접수 일시", createdAt.toLocaleString("ko-KR")],
    ["번역 언어", formatLanguageName(intake.language)],
    ["개인정보 보관", "PDF 생성 후 브라우저 메모리에서 삭제"],
  ];
  const lines = [
    "LinkUP 고용노동부 상담용 임금체불 진정서 초안",
    "1. 인적사항",
    `노동자 정보: ${workerDetails}`,
    `사업장 및 고용주 정보: ${workplaceDetails}`,
    `사업장 지역: ${intake.region}`,
    "",
    "2. 근로 형태",
    `근무 기간 및 근로 형태: ${employmentDetails}`,
    `근로계약서 여부: ${contractStatus}`,
    "",
    "3. 체불 경위",
    narrative,
    `노동자 진술 요약: ${delinquencyDetails}`,
    "",
    "4. 증거 자료 목록",
    ...(noEvidenceOption && selectedEvidence.includes(noEvidenceOption)
      ? ["노동자는 현재 보유한 증거자료가 없다고 선택했습니다."]
      : evidenceRows),
    "첨부파일:",
    ...attachmentSummary,
    "",
    "상담 기관명:",
    "[                                                        ]",
    "",
    "개인정보 안내: 위 인적사항 및 구체 답변은 PDF 생성을 위해 브라우저 메모리에만 임시 보관되며, 대시보드에는 익명화된 통계만 전송됩니다.",
    "법률 안내: 본 문서는 상담 및 접수 준비를 돕는 초안이며, 법률 자문 또는 법률서비스가 아닙니다.",
  ];

  const pdf = await createRasterPdf({
    attachmentImages: allAttachments.filter((file) => file.dataUrl),
    lines,
    summaryRows,
  });
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "linkup-unpaid-wages-moel-draft.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function translateAnswerToKorean(answer: string, sourceLanguage: LanguageCode) {
  const trimmed = answer.trim();
  if (!trimmed) {
    return "응답 없음";
  }

  if (containsHangul(trimmed)) {
    return trimmed;
  }

  if (window.linkupTranslateToKorean) {
    try {
      const translation = await window.linkupTranslateToKorean(trimmed, sourceLanguage);
      if (typeof translation === "string" && translation.trim()) {
        return translation.trim();
      }
    } catch (error) {
      console.warn("LinkUP answer translation failed.", error);
    }
  }

  try {
    const directTranslation = await translateWithMyMemoryDirect(trimmed, sourceLanguage);
    if (directTranslation.trim()) {
      return directTranslation.trim();
    }
  } catch (error) {
    console.warn("LinkUP direct translation fallback failed.", error);
  }

  return `자동번역 실패 - 원문/${sourceLanguage}: ${trimmed}`;
}

function getUrgencyLabel(issueId: string) {
  if (issueId === "medical" || issueId === "safety") {
    return "높음";
  }

  if (issueId === "housing") {
    return "중간-높음";
  }

  return "일반";
}

function containsHangul(text: string) {
  return /[가-힣]/.test(text);
}

function getQuestionOptions(
  issueId: string,
  questionIndex: number,
  language: LanguageCode,
  meta?: QuestionMeta,
) {
  if (language === "ko") {
    return meta?.optionsKo ?? [];
  }

  return localizedQuestionOptions[issueId]?.[questionIndex]?.[language] ?? [];
}

function splitSelectedOptions(answer: string) {
  return answer
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function fileToUploadedFile(file: File): Promise<UploadedFile> {
  if (!file.type.startsWith("image/")) {
    return {
      name: file.name,
      type: file.type || "application/octet-stream",
    };
  }

  return {
    dataUrl: await readFileAsDataUrl(file),
    name: file.name,
    type: file.type,
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function speakQuestion(question: string, language: LanguageCode): Promise<"missing" | "playing"> {
  stopActiveTts();

  const browserPlayed = await speakQuestionWithBrowserVoice(question, language);
  if (browserPlayed) {
    return "playing";
  }

  const fallbackPlayed = await playRemoteQuestionAudio(question, language);
  return fallbackPlayed ? "playing" : "missing";
}

function stopActiveTts() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (activeTtsAudio) {
    activeTtsAudio.pause();
    activeTtsAudio = null;
  }
}

async function speakQuestionWithBrowserVoice(question: string, language: LanguageCode) {
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    return false;
  }

  const targetLang = getTtsLanguageTag(language);
  const voices = await loadSpeechVoices();
  const voice = chooseSpeechVoice(voices, targetLang);

  return new Promise<boolean>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(question);
    let didResolve = false;
    const resolveOnce = (result: boolean) => {
      if (!didResolve) {
        didResolve = true;
        resolve(result);
      }
    };

    utterance.lang = targetLang;
    utterance.rate = language === "th" ? 0.82 : language === "vi" ? 0.88 : 0.92;
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onstart = () => resolveOnce(true);
    utterance.onerror = () => resolveOnce(false);
    utterance.onend = () => resolveOnce(true);
    window.speechSynthesis.speak(utterance);
    window.setTimeout(() => resolveOnce(false), 1800);
  });
}

function loadSpeechVoices() {
  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      resolve(voices);
      return;
    }

    const timeout = window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 900);
    window.speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timeout);
      resolve(window.speechSynthesis.getVoices());
    };
  });
}

function chooseSpeechVoice(voices: SpeechSynthesisVoice[], targetLang: string) {
  const target = targetLang.toLowerCase();
  const base = target.split("-")[0];
  return (
    voices.find((voice) => voice.lang.toLowerCase() === target) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(`${base}-`)) ??
    voices.find((voice) => voice.name.toLowerCase().includes(base))
  );
}

async function playRemoteQuestionAudio(question: string, language: LanguageCode) {
  if (typeof Audio === "undefined") {
    return false;
  }

  const targetLang = getTtsLanguageTag(language).split("-")[0];
  const fullTargetLang = getTtsLanguageTag(language);
  const text = question.slice(0, 180);
  const sources = [
    convexSiteUrl
      ? `${convexSiteUrl}/question-tts?language=${targetLang}&text=${encodeURIComponent(text)}`
      : "",
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${fullTargetLang}&q=${encodeURIComponent(text)}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${targetLang}&q=${encodeURIComponent(text)}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${fullTargetLang}&q=${encodeURIComponent(text)}`,
    `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${targetLang}&q=${encodeURIComponent(text)}`,
  ].filter(Boolean);

  for (const sourceUrl of sources) {
    const played = await playAudioSource(sourceUrl);
    if (played) {
      return true;
    }
  }

  return false;
}

function playAudioSource(sourceUrl: string) {
  return new Promise<boolean>((resolve) => {
    const audio = new Audio(sourceUrl);
    let settled = false;
    const timeout = window.setTimeout(() => finish(false), 5000);
    const finish = (result: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeout);
      resolve(result);
    };

    audio.preload = "auto";
    audio.addEventListener("playing", () => finish(true), { once: true });
    audio.addEventListener("error", () => finish(false), { once: true });
    audio.addEventListener("stalled", () => finish(false), { once: true });
    activeTtsAudio = audio;
    audio.play().catch(() => finish(false));
  });
}

function getTtsLanguageTag(language: LanguageCode) {
  return {
    en: "en-US",
    ko: "ko-KR",
    th: "th-TH",
    vi: "vi-VN",
  }[language];
}

async function translateWithFreeApi(text: string, sourceLanguage: LanguageCode = "en") {
  if (!convexSiteUrl) {
    throw new Error("VITE_CONVEX_SITE_URL is not configured.");
  }

  const response = await fetch(`${convexSiteUrl}/translate-to-korean`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sourceLanguage, text }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Translation failed.");
  }

  if (typeof data.translation !== "string") {
    throw new Error("Translation response was invalid.");
  }

  return data.translation;
}

async function translateWithMyMemoryDirect(text: string, sourceLanguage: LanguageCode = "en") {
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text.slice(0, 450));
  url.searchParams.set("langpair", `${normalizeTranslationSource(sourceLanguage)}|ko`);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok || !isRecord(data) || !isRecord(data.responseData)) {
    throw new Error("Direct translation failed.");
  }

  const translatedText = data.responseData.translatedText;
  if (typeof translatedText !== "string") {
    throw new Error("Direct translation response was invalid.");
  }

  return translatedText;
}

function normalizeTranslationSource(sourceLanguage: LanguageCode) {
  return sourceLanguage === "vi" || sourceLanguage === "th" || sourceLanguage === "en"
    ? sourceLanguage
    : "en";
}

async function submitIntakeToConvex(intake: CompletedIntake) {
  if (!convexSiteUrl) {
    return;
  }

  const situation = situations.find((item) => item.id === intake.issueId) ?? situations[0];
  const response = await fetch(`${convexSiteUrl}/submit-intake`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      issueId: intake.issueId,
      issueLabel: situation.label.en,
      language: intake.language,
      region: intake.region,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.warn("LinkUP submission was not saved.", data);
  }
}

async function fetchAdminStats(): Promise<AdminStats> {
  if (!convexSiteUrl) {
    return emptyAdminStats;
  }

  const response = await fetch(`${convexSiteUrl}/admin-stats`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not load admin stats.");
  }

  return normalizeAdminStats(data);
}

async function resetSavedSubmissions() {
  if (!convexSiteUrl) {
    return 0;
  }

  const response = await fetch(`${convexSiteUrl}/reset-submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ adminCode: ADMIN_CODE }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Could not reset responses.");
  }

  return typeof data.deleted === "number" ? data.deleted : 0;
}

function normalizeAdminStats(data: unknown): AdminStats {
  if (!isRecord(data)) {
    return emptyAdminStats;
  }

  return {
    categoryCounts: normalizeCounts(data.categoryCounts),
    languageCounts: normalizeCounts(data.languageCounts),
    regionCounts: normalizeCounts(data.regionCounts),
    trendSeries: normalizeTrendSeries(data.trendSeries),
    total: typeof data.total === "number" ? data.total : 0,
  };
}

function normalizeCounts(value: unknown): CountItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      count: typeof item.count === "number" ? item.count : 0,
      label: typeof item.label === "string" ? item.label : "Unknown",
    }))
    .filter((item) => item.count > 0);
}

function normalizeTrendSeries(value: unknown): TrendSeries[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      label: typeof item.label === "string" ? item.label : "Unknown",
      points: Array.isArray(item.points)
        ? item.points.map((point) => (typeof point === "number" ? point : 0))
        : [],
    }))
    .filter((item) => item.points.length > 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function createRasterPdf({
  attachmentImages,
  lines,
  summaryRows,
}: {
  attachmentImages: Array<UploadedFile & { questionNumber: number }>;
  lines: string[];
  summaryRows: string[][];
}) {
  const pageWidth = 1240;
  const pageHeight = 1754;
  const margin = 96;
  const lineHeight = 34;
  const wrappedLines = lines.flatMap((line) => wrapPdfLine(line, 52));
  const pages: Uint8Array[] = [];

  for (let start = 0; start < wrappedLines.length; start += start === 0 ? 28 : 42) {
    const pageLines = wrappedLines.slice(start, start + (start === 0 ? 28 : 42));
    const canvas = document.createElement("canvas");
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create PDF canvas.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageWidth, pageHeight);
    context.fillStyle = "#10224c";
    context.font = "700 34px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
    context.fillText(pageLines[0] ?? "LinkUP", margin, 112);
    context.strokeStyle = "#dbeafe";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(margin, 148);
    context.lineTo(pageWidth - margin, 148);
    context.stroke();

    if (start === 0) {
      drawSummaryTable(context, summaryRows, margin, 176, pageWidth - margin * 2);
    }

    context.fillStyle = "#172033";
    pageLines.slice(1).forEach((line, index) => {
      const y = (start === 0 ? 540 : 204) + index * lineHeight;
      if (line.startsWith("질문 ")) {
        context.font = "700 23px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
        context.fillStyle = "#1e3a8a";
      } else if (line.startsWith("답변:")) {
        context.font = "400 23px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
        context.fillStyle = "#172033";
      } else if (line.startsWith("첨부파일:")) {
        context.font = "700 22px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
        context.fillStyle = "#047857";
      } else {
        context.font = "400 23px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
        context.fillStyle = "#334155";
      }
      context.fillText(line, margin, y);
    });

    const jpeg = canvas.toDataURL("image/jpeg", 0.92);
    pages.push(base64ToBytes(jpeg.split(",")[1] ?? ""));
  }

  for (const file of attachmentImages) {
    const image = await loadImage(file.dataUrl ?? "");
    const canvas = document.createElement("canvas");
    canvas.width = pageWidth;
    canvas.height = pageHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to create attachment PDF canvas.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageWidth, pageHeight);
    context.fillStyle = "#10224c";
    context.font = "700 32px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
    context.fillText(`첨부 이미지 - 질문 ${file.questionNumber}`, margin, 104);
    context.fillStyle = "#475569";
    context.font = "400 22px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
    context.fillText(file.name, margin, 140);
    drawImageFit(context, image, margin, 190, pageWidth - margin * 2, pageHeight - 280);

    const jpeg = canvas.toDataURL("image/jpeg", 0.92);
    pages.push(base64ToBytes(jpeg.split(",")[1] ?? ""));
  }

  return buildImagePdf(pages, pageWidth, pageHeight);
}

function drawSummaryTable(
  context: CanvasRenderingContext2D,
  rows: string[][],
  x: number,
  y: number,
  width: number,
) {
  const rowHeight = 46;
  const labelWidth = 190;

  context.fillStyle = "#eef6ff";
  context.fillRect(x, y, width, rowHeight);
  context.strokeStyle = "#bfdbfe";
  context.strokeRect(x, y, width, rowHeight);
  context.fillStyle = "#10224c";
  context.font = "700 24px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
  context.fillText("Executive Summary", x + 16, y + 31);

  rows.forEach(([label, value], index) => {
    const rowY = y + rowHeight * (index + 1);
    context.fillStyle = index % 2 === 0 ? "#ffffff" : "#f8fafc";
    context.fillRect(x, rowY, width, rowHeight);
    context.strokeStyle = "#dbeafe";
    context.strokeRect(x, rowY, width, rowHeight);
    context.fillStyle = "#1e3a8a";
    context.font = "700 21px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
    context.fillText(label, x + 16, rowY + 30);
    context.fillStyle = "#10224c";
    context.font = "700 21px 'Malgun Gothic', 'Apple SD Gothic Neo', Arial, sans-serif";
    context.fillText(value, x + labelWidth, rowY + 30);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load attachment image."));
    image.src = src;
  });
}

function drawImageFit(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number,
) {
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, x + (maxWidth - width) / 2, y, width, height);
}

function base64ToBytes(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function buildImagePdf(images: Uint8Array[], imageWidth: number, imageHeight: number) {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [0];
  let length = 0;
  const objectCount = 2 + images.length * 3;
  const pageObjectIds = images.map((_, index) => 3 + index * 3);

  const pushText = (text: string) => {
    const bytes = encoder.encode(text);
    chunks.push(bytes);
    length += bytes.length;
  };

  const pushBytes = (bytes: Uint8Array) => {
    chunks.push(bytes);
    length += bytes.length;
  };

  const addObject = (id: number, body: string | Uint8Array, suffix = "\n") => {
    offsets[id] = length;
    pushText(`${id} 0 obj\n`);
    if (typeof body === "string") {
      pushText(body);
    } else {
      pushBytes(body);
    }
    pushText(`${suffix}endobj\n`);
  };

  const addStreamObject = (id: number, dictionary: string, stream: Uint8Array) => {
    offsets[id] = length;
    pushText(`${id} 0 obj\n${dictionary}\nstream\n`);
    pushBytes(stream);
    pushText("\nendstream\nendobj\n");
  };

  pushText("%PDF-1.4\n");
  addObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  addObject(2, `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${images.length} >>`);

  images.forEach((image, index) => {
    const pageId = 3 + index * 3;
    const contentId = pageId + 1;
    const imageId = pageId + 2;
    addObject(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /XObject << /Im${index} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    const drawCommand = `q 612 0 0 792 0 0 cm /Im${index} Do Q`;
    addObject(contentId, `<< /Length ${drawCommand.length} >>\nstream\n${drawCommand}\nendstream`);
    addStreamObject(
      imageId,
      `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>`,
      image,
    );
  });

  const xrefOffset = length;
  pushText(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  for (let id = 1; id <= objectCount; id += 1) {
    pushText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const output = new Uint8Array(length);
  let position = 0;
  chunks.forEach((chunk) => {
    output.set(chunk, position);
    position += chunk.length;
  });
  return output;
}

function wrapPdfLine(line: string, maxLength = 82) {
  if (line.length <= maxLength) {
    return [line];
  }

  const words = line.split(" ");
  const wrapped: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength) {
      wrapped.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    wrapped.push(current);
  }

  return wrapped;
}

function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(() => localStorage.getItem("linkup-admin") === "true");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminStats>(emptyAdminStats);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const loadStats = async () => {
    setIsLoadingStats(true);
    setStatsError("");
    try {
      setStats(await fetchAdminStats());
    } catch (adminError) {
      setStatsError(adminError instanceof Error ? adminError.message : "Could not load admin stats.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      void loadStats();
    }
  }, [isAuthorized]);

  const submitCode = () => {
    if (code.trim() === ADMIN_CODE) {
      localStorage.setItem("linkup-admin", "true");
      setIsAuthorized(true);
      setError("");
      return;
    }
    setError("That access code is not recognized.");
  };

  const resetResponses = async () => {
    const confirmed = window.confirm("Reset all saved worker responses and admin charts?");
    if (!confirmed) {
      return;
    }

    setIsLoadingStats(true);
    setStatsError("");
    setResetMessage("");
    try {
      const deleted = await resetSavedSubmissions();
      setStats(emptyAdminStats);
      setResetMessage(`${deleted} saved responses reset.`);
    } catch (resetError) {
      setStatsError(resetError instanceof Error ? resetError.message : "Could not reset responses.");
    } finally {
      setIsLoadingStats(false);
    }
  };

  if (!isAuthorized) {
    return (
      <main className="admin-gate">
        <section className="gate-card" aria-labelledby="gate-title">
          <span className="gate-icon">
            <LockKeyhole size={28} />
          </span>
          <h1 id="gate-title">NGO analytics are restricted</h1>
          <p>
            This page contains regional crisis trends and operational data. Enter an authorized
            staff code to continue.
          </p>
          <label>
            <span>Access code</span>
            <input
              onChange={(event: { currentTarget: HTMLInputElement }) => setCode(event.currentTarget.value)}
              onKeyDown={(event: { key: string }) => {
                if (event.key === "Enter") submitCode();
              }}
              placeholder="Ask the LinkUP admin lead"
              type="password"
              value={code}
            />
          </label>
          {error ? <strong className="gate-error">{error}</strong> : null}
          <button className="primary-action" onClick={submitCode} type="button">
            Unlock admin dashboard
            <ArrowRight size={18} />
          </button>
          <a className="back-link" href="#/">
            Back to worker support
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="site-nav admin-nav">
        <a className="brand-link" href="#/" aria-label="LinkUP worker site">
          <img alt="LinkUP" className="brand-logo" src="/linkup-wordmark.png" />
        </a>
        <div className="admin-actions">
          <button className="reset-button" disabled={isLoadingStats} onClick={resetResponses} type="button">
            Reset responses
          </button>
          <button
            className="logout-button"
            onClick={() => {
              localStorage.removeItem("linkup-admin");
              setIsAuthorized(false);
            }}
            type="button"
          >
            <LogOut size={17} />
            Lock admin
          </button>
        </div>
      </header>
      {statsError ? <div className="stats-banner error">{statsError}</div> : null}
      {resetMessage ? <div className="stats-banner success">{resetMessage}</div> : null}
      <section className="admin-grid" aria-label="NGO analytics dashboard">
        <DashboardHome isLoading={isLoadingStats} onRefresh={loadStats} stats={stats} />
        <CrisisTrends stats={stats} />
      </section>
    </main>
  );
}

function DashboardHome({
  isLoading,
  onRefresh,
  stats,
}: {
  isLoading: boolean;
  onRefresh: () => void;
  stats: AdminStats;
}) {
  const topCategory = stats.categoryCounts[0];
  const topLanguage = stats.languageCounts[0];
  const categoryRows = stats.categoryCounts.length ? stats.categoryCounts : [{ count: 0, label: "No responses yet" }];
  const languageRows = stats.languageCounts.length ? stats.languageCounts : [{ count: 0, label: "No data" }];

  return (
    <div className="dashboard-layout">
      <section className="dashboard-main" aria-labelledby="dashboard-title">
        <DashboardTopbar onRefresh={onRefresh} title="NGO Analytics Dashboard" />
        <div className="metric-grid">
          <MetricCard
            icon={Activity}
            label="Total Triage Enquiries This Month"
            value={isLoading ? "..." : stats.total.toLocaleString()}
            helper="Live saved worker responses"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Most Urgent Crisis Categories"
            value={topCategory?.label ?? "No data yet"}
            helper={topCategory ? `${topCategory.count} saved responses` : "Complete an intake to populate this"}
          />
          <MetricCard
            icon={Languages}
            label="Top Demanded Languages"
            value={topLanguage ? formatLanguageName(topLanguage.label) : "No data yet"}
            helper={topLanguage ? `${topLanguage.count} intake sessions` : "Language choices appear here"}
          />
        </div>
        <div className="dashboard-columns">
          <section className="trend-panel">
            <div className="panel-heading">
              <h3>Urgency Queue</h3>
              <span>Live</span>
            </div>
            {categoryRows.map((row) => (
              <div className="crisis-row" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.count}</strong>
                <em>{formatShare(row.count, stats.total)}</em>
              </div>
            ))}
          </section>
          <section className="language-panel">
            <div className="panel-heading">
              <h3>Language Demand</h3>
              <BarChart3 size={18} />
            </div>
            {languageRows.map((item, index) => (
              <div className="bar-row" key={item.label}>
                <span>{formatLanguageName(item.label)}</span>
                <div className="bar-track">
                  <i
                    style={{
                      "--bar": formatShare(item.count, stats.total),
                      "--barColor": chartColors[index % chartColors.length],
                    } as CSSProperties}
                  />
                </div>
                <strong>{formatShare(item.count, stats.total)}</strong>
              </div>
            ))}
          </section>
        </div>
      </section>
    </div>
  );
}

function CrisisTrends({ stats }: { stats: AdminStats }) {
  const categoryRows = stats.categoryCounts.length ? stats.categoryCounts : [{ count: 0, label: "No responses yet" }];
  const regionRows = stats.regionCounts.length ? stats.regionCounts : [{ count: 0, label: "No region data" }];
  const pieBackground = buildConicGradient(regionRows);

  return (
    <div className="dashboard-layout">
      <section className="dashboard-main trend-deep-dive" aria-labelledby="trends-title">
        <DashboardTopbar title="Crisis Trend Visualization" />
        <div className="deep-dive-header">
          <div>
            <p className="eyebrow">Last 90 days</p>
            <h2 id="trends-title">Labor crisis spikes by category and region</h2>
          </div>
          <button className="report-button" type="button">
            <FileText size={18} />
            Generate Regional Advocacy Report
          </button>
        </div>

        <div className="visual-grid">
          <section className="chart-panel line-panel">
            <div className="panel-heading">
              <h3>Reported crises</h3>
              <LineChart size={18} />
            </div>
            <LineChartSvg series={stats.trendSeries} />
            <div className="legend-row">
              {categoryRows.slice(0, 3).map((item, index) => (
                <span key={item.label}>
                  <i style={{ background: chartColors[index % chartColors.length] }} />
                  {item.label} ({item.count})
                </span>
              ))}
            </div>
          </section>

          <section className="chart-panel pie-panel">
            <div className="panel-heading">
              <h3>Regional response mix</h3>
              <PieChart size={18} />
            </div>
            <div className="pie-wrap">
              <div className="pie-chart" aria-hidden="true" style={{ background: pieBackground }} />
              <div className="pie-center">
                <strong>{stats.total.toLocaleString()}</strong>
                <span>cases</span>
              </div>
            </div>
            <div className="pie-legend">
              {regionRows.slice(0, 6).map((item, index) => (
                <span key={item.label}>
                  <i style={{ background: chartColors[index % chartColors.length] }} />
                  {item.label} ({item.count})
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function DashboardTopbar({ onRefresh, title }: { onRefresh?: () => void; title: string }) {
  return (
    <header className="dashboard-topbar">
      <div>
        <p>South Korea migrant worker support network</p>
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        {onRefresh ? (
          <button className="refresh-button" onClick={onRefresh} type="button">
            Refresh
          </button>
        ) : null}
      </div>
    </header>
  );
}

function formatLanguageName(value: string) {
  return languageNames[value] ?? value;
}

function formatShare(count: number, total: number) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((count / total) * 100)}%`;
}

function buildConicGradient(items: CountItem[]) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (!total) {
    return "conic-gradient(#e2e8f0 0 100%)";
  }

  let cursor = 0;
  const segments = items.map((item, index) => {
    const start = cursor;
    const end = cursor + (item.count / total) * 100;
    cursor = end;
    return `${chartColors[index % chartColors.length]} ${start}% ${end}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function MetricCard({
  helper,
  icon: Icon,
  label,
  value,
}: {
  helper: string;
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <section className="metric-card">
      <span className="metric-icon">
        <Icon size={20} />
      </span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{helper}</small>
    </section>
  );
}

function LineChartSvg({ series }: { series: TrendSeries[] }) {
  const visibleSeries = series.length
    ? series.slice(0, 3)
    : [{ label: "No responses yet", points: [0, 0, 0, 0, 0, 0, 0] }];
  const maxValue = Math.max(1, ...visibleSeries.flatMap((item) => item.points));
  const coordinates = visibleSeries.map((item) => ({
    label: item.label,
    points: item.points.map((value, index) => ({
      x: 40 + index * (550 / Math.max(item.points.length - 1, 1)),
      y: 210 - (value / maxValue) * 166,
    })),
  }));

  return (
    <svg
      className="line-chart-svg"
      viewBox="0 0 620 270"
      role="img"
      aria-label="Live line chart showing labor crisis submissions over 90 days"
    >
      <g className="grid-lines">
        <path d="M40 44H590" />
        <path d="M40 98H590" />
        <path d="M40 152H590" />
        <path d="M40 206H590" />
      </g>
      {coordinates[0] ? (
        <path
          className="area-wage"
          d={buildAreaPath(coordinates[0].points)}
        />
      ) : null}
      {coordinates.map((item, index) => (
        <path
          d={buildLinePath(item.points)}
          fill="none"
          key={item.label}
          stroke={chartColors[index % chartColors.length]}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />
      ))}
      <g className="chart-dots">
        {coordinates.map((item, index) => {
          const lastPoint = item.points[item.points.length - 1];
          return lastPoint ? (
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              key={item.label}
              r="5"
              stroke={chartColors[index % chartColors.length]}
            />
          ) : null;
        })}
      </g>
      <g className="axis-labels">
        <text x="40" y="254">90d</text>
        <text x="275" y="254">45d</text>
        <text x="558" y="254">Today</text>
      </g>
    </svg>
  );
}

function buildLinePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`).join("");
}

function buildAreaPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) {
    return "";
  }

  return `${buildLinePath(points)}V230H${points[0].x}Z`;
}
