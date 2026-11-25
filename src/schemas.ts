import { z } from 'zod';

// Input validation schemas
export const TeamKeySchema = z
  .string()
  .regex(/^frc\d+$/, 'Team key must be in format frcXXXX')
  .describe(
    "FRC team key formatted as 'frc' followed by the team number with no leading zeros (e.g., 'frc86', 'frc254', 'frc1114'). Uniquely identifies a FIRST Robotics Competition team on The Blue Alliance.",
  );

export const EventKeySchema = z
  .string()
  .describe(
    "TBA event key combining the season year and event code (e.g., '2023casj' for the 2023 Silicon Valley Regional, '2024txhou' for the 2024 Houston Championship, '2024micmp4' for a Michigan State Championship division). Use get_events or get_events_keys to discover valid event keys for a year.",
  );

export const MatchKeySchema = z
  .string()
  .describe(
    "TBA match key in the form '{event_key}_{comp_level}{match_number}' (e.g., '2023casj_qm1' for qualification match 1, '2023casj_sf1m1' for semifinal set 1 match 1, '2023casj_f1m1' for finals match 1). Competition levels: qm (qualification), ef (eighth-final), qf (quarterfinal), sf (semifinal), f (final).",
  );

export const DistrictKeySchema = z
  .string()
  .describe(
    "TBA district key combining the season year and district abbreviation (e.g., '2023fim' for FIRST in Michigan, '2024ne' for New England, '2024chs' for Chesapeake, '2024pnw' for Pacific Northwest, '2024fit' for FIRST In Texas). Use get_districts to enumerate valid district keys for a year.",
  );

export const MediaTagSchema = z
  .string()
  .describe(
    "TBA media tag identifier used to filter team-submitted media. Common tags include 'chairmans_video', 'chairmans_essay', 'chairmans_presentation', and 'imagery'. See https://www.thebluealliance.com/apidocs for the full list.",
  );

export const PageNumSchema = z
  .number()
  .int()
  .min(0)
  .describe(
    'Zero-indexed page number for paginated team listings. TBA returns up to 500 teams per page; increment until the response is empty to enumerate all teams.',
  );

export const YearSchema = z
  .number()
  .int()
  .min(1992)
  .max(new Date().getFullYear() + 1)
  .describe(
    'FRC competition season year. FRC began in 1992 and runs one game per year (e.g., 2023 = "Charged Up", 2024 = "Crescendo", 2025 = "Reefscape"). Must be between 1992 and next calendar year.',
  );

export const InsightYearSchema = z
  .union([z.literal(0), YearSchema])
  .describe(
    'FRC season year the insights cover (1992 through next calendar year), or 0 for all-time insights across every season.',
  );

export const InsightCategorySchema = z
  .enum(['leaderboard', 'streak', 'timeseries', 'game_stats', 'clubs'])
  .describe(
    "Insight category: 'leaderboard' (teams, events, or matches ranked by a value), 'streak' (consecutive achievements), 'timeseries' (values over weeks or years), 'game_stats' (per-season, per-week, and per-event game statistics; large), or 'clubs' (all-time milestone memberships).",
  );

export const DistrictAbbreviationSchema = z
  .string()
  .regex(
    /^[a-z]+$/,
    'District abbreviation must be lowercase letters (e.g. fim, ne)',
  )
  .describe(
    "FRC district abbreviation without a year (e.g., 'fim' for FIRST in Michigan, 'ne' for New England, 'chs' for Chesapeake, 'pnw' for Pacific Northwest, 'fit' for FIRST In Texas). Covers every season of the district, including renames such as 'mar' to 'fma'. Use get_districts to discover abbreviations.",
  );

export const SearchQuerySchema = z
  .string()
  .trim()
  .min(2)
  .describe(
    "Case-insensitive text to look for in team keys, team numbers, team nicknames, event keys, and event names (e.g., 'Cheesy', '254', 'Silicon Valley', '2025casj'). At least 2 characters.",
  );

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
  home_championship: z.record(z.string(), z.unknown()).nullish(),
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
  score_breakdown: z.record(z.string(), z.unknown()).nullish(),
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
      rookie_bonus: z.number().nullish(),
    }),
  ),
  tiebreakers: z
    .record(
      z.string(),
      z.object({
        highest_match_scores: z.array(z.number()).nullish(),
        qual_wins: z.number().nullish(),
      }),
    )
    .nullish(),
});

export const InsightsSchema = z.object({
  qual: z.record(z.string(), z.unknown()).nullish(),
  playoff: z.record(z.string(), z.unknown()).nullish(),
});

export const MediaSchema = z.object({
  type: z.string(),
  foreign_key: z.string().nullish(),
  details: z.record(z.string(), z.unknown()).nullish(),
  preferred: z.boolean().nullish(),
  direct_url: z.string().nullish(),
  view_url: z.string().nullish(),
  team_keys: z.array(z.string()).nullish(),
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
  official_advancement_counts: z
    .object({
      dcmp: z.number(),
      cmp: z.number(),
    })
    .nullish(),
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
      playoff_type: z.number().nullish(),
      double_elim_round: z.string().nullish(),
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
  pit_location: z.string().nullish(),
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

const ZebraTeamSchema = z.object({
  team_key: z.string(),
  // Positions are null for timesteps where the tracker had no reading.
  xs: z.array(z.number().nullable()).nullish(),
  ys: z.array(z.number().nullable()).nullish(),
});

// TBA returns null for matches without Zebra MotionWorks tracking.
export const ZebraSchema = z
  .object({
    key: z.string(),
    times: z.array(z.number()),
    alliances: z.object({
      red: z.array(ZebraTeamSchema),
      blue: z.array(ZebraTeamSchema),
    }),
  })
  .nullable();

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
    .or(z.unknown())
    .nullish(),
  ranking_predictions: z
    .record(
      z.string(),
      z.object({
        rank: z.number(),
      }),
    )
    .or(z.array(z.unknown()))
    .nullish(),
  stat_mean_vars: z.record(z.string(), z.unknown()).nullish(),
});

export const TeamHistorySchema = z.object({
  awards: z.array(AwardSchema).nullish(),
  events: z.array(EventSchema).nullish(),
  matches: z.array(MatchSchema).nullish(),
  robots: z.array(RobotSchema).nullish(),
});

const WinLossTieSchema = z.object({
  wins: z.number(),
  losses: z.number(),
  ties: z.number(),
});

export const DistrictDcmpHistorySchema = z.object({
  event: EventSchema,
  awards: z.array(AwardSchema),
});

const DistrictInsightRegionDataSchema = z.object({
  yearly_active_team_count: z.record(z.string(), z.number()),
  yearly_event_count: z.record(z.string(), z.number()),
  yearly_gained_teams: z.record(z.string(), z.array(z.string())),
  yearly_lost_teams: z.record(z.string(), z.array(z.string())),
});

// The live API also returns `seasonal_insights` (per-season score
// distributions, roughly 700 KB for FIM). It is not in the OpenAPI spec and
// is deliberately left out here, so the parse drops it.
export const DistrictInsightSchema = z.object({
  district_data: z.object({
    region_data: z
      .record(z.string(), DistrictInsightRegionDataSchema)
      .nullish(),
    district_wide_data: DistrictInsightRegionDataSchema.nullish(),
  }),
  team_data: z
    .record(
      z.string(),
      z.object({
        district_seasons: z.number(),
        total_district_points: z.number(),
        total_pre_dcmp_district_points: z.number(),
        district_event_wins: z.number(),
        dcmp_wins: z.number(),
        team_awards: z.number(),
        individual_awards: z.number(),
        blue_banners: z.number().nullish(),
        quals_record: WinLossTieSchema,
        elims_record: WinLossTieSchema,
        in_district_extra_play_count: z.number(),
        total_matches_played: z.number(),
        dcmp_appearances: z.number(),
        cmp_appearances: z.number(),
      }),
    )
    .nullish(),
});

export const DistrictAdvancementSchema = z.object({
  teams: z
    .record(
      z.string(),
      z.object({
        dcmp: z.boolean(),
        cmp: z.boolean(),
        cmp_qualification: z.string().nullish(),
      }),
    )
    .nullish(),
  cutoffs: z
    .object({
      dcmp_original: z.number(),
      dcmp_effective: z.number(),
      dcmp_declines: z.array(z.string()),
      cmp_original: z.number(),
      cmp_effective: z.number(),
      cmp_declines: z.array(z.string()),
      cmp_qualification: z.record(z.string(), z.string()).nullish(),
    })
    .nullish(),
});

// Keyed by component name, then by team key. Component names come from the
// season's score breakdown and change every year.
export const EventCOPRsSchema = z.record(
  z.string(),
  z.record(z.string(), z.number()),
);

const NexusMapVectorSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const NexusMapElementSchema = z.object({
  position: NexusMapVectorSchema.nullish(),
  size: NexusMapVectorSchema.nullish(),
  angle: z.number().nullish(),
});

export const NexusEventInfoSchema = z.object({
  data_as_of_ms: z.number().nullish(),
  now_queueing: z
    .object({
      match_key: z.string(),
      match_name: z.string(),
    })
    .nullish(),
  matches: z
    .record(
      z.string(),
      z.object({
        label: z.string(),
        status: z.string(),
        played: z.boolean(),
        times: z
          .object({
            estimated_queue_time_ms: z.number().nullish(),
            estimated_start_time_ms: z.number().nullish(),
          })
          .nullish(),
      }),
    )
    .nullish(),
  pit_map: z
    .object({
      size: NexusMapVectorSchema.nullish(),
      pits: z
        .record(
          z.string(),
          NexusMapElementSchema.extend({ team_key: z.string().nullish() }),
        )
        .nullish(),
      areas: z
        .record(
          z.string(),
          NexusMapElementSchema.extend({ label: z.string().nullish() }),
        )
        .nullish(),
      labels: z
        .record(
          z.string(),
          NexusMapElementSchema.extend({ label: z.string().nullish() }),
        )
        .nullish(),
      arrows: z
        .record(
          z.string(),
          NexusMapElementSchema.extend({ type: z.string().nullish() }),
        )
        .nullish(),
      walls: z.record(z.string(), NexusMapElementSchema).nullish(),
    })
    .nullish(),
});

const PlayoffAdvancementSortOrderInfoSchema = z.object({
  name: z.string(),
  type: z.string().nullish(),
  precision: z.number(),
});

export const PlayoffAdvancementSchema = z.object({
  level: z.string(),
  level_name: z.string(),
  type: z.string(),
  rankings: z
    .array(
      z.object({
        team_keys: z.array(z.string()),
        alliance_name: z.string(),
        alliance_color: z.string().nullish(),
        rank: z.number().nullish(),
        record: WinLossTieSchema.nullish(),
        matches_played: z.number(),
        sort_orders: z.array(z.number()),
        extra_stats: z.array(z.number()),
      }),
    )
    .nullish(),
  sort_order_info: z.array(PlayoffAdvancementSortOrderInfoSchema),
  extra_stats_info: z.array(PlayoffAdvancementSortOrderInfoSchema),
});

export const LeaderboardInsightSchema = z.object({
  name: z.string(),
  year: z.number(),
  data: z.object({
    key_type: z.string(),
    rankings: z.array(
      z.object({
        value: z.number(),
        keys: z.array(z.string()),
      }),
    ),
  }),
});

export const NotablesInsightSchema = z.object({
  name: z.string(),
  year: z.number(),
  data: z.object({
    entries: z.array(
      z.object({
        team_key: z.string(),
        context: z.array(z.string()),
      }),
    ),
  }),
});

// `data` differs by category and TBA marks these models as under active
// development, so it is passed through without a fixed shape.
export const InsightV2Schema = z.object({
  name: z.string(),
  display_name: z.string(),
  year: z.number(),
  category: z.string(),
  district_abbreviation: z.string().nullish(),
  data: z.record(z.string(), z.unknown()),
});

export const RegionalAdvancementSchema = z
  .record(
    z.string(),
    z.object({
      cmp: z.boolean(),
      cmp_status: z.string(),
      qualifying_event: z.string().nullish(),
      qualifying_award_name: z.string().nullish(),
      qualifying_pool_week: z.number().nullish(),
    }),
  )
  .nullable();

export const RegionalRankingSchema = z.object({
  team_key: z.string(),
  rank: z.number(),
  point_total: z.number(),
  rookie_bonus: z.number().nullish(),
  single_event_bonus: z.number().nullish(),
  adjustments: z.number().nullish(),
  event_points: z
    .array(
      z.object({
        event_key: z.string(),
        total: z.number(),
        alliance_points: z.number(),
        elim_points: z.number(),
        award_points: z.number(),
        qual_points: z.number(),
        rookie_bonus: z.number().nullish(),
      }),
    )
    .nullish(),
});

export const SearchIndexSchema = z.object({
  teams: z.array(
    z.object({
      key: z.string(),
      nickname: z.string().nullish(),
    }),
  ),
  events: z.array(
    z.object({
      key: z.string(),
      name: z.string(),
    }),
  ),
});

export const SponsorsSchema = z.object({
  sponsors: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      logo_style: z.string(),
      logo_url: z.string().nullish(),
      logo_url_dark: z.string().nullish(),
    }),
  ),
});

// Tool input schemas. Registered with the MCP SDK, which converts them to
// JSON Schema for tools/list and validates tools/call arguments against them.
export const GetTeamInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamEventsInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamAwardsInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamMatchesInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetEventsInputSchema = z.object({
  year: YearSchema,
});

export const GetEventInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventTeamsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventRankingsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventMatchesInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventAlliancesInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventInsightsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventDistrictPointsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetTeamYearsParticipatedInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamDistrictsInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamRobotsInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamMediaInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamEventMatchesInputSchema = z.object({
  team_key: TeamKeySchema,
  event_key: EventKeySchema,
});

export const GetTeamsInputSchema = z.object({
  page_num: PageNumSchema,
});

export const GetStatusInputSchema = z.object({});

export const GetMatchInputSchema = z.object({
  match_key: MatchKeySchema,
});

export const GetEventOprsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventAwardsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetTeamAwardsAllInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamEventsAllInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamEventStatusInputSchema = z.object({
  team_key: TeamKeySchema,
  event_key: EventKeySchema,
});

export const GetDistrictsInputSchema = z.object({
  year: YearSchema,
});

export const GetDistrictRankingsInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetTeamsSimpleInputSchema = z.object({
  page_num: PageNumSchema,
});

export const GetTeamsKeysInputSchema = z.object({
  page_num: PageNumSchema,
});

export const GetTeamsByYearInputSchema = z.object({
  year: YearSchema,
  page_num: PageNumSchema,
});

export const GetTeamsByYearSimpleInputSchema = z.object({
  year: YearSchema,
  page_num: PageNumSchema,
});

export const GetTeamsByYearKeysInputSchema = z.object({
  year: YearSchema,
  page_num: PageNumSchema,
});

export const GetTeamSimpleInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetEventSimpleInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventsSimpleInputSchema = z.object({
  year: YearSchema,
});

export const GetEventsKeysInputSchema = z.object({
  year: YearSchema,
});

export const GetMatchSimpleInputSchema = z.object({
  match_key: MatchKeySchema,
});

export const GetTeamEventsSimpleInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamEventsKeysInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamEventAwardsInputSchema = z.object({
  team_key: TeamKeySchema,
  event_key: EventKeySchema,
});

export const GetTeamMatchesSimpleInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamMatchesKeysInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamSocialMediaInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamMediaByTagInputSchema = z.object({
  team_key: TeamKeySchema,
  media_tag: MediaTagSchema,
});

export const GetTeamMediaByTagYearInputSchema = z.object({
  team_key: TeamKeySchema,
  media_tag: MediaTagSchema,
  year: YearSchema,
});

export const GetEventTeamsSimpleInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventTeamsKeysInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventMatchesSimpleInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventMatchesKeysInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventPredictionsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetMatchZebraInputSchema = z.object({
  match_key: MatchKeySchema,
});

export const GetTeamHistoryInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamEventStatusesInputSchema = z.object({
  team_key: TeamKeySchema,
  year: YearSchema,
});

export const GetTeamEventMatchesSimpleInputSchema = z.object({
  team_key: TeamKeySchema,
  event_key: EventKeySchema,
});

export const GetTeamEventMatchesKeysInputSchema = z.object({
  team_key: TeamKeySchema,
  event_key: EventKeySchema,
});

export const GetDistrictEventsInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetDistrictEventsSimpleInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetDistrictEventsKeysInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetDistrictTeamsInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetDistrictTeamsSimpleInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetDistrictTeamsKeysInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetDistrictHistoryInputSchema = z.object({
  district_abbreviation: DistrictAbbreviationSchema,
});

export const GetDistrictDcmpHistoryInputSchema = z.object({
  district_abbreviation: DistrictAbbreviationSchema,
});

export const GetDistrictInsightsInputSchema = z.object({
  district_abbreviation: DistrictAbbreviationSchema,
});

export const GetDistrictAdvancementInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetDistrictAwardsInputSchema = z.object({
  district_key: DistrictKeySchema,
});

export const GetEventAdvancementPointsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventCoprsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventPracticeMatchesInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventPracticeMatchesSimpleInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventPracticeMatchesKeysInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventMediaInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventNexusInfoInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventPlayoffAdvancementInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventRegionalChampsPoolPointsInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventTeamMediaInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetEventTeamsStatusesInputSchema = z.object({
  event_key: EventKeySchema,
});

export const GetInsightsLeaderboardsInputSchema = z.object({
  year: InsightYearSchema,
});

export const GetInsightsNotablesInputSchema = z.object({
  year: InsightYearSchema,
});

export const GetInsightsInputSchema = z.object({
  year: InsightYearSchema,
});

export const GetInsightsByCategoryInputSchema = z.object({
  year: InsightYearSchema,
  category: InsightCategorySchema,
});

export const GetInsightsForDistrictInputSchema = z.object({
  year: InsightYearSchema,
  district_abbreviation: DistrictAbbreviationSchema,
});

export const GetInsightsForDistrictByCategoryInputSchema = z.object({
  year: InsightYearSchema,
  category: InsightCategorySchema,
  district_abbreviation: DistrictAbbreviationSchema,
});

export const GetRegionalAdvancementInputSchema = z.object({
  year: YearSchema,
});

export const GetRegionalRankingsInputSchema = z.object({
  year: YearSchema,
});

export const GetSearchIndexInputSchema = z.object({
  query: SearchQuerySchema,
});

export const GetSponsorsInputSchema = z.object({});

export const GetTeamEventsAllSimpleInputSchema = z.object({
  team_key: TeamKeySchema,
});

export const GetTeamEventsAllKeysInputSchema = z.object({
  team_key: TeamKeySchema,
});
