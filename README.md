# The Blue Alliance MCP Server

A Model Context Protocol (MCP) server that provides access to The Blue Alliance API for FIRST Robotics Competition data. This server enables AI assistants and other MCP clients to retrieve comprehensive FRC team, event, and match information.

## Features

- **Team Information**: Get detailed team profiles, participation history, awards, and media
- **Event Data**: Access event details, rankings, matches, and elimination alliances
- **Match Results**: Retrieve match data with scores, alliances, and breakdowns
- **Historical Data**: Query data from 1992 to the current year

## Prerequisites

- Node.js 22
- The Blue Alliance API key (register at [thebluealliance.com/account](https://www.thebluealliance.com/account))

## Installation

### From npm

```bash
npm install -g @withinfocus/tba-mcp-server
```

### From source

```bash
git clone https://github.com/withinfocus/tba-mcp-server.git
cd tba-mcp-server
npm install
npm run build
```

## Configuration

Set your The Blue Alliance API key as an environment variable:

```bash
export TBA_API_KEY=your_api_key_here
```

Or create a `.env` file:

```
TBA_API_KEY=your_api_key_here
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "tba": {
      "command": "mcp-server-tba",
      "env": {
        "TBA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### With MCP Inspector

For development and testing:

```bash
npm run inspect
```

## Available Tools

### Team Tools

- **`get_team`** - Get detailed team information
  - Parameters: `team_key` (string, format: frcXXXX)
  - Example: `frc254`

- **`get_team_events`** - Get events a team participated in for a year
  - Parameters: `team_key` (string), `year` (number)

- **`get_team_awards`** - Get awards won by a team in a specific year
  - Parameters: `team_key` (string), `year` (number)

- **`get_team_matches`** - Get matches played by a team in a year
  - Parameters: `team_key` (string), `year` (number)

- **`get_team_years_participated`** - Get years a team has participated
  - Parameters: `team_key` (string)

- **`get_team_districts`** - Get district history for a team
  - Parameters: `team_key` (string)

- **`get_team_robots`** - Get robot names for a team by year
  - Parameters: `team_key` (string)

- **`get_team_media`** - Get media for a team in a specific year
  - Parameters: `team_key` (string), `year` (number)

- **`get_team_event_matches`** - Get matches for a team at a specific event
  - Parameters: `team_key` (string), `event_key` (string)

### Event Tools

- **`get_events`** - Get all FRC events for a specific year
  - Parameters: `year` (number)

- **`get_event`** - Get detailed information about a specific event
  - Parameters: `event_key` (string)
  - Example: `2023casj`

- **`get_event_teams`** - Get teams participating in an event
  - Parameters: `event_key` (string)

- **`get_event_rankings`** - Get team rankings for an event
  - Parameters: `event_key` (string)

- **`get_event_matches`** - Get matches for an event
  - Parameters: `event_key` (string)

- **`get_event_alliances`** - Get elimination alliances for an event
  - Parameters: `event_key` (string)

- **`get_event_insights`** - Get event-specific insights and statistics
  - Parameters: `event_key` (string)

- **`get_event_district_points`** - Get district points for teams at an event
  - Parameters: `event_key` (string)

### General Tools

- **`get_teams`** - Get paginated list of teams
  - Parameters: `page_num` (number, 0-indexed)

### Common Patterns

**Find a team's performance at a specific event:**

1. Use `get_team_event_matches` to get their matches
2. Use `get_event_rankings` to see their final ranking

**Analyze an event:**

1. Use `get_event` for basic event info
2. Use `get_event_teams` to see participating teams
3. Use `get_event_rankings` for final standings
4. Use `get_event_alliances` for elimination results

## Development

### Building

```bash
npm run build
```

### Testing

#### Unit Tests (Jest)

```bash
npm test                 # Run unit tests
npm run test:watch       # Run unit tests in watch mode
```

#### Integration Tests (Playwright)

```bash
npm run test:integration         # Run all integration tests
npm run test:integration:ui      # Run with Playwright UI
npm run test:integration:debug   # Debug mode
```

#### All Tests

```bash
npm run test:all                 # Run both unit and integration tests
```

**Note**: Integration tests require a valid TBA API key set as `TBA_API_KEY` environment variable.

### Linting

```bash
npm run lint
npm run lint:fix
```

### Development Workflow

```bash
# Install dependencies
npm install

# Run unit tests in watch mode during development
npm run test:watch

# Build the project
npm run build

# Run all tests (unit + integration)
npm run test:all

# Test with the MCP inspector
npm run inspect
```

## Data Schemas

All API responses are validated using Zod schemas ensuring type safety:

- **Team**: Contains team number, name, location, website, rookie year, etc.
- **Event**: Contains event details, dates, location, type, districts, webcasts
- **Match**: Contains alliances, scores, competition level, timing, videos
- **Award**: Contains award name, type, recipients, year
- **Rankings**: Contains team rankings with records and statistics
- **Alliances**: Contains elimination alliance picks and status

## Error Handling

The server provides detailed error messages for:

- Missing or invalid API keys
- Invalid team keys (must be format `frcXXXX`)
- Invalid years (must be 1992 to current year + 1)
- TBA API errors (rate limits, not found, etc.)
- Schema validation failures

## API Rate Limits

The Blue Alliance API has rate limits. The server will pass through any rate limiting errors from the TBA API. Consider implementing request caching or throttling in your client application for heavy usage.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Links

- [The Blue Alliance](https://www.thebluealliance.com/) - Official FRC data source
- [TBA API Documentation](https://www.thebluealliance.com/apidocs/v3) - Official API docs
- [Model Context Protocol](https://spec.modelcontextprotocol.io/) - MCP specification
- [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Official FRC site
