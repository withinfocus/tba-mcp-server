import { fileURLToPath } from 'node:url';
import type { SkillCatalog } from '@modelcontextprotocol/server/ext/skills';
import { loadSkills } from '@modelcontextprotocol/server/ext/skills/node';
import { log } from './utils.js';

/**
 * The `skills/` folder at the package root, given the URL of a module one
 * folder below it (`dist/index.js` at runtime). Resolved from the module
 * rather than the working directory, so the server finds its skills however
 * it is launched.
 */
export function skillsRootFor(moduleUrl: string): string {
  return fileURLToPath(new URL('../skills', moduleUrl));
}

/**
 * Whether the server should serve its skills. `TBA_MCP_SKILLS=off` (or
 * `false`, `0`) turns them off. The Claude plugin sets it because the plugin
 * ships the same skills itself, and serving both would list each one twice.
 */
export function skillsEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const value = env['TBA_MCP_SKILLS']?.trim().toLowerCase();
  return !(value === 'off' || value === 'false' || value === '0');
}

/**
 * Loads the scouting skills under `root` into a catalog for the MCP Skills
 * extension. Skill problems are logged as warnings (or thrown under
 * `strict`). Any failure is logged and returns `undefined`, so the server
 * still starts and serves its tools without skills.
 */
export async function loadScoutingSkills(
  root: string,
  options: { strict?: boolean } = {},
): Promise<SkillCatalog | undefined> {
  try {
    return await loadSkills(root, {
      strict: options.strict ?? false,
      onWarning: (warning) => {
        void log('warning', `Skill ${warning.path}: ${warning.message}`);
      },
    });
  } catch (error) {
    await log(
      'error',
      `Failed to load skills from ${root}; continuing without skills: ${
        error instanceof Error ? error.message : error
      }`,
    );
    return undefined;
  }
}
