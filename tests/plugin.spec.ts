import { describe, it, expect } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const PLUGIN_ROOT = path.resolve('plugin');
const SKILLS_ROOT = path.resolve('skills');

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

function filesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => statSync(path.join(dir, file)).isFile())
    .sort();
}

const packageJson = readJson<{ name: string; version: string }>('package.json');
const manifest = readJson<{
  name: string;
  version: string;
  license?: string;
  icon?: string;
  userConfig: Record<string, { sensitive?: boolean }>;
}>(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'));
const mcpConfig = readJson<{
  mcpServers: Record<
    string,
    { command: string; args: string[]; env: Record<string, string> }
  >;
}>(path.join(PLUGIN_ROOT, '.mcp.json'));
const marketplace = readJson<{
  name: string;
  plugins: { name: string; source: unknown }[];
}>(path.resolve('.claude-plugin', 'marketplace.json'));

describe('Claude plugin', () => {
  it('ships the same skills as the npm package', () => {
    const pluginSkills = path.join(PLUGIN_ROOT, 'skills');
    const expected = filesUnder(SKILLS_ROOT);

    expect(filesUnder(pluginSkills)).toEqual(expected);
    const differing = expected.filter(
      (file) =>
        !readFileSync(path.join(pluginSkills, file)).equals(
          readFileSync(path.join(SKILLS_ROOT, file)),
        ),
    );
    // Run `pnpm run skills:sync` to fix.
    expect(differing).toEqual([]);
  });

  it('tracks the package version', () => {
    expect(manifest.version).toBe(packageJson.version);
  });

  it('runs the matching npm release with skills turned off', () => {
    const server = mcpConfig.mcpServers['tba'];
    expect(server?.command).toBe('npx');
    // The directory rejects unpinned launchers.
    expect(server?.args).toContain(
      `${packageJson.name}@${packageJson.version}`,
    );
    // The plugin ships the skills, so the server must not serve them too.
    expect(server?.env['TBA_MCP_SKILLS']).toBe('off');
  });

  it('asks for the API key as a sensitive setting', () => {
    const server = mcpConfig.mcpServers['tba'];
    expect(server?.env['TBA_API_KEY']).toBe('${user_config.tba_api_key}');
    expect(manifest.userConfig['tba_api_key']?.sensitive).toBe(true);
  });

  it('has what the directory requires', () => {
    expect(manifest.license).toBe('MIT');
    const readme = readFileSync(path.join(PLUGIN_ROOT, 'README.md'), 'utf8');
    const prose = readme.replace(/```[\s\S]*?```/g, '');
    expect(prose.split(/\s+/).filter(Boolean).length).toBeGreaterThan(40);
  });

  it('is listed in the repository marketplace at the latest tag', () => {
    // Publish moves `latest` to each release once npm has it, so installs
    // never run ahead of the package the plugin pins.
    expect(marketplace.plugins).toContainEqual({
      name: manifest.name,
      source: {
        source: 'git-subdir',
        url: 'withinfocus/tba-mcp-server',
        path: 'plugin',
        ref: 'latest',
      },
    });
  });

  it('names the marketplace after this server', () => {
    // Users can register only one marketplace per name, so each server repo
    // (this one, statbotics-mcp-server, ...) needs its own.
    expect(marketplace.name).toBe('tba');
  });

  it('has a listing icon', () => {
    expect(manifest.icon).toBe('./.claude-plugin/icon.png');
    const icon = readFileSync(
      path.join(PLUGIN_ROOT, '.claude-plugin', 'icon.png'),
    );
    // PNG signature, then the IHDR width and height (the directory wants a
    // square of 512-2048 px).
    expect(icon.subarray(1, 4).toString()).toBe('PNG');
    const width = icon.readUInt32BE(16);
    expect(icon.readUInt32BE(20)).toBe(width);
    expect(width).toBeGreaterThanOrEqual(512);
    expect(width).toBeLessThanOrEqual(2048);
  });
});
