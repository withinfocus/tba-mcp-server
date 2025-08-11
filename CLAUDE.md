# Claude Instructions for TBA MCP Server

This project is a Model Context Protocol (MCP) server that provides access to The Blue Alliance API for FIRST Robotics Competition data.

## Project Overview

- **Language**: TypeScript with Node.js
- **Framework**: MCP SDK (@modelcontextprotocol/sdk)
- **Package Manager**: npm
- **Main Entry**: `src/index.ts`
- **Build Output**: `dist/`
- **Transport**: stdio for MCP communication

## Project Structure

### Key Files

- `src/index.ts` - Main server implementation
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

## Testing Requirements

This project has two types of tests that should both be run:

### Unit Tests (Jest)

```bash
npm test                 # Run unit tests
npm run test:watch       # Run unit tests in watch mode
```

### Integration Tests (Playwright)

```bash
npm run test:integration         # Run all integration tests
npm run test:integration:ui      # Run with Playwright UI
npm run test:integration:debug   # Debug mode
npm run test:all                 # Run both unit and integration tests
```

**IMPORTANT**: Always run both test suites when making changes:

1. Run `npm test` for unit tests
2. Run `npm run test:integration` for integration tests
3. Or use `npm run test:all` to run everything

### Integration Test Requirements

The integration tests require:

- A valid TBA API key set as `TBA_API_KEY` environment variable
- The project to be built first (`npm run build`)
- Tests cover MCP protocol compliance, API endpoint functionality, error handling, performance, and data validation

### Key Integration Test Areas

- **MCP Protocol**: Server initialization, tool listing, request/response handling
- **API Endpoints**: All 35+ TBA API tools with proper parameter validation
- **Error Handling**: Invalid inputs, API failures, missing parameters
- **Performance**: Response times, concurrent requests, memory usage
- **Data Validation**: Schema compliance, consistency across endpoints
- **Reliability**: Server stability, state management, cleanup

## Development Workflow

1. Make code changes
2. Build the project: `npm run build`
3. Run linting: `npm run lint` (fix with `npm run lint:fix`)
4. Run unit tests: `npm test`
5. Run integration tests: `npm run test:integration`
6. Ensure both test suites pass before considering changes complete

## Development Commands

```bash
npm run build                    # Build TypeScript to dist/
npm run lint                     # Run ESLint and Prettier
npm run lint:fix                 # Auto-fix linting issues
npm test                         # Run Jest unit tests
npm run test:watch               # Run tests in watch mode
npm run test:integration         # Run Playwright integration tests
npm run test:all                 # Run all tests (unit + integration)
npm run inspect                  # Launch MCP inspector for debugging
```

## MCP Server Details

- **Name**: The Blue Alliance MCP Server
- **Transport**: StdioServerTransport
- **Current Capabilities**: Access to The Blue Alliance API for FRC data

## When Working on This Project

1. Always run `npm run build` after making changes
2. Run `npm run lint` to ensure code quality
3. Run tests with `npm run test` and `npm run test:integration` before committing
4. Use `npm run inspect` to debug MCP functionality
5. Follow existing TypeScript patterns and MCP SDK conventions

Always verify that both unit tests and integration tests pass before considering any changes complete.
