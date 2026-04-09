/**
 * Custom Next.js server with WebSocket SSH bridge.
 * Run with: node server.mjs
 *
 * Requires env vars:
 *   SSH_HOST, SSH_PORT (default 22), SSH_USER
 *   SSH_PASSWORD  — for password auth
 *   SSH_KEY_PATH  — for private key auth (absolute path to PEM file)
 */

import { createServer } from "http";
import { readFileSync } from "fs";
import { WebSocketServer } from "ws";
import { Client as SshClient } from "ssh2";
import { parse } from "url";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000");

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // ─── WebSocket SSH bridge ─────────────────────────────────────────────────
  const wss = new WebSocketServer({ server, path: "/api/terminal/ws" });

  wss.on("connection", (ws) => {
    const ssh = new SshClient();
    let stream = null;

    const sshConfig = {
      host: process.env.SSH_HOST ?? "65.1.54.28",
      port: parseInt(process.env.SSH_PORT ?? "22"),
      username: process.env.SSH_USER ?? "ubuntu",
      readyTimeout: 10000,
    };

    // Auth: prefer key file, fall back to password
    if (process.env.SSH_KEY_PATH) {
      try {
        sshConfig.privateKey = readFileSync(process.env.SSH_KEY_PATH);
      } catch {
        ws.send("\r\nError: could not read SSH_KEY_PATH\r\n");
        ws.close();
        return;
      }
    } else if (process.env.SSH_PASSWORD) {
      sshConfig.password = process.env.SSH_PASSWORD;
    } else {
      ws.send("\r\nError: no SSH credentials configured (SSH_PASSWORD or SSH_KEY_PATH)\r\n");
      ws.close();
      return;
    }

    ws.send("\r\nConnecting to " + sshConfig.host + "…\r\n");

    ssh.on("ready", () => {
      ssh.shell({ term: "xterm-256color" }, (err, sh) => {
        if (err) {
          ws.send("\r\nSSH shell error: " + err.message + "\r\n");
          ws.close();
          return;
        }
        stream = sh;

        // SSH → browser
        sh.on("data", (data) => {
          if (ws.readyState === ws.OPEN) ws.send(data);
        });
        sh.stderr.on("data", (data) => {
          if (ws.readyState === ws.OPEN) ws.send(data);
        });

        // browser → SSH
        ws.on("message", (data) => {
          const msg = JSON.parse(data.toString());
          if (msg.type === "input") {
            sh.write(msg.data);
          } else if (msg.type === "resize") {
            sh.setWindow(msg.rows, msg.cols, 0, 0);
          }
        });

        sh.on("close", () => {
          if (ws.readyState === ws.OPEN) ws.close();
        });
      });
    });

    ssh.on("error", (err) => {
      if (ws.readyState === ws.OPEN) {
        ws.send("\r\nSSH error: " + err.message + "\r\n");
        ws.close();
      }
    });

    ws.on("close", () => {
      if (stream) stream.close();
      ssh.end();
    });

    ssh.connect(sshConfig);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
