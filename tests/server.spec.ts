import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('The Blue Alliance MCP Server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env['TBA_API_KEY'] = 'test-api-key';
  });

  afterEach(() => {
    delete process.env['TBA_API_KEY'];
  });

  describe('API Key validation', () => {
    it('should throw error when TBA_API_KEY is not set', async () => {
      delete process.env['TBA_API_KEY'];

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/test')).rejects.toThrow(
        'TBA_API_KEY environment variable is required',
      );
    });

    it('should use TBA_API_KEY from environment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ test: 'data' }),
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await makeApiRequest('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.thebluealliance.com/api/v3/test',
        {
          headers: {
            'X-TBA-Auth-Key': 'test-api-key',
            Accept: 'application/json',
          },
        },
      );
    });
  });

  describe('API Request handling', () => {
    it('should handle successful API responses', async () => {
      const mockData = {
        key: 'frc86',
        team_number: 86,
        name: 'Team Resistance',
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      const result = await makeApiRequest('/team/frc86');

      expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/team/invalid')).rejects.toThrow(
        'TBA API request failed: 404 Not Found',
      );
    });
  });

  describe('Schema validation', () => {
    it('should validate team key format', async () => {
      const { TeamKeySchema } = await import('../src/schemas.js');

      expect(() => TeamKeySchema.parse('frc86')).not.toThrow();
      expect(() => TeamKeySchema.parse('frc1234')).not.toThrow();
      expect(() => TeamKeySchema.parse('86')).toThrow();
      expect(() => TeamKeySchema.parse('team86')).toThrow();
      expect(() => TeamKeySchema.parse('frcabc')).toThrow();
    });

    it('should validate year range', async () => {
      const { YearSchema } = await import('../src/schemas.js');

      expect(() => YearSchema.parse(2023)).not.toThrow();
      expect(() => YearSchema.parse(1992)).not.toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear())).not.toThrow();
      expect(() => YearSchema.parse(1991)).toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear() + 2)).toThrow();
    });

    it('should validate team schema', async () => {
      const { TeamSchema } = await import('../src/schemas.js');

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

    it('should validate event schema', async () => {
      const { EventSchema } = await import('../src/schemas.js');

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

    it('should validate match schema', async () => {
      const { MatchSchema } = await import('../src/schemas.js');

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

    it('should validate status schema', async () => {
      const { StatusSchema } = await import('../src/schemas.js');

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

    it('should validate event OPRs schema', async () => {
      const { EventOPRsSchema } = await import('../src/schemas.js');

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

    it('should validate team event status schema', async () => {
      const { TeamEventStatusSchema } = await import('../src/schemas.js');

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

    it('should validate district ranking schema', async () => {
      const { DistrictRankingSchema } = await import('../src/schemas.js');

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

    it('should validate team simple schema', async () => {
      const { TeamSimpleSchema } = await import('../src/schemas.js');

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

    it('should validate event simple schema', async () => {
      const { EventSimpleSchema } = await import('../src/schemas.js');

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

    it('should validate match simple schema', async () => {
      const { MatchSimpleSchema } = await import('../src/schemas.js');

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

    it('should validate zebra schema', async () => {
      const { ZebraSchema } = await import('../src/schemas.js');

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

    it('should validate prediction schema', async () => {
      const { PredictionSchema } = await import('../src/schemas.js');

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

    it('should validate team history schema', async () => {
      const { TeamHistorySchema } = await import('../src/schemas.js');

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
});
