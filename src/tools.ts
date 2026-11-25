import { z } from 'zod';
import type { ToolAnnotations } from '@modelcontextprotocol/server';
import {
  TeamSchema,
  EventSchema,
  AwardSchema,
  MatchSchema,
  RankingSchema,
  AllianceSchema,
  DistrictPointsSchema,
  InsightsSchema,
  DistrictSchema,
  RobotSchema,
  MediaSchema,
  StatusSchema,
  EventOPRsSchema,
  TeamEventStatusSchema,
  DistrictRankingSchema,
  TeamSimpleSchema,
  EventSimpleSchema,
  MatchSimpleSchema,
  ZebraSchema,
  PredictionSchema,
  DistrictDcmpHistorySchema,
  DistrictInsightSchema,
  DistrictAdvancementSchema,
  EventCOPRsSchema,
  NexusEventInfoSchema,
  PlayoffAdvancementSchema,
  LeaderboardInsightSchema,
  NotablesInsightSchema,
  InsightV2Schema,
  RegionalAdvancementSchema,
  RegionalRankingSchema,
  SearchIndexSchema,
  SponsorsSchema,
  TeamHistorySchema,
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
  GetDistrictHistoryInputSchema,
  GetDistrictDcmpHistoryInputSchema,
  GetDistrictInsightsInputSchema,
  GetDistrictAdvancementInputSchema,
  GetDistrictAwardsInputSchema,
  GetEventAdvancementPointsInputSchema,
  GetEventCoprsInputSchema,
  GetEventPracticeMatchesInputSchema,
  GetEventPracticeMatchesSimpleInputSchema,
  GetEventPracticeMatchesKeysInputSchema,
  GetEventMediaInputSchema,
  GetEventNexusInfoInputSchema,
  GetEventPlayoffAdvancementInputSchema,
  GetEventRegionalChampsPoolPointsInputSchema,
  GetEventTeamMediaInputSchema,
  GetEventTeamsStatusesInputSchema,
  GetInsightsLeaderboardsInputSchema,
  GetInsightsNotablesInputSchema,
  GetInsightsInputSchema,
  GetInsightsByCategoryInputSchema,
  GetInsightsForDistrictInputSchema,
  GetInsightsForDistrictByCategoryInputSchema,
  GetRegionalAdvancementInputSchema,
  GetRegionalRankingsInputSchema,
  GetSearchIndexInputSchema,
  GetSponsorsInputSchema,
  GetTeamEventsAllSimpleInputSchema,
  GetTeamEventsAllKeysInputSchema,
} from './schemas.js';

// Every tool is a read-only HTTP GET against The Blue Alliance API: it does
// not mutate state, returns the same data for the same input within TBA's
// cache window, and reaches an external system.
export const READ_ONLY_API: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

/**
 * One MCP tool, backed by a single TBA API GET endpoint.
 *
 * `inputSchema` is registered with the MCP SDK as-is: the SDK converts it to
 * JSON Schema for `tools/list` and validates `tools/call` arguments against
 * it before `endpoint` runs. `responseSchema` validates the TBA response.
 */
export interface ToolDefinition<Input extends z.ZodObject = z.ZodObject> {
  /** Tool name exposed to MCP clients (snake_case, e.g. `get_team`). */
  name: string;
  /** Human-readable display name. */
  title: string;
  /** Description shown to the model when it picks a tool. */
  description: string;
  /** Zod object schema for the tool arguments. */
  inputSchema: Input;
  /** Builds the TBA API path (relative to `/api/v3`) from validated arguments. */
  endpoint(args: z.output<Input>): string;
  /** Zod schema the TBA API response must satisfy. */
  responseSchema: z.ZodType;
  /**
   * Optional post-processing of the validated response, for endpoints whose
   * raw payload is too large to hand to a model (e.g. filtering the search
   * index down to the entries matching a query).
   */
  select?(response: unknown, args: z.output<Input>): unknown;
}

// A table entry before widening: `select` sees the parsed response type.
type TypedTool<I extends z.ZodObject, R extends z.ZodType> = Omit<
  ToolDefinition<I>,
  'responseSchema' | 'select'
> & {
  responseSchema: R;
  select?(response: z.output<R>, args: z.output<I>): unknown;
};

// Ties each entry's `endpoint` and `select` argument types to its own
// schemas, then widens it so entries with different schemas fit in one array.
function defineTool<I extends z.ZodObject, R extends z.ZodType>(
  definition: TypedTool<I, R>,
): ToolDefinition {
  return definition as ToolDefinition;
}

const SEARCH_RESULT_LIMIT = 25;

/**
 * Narrows TBA's search index (every team and event, about 700 KB) to the
 * entries whose key, number, nickname, or name contains `query`. Exact key
 * or team-number matches sort first; each list is capped at
 * SEARCH_RESULT_LIMIT and reports its total match count.
 */
export function searchIndex(
  index: z.output<typeof SearchIndexSchema>,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  const byExactFirst = <T>(isExact: (entry: T) => boolean) => {
    return (a: T, b: T) => Number(isExact(b)) - Number(isExact(a));
  };

  const teams = index.teams
    .filter(
      (team) =>
        team.key.toLowerCase().includes(needle) ||
        (team.nickname ?? '').toLowerCase().includes(needle),
    )
    .sort(
      byExactFirst(
        (team) =>
          team.key === needle ||
          team.key === `frc${needle}` ||
          (team.nickname ?? '').toLowerCase() === needle,
      ),
    );
  const events = index.events
    .filter(
      (event) =>
        event.key.toLowerCase().includes(needle) ||
        event.name.toLowerCase().includes(needle),
    )
    .sort(
      byExactFirst(
        (event) => event.key === needle || event.name.toLowerCase() === needle,
      ),
    );

  return {
    teams: teams.slice(0, SEARCH_RESULT_LIMIT),
    total_matching_teams: teams.length,
    events: events.slice(0, SEARCH_RESULT_LIMIT),
    total_matching_events: events.length,
  };
}

/**
 * Drops the inline base64 PNG that TBA embeds in every `avatar` media
 * record. At an event those images are most of the payload and carry nothing
 * a model can use; `direct_url` and the rest of the record are kept.
 */
export function stripAvatarImages(media: z.output<typeof MediaSchema>[]) {
  return media.map((item) => {
    if (item.type !== 'avatar' || !item.details) {
      return item;
    }
    const details = { ...item.details };
    delete details['base64Image'];
    return { ...item, details };
  });
}

export const tools: readonly ToolDefinition[] = [
  defineTool({
    name: 'get_team',
    title: 'Get FRC Team Profile',
    description:
      "Retrieve the full profile of a single FIRST Robotics Competition (FRC) team identified by team key (e.g., 'frc86'). Returns team number, nickname, full sponsor/school name, location (city, state/province, country, address, postal code, lat/lng, Google Maps place id), website, motto, rookie year, and home championship affiliation. Use for in-depth team lookups, scouting research, or generating team profile pages. For a lighter response see get_team_simple; for keys only see get_teams_keys.",
    inputSchema: GetTeamInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}`,
    responseSchema: TeamSchema,
  }),
  defineTool({
    name: 'get_team_events',
    title: 'Get Team Events for a Year',
    description:
      "List every FRC event a team registered for in a given season year. Returns full event records (name, dates, location, district affiliation, week number, webcasts, event type, division keys). Use to build a team's seasonal schedule or determine which events to scout. Lighter variants: get_team_events_simple, get_team_events_keys.",
    inputSchema: GetTeamEventsInputSchema,
    endpoint: ({ team_key, year }) => `/team/${team_key}/events/${year}`,
    responseSchema: z.array(EventSchema),
  }),
  defineTool({
    name: 'get_team_awards',
    title: 'Get Team Awards for a Year',
    description:
      "Retrieve every award won by a team during a single FRC season year. Returns award name, award type code, event key where the award was given, year, and recipient list (team key plus individual awardee for honors like Woodie Flowers Finalist). Useful for tracking annual recognition such as the Impact Award (formerly Chairman's Award), Engineering Inspiration, regional/district event winners, Excellence in Engineering, Innovation in Control, and other technical awards. For lifetime awards see get_team_awards_all.",
    inputSchema: GetTeamAwardsInputSchema,
    endpoint: ({ team_key, year }) => `/team/${team_key}/awards/${year}`,
    responseSchema: z.array(AwardSchema),
  }),
  defineTool({
    name: 'get_team_matches',
    title: 'Get Team Matches for a Year',
    description:
      'List every qualification, playoff, and finals match a team played during a given FRC season year, across all events. Returns full match records: alliance compositions (red/blue with team keys, surrogates, DQ list), final scores, game-specific score breakdown, winning alliance, video links (YouTube/TBA), and predicted vs. actual times. Lighter variants: get_team_matches_simple (omits score breakdown and videos) and get_team_matches_keys (just match keys).',
    inputSchema: GetTeamMatchesInputSchema,
    endpoint: ({ team_key, year }) => `/team/${team_key}/matches/${year}`,
    responseSchema: z.array(MatchSchema),
  }),
  defineTool({
    name: 'get_events',
    title: 'List FRC Events for a Year',
    description:
      'List every FRC event scheduled or completed for a given season year, worldwide. Returns full event records (name, event code, dates, location, district affiliation, week number, webcast channels, event type, division keys for championships, parent event key, playoff type). Use to discover regionals, district qualifying events, district championships, off-season events, and FIRST Championship divisions for a season. Lighter variants: get_events_simple, get_events_keys.',
    inputSchema: GetEventsInputSchema,
    endpoint: ({ year }) => `/events/${year}`,
    responseSchema: z.array(EventSchema),
  }),
  defineTool({
    name: 'get_event',
    title: 'Get FRC Event Details',
    description:
      "Retrieve the full record for a single FRC event by event key (e.g., '2023casj' for the 2023 Silicon Valley Regional). Returns event name, code, type (regional/district/championship), location with lat/lng and timezone, date range, district affiliation, week number, webcast channels (Twitch/YouTube), division keys (for championships), parent event key, and playoff type. For a lighter payload see get_event_simple.",
    inputSchema: GetEventInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}`,
    responseSchema: EventSchema,
  }),
  defineTool({
    name: 'get_event_teams',
    title: 'List Teams at an Event',
    description:
      'List every FRC team registered to compete at a specific event, with full team profiles (number, nickname, name, location, website, motto, rookie year). Use to enumerate the field at a regional, district event, or championship division for scouting or programmatic outreach. Lighter variants: get_event_teams_simple, get_event_teams_keys.',
    inputSchema: GetEventTeamsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/teams`,
    responseSchema: z.array(TeamSchema),
  }),
  defineTool({
    name: 'get_event_rankings',
    title: 'Get Event Qualification Rankings',
    description:
      'Retrieve the live or final qualification rankings for an FRC event. Returns ordered ranking rows (team key, rank, win/loss/tie record, matches played, qualification average, sort orders, extra stats, DQ count) plus metadata describing each sort criterion (e.g., Ranking Points, Auto, Endgame). Used to determine alliance selection order, seed playoff alliances, and assess team performance during qualification matches.',
    inputSchema: GetEventRankingsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/rankings`,
    responseSchema: RankingSchema,
  }),
  defineTool({
    name: 'get_event_matches',
    title: 'List Matches at an Event',
    description:
      'Fetch every match played at a specific FRC event, including qualification, playoff, and finals. Returns full match records with alliance compositions, final scores, game-specific score breakdown (auto/teleop/endgame components), winning alliance, video links, and timing (scheduled/predicted/actual/post-result). Lighter variants: get_event_matches_simple, get_event_matches_keys.',
    inputSchema: GetEventMatchesInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/matches`,
    responseSchema: z.array(MatchSchema),
  }),
  defineTool({
    name: 'get_event_alliances',
    title: 'Get Event Playoff Alliances',
    description:
      "Retrieve playoff alliance selections for an FRC event. Returns each alliance in seed order with captain and pick team keys, declined teams, backup robot info (in/out swap), and playoff progression status (current level, win/loss/tie record, playoff average score, final result string like 'won' or 'eliminated'). Available after alliance selection concludes; null/empty before selection.",
    inputSchema: GetEventAlliancesInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/alliances`,
    responseSchema: z.array(AllianceSchema),
  }),
  defineTool({
    name: 'get_event_insights',
    title: 'Get Event Game Insights',
    description:
      'Retrieve aggregated game-specific statistics computed by The Blue Alliance for an event, separated into qualification and playoff phases. Includes per-task averages, scoring trends, bonus (ranking point) achievement rates, and other game-specific metrics. Field structure varies per game year (e.g., Charged Up, Crescendo, Reefscape).',
    inputSchema: GetEventInsightsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/insights`,
    responseSchema: InsightsSchema,
  }),
  defineTool({
    name: 'get_event_district_points',
    title: 'Get Event District Points',
    description:
      'Retrieve district championship qualifying points awarded at an event for each participating team. Returns per-team breakdown of qualification points, alliance selection points, elimination points, and award points (the official FIRST district point system) plus tiebreaker stats (highest qual scores, qual wins). Only meaningful for district-affiliated events; non-district events return null.',
    inputSchema: GetEventDistrictPointsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/district_points`,
    responseSchema: DistrictPointsSchema,
  }),
  defineTool({
    name: 'get_team_years_participated',
    title: 'Get Team Years Participated',
    description:
      "Retrieve every season year in which a team has competed in FRC, sorted ascending. Returns a flat array of year integers. Use to bound year-based queries, drive per-year iteration, or determine a team's longevity and rookie year.",
    inputSchema: GetTeamYearsParticipatedInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/years_participated`,
    responseSchema: z.array(z.number()),
  }),
  defineTool({
    name: 'get_team_districts',
    title: 'Get Team District History',
    description:
      "List the FRC district affiliations a team has held across its history. Returns district records (abbreviation, display name, district key, year). Useful for tracking when a team participated in district play (FIRST in Michigan, New England, Chesapeake, Pacific Northwest, FIRST In Texas, etc.) versus open regional competition, and for analyzing a team's geographic competition history.",
    inputSchema: GetTeamDistrictsInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/districts`,
    responseSchema: z.array(DistrictSchema),
  }),
  defineTool({
    name: 'get_team_robots',
    title: 'Get Team Robot Names',
    description:
      "List the named robots a team has built and registered each year (e.g., 'Stronghold' for 2016, 'Citrus Circuits Quokka' patterns). Returns robot records with year, robot_name, robot key, and team key. Useful for retrospective profiles and historical references.",
    inputSchema: GetTeamRobotsInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/robots`,
    responseSchema: z.array(RobotSchema),
  }),
  defineTool({
    name: 'get_team_media',
    title: 'Get Team Media for a Year',
    description:
      "Retrieve media (photos, videos, presentations, essays) submitted for a team in a given FRC season year. Returns media records with type (e.g., 'youtube', 'imgur', 'instagram-image', 'cdphotothread'), foreign_key, view URL, direct URL, and the 'preferred' flag highlighting the team's chosen primary image. Useful for surfacing official reveal videos, robot photos, and Impact/Chairman's submissions.",
    inputSchema: GetTeamMediaInputSchema,
    endpoint: ({ team_key, year }) => `/team/${team_key}/media/${year}`,
    responseSchema: z.array(MediaSchema),
  }),
  defineTool({
    name: 'get_team_event_matches',
    title: "Get Team's Matches at an Event",
    description:
      'Fetch every match a team played at a single specific event in one call. Returns full match records (alliances, scores, score breakdowns, videos, timing). Combines team and event filters server-side, avoiding client-side filtering of get_team_matches or get_event_matches. Lighter variants: get_team_event_matches_simple, get_team_event_matches_keys.',
    inputSchema: GetTeamEventMatchesInputSchema,
    endpoint: ({ team_key, event_key }) =>
      `/team/${team_key}/event/${event_key}/matches`,
    responseSchema: z.array(MatchSchema),
  }),
  defineTool({
    name: 'get_teams',
    title: 'List All FRC Teams (Paginated)',
    description:
      "List all FRC teams ever registered, paginated in groups of 500. Returns full team profiles. Increment page_num starting at 0 until the response is empty to enumerate every team in TBA's database. For lighter payloads use get_teams_simple; for team keys only use get_teams_keys.",
    inputSchema: GetTeamsInputSchema,
    endpoint: ({ page_num }) => `/teams/${page_num}`,
    responseSchema: z.array(TeamSchema),
  }),
  defineTool({
    name: 'get_status',
    title: 'Get TBA API Status',
    description:
      'Retrieve TBA API status: current FRC season, max season available, datafeed health flag, list of currently down event keys, max team page index, and minimum/latest mobile app versions for iOS and Android. Useful for sanity-checking the API, discovering season bounds, and detecting outages before issuing other queries.',
    inputSchema: GetStatusInputSchema,
    endpoint: () => '/status',
    responseSchema: StatusSchema,
  }),
  defineTool({
    name: 'get_match',
    title: 'Get FRC Match Details',
    description:
      "Retrieve the full record for a single match by match key (e.g., '2023casj_qm1'). Returns red/blue alliance compositions (team keys, surrogates, DQ list), final scores, game-specific score breakdown (auto, teleop, endgame, fouls, ranking-point achievements), winning alliance, predicted vs. actual times, and video links. For a lighter payload see get_match_simple. For Zebra MotionWorks robot tracking telemetry see get_match_zebra.",
    inputSchema: GetMatchInputSchema,
    endpoint: ({ match_key }) => `/match/${match_key}`,
    responseSchema: MatchSchema,
  }),
  defineTool({
    name: 'get_event_oprs',
    title: 'Get Event OPR/DPR/CCWM',
    description:
      'Retrieve OPR (Offensive Power Rating), DPR (Defensive Power Rating), and CCWM (Calculated Contribution to Winning Margin) for every team at an event, returned as three team_key→number maps. Computed via least-squares regression on match scores. Standard scouting/alliance-selection metrics for estimating per-team contribution.',
    inputSchema: GetEventOprsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/oprs`,
    responseSchema: EventOPRsSchema,
  }),
  defineTool({
    name: 'get_event_awards',
    title: 'List Awards at an Event',
    description:
      "List every award given out at a specific FRC event. Returns each award's name, type code, recipient team key, awardee name (for individual honors like Woodie Flowers Finalist or Dean's List), and year. Available once awards ceremony has concluded.",
    inputSchema: GetEventAwardsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/awards`,
    responseSchema: z.array(AwardSchema),
  }),
  defineTool({
    name: 'get_team_awards_all',
    title: 'Get All Team Awards (History)',
    description:
      'Retrieve every award won by a team across its entire FRC competition history. Returns the full award list (name, year, event key, recipient list, type code). Use for lifetime award tallies, retrospectives, and Hall of Fame analysis. For a single year see get_team_awards.',
    inputSchema: GetTeamAwardsAllInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/awards`,
    responseSchema: z.array(AwardSchema),
  }),
  defineTool({
    name: 'get_team_events_all',
    title: 'Get All Team Events (History)',
    description:
      "List every FRC event a team has competed at across all years it has participated. Returns full event records. Use to map a team's complete competition history, generate timelines, or feed per-event aggregations. For a single year see get_team_events.",
    inputSchema: GetTeamEventsAllInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/events`,
    responseSchema: z.array(EventSchema),
  }),
  defineTool({
    name: 'get_team_event_status',
    title: "Get Team's Status at an Event",
    description:
      "Retrieve a team's competitive status and standings at a specific event. Returns qualification ranking row (rank, record, sort orders, qual average), alliance selection result (alliance number, pick slot, backup status), playoff progression (level, current-level record, overall record, playoff average, final status), and human-readable summary strings (overall_status_str, alliance_status_str, playoff_status_str), plus next/last match keys. Excellent for live scouting dashboards and event-day status displays.",
    inputSchema: GetTeamEventStatusInputSchema,
    endpoint: ({ team_key, event_key }) =>
      `/team/${team_key}/event/${event_key}/status`,
    responseSchema: TeamEventStatusSchema,
  }),
  defineTool({
    name: 'get_districts',
    title: 'List FRC Districts for a Year',
    description:
      "List every active FRC district for a given season year (FIRST in Michigan 'fim', New England 'ne', Chesapeake 'chs', Pacific Northwest 'pnw', FIRST In Texas 'fit', Indiana 'in', Ontario 'ont', Israel 'isr', etc.). Returns each district's abbreviation, display name, district key, and year.",
    inputSchema: GetDistrictsInputSchema,
    endpoint: ({ year }) => `/districts/${year}`,
    responseSchema: z.array(DistrictSchema),
  }),
  defineTool({
    name: 'get_district_rankings',
    title: 'Get District Team Rankings',
    description:
      "Retrieve season-end district rankings for all teams in an FRC district. Returns each team's overall rank, total district points, rookie bonus, and per-event point breakdown (qualification, alliance, elimination, award, district championship boolean). Determines which teams qualify for the district championship and the FIRST Championship via the district point system.",
    inputSchema: GetDistrictRankingsInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/rankings`,
    responseSchema: z.array(DistrictRankingSchema),
  }),
  defineTool({
    name: 'get_teams_simple',
    title: 'List All FRC Teams (Simple)',
    description:
      'Paginated listing of every registered FRC team with reduced fields (key, team_number, nickname, name, city, state_prov, country). Lighter than get_teams; use when website, motto, address, and geocoded location are not needed.',
    inputSchema: GetTeamsSimpleInputSchema,
    endpoint: ({ page_num }) => `/teams/${page_num}/simple`,
    responseSchema: z.array(TeamSimpleSchema),
  }),
  defineTool({
    name: 'get_teams_keys',
    title: 'List All FRC Team Keys',
    description:
      "Paginated listing of every registered FRC team key only (strings like 'frc86'). Lightest team enumeration option; ideal for building team-key indices or driving subsequent per-team queries with minimal payload size.",
    inputSchema: GetTeamsKeysInputSchema,
    endpoint: ({ page_num }) => `/teams/${page_num}/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_teams_by_year',
    title: 'List FRC Teams by Year',
    description:
      'List every FRC team that competed in a given season year, paginated in groups of 500. Returns full team profiles. Use to scope team enumeration to a single competition season. Lighter variants: get_teams_by_year_simple, get_teams_by_year_keys.',
    inputSchema: GetTeamsByYearInputSchema,
    endpoint: ({ year, page_num }) => `/teams/${year}/${page_num}`,
    responseSchema: z.array(TeamSchema),
  }),
  defineTool({
    name: 'get_teams_by_year_simple',
    title: 'List FRC Teams by Year (Simple)',
    description:
      'Paginated list of FRC teams that competed in a given year with reduced team fields (key, team_number, nickname, name, location). Lighter than get_teams_by_year.',
    inputSchema: GetTeamsByYearSimpleInputSchema,
    endpoint: ({ year, page_num }) => `/teams/${year}/${page_num}/simple`,
    responseSchema: z.array(TeamSimpleSchema),
  }),
  defineTool({
    name: 'get_teams_by_year_keys',
    title: 'List FRC Team Keys by Year',
    description:
      'Paginated list of team keys that competed in a given FRC season year. Lightest variant; ideal for building per-year team indices or driving downstream per-team lookups.',
    inputSchema: GetTeamsByYearKeysInputSchema,
    endpoint: ({ year, page_num }) => `/teams/${year}/${page_num}/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_team_simple',
    title: 'Get FRC Team Profile (Simple)',
    description:
      'Retrieve a reduced FRC team profile (key, team_number, nickname, name, city, state_prov, country). Lighter than get_team; use when website, motto, address, and lat/lng are not needed.',
    inputSchema: GetTeamSimpleInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/simple`,
    responseSchema: TeamSimpleSchema,
  }),
  defineTool({
    name: 'get_event_simple',
    title: 'Get FRC Event Details (Simple)',
    description:
      'Retrieve a reduced FRC event profile (key, name, event_code, type, location, dates, year). Lighter than get_event; use when district, webcast, division, and playoff metadata are not needed.',
    inputSchema: GetEventSimpleInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/simple`,
    responseSchema: EventSimpleSchema,
  }),
  defineTool({
    name: 'get_events_simple',
    title: 'List FRC Events by Year (Simple)',
    description:
      'List every FRC event for a season year with reduced event fields. Lighter than get_events.',
    inputSchema: GetEventsSimpleInputSchema,
    endpoint: ({ year }) => `/events/${year}/simple`,
    responseSchema: z.array(EventSimpleSchema),
  }),
  defineTool({
    name: 'get_events_keys',
    title: 'List FRC Event Keys by Year',
    description:
      "List every FRC event key for a season year (strings like '2024casj', '2024nyro', '2024micmp4'). Lightest events enumeration; useful for driving subsequent per-event queries with minimal bandwidth.",
    inputSchema: GetEventsKeysInputSchema,
    endpoint: ({ year }) => `/events/${year}/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_match_simple',
    title: 'Get FRC Match Details (Simple)',
    description:
      'Retrieve a single match with reduced fields (alliances, scores, winning alliance, timing). Omits game-specific score breakdown and video links. Lighter than get_match.',
    inputSchema: GetMatchSimpleInputSchema,
    endpoint: ({ match_key }) => `/match/${match_key}/simple`,
    responseSchema: MatchSimpleSchema,
  }),
  defineTool({
    name: 'get_team_events_simple',
    title: 'Get Team Events for a Year (Simple)',
    description:
      "List a team's FRC events in a season year with reduced event fields. Lighter than get_team_events.",
    inputSchema: GetTeamEventsSimpleInputSchema,
    endpoint: ({ team_key, year }) => `/team/${team_key}/events/${year}/simple`,
    responseSchema: z.array(EventSimpleSchema),
  }),
  defineTool({
    name: 'get_team_events_keys',
    title: 'Get Team Event Keys for a Year',
    description:
      "List the event keys a team registered for in a given FRC season year. Lightest variant of get_team_events; useful for driving per-event queries scoped to a team's schedule.",
    inputSchema: GetTeamEventsKeysInputSchema,
    endpoint: ({ team_key, year }) => `/team/${team_key}/events/${year}/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_team_event_awards',
    title: "Get Team's Awards at an Event",
    description:
      'Retrieve every award won by a specific team at a specific event. Returns award records (name, type, year, recipient list including team key and individual awardee names).',
    inputSchema: GetTeamEventAwardsInputSchema,
    endpoint: ({ team_key, event_key }) =>
      `/team/${team_key}/event/${event_key}/awards`,
    responseSchema: z.array(AwardSchema),
  }),
  defineTool({
    name: 'get_team_matches_simple',
    title: 'Get Team Matches for a Year (Simple)',
    description:
      'List every match a team played in a season year with reduced match fields (no game-specific score breakdown or videos). Lighter than get_team_matches.',
    inputSchema: GetTeamMatchesSimpleInputSchema,
    endpoint: ({ team_key, year }) =>
      `/team/${team_key}/matches/${year}/simple`,
    responseSchema: z.array(MatchSimpleSchema),
  }),
  defineTool({
    name: 'get_team_matches_keys',
    title: 'Get Team Match Keys for a Year',
    description:
      "List every match key a team played in a given FRC season year. Lightest variant of get_team_matches; useful for driving per-match queries scoped to a team's season.",
    inputSchema: GetTeamMatchesKeysInputSchema,
    endpoint: ({ team_key, year }) => `/team/${team_key}/matches/${year}/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_team_social_media',
    title: 'Get Team Social Media',
    description:
      "Retrieve a team's official social media handles registered with The Blue Alliance (Twitter/X, Instagram, Facebook, YouTube channel, GitHub, team website link, etc.). Returned as media records where 'type' is the platform and 'foreign_key' is the handle, slug, or URL fragment.",
    inputSchema: GetTeamSocialMediaInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/social_media`,
    responseSchema: z.array(MediaSchema),
  }),
  defineTool({
    name: 'get_team_media_by_tag',
    title: 'Get Team Media by Tag',
    description:
      "Retrieve a team's media filtered by a specific TBA tag (e.g., 'chairmans_video', 'chairmans_essay', 'chairmans_presentation', 'imagery') across all years. Useful for surfacing Impact/Chairman's Award submissions or pinned imagery.",
    inputSchema: GetTeamMediaByTagInputSchema,
    endpoint: ({ team_key, media_tag }) =>
      `/team/${team_key}/media/tag/${media_tag}`,
    responseSchema: z.array(MediaSchema),
  }),
  defineTool({
    name: 'get_team_media_by_tag_year',
    title: 'Get Team Media by Tag and Year',
    description:
      "Retrieve a team's media filtered by both tag and season year. Use to fetch a single year's Impact/Chairman's submission package or other tagged media.",
    inputSchema: GetTeamMediaByTagYearInputSchema,
    endpoint: ({ team_key, media_tag, year }) =>
      `/team/${team_key}/media/tag/${media_tag}/${year}`,
    responseSchema: z.array(MediaSchema),
  }),
  defineTool({
    name: 'get_event_teams_simple',
    title: 'List Teams at an Event (Simple)',
    description:
      'List teams competing at an event with reduced team fields (key, team_number, nickname, name, location). Lighter than get_event_teams.',
    inputSchema: GetEventTeamsSimpleInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/teams/simple`,
    responseSchema: z.array(TeamSimpleSchema),
  }),
  defineTool({
    name: 'get_event_teams_keys',
    title: 'List Team Keys at an Event',
    description:
      "List team keys competing at an event (strings like 'frc86'). Lightest enumeration of an event's competing teams; ideal for driving downstream per-team lookups.",
    inputSchema: GetEventTeamsKeysInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/teams/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_event_matches_simple',
    title: 'List Matches at an Event (Simple)',
    description:
      'List matches at an event with reduced match fields (no game-specific score breakdown or videos). Lighter than get_event_matches.',
    inputSchema: GetEventMatchesSimpleInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/matches/simple`,
    responseSchema: z.array(MatchSimpleSchema),
  }),
  defineTool({
    name: 'get_event_matches_keys',
    title: 'List Match Keys at an Event',
    description:
      "List match keys at an event (strings like '2023casj_qm1', '2023casj_sf1m1'). Lightest enumeration of an event's matches.",
    inputSchema: GetEventMatchesKeysInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/matches/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_event_predictions',
    title: 'Get Event Predictions',
    description:
      'Retrieve TBA-generated match score predictions and end-of-event ranking predictions for an event when computed. Returns predicted red/blue scores keyed by match key plus predicted final ranks keyed by team key. Availability and field structure vary by event and game year; some events return null or partial data.',
    inputSchema: GetEventPredictionsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/predictions`,
    responseSchema: PredictionSchema,
  }),
  defineTool({
    name: 'get_match_zebra',
    title: 'Get Zebra MotionWorks Match Tracking',
    description:
      'Retrieve Zebra MotionWorks robot-tracking telemetry for a match: per-timestep XY field positions for every robot on red and blue alliances, plus the timestamp series. Only available for events with Zebra tracking installed (typically FIRST Championship divisions and a subset of regionals/district championships); returns null when the match has no tracking data. Useful for advanced scouting, defense analysis, and trajectory visualization.',
    inputSchema: GetMatchZebraInputSchema,
    endpoint: ({ match_key }) => `/match/${match_key}/zebra_motionworks`,
    responseSchema: ZebraSchema,
  }),
  defineTool({
    name: 'get_team_history',
    title: 'Get Full Team History',
    description:
      "Retrieve a team's full FRC competition history aggregated into a single response: every event, every match, every award, and every robot. High-payload call — use sparingly when a complete archive is needed (e.g., generating a team retrospective). For narrower queries prefer get_team_events_all, get_team_awards_all, or year-scoped variants.",
    inputSchema: GetTeamHistoryInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/history`,
    responseSchema: TeamHistorySchema,
  }),
  defineTool({
    name: 'get_team_event_statuses',
    title: 'Get Team Statuses Across All Year Events',
    description:
      "Retrieve a team's per-event status for every event the team attended in a given year, returned as an object keyed by event_key. Each entry mirrors get_team_event_status (rank, alliance, playoff progression, summary strings, next/last match key). Use to render a season status dashboard in one call.",
    inputSchema: GetTeamEventStatusesInputSchema,
    endpoint: ({ team_key, year }) =>
      `/team/${team_key}/events/${year}/statuses`,
    responseSchema: z.record(z.string(), TeamEventStatusSchema),
  }),
  defineTool({
    name: 'get_team_event_matches_simple',
    title: "Get Team's Matches at an Event (Simple)",
    description:
      'Lighter variant of get_team_event_matches: every match a team played at a single event with reduced match fields (no game-specific score breakdown or videos).',
    inputSchema: GetTeamEventMatchesSimpleInputSchema,
    endpoint: ({ team_key, event_key }) =>
      `/team/${team_key}/event/${event_key}/matches/simple`,
    responseSchema: z.array(MatchSimpleSchema),
  }),
  defineTool({
    name: 'get_team_event_matches_keys',
    title: "Get Team's Match Keys at an Event",
    description:
      'Lightest variant returning only match keys for a team at a specific event. Ideal for driving downstream per-match queries.',
    inputSchema: GetTeamEventMatchesKeysInputSchema,
    endpoint: ({ team_key, event_key }) =>
      `/team/${team_key}/event/${event_key}/matches/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_district_events',
    title: 'List Events in a District',
    description:
      'List every FRC event in a district (e.g., all 2024 FIRST in Michigan district qualifying events plus the district championship). Returns full event records. Lighter variants: get_district_events_simple, get_district_events_keys.',
    inputSchema: GetDistrictEventsInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/events`,
    responseSchema: z.array(EventSchema),
  }),
  defineTool({
    name: 'get_district_events_simple',
    title: 'List Events in a District (Simple)',
    description:
      'List events in an FRC district with reduced event fields. Lighter than get_district_events.',
    inputSchema: GetDistrictEventsSimpleInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/events/simple`,
    responseSchema: z.array(EventSimpleSchema),
  }),
  defineTool({
    name: 'get_district_events_keys',
    title: 'List Event Keys in a District',
    description:
      'List event keys in an FRC district. Lightest enumeration of district events; ideal for driving per-event lookups across a district season.',
    inputSchema: GetDistrictEventsKeysInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/events/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_district_teams',
    title: 'List Teams in a District',
    description:
      "List every team affiliated with an FRC district in a given year. Returns full team profiles. Use to enumerate a district's competitive field. Lighter variants: get_district_teams_simple, get_district_teams_keys.",
    inputSchema: GetDistrictTeamsInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/teams`,
    responseSchema: z.array(TeamSchema),
  }),
  defineTool({
    name: 'get_district_teams_simple',
    title: 'List Teams in a District (Simple)',
    description:
      'List teams in an FRC district with reduced team fields. Lighter than get_district_teams.',
    inputSchema: GetDistrictTeamsSimpleInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/teams/simple`,
    responseSchema: z.array(TeamSimpleSchema),
  }),
  defineTool({
    name: 'get_district_teams_keys',
    title: 'List Team Keys in a District',
    description:
      "List team keys in an FRC district. Lightest enumeration of a district's teams; ideal for driving per-team lookups.",
    inputSchema: GetDistrictTeamsKeysInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/teams/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_district_history',
    title: 'Get District History',
    description:
      "List every season of an FRC district by abbreviation, following renames (e.g., 'mar' to 'fma'). Returns one district record per year (key, abbreviation, display name, year) with the official number of teams that advance to the district championship and to the FIRST Championship. Use to find a district's key for a past season or to see how its advancement slots changed over time.",
    inputSchema: GetDistrictHistoryInputSchema,
    endpoint: ({ district_abbreviation }) =>
      `/district/${district_abbreviation}/history`,
    responseSchema: z.array(DistrictSchema),
  }),
  defineTool({
    name: 'get_district_dcmp_history',
    title: 'Get District Championship History',
    description:
      "List every district championship event a district has held, across all seasons, each paired with the awards given there. Returns full event records (including championship divisions) plus award records (name, type, recipient team keys and awardees). Use for district championship winners, Impact/Engineering Inspiration history, and long-run district retrospectives. Large for long-running districts (about 300 KB for 'fim').",
    inputSchema: GetDistrictDcmpHistoryInputSchema,
    endpoint: ({ district_abbreviation }) =>
      `/district/${district_abbreviation}/dcmp_history`,
    responseSchema: z.array(DistrictDcmpHistorySchema),
  }),
  defineTool({
    name: 'get_district_insights',
    title: 'Get District Insights',
    description:
      "Retrieve all-time statistics for a district by abbreviation. Returns district_data (active team counts, event counts, and teams gained and lost per year, district-wide and per region) and team_data keyed by team key (district seasons, total district points, event and DCMP wins, blue banners, awards, qualification and playoff records, DCMP and Championship appearances). Very large for big districts (about 600 KB for 'fim', 65 KB for 'isr'); for one season's standings prefer get_district_rankings, and for season leaderboards get_insights_for_district_by_category.",
    inputSchema: GetDistrictInsightsInputSchema,
    endpoint: ({ district_abbreviation }) =>
      `/district/${district_abbreviation}/insights`,
    responseSchema: DistrictInsightSchema,
  }),
  defineTool({
    name: 'get_district_advancement',
    title: 'Get District Advancement',
    description:
      "Retrieve which teams in a district season advanced to the district championship and to the FIRST Championship. Returns teams keyed by team key (dcmp and cmp booleans plus how the team earned its Championship invite, e.g. 'district_points', 'dcmp_winner', 'dcmp_impact') and the cutoffs (original and effective rank cutoffs for DCMP and CMP, teams that declined, and per-team Championship qualification method). Fields are null until TBA has computed advancement for the season.",
    inputSchema: GetDistrictAdvancementInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/advancement`,
    responseSchema: DistrictAdvancementSchema,
  }),
  defineTool({
    name: 'get_district_awards',
    title: 'List Awards in a District',
    description:
      'List every award given at every event in a district season, including the district championship. Returns award records (name, type code, event key, year, recipient team keys and individual awardees). Use to tally district-wide award winners in one call instead of calling get_event_awards per event.',
    inputSchema: GetDistrictAwardsInputSchema,
    endpoint: ({ district_key }) => `/district/${district_key}/awards`,
    responseSchema: z.array(AwardSchema),
  }),
  defineTool({
    name: 'get_event_advancement_points',
    title: 'Get Event Advancement Points',
    description:
      'Retrieve the advancement points each team earned at an event, using whichever system the event belongs to: district points for district events, or FIRST Championship regional pool points for 2025+ regionals. Returns per-team qualification, alliance selection, elimination, award, and (for regionals) rookie bonus points with totals, plus tiebreakers (highest match scores, qualification wins). Returns null for events that award neither, such as off-season events.',
    inputSchema: GetEventAdvancementPointsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/advancement_points`,
    responseSchema: DistrictPointsSchema.nullable(),
  }),
  defineTool({
    name: 'get_event_coprs',
    title: 'Get Event Component OPRs',
    description:
      "Retrieve component OPRs (COPRs) for every team at an event: per-team estimates of how much a team adds to each individual scoring component, not just total score. Returns an object keyed by component name, each a team_key→number map. Component names come from that season's score breakdown and change every year (2025 examples: 'L1 Coral Count', 'autoPoints', 'endGameBargePoints', 'foulCount'), so read the keys rather than assuming them. Computed with the same least-squares regression as OPR (see get_event_oprs) and carries the same caveats: a handful of qualification matches per team makes estimates noisy, partner and schedule effects leak in, and values can be negative or fractional even for whole-number counts. Treat them as rough signals for scouting and alliance selection, not measurements. Returns null or an empty object before qualification matches are played.",
    inputSchema: GetEventCoprsInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/coprs`,
    responseSchema: EventCOPRsSchema.nullable(),
  }),
  defineTool({
    name: 'get_event_practice_matches',
    title: 'List Practice Matches at an Event',
    description:
      'Fetch the practice matches played at an FRC event, which get_event_matches does not include. Returns full match records (alliances, scores, score breakdown, timing). Practice results do not count toward rankings, and many events do not report them. Lighter variants: get_event_practice_matches_simple, get_event_practice_matches_keys.',
    inputSchema: GetEventPracticeMatchesInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/matches/practice`,
    responseSchema: z.array(MatchSchema),
  }),
  defineTool({
    name: 'get_event_practice_matches_simple',
    title: 'List Practice Matches at an Event (Simple)',
    description:
      'List practice matches at an event with reduced match fields (no game-specific score breakdown or videos). Lighter than get_event_practice_matches.',
    inputSchema: GetEventPracticeMatchesSimpleInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/matches/practice/simple`,
    responseSchema: z.array(MatchSimpleSchema),
  }),
  defineTool({
    name: 'get_event_practice_matches_keys',
    title: 'List Practice Match Keys at an Event',
    description:
      "List practice match keys at an event (strings like '2025casj_pm1'). Lightest enumeration of an event's practice matches.",
    inputSchema: GetEventPracticeMatchesKeysInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/matches/practice/keys`,
    responseSchema: z.array(z.string()),
  }),
  defineTool({
    name: 'get_event_media',
    title: 'Get Event Media',
    description:
      "Retrieve media attached to the event itself rather than to its teams, such as event YouTube videos and photo galleries. Returns media records with type, foreign_key, view URL, and direct URL. For media belonging to the event's teams see get_event_team_media.",
    inputSchema: GetEventMediaInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/media`,
    responseSchema: z.array(MediaSchema),
  }),
  defineTool({
    name: 'get_event_nexus_info',
    title: 'Get Event Nexus Queuing and Pit Map',
    description:
      'Retrieve live match-queuing info and the pit map for an event from Nexus (frc.nexus), as cached by TBA. Returns the match now queuing, per-match queue status (Queuing soon, Now queuing, On deck, On field) with estimated queue and start times, and the pit map (pit positions with assigned team keys, areas, labels, walls). Queuing data only exists while an event is running; returns null when neither queuing info nor a pit map is available.',
    inputSchema: GetEventNexusInfoInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/nexus_info`,
    responseSchema: NexusEventInfoSchema.nullable(),
  }),
  defineTool({
    name: 'get_event_playoff_advancement',
    title: 'Get Event Playoff Advancement',
    description:
      'Retrieve how alliances advanced through each playoff level at an event. Returns one entry per level (e.g., double-elimination rounds, round robin semifinals, finals) with the level type, ranked alliances (team keys, alliance name and color, record, matches played, sort orders, extra stats), and metadata describing each sort order and extra stat. Returns an empty list for events without computed playoff advancement.',
    inputSchema: GetEventPlayoffAdvancementInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/playoff_advancement`,
    responseSchema: z.array(PlayoffAdvancementSchema),
  }),
  defineTool({
    name: 'get_event_regional_champs_pool_points',
    title: 'Get Event Regional Pool Points',
    description:
      'Retrieve FIRST Championship regional pool points earned at a 2025+ regional event. Returns per-team qualification, alliance selection, elimination, award, and rookie bonus points with totals, plus tiebreakers. Returns null for district events and pre-2025 events; for those use get_event_district_points or get_event_advancement_points. For season-long standings see get_regional_rankings.',
    inputSchema: GetEventRegionalChampsPoolPointsInputSchema,
    endpoint: ({ event_key }) =>
      `/event/${event_key}/regional_champs_pool_points`,
    responseSchema: DistrictPointsSchema.nullable(),
  }),
  defineTool({
    name: 'get_event_team_media',
    title: 'Get Media for Teams at an Event',
    description:
      "Retrieve that season's media for every team at an event in one call: robot photos (imgur), reveal videos (YouTube), CAD (Onshape, GrabCAD), Chief Delphi threads, and avatars. Each record lists the team_keys it belongs to. Avatar records keep only their metadata; the embedded base64 image is removed to keep the payload small (use get_team_media for a single team's avatar). For media about the event itself see get_event_media.",
    inputSchema: GetEventTeamMediaInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/team_media`,
    responseSchema: z.array(MediaSchema),
    select: (media) => stripAvatarImages(media),
  }),
  defineTool({
    name: 'get_event_teams_statuses',
    title: 'Get Statuses of All Teams at an Event',
    description:
      "Retrieve every team's status at an event in one call, returned as an object keyed by team key. Each entry mirrors get_team_event_status (qualification rank and record, alliance and pick, playoff progression, pit location, summary strings, next/last match key) or is null for a team without status. Use for event-wide dashboards instead of calling get_team_event_status per team.",
    inputSchema: GetEventTeamsStatusesInputSchema,
    endpoint: ({ event_key }) => `/event/${event_key}/teams/statuses`,
    responseSchema: z.record(z.string(), TeamEventStatusSchema.nullable()),
  }),
  defineTool({
    name: 'get_insights_leaderboards',
    title: 'Get Season Leaderboards',
    description:
      'Retrieve TBA leaderboard insights for a season, or all-time with year 0. Each leaderboard (e.g., most matches played, most blue banners, highest median score) ranks team, event, or match keys by a value. Returns name, year, key type, and ranked value/keys pairs. Large (about 200 KB for a recent season). For the newer typed insights see get_insights_by_category with category leaderboard.',
    inputSchema: GetInsightsLeaderboardsInputSchema,
    endpoint: ({ year }) => `/insights/leaderboards/${year}`,
    responseSchema: z.array(LeaderboardInsightSchema),
  }),
  defineTool({
    name: 'get_insights_notables',
    title: 'Get Season Notables',
    description:
      'Retrieve TBA notables insights for a season, or all-time with year 0: lists of teams with notable achievements such as Hall of Fame membership, Championship wins, division wins, and Impact Award finals. Each entry gives a team key and the event keys where it earned the notable.',
    inputSchema: GetInsightsNotablesInputSchema,
    endpoint: ({ year }) => `/insights/notables/${year}`,
    responseSchema: z.array(NotablesInsightSchema),
  }),
  defineTool({
    name: 'get_insights',
    title: 'Get Season Insights (All Categories)',
    description:
      'Retrieve every global (non-district) TBA insight for a season, or all-time with year 0, across all categories: leaderboard, streak, timeseries, game_stats, and clubs. Each insight has name, display_name, year, category, and a category-specific data object. Very large (about 1 MB for a recent season, most of it game_stats), so prefer get_insights_by_category with the category you need.',
    inputSchema: GetInsightsInputSchema,
    endpoint: ({ year }) => `/insights/${year}`,
    responseSchema: z.array(InsightV2Schema),
  }),
  defineTool({
    name: 'get_insights_by_category',
    title: 'Get Season Insights by Category',
    description:
      'Retrieve global TBA insights for a season (or all-time with year 0) in one category. leaderboard ranks teams, events, or matches by a value; streak lists consecutive achievements; timeseries gives values over weeks or years; game_stats gives per-season, per-week, and per-event game statistics (very large, about 650 KB for 2025); clubs lists teams that reached all-time milestones. Each insight has name, display_name, year, category, and a category-specific data object. For a recent season the leaderboard category is about 300 KB; streak, timeseries, and clubs are small.',
    inputSchema: GetInsightsByCategoryInputSchema,
    endpoint: ({ year, category }) => `/insights/${year}/${category}`,
    responseSchema: z.array(InsightV2Schema),
  }),
  defineTool({
    name: 'get_insights_for_district',
    title: 'Get District Insights for a Season',
    description:
      'Retrieve TBA insights scoped to one district for a season, or all-time with year 0, across all categories (leaderboard, streak, timeseries, game_stats, clubs). Same shape as get_insights; about 250 KB for a large district such as fim, mostly leaderboards. To narrow to one category use get_insights_for_district_by_category; for all-time district team and growth statistics see get_district_insights.',
    inputSchema: GetInsightsForDistrictInputSchema,
    endpoint: ({ year, district_abbreviation }) =>
      `/insights/${year}/district/${district_abbreviation}`,
    responseSchema: z.array(InsightV2Schema),
  }),
  defineTool({
    name: 'get_insights_for_district_by_category',
    title: 'Get District Insights for a Season by Category',
    description:
      'Retrieve TBA insights scoped to one district for a season (or all-time with year 0) in a single category: leaderboard, streak, timeseries, game_stats, or clubs. Same shape as get_insights_by_category. Returns an empty list when the district has no insights in that category.',
    inputSchema: GetInsightsForDistrictByCategoryInputSchema,
    endpoint: ({ year, category, district_abbreviation }) =>
      `/insights/${year}/${category}/district/${district_abbreviation}`,
    responseSchema: z.array(InsightV2Schema),
  }),
  defineTool({
    name: 'get_regional_advancement',
    title: 'Get Regional Championship Advancement',
    description:
      'Retrieve FIRST Championship advancement for regional (non-district) teams in a season, keyed by team key. Each entry says whether the team qualified, its status (NotInvited, PreQualified, EventQualified, PoolQualified, Declined), and how: qualifying event key and award name, or the regional pool week of its invitation. Only available for 2025 and later; earlier years return an error.',
    inputSchema: GetRegionalAdvancementInputSchema,
    endpoint: ({ year }) => `/regional_advancement/${year}`,
    responseSchema: RegionalAdvancementSchema,
  }),
  defineTool({
    name: 'get_regional_rankings',
    title: 'Get Regional Pool Rankings',
    description:
      'Retrieve the season-long FIRST Championship regional pool rankings (2025 and later). Returns every regional team ranked by pool points, with point total, rookie bonus, single-event bonus, adjustments, and per-event point breakdown. Very large (about 900 KB, one entry per regional team); for one event use get_event_regional_champs_pool_points, and for qualification outcomes use get_regional_advancement.',
    inputSchema: GetRegionalRankingsInputSchema,
    endpoint: ({ year }) => `/regional_advancement/${year}/rankings`,
    responseSchema: z.array(RegionalRankingSchema).nullable(),
  }),
  defineTool({
    name: 'get_search_index',
    title: 'Search Teams and Events',
    description:
      "Find FRC teams and events by name when you do not know their keys (e.g., 'Cheesy Poofs' for frc254, 'Silicon Valley' for 2025casj). Searches TBA's index of every team (key, nickname) and event (key, name) with a case-insensitive substring match and returns at most 25 teams and 25 events, exact matches first, plus the total number of matches. The full index is about 700 KB, so this tool always filters it; refine the query when the totals exceed 25.",
    inputSchema: GetSearchIndexInputSchema,
    endpoint: () => '/search_index',
    responseSchema: SearchIndexSchema,
    select: (index, { query }) => searchIndex(index, query),
  }),
  defineTool({
    name: 'get_sponsors',
    title: 'Get TBA Sponsors',
    description:
      "Retrieve The Blue Alliance's current platinum sponsors in display order (0 to 3 entries), with name, link URL, logo style, and light and dark logo URLs. Useful when crediting TBA's sponsors alongside TBA data.",
    inputSchema: GetSponsorsInputSchema,
    endpoint: () => '/sponsors',
    responseSchema: SponsorsSchema,
  }),
  defineTool({
    name: 'get_team_events_all_simple',
    title: 'Get All Team Events (History, Simple)',
    description:
      'List every FRC event a team has competed at across all years with reduced event fields (key, name, event code, type, location, dates, year). Lighter than get_team_events_all; for a single year see get_team_events_simple.',
    inputSchema: GetTeamEventsAllSimpleInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/events/simple`,
    responseSchema: z.array(EventSimpleSchema),
  }),
  defineTool({
    name: 'get_team_events_all_keys',
    title: 'Get All Team Event Keys (History)',
    description:
      "List the key of every FRC event a team has competed at across all years. Lightest variant of get_team_events_all; useful for driving per-event queries over a team's whole history.",
    inputSchema: GetTeamEventsAllKeysInputSchema,
    endpoint: ({ team_key }) => `/team/${team_key}/events/keys`,
    responseSchema: z.array(z.string()),
  }),
];
