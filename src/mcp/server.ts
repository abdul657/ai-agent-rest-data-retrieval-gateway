import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { pool } from "../db/pool.js";
import { searchCatalog, getCatalogItem } from "../catalog/search.js";

serveStdio(() => {
  const server = new McpServer({ name: "inventory-data-gateway", version: "1.0.0" });
  server.registerTool(
    "search_inventory",
    {
      description: "Search inventory catalogue records by SKU, product name, or description.",
      inputSchema: z.object({
        query: z.string().min(2).max(120),
        limit: z.number().int().min(1).max(50).default(10)
      })
    },
    async ({ query, limit }) => {
      try {
        const items = await searchCatalog(pool, query, limit);
        return { content: [{ type: "text", text: JSON.stringify({ count: items.length, items }) }] };
      } catch (error) {
        return {
          isError: true,
          content: [{ type: "text", text: error instanceof Error ? error.message : "Search failed" }]
        };
      }
    }
  );
  server.registerTool(
    "get_inventory_item",
    {
      description: "Retrieve one inventory item by exact SKU.",
      inputSchema: z.object({ sku: z.string().min(2).max(64) })
    },
    async ({ sku }) => {
      const item = await getCatalogItem(pool, sku);
      return {
        content: [{ type: "text", text: item ? JSON.stringify(item) : JSON.stringify({ found: false, sku }) }]
      };
    }
  );
  return server;
});
