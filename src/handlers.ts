import { z } from 'zod';
import { makeApiRequest } from './utils.js';
import {
  TeamKeySchema,
  YearSchema,
  EventKeySchema,
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
  TeamHistorySchema,
} from './schemas.js';

export async function handleToolCall(
  name: string,
  args: unknown,
): Promise<{
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}> {
  switch (name) {
    case 'get_team': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}`);
      const team = TeamSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(team, null, 2),
          },
        ],
      };
    }

    case 'get_team_events': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(`/team/${team_key}/events/${year}`);
      const events = z.array(EventSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(events, null, 2),
          },
        ],
      };
    }

    case 'get_team_awards': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(`/team/${team_key}/awards/${year}`);
      const awards = z.array(AwardSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(awards, null, 2),
          },
        ],
      };
    }

    case 'get_team_matches': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(`/team/${team_key}/matches/${year}`);
      const matches = z.array(MatchSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    }

    case 'get_events': {
      const { year } = z.object({ year: YearSchema }).parse(args);
      const data = await makeApiRequest(`/events/${year}`);
      const events = z.array(EventSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(events, null, 2),
          },
        ],
      };
    }

    case 'get_event': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}`);
      const event = EventSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(event, null, 2),
          },
        ],
      };
    }

    case 'get_event_teams': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/teams`);
      const teams = z.array(TeamSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_event_rankings': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/rankings`);
      const rankings = RankingSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rankings, null, 2),
          },
        ],
      };
    }

    case 'get_event_matches': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/matches`);
      const matches = z.array(MatchSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    }

    case 'get_event_alliances': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/alliances`);
      const alliances = z.array(AllianceSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(alliances, null, 2),
          },
        ],
      };
    }

    case 'get_event_insights': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/insights`);
      const insights = InsightsSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(insights, null, 2),
          },
        ],
      };
    }

    case 'get_event_district_points': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/district_points`);
      const districtPoints = DistrictPointsSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(districtPoints, null, 2),
          },
        ],
      };
    }

    case 'get_team_years_participated': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/years_participated`);
      const years = z.array(z.number()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(years, null, 2),
          },
        ],
      };
    }

    case 'get_team_districts': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/districts`);
      const districts = z.array(DistrictSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(districts, null, 2),
          },
        ],
      };
    }

    case 'get_team_robots': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/robots`);
      const robots = z.array(RobotSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(robots, null, 2),
          },
        ],
      };
    }

    case 'get_team_media': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(`/team/${team_key}/media/${year}`);
      const media = z.array(MediaSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(media, null, 2),
          },
        ],
      };
    }

    case 'get_team_event_matches': {
      const { team_key, event_key } = z
        .object({
          team_key: TeamKeySchema,
          event_key: EventKeySchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/event/${event_key}/matches`,
      );
      const matches = z.array(MatchSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    }

    case 'get_teams': {
      const { page_num } = z
        .object({ page_num: z.number().min(0) })
        .parse(args);
      const data = await makeApiRequest(`/teams/${page_num}`);
      const teams = z.array(TeamSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_status': {
      const data = await makeApiRequest('/status');
      const status = StatusSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(status, null, 2),
          },
        ],
      };
    }

    case 'get_match': {
      const { match_key } = z.object({ match_key: z.string() }).parse(args);
      const data = await makeApiRequest(`/match/${match_key}`);
      const match = MatchSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(match, null, 2),
          },
        ],
      };
    }

    case 'get_event_oprs': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/oprs`);
      const oprs = EventOPRsSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(oprs, null, 2),
          },
        ],
      };
    }

    case 'get_event_awards': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/awards`);
      const awards = z.array(AwardSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(awards, null, 2),
          },
        ],
      };
    }

    case 'get_team_awards_all': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/awards`);
      const awards = z.array(AwardSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(awards, null, 2),
          },
        ],
      };
    }

    case 'get_team_events_all': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/events`);
      const events = z.array(EventSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(events, null, 2),
          },
        ],
      };
    }

    case 'get_team_event_status': {
      const { team_key, event_key } = z
        .object({
          team_key: TeamKeySchema,
          event_key: EventKeySchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/event/${event_key}/status`,
      );
      const status = TeamEventStatusSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(status, null, 2),
          },
        ],
      };
    }

    case 'get_districts': {
      const { year } = z.object({ year: YearSchema }).parse(args);
      const data = await makeApiRequest(`/districts/${year}`);
      const districts = z.array(DistrictSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(districts, null, 2),
          },
        ],
      };
    }

    case 'get_district_rankings': {
      const { district_key } = z
        .object({ district_key: z.string() })
        .parse(args);
      const data = await makeApiRequest(`/district/${district_key}/rankings`);
      const rankings = z.array(DistrictRankingSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rankings, null, 2),
          },
        ],
      };
    }

    case 'get_teams_simple': {
      const { page_num } = z
        .object({ page_num: z.number().min(0) })
        .parse(args);
      const data = await makeApiRequest(`/teams/${page_num}/simple`);
      const teams = z.array(TeamSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_teams_keys': {
      const { page_num } = z
        .object({ page_num: z.number().min(0) })
        .parse(args);
      const data = await makeApiRequest(`/teams/${page_num}/keys`);
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_teams_by_year': {
      const { year, page_num } = z
        .object({
          year: YearSchema,
          page_num: z.number().min(0),
        })
        .parse(args);
      const data = await makeApiRequest(`/teams/${year}/${page_num}`);
      const teams = z.array(TeamSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_teams_by_year_simple': {
      const { year, page_num } = z
        .object({
          year: YearSchema,
          page_num: z.number().min(0),
        })
        .parse(args);
      const data = await makeApiRequest(`/teams/${year}/${page_num}/simple`);
      const teams = z.array(TeamSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_teams_by_year_keys': {
      const { year, page_num } = z
        .object({
          year: YearSchema,
          page_num: z.number().min(0),
        })
        .parse(args);
      const data = await makeApiRequest(`/teams/${year}/${page_num}/keys`);
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_team_simple': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/simple`);
      const team = TeamSimpleSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(team, null, 2),
          },
        ],
      };
    }

    case 'get_event_simple': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/simple`);
      const event = EventSimpleSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(event, null, 2),
          },
        ],
      };
    }

    case 'get_events_simple': {
      const { year } = z.object({ year: YearSchema }).parse(args);
      const data = await makeApiRequest(`/events/${year}/simple`);
      const events = z.array(EventSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(events, null, 2),
          },
        ],
      };
    }

    case 'get_events_keys': {
      const { year } = z.object({ year: YearSchema }).parse(args);
      const data = await makeApiRequest(`/events/${year}/keys`);
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_match_simple': {
      const { match_key } = z.object({ match_key: z.string() }).parse(args);
      const data = await makeApiRequest(`/match/${match_key}/simple`);
      const match = MatchSimpleSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(match, null, 2),
          },
        ],
      };
    }

    case 'get_team_events_simple': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/events/${year}/simple`,
      );
      const events = z.array(EventSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(events, null, 2),
          },
        ],
      };
    }

    case 'get_team_events_keys': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/events/${year}/keys`,
      );
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_team_event_awards': {
      const { team_key, event_key } = z
        .object({
          team_key: TeamKeySchema,
          event_key: EventKeySchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/event/${event_key}/awards`,
      );
      const awards = z.array(AwardSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(awards, null, 2),
          },
        ],
      };
    }

    case 'get_team_matches_simple': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/matches/${year}/simple`,
      );
      const matches = z.array(MatchSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    }

    case 'get_team_matches_keys': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/matches/${year}/keys`,
      );
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_team_social_media': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/social_media`);
      const media = z.array(MediaSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(media, null, 2),
          },
        ],
      };
    }

    case 'get_team_media_by_tag': {
      const { team_key, media_tag } = z
        .object({
          team_key: TeamKeySchema,
          media_tag: z.string(),
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/media/tag/${media_tag}`,
      );
      const media = z.array(MediaSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(media, null, 2),
          },
        ],
      };
    }

    case 'get_team_media_by_tag_year': {
      const { team_key, media_tag, year } = z
        .object({
          team_key: TeamKeySchema,
          media_tag: z.string(),
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/media/tag/${media_tag}/${year}`,
      );
      const media = z.array(MediaSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(media, null, 2),
          },
        ],
      };
    }

    case 'get_event_teams_simple': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/teams/simple`);
      const teams = z.array(TeamSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_event_teams_keys': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/teams/keys`);
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_event_matches_simple': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/matches/simple`);
      const matches = z.array(MatchSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    }

    case 'get_event_matches_keys': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/matches/keys`);
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_team_history': {
      const { team_key } = z.object({ team_key: TeamKeySchema }).parse(args);
      const data = await makeApiRequest(`/team/${team_key}/history`);
      const history = TeamHistorySchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(history, null, 2),
          },
        ],
      };
    }

    case 'get_team_event_statuses': {
      const { team_key, year } = z
        .object({
          team_key: TeamKeySchema,
          year: YearSchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/events/${year}/statuses`,
      );
      const statuses = z.record(z.string(), TeamEventStatusSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(statuses, null, 2),
          },
        ],
      };
    }

    case 'get_team_event_matches_simple': {
      const { team_key, event_key } = z
        .object({
          team_key: TeamKeySchema,
          event_key: EventKeySchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/event/${event_key}/matches/simple`,
      );
      const matches = z.array(MatchSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(matches, null, 2),
          },
        ],
      };
    }

    case 'get_team_event_matches_keys': {
      const { team_key, event_key } = z
        .object({
          team_key: TeamKeySchema,
          event_key: EventKeySchema,
        })
        .parse(args);
      const data = await makeApiRequest(
        `/team/${team_key}/event/${event_key}/matches/keys`,
      );
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_district_events': {
      const { district_key } = z
        .object({ district_key: z.string() })
        .parse(args);
      const data = await makeApiRequest(`/district/${district_key}/events`);
      const events = z.array(EventSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(events, null, 2),
          },
        ],
      };
    }

    case 'get_district_events_simple': {
      const { district_key } = z
        .object({ district_key: z.string() })
        .parse(args);
      const data = await makeApiRequest(
        `/district/${district_key}/events/simple`,
      );
      const events = z.array(EventSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(events, null, 2),
          },
        ],
      };
    }

    case 'get_district_events_keys': {
      const { district_key } = z
        .object({ district_key: z.string() })
        .parse(args);
      const data = await makeApiRequest(
        `/district/${district_key}/events/keys`,
      );
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_district_teams': {
      const { district_key } = z
        .object({ district_key: z.string() })
        .parse(args);
      const data = await makeApiRequest(`/district/${district_key}/teams`);
      const teams = z.array(TeamSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_district_teams_simple': {
      const { district_key } = z
        .object({ district_key: z.string() })
        .parse(args);
      const data = await makeApiRequest(
        `/district/${district_key}/teams/simple`,
      );
      const teams = z.array(TeamSimpleSchema).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(teams, null, 2),
          },
        ],
      };
    }

    case 'get_district_teams_keys': {
      const { district_key } = z
        .object({ district_key: z.string() })
        .parse(args);
      const data = await makeApiRequest(`/district/${district_key}/teams/keys`);
      const keys = z.array(z.string()).parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(keys, null, 2),
          },
        ],
      };
    }

    case 'get_match_zebra': {
      const { match_key } = z.object({ match_key: z.string() }).parse(args);
      const data = await makeApiRequest(`/match/${match_key}/zebra`);
      const zebra = ZebraSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(zebra, null, 2),
          },
        ],
      };
    }

    case 'get_event_predictions': {
      const { event_key } = z.object({ event_key: EventKeySchema }).parse(args);
      const data = await makeApiRequest(`/event/${event_key}/predictions`);
      const predictions = PredictionSchema.parse(data);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(predictions, null, 2),
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
