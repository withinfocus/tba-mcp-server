import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('MCP Server Performance Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should respond to tool calls within acceptable time limits', async () => {
    const startTime = Date.now();

    await mcpClient.callTool('get_status', {});

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });

  test('should handle concurrent requests efficiently', async () => {
    const startTime = Date.now();

    const promises = [
      mcpClient.callTool('get_status', {}),
      mcpClient.callTool('get_teams', { page_num: 0 }),
      mcpClient.callTool('get_events', { year: 2023 }),
      mcpClient.callTool('get_team_simple', { team_key: 'frc254' }),
      mcpClient.callTool('get_team_simple', { team_key: 'frc148' }),
    ];

    const results = await Promise.all(promises);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000);
    expect(results).toHaveLength(5);

    results.forEach((result) => {
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');
    });
  });

  test('should handle rapid sequential requests', async () => {
    const teams = ['frc254', 'frc148', 'frc1678', 'frc973', 'frc2468'];
    const startTime = Date.now();

    for (const team of teams) {
      const result = await mcpClient.callTool('get_team_simple', {
        team_key: team,
      });
      expect(result.content).toBeInstanceOf(Array);
    }

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(15000);
  });

  test('should maintain stable memory usage during extended operation', async () => {
    const operations = 20;
    const teams = ['frc254', 'frc148', 'frc1678', 'frc973', 'frc2468'];

    for (let i = 0; i < operations; i++) {
      const teamKey = teams[i % teams.length];

      const result = await mcpClient.callTool('get_team_simple', {
        team_key: teamKey,
      });

      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');

      const teamData = JSON.parse(result.content[0]?.text || '');
      expect(teamData.key).toBe(teamKey);
    }
  });
});
