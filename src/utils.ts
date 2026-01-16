import { Server } from '@modelcontextprotocol/sdk/server/index.js';

let API_KEY: string | undefined;

// Logging method that uses MCP server's sendLoggingMessage when available
export async function log(
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error',
  data: unknown,
  server?: Server | null,
  logger?: string
): Promise<void> {
  if (server) {
    try {
      await server.sendLoggingMessage({ level, data, logger });
    } catch {
      // Fallback to console if MCP logging fails
      console.error(data);
    }
  } else {
    // Fallback to console if server not available
    console.error(data);
  }
}

export function getApiKey(): string {
  if (!API_KEY) {
    API_KEY = process.env['TBA_API_KEY'];
    if (!API_KEY) {
      const errorMessage =
        'TBA_API_KEY environment variable is required but not set. Please set the TBA_API_KEY environment variable with your The Blue Alliance API key.';
      log('error', errorMessage).catch(() => console.error(errorMessage));
      throw new Error(errorMessage);
    }
    if (API_KEY.trim() === '') {
      const errorMessage =
        'TBA_API_KEY environment variable is set but empty. Please provide a valid The Blue Alliance API key.';
      log('error', errorMessage).catch(() => console.error(errorMessage));
      throw new Error(errorMessage);
    }
  }
  return API_KEY;
}

export async function makeApiRequest(endpoint: string): Promise<unknown> {
  try {
    const apiKey = getApiKey();
    const url = `https://www.thebluealliance.com/api/v3${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'X-TBA-Auth-Key': apiKey,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorMessage = `TBA API request failed: ${response.status} ${response.statusText} for endpoint ${endpoint}`;
      await log('error', errorMessage);
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = `API request error for endpoint ${endpoint}: ${error.message}`;
      await log('error', errorMessage);
      throw error;
    }
    const errorMessage = `Unknown error during API request for endpoint ${endpoint}`;
    await log('error', `${errorMessage}: ${error}`);
    throw new Error(errorMessage);
  }
}
