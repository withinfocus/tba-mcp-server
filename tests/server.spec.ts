import { describe, it, expect } from '@jest/globals';
import { McpServer } from '@modelcontextprotocol/server';
import { createServer, SERVER_NAME } from '../src/server.js';
import { connectInMemoryClient } from './in-memory-client.js';

describe('createServer', () => {
  it('should return an unconnected McpServer', () => {
    const server = createServer('1.2.3');

    expect(server).toBeInstanceOf(McpServer);
    expect(server.isConnected()).toBe(false);
  });

  it('should identify itself and advertise tools', async () => {
    const client = await connectInMemoryClient();
    try {
      expect(client.getServerVersion()).toEqual({
        name: SERVER_NAME,
        version: '0.0.0-test',
      });
      expect(client.getServerCapabilities()?.tools).toBeDefined();
    } finally {
      await client.close();
    }
  });
});
