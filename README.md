# The Blue Alliance MCP Server

A Model Context Protocol (MCP) server that provides access to The Blue Alliance API for FIRST Robotics Competition data. Enables AI assistants and other MCP clients to retrieve comprehensive FRC team, event, and match information.

## Features

- **Team Information**: Get detailed team profiles, participation history, awards, and media
- **Event Data**: Access event details, rankings, matches, and elimination alliances
- **Match Results**: Retrieve match data with scores, alliances, and breakdowns
- **Historical Data**: Query data from 1992 to the current year
- **Type Safety**: All responses validated with Zod schemas
- **Comprehensive Coverage**: 35+ tools covering all major TBA API endpoints

## Installation

### npm (Recommended)

```bash
npm install -g @withinfocus/tba-mcp-server
```

### Docker

Pull the image from GitHub Container Registry:

```bash
docker pull ghcr.io/withinfocus/tba-mcp-server:latest
```

Or build locally:

```bash
git clone https://github.com/withinfocus/tba-mcp-server.git
cd tba-mcp-server
docker build -t tba-mcp-server .
```

## Configuration

1. Get an API key from [The Blue Alliance](https://www.thebluealliance.com/account)

2. Set your API key as an environment variable:

```bash
export TBA_API_KEY=your_api_key_here
```

Or create a `.env` file:

```bash
TBA_API_KEY=your_api_key_here
```

## Usage

### With npm

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

### With Docker

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "tba": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--init",
        "-e",
        "TBA_API_KEY=your_api_key_here",
        "ghcr.io/withinfocus/tba-mcp-server:latest"
      ]
    }
  }
}
```

Or run directly:

```bash
docker run --rm -i --init \
  -e TBA_API_KEY=your_api_key_here \
  ghcr.io/withinfocus/tba-mcp-server:latest
```

## Available Tools

### Team Information (24 tools)

Access comprehensive team data including profiles, participation history, events, matches, awards, and media.

**Key tools**: `get_team`, `get_team_events`, `get_team_matches`, `get_team_awards`, `get_team_media`

### Event Information (19 tools)

Query event details, participants, rankings, matches, and analytics.

**Key tools**: `get_event`, `get_events`, `get_event_teams`, `get_event_rankings`, `get_event_matches`, `get_event_oprs`

### Match Information (3 tools)

Retrieve detailed match data including scores, alliances, and robot tracking.

**Key tools**: `get_match`, `get_match_simple`, `get_match_zebra`

### District Tools (8 tools)

Access district rankings, events, and team information.

**Key tools**: `get_districts`, `get_district_rankings`, `get_district_events`, `get_district_teams`

### General/Utility Tools (6 tools)

Paginated team listings and API status information.

**Key tools**: `get_teams`, `get_teams_by_year`, `get_status`

### Complete Documentation

- **[All Tools](docs/TOOLS.md)** - Complete reference for all 35+ tools with parameters and examples
- **[Data Schemas](docs/SCHEMAS.md)** - Detailed schema documentation for all response types

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

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing guidelines, and how to add new tools.

## Related Links

- [The Blue Alliance](https://www.thebluealliance.com/) - Official FRC data source
- [TBA API Documentation](https://www.thebluealliance.com/apidocs/v3) - Official API docs
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [FIRST Robotics Competition](https://www.firstinspires.org/robotics/frc) - Official FRC site
