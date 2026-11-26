# Development Guide

Building, testing, and contributing to the TBA MCP Server.

## Table of Contents

- [Development Setup](#development-setup)
- [Building](#building)
- [Testing](#testing)
  - [Unit Tests](#unit-tests-jest)
  - [Integration Tests](#integration-tests-playwright)
  - [All Tests](#all-tests)
- [Linting](#linting)
- [Development Workflow](#development-workflow)
- [Debugging](#debugging)
- [Error Handling](#error-handling)
- [API Rate Limits](#api-rate-limits)
- [Contributing](#contributing)

## Development Setup

Requires Node.js 26 and pnpm 12. Node 26 no longer ships corepack, so install
pnpm with `npm install -g pnpm`. pnpm then switches to the version pinned in the
`packageManager` field of `package.json` on its own.

```bash
# Clone the repository
git clone https://github.com/withinfocus/tba-mcp-server.git
cd tba-mcp-server

# Install dependencies
pnpm install --frozen-lockfile

# Set up your API key
export TBA_API_KEY=your_api_key_here
# Or create a .env file with TBA_API_KEY=your_api_key_here
```

## Building

```bash
pnpm run build
```

which compiles TypeScript from `src/` to JavaScript in `dist/`.

## Testing

### Unit Tests (Jest)

```bash
pnpm test                 # Run unit tests once
pnpm run test:watch       # Run unit tests in watch mode
```

Unit tests cover:

- Schema validation (`tests/schemas.spec.ts`)
- Utility functions (`tests/utils.spec.ts`)
- Tool definitions (`tests/tools.spec.ts`)
- Handler functions (`tests/handlers.spec.ts`)

### Integration Tests (Playwright)

```bash
pnpm run test:integration         # Run all integration tests
pnpm run test:integration:ui      # Run with Playwright UI
pnpm run test:integration:debug   # Debug mode
```

**Requirements**:

- Valid TBA API key set as `TBA_API_KEY` environment variable
- Project must be built first (`pnpm run build`)

Integration tests cover:

- **MCP Protocol**: Server initialization, tool listing, request/response handling
- **API Endpoints**: All 89 TBA API tools with proper parameter validation
- **Error Handling**: Invalid inputs, API failures, missing parameters
- **Performance**: Response times, concurrent requests, memory usage
- **Data Validation**: Schema compliance, consistency across endpoints
- **Reliability**: Server stability, state management, cleanup

### All Tests

```bash
pnpm run test:all         # Run both unit and integration tests
```

**IMPORTANT**: Always run both test suites when making changes. Consider the task incomplete unless both pass.

## Linting

```bash
pnpm run lint             # Check code quality
pnpm run lint:fix         # Auto-fix linting issues
```

The project uses:

- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

## Development Workflow

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Run unit tests in watch mode during development
pnpm run test:watch

# 3. Build the project
pnpm run build

# 4. Run all tests (unit + integration)
pnpm run test:all

# 5. Test with the MCP inspector
pnpm run inspect
```

### Recommended Development Loop

1. Make code changes
2. Watch unit tests pass automatically
3. Build: `pnpm run build`
4. Check linting: `pnpm run lint`
5. Run integration tests: `pnpm run test:integration`
6. Ensure both test suites pass before committing

## Debugging

### MCP Inspector

```bash
pnpm run inspect
```

Launches the MCP inspector tool for debugging MCP functionality in a browser.
Set `TBA_API_KEY` in the inspector's environment variables for the server.

For a quick check without the browser UI, use the inspector's CLI mode:

```bash
pnpm exec mcp-inspector --cli -e TBA_API_KEY=your_api_key_here node dist/index.js --method tools/list
```

### Manual Testing

```bash
# Build and test locally
pnpm run build
node dist/index.js
```

## Error Handling

The server provides detailed error messages for:

- **Missing or invalid API keys**
- **Invalid team keys** (must be format `frcXXXX`)
- **Invalid years** (must be 1992 to current year + 1)
- **TBA API errors** (rate limits, not found, etc.)
- **Schema validation failures**

Invalid arguments are rejected by the MCP SDK before the TBA API is called and
come back as an `isError: true` tool result starting with `Input validation
error:`. TBA API and response validation failures come back as `isError: true`
results starting with `Error:`. Calling a tool name that does not exist is a
JSON-RPC error (`-32602`, `Tool <name> not found`) rather than a tool result.

## API Rate Limits

The Blue Alliance API has rate limits. The server will pass through any rate limiting errors from the TBA API. Consider implementing request caching or throttling in your client application for heavy usage.

## Contributing

1. **Fork the repository**
2. **Create a feature branch**

```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**

- Follow existing TypeScript patterns
- Maintain separation of concerns (tools → schemas → handlers → tests)

4. **Add tests for new functionality**

- Add unit tests for new schemas, utilities, or handlers
- Add integration tests for new tools

5. **Run the test suite**

```bash
pnpm run build
pnpm run lint
pnpm run test:all
```

6. **Commit your changes**

```bash
git commit -m "Add feature: description"
```

7. **Push to your fork**

```bash
git push origin feature/your-feature-name
```

8. **Submit a pull request**

### Code Standards

- TypeScript with strict type checking
- ESLint for code quality
- Prettier for formatting
- Comprehensive test coverage (unit + integration)
- Clear, descriptive commit messages

### Adding a New Tool

Tools are registered on an `McpServer` from the MCP TypeScript SDK v2
(`@modelcontextprotocol/server`). Each tool is one `defineTool()` entry in the
`tools` table in `src/tools.ts`; `createServer()` in `src/server.ts` registers
every entry with `registerTool()`, and `executeTool()` in `src/handlers.ts`
runs it.

1. Create the input schema (a `z.object`) in `src/schemas.ts`, plus a response schema if the API response needs a new one
2. Add a `defineTool()` entry to the `tools` table in `src/tools.ts` with `name`, `title`, `description`, `inputSchema`, `endpoint`, and `responseSchema`
3. Add unit tests, including the tool's path in `EXPECTED_ENDPOINTS` in `tests/tools.spec.ts`
4. Add integration tests
5. Build and test

See the "Adding a New Tool" section of [CONTRIBUTING.md](../CONTRIBUTING.md) for a worked example.

### Adding or Editing a Skill

Scouting skills live in `skills/<name>/SKILL.md`, with shared reference files kept once in `skills-src/shared/`. After editing a shared reference, run `pnpm run skills:sync` to copy it into every skill, and commit the copies. Guard tests in `tests/skills-content.spec.ts` fail if a copy drifts, if a skill names a tool that doesn't exist, or if a `SKILL.md` is missing its frontmatter or mode sections. See "How to Add or Edit a Skill" in [CONTRIBUTING.md](../CONTRIBUTING.md) for the full rules.

## Related Links

- [The Blue Alliance](https://www.thebluealliance.com/) - Official FRC data source
- [TBA API Documentation](https://www.thebluealliance.com/apidocs/v3) - Official API docs
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Official FRC site
