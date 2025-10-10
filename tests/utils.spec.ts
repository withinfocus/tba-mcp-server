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

describe('Utility functions', () => {
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
});
