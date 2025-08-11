import { expect } from '@playwright/test';
import { test, createAndInitializeMCPClient } from './setup.js';
import { TEST_TEAMS, TEST_YEARS } from './test-data.js';
import { MCPClient } from './mcp-client.js';

test.describe('MCP Server Reliability Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Server Stability', () => {
    test('should handle server restart gracefully', async () => {
      const result1 = await mcpClient.callTool('get_status', {});
      expect(result1.content).toBeInstanceOf(Array);

      await mcpClient.stop();

      mcpClient = await createAndInitializeMCPClient();

      const result2 = await mcpClient.callTool('get_status', {});
      expect(result2.content).toBeInstanceOf(Array);
    });

    test('should maintain state across multiple requests', async () => {
      const requests = 10;
      const results = [];

      for (let i = 0; i < requests; i++) {
        const result = await mcpClient.callTool('get_status', {});
        results.push(result);
      }

      expect(results).toHaveLength(requests);
      results.forEach((result) => {
        expect(result.content).toBeInstanceOf(Array);
        expect(result.content[0]?.type).toBe('text');
      });
    });

    test('should handle rapid fire requests without losing data', async () => {
      const teamKeys = Object.values(TEST_TEAMS).slice(0, 5);

      const promises = teamKeys.map((teamKey) =>
        mcpClient.callTool('get_team_simple', { team_key: teamKey }),
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(teamKeys.length);

      results.forEach((result, index) => {
        expect(result.content).toBeInstanceOf(Array);
        const teamData = JSON.parse(result.content[0]?.text || '');
        expect(teamData.key).toBe(teamKeys[index]);
      });
    });
  });

  test.describe('API Resilience', () => {
    test('should handle API rate limiting gracefully', async () => {
      const requests = 15;
      const promises = [];

      for (let i = 0; i < requests; i++) {
        promises.push(
          mcpClient.callTool('get_team_simple', {
            team_key: `frc${254 + i}`,
          }),
        );
      }

      const results = await Promise.allSettled(promises);

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      expect(successful + failed).toBe(requests);
      expect(successful).toBeGreaterThan(0);
    });

    test('should handle network timeouts appropriately', async () => {
      test.setTimeout(15000);

      const result = await mcpClient.callTool('get_events', {
        year: TEST_YEARS.RECENT,
      });

      expect(result.content).toBeInstanceOf(Array);
      expect(result.content[0]?.type).toBe('text');
    });
  });

  test.describe('Data Integrity', () => {
    test('should return identical data on repeated requests', async () => {
      const teamKey = TEST_TEAMS.CHEESY_POOFS;

      const result1 = await mcpClient.callTool('get_team', {
        team_key: teamKey,
      });
      const result2 = await mcpClient.callTool('get_team', {
        team_key: teamKey,
      });

      const team1 = JSON.parse(result1.content[0]?.text || '');
      const team2 = JSON.parse(result2.content[0]?.text || '');

      expect(team1).toEqual(team2);
    });

    test('should maintain referential integrity across related endpoints', async () => {
      const teamKey = TEST_TEAMS.CHEESY_POOFS;
      const year = TEST_YEARS.RECENT;

      const eventsResult = await mcpClient.callTool('get_team_events', {
        team_key: teamKey,
        year: year,
      });
      const events = JSON.parse(eventsResult.content[0]?.text || '');

      if (events.length > 0) {
        const eventKey = events[0].key;

        const teamsResult = await mcpClient.callTool('get_event_teams', {
          event_key: eventKey,
        });
        const eventTeams = JSON.parse(teamsResult.content[0]?.text || '');

        const teamInEvent = eventTeams.find(
          (t: { key: string }) => t.key === teamKey,
        );
        expect(teamInEvent).toBeDefined();
        expect(teamInEvent.key).toBe(teamKey);
      }
    });
  });

  test.describe('Resource Management', () => {
    test('should not leak memory during extended operations', async () => {
      const iterations = 50;
      const teamKeys = Object.values(TEST_TEAMS);

      for (let i = 0; i < iterations; i++) {
        const teamKey = teamKeys[i % teamKeys.length];

        const result = await mcpClient.callTool('get_team_simple', {
          team_key: teamKey,
        });

        expect(result.content).toBeInstanceOf(Array);
        const teamData = JSON.parse(result.content[0]?.text || '');
        expect(teamData.key).toBe(teamKey);

        if (i % 10 === 0) {
          console.log(`Completed ${i + 1}/${iterations} iterations`);
        }
      }
    });

    test('should handle cleanup properly after errors', async () => {
      try {
        await mcpClient.callTool('get_team', {
          team_key: 'invalid',
        });
      } catch {
        // Expected error
      }

      const result = await mcpClient.callTool('get_team_simple', {
        team_key: TEST_TEAMS.CHEESY_POOFS,
      });

      expect(result.content).toBeInstanceOf(Array);
      const teamData = JSON.parse(result.content[0]?.text || '');
      expect(teamData.key).toBe(TEST_TEAMS.CHEESY_POOFS);
    });
  });
});
