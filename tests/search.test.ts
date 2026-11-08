import { describe, expect, it } from "vitest";
import { buildCatalogSearch } from "../src/catalog/search.js";
import { agentToolDefinitions } from "../src/agent/tool-definitions.js";

describe("buildCatalogSearch", () => {
  it("uses a parameterized query and trims search text", () => {
    const statement = buildCatalogSearch("  router  ", 5);
    expect(statement.text).toContain("ILIKE $1");
    expect(statement.text).toContain("LIMIT $2");
    expect(statement.values).toEqual(["%router%", 5]);
    expect(statement.text).not.toContain("router");
  });
  it("rejects short search strings", () => {
    expect(() => buildCatalogSearch("x")).toThrow(/at least 2 characters/);
  });
  it("bounds page size", () => {
    expect(() => buildCatalogSearch("switch", 0)).toThrow(/between 1 and 50/);
    expect(() => buildCatalogSearch("switch", 51)).toThrow(/between 1 and 50/);
  });
});
describe("agent tool definitions", () => {
  it("publishes the supported tool names", () => {
    expect(agentToolDefinitions.map((tool) => tool.function.name))
      .toEqual(["search_inventory", "get_inventory_item"]);
  });
});
