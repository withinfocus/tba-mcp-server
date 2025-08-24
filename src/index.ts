#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

export const TeamKeySchema = z
  .string()
  .regex(/^frc\d+$/, 'Team key must be in format frcXXXX');
export const EventKeySchema = z.string();
export const YearSchema = z
  .number()
  .int()
  .min(1992)
  .max(new Date().getFullYear() + 1);

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
  district: z
    .object({
      abbreviation: z.string(),
      display_name: z.string(),
      key: z.string(),
      year: z.number(),
    })
    .nullish(),
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
  webcasts: z
    .array(
      z.object({
        type: z.string(),
        channel: z.string(),
        date: z.string().nullish(),
        file: z.string().nullish(),
      }),
    )
    .nullish(),
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
  videos: z
    .array(
      z.object({
        type: z.string(),
        key: z.string(),
      }),
    )
    .nullish(),
});

const AwardSchema = z.object({
  name: z.string(),
  award_type: z.number(),
  event_key: z.string(),
  recipient_list: z.array(
    z.object({
      team_key: z.string().nullish(),
      awardee: z.string().nullish(),
    }),
  ),
  year: z.number(),
});

const RankingSchema = z.object({
  rankings: z.array(
    z.object({
      team_key: z.string(),
      rank: z.number(),
      dq: z.number().nullish(),
      matches_played: z.number(),
      qual_average: z.number().nullish(),
      record: z
        .object({
          losses: z.number(),
          wins: z.number(),
          ties: z.number(),
        })
        .nullish(),
      extra_stats: z.array(z.number()).nullish(),
      sort_orders: z.array(z.number()).nullish(),
    }),
  ),
  extra_stats_info: z
    .array(
      z.object({
        name: z.string(),
        precision: z.number(),
      }),
    )
    .nullish(),
  sort_order_info: z
    .array(
      z.object({
        name: z.string(),
        precision: z.number(),
      }),
    )
    .nullish(),
});

const AllianceSchema = z.object({
  name: z.string().nullish(),
  backup: z
    .object({
      in: z.string().nullish(),
      out: z.string().nullish(),
    })
    .nullish(),
  declines: z.array(z.string()).nullish(),
  picks: z.array(z.string()),
  status: z
    .object({
      current_level_record: z
        .object({
          losses: z.number(),
          ties: z.number(),
          wins: z.number(),
        })
        .nullish(),
      level: z.string().nullish(),
      playoff_average: z.number().nullish(),
      record: z
        .object({
          losses: z.number(),
          ties: z.number(),
          wins: z.number(),
        })
        .nullish(),
      status: z.string().nullish(),
    })
    .nullish(),
});

const DistrictPointsSchema = z.object({
  points: z.record(
    z.string(),
    z.object({
      alliance_points: z.number(),
      award_points: z.number(),
      elim_points: z.number(),
      qual_points: z.number(),
      total: z.number(),
    }),
  ),
  tiebreakers: z
    .record(
      z.string(),
      z.object({
        highest_qual_scores: z.array(z.number()).nullish(),
        qual_wins: z.number().nullish(),
      }),
    )
    .nullish(),
});

const InsightsSchema = z.object({
  qual: z.record(z.string(), z.any()).nullish(),
  playoff: z.record(z.string(), z.any()).nullish(),
});

const MediaSchema = z.object({
  type: z.string(),
  foreign_key: z.string().nullish(),
  details: z.record(z.string(), z.any()).nullish(),
  preferred: z.boolean().nullish(),
  direct_url: z.string().nullish(),
  view_url: z.string().nullish(),
});

const RobotSchema = z.object({
  year: z.number(),
  robot_name: z.string(),
  key: z.string(),
  team_key: z.string(),
});

const DistrictSchema = z.object({
  abbreviation: z.string(),
  display_name: z.string(),
  key: z.string(),
  year: z.number(),
});

export const StatusSchema = z.object({
  current_season: z.number(),
  max_season: z.number(),
  is_datafeed_down: z.boolean(),
  down_events: z.array(z.string()),
  ios: z.object({
    latest_app_version: z.number(),
    min_app_version: z.number(),
  }),
  android: z.object({
    latest_app_version: z.number(),
    min_app_version: z.number(),
  }),
  max_team_page: z.number(),
});

export const EventOPRsSchema = z.object({
  oprs: z.record(z.string(), z.number()),
  dprs: z.record(z.string(), z.number()),
  ccwms: z.record(z.string(), z.number()),
});

export const TeamEventStatusSchema = z.object({
  qual: z
    .object({
      num_teams: z.number().nullish(),
      ranking: z
        .object({
          dq: z.number().nullish(),
          matches_played: z.number(),
          qual_average: z.number().nullish(),
          rank: z.number(),
          record: z
            .object({
              losses: z.number(),
              ties: z.number(),
              wins: z.number(),
            })
            .nullish(),
          sort_orders: z.array(z.number()).nullish(),
          team_key: z.string(),
        })
        .nullish(),
      sort_order_info: z
        .array(
          z.object({
            name: z.string(),
            precision: z.number(),
          }),
        )
        .nullish(),
      status: z.string().nullish(),
    })
    .nullish(),
  alliance: z
    .object({
      backup: z
        .object({
          in: z.string().nullish(),
          out: z.string().nullish(),
        })
        .nullish(),
      name: z.string().nullish(),
      number: z.number().nullish(),
      pick: z.number().nullish(),
    })
    .nullish(),
  playoff: z
    .object({
      current_level_record: z
        .object({
          losses: z.number(),
          ties: z.number(),
          wins: z.number(),
        })
        .nullish(),
      level: z.string().nullish(),
      playoff_average: z.number().nullish(),
      record: z
        .object({
          losses: z.number(),
          ties: z.number(),
          wins: z.number(),
        })
        .nullish(),
      status: z.string().nullish(),
    })
    .nullish(),
  alliance_status_str: z.string(),
  playoff_status_str: z.string(),
  overall_status_str: z.string(),
  next_match_key: z.string().nullish(),
  last_match_key: z.string().nullish(),
});

export const DistrictRankingSchema = z.object({
  team_key: z.string(),
  rank: z.number(),
  rookie_bonus: z.number().nullish(),
  point_total: z.number(),
  event_points: z.array(
    z.object({
      district_cmp: z.boolean(),
      total: z.number(),
      alliance_points: z.number(),
      elim_points: z.number(),
      award_points: z.number(),
      event_key: z.string(),
      qual_points: z.number(),
    }),
  ),
});

export const TeamSimpleSchema = z.object({
  key: z.string(),
  team_number: z.number(),
  nickname: z.string().nullish(),
  name: z.string(),
  city: z.string().nullish(),
  state_prov: z.string().nullish(),
  country: z.string().nullish(),
});

export const EventSimpleSchema = z.object({
  key: z.string(),
  name: z.string(),
  event_code: z.string(),
  event_type: z.number(),
  city: z.string().nullish(),
  state_prov: z.string().nullish(),
  country: z.string().nullish(),
  start_date: z.string(),
  end_date: z.string(),
  year: z.number(),
});

export const MatchSimpleSchema = z.object({
  key: z.string(),
  comp_level: z.string(),
  set_number: z.number(),
  match_number: z.number(),
  alliances: z.object({
    red: z.object({
      score: z.number(),
      team_keys: z.array(z.string()),
    }),
    blue: z.object({
      score: z.number(),
      team_keys: z.array(z.string()),
    }),
  }),
  winning_alliance: z.string().nullish(),
  event_key: z.string(),
  time: z.number().nullish(),
  predicted_time: z.number().nullish(),
  actual_time: z.number().nullish(),
});

export const ZebraSchema = z.object({
  key: z.string(),
  times: z.array(z.number()),
  alliances: z.object({
    red: z.array(
      z.object({
        team_key: z.string(),
        xs: z.array(z.number()).nullish(),
        ys: z.array(z.number()).nullish(),
      }),
    ),
    blue: z.array(
      z.object({
        team_key: z.string(),
        xs: z.array(z.number()).nullish(),
        ys: z.array(z.number()).nullish(),
      }),
    ),
  }),
});

export const PredictionSchema = z.object({
  match_predictions: z
    .record(
      z.string(),
      z.object({
        red: z
          .object({
            score: z.number(),
          })
          .optional(),
        blue: z
          .object({
            score: z.number(),
          })
          .optional(),
      }),
    )
    .or(z.any())
    .nullish(),
  ranking_predictions: z
    .record(
      z.string(),
      z.object({
        rank: z.number(),
      }),
    )
    .or(z.array(z.any()))
    .nullish(),
  stat_mean_vars: z.record(z.string(), z.any()).nullish(),
});

export const TeamHistorySchema = z.object({
  awards: z.array(AwardSchema).nullish(),
  events: z.array(EventSchema).nullish(),
  matches: z.array(MatchSchema).nullish(),
  robots: z.array(RobotSchema).nullish(),
});

let API_KEY: string | undefined;

function getApiKey(): string {
  if (!API_KEY) {
    API_KEY = process.env['TBA_API_KEY'];
    if (!API_KEY) {
      const errorMessage =
        'TBA_API_KEY environment variable is required but not set. Please set the TBA_API_KEY environment variable with your The Blue Alliance API key.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (API_KEY.trim() === '') {
      const errorMessage =
        'TBA_API_KEY environment variable is set but empty. Please provide a valid The Blue Alliance API key.';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
  return API_KEY;
}

export async function makeApiRequest(endpoint: string): Promise<unknown> {
  try {
    const apiKey = getApiKey();
    const url = `https://www.thebluealliance.com/api/v3${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = `TBA API request failed: ${response.status} ${response.statusText} for endpoint ${endpoint}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error(
        `API request error for endpoint ${endpoint}:`,
        error.message,
      );
      throw error;
    }
    const errorMessage = `Unknown error during API request for endpoint ${endpoint}`;
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

async function runServer(): Promise<void> {
  try {
    console.error('The Blue Alliance MCP Server starting ...');

    // Validate API key availability early
    try {
      getApiKey();
      console.error('TBA API key validated successfully');
    } catch (error) {
      const errorMessage = 'Failed to get TBA API key';
      console.error(
        errorMessage,
        error instanceof Error ? error.message : error,
      );
      throw new Error(errorMessage);
    }

    console.error('Initializing MCP server ...');
    const server = new Server(
      {
        name: 'The Blue Alliance MCP Server',
        version: '0.2.3',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    console.error('Setting up request handlers ...');

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
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_events',
            description:
              'Get events that a team has participated in for a given year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
          {
            name: 'get_event_alliances',
            description: 'Get elimination alliances for a specific event',
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
            name: 'get_event_insights',
            description: 'Get event-specific insights and statistics',
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
            name: 'get_event_district_points',
            description: 'Get district points for teams at an event',
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
            name: 'get_team_years_participated',
            description:
              'Get years that a team has participated in competition',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_districts',
            description: 'Get district history for a team',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_robots',
            description: 'Get robot names for a team by year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_media',
            description: 'Get media for a team in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
            name: 'get_team_event_matches',
            description: 'Get matches for a team at a specific event',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
                event_key: {
                  type: 'string',
                  description: 'Event key (e.g., 2023casj)',
                },
              },
              required: ['team_key', 'event_key'],
            },
          },
          {
            name: 'get_teams',
            description: 'Get list of teams with pagination',
            inputSchema: {
              type: 'object',
              properties: {
                page_num: {
                  type: 'number',
                  description: 'Page number (0-indexed)',
                  minimum: 0,
                },
              },
              required: ['page_num'],
            },
          },
          {
            name: 'get_status',
            description: 'Get TBA API status information',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_match',
            description: 'Get detailed information about a specific match',
            inputSchema: {
              type: 'object',
              properties: {
                match_key: {
                  type: 'string',
                  description: 'Match key (e.g., 2023casj_qm1)',
                },
              },
              required: ['match_key'],
            },
          },
          {
            name: 'get_event_oprs',
            description: 'Get OPR, DPR, and CCWM ratings for teams at an event',
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
            name: 'get_event_awards',
            description: 'Get awards from a specific event',
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
            name: 'get_team_awards_all',
            description: 'Get all awards won by a team across all years',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_events_all',
            description:
              'Get all events a team has participated in across all years',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_event_status',
            description:
              'Get team competition rank and status at a specific event',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
                event_key: {
                  type: 'string',
                  description: 'Event key (e.g., 2023casj)',
                },
              },
              required: ['team_key', 'event_key'],
            },
          },
          {
            name: 'get_districts',
            description: 'Get all districts for a specific year',
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
            name: 'get_district_rankings',
            description: 'Get team rankings within a district',
            inputSchema: {
              type: 'object',
              properties: {
                district_key: {
                  type: 'string',
                  description: 'District key (e.g., 2023fim)',
                },
              },
              required: ['district_key'],
            },
          },
          {
            name: 'get_teams_simple',
            description: 'Get simplified list of teams with pagination',
            inputSchema: {
              type: 'object',
              properties: {
                page_num: {
                  type: 'number',
                  description: 'Page number (0-indexed)',
                  minimum: 0,
                },
              },
              required: ['page_num'],
            },
          },
          {
            name: 'get_teams_keys',
            description: 'Get list of team keys with pagination',
            inputSchema: {
              type: 'object',
              properties: {
                page_num: {
                  type: 'number',
                  description: 'Page number (0-indexed)',
                  minimum: 0,
                },
              },
              required: ['page_num'],
            },
          },
          {
            name: 'get_teams_by_year',
            description: 'Get teams that competed in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                year: {
                  type: 'number',
                  description: 'Competition year',
                  minimum: 1992,
                  maximum: new Date().getFullYear() + 1,
                },
                page_num: {
                  type: 'number',
                  description: 'Page number (0-indexed)',
                  minimum: 0,
                },
              },
              required: ['year', 'page_num'],
            },
          },
          {
            name: 'get_teams_by_year_simple',
            description:
              'Get simplified teams that competed in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                year: {
                  type: 'number',
                  description: 'Competition year',
                  minimum: 1992,
                  maximum: new Date().getFullYear() + 1,
                },
                page_num: {
                  type: 'number',
                  description: 'Page number (0-indexed)',
                  minimum: 0,
                },
              },
              required: ['year', 'page_num'],
            },
          },
          {
            name: 'get_teams_by_year_keys',
            description: 'Get team keys that competed in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                year: {
                  type: 'number',
                  description: 'Competition year',
                  minimum: 1992,
                  maximum: new Date().getFullYear() + 1,
                },
                page_num: {
                  type: 'number',
                  description: 'Page number (0-indexed)',
                  minimum: 0,
                },
              },
              required: ['year', 'page_num'],
            },
          },
          {
            name: 'get_team_simple',
            description: 'Get simplified information about a specific team',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_event_simple',
            description: 'Get simplified information about a specific event',
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
            name: 'get_events_simple',
            description: 'Get simplified list of events for a year',
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
            name: 'get_events_keys',
            description: 'Get list of event keys for a year',
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
            name: 'get_match_simple',
            description: 'Get simplified information about a specific match',
            inputSchema: {
              type: 'object',
              properties: {
                match_key: {
                  type: 'string',
                  description: 'Match key (e.g., 2023casj_qm1)',
                },
              },
              required: ['match_key'],
            },
          },
          {
            name: 'get_team_events_simple',
            description: 'Get simplified events for a team in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
            name: 'get_team_events_keys',
            description: 'Get event keys for a team in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
            name: 'get_team_event_awards',
            description: 'Get awards won by a team at a specific event',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
                event_key: {
                  type: 'string',
                  description: 'Event key (e.g., 2023casj)',
                },
              },
              required: ['team_key', 'event_key'],
            },
          },
          {
            name: 'get_team_matches_simple',
            description: 'Get simplified matches for a team in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
            name: 'get_team_matches_keys',
            description: 'Get match keys for a team in a specific year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
            name: 'get_team_social_media',
            description: 'Get social media information for a team',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_media_by_tag',
            description: 'Get media for a team filtered by tag',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
                media_tag: {
                  type: 'string',
                  description: 'Media tag to filter by',
                },
              },
              required: ['team_key', 'media_tag'],
            },
          },
          {
            name: 'get_team_media_by_tag_year',
            description: 'Get media for a team filtered by tag and year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
                media_tag: {
                  type: 'string',
                  description: 'Media tag to filter by',
                },
                year: {
                  type: 'number',
                  description: 'Competition year',
                  minimum: 1992,
                  maximum: new Date().getFullYear() + 1,
                },
              },
              required: ['team_key', 'media_tag', 'year'],
            },
          },
          {
            name: 'get_event_teams_simple',
            description: 'Get simplified teams participating in an event',
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
            name: 'get_event_teams_keys',
            description: 'Get team keys participating in an event',
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
            name: 'get_event_matches_simple',
            description: 'Get simplified matches for an event',
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
            name: 'get_event_matches_keys',
            description: 'Get match keys for an event',
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
            name: 'get_event_predictions',
            description: 'Get TBA-generated predictions for an event',
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
            name: 'get_match_zebra',
            description: 'Get Zebra MotionWorks data for a match',
            inputSchema: {
              type: 'object',
              properties: {
                match_key: {
                  type: 'string',
                  description: 'Match key (e.g., 2023casj_qm1)',
                },
              },
              required: ['match_key'],
            },
          },
          {
            name: 'get_team_history',
            description: 'Get historical data for a team across all years',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
              },
              required: ['team_key'],
            },
          },
          {
            name: 'get_team_event_statuses',
            description: 'Get team event statuses for all events in a year',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
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
            name: 'get_team_event_matches_simple',
            description:
              'Get simplified matches for a team at a specific event',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
                event_key: {
                  type: 'string',
                  description: 'Event key (e.g., 2023casj)',
                },
              },
              required: ['team_key', 'event_key'],
            },
          },
          {
            name: 'get_team_event_matches_keys',
            description: 'Get match keys for a team at a specific event',
            inputSchema: {
              type: 'object',
              properties: {
                team_key: {
                  type: 'string',
                  description: 'Team key in format frcXXXX (e.g., frc86)',
                  pattern: '^frc\\d+$',
                },
                event_key: {
                  type: 'string',
                  description: 'Event key (e.g., 2023casj)',
                },
              },
              required: ['team_key', 'event_key'],
            },
          },
          {
            name: 'get_district_events',
            description: 'Get events in a specific district',
            inputSchema: {
              type: 'object',
              properties: {
                district_key: {
                  type: 'string',
                  description: 'District key (e.g., 2023fim)',
                },
              },
              required: ['district_key'],
            },
          },
          {
            name: 'get_district_events_simple',
            description: 'Get simplified events in a specific district',
            inputSchema: {
              type: 'object',
              properties: {
                district_key: {
                  type: 'string',
                  description: 'District key (e.g., 2023fim)',
                },
              },
              required: ['district_key'],
            },
          },
          {
            name: 'get_district_events_keys',
            description: 'Get event keys in a specific district',
            inputSchema: {
              type: 'object',
              properties: {
                district_key: {
                  type: 'string',
                  description: 'District key (e.g., 2023fim)',
                },
              },
              required: ['district_key'],
            },
          },
          {
            name: 'get_district_teams',
            description: 'Get teams in a specific district',
            inputSchema: {
              type: 'object',
              properties: {
                district_key: {
                  type: 'string',
                  description: 'District key (e.g., 2023fim)',
                },
              },
              required: ['district_key'],
            },
          },
          {
            name: 'get_district_teams_simple',
            description: 'Get simplified teams in a specific district',
            inputSchema: {
              type: 'object',
              properties: {
                district_key: {
                  type: 'string',
                  description: 'District key (e.g., 2023fim)',
                },
              },
              required: ['district_key'],
            },
          },
          {
            name: 'get_district_teams_keys',
            description: 'Get team keys in a specific district',
            inputSchema: {
              type: 'object',
              properties: {
                district_key: {
                  type: 'string',
                  description: 'District key (e.g., 2023fim)',
                },
              },
              required: ['district_key'],
            },
          },
        ] as Tool[],
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      console.error(`Processing tool request: ${name}`);

      try {
        switch (name) {
          case 'get_team': {
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const data = await makeApiRequest(
              `/team/${team_key}/events/${year}`,
            );
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
            const data = await makeApiRequest(
              `/team/${team_key}/awards/${year}`,
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

          case 'get_team_matches': {
            const { team_key, year } = z
              .object({
                team_key: TeamKeySchema,
                year: YearSchema,
              })
              .parse(args);
            const data = await makeApiRequest(
              `/team/${team_key}/matches/${year}`,
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
            const data = await makeApiRequest(
              `/event/${event_key}/district_points`,
            );
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
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
            const data = await makeApiRequest(
              `/team/${team_key}/years_participated`,
            );
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
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const data = await makeApiRequest(
              `/team/${team_key}/media/${year}`,
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
            const { match_key } = z
              .object({ match_key: z.string() })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const data = await makeApiRequest(
              `/district/${district_key}/rankings`,
            );
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
            const data = await makeApiRequest(
              `/teams/${year}/${page_num}/simple`,
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

          case 'get_teams_by_year_keys': {
            const { year, page_num } = z
              .object({
                year: YearSchema,
                page_num: z.number().min(0),
              })
              .parse(args);
            const data = await makeApiRequest(
              `/teams/${year}/${page_num}/keys`,
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

          case 'get_team_simple': {
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { match_key } = z
              .object({ match_key: z.string() })
              .parse(args);
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
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
            const data = await makeApiRequest(
              `/event/${event_key}/teams/simple`,
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

          case 'get_event_teams_keys': {
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
            const data = await makeApiRequest(
              `/event/${event_key}/matches/simple`,
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

          case 'get_event_matches_keys': {
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
            const data = await makeApiRequest(
              `/event/${event_key}/matches/keys`,
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

          case 'get_team_history': {
            const { team_key } = z
              .object({ team_key: TeamKeySchema })
              .parse(args);
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
            const statuses = z
              .record(z.string(), TeamEventStatusSchema)
              .parse(data);
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
            const data = await makeApiRequest(
              `/district/${district_key}/events`,
            );
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
            const data = await makeApiRequest(
              `/district/${district_key}/teams`,
            );
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
            const data = await makeApiRequest(
              `/district/${district_key}/teams/keys`,
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

          case 'get_match_zebra': {
            const { match_key } = z
              .object({ match_key: z.string() })
              .parse(args);
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
            const { event_key } = z
              .object({ event_key: EventKeySchema })
              .parse(args);
            const data = await makeApiRequest(
              `/event/${event_key}/predictions`,
            );
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
      } catch (error) {
        const errorMessage = `Tool execution error for '${name}': ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage, error);
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

    console.error('Setting up transport connection ...');
    try {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error('The Blue Alliance MCP Server running on stdio');
    } catch (error) {
      const errorMessage = 'Failed to connect to transport';
      console.error(
        errorMessage,
        error instanceof Error ? error.message : error,
      );
      throw new Error(errorMessage);
    }

    // Set up error handlers for the server
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception in MCP server:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(
        'Unhandled rejection in MCP server:',
        reason,
        'at promise:',
        promise,
      );
      process.exit(1);
    });
  } catch (error) {
    const errorMessage = 'Fatal error during server initialization';
    console.error(
      errorMessage,
      error instanceof Error ? error.message : error,
      error,
    );
    throw error;
  }
}

// Only run the server if this file is executed directly
// Check if this is the main module by comparing file paths
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule) {
  runServer().catch((error) => {
    console.error(
      'Fatal error running server:',
      error instanceof Error ? error.message : error,
    );
    console.error(
      'Stack trace:',
      error instanceof Error ? error.stack : 'No stack trace available',
    );
    console.error('Server will now exit');
    process.exit(1);
  });
}
