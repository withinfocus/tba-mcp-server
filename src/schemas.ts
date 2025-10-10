import { z } from 'zod';

// Input validation schemas
export const TeamKeySchema = z
  .string()
  .regex(/^frc\d+$/, 'Team key must be in format frcXXXX');

export const EventKeySchema = z.string();

export const YearSchema = z
  .number()
  .int()
  .min(1992)
  .max(new Date().getFullYear() + 1);

// API response schemas
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

export const AwardSchema = z.object({
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

export const RankingSchema = z.object({
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

export const AllianceSchema = z.object({
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

export const DistrictPointsSchema = z.object({
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

export const InsightsSchema = z.object({
  qual: z.record(z.string(), z.any()).nullish(),
  playoff: z.record(z.string(), z.any()).nullish(),
});

export const MediaSchema = z.object({
  type: z.string(),
  foreign_key: z.string().nullish(),
  details: z.record(z.string(), z.any()).nullish(),
  preferred: z.boolean().nullish(),
  direct_url: z.string().nullish(),
  view_url: z.string().nullish(),
});

export const RobotSchema = z.object({
  year: z.number(),
  robot_name: z.string(),
  key: z.string(),
  team_key: z.string(),
});

export const DistrictSchema = z.object({
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
