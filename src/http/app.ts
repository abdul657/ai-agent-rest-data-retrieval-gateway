import express, { type ErrorRequestHandler } from "express";
import { z } from "zod";
import type { Pool } from "pg";
import { getCatalogItem, searchCatalog } from "../catalog/search.js";
import { agentToolDefinitions } from "../agent/tool-definitions.js";
import { executeAgentTool } from "../agent/tool-executor.js";
const searchParams = z.object({
  q: z.string().trim().min(2).max(120),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});
export function createApp(pool: Pool) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));
  app.get("/api/v1/health", async (_req, res) => {
    try { await pool.query("SELECT 1"); res.json({ status: "ok", database: "connected" }); }
    catch { res.status(503).json({ status: "degraded", database: "unavailable" }); }
  });
  app.get("/api/v1/search", async (req, res, next) => {
    try {
      const parsed = searchParams.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid search parameters", details: parsed.error.flatten() });
        return;
      }
      const items = await searchCatalog(pool, parsed.data.q, parsed.data.limit);
      res.json({ query: parsed.data.q, count: items.length, items });
    } catch (error) { next(error); }
  });
  app.get("/api/v1/items/:sku", async (req, res, next) => {
    try {
      const sku = String(req.params.sku);
      const item = await getCatalogItem(pool, sku);
      if (!item) { res.status(404).json({ error: "Catalogue item not found", sku }); return; }
      res.json(item);
    } catch (error) { next(error); }
  });
  app.get("/api/v1/agent/tools", (_req, res) => res.json({ tools: agentToolDefinitions }));
  app.post("/api/v1/agent/tools/:name", async (req, res, next) => {
    try {
      const result = await executeAgentTool(pool, String(req.params.name), req.body);
      res.json({ tool: req.params.name, result });
    } catch (error) { next(error); }
  });
  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Tool input validation failed", details: error.flatten() });
      return;
    }
    if (error instanceof Error && /Search query|limit must|Unsupported tool/.test(error.message)) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);
  return app;
}
