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
