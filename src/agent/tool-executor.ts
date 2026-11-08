import type { Pool } from "pg";
import { z } from "zod";
import { getCatalogItem, searchCatalog } from "../catalog/search.js";
const searchSchema = z.object({
  query: z.string().trim().min(2).max(120),
  limit: z.number().int().min(1).max(50).default(10)
}).strict();
const itemSchema = z.object({ sku: z.string().trim().min(2).max(64) }).strict();

export async function executeAgentTool(pool: Pool, name: string, input: unknown): Promise<unknown> {
  if (name === "search_inventory") {
    const args = searchSchema.parse(input);
    return searchCatalog(pool, args.query, args.limit);
  }
  if (name === "get_inventory_item") {
    const args = itemSchema.parse(input);
    const item = await getCatalogItem(pool, args.sku);
    return item ?? { found: false, sku: args.sku };
  }
  throw new Error(`Unsupported tool: ${name}`);
}
