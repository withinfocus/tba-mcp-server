import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import { createServer } from '../src/server.js';

/**
 * Connects an SDK client to a fresh server over an in-memory transport, so
 * unit tests exercise the real `tools/list` and `tools/call` paths (schema
 * conversion, input validation, error mapping) without spawning a process.
 */
export async function connectInMemoryClient(): Promise<Client> {
  const server = createServer('0.0.0-test');
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'unit-test-client', version: '1.0.0' });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return client;
}
