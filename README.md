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

Open up your application configuration, e.g. for Claude Desktop:

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

This MCP server provides many tools for accessing The Blue Alliance API. All tools validate input parameters and return structured, type-safe data.

### Team Information Tools

#### Core Team Data

- **`get_team`** - Get detailed team information
  - Parameters: `team_key` (string, format: frcXXXX)
  - Returns: Complete team profile including location, website, rookie year, motto
  - Example: `get_team(team_key="frc86")`

- **`get_team_simple`** - Get simplified team information
  - Parameters: `team_key` (string, format: frcXXXX)
  - Returns: Basic team data (number, name, city, state, country)

#### Team Participation & History

- **`get_team_years_participated`** - Get years a team has participated in competition
  - Parameters: `team_key` (string)
  - Returns: Array of years (numbers)

- **`get_team_districts`** - Get district history for a team
  - Parameters: `team_key` (string)
  - Returns: Array of district objects with abbreviation, display name, key, year

- **`get_team_robots`** - Get robot names for a team by year
  - Parameters: `team_key` (string)
  - Returns: Array of robot objects with year, name, key

- **`get_team_history`** - Get comprehensive historical data for a team
  - Parameters: `team_key` (string)
  - Returns: Awards, events, matches, and robots across all years

#### Team Events & Performance

- **`get_team_events`** - Get events a team participated in for a specific year
  - Parameters: `team_key` (string), `year` (number, 1992-current+1)
  - Returns: Array of detailed event objects

- **`get_team_events_simple`** - Get simplified events for a team in a year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Array of basic event data

- **`get_team_events_keys`** - Get event keys for a team in a year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Array of event key strings

- **`get_team_events_all`** - Get all events a team has participated in across all years
  - Parameters: `team_key` (string)
  - Returns: Array of detailed event objects

- **`get_team_event_status`** - Get team's rank and status at a specific event
  - Parameters: `team_key` (string), `event_key` (string)
  - Returns: Qualification ranking, alliance info, playoff status

- **`get_team_event_statuses`** - Get team's status at all events in a year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Object mapping event keys to status objects

#### Team Matches

- **`get_team_matches`** - Get detailed matches for a team in a year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Array of complete match objects with scores, alliances, breakdowns

- **`get_team_matches_simple`** - Get simplified matches for a team in a year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Array of basic match data

- **`get_team_matches_keys`** - Get match keys for a team in a year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Array of match key strings

- **`get_team_event_matches`** - Get detailed matches for a team at a specific event
  - Parameters: `team_key` (string), `event_key` (string)
  - Returns: Array of complete match objects

- **`get_team_event_matches_simple`** - Get simplified matches for a team at an event
  - Parameters: `team_key` (string), `event_key` (string)
  - Returns: Array of basic match data

- **`get_team_event_matches_keys`** - Get match keys for a team at an event
  - Parameters: `team_key` (string), `event_key` (string)
  - Returns: Array of match key strings

#### Team Awards

- **`get_team_awards`** - Get awards won by a team in a specific year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Array of award objects with name, type, event, recipients

- **`get_team_awards_all`** - Get all awards won by a team across all years
  - Parameters: `team_key` (string)
  - Returns: Array of award objects

- **`get_team_event_awards`** - Get awards won by a team at a specific event
  - Parameters: `team_key` (string), `event_key` (string)
  - Returns: Array of award objects

#### Team Media & Social

- **`get_team_media`** - Get media for a team in a specific year
  - Parameters: `team_key` (string), `year` (number)
  - Returns: Array of media objects (photos, videos, etc.)

- **`get_team_media_by_tag`** - Get media for a team filtered by tag
  - Parameters: `team_key` (string), `media_tag` (string)
  - Returns: Array of filtered media objects

- **`get_team_media_by_tag_year`** - Get media for a team by tag and year
  - Parameters: `team_key` (string), `media_tag` (string), `year` (number)
  - Returns: Array of filtered media objects

- **`get_team_social_media`** - Get social media information for a team
  - Parameters: `team_key` (string)
  - Returns: Array of social media links and handles

### Event Information Tools

#### Core Event Data

- **`get_events`** - Get all FRC events for a specific year
  - Parameters: `year` (number, 1992-current+1)
  - Returns: Array of detailed event objects

- **`get_events_simple`** - Get simplified events for a year
  - Parameters: `year` (number)
  - Returns: Array of basic event data

- **`get_events_keys`** - Get event keys for a year
  - Parameters: `year` (number)
  - Returns: Array of event key strings

- **`get_event`** - Get detailed information about a specific event
  - Parameters: `event_key` (string)
  - Returns: Complete event details including dates, location, webcasts
  - Example: `get_event(event_key="2023casj")`

- **`get_event_simple`** - Get simplified event information
  - Parameters: `event_key` (string)
  - Returns: Basic event data

#### Event Participants

- **`get_event_teams`** - Get teams participating in an event
  - Parameters: `event_key` (string)
  - Returns: Array of detailed team objects

- **`get_event_teams_simple`** - Get simplified teams in an event
  - Parameters: `event_key` (string)
  - Returns: Array of basic team data

- **`get_event_teams_keys`** - Get team keys in an event
  - Parameters: `event_key` (string)
  - Returns: Array of team key strings

#### Event Results & Rankings

- **`get_event_rankings`** - Get team rankings for an event
  - Parameters: `event_key` (string)
  - Returns: Rankings object with team standings, records, statistics

- **`get_event_alliances`** - Get elimination alliances for an event
  - Parameters: `event_key` (string)
  - Returns: Array of alliance objects with picks, status, records

- **`get_event_awards`** - Get awards from a specific event
  - Parameters: `event_key` (string)
  - Returns: Array of award objects

#### Event Matches

- **`get_event_matches`** - Get detailed matches for an event
  - Parameters: `event_key` (string)
  - Returns: Array of complete match objects

- **`get_event_matches_simple`** - Get simplified matches for an event
  - Parameters: `event_key` (string)
  - Returns: Array of basic match data

- **`get_event_matches_keys`** - Get match keys for an event
  - Parameters: `event_key` (string)
  - Returns: Array of match key strings

#### Event Analytics

- **`get_event_insights`** - Get event-specific insights and statistics
  - Parameters: `event_key` (string)
  - Returns: Qualification and playoff statistics and insights

- **`get_event_oprs`** - Get OPR, DPR, and CCWM ratings for teams at an event
  - Parameters: `event_key` (string)
  - Returns: Object with OPR (Offensive Power Rating), DPR (Defensive Power Rating), CCWM (Calculated Contribution to Winning Margin)

- **`get_event_predictions`** - Get TBA-generated predictions for an event
  - Parameters: `event_key` (string)
  - Returns: Match and ranking predictions

- **`get_event_district_points`** - Get district points for teams at an event
  - Parameters: `event_key` (string)
  - Returns: District points breakdown by team

### Match Information Tools

- **`get_match`** - Get detailed information about a specific match
  - Parameters: `match_key` (string)
  - Returns: Complete match data with scores, alliances, breakdown
  - Example: `get_match(match_key="2023casj_qm1")`

- **`get_match_simple`** - Get simplified match information
  - Parameters: `match_key` (string)
  - Returns: Basic match data

- **`get_match_zebra`** - Get Zebra MotionWorks data for a match (robot tracking)
  - Parameters: `match_key` (string)
  - Returns: Robot position tracking data (if available)

### District Tools

- **`get_districts`** - Get all districts for a specific year
  - Parameters: `year` (number)
  - Returns: Array of district objects

- **`get_district_rankings`** - Get team rankings within a district
  - Parameters: `district_key` (string)
  - Returns: Array of district ranking objects with points breakdown
  - Example: `get_district_rankings(district_key="2023fim")`

- **`get_district_events`** - Get events in a specific district
  - Parameters: `district_key` (string)
  - Returns: Array of detailed event objects

- **`get_district_events_simple`** - Get simplified events in a district
  - Parameters: `district_key` (string)
  - Returns: Array of basic event data

- **`get_district_events_keys`** - Get event keys in a district
  - Parameters: `district_key` (string)
  - Returns: Array of event key strings

- **`get_district_teams`** - Get teams in a specific district
  - Parameters: `district_key` (string)
  - Returns: Array of detailed team objects

- **`get_district_teams_simple`** - Get simplified teams in a district
  - Parameters: `district_key` (string)
  - Returns: Array of basic team data

- **`get_district_teams_keys`** - Get team keys in a district
  - Parameters: `district_key` (string)
  - Returns: Array of team key strings

### General/Utility Tools

- **`get_teams`** - Get paginated list of all teams (detailed)
  - Parameters: `page_num` (number, 0-indexed)
  - Returns: Array of complete team objects (500 teams per page)

- **`get_teams_simple`** - Get paginated list of teams (simplified)
  - Parameters: `page_num` (number, 0-indexed)
  - Returns: Array of basic team data

- **`get_teams_keys`** - Get paginated list of team keys
  - Parameters: `page_num` (number, 0-indexed)
  - Returns: Array of team key strings

- **`get_teams_by_year`** - Get teams that competed in a specific year (detailed)
  - Parameters: `year` (number), `page_num` (number, 0-indexed)
  - Returns: Array of complete team objects

- **`get_teams_by_year_simple`** - Get teams from a year (simplified)
  - Parameters: `year` (number), `page_num` (number, 0-indexed)
  - Returns: Array of basic team data

- **`get_teams_by_year_keys`** - Get team keys from a specific year
  - Parameters: `year` (number), `page_num` (number, 0-indexed)
  - Returns: Array of team key strings

- **`get_status`** - Get TBA API status information
  - No parameters required
  - Returns: API status including current season, downtime info, app versions

### Parameter Validation

All tools implement strict parameter validation:

- **Team Keys**: Must match format `frcXXXX` (e.g., `frc86`, `frc1234`)
- **Years**: Must be between 1992 and current year + 1
- **Event Keys**: String format like `2023casj`, `2024week1`
- **Match Keys**: String format like `2023casj_qm1`, `2024week1_sf1m1`
- **District Keys**: String format like `2023fim`, `2024pnw`
- **Page Numbers**: 0-indexed integers (≥ 0)

### Data Response Formats

- **Simple**: Basic information for lists and overviews
- **Detailed**: Complete information including all available fields
- **Keys**: Just the identifier strings for efficient lookups

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
npm ci

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

All API responses are validated using Zod schemas ensuring type safety and consistency:

### Core Schemas

#### Team Schema

Complete team information including:

- `key` (string) - Team identifier (e.g., "frc86")
- `team_number` (number) - Numeric team number
- `nickname` (string) - Team nickname/informal name
- `name` (string) - Official team name
- `city`, `state_prov`, `country` (string) - Location details
- `website` (string) - Team website URL
- `rookie_year` (number) - First year of competition
- `motto` (string) - Team motto/slogan
- Location data: `lat`, `lng`, `address`, `postal_code`, `gmaps_place_id`, `gmaps_url`

#### TeamSimple Schema

Simplified team data:

- `key`, `team_number`, `nickname`, `name`
- `city`, `state_prov`, `country`

#### Event Schema

Complete event information including:

- `key` (string) - Event identifier (e.g., "2023casj")
- `name` (string) - Official event name
- `event_code` (string) - Short event code
- `event_type` (number) - Event type identifier
- `start_date`, `end_date` (string) - ISO date strings
- `year` (number) - Competition year
- `week` (number) - Competition week (null for offseason)
- Location: `city`, `state_prov`, `country`, `address`, `timezone`
- `district` - District information object (if applicable)
- `webcasts` - Array of webcast objects with type, channel, date
- `playoff_type`, `playoff_type_string` - Playoff format information

#### EventSimple Schema

Basic event data:

- `key`, `name`, `event_code`, `event_type`
- `city`, `state_prov`, `country`
- `start_date`, `end_date`, `year`

#### Match Schema

Complete match information:

- `key` (string) - Match identifier (e.g., "2023casj_qm1")
- `comp_level` (string) - Competition level (qm, ef, qf, sf, f)
- `set_number`, `match_number` (number) - Match identifiers
- `alliances` - Red and blue alliance objects containing:
  - `score` (number) - Alliance final score
  - `team_keys` (string[]) - Array of team identifiers
  - `surrogate_team_keys`, `dq_team_keys` (string[]) - Special designations
- `winning_alliance` (string) - "red", "blue", or null for ties
- `event_key` (string) - Parent event identifier
- Timing: `time`, `actual_time`, `predicted_time`, `post_result_time`
- `score_breakdown` - Detailed scoring breakdown object (game-specific)
- `videos` - Array of video objects with type and key

#### MatchSimple Schema

Basic match data:

- `key`, `comp_level`, `set_number`, `match_number`
- Simplified `alliances` with score and team_keys only
- `winning_alliance`, `event_key`
- Basic timing: `time`, `predicted_time`, `actual_time`

#### Award Schema

Award information:

- `name` (string) - Award name
- `award_type` (number) - Award type identifier
- `event_key` (string) - Event where awarded
- `year` (number) - Competition year
- `recipient_list` - Array of recipient objects:
  - `team_key` (string) - Team recipient (if applicable)
  - `awardee` (string) - Individual recipient (if applicable)

#### Rankings Schema

Event ranking information:

- `rankings` - Array of ranking objects:
  - `team_key` (string) - Team identifier
  - `rank` (number) - Current ranking position
  - `matches_played` (number) - Number of matches played
  - `record` - Win/loss/tie record object
  - `qual_average` (number) - Average qualification score
  - `extra_stats` (number[]) - Additional statistics
  - `sort_orders` (number[]) - Tiebreaker values
- `extra_stats_info`, `sort_order_info` - Metadata describing statistics

#### Alliance Schema

Elimination alliance information:

- `name` (string) - Alliance name/number
- `picks` (string[]) - Array of team keys in pick order
- `backup` - Backup team information (if applicable)
- `declines` (string[]) - Teams that declined alliance invitations
- `status` - Alliance performance object:
  - `level` (string) - Current playoff level
  - `status` (string) - Current status
  - `record` - Overall playoff record
  - `current_level_record` - Record at current level
  - `playoff_average` (number) - Average playoff score

#### Additional Schemas

- **District Schema**: District information with abbreviation, display name, key, year
- **Robot Schema**: Robot information with year, name, key, team_key
- **Media Schema**: Media objects with type, foreign_key, details, URLs
- **DistrictPoints Schema**: District points breakdown by team
- **DistrictRanking Schema**: District standings with point totals and event breakdown
- **TeamEventStatus Schema**: Team status at specific events (qualification rank, alliance, playoff status)
- **Insights Schema**: Event-specific statistics and insights
- **EventOPRs Schema**: OPR, DPR, and CCWM ratings
- **Zebra Schema**: Robot tracking data with position coordinates over time
- **Prediction Schema**: TBA-generated match and ranking predictions
- **Status Schema**: API status information

### Schema Validation

All responses are validated to ensure:

- **Type Safety**: Correct data types for all fields
- **Required Fields**: Essential data is always present
- **Null Handling**: Proper handling of optional/missing data
- **Consistency**: Uniform structure across all endpoints
- **Error Prevention**: Invalid data is caught before reaching your application

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
