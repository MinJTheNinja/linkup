import { httpRouter, makeFunctionReference } from "convex/server";
import { httpAction } from "./_generated/server";

declare const process: {
  env: {
    MYMEMORY_CONTACT_EMAIL?: string;
  };
};

const http = httpRouter();

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
  { adminCode: string },
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

    if (!body || typeof body.adminCode !== "string") {
      return jsonResponse({ error: "Invalid reset body." }, 400);
    }

    try {
      const result = await ctx.runMutation(resetSubmissions, {
        adminCode: body.adminCode,
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
  if (sourceLanguage === "vi" || sourceLanguage === "th" || sourceLanguage === "en") {
    return sourceLanguage;
  }

  return "en";
}

function normalizeTtsLanguage(language: string) {
  if (language === "vi" || language === "th" || language === "ko" || language === "en") {
    return language;
  }

  return "en";
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
