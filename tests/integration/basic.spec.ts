import { test, expect } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import path from 'path';

const SERVER_PATH = path.join(process.cwd(), 'dist/index.js');

test.describe('Basic MCP Server Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = new MCPClient(SERVER_PATH, {
      TBA_API_KEY: process.env.TBA_API_KEY || 'test-api-key',
    });
    await mcpClient.start();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should start MCP server successfully', async () => {
    const serverInfo = await mcpClient.getServerInfo();
    expect(serverInfo).toBeDefined();
  });

  test('should list tools successfully', async () => {
    const toolsResponse = await mcpClient.listTools();
    expect(toolsResponse.tools).toBeInstanceOf(Array);
    expect(toolsResponse.tools.length).toBeGreaterThan(0);
  });

  test('should get TBA status', async () => {
    const result = await mcpClient.callTool('get_status', {});
    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0].type).toBe('text');

    const status = JSON.parse(result.content[0].text);
    expect(status).toHaveProperty('current_season');
    expect(status).toHaveProperty('max_season');
  });

  test('should get team information', async () => {
    const result = await mcpClient.callTool('get_team', {
      team_key: 'frc254',
    });

    expect(result.content).toBeInstanceOf(Array);
    expect(result.content[0].type).toBe('text');

    try {
      const teamData = JSON.parse(result.content[0].text);
      expect(teamData.key).toBe('frc254');
      expect(teamData.team_number).toBe(254);
      expect(teamData.name).toBeDefined();
    } catch (error) {
      console.log('Response was not JSON:', result.content[0].text);
      if (result.content[0].text.includes('TBA API request failed')) {
        test.skip('API key may be invalid or API is unavailable');
      }
      throw error;
    }
  });
});
