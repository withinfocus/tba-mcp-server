# Contributing to TBA MCP Server

## Prerequisites

- Node.js 24
- npm
- A [The Blue Alliance API key](https://www.thebluealliance.com/account)

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/withinfocus/tba-mcp-server.git
cd tba-mcp-server
npm ci
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
npm run build
```

## Development Workflow

1. Make code changes
2. Build the project: `npm run build`
3. Run linting: `npm run lint` (fix with `npm run lint:fix`)
4. Run unit tests: `npm test`
5. Run integration tests: `npm run test:integration`
6. Ensure both test suites pass before committing

## Available Commands

```bash
npm run build                    # Build TypeScript to dist/
npm run lint                     # Run ESLint and Prettier
npm run lint:fix                 # Auto-fix linting issues
npm test                         # Run Jest unit tests
npm run test:watch               # Run tests in watch mode
npm run test:integration         # Run Playwright integration tests
npm run test:integration:ui      # Run with Playwright UI
npm run test:integration:debug   # Debug mode
npm run test:all                 # Run all tests (unit + integration)
npm run inspect                  # Launch MCP inspector for debugging
```

## Testing

### Unit Tests (Jest)

Unit tests validate individual components:

```bash
npm test                 # Run once
npm run test:watch       # Watch mode for development
```

Tests are located in `tests/*.spec.ts` and cover:

- Zod schemas (`tests/schemas.spec.ts`)
- Utility functions (`tests/utils.spec.ts`)
- Tool definitions (`tests/tools.spec.ts`)
- Handler functions (`tests/handlers.spec.ts`)

### Integration Tests (Playwright)

Integration tests validate the entire MCP server:

```bash
npm run test:integration         # Run all integration tests
npm run test:integration:ui      # Run with Playwright UI
npm run test:integration:debug   # Debug mode
npm run test:all                 # Run both unit and integration tests
```

**Requirements:**

- Valid `TBA_API_KEY` environment variable
- Project must be built first (`npm run build`)

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
  - Initializes the MCP server
  - Sets up request handlers for ListTools and CallTool
  - Connects to stdio transport
  - Handles error logging and process lifecycle

- `src/tools.ts` - Tool definitions
  - Exports the `tools` array containing all MCP tool definitions
  - Each tool has: name, description, and inputSchema (JSON Schema format)
  - Tool definitions describe what parameters each tool accepts

- `src/handlers.ts` - Tool execution handlers
  - Exports `handleToolCall(name, args)` function
  - Contains a switch statement that routes tool calls to their implementations
  - Each case: validates input, calls TBA API, validates response, returns formatted result

- `src/schemas.ts` - Zod validation schemas
  - Input validation schemas: TeamKeySchema, YearSchema, EventKeySchema
  - API response schemas: TeamSchema, EventSchema, MatchSchema, etc.
  - All schemas use Zod for runtime type validation

- `src/utils.ts` - Utility functions
  - `log()` - MCP-aware logging function
  - `getApiKey()` - Retrieves and validates TBA_API_KEY environment variable
  - `makeApiRequest()` - Makes HTTP requests to TBA API with proper headers

### Tests

- `tests/schemas.spec.ts` - Unit tests for all Zod schemas
- `tests/utils.spec.ts` - Unit tests for utility functions
- `tests/tools.spec.ts` - Unit tests for tool definitions
- `tests/handlers.spec.ts` - Unit tests for handler functions
- `tests/integration/*.spec.ts` - Playwright integration tests for MCP protocol compliance

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

Follow these steps when adding a new MCP tool to the server:

### 1. Define the Tool (`src/tools.ts`)

Add a new tool definition to the `tools` array:

```typescript
{
  name: 'get_team_media',
  description: 'Get media (photos, videos) for a team in a specific year',
  inputSchema: {
    type: 'object',
    properties: {
      team_key: {
        type: 'string',
        description: 'Team key in format frcXXXX (e.g., frc86)',
        pattern: '^frc\\d+$',
      },
      year: {
        type: 'number',
        description: 'Competition year',
        minimum: 1992,
        maximum: new Date().getFullYear() + 1,
      },
    },
    required: ['team_key', 'year'],
  },
}
```

### 2. Create Response Schema (`src/schemas.ts`)

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

Don't forget to export it and import it in `handlers.ts`.

### 3. Implement the Handler (`src/handlers.ts`)

Add a new case to the switch statement in `handleToolCall()`:

```typescript
case 'get_team_media': {
  const { team_key, year } = z
    .object({
      team_key: TeamKeySchema,
      year: YearSchema,
    })
    .parse(args);
  const data = await makeApiRequest(`/team/${team_key}/media/${year}`);
  const media = z.array(MediaSchema).parse(data);
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(media, null, 2),
      },
    ],
  };
}
```

**Handler Pattern:**

- Parse and validate input arguments using Zod schemas
- Call `makeApiRequest()` with the TBA API endpoint
- Parse and validate the response using Zod schemas
- Return formatted result with `content` array

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

```typescript
it('should include get_team_media tool', () => {
  const tool = tools.find((t) => t.name === 'get_team_media');
  expect(tool).toBeDefined();
  expect(tool?.description).toContain('media');
  expect(tool?.inputSchema.required).toContain('team_key');
  expect(tool?.inputSchema.required).toContain('year');
});
```

**If you added a new handler** (`tests/handlers.spec.ts`):

```typescript
it('should handle get_team_media', async () => {
  const result = await handleToolCall('get_team_media', {
    team_key: 'frc86',
    year: 2024,
  });

  expect(result.content).toBeDefined();
  expect(result.content[0].type).toBe('text');
  const data = JSON.parse(result.content[0].text);
  expect(Array.isArray(data)).toBe(true);
});
```

**If you modified utility functions** (`tests/utils.spec.ts`):

Add tests to validate the utility function behavior.

### 5. Add Integration Tests (`tests/integration/tba-api.spec.ts`)

Add an integration test that calls your new tool via the MCP protocol:

```typescript
test('should get team media for a year', async ({ page }) => {
  const result = await page.evaluate(async () => {
    return window.testClient.request(
      {
        method: 'tools/call',
        params: {
          name: 'get_team_media',
          arguments: {
            team_key: 'frc86',
            year: 2024,
          },
        },
      },
      CallToolResultSchema,
    );
  });

  expect(result.content).toBeDefined();
  expect(result.content.length).toBeGreaterThan(0);
  const content = JSON.parse(result.content[0].text);
  expect(Array.isArray(content)).toBe(true);
});
```

### 6. Build and Test

```bash
npm run build                # Build TypeScript
npm run lint                 # Check code quality
npm test                     # Run unit tests
npm run test:integration     # Run integration tests
```

## Best Practices

1. Always run `npm run build` after making changes
2. Run `npm run lint` to ensure code quality
3. Run both test suites (`npm run test:all`) before committing
4. Use `npm run inspect` to debug MCP functionality
5. Follow existing TypeScript patterns and MCP SDK conventions
6. When adding new tools, follow the 6-step process outlined above
7. Keep the separation of concerns: tools → schemas → handlers → tests
8. Ensure both unit tests and integration tests pass before submitting PRs

## Debugging

Use the MCP inspector for interactive debugging:

```bash
npm run inspect
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
4. Run all tests (`npm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Questions or Issues?

- Open an issue on GitHub
- Check existing documentation in `docs/`
- Review the [MCP specification](https://modelcontextprotocol.io/)
- Consult the [TBA API docs](https://www.thebluealliance.com/apidocs/v3)
