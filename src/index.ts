#!/usr/bin/env node

import { createRequire } from 'node:module';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { getApiKey, log } from './utils.js';
import { createServer, SERVER_NAME } from './server.js';
import { loadScoutingSkills, skillsEnabled, skillsRootFor } from './skills.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

async function runServer(): Promise<void> {
  try {
    // Validate API key availability early
    try {
      getApiKey();
    } catch (error) {
      const errorMessage = 'Failed to get TBA API key';
      await log(
        'error',
        `${errorMessage}: ${error instanceof Error ? error.message : error}`,
      );
      throw new Error(errorMessage, { cause: error });
    }

    // Loaded once and shared by every server the factory builds. A missing or
    // broken skills folder is logged and the server starts without skills.
    // TBA_MCP_SKILLS=off skips them (the Claude plugin ships its own copy).
    const serveSkills = skillsEnabled();
    if (!serveSkills) {
      await log('info', 'Skills turned off by TBA_MCP_SKILLS');
    }
    const skills = serveSkills
      ? await loadScoutingSkills(skillsRootFor(import.meta.url))
      : undefined;

    await log('info', 'Setting up transport connection ...');
    try {
      // serveStdio answers both the 2025-era `initialize` handshake and the
      // 2026-07-28 `server/discover` opening, calling the factory once the
      // first message picks the era. Anything that extends the server (such
      // as attaching an extension) belongs in the factory, before it returns.
      serveStdio(() => createServer(version, skills ? { skills } : {}), {
        onerror: (error) => {
          void log('error', `Transport error: ${error.message}`);
        },
      });
      await log('info', `${SERVER_NAME} v${version} running on stdio`);
    } catch (error) {
      const errorMessage = 'Failed to connect to transport';
      await log(
        'error',
        `${errorMessage}: ${error instanceof Error ? error.message : error}`,
      );
      throw new Error(errorMessage, { cause: error });
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
    console.error(
      `${errorMessage}: ${error instanceof Error ? error.message : error}`,
    );
    throw error;
  }
}

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
