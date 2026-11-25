import { McpServer } from '@modelcontextprotocol/server';
import { executeTool } from './handlers.js';
import { READ_ONLY_API, tools } from './tools.js';

export const SERVER_NAME = 'The Blue Alliance MCP Server';

/**
 * Builds the MCP server with every tool from the `tools` table registered.
 *
 * The server is returned unconnected so callers can extend it (for example
 * attach extensions, which must happen before `connect`) and then connect it
 * to a transport.
 */
export function createServer(version: string): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version });

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

  return server;
}
