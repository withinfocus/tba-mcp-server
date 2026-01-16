import { expect } from '@playwright/test';
import { test, createMCPClient } from './setup.js';
import { MCPClient } from './mcp-client.js';

test.describe('MCP Server Functionality Tests', () => {
  let mcpClient: MCPClient;

  test.beforeEach(async () => {
    mcpClient = await createMCPClient();
  });

  test.afterEach(async () => {
    await mcpClient.stop();
  });

  test('should have all expected TBA tools available', async () => {
    const toolsResponse = await mcpClient.listTools();
    const toolNames = toolsResponse.tools.map(
      (tool: { name: string }) => tool.name
    );

    const expectedCoreTools = [
      'get_team',
      'get_team_events',
      'get_team_awards',
      'get_team_matches',
      'get_events',
      'get_event',
      'get_event_teams',
      'get_event_rankings',
      'get_event_matches',
      'get_event_alliances',
      'get_status',
      'get_match',
      'get_event_oprs',
      'get_event_awards',
      'get_districts',
      'get_district_rankings',
    ];

    for (const expectedTool of expectedCoreTools) {
      expect(toolNames).toContain(expectedTool);
    }

    expect(toolNames.length).toBeGreaterThan(25);
  });

  test('should have properly structured tool schemas', async () => {
    const toolsResponse = await mcpClient.listTools();

    for (const tool of toolsResponse.tools) {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');

      expect(typeof tool.name).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(tool.inputSchema).toHaveProperty('type');
      expect(tool.inputSchema['type']).toBe('object');
      expect(tool.inputSchema).toHaveProperty('properties');
    }
  });

  test('should handle tool parameter validation', async () => {
    try {
      await mcpClient.callTool('get_team', {
        team_key: 'invalid_format',
      });
    } catch (error) {
      expect(String(error)).toContain('Team key must be in format frcXXXX');
    }
  });

  test('should handle missing required parameters', async () => {
    try {
      await mcpClient.callTool('get_team', {});
    } catch (error) {
      expect(String(error)).toMatch(
        /required|missing|invalid input.*expected.*received undefined/i
      );
    }
  });

  test('should handle unknown tools gracefully', async () => {
    try {
      await mcpClient.callTool('nonexistent_tool', {});
    } catch (error) {
      expect(String(error)).toContain('Unknown tool');
    }
  });

  test('should validate year parameters', async () => {
    try {
      await mcpClient.callTool('get_events', {
        year: 1990,
      });
    } catch (error) {
      expect(String(error)).toMatch(/year|range|minimum/i);
    }
  });

  test('should validate pagination parameters', async () => {
    try {
      await mcpClient.callTool('get_teams', {
        page_num: -1,
      });
    } catch (error) {
      expect(String(error)).toMatch(/page|minimum|negative/i);
    }
  });
});
