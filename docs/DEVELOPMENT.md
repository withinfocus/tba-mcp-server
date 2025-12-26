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

```bash
# Clone the repository
git clone https://github.com/withinfocus/tba-mcp-server.git
cd tba-mcp-server

# Install dependencies
npm ci

# Set up your API key
export TBA_API_KEY=your_api_key_here
# Or create a .env file with TBA_API_KEY=your_api_key_here
```

## Building

```bash
npm run build
```

which compiles TypeScript from `src/` to JavaScript in `dist/`.

## Testing

### Unit Tests (Jest)

```bash
npm test                 # Run unit tests once
npm run test:watch       # Run unit tests in watch mode
```

Unit tests cover:

- Schema validation (`tests/schemas.spec.ts`)
- Utility functions (`tests/utils.spec.ts`)
- Tool definitions (`tests/tools.spec.ts`)
- Handler functions (`tests/handlers.spec.ts`)

### Integration Tests (Playwright)

```bash
npm run test:integration         # Run all integration tests
npm run test:integration:ui      # Run with Playwright UI
npm run test:integration:debug   # Debug mode
```

**Requirements**:

- Valid TBA API key set as `TBA_API_KEY` environment variable
- Project must be built first (`npm run build`)

Integration tests cover:

- **MCP Protocol**: Server initialization, tool listing, request/response handling
- **API Endpoints**: All 35+ TBA API tools with proper parameter validation
- **Error Handling**: Invalid inputs, API failures, missing parameters
- **Performance**: Response times, concurrent requests, memory usage
- **Data Validation**: Schema compliance, consistency across endpoints
- **Reliability**: Server stability, state management, cleanup

### All Tests

```bash
npm run test:all         # Run both unit and integration tests
```

**IMPORTANT**: Always run both test suites when making changes. Consider the task incomplete unless both pass.

## Linting

```bash
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues
```

The project uses:

- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for pre-commit hooks

## Development Workflow

```bash
# 1. Install dependencies
npm ci

# 2. Run unit tests in watch mode during development
npm run test:watch

# 3. Build the project
npm run build

# 4. Run all tests (unit + integration)
npm run test:all

# 5. Test with the MCP inspector
npm run inspect
```

### Recommended Development Loop

1. Make code changes
2. Watch unit tests pass automatically
3. Build: `npm run build`
4. Check linting: `npm run lint`
5. Run integration tests: `npm run test:integration`
6. Ensure both test suites pass before committing

## Debugging

### MCP Inspector

```bash
npm run inspect
```

Launches the MCP inspector tool for debugging MCP functionality in a browser.

### Manual Testing

```bash
# Build and test locally
npm run build
node dist/index.js
```

## Error Handling

The server provides detailed error messages for:

- **Missing or invalid API keys**
- **Invalid team keys** (must be format `frcXXXX`)
- **Invalid years** (must be 1992 to current year + 1)
- **TBA API errors** (rate limits, not found, etc.)
- **Schema validation failures**

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
npm run build
npm run lint
npm run test:all
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

1. Define the tool in `src/tools.ts`
2. Create response schema in `src/schemas.ts`
3. Implement the handler in `src/handlers.ts`
4. Add unit tests
5. Add integration tests
6. Build and test

## Related Links

- [The Blue Alliance](https://www.thebluealliance.com/) - Official FRC data source
- [TBA API Documentation](https://www.thebluealliance.com/apidocs/v3) - Official API docs
- [Model Context Protocol](https://spec.modelcontextprotocol.io/) - MCP specification
- [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Official FRC site
