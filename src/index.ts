#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

/**
 * Initializes and starts the MCP server for handling commands.
 *
 * @async
 * @returns {Promise<void>}
 */
async function runServer(): Promise<void> {
  console.error('The Blue Alliance MCP Server starting ...');
  const server = new Server(
    {
      name: 'The Blue Alliance MCP Server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('The Blue Alliance MCP Server running on stdio');
}

// Only run the server if this file is executed directly
// Check if this is the main module by comparing file paths
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule) {
  runServer().catch((error) => {
    console.error('Fatal error running server:', error);
    process.exit(1);
  });
}
