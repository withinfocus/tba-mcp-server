import { describe, it, expect } from '@jest/globals';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SkillsClient } from '@modelcontextprotocol/client/ext/skills';
import { loadScoutingSkills, skillsRootFor } from '../src/skills.js';
import { tools } from '../src/tools.js';
import { connectInMemoryClient } from './in-memory-client.js';

const fixturesRoot = path.resolve('tests/fixtures/skills');

describe('skillsRootFor', () => {
  it('resolves the skills folder next to the module folder', () => {
    const moduleUrl = pathToFileURL(
      path.resolve('/pkg/dist/index.js'),
    ).toString();

    expect(skillsRootFor(moduleUrl)).toBe(path.resolve('/pkg/skills'));
  });
});

describe('loadScoutingSkills', () => {
  it('loads a catalog from a folder', async () => {
    const catalog = await loadScoutingSkills(fixturesRoot, { strict: true });

    expect(catalog?.entries.map((e) => e.frontmatter.name)).toEqual([
      'demo-skill',
    ]);
  });

  it('returns undefined for a missing folder', async () => {
    await expect(
      loadScoutingSkills('/nonexistent/skills'),
    ).resolves.toBeUndefined();
  });
});

describe('skills over MCP', () => {
  it('serves skills over MCP', async () => {
    const skills = await loadScoutingSkills(fixturesRoot, { strict: true });
    const client = await connectInMemoryClient(skills ? { skills } : {});
    try {
      const listing = await new SkillsClient(client).list();
      expect(listing.skills.map((s) => s.uri)).toEqual([
        'skill://demo-skill/SKILL.md',
      ]);

      const result = await client.readResource({
        uri: 'skill://demo-skill/SKILL.md',
      });
      const first = result.contents[0];
      expect(first && 'text' in first ? first.text : '').toContain(
        'name: demo-skill',
      );
    } finally {
      await client.close();
    }
  });

  it('still lists tools without skills', async () => {
    const client = await connectInMemoryClient();
    try {
      const { tools: listed } = await client.listTools();
      expect(listed).toHaveLength(tools.length);
    } finally {
      await client.close();
    }
  });

  it('advertises scouting instructions', async () => {
    const client = await connectInMemoryClient();
    try {
      const instructions = client.getInstructions() ?? '';
      expect(instructions).toContain('scouting');
      expect(instructions).toContain('OPR');
    } finally {
      await client.close();
    }
  });
});
