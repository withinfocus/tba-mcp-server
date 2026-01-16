import { expect } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import { createAndInitializeMCPClient } from './setup.js';
import { test } from './setup.js';

test.describe('MCP Server Error Handling Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createAndInitializeMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test.describe('Invalid Input Validation', () => {
    test('should reject invalid team key formats', async () => {
      const invalidTeamKeys = [
        '86',
        'team86',
        'frcabc',
        'FRC86',
        'frc',
        'frc-86',
        '',
      ];

      for (const invalidKey of invalidTeamKeys) {
        await expect(
          mcpClient.callTool('get_team', {
            team_key: invalidKey,
          })
        ).rejects.toThrow();
      }
    });

    test('should reject invalid years', async () => {
      const invalidYears = [
        1991,
        new Date().getFullYear() + 2,
        -1,
        0,
        2030,
        'abc',
        null,
      ];

      for (const invalidYear of invalidYears) {
        await expect(
          mcpClient.callTool('get_events', {
            year: invalidYear,
          })
        ).rejects.toThrow();
      }
    });

    test('should reject negative page numbers', async () => {
      await expect(
        mcpClient.callTool('get_teams', {
          page_num: -1,
        })
      ).rejects.toThrow();
    });

    test('should handle missing required parameters', async () => {
      await expect(mcpClient.callTool('get_team', {})).rejects.toThrow();
      await expect(mcpClient.callTool('get_events', {})).rejects.toThrow();
      await expect(
        mcpClient.callTool('get_team_events', {
          team_key: 'frc86',
        })
      ).rejects.toThrow();
    });
  });

  test.describe('API Error Scenarios', () => {
    test('should handle non-existent team', async () => {
      await expect(
        mcpClient.callTool('get_team', {
          team_key: 'frc999999',
        })
      ).rejects.toThrow(/TBA API request failed/);
    });

    test('should handle non-existent event', async () => {
      await expect(
        mcpClient.callTool('get_event', {
          event_key: 'invalid_event',
        })
      ).rejects.toThrow(/TBA API request failed/);
    });

    test('should handle non-existent match', async () => {
      await expect(
        mcpClient.callTool('get_match', {
          match_key: 'invalid_match',
        })
      ).rejects.toThrow(/TBA API request failed/);
    });
  });

  test.describe('Tool Not Found', () => {
    test('should handle unknown tool calls', async () => {
      await expect(mcpClient.callTool('unknown_tool', {})).rejects.toThrow(
        /Unknown tool/
      );
    });

    test('should handle tool name typos', async () => {
      await expect(
        mcpClient.callTool('get_tema', {
          team_key: 'frc86',
        })
      ).rejects.toThrow(/Unknown tool/);
    });
  });

  test.describe('Malformed Requests', () => {
    test('should handle requests with extra parameters', async () => {
      const result = await mcpClient.callTool('get_team', {
        team_key: 'frc86',
        extra_param: 'should_be_ignored',
      });

      expect(result.content).toBeInstanceOf(Array);
      const teamData = JSON.parse(result.content[0]?.text || '');
      expect(teamData.key).toBe('frc86');
    });

    test('should handle null parameters', async () => {
      await expect(
        mcpClient.callTool('get_team', {
          team_key: null,
        })
      ).rejects.toThrow();
    });

    test('should handle wrong parameter types', async () => {
      await expect(
        mcpClient.callTool('get_teams', {
          page_num: 'not_a_number',
        })
      ).rejects.toThrow();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle very high page numbers', async () => {
      const result = await mcpClient.callTool('get_teams', {
        page_num: 9999,
      });

      expect(result.content).toBeInstanceOf(Array);
      const teams = JSON.parse(result.content[0]?.text || '');
      expect(teams).toBeInstanceOf(Array);
    });

    test('should handle boundary year values', async () => {
      const result1992 = await mcpClient.callTool('get_events', {
        year: 1992,
      });
      expect(result1992.content).toBeInstanceOf(Array);

      const currentYear = new Date().getFullYear();
      const resultCurrent = await mcpClient.callTool('get_events', {
        year: currentYear,
      });
      expect(resultCurrent.content).toBeInstanceOf(Array);

      const resultNext = await mcpClient.callTool('get_events', {
        year: currentYear + 1,
      });
      expect(resultNext.content).toBeInstanceOf(Array);
    });
  });
});
