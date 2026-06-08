import http from "node:http";

const host = process.env.LINKUP_AI_HOST || "127.0.0.1";
const port = Number(process.env.LINKUP_AI_PORT || 8787);
const token = process.env.LINKUP_AI_TOKEN || "";
const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const model = process.env.QWEN_MODEL || "qwen2.5:7b-instruct";

const server = http.createServer(async (request, response) => {
  try {
    setCors(response);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, {
        model,
        ok: true,
        retention: "Requests are processed in memory and not stored by this server.",
      });
      return;
    }

    if (request.method !== "POST" || request.url !== "/classify") {
      sendJson(response, 404, { error: "Not found." });
      return;
    }

    if (token && request.headers.authorization !== `Bearer ${token}`) {
      sendJson(response, 401, { error: "Unauthorized." });
      return;
    }

    const body = await readJson(request);
    if (!isValidBody(body)) {
      sendJson(response, 400, { error: "Invalid request body." });
      return;
    }

    const result = await classifyWithQwen(body);
    sendJson(response, 200, result);
  } catch {
    sendJson(response, 500, {
      error: "AI server failed without storing the request.",
    });
  }
});

server.listen(port, host, () => {
  console.log(`LinkUP Qwen AI server listening at http://${host}:${port}/classify`);
  console.log(`Model: ${model}`);
});

async function classifyWithQwen(body) {
  const allowedLegalKeys = body.allowedLegalKeys.slice(0, 20);
  const prompt = [
    "You are LinkUP's privacy-preserving intake assistant.",
    "You receive already-masked worker intake text. Do not ask for names, phone numbers, addresses, or exact private identifiers.",
    "Your job is classification and follow-up only. Do not give legal advice. Do not invent legal keys.",
    "Return JSON only, with this exact shape:",
    '{"followUpQuestions":["short question"],"legalKeys":["one_allowed_key"],"note":"short privacy note"}',
    "",
    "Allowed legalKeys:",
    allowedLegalKeys.join(", "),
    "",
    "Issue:",
    String(body.issueId),
    "",
    "Worker language:",
    String(body.language),
    "",
    "Selected options:",
    body.selectedOptions.join(" | ") || "(none)",
    "",
    "Masked text:",
    body.maskedText || "(none)",
    "",
    "Rules:",
    "- Choose only legalKeys from the allowed list.",
    "- If unsure, return an empty legalKeys array.",
    "- Ask at most 4 follow-up questions.",
    "- Follow-up questions should be in the worker language when possible.",
    "- Keep the note under 180 characters.",
  ].join("\n");

  const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      format: "json",
      model,
      options: {
        temperature: 0.1,
      },
      prompt,
      stream: false,
    }),
  });

  if (!ollamaResponse.ok) {
    throw new Error("Ollama request failed.");
  }

  const data = await ollamaResponse.json();
  const parsed = safeJsonParse(typeof data.response === "string" ? data.response : "{}");
  return normalizeResult(parsed, allowedLegalKeys);
}

function normalizeResult(value, allowedLegalKeys) {
  const allowed = new Set(allowedLegalKeys);
  const followUpQuestions = Array.isArray(value.followUpQuestions)
    ? value.followUpQuestions.filter((item) => typeof item === "string" && item.trim()).slice(0, 4)
    : [];
  const legalKeys = Array.isArray(value.legalKeys)
    ? value.legalKeys.filter((item) => typeof item === "string" && allowed.has(item)).slice(0, 6)
    : [];

  return {
    followUpQuestions,
    legalKeys,
    note:
      typeof value.note === "string" && value.note.trim()
        ? value.note.trim().slice(0, 180)
        : "Masked intake was classified in memory and not stored.",
  };
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return {};
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return {};
    }
  }
}

function isValidBody(value) {
  return (
    value &&
    typeof value === "object" &&
    typeof value.issueId === "string" &&
    typeof value.language === "string" &&
    typeof value.maskedText === "string" &&
    Array.isArray(value.allowedLegalKeys) &&
    value.allowedLegalKeys.every((item) => typeof item === "string") &&
    Array.isArray(value.selectedOptions) &&
    value.selectedOptions.every((item) => typeof item === "string")
  );
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw || raw.length > 20_000) {
    return null;
  }
  return JSON.parse(raw);
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}

function setCors(response) {
  response.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Origin", "*");
}
