import { createApp } from "./app.js";
import { pool } from "../db/pool.js";
import { config } from "../config.js";
const app = createApp(pool);
const server = app.listen(config.port, () => console.log(`REST gateway listening on port ${config.port}`));
async function shutdown(signal: string) {
  console.log(`${signal} received; shutting down`);
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
