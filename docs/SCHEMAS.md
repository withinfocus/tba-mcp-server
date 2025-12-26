# Data Schemas

All API responses are validated using Zod schemas ensuring type safety and consistency.

## Table of Contents

- [Core Schemas](#core-schemas)
  - [Team Schema](#team-schema)
  - [TeamSimple Schema](#teamsimple-schema)
  - [Event Schema](#event-schema)
  - [EventSimple Schema](#eventsimple-schema)
  - [Match Schema](#match-schema)
  - [MatchSimple Schema](#matchsimple-schema)
  - [Award Schema](#award-schema)
  - [Rankings Schema](#rankings-schema)
  - [Alliance Schema](#alliance-schema)
- [Additional Schemas](#additional-schemas)
- [Schema Validation](#schema-validation)

## Core Schemas

### Team Schema

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

### TeamSimple Schema

Simplified team data:

- `key`, `team_number`, `nickname`, `name`
- `city`, `state_prov`, `country`

### Event Schema

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

### EventSimple Schema

Basic event data:

- `key`, `name`, `event_code`, `event_type`
- `city`, `state_prov`, `country`
- `start_date`, `end_date`, `year`

### Match Schema

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

### MatchSimple Schema

Basic match data:

- `key`, `comp_level`, `set_number`, `match_number`
- Simplified `alliances` with score and team_keys only
- `winning_alliance`, `event_key`
- Basic timing: `time`, `predicted_time`, `actual_time`

### Award Schema

Award information:

- `name` (string) - Award name
- `award_type` (number) - Award type identifier
- `event_key` (string) - Event where awarded
- `year` (number) - Competition year
- `recipient_list` - Array of recipient objects:
  - `team_key` (string) - Team recipient (if applicable)
  - `awardee` (string) - Individual recipient (if applicable)

### Rankings Schema

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

### Alliance Schema

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

## Additional Schemas

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

## Schema Validation

All responses are validated to ensure:

- **Type Safety**: Correct data types for all fields
- **Required Fields**: Essential data is always present
- **Null Handling**: Proper handling of optional/missing data
- **Consistency**: Uniform structure across all endpoints
- **Error Prevention**: Invalid data is caught before reaching your application
