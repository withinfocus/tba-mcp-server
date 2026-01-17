#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getApiKey, log } from './utils.js';
import { tools } from './tools.js';
import { handleToolCall } from './handlers.js';

async function runServer(): Promise<void> {
  // Create server first so we can use its logging method
  let server: Server | null = null;

  try {
    // Validate API key availability early
    try {
      getApiKey();
    } catch (error) {
      const errorMessage = 'Failed to get TBA API key';
      await log(
        'error',
        `${errorMessage}: ${error instanceof Error ? error.message : error}`,
        server,
      );
      throw new Error(errorMessage);
    }

    server = new Server(
      {
        name: 'The Blue Alliance MCP Server',
        version: '1.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    await log('info', 'Setting up request handlers ...', server);

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      await log('debug', `Processing tool request: ${name}`, server);

      try {
        return await handleToolCall(name, args);
      } catch (error) {
        const errorMessage = `Tool execution error for '${name}': ${error instanceof Error ? error.message : String(error)}`;
        await log('error', errorMessage, server);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    await log('info', 'Setting up transport connection ...', server);
    try {
      const transport = new StdioServerTransport();
      await server.connect(transport);
      await log(
        'info',
        'The Blue Alliance MCP Server running on stdio',
        server,
      );
    } catch (error) {
      const errorMessage = 'Failed to connect to transport';
      await log(
        'error',
        `${errorMessage}: ${error instanceof Error ? error.message : error}`,
        server,
      );
      throw new Error(errorMessage);
    }

    // Set up error handlers for the server
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception in MCP server:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error(
        'Unhandled rejection in MCP server:',
        reason,
        'at promise:',
        promise,
      );
      process.exit(1);
    });
  } catch (error) {
    const errorMessage = 'Fatal error during server initialization';
    // Use console.error as fallback since server may not be available yet
    console.error(
      `${errorMessage}: ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }
}

// Only run the server if this file is executed directly
// Check if this is the main module by comparing file paths
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule) {
  runServer().catch((error) => {
    console.error(
      `Fatal error running server: ${error instanceof Error ? error.message : error}`,
    );
    console.error(
      `Stack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
    );
    console.error('Server will now exit');
    process.exit(1);
  });
}
