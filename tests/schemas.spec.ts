import { describe, it, expect } from '@jest/globals';
import {
  TeamKeySchema,
  EventKeySchema,
  YearSchema,
  TeamSchema,
  EventSchema,
  MatchSchema,
  AwardSchema,
  RankingSchema,
  AllianceSchema,
  DistrictPointsSchema,
  MediaSchema,
  RobotSchema,
  DistrictSchema,
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
  InsightYearSchema,
  InsightCategorySchema,
  DistrictAbbreviationSchema,
  SearchQuerySchema,
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
} from '../src/schemas.js';

describe('Schema validation', () => {
  describe('TeamKeySchema', () => {
    it('should validate team key format', () => {
      expect(() => TeamKeySchema.parse('frc86')).not.toThrow();
      expect(() => TeamKeySchema.parse('frc1234')).not.toThrow();
      expect(() => TeamKeySchema.parse('86')).toThrow();
      expect(() => TeamKeySchema.parse('team86')).toThrow();
      expect(() => TeamKeySchema.parse('frcabc')).toThrow();
    });
  });

  describe('YearSchema', () => {
    it('should validate year range', () => {
      expect(() => YearSchema.parse(2023)).not.toThrow();
      expect(() => YearSchema.parse(1992)).not.toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear())).not.toThrow();
      expect(() => YearSchema.parse(1991)).toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear() + 2)).toThrow();
    });
  });

  describe('TeamSchema', () => {
    it('should validate team schema', () => {
      const validTeam = {
        key: 'frc86',
        team_number: 86,
        name: 'Team Resistance',
        city: 'Jacksonville',
        state_prov: 'Florida',
        country: 'USA',
      };

      expect(() => TeamSchema.parse(validTeam)).not.toThrow();

      const invalidTeam = {
        key: 'frc86',
        // missing required name field
        team_number: 86,
      };

      expect(() => TeamSchema.parse(invalidTeam)).toThrow();
    });
  });

  describe('EventSchema', () => {
    it('should validate event schema', () => {
      const validEvent = {
        key: '2025hop',
        name: 'Hopper Division',
        event_code: 'hop',
        event_type: 3,
        start_date: '2025-04-16',
        end_date: '2025-04-19',
        year: 2025,
        event_type_string: 'Championship Division',
      };

      expect(() => EventSchema.parse(validEvent)).not.toThrow();
    });
  });

  describe('MatchSchema', () => {
    it('should validate match schema', () => {
      const validMatch = {
        key: '2025hop_qm112',
        comp_level: 'qm',
        set_number: 1,
        match_number: 112,
        alliances: {
          red: {
            score: 214,
            team_keys: ['frc86', 'frc230', 'frc2960'],
          },
          blue: {
            score: 165,
            team_keys: ['frc781', 'frc3814', 'frc1153'],
          },
        },
        event_key: '2025hop',
      };

      expect(() => MatchSchema.parse(validMatch)).not.toThrow();
    });
  });

  describe('StatusSchema', () => {
    it('should validate status schema', () => {
      const validStatus = {
        current_season: 2025,
        max_season: 2025,
        is_datafeed_down: false,
        down_events: [],
        ios: {
          latest_app_version: 123,
          min_app_version: 120,
        },
        android: {
          latest_app_version: 456,
          min_app_version: 450,
        },
        max_team_page: 189,
      };

      expect(() => StatusSchema.parse(validStatus)).not.toThrow();

      const invalidStatus = {
        current_season: 2025,
        // missing required fields
      };

      expect(() => StatusSchema.parse(invalidStatus)).toThrow();
    });
  });

  describe('EventOPRsSchema', () => {
    it('should validate event OPRs schema', () => {
      const validOPRs = {
        oprs: {
          frc86: 45.2,
          frc254: 67.8,
        },
        dprs: {
          frc86: 12.3,
          frc254: 18.7,
        },
        ccwms: {
          frc86: 32.9,
          frc254: 49.1,
        },
      };

      expect(() => EventOPRsSchema.parse(validOPRs)).not.toThrow();

      const invalidOPRs = {
        oprs: 'not-an-object',
      };

      expect(() => EventOPRsSchema.parse(invalidOPRs)).toThrow();
    });
  });

  describe('TeamEventStatusSchema', () => {
    it('should validate team event status schema', () => {
      const validStatus = {
        qual: {
          num_teams: 64,
          ranking: {
            dq: 0,
            matches_played: 12,
            qual_average: 45.2,
            rank: 5,
            record: {
              losses: 2,
              ties: 0,
              wins: 10,
            },
            sort_orders: [67.8, 45.2],
            team_key: 'frc86',
          },
          sort_order_info: [
            {
              name: 'Ranking Score',
              precision: 1,
            },
          ],
          status: 'Completed',
        },
        alliance: {
          backup: null,
          name: 'Alliance 1',
          number: 1,
          pick: 0,
        },
        playoff: null,
        alliance_status_str: 'Alliance 1 Captain',
        playoff_status_str: 'Won Championship',
        overall_status_str: 'Won Championship',
        next_match_key: null,
        last_match_key: '2025hop_f1m3',
      };

      expect(() => TeamEventStatusSchema.parse(validStatus)).not.toThrow();
    });
  });

  describe('DistrictRankingSchema', () => {
    it('should validate district ranking schema', () => {
      const validRanking = {
        team_key: 'frc86',
        rank: 5,
        rookie_bonus: 10,
        point_total: 145,
        event_points: [
          {
            district_cmp: false,
            total: 75,
            alliance_points: 20,
            elim_points: 15,
            award_points: 10,
            event_key: '2025flor',
            qual_points: 30,
          },
          {
            district_cmp: true,
            total: 70,
            alliance_points: 25,
            elim_points: 20,
            award_points: 5,
            event_key: '2025flcmp',
            qual_points: 20,
          },
        ],
      };

      expect(() => DistrictRankingSchema.parse(validRanking)).not.toThrow();

      const invalidRanking = {
        team_key: 'frc86',
        // missing required fields
      };

      expect(() => DistrictRankingSchema.parse(invalidRanking)).toThrow();
    });
  });

  describe('TeamSimpleSchema', () => {
    it('should validate team simple schema', () => {
      const validTeamSimple = {
        key: 'frc86',
        team_number: 86,
        nickname: 'Team Resistance',
        name: 'Team Resistance',
        city: 'Jacksonville',
        state_prov: 'Florida',
        country: 'USA',
      };

      expect(() => TeamSimpleSchema.parse(validTeamSimple)).not.toThrow();

      const invalidTeamSimple = {
        key: 'frc86',
        // missing required name field
        team_number: 86,
      };

      expect(() => TeamSimpleSchema.parse(invalidTeamSimple)).toThrow();
    });
  });

  describe('EventSimpleSchema', () => {
    it('should validate event simple schema', () => {
      const validEventSimple = {
        key: '2025hop',
        name: 'Hopper Division',
        event_code: 'hop',
        event_type: 3,
        city: 'Houston',
        state_prov: 'Texas',
        country: 'USA',
        start_date: '2025-04-16',
        end_date: '2025-04-19',
        year: 2025,
      };

      expect(() => EventSimpleSchema.parse(validEventSimple)).not.toThrow();
    });
  });

  describe('MatchSimpleSchema', () => {
    it('should validate match simple schema', () => {
      const validMatchSimple = {
        key: '2025hop_qm112',
        comp_level: 'qm',
        set_number: 1,
        match_number: 112,
        alliances: {
          red: {
            score: 214,
            team_keys: ['frc86', 'frc230', 'frc2960'],
          },
          blue: {
            score: 165,
            team_keys: ['frc781', 'frc3814', 'frc1153'],
          },
        },
        winning_alliance: 'red',
        event_key: '2025hop',
        time: 1650123456,
        predicted_time: 1650123400,
        actual_time: 1650123500,
      };

      expect(() => MatchSimpleSchema.parse(validMatchSimple)).not.toThrow();
    });
  });

  describe('ZebraSchema', () => {
    it('should validate zebra schema', () => {
      const validZebra = {
        key: '2025hop_qm112',
        times: [0.0, 0.5, 1.0, 1.5],
        alliances: {
          red: [
            {
              team_key: 'frc86',
              xs: [1.2, 2.4, 3.6],
              ys: [0.5, 1.0, 1.5],
            },
          ],
          blue: [
            {
              team_key: 'frc254',
              xs: [4.2, 5.4, 6.6],
              ys: [2.5, 3.0, 3.5],
            },
          ],
        },
      };

      expect(() => ZebraSchema.parse(validZebra)).not.toThrow();
    });

    it('should accept null positions and a null response', () => {
      const zebraWithGaps = {
        key: '2022cmptx_f1m1',
        times: [0.0, 0.1],
        alliances: {
          red: [{ team_key: 'frc86', xs: [null, 1.2], ys: [null, 0.5] }],
          blue: [{ team_key: 'frc254', xs: [4.2, null], ys: [2.5, null] }],
        },
      };

      expect(() => ZebraSchema.parse(zebraWithGaps)).not.toThrow();
      expect(ZebraSchema.parse(null)).toBeNull();
    });
  });

  describe('PredictionSchema', () => {
    it('should validate prediction schema', () => {
      const validPrediction = {
        match_predictions: {
          '2025hop_qm112': {
            red: { score: 180 },
            blue: { score: 165 },
          },
        },
        ranking_predictions: {
          frc86: { rank: 5 },
          frc254: { rank: 1 },
        },
        stat_mean_vars: {
          auto_points: { mean: 45.2, var: 12.5 },
        },
      };

      expect(() => PredictionSchema.parse(validPrediction)).not.toThrow();

      const emptyPrediction = {
        match_predictions: null,
        ranking_predictions: null,
        stat_mean_vars: null,
      };

      expect(() => PredictionSchema.parse(emptyPrediction)).not.toThrow();
    });
  });

  describe('TeamHistorySchema', () => {
    it('should validate team history schema', () => {
      const validHistory = {
        awards: [
          {
            name: "Chairman's Award",
            award_type: 0,
            event_key: '2025hop',
            recipient_list: [
              {
                team_key: 'frc86',
                awardee: null,
              },
            ],
            year: 2025,
          },
        ],
        events: [
          {
            key: '2025hop',
            name: 'Hopper Division',
            event_code: 'hop',
            event_type: 3,
            start_date: '2025-04-16',
            end_date: '2025-04-19',
            year: 2025,
            event_type_string: 'Championship Division',
          },
        ],
        matches: [
          {
            key: '2025hop_qm112',
            comp_level: 'qm',
            set_number: 1,
            match_number: 112,
            alliances: {
              red: {
                score: 214,
                team_keys: ['frc86', 'frc230', 'frc2960'],
              },
              blue: {
                score: 165,
                team_keys: ['frc781', 'frc3814', 'frc1153'],
              },
            },
            event_key: '2025hop',
          },
        ],
        robots: [
          {
            year: 2025,
            robot_name: 'Resistance Bot',
            key: 'frc86_2025',
            team_key: 'frc86',
          },
        ],
      };

      expect(() => TeamHistorySchema.parse(validHistory)).not.toThrow();
    });
  });

  describe('EventKeySchema', () => {
    it('should validate event key format', () => {
      expect(() => EventKeySchema.parse('2024hop')).not.toThrow();
      expect(() => EventKeySchema.parse('2025flor')).not.toThrow();
      expect(() => EventKeySchema.parse('2024cmp')).not.toThrow();
    });
  });

  describe('Schema exports', () => {
    it('should export AwardSchema', () => {
      expect(AwardSchema).toBeDefined();
    });

    it('should export RankingSchema', () => {
      expect(RankingSchema).toBeDefined();
    });

    it('should export AllianceSchema', () => {
      expect(AllianceSchema).toBeDefined();
    });

    it('should export DistrictPointsSchema', () => {
      expect(DistrictPointsSchema).toBeDefined();
    });
  });

  describe('MediaSchema', () => {
    it('should validate media schema', () => {
      const validMedia = {
        type: 'youtube',
        foreign_key: 'dQw4w9WgXcQ',
        details: {},
        preferred: true,
        view_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      };

      expect(() => MediaSchema.parse(validMedia)).not.toThrow();
    });
  });

  describe('RobotSchema', () => {
    it('should validate robot schema', () => {
      const validRobot = {
        year: 2025,
        robot_name: 'Resistance Bot',
        key: 'frc86_2025',
        team_key: 'frc86',
      };

      expect(() => RobotSchema.parse(validRobot)).not.toThrow();
    });
  });

  describe('DistrictSchema', () => {
    it('should validate district schema', () => {
      const validDistrict = {
        abbreviation: 'FIM',
        display_name: 'FIRST In Michigan',
        key: '2024fim',
        year: 2024,
      };

      expect(() => DistrictSchema.parse(validDistrict)).not.toThrow();
    });
  });

  describe('DistrictPointsSchema', () => {
    it('should keep highest_match_scores tiebreakers and rookie bonus', () => {
      const points = {
        points: {
          frc254: {
            alliance_points: 16,
            award_points: 5,
            elim_points: 30,
            qual_points: 22,
            rookie_bonus: 0,
            total: 73,
          },
        },
        tiebreakers: {
          frc254: { highest_match_scores: [250, 240], qual_wins: 11 },
        },
      };

      expect(DistrictPointsSchema.parse(points)).toEqual(points);
    });
  });

  describe('InsightYearSchema', () => {
    it('should accept 0 for all-time and any valid season year', () => {
      expect(InsightYearSchema.parse(0)).toBe(0);
      expect(InsightYearSchema.parse(2025)).toBe(2025);
      expect(() => InsightYearSchema.parse(1991)).toThrow();
      expect(() => InsightYearSchema.parse(1)).toThrow();
    });
  });

  describe('InsightCategorySchema', () => {
    it('should accept only the categories TBA defines', () => {
      for (const category of [
        'leaderboard',
        'streak',
        'timeseries',
        'game_stats',
        'clubs',
      ]) {
        expect(InsightCategorySchema.parse(category)).toBe(category);
      }
      expect(() => InsightCategorySchema.parse('notables')).toThrow();
    });
  });

  describe('DistrictAbbreviationSchema', () => {
    it('should accept lowercase abbreviations only', () => {
      expect(DistrictAbbreviationSchema.parse('fim')).toBe('fim');
      expect(() => DistrictAbbreviationSchema.parse('2025fim')).toThrow();
      expect(() => DistrictAbbreviationSchema.parse('FIM')).toThrow();
      expect(() => DistrictAbbreviationSchema.parse('fim/../x')).toThrow();
    });
  });

  describe('SearchQuerySchema', () => {
    it('should trim and require at least 2 characters', () => {
      expect(SearchQuerySchema.parse('  poofs ')).toBe('poofs');
      expect(() => SearchQuerySchema.parse(' a ')).toThrow();
    });
  });

  describe('EventCOPRsSchema', () => {
    it('should accept any component name mapping team keys to numbers', () => {
      const coprs = {
        'L1 Coral Count': { frc254: 1.2, frc604: -0.3 },
        autoPoints: { frc254: 18.5 },
      };

      expect(EventCOPRsSchema.parse(coprs)).toEqual(coprs);
      expect(() =>
        EventCOPRsSchema.parse({ autoPoints: { frc254: 'high' } }),
      ).toThrow();
    });
  });

  describe('DistrictSchema', () => {
    it('should keep official advancement counts', () => {
      const district = {
        abbreviation: 'fim',
        display_name: 'FIRST in Michigan',
        key: '2025fim',
        year: 2025,
        official_advancement_counts: { dcmp: 160, cmp: 80 },
      };

      expect(DistrictSchema.parse(district)).toEqual(district);
    });
  });

  describe('DistrictDcmpHistorySchema', () => {
    it('should validate a championship event with its awards', () => {
      expect(() =>
        DistrictDcmpHistorySchema.parse({
          event: {
            key: '2025micmp',
            name: 'FIM State Championship',
            event_code: 'micmp',
            event_type: 2,
            start_date: '2025-04-03',
            end_date: '2025-04-05',
            year: 2025,
            event_type_string: 'District Championship',
          },
          awards: [],
        }),
      ).not.toThrow();
    });
  });

  describe('DistrictInsightSchema', () => {
    it('should validate team and district data and drop seasonal_insights', () => {
      const regionData = {
        yearly_active_team_count: { '2025': 500 },
        yearly_event_count: { '2025': 30 },
        yearly_gained_teams: { '2025': ['frc10000'] },
        yearly_lost_teams: { '2025': [] },
      };
      const record = { wins: 1, losses: 2, ties: 0 };
      const parsed = DistrictInsightSchema.parse({
        district_data: {
          region_data: { Michigan: regionData },
          district_wide_data: regionData,
        },
        team_data: {
          frc67: {
            district_seasons: 17,
            total_district_points: 4161,
            total_pre_dcmp_district_points: 2118,
            district_event_wins: 25,
            dcmp_wins: 5,
            team_awards: 90,
            individual_awards: 5,
            blue_banners: 33,
            quals_record: record,
            elims_record: record,
            in_district_extra_play_count: 5,
            total_matches_played: 973,
            dcmp_appearances: 17,
            cmp_appearances: 16,
          },
        },
        seasonal_insights: { '2025': { score_distribution: {} } },
      });

      expect(parsed.team_data?.['frc67']?.blue_banners).toBe(33);
      expect(parsed).not.toHaveProperty('seasonal_insights');
    });
  });

  describe('DistrictAdvancementSchema', () => {
    it('should accept computed and not-yet-computed advancement', () => {
      expect(() =>
        DistrictAdvancementSchema.parse({ teams: null, cutoffs: null }),
      ).not.toThrow();
      expect(() =>
        DistrictAdvancementSchema.parse({
          teams: { frc67: { dcmp: true, cmp: false, cmp_qualification: null } },
          cutoffs: {
            dcmp_original: 160,
            dcmp_effective: 158,
            dcmp_declines: ['frc1'],
            cmp_original: 80,
            cmp_effective: 80,
            cmp_declines: [],
            cmp_qualification: { frc67: 'dcmp_winner' },
          },
        }),
      ).not.toThrow();
    });
  });

  describe('NexusEventInfoSchema', () => {
    it('should validate a pit map without queuing data', () => {
      expect(() =>
        NexusEventInfoSchema.parse({
          data_as_of_ms: null,
          now_queueing: null,
          matches: {},
          pit_map: {
            size: { x: 850, y: 1498 },
            pits: {
              A1: {
                position: { x: 250, y: 241.7 },
                size: { x: 100, y: 100 },
                team_key: null,
              },
            },
            areas: {},
            labels: {},
            arrows: {
              r0: {
                position: { x: 1, y: 2 },
                size: { x: 3, y: 4 },
                angle: 90,
                type: 'single',
              },
            },
            walls: {},
          },
        }),
      ).not.toThrow();
    });
  });

  describe('PlayoffAdvancementSchema', () => {
    it('should reject a level without sort order info', () => {
      expect(() =>
        PlayoffAdvancementSchema.parse({
          level: 'f',
          level_name: 'Finals',
          type: 'best_of_3',
          rankings: null,
        }),
      ).toThrow();
    });
  });

  describe('Insight schemas', () => {
    it('should validate leaderboard and notables insights', () => {
      expect(() =>
        LeaderboardInsightSchema.parse({
          name: 'typed_leaderboard_blue_banners',
          year: 0,
          data: {
            key_type: 'team',
            rankings: [{ value: 90, keys: ['frc254'] }],
          },
        }),
      ).not.toThrow();
      expect(() =>
        NotablesInsightSchema.parse({
          name: 'notables_hall_of_fame',
          year: 0,
          data: { entries: [{ team_key: 'frc254', context: ['2004cmp'] }] },
        }),
      ).not.toThrow();
    });

    it('should keep InsightV2 data intact whatever the category', () => {
      const insight = {
        name: 'einstein_streak',
        display_name: 'Longest Einstein Streak',
        year: 0,
        category: 'streak',
        district_abbreviation: null,
        data: { entries: [{ key: 'frc254', streak_length: 5 }] },
      };

      expect(InsightV2Schema.parse(insight)).toEqual(insight);
    });
  });

  describe('Regional advancement schemas', () => {
    it('should validate advancement entries and pool rankings', () => {
      expect(() =>
        RegionalAdvancementSchema.parse({
          frc4481: {
            cmp: true,
            cmp_status: 'PoolQualified',
            qualifying_pool_week: 3,
          },
        }),
      ).not.toThrow();
      expect(RegionalAdvancementSchema.parse(null)).toBeNull();
      expect(() =>
        RegionalRankingSchema.parse({ team_key: 'frc4481', rank: 1 }),
      ).toThrow();
    });
  });

  describe('SearchIndexSchema and SponsorsSchema', () => {
    it('should validate the search index and sponsor list', () => {
      expect(() =>
        SearchIndexSchema.parse({
          teams: [{ key: 'frc254', nickname: 'The Cheesy Poofs' }],
          events: [{ key: '2025casj', name: 'Silicon Valley Regional' }],
        }),
      ).not.toThrow();
      expect(() =>
        SponsorsSchema.parse({
          sponsors: [
            {
              name: 'AndyMark',
              url: 'https://www.andymark.com/',
              logo_style: 'wordmark',
              logo_url: null,
              logo_url_dark: null,
            },
          ],
        }),
      ).not.toThrow();
    });
  });

  describe('Schema edge cases', () => {
    it('should handle null and undefined for optional fields', () => {
      const teamWithNulls = {
        key: 'frc86',
        team_number: 86,
        name: 'Team Resistance',
        nickname: null,
        city: null,
        state_prov: null,
        country: null,
      };

      expect(() => TeamSchema.parse(teamWithNulls)).not.toThrow();
    });

    it('should reject invalid types for required fields', () => {
      const invalidTeam = {
        key: 'frc86',
        team_number: '86', // should be number
        name: 'Team Resistance',
      };

      expect(() => TeamSchema.parse(invalidTeam)).toThrow();
    });

    it('should validate nested objects', () => {
      const matchWithAlliances = {
        key: '2024hop_qm1',
        comp_level: 'qm',
        set_number: 1,
        match_number: 1,
        alliances: {
          red: {
            score: 100,
            team_keys: ['frc86', 'frc254', 'frc1323'],
          },
          blue: {
            score: 90,
            team_keys: ['frc111', 'frc222', 'frc333'],
          },
        },
        event_key: '2024hop',
      };

      expect(() => MatchSchema.parse(matchWithAlliances)).not.toThrow();
    });

    it('should validate arrays of primitives', () => {
      const yearsArray = [2020, 2021, 2022, 2023];
      expect(() => {
        yearsArray.forEach((year) => YearSchema.parse(year));
      }).not.toThrow();
    });
  });
});
