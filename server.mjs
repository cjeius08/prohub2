import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import tls from "node:tls";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(root, "access-config.json");
const examplePath = path.join(root, "access-config.example.json");
const logsDir = path.join(root, "logs");
const accessLog = path.join(logsDir, "access.log");
const alertLog = path.join(logsDir, "alerts.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".webp": "image/webp",
};

async function readConfig() {
  try {
    return JSON.parse(await fs.readFile(configPath, "utf8"));
  } catch {
    const example = await fs.readFile(examplePath, "utf8");
    await fs.writeFile(configPath, example, "utf8");
    return JSON.parse(example);
  }
}

function normalizeIp(ip = "") {
  return ip.replace(/^::ffff:/, "");
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return normalizeIp(String(forwarded).split(",")[0].trim());
  return normalizeIp(req.socket.remoteAddress || "");
}

function isPageRequest(reqPath) {
  return reqPath === "/" || reqPath.endsWith(".html");
}

function isAllowed(ip, config) {
  return new Set(config.allowedIps || []).has(ip);
}

async function appendAccessLog(entry) {
  await fs.mkdir(logsDir, { recursive: true });
  await fs.appendFile(accessLog, `${JSON.stringify(entry)}\n`, "utf8");
}

async function shouldAlert(ip, config) {
  await fs.mkdir(logsDir, { recursive: true });
  let alerts = {};
  try {
    alerts = JSON.parse(await fs.readFile(alertLog, "utf8"));
  } catch {
    alerts = {};
  }
  const now = Date.now();
  const cooldownMs = Number(config.alertCooldownMinutes || 30) * 60 * 1000;
  if (alerts[ip] && now - alerts[ip] < cooldownMs) return false;
  alerts[ip] = now;
  await fs.writeFile(alertLog, JSON.stringify(alerts, null, 2), "utf8");
  return true;
}

function smtpRead(socket) {
  return new Promise((resolve, reject) => {
    let data = "";
    const onData = (chunk) => {
      data += chunk.toString("utf8");
      if (/\r?\n$/.test(data)) {
        socket.off("data", onData);
        resolve(data);
      }
    };
    socket.once("error", reject);
    socket.on("data", onData);
  });
}

async function smtpCommand(socket, command, expected = /^[23]/) {
  if (command) socket.write(`${command}\r\n`);
  const response = await smtpRead(socket);
  if (!expected.test(response)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
  return response;
}

async function sendEmail(config, subject, body) {
  const smtp = config.smtp || {};
  if (!smtp.enabled) return;

  const port = Number(smtp.port || 465);
  let socket = smtp.secure
    ? tls.connect({ host: smtp.host, port, servername: smtp.host })
    : net.connect({ host: smtp.host, port });

  await new Promise((resolve, reject) => {
    socket.once("secureConnect", resolve);
    socket.once("connect", () => {
      if (!smtp.secure) resolve();
    });
    socket.once("error", reject);
  });

  await smtpCommand(socket, null);
  await smtpCommand(socket, `EHLO ${smtp.host}`);
  if (!smtp.secure) {
    await smtpCommand(socket, "STARTTLS");
    socket = tls.connect({ socket, servername: smtp.host });
    await new Promise((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });
    await smtpCommand(socket, `EHLO ${smtp.host}`);
  }

  await smtpCommand(socket, "AUTH LOGIN", /^334/);
  await smtpCommand(socket, Buffer.from(smtp.user, "utf8").toString("base64"), /^334/);
  await smtpCommand(socket, Buffer.from(smtp.pass, "utf8").toString("base64"));
  await smtpCommand(socket, `MAIL FROM:<${smtp.from || smtp.user}>`);
  await smtpCommand(socket, `RCPT TO:<${smtp.to}>`);
  await smtpCommand(socket, "DATA", /^354/);

  const messageId = crypto.randomUUID();
  const message = [
    `From: ${smtp.from || smtp.user}`,
    `To: ${smtp.to}`,
    `Subject: ${subject}`,
    `Message-ID: <${messageId}@wagmi-work-hub.local>`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body.replace(/\r?\n\./g, "\n.."),
    ".",
  ].join("\r\n");

  await smtpCommand(socket, message);
  await smtpCommand(socket, "QUIT", /^[23]/);
  socket.end();
}

async function alertIfNeeded(entry, config) {
  if (entry.allowed || !isPageRequest(entry.path)) return;
  if (!(await shouldAlert(entry.ip, config))) return;

  const subject = "Wagmi Work Hub access alert";
  const body = [
    "Someone outside your allowed IP list opened Wagmi Work Hub.",
    "",
    `Time: ${entry.time}`,
    `IP: ${entry.ip}`,
    `Path: ${entry.path}`,
    `User Agent: ${entry.userAgent}`,
    "",
    `Allowed IPs: ${(config.allowedIps || []).join(", ")}`,
  ].join("\n");

  await sendEmail(config, subject, body);
}

function safeFilePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const relative = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "");
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

const config = await readConfig();

const server = http.createServer(async (req, res) => {
  const ip = clientIp(req);
  const url = new URL(req.url || "/", "http://localhost");
  const entry = {
    time: new Date().toISOString(),
    ip,
    allowed: isAllowed(ip, config),
    method: req.method,
    path: url.pathname,
    userAgent: req.headers["user-agent"] || "",
  };

  await appendAccessLog(entry);
  alertIfNeeded(entry, config).catch(async (error) => {
    await fs.appendFile(accessLog, `${JSON.stringify({ time: new Date().toISOString(), alertError: error.message })}\n`, "utf8");
  });

  const filePath = safeFilePath(url.pathname);
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

const port = Number(process.env.PORT || 8787);
server.listen(port, "0.0.0.0", () => {
  console.log(`Wagmi Work Hub running at http://localhost:${port}`);
  console.log(`Access log: ${accessLog}`);
  if (!config.smtp?.enabled) {
    console.log("Email alerts are off. Edit access-config.json to enable SMTP alerts.");
  }
});
