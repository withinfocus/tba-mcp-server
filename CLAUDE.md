# Claude Instructions for TBA MCP Server

Model Context Protocol (MCP) server that provides access to The Blue Alliance API for FIRST Robotics Competition data.

## Project Overview

- **Language**: TypeScript with Node.js
- **Framework**: Model Context Protocol SDK
- **Package Manager**: pnpm (version pinned in `packageManager`; settings in `pnpm-workspace.yaml`)
- **Main Entry**: `src/index.ts`
- **Build Output**: `dist/`
- **Transport**: stdio for MCP communication

## Project Structure

### Source Code Architecture

The codebase is organized into separate modules for maintainability:

- `src/index.ts` - Main server entry point
  - Validates `TBA_API_KEY` at startup
  - Serves the MCP server over stdio with `serveStdio(() => createServer(version))`
  - Handles error logging and process lifecycle

- `src/server.ts` - Server factory
  - Exports `createServer(version)`, which builds an `McpServer` (from `@modelcontextprotocol/server`) and calls `registerTool()` once per entry in the `tools` table
  - Returns the server unconnected, so extensions can be attached before `serveStdio` connects it

- `src/tools.ts` - Tool table
  - Exports the `tools` array of `ToolDefinition` entries, one per MCP tool, built with `defineTool()`
  - Each entry has: `name`, `title`, `description`, `inputSchema` (a Zod object schema), `endpoint(args)` (builds the TBA API path), and `responseSchema` (Zod)
  - Exports `READ_ONLY_API`, the tool annotations every tool shares
  - Both server registration and the unit tests read from this table

- `src/handlers.ts` - Tool execution
  - Exports `executeTool(tool, args)`: calls `makeApiRequest(tool.endpoint(args))`, validates the response with `tool.responseSchema`, and returns the JSON as text content
  - Failures (HTTP, network, unexpected response shape) come back as `isError: true` results with an `Error: ...` message
  - Input validation is not done here: the SDK validates arguments against `inputSchema` before calling the handler

- `src/schemas.ts` - Zod validation schemas
  - Parameter schemas: TeamKeySchema, YearSchema, EventKeySchema, etc.
  - Tool input schemas: `Get*InputSchema` (one `z.object` per tool)
  - API response schemas: TeamSchema, EventSchema, MatchSchema, etc.
  - All schemas use Zod for runtime type validation

- `src/utils.ts` - Utility functions
  - `log()` - Writes server logs to stderr (stdout carries the stdio JSON-RPC stream)
  - `getApiKey()` - Retrieves and validates TBA_API_KEY environment variable
  - `makeApiRequest()` - Makes HTTP requests to TBA API with proper headers

### Test Architecture

Tests are organized to mirror the source structure:

- `tests/tools.spec.ts` - Unit tests for the tool table and the `tools/list` output (schemas, annotations, endpoints)
- `tests/handlers.spec.ts` - Unit tests for `tools/call` (input validation, error results) and `executeTool`
- `tests/server.spec.ts` - Unit tests for `createServer`
- `tests/schemas.spec.ts` - Unit tests for all Zod schemas
- `tests/utils.spec.ts` - Unit tests for utility functions
- `tests/in-memory-client.ts` - Test helper that connects an SDK `Client` to `createServer()` over `InMemoryTransport`
- `tests/integration/*.spec.ts` - Playwright integration tests for MCP protocol compliance, using a raw JSON-RPC stdio client (`tests/integration/mcp-client.ts`)

### Configuration Files

- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules
- `jest.config.js` - Jest test configuration (looks for `*.spec.ts` files)
- `playwright.config.ts` - Playwright integration test configuration

## Code Standards

- TypeScript with strict type checking
- ESLint for code quality
- Prettier for formatting
- Husky for pre-commit hooks
- Jest for unit testing
- Playwright for integration testing

## Testing Requirements

Two types of tests exist that should both be run:

### Unit Tests (Jest)

```bash
pnpm test                 # Run unit tests
pnpm run test:watch       # Run unit tests in watch mode
```

### Integration Tests (Playwright)

```bash
pnpm run test:integration         # Run all integration tests
pnpm run test:integration:ui      # Run with Playwright UI
pnpm run test:integration:debug   # Debug mode
pnpm run test:all                 # Run both unit and integration tests
```

**IMPORTANT**: Always run both test suites when making changes:

1. Run `pnpm test` for unit tests
2. Run `pnpm run test:integration` for integration tests
3. Or use `pnpm run test:all` to run everything

### Integration Test Requirements

The integration tests require:

- A valid TBA API key set as `TBA_API_KEY` environment variable
- The project to be built first (`pnpm run build`)
- Tests cover MCP protocol compliance, API endpoint functionality, error handling, performance, and data validation

### Key Integration Test Areas

- **MCP Protocol**: Server initialization, tool listing, request/response handling
- **API Endpoints**: All 89 TBA API tools with proper parameter validation
- **Error Handling**: Invalid inputs, API failures, missing parameters
- **Performance**: Response times, concurrent requests, memory usage
- **Data Validation**: Schema compliance, consistency across endpoints
- **Reliability**: Server stability, state management, cleanup

## Development Workflow

1. Make code changes
2. Build the project: `pnpm run build`
3. Run linting: `pnpm run lint` (fix with `pnpm run lint:fix`)
4. Run unit tests: `pnpm test`
5. Run integration tests: `pnpm run test:integration`
6. Ensure both test suites pass before considering changes complete

## Development Commands

```bash
pnpm run build                    # Build TypeScript to dist/
pnpm run lint                     # Run ESLint and Prettier
pnpm run lint:fix                 # Auto-fix linting issues
pnpm test                         # Run Jest unit tests
pnpm run test:watch               # Run tests in watch mode
pnpm run test:integration         # Run Playwright integration tests
pnpm run test:all                 # Run all tests (unit + integration)
pnpm run inspect                  # Launch MCP inspector for debugging
```

## MCP Server Details

- **Name**: The Blue Alliance MCP Server
- **SDK**: MCP TypeScript SDK v2 (`@modelcontextprotocol/server`; `@modelcontextprotocol/client` is a dev dependency for unit tests)
- **Server class**: `McpServer`, tools registered with `registerTool()`
- **Transport**: stdio via `serveStdio()`, which answers both the 2025-era `initialize` handshake and the 2026-07-28 `server/discover` opening
- **Current Capabilities**: Access to The Blue Alliance API for FRC data

## How to Add a New Tool

Most tools are one entry in the `tools` table. Follow these steps when adding a new MCP tool to the server:

### 1. Create the Input Schema (`src/schemas.ts`)

Add a `z.object` describing the tool arguments. Reuse the parameter schemas (`TeamKeySchema`, `YearSchema`, ...) so patterns, ranges, and descriptions stay consistent:

```typescript
export const GetTeamMediaInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});
```

The SDK converts this schema to JSON Schema for `tools/list` and validates `tools/call` arguments against it, so constraints such as `.regex()`, `.min()`, `.max()`, and `.describe()` are what clients see and what the server enforces.

### 2. Create a Response Schema (`src/schemas.ts`)

If the API response needs a new schema, add it:

```typescript
export const MediaSchema = z.object({
  type: z.string(),
  foreign_key: z.string(),
  details: z.record(z.string(), z.any()).nullish(),
  preferred: z.boolean().nullish(),
  direct_url: z.string().nullish(),
  view_url: z.string().nullish(),
});
```

Export both schemas and import them in `src/tools.ts`.

### 3. Add the Tool to the Table (`src/tools.ts`)

Add a `defineTool()` entry to the `tools` array:

```typescript
defineTool({
  name: 'get_team_media',
  title: 'Get Team Media for a Year',
  description: 'Get media (photos, videos) for a team in a specific year',
  inputSchema: GetTeamMediaInputSchema,
  endpoint: ({ team_key, year }) => `/team/${team_key}/media/${year}`,
  responseSchema: z.array(MediaSchema),
}),
```

**Entry pattern:**

- `endpoint` receives arguments that are already validated and typed from `inputSchema`; it returns the path under `https://www.thebluealliance.com/api/v3`
- `responseSchema` validates the TBA response before it is returned
- `select` (optional) post-processes the validated response with access to the arguments; use it only when the raw payload is too large or noisy for a model (see `get_search_index` and `get_event_team_media`)
- `createServer()` registers the entry with `registerTool()`, adding the shared read-only annotations (`READ_ONLY_API`) and the `title`
- `executeTool()` in `src/handlers.ts` runs the request and formats the result as `JSON.stringify(data, null, 2)` text content; errors become `isError: true` results

There is no handler or `switch` case to write. Only change `src/handlers.ts` or `src/server.ts` if a tool needs behavior the table cannot express.

### 4. Add Unit Tests

Add unit tests based on what you modified:

**If you added a new schema** (`tests/schemas.spec.ts`):

```typescript
describe('MediaSchema', () => {
  it('should validate media schema', () => {
    const validMedia = {
      type: 'youtube',
      foreign_key: 'dQw4w9WgXcQ',
      details: {},
      preferred: true,
      view_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    };

    expect(() => MediaSchema.parse(validMedia)).not.toThrow();
  });

  it('should reject invalid media schema', () => {
    const invalidMedia = {
      type: 123, // Should be string
      foreign_key: 'dQw4w9WgXcQ',
    };

    expect(() => MediaSchema.parse(invalidMedia)).toThrow();
  });
});
```

**If you added a new tool** (`tests/tools.spec.ts`):

- Add the expected path to `EXPECTED_ENDPOINTS` (the endpoint test fails until you do) and bump the tool count
- Add a check against the listed definition if the tool has notable parameters:

```typescript
it('should have get_team_media tool', () => {
  const tool = find('get_team_media');
  expect(tool).toBeDefined();
  expect(tool?.description).toContain('media');
  expect(tool?.inputSchema.required).toContain('team_key');
  expect(tool?.inputSchema.required).toContain('year');
});
```

**To test a tool call** (`tests/handlers.spec.ts`), call it through the in-memory SDK client (the `handleToolCall` helper in that spec) with a mocked `fetch`:

```typescript
it('should handle get_team_media', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  } as Response);

  const result = await handleToolCall('get_team_media', {
    team_key: 'frc86',
    year: 2024,
  });

  expect(result.content[0]!.type).toBe('text');
  const data = JSON.parse(result.content[0]!.text);
  expect(Array.isArray(data)).toBe(true);
});
```

**If you modified utility functions** (`tests/utils.spec.ts`):

Add tests to validate the utility function behavior.

### 5. Add Integration Tests (`tests/integration/tba-api.spec.ts`)

Add an integration test that calls your new tool via the MCP protocol:

```typescript
// Inside the existing describe block, which creates `mcpClient` in beforeEach
test('should get team media for a year', async () => {
  const result = await mcpClient.callTool('get_team_media', {
    team_key: 'frc86',
    year: 2024,
  });

  expect(result.content).toBeInstanceOf(Array);
  expect(result.content[0]?.type).toBe('text');
  const content = JSON.parse(result.content[0]?.text || '');
  expect(Array.isArray(content)).toBe(true);
});
```

### 6. Build and Test

```bash
pnpm run build                # Build TypeScript
pnpm run lint                 # Check code quality
pnpm test                     # Run unit tests
pnpm run test:integration     # Run integration tests
```

## When Working on The Project

1. Always run `pnpm run build` after making changes
2. Run `pnpm run lint` to ensure code quality
3. Run tests with `pnpm run test` and `pnpm run test:integration` before committing
4. Use `pnpm run inspect` to debug MCP functionality
5. Follow existing TypeScript patterns and MCP SDK conventions
6. When adding new tools, follow the 6-step process outlined above
7. Keep the separation of concerns: schemas → tool table (`tools.ts`) → execution (`handlers.ts`) → registration (`server.ts`) → tests

Always verify that both unit tests and integration tests pass before considering any changes complete.
