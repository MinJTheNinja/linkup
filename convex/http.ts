import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";

declare const process: {
  env: {
    LINKUP_AI_TOKEN?: string;
    LINKUP_AI_URL?: string;
    MYMEMORY_CONTACT_EMAIL?: string;
  };
};

const http = httpRouter();
const defaultLocalAiUrl = "http://127.0.0.1:8787/classify";

const createSubmission = makeFunctionReference<
  "mutation",
  {
    issueId: string;
    issueLabel: string;
    language: string;
    region: string;
  },
  string
>("submissions:create");

const getSubmissionStats = makeFunctionReference<"query", Record<string, never>, unknown>(
  "submissions:stats",
);

const resetSubmissions = makeFunctionReference<
  "mutation",
  { adminCode: string; resetCode: string },
  { deleted: number }
>("submissions:reset");

http.route({
  path: "/submit-intake",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (
      !body ||
      typeof body.issueId !== "string" ||
      typeof body.issueLabel !== "string" ||
      typeof body.language !== "string" ||
      typeof body.region !== "string"
    ) {
      return jsonResponse({ error: "Invalid submission body." }, 400);
    }

    const id = await ctx.runMutation(createSubmission, {
      issueId: body.issueId,
      issueLabel: body.issueLabel,
      language: body.language,
      region: body.region,
    });

    return jsonResponse({ id });
  }),
});

http.route({
  path: "/submit-intake",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }),
});

http.route({
  path: "/admin-stats",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const stats = await ctx.runQuery(getSubmissionStats, {});
    return jsonResponse(stats);
  }),
});

http.route({
  path: "/reset-submissions",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    if (!body || typeof body.adminCode !== "string" || typeof body.resetCode !== "string") {
      return jsonResponse({ error: "Invalid reset body." }, 400);
    }

    try {
      const result = await ctx.runMutation(resetSubmissions, {
        adminCode: body.adminCode,
        resetCode: body.resetCode,
      });
      return jsonResponse(result);
    } catch {
      return jsonResponse({ error: "Unauthorized reset attempt." }, 403);
    }
  }),
});

http.route({
  path: "/reset-submissions",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }),
});

http.route({
  path: "/translate-to-korean",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const body = await request.json();

    if (!body || typeof body.text !== "string") {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }

    const text = body.text.trim();
    if (!text) {
      return jsonResponse({ translation: "" });
    }

    const sourceLanguage = typeof body.sourceLanguage === "string" ? body.sourceLanguage : "auto";
    const translation = await translateWithMyMemory(text, sourceLanguage);

    return jsonResponse({ provider: "MyMemory", translation });
  }),
});

http.route({
  path: "/translation-health",
  method: "GET",
  handler: httpAction(async () => {
    return jsonResponse({
      ok: true,
      provider: "MyMemory free translation API",
      usesPaidApiKey: false,
    });
  }),
});

http.route({
  path: "/ai-intake-assist",
  method: "POST",
  handler: httpAction(async (_ctx, request) => {
    const body = await request.json();

    if (!isAiAssistRequest(body)) {
      return jsonResponse({ error: "Invalid AI assist request." }, 400);
    }

    const allowedLegalKeys = normalizeAllowedLegalKeys(body.allowedLegalKeys);
    const maskedText = body.maskedText.trim().slice(0, 1200);
    const selectedOptions = body.selectedOptions.slice(0, 20).map((item) => item.slice(0, 180));

    const aiUrl = process.env.LINKUP_AI_URL || defaultLocalAiUrl;

    if (aiUrl) {
      try {
        const response = await fetch(aiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.LINKUP_AI_TOKEN ? { Authorization: `Bearer ${process.env.LINKUP_AI_TOKEN}` } : {}),
          },
          body: JSON.stringify({
            allowedLegalKeys,
            issueId: body.issueId,
            language: body.language,
            maskedText,
            mode: "classification_and_followup_only",
            selectedOptions,
          }),
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok && isRecord(data)) {
          return jsonResponse(normalizeAiAssistResponse(data, allowedLegalKeys));
        }
      } catch {
        // No logging: intake text must not be retained in backend logs.
      }
    }

    return jsonResponse(buildFallbackAiAssist(maskedText, selectedOptions, allowedLegalKeys));
  }),
});

http.route({
  path: "/ai-intake-assist",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }),
});

http.route({
  path: "/question-tts",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const url = new URL(request.url);
    const text = (url.searchParams.get("text") ?? "").trim();
    const language = normalizeTtsLanguage(url.searchParams.get("language") ?? "");

    if (!text) {
      return jsonResponse({ error: "Missing TTS text." }, 400);
    }

    const audioResponse = await fetchGoogleTtsAudio(text, language);
    if (!audioResponse.ok) {
      return jsonResponse({ error: "TTS audio unavailable." }, 502);
    }

    return new Response(await audioResponse.arrayBuffer(), {
      status: 200,
      headers: {
        ...corsHeaders(),
        "Cache-Control": "public, max-age=3600",
        "Content-Type": "audio/mpeg",
      },
    });
  }),
});

http.route({
  path: "/question-tts",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }),
});

http.route({
  path: "/translate-to-korean",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }),
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json",
    },
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Origin": "*",
  };
}

async function translateWithMyMemory(text: string, sourceLanguage: string) {
  const source = normalizeSourceLanguage(sourceLanguage);
  const url = new URL("https://api.mymemory.translated.net/get");
  url.searchParams.set("q", text);
  url.searchParams.set("langpair", `${source}|ko`);

  if (process.env.MYMEMORY_CONTACT_EMAIL) {
    url.searchParams.set("de", process.env.MYMEMORY_CONTACT_EMAIL);
  }

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!response.ok) {
    return text;
  }

  if (!isRecord(data) || !isRecord(data.responseData)) {
    return text;
  }

  const translatedText = data.responseData.translatedText;
  return typeof translatedText === "string" && translatedText.trim() ? translatedText.trim() : text;
}

function normalizeSourceLanguage(sourceLanguage: string) {
  if (
    sourceLanguage === "vi" ||
    sourceLanguage === "th" ||
    sourceLanguage === "id" ||
    sourceLanguage === "fil" ||
    sourceLanguage === "tl" ||
    sourceLanguage === "en"
  ) {
    if (sourceLanguage === "fil") {
      return "tl";
    }
    return sourceLanguage;
  }

  return "en";
}

function normalizeTtsLanguage(language: string) {
  if (
    language === "vi" ||
    language === "th" ||
    language === "id" ||
    language === "tl" ||
    language === "fil" ||
    language === "ko" ||
    language === "en"
  ) {
    if (language === "fil") {
      return "tl";
    }
    return language;
  }

  return "en";
}

function isAiAssistRequest(value: unknown): value is {
  allowedLegalKeys: string[];
  issueId: string;
  language: string;
  maskedText: string;
  selectedOptions: string[];
} {
  return (
    isRecord(value) &&
    typeof value.issueId === "string" &&
    typeof value.language === "string" &&
    typeof value.maskedText === "string" &&
    Array.isArray(value.allowedLegalKeys) &&
    Array.isArray(value.selectedOptions) &&
    value.allowedLegalKeys.every((item) => typeof item === "string") &&
    value.selectedOptions.every((item) => typeof item === "string")
  );
}

function normalizeAllowedLegalKeys(keys: string[]) {
  const allowed = new Set([
    "no_pay_stub",
    "no_written_contract",
    "unpaid_annual_leave_allowance",
    "unpaid_basic_salary",
    "unpaid_dismissal_notice_allowance",
    "unpaid_exit_clearance",
    "unpaid_overtime_allowance",
    "unpaid_severance",
    "unpaid_shutdown_allowance",
    "unpaid_weekly_holiday_allowance",
  ]);

  return keys.filter((key) => allowed.has(key));
}

function normalizeAiAssistResponse(data: Record<string, unknown>, allowedLegalKeys: string[]) {
  const allowed = new Set(allowedLegalKeys);
  const followUpQuestions = Array.isArray(data.followUpQuestions)
    ? data.followUpQuestions.filter((item) => typeof item === "string").slice(0, 4)
    : [];
  const legalKeys = Array.isArray(data.legalKeys)
    ? data.legalKeys.filter((item) => typeof item === "string" && allowed.has(item)).slice(0, 6)
    : [];

  return {
    followUpQuestions,
    legalKeys,
    note:
      typeof data.note === "string" && data.note.trim()
        ? data.note.trim().slice(0, 240)
        : "AI assist used masked text only and did not store this request.",
    source: "ai",
  };
}

function buildFallbackAiAssist(maskedText: string, selectedOptions: string[], allowedLegalKeys: string[]) {
  const text = `${maskedText} ${selectedOptions.join(" ")}`.toLowerCase();
  const legalKeys = new Set<string>();
  const followUpQuestions: string[] = [];

  const addLegalKey = (key: string) => {
    if (allowedLegalKeys.includes(key)) {
      legalKeys.add(key);
    }
  };

  if (/(salary|wage|pay|paid|월급|임금|급여|lương|gaji|sahod|ค่าแรง)/i.test(text)) {
    addLegalKey("unpaid_basic_salary");
    followUpQuestions.push("Which pay period is missing, and was any partial amount paid?");
  }

  if (/(overtime|night|weekend|holiday|late|22|10pm|주말|야간|연장|휴일|tăng ca|lembur|overtime|ล่วงเวลา)/i.test(text)) {
    addLegalKey("unpaid_overtime_allowance");
    followUpQuestions.push("How many hours did you work on weekends, holidays, or after 10 PM?");
  }

  if (/(quit|left|resign|fired|dismiss|퇴사|해고|nghỉ|berhenti|tinanggal|ออกจากงาน)/i.test(text)) {
    addLegalKey("unpaid_exit_clearance");
    followUpQuestions.push("What was your last working day, and has it been more than 14 days since then?");
  }

  if (/(severance|퇴직금|trợ cấp thôi việc|pesangon|severance pay)/i.test(text)) {
    addLegalKey("unpaid_severance");
    followUpQuestions.push("Did you work for at least one year, and about how many hours per week did you work?");
  }

  if (/(contract|계약서|hợp đồng|kontrak|kontrata|สัญญา)/i.test(text)) {
    addLegalKey(text.includes("no ") || text.includes("없") ? "no_written_contract" : "no_written_contract");
  }

  if (/(pay stub|payslip|명세서|slip gaji|phiếu lương)/i.test(text)) {
    addLegalKey("no_pay_stub");
  }

  if (followUpQuestions.length === 0) {
    followUpQuestions.push("What happened, when did it happen, and what proof do you already have?");
  }

  return {
    followUpQuestions: followUpQuestions.slice(0, 4),
    legalKeys: [...legalKeys].slice(0, 6),
    note: process.env.LINKUP_AI_URL
      ? "AI server was unavailable, so LinkUP used local rule-based guidance."
      : "No AI server is configured yet, so LinkUP used local rule-based guidance.",
    source: "fallback",
  };
}

async function fetchGoogleTtsAudio(text: string, language: string) {
  const url = new URL("https://translate.google.com/translate_tts");
  url.searchParams.set("ie", "UTF-8");
  url.searchParams.set("client", "tw-ob");
  url.searchParams.set("tl", language);
  url.searchParams.set("q", text.slice(0, 180));

  return await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export default http;
