import { createServer } from "node:http";
import next from "next";
import { Server as SocketServer } from "socket.io";

/*
 * Next plus Socket.IO in one Node process.
 *
 * Socket.IO needs a connection that stays open, which serverless functions
 * cannot provide - so this server is what you run on a Node host to get
 * realtime CMS updates. `next start` still works without it; clients then
 * fall back to polling /api/content/version.
 */
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

await app.prepare();

const httpServer = createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error("Request failed:", error);
    res.statusCode = 500;
    res.end("Internal Server Error");
  });
});

const io = new SocketServer(httpServer, {
  path: "/api/socket",
  // Same-origin only; the site and the socket are served from this process.
  cors: { origin: false },
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {});
});

/*
 * Route handlers run in this process, so they publish through globalThis
 * rather than importing this file (which would start a second server).
 */
globalThis.__apexIo = io;

httpServer.listen(port, hostname, () => {
  console.log(`> APEX ready on http://${hostname}:${port} (realtime: socket.io at /api/socket)`);
});
