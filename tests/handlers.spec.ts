import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import type { Client } from '@modelcontextprotocol/client';
import { executeTool } from '../src/handlers.js';
import { tools } from '../src/tools.js';
import { connectInMemoryClient } from './in-memory-client.js';

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

type TextResult = {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
};

describe('Handler functions', () => {
  let client: Client;

  // Calls a tool through the MCP SDK, so input validation and error mapping
  // run exactly as they do for a real client.
  async function handleToolCall(
    name: string,
    args: Record<string, unknown>,
  ): Promise<TextResult> {
    return (await client.callTool({ name, arguments: args })) as TextResult;
  }

  beforeAll(async () => {
    client = await connectInMemoryClient();
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env['TBA_API_KEY'] = 'test-api-key';
  });

  afterEach(() => {
    delete process.env['TBA_API_KEY'];
  });

  describe('tools/call', () => {
    it('should handle get_team tool', async () => {
      const mockTeamData = {
        key: 'frc86',
        team_number: 86,
        name: 'Team Resistance',
        city: 'Jacksonville',
        state_prov: 'Florida',
        country: 'USA',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeamData,
      } as Response);

      const result = await handleToolCall('get_team', {
        team_key: 'frc86',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0]!.type).toBe('text');
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.key).toBe('frc86');
      expect(parsedContent.team_number).toBe(86);
    });

    it('should handle get_team_events tool', async () => {
      const mockEvents = [
        {
          key: '2024hop',
          name: 'Hopper Division',
          event_code: 'hop',
          event_type: 3,
          start_date: '2024-04-16',
          end_date: '2024-04-19',
          year: 2024,
          event_type_string: 'Championship Division',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvents,
      } as Response);

      const result = await handleToolCall('get_team_events', {
        team_key: 'frc86',
        year: 2024,
      });

      expect(result.content).toBeDefined();
      expect(result.content[0]!.type).toBe('text');
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(Array.isArray(parsedContent)).toBe(true);
      expect(parsedContent.length).toBe(1);
    });

    it('should handle get_status tool', async () => {
      const mockStatus = {
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

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const result = await handleToolCall('get_status', {});

      expect(result.content).toBeDefined();
      expect(result.content[0]!.type).toBe('text');
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.current_season).toBe(2025);
    });

    it('should return an error result for invalid team key format', async () => {
      const result = await handleToolCall('get_team', {
        team_key: 'invalid',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toContain(
        'Team key must be in format frcXXXX',
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return an error result for invalid year', async () => {
      const result = await handleToolCall('get_team_events', {
        team_key: 'frc86',
        year: 1990, // Before 1992
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toContain('year');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return an error result for missing required parameters', async () => {
      const result = await handleToolCall('get_team_events', {
        team_key: 'frc86',
        // missing year parameter
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toMatch(/year.*received undefined/);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject an unknown tool name with a protocol error', async () => {
      await expect(handleToolCall('unknown_tool', {})).rejects.toThrow(
        'Tool unknown_tool not found',
      );
    });

    it('should handle get_teams tool with pagination', async () => {
      const mockTeams = [
        {
          key: 'frc86',
          team_number: 86,
          name: 'Team Resistance',
        },
        {
          key: 'frc254',
          team_number: 254,
          name: 'The Cheesy Poofs',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeams,
      } as Response);

      const result = await handleToolCall('get_teams', {
        page_num: 0,
      });

      expect(result.content).toBeDefined();
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(Array.isArray(parsedContent)).toBe(true);
    });

    it('should handle get_event tool', async () => {
      const mockEvent = {
        key: '2024hop',
        name: 'Hopper Division',
        event_code: 'hop',
        event_type: 3,
        start_date: '2024-04-16',
        end_date: '2024-04-19',
        year: 2024,
        event_type_string: 'Championship Division',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEvent,
      } as Response);

      const result = await handleToolCall('get_event', {
        event_key: '2024hop',
      });

      expect(result.content).toBeDefined();
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.key).toBe('2024hop');
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const result = await handleToolCall('get_team', {
        team_key: 'frc999999',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toBe(
        'Error: TBA API request failed: 404 Not Found for endpoint /team/frc999999',
      );
    });

    it('should handle get_match tool', async () => {
      const mockMatch = {
        key: '2024hop_qm112',
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
        event_key: '2024hop',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMatch,
      } as Response);

      const result = await handleToolCall('get_match', {
        match_key: '2024hop_qm112',
      });

      expect(result.content).toBeDefined();
      const parsedContent = JSON.parse(result.content[0]!.text);
      expect(parsedContent.key).toBe('2024hop_qm112');
    });

    it('should validate response data against schema', async () => {
      const invalidTeamData = {
        key: 'frc86',
        // missing required 'name' field
        team_number: 86,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidTeamData,
      } as Response);

      const result = await handleToolCall('get_team', {
        team_key: 'frc86',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0]!.text).toMatch(/^Error: /);
    });
  });

  describe('tools/call for remaining TBA endpoints', () => {
    const event = {
      key: '2025casj',
      name: 'Silicon Valley Regional',
      event_code: 'casj',
      event_type: 0,
      start_date: '2025-03-26',
      end_date: '2025-03-29',
      year: 2025,
      event_type_string: 'Regional',
    };
    const eventSimple: Record<string, unknown> = { ...event };
    delete eventSimple['event_type_string'];
    const award = {
      name: 'Regional Winners',
      award_type: 1,
      event_key: '2025casj',
      recipient_list: [{ team_key: 'frc254', awardee: null }],
      year: 2025,
    };
    const practiceMatch = {
      key: '2025casj_pm1',
      comp_level: 'pm',
      set_number: 1,
      match_number: 1,
      alliances: {
        red: { score: 50, team_keys: ['frc254', 'frc604', 'frc1678'] },
        blue: { score: 40, team_keys: ['frc100', 'frc115', 'frc199'] },
      },
      event_key: '2025casj',
    };
    const eventPoints = {
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
        frc254: { highest_match_scores: [250, 240, 230], qual_wins: 11 },
      },
    };
    const insightV2 = {
      name: 'blue_banners',
      display_name: 'Total Blue Banners',
      year: 2025,
      category: 'leaderboard',
      district_abbreviation: null,
      data: { key_type: 'team', context_type: 'none', rankings: [] },
    };
    const teamStatus = {
      qual: null,
      alliance: null,
      playoff: null,
      pit_location: 'A12',
      alliance_status_str: '--',
      playoff_status_str: '--',
      overall_status_str: 'Team 254 is in pit A12.',
    };

    // [tool, arguments, mocked TBA response, expected TBA path]
    const cases: Array<[string, Record<string, unknown>, unknown, string]> = [
      [
        'get_district_history',
        { district_abbreviation: 'fma' },
        [
          {
            abbreviation: 'mar',
            display_name: 'FIRST Mid-Atlantic',
            key: '2012mar',
            year: 2012,
            official_advancement_counts: { dcmp: 60, cmp: 20 },
          },
        ],
        '/district/fma/history',
      ],
      [
        'get_district_dcmp_history',
        { district_abbreviation: 'fim' },
        [{ event, awards: [award] }],
        '/district/fim/dcmp_history',
      ],
      [
        'get_district_insights',
        { district_abbreviation: 'fim' },
        {
          district_data: { region_data: null, district_wide_data: null },
          team_data: null,
        },
        '/district/fim/insights',
      ],
      [
        'get_district_advancement',
        { district_key: '2025fim' },
        {
          teams: {
            frc67: { dcmp: true, cmp: true, cmp_qualification: 'dcmp_winner' },
          },
          cutoffs: null,
        },
        '/district/2025fim/advancement',
      ],
      [
        'get_district_awards',
        { district_key: '2025fim' },
        [award],
        '/district/2025fim/awards',
      ],
      [
        'get_event_advancement_points',
        { event_key: '2025casj' },
        eventPoints,
        '/event/2025casj/advancement_points',
      ],
      [
        'get_event_coprs',
        { event_key: '2025casj' },
        { 'L1 Coral Count': { frc254: 1.5, frc604: -0.25 } },
        '/event/2025casj/coprs',
      ],
      [
        'get_event_practice_matches',
        { event_key: '2025casj' },
        [practiceMatch],
        '/event/2025casj/matches/practice',
      ],
      [
        'get_event_practice_matches_simple',
        { event_key: '2025casj' },
        [practiceMatch],
        '/event/2025casj/matches/practice/simple',
      ],
      [
        'get_event_practice_matches_keys',
        { event_key: '2025casj' },
        ['2025casj_pm1'],
        '/event/2025casj/matches/practice/keys',
      ],
      [
        'get_event_media',
        { event_key: '2025casj' },
        [
          {
            type: 'youtube',
            foreign_key: 'DznKfLswxKA',
            details: {},
            team_keys: [],
          },
        ],
        '/event/2025casj/media',
      ],
      [
        'get_event_nexus_info',
        { event_key: '2026cmptx' },
        {
          data_as_of_ms: 1745000000000,
          now_queueing: { match_key: '2026cmptx_qm5', match_name: 'Qual 5' },
          matches: {
            '2026cmptx_qm5': {
              label: 'Qualification 5',
              status: 'Now queuing',
              played: false,
              times: {
                estimated_queue_time_ms: 1745000000000,
                estimated_start_time_ms: null,
              },
            },
          },
          pit_map: null,
        },
        '/event/2026cmptx/nexus_info',
      ],
      [
        'get_event_playoff_advancement',
        { event_key: '2025casj' },
        [
          {
            level: 'f',
            level_name: 'Finals',
            type: 'best_of_3',
            rankings: [
              {
                team_keys: ['frc254', 'frc604', 'frc1678'],
                alliance_name: 'Alliance 1',
                alliance_color: 'red',
                record: { wins: 2, losses: 0, ties: 0 },
                matches_played: 2,
                sort_orders: [2],
                extra_stats: [1],
              },
            ],
            sort_order_info: [{ name: 'Wins', type: 'int', precision: 0 }],
            extra_stats_info: [],
          },
        ],
        '/event/2025casj/playoff_advancement',
      ],
      [
        'get_event_regional_champs_pool_points',
        { event_key: '2025casj' },
        eventPoints,
        '/event/2025casj/regional_champs_pool_points',
      ],
      [
        'get_event_teams_statuses',
        { event_key: '2025casj' },
        { frc254: teamStatus, frc9999: null },
        '/event/2025casj/teams/statuses',
      ],
      [
        'get_insights_leaderboards',
        { year: 0 },
        [
          {
            name: 'typed_leaderboard_blue_banners',
            year: 0,
            data: {
              key_type: 'team',
              rankings: [{ value: 90, keys: ['frc254'] }],
            },
          },
        ],
        '/insights/leaderboards/0',
      ],
      [
        'get_insights_notables',
        { year: 2025 },
        [
          {
            name: 'notables_hall_of_fame',
            year: 2025,
            data: { entries: [{ team_key: 'frc254', context: ['2004cmp'] }] },
          },
        ],
        '/insights/notables/2025',
      ],
      ['get_insights', { year: 2025 }, [insightV2], '/insights/2025'],
      [
        'get_insights_by_category',
        { year: 2025, category: 'leaderboard' },
        [insightV2],
        '/insights/2025/leaderboard',
      ],
      [
        'get_insights_for_district',
        { year: 2025, district_abbreviation: 'fim' },
        [{ ...insightV2, district_abbreviation: 'fim' }],
        '/insights/2025/district/fim',
      ],
      [
        'get_insights_for_district_by_category',
        { year: 0, category: 'streak', district_abbreviation: 'ne' },
        [],
        '/insights/0/streak/district/ne',
      ],
      [
        'get_regional_advancement',
        { year: 2025 },
        {
          frc4481: {
            cmp: true,
            cmp_status: 'EventQualified',
            qualifying_event: '2025camb',
            qualifying_award_name: 'Regional Winners',
          },
        },
        '/regional_advancement/2025',
      ],
      [
        'get_regional_rankings',
        { year: 2025 },
        [
          {
            team_key: 'frc4481',
            rank: 1,
            point_total: 194,
            rookie_bonus: 0,
            single_event_bonus: 0,
            adjustments: 0,
            event_points: [],
          },
        ],
        '/regional_advancement/2025/rankings',
      ],
      [
        'get_sponsors',
        {},
        {
          sponsors: [
            {
              name: 'AndyMark',
              url: 'https://www.andymark.com/',
              logo_style: 'wordmark',
              logo_url: null,
              logo_url_dark: null,
            },
          ],
        },
        '/sponsors',
      ],
      [
        'get_team_events_all_simple',
        { team_key: 'frc254' },
        [eventSimple],
        '/team/frc254/events/simple',
      ],
      [
        'get_team_events_all_keys',
        { team_key: 'frc254' },
        ['1999ca', '2025casj'],
        '/team/frc254/events/keys',
      ],
    ];

    it.each(cases)('should handle %s', async (name, args, response, path) => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      } as Response);

      const result = await handleToolCall(name, args);

      expect(result.isError).toBeUndefined();
      expect(mockFetch.mock.calls[0]?.[0]).toBe(
        `https://www.thebluealliance.com/api/v3${path}`,
      );
      expect(JSON.parse(result.content[0]!.text)).toEqual(response);
    });

    it.each([
      'get_event_advancement_points',
      'get_event_coprs',
      'get_event_nexus_info',
      'get_event_regional_champs_pool_points',
    ])('should pass through a null response from %s', async (name) => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const result = await handleToolCall(name, { event_key: '2025cc' });

      expect(result.isError).toBeUndefined();
      expect(result.content[0]!.text).toBe('null');
    });

    it('should reject an unknown insight category before calling TBA', async () => {
      const result = await handleToolCall('get_insights_by_category', {
        year: 2025,
        category: 'records',
      });

      expect(result.isError).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should reject an uppercase or year-prefixed district abbreviation', async () => {
      for (const district_abbreviation of ['FIM', '2025fim']) {
        const result = await handleToolCall('get_district_history', {
          district_abbreviation,
        });
        expect(result.isError).toBe(true);
        expect(result.content[0]!.text).toContain('District abbreviation');
      }
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should drop base64 avatar images from get_event_team_media', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            type: 'avatar',
            foreign_key: 'avatar_2025_frc254',
            details: { base64Image: 'iVBORw0KGgo=' },
            team_keys: ['frc254'],
          },
          {
            type: 'imgur',
            foreign_key: 'abc123',
            details: {},
            team_keys: ['frc604'],
          },
        ],
      } as Response);

      const result = await handleToolCall('get_event_team_media', {
        event_key: '2025casj',
      });

      expect(mockFetch.mock.calls[0]?.[0]).toBe(
        'https://www.thebluealliance.com/api/v3/event/2025casj/team_media',
      );
      expect(JSON.parse(result.content[0]!.text)).toEqual([
        {
          type: 'avatar',
          foreign_key: 'avatar_2025_frc254',
          details: {},
          team_keys: ['frc254'],
        },
        {
          type: 'imgur',
          foreign_key: 'abc123',
          details: {},
          team_keys: ['frc604'],
        },
      ]);
    });

    it('should filter the search index by query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          teams: [
            { key: 'frc1254', nickname: 'Entropy' },
            { key: 'frc254', nickname: 'The Cheesy Poofs' },
            { key: 'frc604', nickname: 'Quixilver' },
          ],
          events: [
            { key: '2025casj', name: 'Silicon Valley Regional' },
            { key: '2025cc', name: 'Chezy Champs' },
          ],
        }),
      } as Response);

      const result = await handleToolCall('get_search_index', {
        query: '254',
      });

      expect(mockFetch.mock.calls[0]?.[0]).toBe(
        'https://www.thebluealliance.com/api/v3/search_index',
      );
      expect(JSON.parse(result.content[0]!.text)).toEqual({
        teams: [
          { key: 'frc254', nickname: 'The Cheesy Poofs' },
          { key: 'frc1254', nickname: 'Entropy' },
        ],
        total_matching_teams: 2,
        events: [],
        total_matching_events: 0,
      });
    });

    it('should cap search results at 25 per list and report totals', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          teams: Array.from({ length: 30 }, (_, i) => ({
            key: `frc${i + 1}`,
            nickname: `Robo Team ${i + 1}`,
          })),
          events: Array.from({ length: 3 }, (_, i) => ({
            key: `2025robo${i}`,
            name: `Robo Event ${i}`,
          })),
        }),
      } as Response);

      const result = await handleToolCall('get_search_index', {
        query: 'ROBO',
      });

      const parsed = JSON.parse(result.content[0]!.text);
      expect(parsed.teams).toHaveLength(25);
      expect(parsed.total_matching_teams).toBe(30);
      expect(parsed.events).toHaveLength(3);
      expect(parsed.total_matching_events).toBe(3);
    });

    it('should reject a search query shorter than 2 characters', async () => {
      const result = await handleToolCall('get_search_index', { query: ' a ' });

      expect(result.isError).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('executeTool', () => {
    const getTeam = tools.find((tool) => tool.name === 'get_team')!;

    it('should request the tool endpoint and return pretty-printed JSON', async () => {
      const mockTeam = { key: 'frc86', team_number: 86, name: 'Resistance' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeam,
      } as Response);

      const result = await executeTool(getTeam, { team_key: 'frc86' });

      expect(mockFetch.mock.calls[0]?.[0]).toBe(
        'https://www.thebluealliance.com/api/v3/team/frc86',
      );
      expect(result.isError).toBeUndefined();
      expect(result.content).toEqual([
        { type: 'text', text: JSON.stringify(mockTeam, null, 2) },
      ]);
    });

    it('should return network failures as error results', async () => {
      mockFetch.mockRejectedValueOnce(new Error('socket hang up'));

      const result = await executeTool(getTeam, { team_key: 'frc86' });

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: socket hang up' }],
        isError: true,
      });
    });
  });
});
