// Copies the shared skill references in skills-src/shared/ into every skill's
// references/ folder. Skills can only read files in their own folder, so each
// one carries its own copy. Edit the files in skills-src/shared/ only, then
// run `pnpm run skills:sync`. A unit test fails if any copy drifts.
//
// It then mirrors skills/ into plugin/skills/, because a Claude plugin can
// only ship files inside its own folder (no symlinks). Edit skills/ only.

import { copyFileSync, cpSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const sharedDir = path.join(root, "skills-src", "shared");
const skillsDir = path.join(root, "skills");
const pluginSkillsDir = path.join(root, "plugin", "skills");

const shared = readdirSync(sharedDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

const skills = readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

for (const skill of skills) {
    const references = path.join(skillsDir, skill, "references");
    mkdirSync(references, { recursive: true });
    for (const file of shared) {
        copyFileSync(path.join(sharedDir, file), path.join(references, file));
    }
    console.log(`${skill}: ${shared.length} shared references`);
}

rmSync(pluginSkillsDir, { recursive: true, force: true });
cpSync(skillsDir, pluginSkillsDir, { recursive: true });
console.log(`plugin/skills: ${skills.length} skills`);
