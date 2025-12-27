# Available Tools

Tools for accessing The Blue Alliance API. All tools validate input parameters and return structured, type-safe data.

## Table of Contents

- [Team Information Tools](#team-information-tools)
  - [Core Team Data](#core-team-data)
  - [Team Participation & History](#team-participation--history)
  - [Team Events & Performance](#team-events--performance)
  - [Team Matches](#team-matches)
  - [Team Awards](#team-awards)
  - [Team Media & Social](#team-media--social)
- [Event Information Tools](#event-information-tools)
  - [Core Event Data](#core-event-data)
  - [Event Participants](#event-participants)
  - [Event Results & Rankings](#event-results--rankings)
  - [Event Matches](#event-matches)
  - [Event Analytics](#event-analytics)
- [Match Information Tools](#match-information-tools)
- [District Tools](#district-tools)
- [General/Utility Tools](#generalutility-tools)
- [Parameter Validation](#parameter-validation)
- [Data Response Formats](#data-response-formats)
- [Common Patterns](#common-patterns)

## Team Information Tools

### Core Team Data

#### `get_team`

Get detailed team information

- **Parameters**: `team_key` (string, format: frcXXXX)
- **Returns**: Complete team profile including location, website, rookie year, motto
- **Example**: `get_team(team_key="frc86")`

#### `get_team_simple`

Get simplified team information

- **Parameters**: `team_key` (string, format: frcXXXX)
- **Returns**: Basic team data (number, name, city, state, country)

### Team Participation & History

#### `get_team_years_participated`

Get years a team has participated in competition

- **Parameters**: `team_key` (string)
- **Returns**: Array of years (numbers)

#### `get_team_districts`

Get district history for a team

- **Parameters**: `team_key` (string)
- **Returns**: Array of district objects with abbreviation, display name, key, year

#### `get_team_robots`

Get robot names for a team by year

- **Parameters**: `team_key` (string)
- **Returns**: Array of robot objects with year, name, key

#### `get_team_history`

Get comprehensive historical data for a team

- **Parameters**: `team_key` (string)
- **Returns**: Awards, events, matches, and robots across all years

### Team Events & Performance

#### `get_team_events`

Get events a team participated in for a specific year

- **Parameters**: `team_key` (string), `year` (number, 1992-current+1)
- **Returns**: Array of detailed event objects

#### `get_team_events_simple`

Get simplified events for a team in a year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Array of basic event data

#### `get_team_events_keys`

Get event keys for a team in a year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Array of event key strings

#### `get_team_events_all`

Get all events a team has participated in across all years

- **Parameters**: `team_key` (string)
- **Returns**: Array of detailed event objects

#### `get_team_event_status`

Get team's rank and status at a specific event

- **Parameters**: `team_key` (string), `event_key` (string)
- **Returns**: Qualification ranking, alliance info, playoff status

#### `get_team_event_statuses`

Get team's status at all events in a year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Object mapping event keys to status objects

### Team Matches

#### `get_team_matches`

Get detailed matches for a team in a year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Array of complete match objects with scores, alliances, breakdowns

#### `get_team_matches_simple`

Get simplified matches for a team in a year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Array of basic match data

#### `get_team_matches_keys`

Get match keys for a team in a year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Array of match key strings

#### `get_team_event_matches`

Get detailed matches for a team at a specific event

- **Parameters**: `team_key` (string), `event_key` (string)
- **Returns**: Array of complete match objects

#### `get_team_event_matches_simple`

Get simplified matches for a team at an event

- **Parameters**: `team_key` (string), `event_key` (string)
- **Returns**: Array of basic match data

#### `get_team_event_matches_keys`

Get match keys for a team at an event

- **Parameters**: `team_key` (string), `event_key` (string)
- **Returns**: Array of match key strings

### Team Awards

#### `get_team_awards`

Get awards won by a team in a specific year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Array of award objects with name, type, event, recipients

#### `get_team_awards_all`

Get all awards won by a team across all years

- **Parameters**: `team_key` (string)
- **Returns**: Array of award objects

#### `get_team_event_awards`

Get awards won by a team at a specific event

- **Parameters**: `team_key` (string), `event_key` (string)
- **Returns**: Array of award objects

### Team Media & Social

#### `get_team_media`

Get media for a team in a specific year

- **Parameters**: `team_key` (string), `year` (number)
- **Returns**: Array of media objects (photos, videos, etc.)

#### `get_team_media_by_tag`

Get media for a team filtered by tag

- **Parameters**: `team_key` (string), `media_tag` (string)
- **Returns**: Array of filtered media objects

#### `get_team_media_by_tag_year`

Get media for a team by tag and year

- **Parameters**: `team_key` (string), `media_tag` (string), `year` (number)
- **Returns**: Array of filtered media objects

#### `get_team_social_media`

Get social media information for a team

- **Parameters**: `team_key` (string)
- **Returns**: Array of social media links and handles

## Event Information Tools

### Core Event Data

#### `get_events`

Get all FRC events for a specific year

- **Parameters**: `year` (number, 1992-current+1)
- **Returns**: Array of detailed event objects

#### `get_events_simple`

Get simplified events for a year

- **Parameters**: `year` (number)
- **Returns**: Array of basic event data

#### `get_events_keys`

Get event keys for a year

- **Parameters**: `year` (number)
- **Returns**: Array of event key strings

#### `get_event`

Get detailed information about a specific event

- **Parameters**: `event_key` (string)
- **Returns**: Complete event details including dates, location, webcasts
- **Example**: `get_event(event_key="2023casj")`

#### `get_event_simple`

Get simplified event information

- **Parameters**: `event_key` (string)
- **Returns**: Basic event data

### Event Participants

#### `get_event_teams`

Get teams participating in an event

- **Parameters**: `event_key` (string)
- **Returns**: Array of detailed team objects

#### `get_event_teams_simple`

Get simplified teams in an event

- **Parameters**: `event_key` (string)
- **Returns**: Array of basic team data

#### `get_event_teams_keys`

Get team keys in an event

- **Parameters**: `event_key` (string)
- **Returns**: Array of team key strings

### Event Results & Rankings

#### `get_event_rankings`

Get team rankings for an event

- **Parameters**: `event_key` (string)
- **Returns**: Rankings object with team standings, records, statistics

#### `get_event_alliances`

Get elimination alliances for an event

- **Parameters**: `event_key` (string)
- **Returns**: Array of alliance objects with picks, status, records

#### `get_event_awards`

Get awards from a specific event

- **Parameters**: `event_key` (string)
- **Returns**: Array of award objects

### Event Matches

#### `get_event_matches`

Get detailed matches for an event

- **Parameters**: `event_key` (string)
- **Returns**: Array of complete match objects

#### `get_event_matches_simple`

Get simplified matches for an event

- **Parameters**: `event_key` (string)
- **Returns**: Array of basic match data

#### `get_event_matches_keys`

Get match keys for an event

- **Parameters**: `event_key` (string)
- **Returns**: Array of match key strings

### Event Analytics

#### `get_event_insights`

Get event-specific insights and statistics

- **Parameters**: `event_key` (string)
- **Returns**: Qualification and playoff statistics and insights

#### `get_event_oprs`

Get OPR, DPR, and CCWM ratings for teams at an event

- **Parameters**: `event_key` (string)
- **Returns**: Object with OPR (Offensive Power Rating), DPR (Defensive Power Rating), CCWM (Calculated Contribution to Winning Margin)

#### `get_event_predictions`

Get TBA-generated predictions for an event

- **Parameters**: `event_key` (string)
- **Returns**: Match and ranking predictions

#### `get_event_district_points`

Get district points for teams at an event

- **Parameters**: `event_key` (string)
- **Returns**: District points breakdown by team

## Match Information Tools

### `get_match`

Get detailed information about a specific match

- **Parameters**: `match_key` (string)
- **Returns**: Complete match data with scores, alliances, breakdown
- **Example**: `get_match(match_key="2023casj_qm1")`

### `get_match_simple`

Get simplified match information

- **Parameters**: `match_key` (string)
- **Returns**: Basic match data

### `get_match_zebra`

Get Zebra MotionWorks data for a match (robot tracking)

- **Parameters**: `match_key` (string)
- **Returns**: Robot position tracking data (if available)

## District Tools

### `get_districts`

Get all districts for a specific year

- **Parameters**: `year` (number)
- **Returns**: Array of district objects

#### `get_district_rankings`

Get team rankings within a district

- **Parameters**: `district_key` (string)
- **Returns**: Array of district ranking objects with points breakdown
- **Example**: `get_district_rankings(district_key="2023fim")`

#### `get_district_events`

Get events in a specific district

- **Parameters**: `district_key` (string)
- **Returns**: Array of detailed event objects

#### `get_district_events_simple`

Get simplified events in a district

- **Parameters**: `district_key` (string)
- **Returns**: Array of basic event data

#### `get_district_events_keys`

Get event keys in a district

- **Parameters**: `district_key` (string)
- **Returns**: Array of event key strings

#### `get_district_teams`

Get teams in a specific district

- **Parameters**: `district_key` (string)
- **Returns**: Array of detailed team objects

#### `get_district_teams_simple`

Get simplified teams in a district

- **Parameters**: `district_key` (string)
- **Returns**: Array of basic team data

#### `get_district_teams_keys`

Get team keys in a district

- **Parameters**: `district_key` (string)
- **Returns**: Array of team key strings

## General/Utility Tools

### `get_teams`

Get paginated list of all teams (detailed)

- **Parameters**: `page_num` (number, 0-indexed)
- **Returns**: Array of complete team objects (500 teams per page)

### `get_teams_simple`

Get paginated list of teams (simplified)

- **Parameters**: `page_num` (number, 0-indexed)
- **Returns**: Array of basic team data

### `get_teams_keys`

Get paginated list of team keys

- **Parameters**: `page_num` (number, 0-indexed)
- **Returns**: Array of team key strings

### `get_teams_by_year`

Get teams that competed in a specific year (detailed)

- **Parameters**: `year` (number), `page_num` (number, 0-indexed)
- **Returns**: Array of complete team objects

### `get_teams_by_year_simple`

Get teams from a year (simplified)

- **Parameters**: `year` (number), `page_num` (number, 0-indexed)
- **Returns**: Array of basic team data

### `get_teams_by_year_keys`

Get team keys from a specific year

- **Parameters**: `year` (number), `page_num` (number, 0-indexed)
- **Returns**: Array of team key strings

### `get_status`

Get TBA API status information

- **No parameters required**
- **Returns**: API status including current season, downtime info, app versions

## Parameter Validation

All tools implement strict parameter validation:

- **Team Keys**: Must match format `frcXXXX` (e.g., `frc86`, `frc1234`)
- **Years**: Must be between 1992 and current year + 1
- **Event Keys**: String format like `2023casj`, `2024week1`
- **Match Keys**: String format like `2023casj_qm1`, `2024week1_sf1m1`
- **District Keys**: String format like `2023fim`, `2024pnw`
- **Page Numbers**: 0-indexed integers (≥ 0)

## Data Response Formats

- **Simple**: Basic information for lists and overviews
- **Detailed**: Complete information including all available fields
- **Keys**: Just the identifier strings for efficient lookups

## Common Patterns

### Find a team's performance at a specific event

1. Use `get_team_event_matches` to get their matches
2. Use `get_event_rankings` to see their final ranking

### Analyze an event

1. Use `get_event` for basic event info
2. Use `get_event_teams` to see participating teams
3. Use `get_event_rankings` for final standings
4. Use `get_event_alliances` for elimination results
