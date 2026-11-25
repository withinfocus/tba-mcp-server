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
