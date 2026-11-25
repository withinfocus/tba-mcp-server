import { describe, it, expect } from '@jest/globals';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { loadScoutingSkills } from '../src/skills.js';
import { tools } from '../src/tools.js';

const SKILLS_ROOT = path.resolve('skills');
const SHARED_ROOT = path.resolve('skills-src/shared');

const skillNames = readdirSync(SKILLS_ROOT).filter((name) =>
  statSync(path.join(SKILLS_ROOT, name)).isDirectory(),
);

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(dir, file));
}

describe('skill content', () => {
  it('shared references are in sync', () => {
    const shared = readdirSync(SHARED_ROOT);
    expect(shared.length).toBeGreaterThan(0);

    const problems: string[] = [];
    for (const skill of skillNames) {
      for (const file of shared) {
        const copy = path.join(SKILLS_ROOT, skill, 'references', file);
        if (!existsSync(copy)) {
          problems.push(`${skill}: references/${file} is missing`);
        } else if (
          !readFileSync(copy).equals(readFileSync(path.join(SHARED_ROOT, file)))
        ) {
          problems.push(`${skill}: references/${file} differs from source`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it('skills only name real tools', () => {
    const known = new Set(tools.map((t) => t.name));
    const unknown = new Set<string>();
    for (const file of [
      ...markdownFiles(SKILLS_ROOT),
      ...markdownFiles(SHARED_ROOT),
    ]) {
      for (const match of readFileSync(file, 'utf8').matchAll(
        /\bget_[a-z_]+\b/g,
      )) {
        if (!known.has(match[0])) {
          unknown.add(`${path.relative('.', file)}: ${match[0]}`);
        }
      }
    }
    expect([...unknown]).toEqual([]);
  });

  it.each(skillNames.length > 0 ? skillNames : ['(none)'])(
    'SKILL.md structure: %s',
    (skill) => {
      if (skill === '(none)') return;
      const text = readFileSync(
        path.join(SKILLS_ROOT, skill, 'SKILL.md'),
        'utf8',
      );
      expect(text.split('\n').length).toBeLessThan(200);

      const frontmatter = /^---\n([\s\S]*?)\n---\n/.exec(text)?.[1] ?? '';
      expect(/^name:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim()).toBe(skill);
      expect(
        /^description:\s*(.+)$/m.exec(frontmatter)?.[1]?.trim() ?? '',
      ).not.toBe('');
      expect(text).toContain('## Coach mode');
      expect(text).toContain('## Analyst mode');
    },
  );

  it('the real catalog loads strictly', async () => {
    await expect(
      loadScoutingSkills(SKILLS_ROOT, { strict: true }),
    ).resolves.toBeDefined();
  });

  it('npm package includes skills', () => {
    const output = execFileSync('pnpm', ['pack', '--dry-run', '--json'], {
      encoding: 'utf8',
      timeout: 60_000,
    });
    const packed = (
      JSON.parse(output) as { files: { path: string }[] }
    ).files.map((f) => f.path);

    for (const skill of [
      'check-scouting-data',
      'match-preview',
      'pick-list',
      'pre-scout-event',
    ]) {
      expect(packed).toContain(`skills/${skill}/SKILL.md`);
    }
    expect(packed).toContain('skills/pick-list/references/metrics.md');
    expect(packed.filter((p) => p.startsWith('skills-src/'))).toEqual([]);
  }, 60_000);
});
