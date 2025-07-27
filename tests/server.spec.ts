import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

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
      
      const { makeApiRequest } = await import('../src/index.js');
      
      await expect(makeApiRequest('/test')).rejects.toThrow('TBA_API_KEY environment variable is required');
    });

    it('should use TBA_API_KEY from environment', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ test: 'data' }),
      } as Response);

      const { makeApiRequest } = await import('../src/index.js');
      
      await makeApiRequest('/test');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.thebluealliance.com/api/v3/test',
        {
          headers: {
            'X-TBA-Auth-Key': 'test-api-key',
            'Accept': 'application/json',
          },
        }
      );
    });
  });

  describe('API Request handling', () => {
    it('should handle successful API responses', async () => {
      const mockData = { key: 'frc86', team_number: 86, name: 'Team Resistance' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      } as Response);

      const { makeApiRequest } = await import('../src/index.js');
      
      const result = await makeApiRequest('/team/frc86');
      
      expect(result).toEqual(mockData);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      const { makeApiRequest } = await import('../src/index.js');
      
      await expect(makeApiRequest('/team/invalid')).rejects.toThrow('TBA API request failed: 404 Not Found');
    });
  });

  describe('Schema validation', () => {
    it('should validate team key format', async () => {
      const { TeamKeySchema } = await import('../src/index.js');
      
      expect(() => TeamKeySchema.parse('frc86')).not.toThrow();
      expect(() => TeamKeySchema.parse('frc1234')).not.toThrow();
      expect(() => TeamKeySchema.parse('86')).toThrow();
      expect(() => TeamKeySchema.parse('team86')).toThrow();
      expect(() => TeamKeySchema.parse('frcabc')).toThrow();
    });

    it('should validate year range', async () => {
      const { YearSchema } = await import('../src/index.js');
      
      expect(() => YearSchema.parse(2023)).not.toThrow();
      expect(() => YearSchema.parse(1992)).not.toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear())).not.toThrow();
      expect(() => YearSchema.parse(1991)).toThrow();
      expect(() => YearSchema.parse(new Date().getFullYear() + 2)).toThrow();
    });

    it('should validate team schema', async () => {
      const { TeamSchema } = await import('../src/index.js');
      
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
      const { EventSchema } = await import('../src/index.js');
      
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
      const { MatchSchema } = await import('../src/index.js');
      
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
});