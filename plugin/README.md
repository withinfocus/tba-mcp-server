# The Blue Alliance

FIRST Robotics Competition data from [The Blue Alliance](https://www.thebluealliance.com) (TBA), plus four skills for the work a scouting subteam does at an event. This is a community plugin. The Blue Alliance doesn't build or support it.

## What you get

The plugin adds 89 read-only tools covering TBA's API, from 1992 to the current season: teams, events, matches, rankings, alliances, awards, OPRs, media, and more. It also adds four scouting skills:

| Skill                 | Use it                          | What you get                                                                                   |
| --------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `pre-scout-event`     | Before an event                 | Every attending team's season so far, and a short list of match videos to watch                |
| `match-preview`       | During quals or playoffs        | A one-screen brief on the six teams in a match and what to watch for                           |
| `pick-list`           | Before alliance selection       | Tiered first-pick and second-pick lists, and the backup-robot pool after selection             |
| `check-scouting-data` | Any time you have your own data | Matches to re-watch, where your scouting data disagrees with TBA's schedule or score breakdown |

## Setup

1. Install [Node.js](https://nodejs.org) 26 or later. The plugin starts the server with `npx`, which comes with Node.js.
2. Get a free read API key from your account page at [thebluealliance.com/account](https://www.thebluealliance.com/account).
3. Install the plugin and paste the key when Claude asks for it. Claude keeps it in your system's secure credential store. In Claude Code:

   ```text
   /plugin install tba --marketplace withinfocus/tba-mcp-server
   ```

The tools run on your computer, so they work in Claude Code and in Cowork sessions on your computer. Claude chat on the web, desktop, and mobile loads the skills but doesn't start local servers, so the skills there have no TBA data to work with.

## Use it

Ask in your own words. You don't need tool or skill names.

- "We're going to 2025casj. Pre-scout it for us."
- "Brief us on 2025casj_qm10. What should we do?"
- "Help us build our pick list for 2025casj. Here's our scouting CSV."
- "Check this scouting data against TBA and tell us which matches to re-watch."

Each skill has a coach mode, which gives a concrete answer and says where strong teams would disagree, and an analyst mode, which gives you the numbers and leaves the decision to you. Say which you want, or the skill asks.

The skills stick to what TBA can tell you. OPR needs about 5-6 matches per team and carries an error of roughly 15 points, so teams are grouped into tiers instead of ranked on small gaps. TBA can't attribute game pieces to individual robots, and the skills say so instead of guessing.

## Data

- The plugin runs the [`@withinfocus/tba-mcp-server`](https://www.npmjs.com/package/@withinfocus/tba-mcp-server) package from npm on your computer. `npx` downloads it the first time.
- The server sends requests to `www.thebluealliance.com/api/v3` with your API key. Each request names only the team, event, match, district, or year being looked up.
- Scouting data you paste into a conversation stays in that conversation. The plugin doesn't store or send it anywhere.

Source, issues, and the full tool list: [github.com/withinfocus/tba-mcp-server](https://github.com/withinfocus/tba-mcp-server).
