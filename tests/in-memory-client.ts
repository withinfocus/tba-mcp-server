import { Client } from '@modelcontextprotocol/client';
import { InMemoryTransport } from '@modelcontextprotocol/server';
import type { SkillCatalog } from '@modelcontextprotocol/server/ext/skills';
import { createServer } from '../src/server.js';

/**
 * Connects an SDK client to a fresh server over an in-memory transport, so
 * unit tests exercise the real `tools/list` and `tools/call` paths (schema
 * conversion, input validation, error mapping) without spawning a process.
 * Pass a skills catalog to serve it through the skills extension.
 */
export async function connectInMemoryClient(
  options: { skills?: SkillCatalog } = {},
): Promise<Client> {
  const server = createServer('0.0.0-test', options);
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'unit-test-client', version: '1.0.0' });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return client;
}
