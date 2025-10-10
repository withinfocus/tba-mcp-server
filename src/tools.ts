import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
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
    description: 'Get events that a team has participated in for a given year',
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
    description: 'Get years that a team has participated in competition',
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
    description: 'Get all events a team has participated in across all years',
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
    description: 'Get team competition rank and status at a specific event',
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
    description: 'Get simplified teams that competed in a specific year',
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
    description: 'Get simplified matches for a team at a specific event',
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
];
