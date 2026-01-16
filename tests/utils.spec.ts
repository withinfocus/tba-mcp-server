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

      expect(mockFetch).toHaveBeenCalled();
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs?.[0]).toBe('https://www.thebluealliance.com/api/v3/test');
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

    it('should construct correct URL with base path', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await makeApiRequest('/status');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://www.thebluealliance.com/api/v3/status',
        expect.any(Object),
      );
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/test')).rejects.toThrow('Network error');
    });

    it('should handle 500 server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/test')).rejects.toThrow(
        'TBA API request failed: 500 Internal Server Error',
      );
    });

    it('should handle 401 unauthorized errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await expect(makeApiRequest('/test')).rejects.toThrow(
        'TBA API request failed: 401 Unauthorized',
      );
    });

    it('should include Accept header in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      await makeApiRequest('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should handle empty response body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      const result = await makeApiRequest('/test');

      expect(result).toBeNull();
    });

    it('should handle array responses', async () => {
      const mockArray = [1, 2, 3];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockArray,
      } as Response);

      const { makeApiRequest } = await import('../src/utils.js');

      const result = await makeApiRequest('/test');

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockArray);
    });
  });

  describe('log function', () => {
    it('should not throw when called without server', async () => {
      const { log } = await import('../src/utils.js');

      await expect(log('info', 'test message')).resolves.not.toThrow();
    });

    it('should handle different log levels', async () => {
      const { log } = await import('../src/utils.js');

      await expect(log('debug', 'debug message')).resolves.not.toThrow();
      await expect(log('info', 'info message')).resolves.not.toThrow();
      await expect(log('notice', 'notice message')).resolves.not.toThrow();
      await expect(log('warning', 'warning message')).resolves.not.toThrow();
      await expect(log('error', 'error message')).resolves.not.toThrow();
    });
  });
});
