"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthGuard } from "@/lib/use-auth-guard";

type Status = "idle" | "connecting" | "connected" | "disconnected" | "error";

export default function TerminalPage() {
  const { loading: authLoading } = useAuthGuard();
  const termRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // dynamically import xterm to avoid SSR issues
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    if (status === "connected" || status === "connecting") return;
    setStatus("connecting");
    setErrorMsg("");

    // Lazy-load xterm
    const { Terminal } = await import("@xterm/xterm");
    const { FitAddon } = await import("@xterm/addon-fit");
    const { WebLinksAddon } = await import("@xterm/addon-web-links");
    // Note: xterm CSS is included from the module itself

    if (!termRef.current) return;

    // Clean up previous instance
    if (xtermRef.current) { xtermRef.current.dispose(); xtermRef.current = null; }

    const term = new Terminal({
      cursorBlink: true,
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      theme: {
        background: "#0d1117",
        foreground: "#e6edf3",
        cursor: "#E4004B",
        cursorAccent: "#0d1117",
        selectionBackground: "rgba(228,0,75,0.3)",
        black: "#484f58",
        red: "#ff7b72",
        green: "#3fb950",
        yellow: "#d29922",
        blue: "#58a6ff",
        magenta: "#bc8cff",
        cyan: "#39c5cf",
        white: "#b1bac4",
        brightBlack: "#6e7681",
        brightRed: "#ffa198",
        brightGreen: "#56d364",
        brightYellow: "#e3b341",
        brightBlue: "#79c0ff",
        brightMagenta: "#d2a8ff",
        brightCyan: "#56d4dd",
        brightWhite: "#f0f6fc",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());
    term.open(termRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitRef.current = fitAddon;

    // WebSocket — connects to FastAPI agent terminal endpoint on VM
    const wsUrl = process.env.NEXT_PUBLIC_AGENT_WS_URL ?? `ws://65.1.54.28:80`;
    const terminalKey = process.env.NEXT_PUBLIC_AGENT_API_KEY ?? "";
    const ws = new WebSocket(`${wsUrl}/terminal/ws${terminalKey ? `?key=${terminalKey}` : ""}`);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      term.focus();
    };

    ws.onmessage = (e) => {
      const data = e.data instanceof ArrayBuffer
        ? new TextDecoder().decode(e.data)
        : e.data;
      term.write(data);
    };

    ws.onerror = () => {
      setStatus("error");
      setErrorMsg("WebSocket error — is the agent running on the VM?");
      term.writeln("\r\n\x1b[31mConnection error.\x1b[0m");
    };

    ws.onclose = () => {
      if (status !== "error") setStatus("disconnected");
      term.writeln("\r\n\x1b[33mSession closed.\x1b[0m");
    };

    // terminal → SSH
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Resize handling
    const handleResize = () => {
      fitAddon.fit();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", rows: term.rows, cols: term.cols }));
      }
    };
    window.addEventListener("resize", handleResize);
    term.onResize(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", rows: term.rows, cols: term.cols }));
      }
    });
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    xtermRef.current?.dispose();
    xtermRef.current = null;
    setStatus("idle");
  };

  const reconnect = () => {
    disconnect();
    setTimeout(connect, 100);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // Refit terminal after fullscreen change
      setTimeout(() => fitRef.current?.fit(), 100);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--crimson)", borderTopColor: "transparent" }} />
    </div>
  );

  const statusColor: Record<Status, string> = {
    idle: "var(--text-3)",
    connecting: "var(--gold-dark)",
    connected: "#15803D",
    disconnected: "var(--text-3)",
    error: "var(--crimson)",
  };
  const statusLabel: Record<Status, string> = {
    idle: "Not connected",
    connecting: "Connecting…",
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Error",
  };

  return (
    <div className="page-container" style={{ display: "flex", flexDirection: "column" }}>
      {/* Golden header */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="page-header-icon">💻</div>
            <h1 className="page-title">Terminal</h1>
          </div>
          <p className="page-subtitle">Interactive SSH terminal access to server infrastructure</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col px-8 py-8 max-w-7xl mx-auto w-full" style={{ minHeight: "calc(100vh - 80px)" }}>
        {/* Header info */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-1" style={{ color: "var(--crimson)" }}>Infrastructure</p>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>Terminal</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>
            SSH session — <span className="font-mono text-xs" style={{ color: "var(--text-3)" }}>65.1.54.28</span>
          </p>
        </div>

        {/* Terminal window */}
        <div ref={containerRef} className="flex-1 rounded-2xl overflow-hidden flex flex-col" style={{ background: "#0d1117", boxShadow: "var(--shadow-lg)", minHeight: isFullscreen ? "100vh" : 480 }}>
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: "#161b22", borderBottom: "1px solid #30363d" }}>
            {/* Traffic lights */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ff5f57" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#ffbd2e" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#28ca41" }} />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: statusColor[status] }} />
              <span className="text-xs font-mono" style={{ color: "#8b949e" }}>{statusLabel[status]}</span>
              {status === "connected" && (
                <span className="text-xs font-mono" style={{ color: "#8b949e" }}>
                  · {process.env.NEXT_PUBLIC_SSH_USER ?? "ubuntu"}@65.1.54.28
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {errorMsg && (
                <span className="text-xs px-2 py-1 rounded" style={{ background: "rgba(228,0,75,0.15)", color: "#ff7b72" }}>{errorMsg}</span>
              )}
              {(status === "idle" || status === "disconnected" || status === "error") && (
                <button onClick={connect}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(228,0,75,0.15)", color: "#E4004B" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(228,0,75,0.25)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(228,0,75,0.15)"}>
                  Connect
                </button>
              )}
              {status === "connected" && (
                <button onClick={reconnect}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.05)", color: "#8b949e" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}>
                  Reconnect
                </button>
              )}
              {status === "connecting" && (
                <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--gold)", borderTopColor: "transparent" }} />
              )}
              <button onClick={toggleFullscreen}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "#8b949e" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"}
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
                {isFullscreen ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* xterm container */}
          <div className="flex-1 relative">
            <div ref={termRef} className="absolute inset-0 p-2" />
            {status === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ pointerEvents: "none" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-12 h-12 mb-4" style={{ color: "#30363d" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <p className="text-sm font-mono" style={{ color: "#484f58" }}>Press Connect to start SSH session</p>
              </div>
            )}
          </div>
        </div>

        {/* Help note */}
        <p className="text-xs mt-3" style={{ color: "var(--text-3)" }}>
          Terminal connects to the agent on the VM. Ensure the agent is running and port 80 is accessible.
        </p>
      </div>
    </div>
  );
}
