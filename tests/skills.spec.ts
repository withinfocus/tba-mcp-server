import { describe, it, expect } from '@jest/globals';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SkillsClient } from '@modelcontextprotocol/client/ext/skills';
import {
  loadScoutingSkills,
  skillsEnabled,
  skillsRootFor,
} from '../src/skills.js';
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

describe('skillsEnabled', () => {
  it('serves skills when TBA_MCP_SKILLS is unset', () => {
    expect(skillsEnabled({})).toBe(true);
  });

  it.each(['off', 'OFF', ' off ', 'false', '0'])(
    'turns skills off for TBA_MCP_SKILLS=%j',
    (value) => {
      expect(skillsEnabled({ TBA_MCP_SKILLS: value })).toBe(false);
    },
  );

  it.each(['on', 'true', '1', ''])(
    'keeps skills on for TBA_MCP_SKILLS=%j',
    (value) => {
      expect(skillsEnabled({ TBA_MCP_SKILLS: value })).toBe(true);
    },
  );
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

describe('scouting skills catalog', () => {
  const realRoot = path.resolve('skills');

  async function servedUris(): Promise<string[]> {
    const catalog = await loadScoutingSkills(realRoot, { strict: true });
    return catalog?.entries.map((e) => e.uri) ?? [];
  }

  it('pre-scout-event is served', async () => {
    expect(await servedUris()).toContain('skill://pre-scout-event/SKILL.md');
  });

  it('match-preview is served', async () => {
    expect(await servedUris()).toContain('skill://match-preview/SKILL.md');
  });

  it('pick-list is served', async () => {
    expect(await servedUris()).toContain('skill://pick-list/SKILL.md');
  });

  it('check-scouting-data is served', async () => {
    expect(await servedUris()).toContain(
      'skill://check-scouting-data/SKILL.md',
    );
  });

  it('serves exactly the four scouting skills', async () => {
    const catalog = await loadScoutingSkills(realRoot, { strict: true });
    expect(catalog?.entries.map((e) => e.frontmatter.name).sort()).toEqual([
      'check-scouting-data',
      'match-preview',
      'pick-list',
      'pre-scout-event',
    ]);
  });
});
