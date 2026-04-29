import { Tool, ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import {
  toMCPSchema,
  GetTeamInputSchema,
  GetTeamEventsInputSchema,
  GetTeamAwardsInputSchema,
  GetTeamMatchesInputSchema,
  GetEventsInputSchema,
  GetEventInputSchema,
  GetEventTeamsInputSchema,
  GetEventRankingsInputSchema,
  GetEventMatchesInputSchema,
  GetEventAlliancesInputSchema,
  GetEventInsightsInputSchema,
  GetEventDistrictPointsInputSchema,
  GetTeamYearsParticipatedInputSchema,
  GetTeamDistrictsInputSchema,
  GetTeamRobotsInputSchema,
  GetTeamMediaInputSchema,
  GetTeamEventMatchesInputSchema,
  GetTeamsInputSchema,
  GetStatusInputSchema,
  GetMatchInputSchema,
  GetEventOprsInputSchema,
  GetEventAwardsInputSchema,
  GetTeamAwardsAllInputSchema,
  GetTeamEventsAllInputSchema,
  GetTeamEventStatusInputSchema,
  GetDistrictsInputSchema,
  GetDistrictRankingsInputSchema,
  GetTeamsSimpleInputSchema,
  GetTeamsKeysInputSchema,
  GetTeamsByYearInputSchema,
  GetTeamsByYearSimpleInputSchema,
  GetTeamsByYearKeysInputSchema,
  GetTeamSimpleInputSchema,
  GetEventSimpleInputSchema,
  GetEventsSimpleInputSchema,
  GetEventsKeysInputSchema,
  GetMatchSimpleInputSchema,
  GetTeamEventsSimpleInputSchema,
  GetTeamEventsKeysInputSchema,
  GetTeamEventAwardsInputSchema,
  GetTeamMatchesSimpleInputSchema,
  GetTeamMatchesKeysInputSchema,
  GetTeamSocialMediaInputSchema,
  GetTeamMediaByTagInputSchema,
  GetTeamMediaByTagYearInputSchema,
  GetEventTeamsSimpleInputSchema,
  GetEventTeamsKeysInputSchema,
  GetEventMatchesSimpleInputSchema,
  GetEventMatchesKeysInputSchema,
  GetEventPredictionsInputSchema,
  GetMatchZebraInputSchema,
  GetTeamHistoryInputSchema,
  GetTeamEventStatusesInputSchema,
  GetTeamEventMatchesSimpleInputSchema,
  GetTeamEventMatchesKeysInputSchema,
  GetDistrictEventsInputSchema,
  GetDistrictEventsSimpleInputSchema,
  GetDistrictEventsKeysInputSchema,
  GetDistrictTeamsInputSchema,
  GetDistrictTeamsSimpleInputSchema,
  GetDistrictTeamsKeysInputSchema,
} from './schemas.js';

// Every tool is a read-only HTTP GET against The Blue Alliance API: it does
// not mutate state, returns the same data for the same input within TBA's
// cache window, and reaches an external system.
const READ_ONLY_API: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

export const tools: Tool[] = [
  {
    name: 'get_team',
    description:
      "Retrieve the full profile of a single FIRST Robotics Competition (FRC) team identified by team key (e.g., 'frc86'). Returns team number, nickname, full sponsor/school name, location (city, state/province, country, address, postal code, lat/lng, Google Maps place id), website, motto, rookie year, and home championship affiliation. Use for in-depth team lookups, scouting research, or generating team profile pages. For a lighter response see get_team_simple; for keys only see get_teams_keys.",
    inputSchema: toMCPSchema(GetTeamInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get FRC Team Profile' },
  },
  {
    name: 'get_team_events',
    description:
      "List every FRC event a team registered for in a given season year. Returns full event records (name, dates, location, district affiliation, week number, webcasts, event type, division keys). Use to build a team's seasonal schedule or determine which events to scout. Lighter variants: get_team_events_simple, get_team_events_keys.",
    inputSchema: toMCPSchema(GetTeamEventsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Events for a Year' },
  },
  {
    name: 'get_team_awards',
    description:
      "Retrieve every award won by a team during a single FRC season year. Returns award name, award type code, event key where the award was given, year, and recipient list (team key plus individual awardee for honors like Woodie Flowers Finalist). Useful for tracking annual recognition such as the Impact Award (formerly Chairman's Award), Engineering Inspiration, regional/district event winners, Excellence in Engineering, Innovation in Control, and other technical awards. For lifetime awards see get_team_awards_all.",
    inputSchema: toMCPSchema(GetTeamAwardsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Awards for a Year' },
  },
  {
    name: 'get_team_matches',
    description:
      'List every qualification, playoff, and finals match a team played during a given FRC season year, across all events. Returns full match records: alliance compositions (red/blue with team keys, surrogates, DQ list), final scores, game-specific score breakdown, winning alliance, video links (YouTube/TBA), and predicted vs. actual times. Lighter variants: get_team_matches_simple (omits score breakdown and videos) and get_team_matches_keys (just match keys).',
    inputSchema: toMCPSchema(GetTeamMatchesInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Matches for a Year' },
  },
  {
    name: 'get_events',
    description:
      'List every FRC event scheduled or completed for a given season year, worldwide. Returns full event records (name, event code, dates, location, district affiliation, week number, webcast channels, event type, division keys for championships, parent event key, playoff type). Use to discover regionals, district qualifying events, district championships, off-season events, and FIRST Championship divisions for a season. Lighter variants: get_events_simple, get_events_keys.',
    inputSchema: toMCPSchema(GetEventsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List FRC Events for a Year' },
  },
  {
    name: 'get_event',
    description:
      "Retrieve the full record for a single FRC event by event key (e.g., '2023casj' for the 2023 Silicon Valley Regional). Returns event name, code, type (regional/district/championship), location with lat/lng and timezone, date range, district affiliation, week number, webcast channels (Twitch/YouTube), division keys (for championships), parent event key, and playoff type. For a lighter payload see get_event_simple.",
    inputSchema: toMCPSchema(GetEventInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get FRC Event Details' },
  },
  {
    name: 'get_event_teams',
    description:
      'List every FRC team registered to compete at a specific event, with full team profiles (number, nickname, name, location, website, motto, rookie year). Use to enumerate the field at a regional, district event, or championship division for scouting or programmatic outreach. Lighter variants: get_event_teams_simple, get_event_teams_keys.',
    inputSchema: toMCPSchema(GetEventTeamsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Teams at an Event' },
  },
  {
    name: 'get_event_rankings',
    description:
      'Retrieve the live or final qualification rankings for an FRC event. Returns ordered ranking rows (team key, rank, win/loss/tie record, matches played, qualification average, sort orders, extra stats, DQ count) plus metadata describing each sort criterion (e.g., Ranking Points, Auto, Endgame). Used to determine alliance selection order, seed playoff alliances, and assess team performance during qualification matches.',
    inputSchema: toMCPSchema(GetEventRankingsInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'Get Event Qualification Rankings',
    },
  },
  {
    name: 'get_event_matches',
    description:
      'Fetch every match played at a specific FRC event, including qualification, playoff, and finals. Returns full match records with alliance compositions, final scores, game-specific score breakdown (auto/teleop/endgame components), winning alliance, video links, and timing (scheduled/predicted/actual/post-result). Lighter variants: get_event_matches_simple, get_event_matches_keys.',
    inputSchema: toMCPSchema(GetEventMatchesInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Matches at an Event' },
  },
  {
    name: 'get_event_alliances',
    description:
      "Retrieve playoff alliance selections for an FRC event. Returns each alliance in seed order with captain and pick team keys, declined teams, backup robot info (in/out swap), and playoff progression status (current level, win/loss/tie record, playoff average score, final result string like 'won' or 'eliminated'). Available after alliance selection concludes; null/empty before selection.",
    inputSchema: toMCPSchema(GetEventAlliancesInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Event Playoff Alliances' },
  },
  {
    name: 'get_event_insights',
    description:
      'Retrieve aggregated game-specific statistics computed by The Blue Alliance for an event, separated into qualification and playoff phases. Includes per-task averages, scoring trends, bonus (ranking point) achievement rates, and other game-specific metrics. Field structure varies per game year (e.g., Charged Up, Crescendo, Reefscape).',
    inputSchema: toMCPSchema(GetEventInsightsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Event Game Insights' },
  },
  {
    name: 'get_event_district_points',
    description:
      'Retrieve district championship qualifying points awarded at an event for each participating team. Returns per-team breakdown of qualification points, alliance selection points, elimination points, and award points (the official FIRST district point system) plus tiebreaker stats (highest qual scores, qual wins). Only meaningful for district-affiliated events; non-district events return null.',
    inputSchema: toMCPSchema(GetEventDistrictPointsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Event District Points' },
  },
  {
    name: 'get_team_years_participated',
    description:
      "Retrieve every season year in which a team has competed in FRC, sorted ascending. Returns a flat array of year integers. Use to bound year-based queries, drive per-year iteration, or determine a team's longevity and rookie year.",
    inputSchema: toMCPSchema(GetTeamYearsParticipatedInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Years Participated' },
  },
  {
    name: 'get_team_districts',
    description:
      "List the FRC district affiliations a team has held across its history. Returns district records (abbreviation, display name, district key, year). Useful for tracking when a team participated in district play (FIRST in Michigan, New England, Chesapeake, Pacific Northwest, FIRST In Texas, etc.) versus open regional competition, and for analyzing a team's geographic competition history.",
    inputSchema: toMCPSchema(GetTeamDistrictsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team District History' },
  },
  {
    name: 'get_team_robots',
    description:
      "List the named robots a team has built and registered each year (e.g., 'Stronghold' for 2016, 'Citrus Circuits Quokka' patterns). Returns robot records with year, robot_name, robot key, and team key. Useful for retrospective profiles and historical references.",
    inputSchema: toMCPSchema(GetTeamRobotsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Robot Names' },
  },
  {
    name: 'get_team_media',
    description:
      "Retrieve media (photos, videos, presentations, essays) submitted for a team in a given FRC season year. Returns media records with type (e.g., 'youtube', 'imgur', 'instagram-image', 'cdphotothread'), foreign_key, view URL, direct URL, and the 'preferred' flag highlighting the team's chosen primary image. Useful for surfacing official reveal videos, robot photos, and Impact/Chairman's submissions.",
    inputSchema: toMCPSchema(GetTeamMediaInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Media for a Year' },
  },
  {
    name: 'get_team_event_matches',
    description:
      'Fetch every match a team played at a single specific event in one call. Returns full match records (alliances, scores, score breakdowns, videos, timing). Combines team and event filters server-side, avoiding client-side filtering of get_team_matches or get_event_matches. Lighter variants: get_team_event_matches_simple, get_team_event_matches_keys.',
    inputSchema: toMCPSchema(GetTeamEventMatchesInputSchema),
    annotations: { ...READ_ONLY_API, title: "Get Team's Matches at an Event" },
  },
  {
    name: 'get_teams',
    description:
      "List all FRC teams ever registered, paginated in groups of 500. Returns full team profiles. Increment page_num starting at 0 until the response is empty to enumerate every team in TBA's database. For lighter payloads use get_teams_simple; for team keys only use get_teams_keys.",
    inputSchema: toMCPSchema(GetTeamsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List All FRC Teams (Paginated)' },
  },
  {
    name: 'get_status',
    description:
      'Retrieve TBA API status: current FRC season, max season available, datafeed health flag, list of currently down event keys, max team page index, and minimum/latest mobile app versions for iOS and Android. Useful for sanity-checking the API, discovering season bounds, and detecting outages before issuing other queries.',
    inputSchema: toMCPSchema(GetStatusInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get TBA API Status' },
  },
  {
    name: 'get_match',
    description:
      "Retrieve the full record for a single match by match key (e.g., '2023casj_qm1'). Returns red/blue alliance compositions (team keys, surrogates, DQ list), final scores, game-specific score breakdown (auto, teleop, endgame, fouls, ranking-point achievements), winning alliance, predicted vs. actual times, and video links. For a lighter payload see get_match_simple. For Zebra MotionWorks robot tracking telemetry see get_match_zebra.",
    inputSchema: toMCPSchema(GetMatchInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get FRC Match Details' },
  },
  {
    name: 'get_event_oprs',
    description:
      'Retrieve OPR (Offensive Power Rating), DPR (Defensive Power Rating), and CCWM (Calculated Contribution to Winning Margin) for every team at an event, returned as three team_key→number maps. Computed via least-squares regression on match scores. Standard scouting/alliance-selection metrics for estimating per-team contribution.',
    inputSchema: toMCPSchema(GetEventOprsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Event OPR/DPR/CCWM' },
  },
  {
    name: 'get_event_awards',
    description:
      "List every award given out at a specific FRC event. Returns each award's name, type code, recipient team key, awardee name (for individual honors like Woodie Flowers Finalist or Dean's List), and year. Available once awards ceremony has concluded.",
    inputSchema: toMCPSchema(GetEventAwardsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Awards at an Event' },
  },
  {
    name: 'get_team_awards_all',
    description:
      'Retrieve every award won by a team across its entire FRC competition history. Returns the full award list (name, year, event key, recipient list, type code). Use for lifetime award tallies, retrospectives, and Hall of Fame analysis. For a single year see get_team_awards.',
    inputSchema: toMCPSchema(GetTeamAwardsAllInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get All Team Awards (History)' },
  },
  {
    name: 'get_team_events_all',
    description:
      "List every FRC event a team has competed at across all years it has participated. Returns full event records. Use to map a team's complete competition history, generate timelines, or feed per-event aggregations. For a single year see get_team_events.",
    inputSchema: toMCPSchema(GetTeamEventsAllInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get All Team Events (History)' },
  },
  {
    name: 'get_team_event_status',
    description:
      "Retrieve a team's competitive status and standings at a specific event. Returns qualification ranking row (rank, record, sort orders, qual average), alliance selection result (alliance number, pick slot, backup status), playoff progression (level, current-level record, overall record, playoff average, final status), and human-readable summary strings (overall_status_str, alliance_status_str, playoff_status_str), plus next/last match keys. Excellent for live scouting dashboards and event-day status displays.",
    inputSchema: toMCPSchema(GetTeamEventStatusInputSchema),
    annotations: { ...READ_ONLY_API, title: "Get Team's Status at an Event" },
  },
  {
    name: 'get_districts',
    description:
      "List every active FRC district for a given season year (FIRST in Michigan 'fim', New England 'ne', Chesapeake 'chs', Pacific Northwest 'pnw', FIRST In Texas 'fit', Indiana 'in', Ontario 'ont', Israel 'isr', etc.). Returns each district's abbreviation, display name, district key, and year.",
    inputSchema: toMCPSchema(GetDistrictsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List FRC Districts for a Year' },
  },
  {
    name: 'get_district_rankings',
    description:
      "Retrieve season-end district rankings for all teams in an FRC district. Returns each team's overall rank, total district points, rookie bonus, and per-event point breakdown (qualification, alliance, elimination, award, district championship boolean). Determines which teams qualify for the district championship and the FIRST Championship via the district point system.",
    inputSchema: toMCPSchema(GetDistrictRankingsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get District Team Rankings' },
  },
  {
    name: 'get_teams_simple',
    description:
      'Paginated listing of every registered FRC team with reduced fields (key, team_number, nickname, name, city, state_prov, country). Lighter than get_teams; use when website, motto, address, and geocoded location are not needed.',
    inputSchema: toMCPSchema(GetTeamsSimpleInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List All FRC Teams (Simple)' },
  },
  {
    name: 'get_teams_keys',
    description:
      "Paginated listing of every registered FRC team key only (strings like 'frc86'). Lightest team enumeration option; ideal for building team-key indices or driving subsequent per-team queries with minimal payload size.",
    inputSchema: toMCPSchema(GetTeamsKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List All FRC Team Keys' },
  },
  {
    name: 'get_teams_by_year',
    description:
      'List every FRC team that competed in a given season year, paginated in groups of 500. Returns full team profiles. Use to scope team enumeration to a single competition season. Lighter variants: get_teams_by_year_simple, get_teams_by_year_keys.',
    inputSchema: toMCPSchema(GetTeamsByYearInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List FRC Teams by Year' },
  },
  {
    name: 'get_teams_by_year_simple',
    description:
      'Paginated list of FRC teams that competed in a given year with reduced team fields (key, team_number, nickname, name, location). Lighter than get_teams_by_year.',
    inputSchema: toMCPSchema(GetTeamsByYearSimpleInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List FRC Teams by Year (Simple)' },
  },
  {
    name: 'get_teams_by_year_keys',
    description:
      'Paginated list of team keys that competed in a given FRC season year. Lightest variant; ideal for building per-year team indices or driving downstream per-team lookups.',
    inputSchema: toMCPSchema(GetTeamsByYearKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List FRC Team Keys by Year' },
  },
  {
    name: 'get_team_simple',
    description:
      'Retrieve a reduced FRC team profile (key, team_number, nickname, name, city, state_prov, country). Lighter than get_team; use when website, motto, address, and lat/lng are not needed.',
    inputSchema: toMCPSchema(GetTeamSimpleInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get FRC Team Profile (Simple)' },
  },
  {
    name: 'get_event_simple',
    description:
      'Retrieve a reduced FRC event profile (key, name, event_code, type, location, dates, year). Lighter than get_event; use when district, webcast, division, and playoff metadata are not needed.',
    inputSchema: toMCPSchema(GetEventSimpleInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get FRC Event Details (Simple)' },
  },
  {
    name: 'get_events_simple',
    description:
      'List every FRC event for a season year with reduced event fields. Lighter than get_events.',
    inputSchema: toMCPSchema(GetEventsSimpleInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'List FRC Events by Year (Simple)',
    },
  },
  {
    name: 'get_events_keys',
    description:
      "List every FRC event key for a season year (strings like '2024casj', '2024nyro', '2024micmp4'). Lightest events enumeration; useful for driving subsequent per-event queries with minimal bandwidth.",
    inputSchema: toMCPSchema(GetEventsKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List FRC Event Keys by Year' },
  },
  {
    name: 'get_match_simple',
    description:
      'Retrieve a single match with reduced fields (alliances, scores, winning alliance, timing). Omits game-specific score breakdown and video links. Lighter than get_match.',
    inputSchema: toMCPSchema(GetMatchSimpleInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get FRC Match Details (Simple)' },
  },
  {
    name: 'get_team_events_simple',
    description:
      "List a team's FRC events in a season year with reduced event fields. Lighter than get_team_events.",
    inputSchema: toMCPSchema(GetTeamEventsSimpleInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'Get Team Events for a Year (Simple)',
    },
  },
  {
    name: 'get_team_events_keys',
    description:
      "List the event keys a team registered for in a given FRC season year. Lightest variant of get_team_events; useful for driving per-event queries scoped to a team's schedule.",
    inputSchema: toMCPSchema(GetTeamEventsKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Event Keys for a Year' },
  },
  {
    name: 'get_team_event_awards',
    description:
      'Retrieve every award won by a specific team at a specific event. Returns award records (name, type, year, recipient list including team key and individual awardee names).',
    inputSchema: toMCPSchema(GetTeamEventAwardsInputSchema),
    annotations: { ...READ_ONLY_API, title: "Get Team's Awards at an Event" },
  },
  {
    name: 'get_team_matches_simple',
    description:
      'List every match a team played in a season year with reduced match fields (no game-specific score breakdown or videos). Lighter than get_team_matches.',
    inputSchema: toMCPSchema(GetTeamMatchesSimpleInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'Get Team Matches for a Year (Simple)',
    },
  },
  {
    name: 'get_team_matches_keys',
    description:
      "List every match key a team played in a given FRC season year. Lightest variant of get_team_matches; useful for driving per-match queries scoped to a team's season.",
    inputSchema: toMCPSchema(GetTeamMatchesKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Match Keys for a Year' },
  },
  {
    name: 'get_team_social_media',
    description:
      "Retrieve a team's official social media handles registered with The Blue Alliance (Twitter/X, Instagram, Facebook, YouTube channel, GitHub, team website link, etc.). Returned as media records where 'type' is the platform and 'foreign_key' is the handle, slug, or URL fragment.",
    inputSchema: toMCPSchema(GetTeamSocialMediaInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Social Media' },
  },
  {
    name: 'get_team_media_by_tag',
    description:
      "Retrieve a team's media filtered by a specific TBA tag (e.g., 'chairmans_video', 'chairmans_essay', 'chairmans_presentation', 'imagery') across all years. Useful for surfacing Impact/Chairman's Award submissions or pinned imagery.",
    inputSchema: toMCPSchema(GetTeamMediaByTagInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Media by Tag' },
  },
  {
    name: 'get_team_media_by_tag_year',
    description:
      "Retrieve a team's media filtered by both tag and season year. Use to fetch a single year's Impact/Chairman's submission package or other tagged media.",
    inputSchema: toMCPSchema(GetTeamMediaByTagYearInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Team Media by Tag and Year' },
  },
  {
    name: 'get_event_teams_simple',
    description:
      'List teams competing at an event with reduced team fields (key, team_number, nickname, name, location). Lighter than get_event_teams.',
    inputSchema: toMCPSchema(GetEventTeamsSimpleInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Teams at an Event (Simple)' },
  },
  {
    name: 'get_event_teams_keys',
    description:
      "List team keys competing at an event (strings like 'frc86'). Lightest enumeration of an event's competing teams; ideal for driving downstream per-team lookups.",
    inputSchema: toMCPSchema(GetEventTeamsKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Team Keys at an Event' },
  },
  {
    name: 'get_event_matches_simple',
    description:
      'List matches at an event with reduced match fields (no game-specific score breakdown or videos). Lighter than get_event_matches.',
    inputSchema: toMCPSchema(GetEventMatchesSimpleInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'List Matches at an Event (Simple)',
    },
  },
  {
    name: 'get_event_matches_keys',
    description:
      "List match keys at an event (strings like '2023casj_qm1', '2023casj_sf1m1'). Lightest enumeration of an event's matches.",
    inputSchema: toMCPSchema(GetEventMatchesKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Match Keys at an Event' },
  },
  {
    name: 'get_event_predictions',
    description:
      'Retrieve TBA-generated match score predictions and end-of-event ranking predictions for an event when computed. Returns predicted red/blue scores keyed by match key plus predicted final ranks keyed by team key. Availability and field structure vary by event and game year; some events return null or partial data.',
    inputSchema: toMCPSchema(GetEventPredictionsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Event Predictions' },
  },
  {
    name: 'get_match_zebra',
    description:
      'Retrieve Zebra MotionWorks robot-tracking telemetry for a match: per-timestep XY field positions for every robot on red and blue alliances, plus the timestamp series. Only available for events with Zebra tracking installed (typically FIRST Championship divisions and a subset of regionals/district championships). Useful for advanced scouting, defense analysis, and trajectory visualization.',
    inputSchema: toMCPSchema(GetMatchZebraInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'Get Zebra MotionWorks Match Tracking',
    },
  },
  {
    name: 'get_team_history',
    description:
      "Retrieve a team's full FRC competition history aggregated into a single response: every event, every match, every award, and every robot. High-payload call — use sparingly when a complete archive is needed (e.g., generating a team retrospective). For narrower queries prefer get_team_events_all, get_team_awards_all, or year-scoped variants.",
    inputSchema: toMCPSchema(GetTeamHistoryInputSchema),
    annotations: { ...READ_ONLY_API, title: 'Get Full Team History' },
  },
  {
    name: 'get_team_event_statuses',
    description:
      "Retrieve a team's per-event status for every event the team attended in a given year, returned as an object keyed by event_key. Each entry mirrors get_team_event_status (rank, alliance, playoff progression, summary strings, next/last match key). Use to render a season status dashboard in one call.",
    inputSchema: toMCPSchema(GetTeamEventStatusesInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'Get Team Statuses Across All Year Events',
    },
  },
  {
    name: 'get_team_event_matches_simple',
    description:
      'Lighter variant of get_team_event_matches: every match a team played at a single event with reduced match fields (no game-specific score breakdown or videos).',
    inputSchema: toMCPSchema(GetTeamEventMatchesSimpleInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: "Get Team's Matches at an Event (Simple)",
    },
  },
  {
    name: 'get_team_event_matches_keys',
    description:
      'Lightest variant returning only match keys for a team at a specific event. Ideal for driving downstream per-match queries.',
    inputSchema: toMCPSchema(GetTeamEventMatchesKeysInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: "Get Team's Match Keys at an Event",
    },
  },
  {
    name: 'get_district_events',
    description:
      'List every FRC event in a district (e.g., all 2024 FIRST in Michigan district qualifying events plus the district championship). Returns full event records. Lighter variants: get_district_events_simple, get_district_events_keys.',
    inputSchema: toMCPSchema(GetDistrictEventsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Events in a District' },
  },
  {
    name: 'get_district_events_simple',
    description:
      'List events in an FRC district with reduced event fields. Lighter than get_district_events.',
    inputSchema: toMCPSchema(GetDistrictEventsSimpleInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'List Events in a District (Simple)',
    },
  },
  {
    name: 'get_district_events_keys',
    description:
      'List event keys in an FRC district. Lightest enumeration of district events; ideal for driving per-event lookups across a district season.',
    inputSchema: toMCPSchema(GetDistrictEventsKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Event Keys in a District' },
  },
  {
    name: 'get_district_teams',
    description:
      "List every team affiliated with an FRC district in a given year. Returns full team profiles. Use to enumerate a district's competitive field. Lighter variants: get_district_teams_simple, get_district_teams_keys.",
    inputSchema: toMCPSchema(GetDistrictTeamsInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Teams in a District' },
  },
  {
    name: 'get_district_teams_simple',
    description:
      'List teams in an FRC district with reduced team fields. Lighter than get_district_teams.',
    inputSchema: toMCPSchema(GetDistrictTeamsSimpleInputSchema),
    annotations: {
      ...READ_ONLY_API,
      title: 'List Teams in a District (Simple)',
    },
  },
  {
    name: 'get_district_teams_keys',
    description:
      "List team keys in an FRC district. Lightest enumeration of a district's teams; ideal for driving per-team lookups.",
    inputSchema: toMCPSchema(GetDistrictTeamsKeysInputSchema),
    annotations: { ...READ_ONLY_API, title: 'List Team Keys in a District' },
  },
];
