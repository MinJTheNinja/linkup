export type Guide = {
  _id?: string;
  slug: string;
  order: number;
  title: string;
  summary: string;
  icon: string;
  accent: string;
  immediateActions: string[];
  contacts: {
    name: string;
    detail: string;
    url?: string;
  }[];
  checklist: {
    label: string;
    detail: string;
    required: boolean;
  }[];
  sourceNote: string;
};

export const demoGuides: Guide[] = [
  {
    slug: "unpaid-wages",
    order: 1,
    title: "Unpaid wages",
    summary: "Find the first official steps for wage payment problems.",
    icon: "wallet",
    accent: "#45B986",
    immediateActions: [
      "Write down the employer name, workplace address, work dates, and unpaid amount.",
      "Collect proof such as pay slips, bank records, messages, attendance records, or contract photos.",
      "Contact the Ministry of Employment and Labor consultation channel or the local labor office.",
    ],
    contacts: [
      {
        name: "Ministry of Employment and Labor",
        detail: "Labor consultation and local labor office guidance.",
        url: "https://www.moel.go.kr",
      },
      {
        name: "Foreign Worker Support Center",
        detail: "Multilingual public support and referrals where available.",
      },
    ],
    checklist: [
      { label: "Identity document", detail: "ARC or passport if available.", required: true },
      { label: "Proof of unpaid wages", detail: "Bank records, pay slips, or messages.", required: true },
      { label: "Employer information", detail: "Company name and workplace address.", required: true },
    ],
    sourceNote: "Information only, based on public labor-service sources.",
  },
  {
    slug: "insurance",
    order: 2,
    title: "Insurance",
    summary: "Check where to ask about health, employment, or accident insurance.",
    icon: "shield",
    accent: "#45B986",
    immediateActions: [
      "Identify which insurance issue applies.",
      "Prepare your ID, visa status information, and any workplace or billing documents.",
      "Contact the relevant official insurance institution before making payments or cancelling coverage.",
    ],
    contacts: [
      {
        name: "National Health Insurance Service",
        detail: "Health insurance enrollment, billing, and eligibility information.",
        url: "https://www.nhis.or.kr",
      },
      {
        name: "Korea Workers' Compensation and Welfare Service",
        detail: "Industrial accident compensation and employment insurance information.",
        url: "https://www.comwel.or.kr",
      },
    ],
    checklist: [
      { label: "ID card or passport", detail: "Identity document if available.", required: true },
      { label: "Insurance notice or bill", detail: "Photo, letter, or text message.", required: true },
      { label: "Workplace information", detail: "Employer details if work-related.", required: false },
    ],
    sourceNote: "Information only, based on official insurance institution sources.",
  },
  {
    slug: "no-contract",
    order: 3,
    title: "No contract",
    summary: "Find public information on what records may help when no written contract exists.",
    icon: "file",
    accent: "#45B986",
    immediateActions: [
      "Write down your start date, job duties, work hours, workplace address, and agreed pay.",
      "Save proof of work such as messages, schedules, photos, bank transfers, and attendance records.",
      "Ask an official labor consultation channel what documents are useful for your situation.",
    ],
    contacts: [
      {
        name: "Ministry of Employment and Labor",
        detail: "Labor standards information and local office guidance.",
        url: "https://www.moel.go.kr",
      },
      {
        name: "Korea Legal Aid Corporation",
        detail: "Public legal information and consultation channels.",
        url: "https://www.klac.or.kr",
      },
    ],
    checklist: [
      { label: "Identity document", detail: "ARC or passport if available.", required: true },
      { label: "Work records", detail: "Messages, schedules, or attendance records.", required: true },
      { label: "Payment records", detail: "Bank transfer history or cash notes.", required: true },
    ],
    sourceNote: "Information only, not legal advice.",
  },
  {
    slug: "lost-passport-id",
    order: 4,
    title: "Lost passport/ID card",
    summary: "Follow official reporting and replacement-preparation steps.",
    icon: "passport",
    accent: "#F04438",
    immediateActions: [
      "Report the loss to the relevant police station or official reporting channel.",
      "Contact your embassy or consulate for passport replacement information.",
      "Contact immigration or the issuing office about replacing foreign registration or residence documents.",
    ],
    contacts: [
      {
        name: "Hi Korea Immigration Contact Center 1345",
        detail: "Immigration and foreign resident document information.",
        url: "https://www.hikorea.go.kr",
      },
      { name: "Local police station", detail: "Loss report and police report information." },
      { name: "Your embassy or consulate", detail: "Passport replacement requirements and appointments." },
    ],
    checklist: [
      { label: "Passport-sized photo", detail: "Usually requested for replacement documents.", required: true },
      { label: "ID card copy, if available", detail: "Photo or copy of the lost document can help.", required: false },
      { label: "Police report", detail: "Original or copy when required.", required: true },
      { label: "Application form", detail: "Provided by the relevant office.", required: true },
      { label: "Proof of address", detail: "Utility bill, lease, or certificate if requested.", required: false },
    ],
    sourceNote: "Check with the relevant office for any additional requirements.",
  },
  {
    slug: "immigration-visa",
    order: 5,
    title: "Immigration/visa issue",
    summary: "Find official immigration contact points and document-preparation basics.",
    icon: "globe",
    accent: "#45B986",
    immediateActions: [
      "Check the deadline or date connected to your visa, stay period, report, or appointment.",
      "Prepare your passport, Alien Registration Card, and any notices from immigration.",
      "Use Hi Korea or call 1345 for official procedure information before visiting an office.",
    ],
    contacts: [
      { name: "Hi Korea", detail: "Official immigration civil service portal.", url: "https://www.hikorea.go.kr" },
      { name: "Immigration Contact Center 1345", detail: "Multilingual immigration information line." },
    ],
    checklist: [
      { label: "Passport", detail: "Current passport and any old passport if relevant.", required: true },
      { label: "Alien Registration Card", detail: "Residence card if issued.", required: true },
      { label: "Application materials", detail: "Forms and supporting documents listed by the office.", required: true },
    ],
    sourceNote: "Information only, based on official immigration sources.",
  },
  {
    slug: "workplace-injury",
    order: 6,
    title: "Workplace injury",
    summary: "Find first official steps after an injury at work.",
    icon: "bandage",
    accent: "#45B986",
    immediateActions: [
      "Get medical care first if urgent, and tell the clinic or hospital the injury happened at work.",
      "Record the date, time, place, task, witnesses, and photos if possible.",
      "Contact the workers' compensation institution or a labor office for official claim information.",
    ],
    contacts: [
      { name: "Emergency 119", detail: "Emergency medical response in Korea." },
      {
        name: "Korea Workers' Compensation and Welfare Service",
        detail: "Industrial accident compensation information.",
        url: "https://www.comwel.or.kr",
      },
    ],
    checklist: [
      { label: "Medical record or diagnosis", detail: "Hospital documents related to the injury.", required: true },
      { label: "Workplace details", detail: "Employer name, address, supervisor contact.", required: true },
      { label: "Incident notes", detail: "Date, time, place, task, and witnesses.", required: true },
    ],
    sourceNote: "Information only. Use emergency services for urgent medical situations.",
  },
];
