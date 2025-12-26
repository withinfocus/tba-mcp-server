# The Blue Alliance MCP Server

A Model Context Protocol (MCP) server that provides access to The Blue Alliance API for FIRST Robotics Competition data. Enables AI assistants and other MCP clients to retrieve comprehensive FRC team, event, and match information.

## Features

- **Team Information**: Get detailed team profiles, participation history, awards, and media
- **Event Data**: Access event details, rankings, matches, and elimination alliances
- **Match Results**: Retrieve match data with scores, alliances, and breakdowns
- **Historical Data**: Query data from 1992 to the current year
- **Type Safety**: All responses validated with Zod schemas
- **Comprehensive Coverage**: 35+ tools covering all major TBA API endpoints

## Prerequisites

- Node.js 24
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
npm ci
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

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "tba": {
      "command": "npx",
      "args": ["-y", "@withinfocus/tba-mcp-server"],
      "env": {
        "TBA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### Team Information (24 tools)

Access comprehensive team data including profiles, participation history, events, matches, awards, and media.

**Key tools**: `get_team`, `get_team_events`, `get_team_matches`, `get_team_awards`, `get_team_media`

[View all team tools →](docs/TOOLS.md#team-information-tools)

### Event Information (19 tools)

Query event details, participants, rankings, matches, and analytics.

**Key tools**: `get_event`, `get_events`, `get_event_teams`, `get_event_rankings`, `get_event_matches`, `get_event_oprs`

[View all event tools →](docs/TOOLS.md#event-information-tools)

### Match Information (3 tools)

Retrieve detailed match data including scores, alliances, and robot tracking.

**Key tools**: `get_match`, `get_match_simple`, `get_match_zebra`

[View all match tools →](docs/TOOLS.md#match-information-tools)

### District Tools (8 tools)

Access district rankings, events, and team information.

**Key tools**: `get_districts`, `get_district_rankings`, `get_district_events`, `get_district_teams`

[View all district tools →](docs/TOOLS.md#district-tools)

### General/Utility Tools (6 tools)

Paginated team listings and API status information.

**Key tools**: `get_teams`, `get_teams_by_year`, `get_status`

[View all utility tools →](docs/TOOLS.md#generalutility-tools)

### Complete Documentation

- **[All Tools](docs/TOOLS.md)** - Complete reference for all 35+ tools with parameters and examples
- **[Data Schemas](docs/SCHEMAS.md)** - Detailed schema documentation for all response types
- **[Development Guide](docs/DEVELOPMENT.md)** - Building, testing, and contributing

## Quick Examples

### Get team information

```typescript
// Get detailed team profile
get_team(team_key: "frc86")

// Get team's events in a year
get_team_events(team_key: "frc86", year: 2024)

// Get team's awards
get_team_awards(team_key: "frc86", year: 2024)
```

### Analyze an event

```typescript
// Get event details
get_event(event_key: "2024casj")

// Get participating teams
get_event_teams(event_key: "2024casj")

// Get rankings
get_event_rankings(event_key: "2024casj")

// Get elimination alliances
get_event_alliances(event_key: "2024casj")
```

### Get match data

```typescript
// Get detailed match information
get_match(match_key: "2024casj_qm1")

// Get robot tracking data (if available)
get_match_zebra(match_key: "2024casj_qm1")
```

## Development

See the [Development Guide](docs/DEVELOPMENT.md) for detailed instructions on:

- Building and testing
- Adding new tools
- Running unit and integration tests
- Code standards and contribution guidelines

Quick start:

```bash
npm ci                   # Install dependencies
npm run build            # Build TypeScript
npm test                 # Run unit tests
npm run test:integration # Run integration tests
npm run lint             # Check code quality
npm run inspect          # Launch MCP inspector
```

## Related Links

- [The Blue Alliance](https://www.thebluealliance.com/) - Official FRC data source
- [TBA API Documentation](https://www.thebluealliance.com/apidocs/v3) - Official API docs
- [Model Context Protocol](https://spec.modelcontextprotocol.io/) - MCP specification
- [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Official FRC site
