# Contributing to TBA MCP Server

## Prerequisites

- Node.js 26
- pnpm 12+
- A [The Blue Alliance API key](https://www.thebluealliance.com/account)

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/withinfocus/tba-mcp-server.git
cd tba-mcp-server
pnpm install --frozen-lockfile
```

### 2. Configure Environment

Set your The Blue Alliance API key:

```bash
export TBA_API_KEY=your_api_key_here
```

Or create a `.env` file:

```bash
TBA_API_KEY=your_api_key_here
```

### 3. Build the Project

```bash
pnpm run build
```

## Development Workflow

1. Make code changes
2. Build the project: `pnpm run build`
3. Run linting: `pnpm run lint` (fix with `pnpm run lint:fix`)
4. Run unit tests: `pnpm test`
5. Run integration tests: `pnpm run test:integration`
6. Ensure both test suites pass before committing

## Available Commands

```bash
pnpm run build                    # Build TypeScript to dist/
pnpm run lint                     # Run ESLint and Prettier
pnpm run lint:fix                 # Auto-fix linting issues
pnpm test                         # Run Jest unit tests
pnpm run test:watch               # Run tests in watch mode
pnpm run test:integration         # Run Playwright integration tests
pnpm run test:integration:ui      # Run with Playwright UI
pnpm run test:integration:debug   # Debug mode
pnpm run test:all                 # Run all tests (unit + integration)
pnpm run inspect                  # Launch MCP inspector for debugging
pnpm run skills:sync              # Copy shared skill references into every skill
```

## Testing

### Unit Tests (Jest)

Unit tests validate individual components:

```bash
pnpm test                 # Run once
pnpm run test:watch       # Watch mode for development
```

Tests are located in `tests/*.spec.ts` and cover:

- Zod schemas (`tests/schemas.spec.ts`)
- Utility functions (`tests/utils.spec.ts`)
- Tool definitions (`tests/tools.spec.ts`)
- Handler functions (`tests/handlers.spec.ts`)

### Integration Tests (Playwright)

Integration tests validate the entire MCP server:

```bash
pnpm run test:integration         # Run all integration tests
pnpm run test:integration:ui      # Run with Playwright UI
pnpm run test:integration:debug   # Debug mode
pnpm run test:all                 # Run both unit and integration tests
```

**Requirements:**

- Valid `TBA_API_KEY` environment variable
- Project must be built first (`pnpm run build`)

**Coverage areas:**

- MCP protocol compliance
- API endpoint functionality
- Error handling
- Performance
- Data validation
- Server stability

Always run both test suites when making changes.

## Project Structure

### Source Code

- `src/index.ts` - Main server entry point
  - Validates `TBA_API_KEY` at startup
  - Loads the scouting skills catalog once at startup (`loadScoutingSkills`)
  - Serves the MCP server over stdio with `serveStdio(() => createServer(version, { skills }))`
  - Handles error logging and process lifecycle

- `src/server.ts` - Server factory
  - Exports `createServer(version, { skills })`, which builds an `McpServer` (from `@modelcontextprotocol/server`), calls `registerTool()` once per entry in the `tools` table, and attaches the skills catalog when one is given
  - Exports `SERVER_INSTRUCTIONS`, the short scouting guidance sent to every client
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

- `src/skills.ts` - Scouting skills loader
  - Exports `skillsRootFor(moduleUrl)`, which resolves the package's `skills/` folder from a module URL (`dist/index.js` at runtime)
  - Exports `loadScoutingSkills(root, { strict })`, which loads `skills/` into a `SkillCatalog` with `loadSkills` from `@modelcontextprotocol/server/ext/skills/node`. Failures are logged and return `undefined`, so the server starts without skills instead of crashing

- `src/utils.ts` - Utility functions
  - `log()` - Writes server logs to stderr (stdout carries the stdio JSON-RPC stream)
  - `getApiKey()` - Retrieves and validates TBA_API_KEY environment variable
  - `makeApiRequest()` - Makes HTTP requests to TBA API with proper headers

### Tests

- `tests/tools.spec.ts` - Unit tests for the tool table and the `tools/list` output (schemas, annotations, endpoints)
- `tests/handlers.spec.ts` - Unit tests for `tools/call` (input validation, error results) and `executeTool`
- `tests/server.spec.ts` - Unit tests for `createServer`
- `tests/schemas.spec.ts` - Unit tests for all Zod schemas
- `tests/utils.spec.ts` - Unit tests for utility functions
- `tests/skills.spec.ts` - Unit tests for loading and serving skills (fixture in `tests/fixtures/skills/`)
- `tests/skills-content.spec.ts` - Guard tests for skill content: shared references in sync, only real tool names, `SKILL.md` structure, strict catalog load, and npm packaging
- `tests/in-memory-client.ts` - Test helper that connects an SDK `Client` to `createServer()` over `InMemoryTransport`
- `tests/integration/*.spec.ts` - Playwright integration tests for MCP protocol compliance, using a raw JSON-RPC stdio client (`tests/integration/mcp-client.ts`); `tests/integration/skills.spec.ts` uses the SDK `Client` and `SkillsClient` over stdio

### Skills

- `skills/<name>/` - Scouting skills served over MCP (`SKILL.md` plus `references/`), shipped in the npm package and Docker image
- `skills-src/shared/` - Shared reference files, copied into each skill by `scripts/sync-skills.mjs` (`pnpm run skills:sync`)

### Configuration

- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint rules
- `jest.config.js` - Jest test configuration
- `playwright.config.ts` - Playwright integration test configuration

## Code Standards

- TypeScript with strict type checking
- ESLint for code quality
- Prettier for formatting
- Husky for pre-commit hooks
- Jest for unit testing
- Playwright for integration testing

## Adding a New Tool

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

## How to Add or Edit a Skill

The server serves FRC scouting skills through the MCP Skills extension (`io.modelcontextprotocol/skills`). Skills are plain files; no TypeScript changes are needed to add one.

### Layout

```text
skills-src/shared/                 # shared references, edited here only
skills/<skill-name>/SKILL.md       # the skill itself
skills/<skill-name>/references/    # shared copies plus skill-specific files
```

### Rules

- The folder name and the frontmatter `name` must match. `SKILL.md` starts with YAML frontmatter containing `name` and `description`. The description says when to use the skill, in the words a scouting student would use.
- Keep `SKILL.md` under 200 lines. Put detail in `references/` and point to it from the skill.
- Every skill has a `## Coach mode` and an `## Analyst mode` section.
- Name only real tools (`get_...` names from `src/tools.ts`).
- Don't let a skill invent data TBA doesn't have (per-robot game-piece counts, defense, driver skill), and keep the OPR caveats.
- Season-specific `score_breakdown` field names go in `skills-src/shared/score-breakdown.md` only after they're checked against live API data.

### Shared references

Skills can only read files in their own folder, so shared references are copied into each skill. Edit them only in `skills-src/shared/`, then run:

```bash
pnpm run skills:sync
```

This copies every shared file into each skill's `references/` folder. Commit the copies.

### Guard tests

`tests/skills-content.spec.ts` fails if a shared copy differs from its source, if a skill names a tool that doesn't exist, if a `SKILL.md` breaks the rules above, if the catalog doesn't load under `strict: true`, or if the npm package would leave out `skills/`. `tests/skills.spec.ts` checks that each skill is served. Add a skill's name to the expected list there when you add a skill. `tests/integration/skills.spec.ts` lists and reads the skills over stdio.

## Best Practices

1. Always run `pnpm run build` after making changes
2. Run `pnpm run lint` to ensure code quality
3. Run both test suites (`pnpm run test:all`) before committing
4. Use `pnpm run inspect` to debug MCP functionality
5. Follow existing TypeScript patterns and MCP SDK conventions
6. When adding new tools, follow the 6-step process outlined above
7. Keep the separation of concerns: tools → schemas → handlers → tests
8. Ensure both unit tests and integration tests pass before submitting PRs

## Debugging

Use the MCP inspector for interactive debugging:

```bash
pnpm run inspect
```

This launches a web interface where you can:

- Test tool calls interactively
- Inspect request/response payloads
- Debug schema validation
- Monitor server logs

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the guidelines above
4. Run all tests (`pnpm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Questions or Issues?

- Open an issue on GitHub
- Check existing documentation in `docs/`
- Review the [MCP specification](https://modelcontextprotocol.io/)
- Consult the [TBA API docs](https://www.thebluealliance.com/apidocs/v3)
