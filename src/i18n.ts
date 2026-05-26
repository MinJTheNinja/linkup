import type { Guide } from "./demoGuides";

export type LanguageCode = "en" | "ur" | "vi";

export const languageOptions: { code: LanguageCode; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ur", label: "Urdu", dir: "rtl" },
  { code: "vi", label: "Tiếng Việt", dir: "ltr" },
];

export const uiText = {
  en: {
    brandTagline: "Information that connects you forward.",
    navLabel: "Main navigation",
    languageLabel: "Language",
    about: "About LinkUP",
    guides: "Guides",
    updates: "Updates",
    emergency: "Emergency contacts",
    menu: "Open menu",
    eyebrow: "LinkUP",
    heroTitle: "What problem are you facing right now?",
    heroCopy: "Choose a situation below to find information in your language.",
    strip: "Information in multiple languages to help you take the next step.",
    categoriesLabel: "Problem categories",
    selectedGuide: "Selected guide",
    closeGuide: "Close guide",
    immediateActions: "Immediate actions",
    officialContacts: "Official contacts",
    documentChecklist: "Document checklist",
  },
  ur: {
    brandTagline: "معلومات جو آپ کو اگلے قدم تک پہنچاتی ہیں۔",
    navLabel: "مرکزی نیویگیشن",
    languageLabel: "زبان",
    about: "LinkUP کے بارے میں",
    guides: "رہنما",
    updates: "اپ ڈیٹس",
    emergency: "ہنگامی رابطے",
    menu: "مینو کھولیں",
    eyebrow: "LinkUP",
    heroTitle: "آپ کو اس وقت کس مسئلے کا سامنا ہے؟",
    heroCopy: "اپنی زبان میں معلومات حاصل کرنے کے لیے صورتحال منتخب کریں۔",
    strip: "اگلا قدم سمجھنے میں مدد کے لیے کئی زبانوں میں معلومات۔",
    categoriesLabel: "مسائل کی اقسام",
    selectedGuide: "منتخب رہنما",
    closeGuide: "رہنما بند کریں",
    immediateActions: "فوری اقدامات",
    officialContacts: "سرکاری رابطے",
    documentChecklist: "دستاویزات کی فہرست",
  },
  vi: {
    brandTagline: "Thông tin giúp bạn tìm bước tiếp theo.",
    navLabel: "Điều hướng chính",
    languageLabel: "Ngôn ngữ",
    about: "Về LinkUP",
    guides: "Hướng dẫn",
    updates: "Cập nhật",
    emergency: "Liên hệ khẩn cấp",
    menu: "Mở menu",
    eyebrow: "LinkUP",
    heroTitle: "Bạn đang gặp vấn đề gì ngay lúc này?",
    heroCopy: "Chọn một tình huống để xem thông tin bằng ngôn ngữ của bạn.",
    strip: "Thông tin bằng nhiều ngôn ngữ để giúp bạn thực hiện bước tiếp theo.",
    categoriesLabel: "Nhóm vấn đề",
    selectedGuide: "Hướng dẫn đã chọn",
    closeGuide: "Đóng hướng dẫn",
    immediateActions: "Việc cần làm ngay",
    officialContacts: "Liên hệ chính thức",
    documentChecklist: "Danh sách giấy tờ",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

type GuideTranslation = Pick<
  Guide,
  "title" | "summary" | "immediateActions" | "contacts" | "checklist" | "sourceNote"
>;

const guideTranslations: Record<LanguageCode, Record<string, GuideTranslation>> = {
  en: {},
  ur: {
    "unpaid-wages": {
      title: "غیر ادا شدہ اجرت",
      summary: "اجرت نہ ملنے کے مسئلے کے لیے پہلے سرکاری اقدامات دیکھیں۔",
      immediateActions: [
        "آجر کا نام، کام کی جگہ کا پتہ، کام کی تاریخیں، اور باقی رقم لکھیں۔",
        "تنخواہ کی پرچیاں، بینک ریکارڈ، پیغامات، حاضری ریکارڈ، یا معاہدے کی تصاویر محفوظ کریں۔",
        "وزارت روزگار و محنت یا مقامی لیبر آفس کے سرکاری مشاورتی چینل سے رابطہ کریں۔",
      ],
      contacts: [
        {
          name: "Ministry of Employment and Labor",
          detail: "مزدوری سے متعلق معلومات اور مقامی لیبر آفس کی رہنمائی۔",
          url: "https://www.moel.go.kr",
        },
        {
          name: "Foreign Worker Support Center",
          detail: "جہاں دستیاب ہو، کئی زبانوں میں عوامی مدد اور حوالہ جات۔",
        },
      ],
      checklist: [
        { label: "شناختی دستاویز", detail: "ARC یا پاسپورٹ، اگر دستیاب ہو۔", required: true },
        { label: "غیر ادا شدہ اجرت کا ثبوت", detail: "بینک ریکارڈ، تنخواہ پرچی، یا پیغامات۔", required: true },
        { label: "آجر کی معلومات", detail: "کمپنی کا نام اور کام کی جگہ کا پتہ۔", required: true },
      ],
      sourceNote: "صرف معلومات، عوامی لیبر سروس ذرائع کی بنیاد پر۔",
    },
    insurance: {
      title: "انشورنس",
      summary: "ہیلتھ، روزگار، یا کام کے حادثے کی انشورنس کے بارے میں کہاں پوچھنا ہے۔",
      immediateActions: [
        "پہلے طے کریں کہ مسئلہ کس انشورنس سے متعلق ہے۔",
        "اپنی شناخت، ویزا کی معلومات، اور کام یا بلنگ سے متعلق کاغذات تیار کریں۔",
        "ادائیگی یا منسوخی سے پہلے متعلقہ سرکاری ادارے سے رابطہ کریں۔",
      ],
      contacts: [
        {
          name: "National Health Insurance Service",
          detail: "ہیلتھ انشورنس اندراج، بلنگ، اور اہلیت کی معلومات۔",
          url: "https://www.nhis.or.kr",
        },
        {
          name: "Korea Workers' Compensation and Welfare Service",
          detail: "کام کے حادثے اور روزگار انشورنس کی معلومات۔",
          url: "https://www.comwel.or.kr",
        },
      ],
      checklist: [
        { label: "شناختی کارڈ یا پاسپورٹ", detail: "شناختی دستاویز اگر دستیاب ہو۔", required: true },
        { label: "انشورنس نوٹس یا بل", detail: "تصویر، خط، یا ٹیکسٹ میسج۔", required: true },
        { label: "کام کی جگہ کی معلومات", detail: "اگر مسئلہ کام سے متعلق ہے تو آجر کی تفصیل۔", required: false },
      ],
      sourceNote: "صرف معلومات، سرکاری انشورنس اداروں کے ذرائع کی بنیاد پر۔",
    },
    "no-contract": {
      title: "معاہدہ نہیں ہے",
      summary: "تحریری معاہدہ نہ ہونے پر کون سے ریکارڈ مددگار ہو سکتے ہیں۔",
      immediateActions: [
        "شروع کرنے کی تاریخ، کام، اوقات، کام کی جگہ، اور طے شدہ تنخواہ لکھیں۔",
        "پیغامات، شیڈول، تصاویر، بینک ٹرانسفر، اور حاضری ریکارڈ محفوظ کریں۔",
        "سرکاری لیبر مشاورتی چینل سے پوچھیں کہ آپ کی صورتحال میں کون سے دستاویزات مفید ہیں۔",
      ],
      contacts: [
        {
          name: "Ministry of Employment and Labor",
          detail: "لیبر معیار کی معلومات اور مقامی دفتر کی رہنمائی۔",
          url: "https://www.moel.go.kr",
        },
        {
          name: "Korea Legal Aid Corporation",
          detail: "عوامی قانونی معلومات اور مشاورتی چینلز۔",
          url: "https://www.klac.or.kr",
        },
      ],
      checklist: [
        { label: "شناختی دستاویز", detail: "ARC یا پاسپورٹ اگر دستیاب ہو۔", required: true },
        { label: "کام کے ریکارڈ", detail: "پیغامات، شیڈول، یا حاضری ریکارڈ۔", required: true },
        { label: "ادائیگی کے ریکارڈ", detail: "بینک ٹرانسفر یا نقد ادائیگی کے نوٹ۔", required: true },
      ],
      sourceNote: "صرف معلومات، قانونی مشورہ نہیں۔",
    },
    "lost-passport-id": {
      title: "پاسپورٹ/شناختی کارڈ گم",
      summary: "رپورٹ کرنے اور متبادل دستاویز کی تیاری کے سرکاری مراحل دیکھیں۔",
      immediateActions: [
        "متعلقہ پولیس اسٹیشن یا سرکاری رپورٹنگ چینل میں گمشدگی رپورٹ کریں۔",
        "پاسپورٹ بدلوانے کی معلومات کے لیے اپنے سفارت خانے یا قونصل خانے سے رابطہ کریں۔",
        "غیر ملکی رجسٹریشن یا رہائشی دستاویز بدلوانے کے لیے امیگریشن یا جاری کرنے والے دفتر سے رابطہ کریں۔",
      ],
      contacts: [
        {
          name: "Hi Korea Immigration Contact Center 1345",
          detail: "امیگریشن اور غیر ملکی رہائشی دستاویزات کی معلومات۔",
          url: "https://www.hikorea.go.kr",
        },
        { name: "Local police station", detail: "گمشدگی رپورٹ اور پولیس رپورٹ کی معلومات۔" },
        { name: "Your embassy or consulate", detail: "پاسپورٹ بدلوانے کی ضروریات اور اپائنٹمنٹ۔" },
      ],
      checklist: [
        { label: "پاسپورٹ سائز تصویر", detail: "عام طور پر متبادل دستاویز کے لیے درکار۔", required: true },
        { label: "شناختی کارڈ کی کاپی، اگر ہو", detail: "گم شدہ دستاویز کی تصویر یا کاپی مددگار ہو سکتی ہے۔", required: false },
        { label: "پولیس رپورٹ", detail: "ضرورت پڑنے پر اصل یا کاپی۔", required: true },
        { label: "درخواست فارم", detail: "متعلقہ دفتر فراہم کرتا ہے۔", required: true },
        { label: "رہائش کا ثبوت", detail: "یوٹیلٹی بل، کرایہ نامہ، یا سرٹیفکیٹ اگر مانگا جائے۔", required: false },
      ],
      sourceNote: "اضافی تقاضوں کے لیے متعلقہ دفتر سے ضرور چیک کریں۔",
    },
    "immigration-visa": {
      title: "امیگریشن/ویزا مسئلہ",
      summary: "سرکاری امیگریشن رابطے اور دستاویز تیاری کی بنیادی معلومات دیکھیں۔",
      immediateActions: [
        "ویزا، قیام کی مدت، رپورٹ، یا اپائنٹمنٹ سے متعلق آخری تاریخ چیک کریں۔",
        "پاسپورٹ، Alien Registration Card، اور امیگریشن نوٹس تیار کریں۔",
        "دفتر جانے سے پہلے Hi Korea یا 1345 سے سرکاری طریقہ کار معلوم کریں۔",
      ],
      contacts: [
        { name: "Hi Korea", detail: "سرکاری امیگریشن سول سروس پورٹل۔", url: "https://www.hikorea.go.kr" },
        { name: "Immigration Contact Center 1345", detail: "کئی زبانوں میں امیگریشن معلومات لائن۔" },
      ],
      checklist: [
        { label: "پاسپورٹ", detail: "موجودہ پاسپورٹ اور اگر متعلقہ ہو تو پرانا پاسپورٹ۔", required: true },
        { label: "Alien Registration Card", detail: "رہائشی کارڈ اگر جاری ہوا ہو۔", required: true },
        { label: "درخواست کا مواد", detail: "فارم اور معاون دستاویزات جو دفتر بتائے۔", required: true },
      ],
      sourceNote: "صرف معلومات، سرکاری امیگریشن ذرائع کی بنیاد پر۔",
    },
    "workplace-injury": {
      title: "کام کی جگہ چوٹ",
      summary: "کام کے دوران چوٹ لگنے کے بعد پہلے سرکاری اقدامات دیکھیں۔",
      immediateActions: [
        "اگر فوری ضرورت ہو تو پہلے طبی علاج لیں، اور ہسپتال کو بتائیں کہ چوٹ کام پر لگی۔",
        "تاریخ، وقت، جگہ، کام، گواہ، اور اگر ممکن ہو تو تصاویر ریکارڈ کریں۔",
        "سرکاری کلیم معلومات کے لیے ورکرز کمپنسیشن ادارے یا لیبر آفس سے رابطہ کریں۔",
      ],
      contacts: [
        { name: "Emergency 119", detail: "کوریا میں ہنگامی طبی امداد۔" },
        {
          name: "Korea Workers' Compensation and Welfare Service",
          detail: "صنعتی حادثہ معاوضہ معلومات۔",
          url: "https://www.comwel.or.kr",
        },
      ],
      checklist: [
        { label: "طبی ریکارڈ یا تشخیص", detail: "چوٹ سے متعلق ہسپتال کی دستاویزات۔", required: true },
        { label: "کام کی جگہ کی تفصیل", detail: "آجر کا نام، پتہ، سپروائزر رابطہ۔", required: true },
        { label: "واقعہ کے نوٹس", detail: "تاریخ، وقت، جگہ، کام، اور گواہ۔", required: true },
      ],
      sourceNote: "صرف معلومات۔ فوری طبی صورتحال میں ایمرجنسی سروس استعمال کریں۔",
    },
  },
  vi: {
    "unpaid-wages": {
      title: "Chưa được trả lương",
      summary: "Xem các bước chính thức đầu tiên khi gặp vấn đề về tiền lương.",
      immediateActions: [
        "Ghi lại tên chủ sử dụng lao động, địa chỉ nơi làm việc, ngày làm việc và số tiền chưa được trả.",
        "Giữ bằng chứng như phiếu lương, sao kê ngân hàng, tin nhắn, chấm công hoặc ảnh hợp đồng.",
        "Liên hệ kênh tư vấn của Bộ Việc làm và Lao động hoặc văn phòng lao động địa phương.",
      ],
      contacts: [
        {
          name: "Ministry of Employment and Labor",
          detail: "Tư vấn lao động và hướng dẫn văn phòng lao động địa phương.",
          url: "https://www.moel.go.kr",
        },
        {
          name: "Foreign Worker Support Center",
          detail: "Hỗ trợ công cộng đa ngôn ngữ và giới thiệu nơi phù hợp nếu có.",
        },
      ],
      checklist: [
        { label: "Giấy tờ tùy thân", detail: "Thẻ ARC hoặc hộ chiếu nếu có.", required: true },
        { label: "Bằng chứng lương chưa trả", detail: "Sao kê, phiếu lương hoặc tin nhắn.", required: true },
        { label: "Thông tin chủ lao động", detail: "Tên công ty và địa chỉ nơi làm việc.", required: true },
      ],
      sourceNote: "Chỉ là thông tin, dựa trên nguồn dịch vụ lao động công.",
    },
    insurance: {
      title: "Bảo hiểm",
      summary: "Xem nơi hỏi về bảo hiểm y tế, việc làm hoặc tai nạn lao động.",
      immediateActions: [
        "Xác định vấn đề thuộc loại bảo hiểm nào.",
        "Chuẩn bị giấy tờ tùy thân, thông tin visa và giấy tờ về nơi làm việc hoặc hóa đơn.",
        "Liên hệ cơ quan chính thức liên quan trước khi thanh toán hoặc hủy bảo hiểm.",
      ],
      contacts: [
        {
          name: "National Health Insurance Service",
          detail: "Thông tin về đăng ký, hóa đơn và điều kiện bảo hiểm y tế.",
          url: "https://www.nhis.or.kr",
        },
        {
          name: "Korea Workers' Compensation and Welfare Service",
          detail: "Thông tin bảo hiểm tai nạn lao động và bảo hiểm việc làm.",
          url: "https://www.comwel.or.kr",
        },
      ],
      checklist: [
        { label: "Thẻ ID hoặc hộ chiếu", detail: "Giấy tờ tùy thân nếu có.", required: true },
        { label: "Thông báo hoặc hóa đơn bảo hiểm", detail: "Ảnh, thư hoặc tin nhắn.", required: true },
        { label: "Thông tin nơi làm việc", detail: "Chi tiết chủ lao động nếu liên quan đến công việc.", required: false },
      ],
      sourceNote: "Chỉ là thông tin, dựa trên nguồn của cơ quan bảo hiểm chính thức.",
    },
    "no-contract": {
      title: "Không có hợp đồng",
      summary: "Xem những hồ sơ có thể hữu ích khi không có hợp đồng bằng văn bản.",
      immediateActions: [
        "Ghi ngày bắt đầu, nhiệm vụ, giờ làm, địa chỉ nơi làm việc và mức lương đã thỏa thuận.",
        "Lưu tin nhắn, lịch làm, ảnh, chuyển khoản ngân hàng và hồ sơ chấm công.",
        "Hỏi kênh tư vấn lao động chính thức về giấy tờ phù hợp với tình huống của bạn.",
      ],
      contacts: [
        {
          name: "Ministry of Employment and Labor",
          detail: "Thông tin tiêu chuẩn lao động và hướng dẫn văn phòng địa phương.",
          url: "https://www.moel.go.kr",
        },
        {
          name: "Korea Legal Aid Corporation",
          detail: "Thông tin pháp lý công cộng và kênh tư vấn.",
          url: "https://www.klac.or.kr",
        },
      ],
      checklist: [
        { label: "Giấy tờ tùy thân", detail: "Thẻ ARC hoặc hộ chiếu nếu có.", required: true },
        { label: "Hồ sơ làm việc", detail: "Tin nhắn, lịch làm hoặc chấm công.", required: true },
        { label: "Hồ sơ thanh toán", detail: "Lịch sử chuyển khoản hoặc ghi chú tiền mặt.", required: true },
      ],
      sourceNote: "Chỉ là thông tin, không phải tư vấn pháp lý.",
    },
    "lost-passport-id": {
      title: "Mất hộ chiếu/thẻ ID",
      summary: "Xem các bước chính thức để báo mất và chuẩn bị cấp lại.",
      immediateActions: [
        "Báo mất tại đồn cảnh sát liên quan hoặc kênh báo cáo chính thức.",
        "Liên hệ đại sứ quán hoặc lãnh sự quán của bạn để biết thủ tục cấp lại hộ chiếu.",
        "Liên hệ cơ quan xuất nhập cảnh hoặc nơi cấp giấy tờ để hỏi về cấp lại giấy tờ cư trú.",
      ],
      contacts: [
        {
          name: "Hi Korea Immigration Contact Center 1345",
          detail: "Thông tin xuất nhập cảnh và giấy tờ cư trú cho người nước ngoài.",
          url: "https://www.hikorea.go.kr",
        },
        { name: "Local police station", detail: "Thông tin báo mất và giấy xác nhận của cảnh sát." },
        { name: "Your embassy or consulate", detail: "Yêu cầu và lịch hẹn cấp lại hộ chiếu." },
      ],
      checklist: [
        { label: "Ảnh cỡ hộ chiếu", detail: "Thường được yêu cầu khi cấp lại giấy tờ.", required: true },
        { label: "Bản sao thẻ ID nếu có", detail: "Ảnh hoặc bản sao giấy tờ bị mất có thể hữu ích.", required: false },
        { label: "Giấy báo cảnh sát", detail: "Bản gốc hoặc bản sao nếu được yêu cầu.", required: true },
        { label: "Đơn đăng ký", detail: "Do văn phòng liên quan cung cấp.", required: true },
        { label: "Bằng chứng địa chỉ", detail: "Hóa đơn, hợp đồng thuê nhà hoặc giấy xác nhận nếu được yêu cầu.", required: false },
      ],
      sourceNote: "Hãy kiểm tra với văn phòng liên quan về các yêu cầu bổ sung.",
    },
    "immigration-visa": {
      title: "Vấn đề xuất nhập cảnh/visa",
      summary: "Xem liên hệ chính thức và giấy tờ cơ bản cần chuẩn bị.",
      immediateActions: [
        "Kiểm tra hạn chót liên quan đến visa, thời hạn lưu trú, báo cáo hoặc lịch hẹn.",
        "Chuẩn bị hộ chiếu, thẻ ARC và mọi thông báo từ cơ quan xuất nhập cảnh.",
        "Dùng Hi Korea hoặc gọi 1345 để biết thủ tục chính thức trước khi đến văn phòng.",
      ],
      contacts: [
        { name: "Hi Korea", detail: "Cổng dịch vụ dân sự xuất nhập cảnh chính thức.", url: "https://www.hikorea.go.kr" },
        { name: "Immigration Contact Center 1345", detail: "Đường dây thông tin xuất nhập cảnh đa ngôn ngữ." },
      ],
      checklist: [
        { label: "Hộ chiếu", detail: "Hộ chiếu hiện tại và hộ chiếu cũ nếu liên quan.", required: true },
        { label: "Thẻ Alien Registration Card", detail: "Thẻ cư trú nếu đã được cấp.", required: true },
        { label: "Tài liệu đăng ký", detail: "Biểu mẫu và giấy tờ hỗ trợ do văn phòng yêu cầu.", required: true },
      ],
      sourceNote: "Chỉ là thông tin, dựa trên nguồn xuất nhập cảnh chính thức.",
    },
    "workplace-injury": {
      title: "Tai nạn tại nơi làm việc",
      summary: "Xem các bước chính thức đầu tiên sau khi bị thương khi làm việc.",
      immediateActions: [
        "Nếu khẩn cấp, hãy điều trị y tế trước và nói với bệnh viện rằng bạn bị thương khi làm việc.",
        "Ghi lại ngày, giờ, địa điểm, công việc, nhân chứng và ảnh nếu có thể.",
        "Liên hệ cơ quan bồi thường tai nạn lao động hoặc văn phòng lao động để biết thông tin yêu cầu chính thức.",
      ],
      contacts: [
        { name: "Emergency 119", detail: "Cấp cứu y tế khẩn cấp tại Hàn Quốc." },
        {
          name: "Korea Workers' Compensation and Welfare Service",
          detail: "Thông tin bồi thường tai nạn lao động.",
          url: "https://www.comwel.or.kr",
        },
      ],
      checklist: [
        { label: "Hồ sơ y tế hoặc chẩn đoán", detail: "Giấy tờ bệnh viện liên quan đến chấn thương.", required: true },
        { label: "Thông tin nơi làm việc", detail: "Tên chủ lao động, địa chỉ, liên hệ quản lý.", required: true },
        { label: "Ghi chú sự việc", detail: "Ngày, giờ, địa điểm, công việc và nhân chứng.", required: true },
      ],
      sourceNote: "Chỉ là thông tin. Hãy dùng dịch vụ khẩn cấp nếu tình huống y tế cấp bách.",
    },
  },
};

export function localizeGuide(guide: Guide, language: LanguageCode): Guide {
  const translated = guideTranslations[language][guide.slug];
  return translated ? { ...guide, ...translated } : guide;
}
