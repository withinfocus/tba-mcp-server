import { test, expect } from '@playwright/test';
import { MCPClient } from './mcp-client.js';
import path from 'path';

const SERVER_PATH = path.join(process.cwd(), 'dist/index.js');

test.describe('TBA MCP Server Integration Tests', () => {
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

  test('should initialize server and return server info', async () => {
    const serverInfo = await mcpClient.getServerInfo();

    expect(serverInfo).toMatchObject({
      protocolVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      capabilities: expect.objectContaining({
        tools: expect.any(Object),
      }),
      serverInfo: expect.objectContaining({
        name: 'The Blue Alliance MCP Server',
        version: '0.1.0',
      }),
    });
  });

  test('should list all available tools', async () => {
    const toolsResponse = await mcpClient.listTools();

    expect(toolsResponse.tools).toBeInstanceOf(Array);
    expect(toolsResponse.tools.length).toBeGreaterThan(0);

    const toolNames = toolsResponse.tools.map(
      (tool: { name: string }) => tool.name,
    );

    const expectedTools = [
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
    ];

    for (const expectedTool of expectedTools) {
      expect(toolNames).toContain(expectedTool);
    }
  });

  test('should validate tool schemas', async () => {
    const toolsResponse = await mcpClient.listTools();

    for (const tool of toolsResponse.tools as Array<{
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
    }>) {
      expect(tool).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        inputSchema: expect.objectContaining({
          type: 'object',
          properties: expect.any(Object),
        }),
      });
    }
  });
});
