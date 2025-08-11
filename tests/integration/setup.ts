import { test as base } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import path from 'path';
import fs from 'fs';

const SERVER_PATH = path.join(process.cwd(), 'dist/index.js');

function loadEnvFile(): Record<string, string> {
  const envPath = path.join(process.cwd(), '.env');
  const env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key] = valueParts.join('=');
        }
      }
    }
  }

  return env;
}

/**
 * Get the API key from environment variables with fallback
 */
export function getApiKey(): string {
  const envVars = loadEnvFile();
  return process.env['TBA_API_KEY'] || envVars['TBA_API_KEY'] || 'test-api-key';
}

/**
 * Get the server path
 */
export function getServerPath(): string {
  return SERVER_PATH;
}

/**
 * Create and start a new MCP client instance
 */
export async function createMCPClient(): Promise<MCPClient> {
  const client = new MCPClient(SERVER_PATH, {
    TBA_API_KEY: getApiKey(),
  });
  await client.start();
  return client;
}

/**
 * Create, start MCP client and get server info
 */
export async function createAndInitializeMCPClient(): Promise<MCPClient> {
  const client = await createMCPClient();
  await client.getServerInfo();
  return client;
}

export const test = base.extend<{ mcpClient: MCPClient }>({
  // eslint-disable-next-line no-empty-pattern
  mcpClient: async ({}, use) => {
    const client = await createAndInitializeMCPClient();
    await use(client);
    await client.stop();
  },
});

export { expect } from '@playwright/test';
