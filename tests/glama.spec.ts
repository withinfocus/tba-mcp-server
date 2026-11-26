import { describe, it, expect } from '@jest/globals';
import { readdirSync, readFileSync } from 'node:fs';
import { tools } from '../src/tools.js';

// glama.json is hand-maintained metadata for the Glama directory. These
// checks keep it from drifting when tools, skills or toolchain versions change.
const glama = JSON.parse(readFileSync('glama.json', 'utf8')) as {
  version: string;
  tools: { name: string; description: string }[];
  skills: { name: string; description: string }[];
  requirements: { node: string; pnpm: string };
};
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  version: string;
  packageManager: string;
  engines: { node: string };
};

function major(version: string): string | undefined {
  return /(\d+)/.exec(version)?.[1];
}

describe('glama.json', () => {
  it('should list every tool in the tool table, in order', () => {
    expect(glama.tools.map((tool) => tool.name)).toEqual(
      tools.map((tool) => tool.name),
    );
  });

  it('should give every tool and skill a description', () => {
    for (const entry of [...glama.tools, ...glama.skills]) {
      expect(entry.description.trim()).not.toBe('');
    }
  });

  it('should list every skill', () => {
    const skills = readdirSync('skills', { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    expect(glama.skills.map((skill) => skill.name)).toEqual(skills);
  });

  it('should match the package version', () => {
    expect(glama.version).toBe(packageJson.version);
  });

  it('should require the same Node and pnpm majors as package.json', () => {
    expect(major(glama.requirements.node)).toBe(
      major(packageJson.engines.node),
    );
    expect(major(glama.requirements.pnpm)).toBe(
      major(packageJson.packageManager.replace('pnpm@', '')),
    );
  });
});
