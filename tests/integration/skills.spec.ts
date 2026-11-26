import { test, expect } from '@playwright/test';
import { Client } from '@modelcontextprotocol/client';
import { SkillsClient } from '@modelcontextprotocol/client/ext/skills';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { tools as toolTable } from '../../src/tools.js';
import { getApiKey, getServerPath } from './setup.js';

const SCOUTING_SKILLS = [
  'check-scouting-data',
  'match-preview',
  'pick-list',
  'pre-scout-event',
];

async function connect(
  modern: boolean,
  extraEnv: Record<string, string> = {},
): Promise<Client> {
  const client = new Client(
    { name: 'skills-integration-test', version: '1.0.0' },
    modern ? { versionNegotiation: { mode: { pin: '2026-07-28' } } } : {},
  );
  await client.connect(
    new StdioClientTransport({
      command: 'node',
      args: [getServerPath()],
      env: { ...process.env, TBA_API_KEY: getApiKey(), ...extraEnv } as Record<
        string,
        string
      >,
      stderr: 'ignore',
    }),
  );
  return client;
}

test.describe('Scouting skills over stdio', () => {
  test('lists and reads skills on the 2026-07-28 protocol', async () => {
    const client = await connect(true);
    try {
      const skills = new SkillsClient(client);
      expect(skills.supported).toBe(true);

      const { skills: entries } = await skills.list();
      expect(entries.map((s) => s.frontmatter.name).sort()).toEqual(
        SCOUTING_SKILLS,
      );

      const matchPreview = entries.find(
        (s) => s.uri === 'skill://match-preview/SKILL.md',
      );
      expect(matchPreview).toBeDefined();

      const manifest = await skills.read(matchPreview!);
      expect(manifest.verified).toBe(true);
      expect(manifest.text).toContain('## Coach mode');

      const metrics = await skills.read(matchPreview!, 'references/metrics.md');
      expect(metrics.verified).toBe(true);
      expect(new TextDecoder().decode(metrics.bytes)).toContain('OPR');
    } finally {
      await client.close();
    }
  });

  test('legacy clients still get every tool', async () => {
    const client = await connect(false);
    try {
      const { tools } = await client.listTools();
      expect(tools.map((t) => t.name).sort()).toEqual(
        toolTable.map((t) => t.name).sort(),
      );
    } finally {
      await client.close();
    }
  });

  test('TBA_MCP_SKILLS=off serves tools without skills', async () => {
    const client = await connect(true, { TBA_MCP_SKILLS: 'off' });
    try {
      expect(new SkillsClient(client).supported).toBe(false);

      const { tools } = await client.listTools();
      expect(tools).toHaveLength(toolTable.length);
    } finally {
      await client.close();
    }
  });
});
