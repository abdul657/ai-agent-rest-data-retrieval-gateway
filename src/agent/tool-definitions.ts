export const agentToolDefinitions = [
  {
    type: "function",
    function: {
      name: "search_inventory",
      description: "Search inventory catalogue records by SKU, product name, or description.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: {
          query: { type: "string", minLength: 2, description: "Text to find in the inventory catalogue." },
          limit: { type: "integer", minimum: 1, maximum: 50, default: 10 }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_inventory_item",
      description: "Retrieve a single inventory item by its exact SKU.",
      parameters: {
        type: "object",
        additionalProperties: false,
        properties: { sku: { type: "string", minLength: 2 } },
        required: ["sku"]
      }
    }
  }
] as const;
