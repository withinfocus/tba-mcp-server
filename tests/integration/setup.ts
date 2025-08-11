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

export const test = base.extend<{ mcpClient: MCPClient }>({
  mcpClient: async (_testInfo, use) => {
    const envVars = loadEnvFile();
    const apiKey =
      process.env.TBA_API_KEY || envVars['TBA_API_KEY'] || 'test-api-key';

    const client = new MCPClient(SERVER_PATH, {
      TBA_API_KEY: apiKey,
    });

    await client.start();
    await client.getServerInfo();

    await use(client);

    await client.stop();
  },
});

export { expect } from '@playwright/test';
