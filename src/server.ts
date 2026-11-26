import { McpServer } from '@modelcontextprotocol/server';
import type { SkillCatalog } from '@modelcontextprotocol/server/ext/skills';
import { executeTool } from './handlers.js';
import { READ_ONLY_API, tools } from './tools.js';

export const SERVER_NAME = 'The Blue Alliance MCP Server';

/**
 * Short guidance for clients, including ones without the Skills extension.
 * Some clients load this into every conversation, so it stays brief.
 */
export const SERVER_INSTRUCTIONS =
  'Data from The Blue Alliance for FIRST Robotics Competition teams, events and matches. ' +
  'It can help scouting teams pre-scout an event, brief a qualification match, build a pick list, and check their own scouting data against official match results. ' +
  'OPR needs about 5-6 matches per team before it means much, and carries an error of roughly 15 points. ' +
  'TBA cannot attribute game pieces to individual robots; only scouts can.';

/**
 * Builds the MCP server with every tool from the `tools` table registered,
 * and the skills extension attached when a catalog is given.
 *
 * The server is returned unconnected so callers can extend it further (for
 * example attach other extensions, which must happen before `connect`) and
 * then connect it to a transport.
 */
export function createServer(
  version: string,
  options: { skills?: SkillCatalog } = {},
): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version },
    { instructions: SERVER_INSTRUCTIONS },
  );

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: { ...READ_ONLY_API, title: tool.title },
      },
      (args) => executeTool(tool, args),
    );
  }

  options.skills?.attach(server);

  return server;
}
