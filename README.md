# The Blue Alliance MCP Server

A Model Context Protocol (MCP) server that provides access to The Blue Alliance API for FIRST Robotics Competition data. Enables AI assistants and other MCP clients to retrieve comprehensive FRC team, event, and match information.

## Features

- **Team Information**: Get detailed team profiles, participation history, awards, and media
- **Event Data**: Access event details, rankings, matches, and elimination alliances
- **Match Results**: Retrieve match data with scores, alliances, and breakdowns
- **Historical Data**: Query data from 1992 to the current year
- **Type Safety**: All responses validated with Zod schemas
- **Comprehensive Coverage**: 89 tools covering the TBA API v3 read endpoints
- **Scouting Skills**: Four skills for pre-scouting, match briefs, pick lists and checking scouting data

## For scouting teams

The server ships four scouting skills that tell Claude how to turn TBA data into the work a scouting subteam does at an event. You don't need to know any tool names. Ask in your own words and the client loads the matching skill.

| Skill                 | Use it                          | What you get                                                                                                                          |
| --------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pre-scout-event`     | Before an event                 | A roster of every attending team's season so far (rank, record, alliance role, OPR, awards) and a short list of match videos to watch |
| `match-preview`       | During quals or playoffs        | A one-screen brief on the six teams in a match: what each robot reliably does, the opponents' likely plan, and what to watch for      |
| `pick-list`           | Before alliance selection       | Tiered first-pick and second-pick lists, an empty do-not-pick column for you to fill, and the backup-robot pool after selection       |
| `check-scouting-data` | Any time you have your own data | A list of suspect matches to re-watch, with video links, where your scouting data disagrees with TBA's schedule or score breakdowns   |

Every skill works with TBA data alone and gets better when you paste in your own scouting data (a CSV, a table, or a Google Sheet export). Your data stays in the conversation; the server never stores it.

Each skill has two modes. Coach mode gives a concrete answer, such as a ranked list or a match plan, states the weights it used, and says where strong teams would disagree. Analyst mode gives you the data, the tradeoffs and the caveats, and leaves the decision to you. The skill picks the mode from how you ask ("who should we pick?" versus "show me the numbers"), asks once if it can't tell, and switches whenever you say so.

Example prompts:

- "We're going to 2025casj. Pre-scout it for us."
- "Which teams at our next regional should we watch videos of? We're team 649."
- "Brief us on 2025casj_qm10. What should we do?"
- "Our next match, side-by-side numbers only. We're team 1700."
- "Help us build our pick list for 2025casj. Here's our scouting CSV."
- "Who's left for our second pick?"
- "Check this scouting data against TBA and tell us which matches to re-watch."
- "Which of our scouts are getting the team numbers wrong?"

The skills are careful about what TBA can and can't tell you. OPR needs about 5–6 matches per team and has an error of roughly ±15 points, so they group teams into tiers instead of ranking on small gaps. TBA can't attribute game pieces to individual robots, and the skills say so instead of guessing.

Skills are served through the [MCP Skills extension](https://modelcontextprotocol.io/extensions/skills/overview). Clients that support it include Claude, Claude Code 2.1.331 and later, and VS Code Copilot. Other MCP clients still get every tool, plus short guidance in the server's instructions.

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

### Team Information (27 tools)

Access comprehensive team data including profiles, participation history, events, matches, awards, and media.

**Key tools**: `get_team`, `get_team_events`, `get_team_matches`, `get_team_awards`, `get_team_media`

### Event Information (29 tools)

Query event details, participants, rankings, matches, playoff advancement, media, live queuing, and analytics.

**Key tools**: `get_event`, `get_events`, `get_event_teams`, `get_event_rankings`, `get_event_matches`, `get_event_oprs`, `get_event_coprs`, `get_event_teams_statuses`

### Match Information (3 tools)

Retrieve detailed match data including scores, alliances, and robot tracking.

**Key tools**: `get_match`, `get_match_simple`, `get_match_zebra`

### District Tools (13 tools)

Access district rankings, events, teams, awards, advancement, and history.

**Key tools**: `get_districts`, `get_district_rankings`, `get_district_events`, `get_district_teams`, `get_district_advancement`

### Regional Advancement (2 tools)

FIRST Championship advancement and regional pool rankings for 2025 and later.

**Key tools**: `get_regional_advancement`, `get_regional_rankings`

### Insights (6 tools)

TBA season and all-time insights: leaderboards, notables, streaks, timeseries, game stats, and clubs, globally or per district.

**Key tools**: `get_insights_by_category`, `get_insights_leaderboards`, `get_insights_notables`

### General/Utility Tools (9 tools)

Paginated team listings, team and event search, API status, and sponsors.

**Key tools**: `get_teams`, `get_teams_by_year`, `get_search_index`, `get_status`

### Complete Documentation

- **[All Tools](docs/TOOLS.md)** - Complete reference for all 89 tools with parameters and examples
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
