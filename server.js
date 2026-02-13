/**
 * Custom Next.js Server with Socket.IO
 *
 * This server wraps Next.js with Socket.IO support for local development.
 * Socket.IO is initialized before any requests are handled.
 *
 * To use this:
 * - Update package.json script from "next dev" to "node server.js"
 * - Or create a new script: "dev:custom": "node server.js"
 *
 * For Vercel:
 * - The serverless functions will initialize Socket.IO on first request
 * - No changes needed for production
 */

const { createServer } = require("http");
const { parse } = require("url");
const path = require("path");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  // Store httpServer in globalThis so routes can access it for Socket.IO
  console.log(
    "📦 Storing httpServer in globalThis for Socket.IO initialization",
  );
  global.__httpServer__ = httpServer;

  // Initialize Socket.IO on the server
  console.log("🔌 Initializing Socket.IO on custom server...");
  try {
    const socketIOFactoryPath = path.join(
      __dirname,
      "lib",
      "socketIOFactory.js",
    );
    const getIOPath = path.join(__dirname, "lib", "getIO.js");

    const { getOrCreateSocketIO } = require(socketIOFactoryPath);
    const { setGlobalIO } = require(getIOPath);

    const io = getOrCreateSocketIO(httpServer);
    setGlobalIO(io);
    console.log("✅ Socket.IO initialized on server startup");
  } catch (err) {
    console.error("❌ Failed to initialize Socket.IO:", err);
  }

  // Start the server
  httpServer.listen(port, hostname, () => {
    console.log(`✓ Server ready at http://${hostname}:${port} with Socket.IO`);
  });
});
