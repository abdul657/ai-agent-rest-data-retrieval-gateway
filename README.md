# AI Agent & REST Data Retrieval Gateway

A TypeScript/Node.js service that exposes a PostgreSQL inventory catalogue through versioned REST endpoints, an MCP server, and provider-neutral tool definitions for AI function calling.

> This engineering demo exposes data and tools to an MCP host or LLM-enabled application. It does not call an LLM provider or generate natural-language answers by itself.

## Architecture

- **REST API:** Express routes under `/api/v1`, Zod request validation, structured errors, and parameterized PostgreSQL queries.
- **MCP server:** stdio server exposing `search_inventory` and `get_inventory_item`.
- **Agent tool bindings:** JSON Schema function definitions and an executor mapping tool calls to shared catalogue functions.
- **Data:** PostgreSQL schema, indexes, and sample catalogue records.
- **Quality:** TypeScript strict mode, Vitest unit tests, Docker Compose, and GitHub Actions.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Database readiness |
| GET | `/api/v1/search?q=router&limit=10` | Search SKU, name, description |
| GET | `/api/v1/items/:sku` | Retrieve one item by SKU |
| GET | `/api/v1/agent/tools` | List function-calling definitions |
| POST | `/api/v1/agent/tools/search_inventory` | Execute search tool |
| POST | `/api/v1/agent/tools/get_inventory_item` | Execute exact-SKU lookup |

```bash
curl "http://localhost:4000/api/v1/search?q=router&limit=5"
curl "http://localhost:4000/api/v1/items/NET-1001"
curl -X POST http://localhost:4000/api/v1/agent/tools/search_inventory \
  -H "Content-Type: application/json" -d '{"query":"router","limit":5}'
```

## Run locally

Requirements: Node.js 22+, npm, Docker.

```bash
docker compose up --build
```

The API starts at `http://localhost:4000`. Compose initializes PostgreSQL and loads sample rows from `db/schema.sql`.

To run the MCP process locally, set `DATABASE_URL` and run `npm install && npm run mcp`. Configure an MCP-compatible host to launch `npm run mcp` from this repository. MCP communicates over stdio; application logs are not written to stdout.

## MCP and agent tools

- `search_inventory(query, limit?)`: search catalogue SKU, name, and description.
- `get_inventory_item(sku)`: retrieve one exact-SKU record.

The REST and MCP interfaces use the same parameterized repository functions. `src/agent/tool-definitions.ts` exports provider-neutral JSON Schema declarations; `executeAgentTool` validates and runs supported calls. Connect those declarations to the function/tool-calling format of your selected model provider.

## Tests and build

```bash
npm install
npm test
npm run build
```

Tests cover query parameterization, input bounds, and tool metadata without requiring a live database.

## Security and scope

SQL values are parameterized, input is validated, and result sizes are bounded. The demo omits authentication, tenant isolation, rate limiting, and managed secrets; add these before exposing it to untrusted networks. Compose credentials are development-only. No model-provider key or cloud credential is needed for the base project.

## Layout

```text
src/agent/     tool schemas and executor
src/catalog/   shared PostgreSQL queries
src/http/      Express REST API
src/mcp/       MCP stdio server
db/            schema and seed data
tests/         unit tests
```
