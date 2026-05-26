import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.env.PORT ?? 4180);
const host = process.env.HOST ?? "127.0.0.1";
const root = path.resolve("dist");
const types = new Map([
  [".css", "text/css"],
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".svg", "image/svg+xml"],
]);

createServer(async (request, response) => {
  const url = decodeURIComponent((request.url ?? "/").split("?")[0]);
  const filePath = path.join(root, url === "/" ? "index.html" : url);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": types.get(path.extname(filePath)) ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    const body = await readFile(path.join(root, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(body);
  }
}).listen(port, host, () => {
  console.log(`Serving dist at http://${host}:${port}`);
});
