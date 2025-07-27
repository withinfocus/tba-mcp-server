#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

export const TeamKeySchema = z.string().regex(/^frc\d+$/, 'Team key must be in format frcXXXX');
export const EventKeySchema = z.string();
export const YearSchema = z.number().int().min(1992).max(new Date().getFullYear() + 1);

export const TeamSchema = z.object({
  key: z.string(),
  team_number: z.number(),
  nickname: z.string().nullish(),
  name: z.string(),
  city: z.string().nullish(),
  state_prov: z.string().nullish(),
  country: z.string().nullish(),
  address: z.string().nullish(),
  postal_code: z.string().nullish(),
  gmaps_place_id: z.string().nullish(),
  gmaps_url: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  location_name: z.string().nullish(),
  website: z.string().nullish(),
  rookie_year: z.number().nullish(),
  motto: z.string().nullish(),
  home_championship: z.record(z.string(), z.any()).nullish(),
});

export const EventSchema = z.object({
  key: z.string(),
  name: z.string(),
  event_code: z.string(),
  event_type: z.number(),
  district: z.object({
    abbreviation: z.string(),
    display_name: z.string(),
    key: z.string(),
    year: z.number(),
  }).nullish(),
  city: z.string().nullish(),
  state_prov: z.string().nullish(),
  country: z.string().nullish(),
  start_date: z.string(),
  end_date: z.string(),
  year: z.number(),
  short_name: z.string().nullish(),
  event_type_string: z.string(),
  week: z.number().nullish(),
  address: z.string().nullish(),
  postal_code: z.string().nullish(),
  gmaps_place_id: z.string().nullish(),
  gmaps_url: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  location_name: z.string().nullish(),
  timezone: z.string().nullish(),
  website: z.string().nullish(),
  first_event_id: z.string().nullish(),
  first_event_code: z.string().nullish(),
  webcasts: z.array(z.object({
    type: z.string(),
    channel: z.string(),
    date: z.string().nullish(),
    file: z.string().nullish(),
  })).nullish(),
  division_keys: z.array(z.string()).nullish(),
  parent_event_key: z.string().nullish(),
  playoff_type: z.number().nullish(),
  playoff_type_string: z.string().nullish(),
});

export const MatchSchema = z.object({
  key: z.string(),
  comp_level: z.string(),
  set_number: z.number(),
  match_number: z.number(),
  alliances: z.object({
    red: z.object({
      score: z.number(),
      team_keys: z.array(z.string()),
      surrogate_team_keys: z.array(z.string()).nullish(),
      dq_team_keys: z.array(z.string()).nullish(),
    }),
    blue: z.object({
      score: z.number(),
      team_keys: z.array(z.string()),
      surrogate_team_keys: z.array(z.string()).nullish(),
      dq_team_keys: z.array(z.string()).nullish(),
    }),
  }),
  winning_alliance: z.string().nullish(),
  event_key: z.string(),
  time: z.number().nullish(),
  actual_time: z.number().nullish(),
  predicted_time: z.number().nullish(),
  post_result_time: z.number().nullish(),
  score_breakdown: z.record(z.string(), z.any()).nullish(),
  videos: z.array(z.object({
    type: z.string(),
    key: z.string(),
  })).nullish(),
});

const AwardSchema = z.object({
  name: z.string(),
  award_type: z.number(),
  event_key: z.string(),
  recipient_list: z.array(z.object({
    team_key: z.string().nullish(),
    awardee: z.string().nullish(),
  })),
  year: z.number(),
});

const RankingSchema = z.object({
  rankings: z.array(z.object({
    team_key: z.string(),
    rank: z.number(),
    dq: z.number().nullish(),
    matches_played: z.number(),
    qual_average: z.number().nullish(),
    record: z.object({
      losses: z.number(),
      wins: z.number(),
      ties: z.number(),
    }).nullish(),
    extra_stats: z.array(z.number()).nullish(),
    sort_orders: z.array(z.number()).nullish(),
  })),
  extra_stats_info: z.array(z.object({
    name: z.string(),
    precision: z.number(),
  })).nullish(),
  sort_order_info: z.array(z.object({
    name: z.string(),
    precision: z.number(),
  })).nullish(),
});

let API_KEY: string | undefined;

function getApiKey(): string {
  if (!API_KEY) {
    API_KEY = process.env['TBA_API_KEY'];
    if (!API_KEY) {
      throw new Error('TBA_API_KEY environment variable is required');
    }
  }
  return API_KEY;
}

export async function makeApiRequest(endpoint: string): Promise<unknown> {
  const apiKey = getApiKey();
  const url = `https://www.thebluealliance.com/api/v3${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'X-TBA-Auth-Key': apiKey,
      'Accept': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`TBA API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

async function runServer(): Promise<void> {
  console.error('The Blue Alliance MCP Server starting ...');
  const server = new Server(
    {
      name: 'The Blue Alliance MCP Server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_team',
          description: 'Get detailed information about a specific FRC team',
          inputSchema: {
            type: 'object',
            properties: {
              team_key: {
                type: 'string',
                description: 'Team key in format frcXXXX (e.g., frc254)',
                pattern: '^frc\\d+$',
              },
            },
            required: ['team_key'],
          },
        },
        {
          name: 'get_team_events',
          description: 'Get events that a team has participated in for a given year',
          inputSchema: {
            type: 'object',
            properties: {
              team_key: {
                type: 'string',
                description: 'Team key in format frcXXXX (e.g., frc254)',
                pattern: '^frc\\d+$',
              },
              year: {
                type: 'number',
                description: 'Competition year',
                minimum: 1992,
                maximum: new Date().getFullYear() + 1,
              },
            },
            required: ['team_key', 'year'],
          },
        },
        {
          name: 'get_team_awards',
          description: 'Get awards won by a team in a specific year',
          inputSchema: {
            type: 'object',
            properties: {
              team_key: {
                type: 'string',
                description: 'Team key in format frcXXXX (e.g., frc254)',
                pattern: '^frc\\d+$',
              },
              year: {
                type: 'number',
                description: 'Competition year',
                minimum: 1992,
                maximum: new Date().getFullYear() + 1,
              },
            },
            required: ['team_key', 'year'],
          },
        },
        {
          name: 'get_team_matches',
          description: 'Get matches played by a team in a specific year',
          inputSchema: {
            type: 'object',
            properties: {
              team_key: {
                type: 'string',
                description: 'Team key in format frcXXXX (e.g., frc254)',
                pattern: '^frc\\d+$',
              },
              year: {
                type: 'number',
                description: 'Competition year',
                minimum: 1992,
                maximum: new Date().getFullYear() + 1,
              },
            },
            required: ['team_key', 'year'],
          },
        },
        {
          name: 'get_events',
          description: 'Get all FRC events for a specific year',
          inputSchema: {
            type: 'object',
            properties: {
              year: {
                type: 'number',
                description: 'Competition year',
                minimum: 1992,
                maximum: new Date().getFullYear() + 1,
              },
            },
            required: ['year'],
          },
        },
        {
          name: 'get_event',
          description: 'Get detailed information about a specific event',
          inputSchema: {
            type: 'object',
            properties: {
              event_key: {
                type: 'string',
                description: 'Event key (e.g., 2023casj)',
              },
            },
            required: ['event_key'],
          },
        },
        {
          name: 'get_event_teams',
          description: 'Get teams participating in a specific event',
          inputSchema: {
            type: 'object',
            properties: {
              event_key: {
                type: 'string',
                description: 'Event key (e.g., 2023casj)',
              },
            },
            required: ['event_key'],
          },
        },
        {
          name: 'get_event_rankings',
          description: 'Get team rankings for a specific event',
          inputSchema: {
            type: 'object',
            properties: {
              event_key: {
                type: 'string',
                description: 'Event key (e.g., 2023casj)',
              },
            },
            required: ['event_key'],
          },
        },
        {
          name: 'get_event_matches',
          description: 'Get matches for a specific event',
          inputSchema: {
            type: 'object',
            properties: {
              event_key: {
                type: 'string',
                description: 'Event key (e.g., 2023casj)',
              },
            },
            required: ['event_key'],
          },
        },
      ] as Tool[],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
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
          const { team_key, year } = z.object({
            team_key: TeamKeySchema,
            year: YearSchema,
          }).parse(args);
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
          const { team_key, year } = z.object({
            team_key: TeamKeySchema,
            year: YearSchema,
          }).parse(args);
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
          const { team_key, year } = z.object({
            team_key: TeamKeySchema,
            year: YearSchema,
          }).parse(args);
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

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('The Blue Alliance MCP Server running on stdio');
}

// Only run the server if this file is executed directly
// Check if this is the main module by comparing file paths
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule) {
  runServer().catch((error) => {
    console.error('Fatal error running server:', error);
    process.exit(1);
  });
}
