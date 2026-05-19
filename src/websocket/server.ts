import { WebSocketServer } from "ws";
import { env } from "../utils/env.js";
import { logger } from "../utils/logger.js";

export type LiveMessage =
  | { type: "line"; line: string }
  | { type: "status"; message: string }
  | { type: "result"; payload: unknown };

export function startWebsocketServer(onLine: (line: string) => void | Promise<void>) {
  const port = Number(env("WS_PORT", "7337"));
  const wss = new WebSocketServer({ port });
  wss.on("connection", (ws) => {
    ws.send(JSON.stringify({ type: "status", message: "connected" } satisfies LiveMessage));
    ws.on("message", async (data) => {
      try {
        const msg = JSON.parse(String(data)) as LiveMessage;
        if (msg.type === "line") await onLine(msg.line);
      } catch (e) {
        logger.warn({ e }, "ws message parse error");
      }
    });
  });
  logger.info({ port }, "websocket server started");
  return wss;
}
