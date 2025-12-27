# Integration Tests for TBA MCP Server

Comprehensive Playwright-based integration tests for the Blue Alliance MCP Server.

## Setup

1. Install dependencies:

```bash
npm ci
```

2. Build the project:

```bash
npm run build
```

3. Set up your TBA API key:

```bash
export TBA_API_KEY=your_api_key_here
```

You can get an API key from [The Blue Alliance](https://www.thebluealliance.com/).

## Running Tests

### All Integration Tests

```bash
npm run test:integration
```

### Debug Mode

```bash
npm run test:integration:debug
```

### UI Mode

```bash
npm run test:integration:ui
```

## Test Structure

### Basic Tests (`basic.spec.ts`)

- Server startup and initialization
- Basic tool listing and calling
- Simple API status checks

### TBA API Tests (`tba-api.spec.ts`)

- Team operations (get_team, get_team_events, etc.)
- Event operations (get_events, get_event_teams, etc.)
- Match operations (get_match, get_event_matches, etc.)
- Workflow tests combining multiple API calls

### Error Handling Tests (`error-handling.spec.ts`)

- Invalid input validation
- API error scenarios
- Tool not found errors
- Malformed request handling

### Performance Tests (`performance.spec.ts`)

- Response time validation
- Concurrent request handling
- Memory usage during extended operations

### Reliability Tests (`reliability.spec.ts`)

- Server restart handling
- State maintenance across requests
- API rate limiting resilience
- Data integrity validation

### Data Validation Tests (`data-validation.spec.ts`)

- Schema validation for all response types
- Data consistency across endpoints
- Null and optional field handling
- Large data handling

## Test Utilities

### MCPClient (`mcp-client.ts`)

Custom client for communicating with the MCP server via stdio protocol.

### Test Data (`test-data.ts`)

Predefined test data including known teams, events, and validation helpers.

### Setup (`setup.ts`)

Test fixtures for automatically managing MCP client lifecycle.

## Environment Variables

- `TBA_API_KEY`: Required for API tests to work properly
- `CI`: Affects retry and worker configuration

## Notes

- Tests require a valid TBA API key to run successfully
- Some tests may be skipped if data is not available (e.g., predictions, zebra data)
- Tests are designed to be resilient to API changes and data availability
- Run tests in headless mode for CI/CD environments
