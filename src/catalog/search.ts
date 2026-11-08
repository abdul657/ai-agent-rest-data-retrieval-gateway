import type { Pool } from "pg";
export interface CatalogItem {
  id: number;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  updated_at: Date | string;
}
export interface SearchQuery { text: string; values: [string, number]; }

export function buildCatalogSearch(query: string, limit = 10): SearchQuery {
  const text = query.trim();
  if (text.length < 2) throw new Error("Search query must contain at least 2 characters");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error("limit must be an integer between 1 and 50");
  }
  return {
    text: `SELECT id, sku, name, description, quantity, location, updated_at
      FROM catalog_items
      WHERE sku ILIKE $1 OR name ILIKE $1 OR description ILIKE $1
      ORDER BY name ASC LIMIT $2`,
    values: [`%${text}%`, limit]
  };
}
export async function searchCatalog(pool: Pool, query: string, limit = 10): Promise<CatalogItem[]> {
  const statement = buildCatalogSearch(query, limit);
  const result = await pool.query<CatalogItem>(statement.text, statement.values);
  return result.rows;
}
export async function getCatalogItem(pool: Pool, sku: string): Promise<CatalogItem | null> {
  const result = await pool.query<CatalogItem>(
    `SELECT id, sku, name, description, quantity, location, updated_at
     FROM catalog_items WHERE sku = $1 LIMIT 1`,
    [sku.trim().toUpperCase()]
  );
  return result.rows[0] ?? null;
}
