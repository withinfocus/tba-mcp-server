---
name: pick-list
description: Use when an FRC team is getting ready for alliance selection at an event, for example "help with our pick list", "who should we pick?", "who's left for our second pick?", "rank the teams for Saturday" or "who are the backup robots?". Combines The Blue Alliance rankings, OPR, component OPR and per-robot reliability with the team's own scouting data into tiered pick lists.
---

# Pick list

Build tiered first-pick and second-pick lists for alliance selection from TBA data and the user's scouting data. Most useful on the last evening of qualifications, and again live during selection ("who's left?").

Reference files (read when you need the detail):

- `references/pick-list-debates.md`: where strong teams disagree about picking. Read it before giving any recommendation.
- `references/metrics.md`: OPR, component OPR and rankings, with caveats.
- `references/score-breakdown.md`: per-robot reliability from `score_breakdown`.
- `references/tba-keys.md` and `references/tba-data-variants.md`: keys and keeping results small.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "who should we pick?", "build our list", "what's our best option?"
- Analyst mode: "show me the data", "give me a sortable table", "compare these teams".
- If it isn't clear, ask once: "Do you want a recommended list with a mock draft, or the data and tradeoffs to build it yourselves?"

## Ask for scouting data first

Say early, once, that a pick list from TBA alone is weak: TBA can't see per-robot scoring, defense, driving, or how a robot broke. Ask whether they have scouting data (a CSV, a pasted table, or a sheet export) and what their team is looking for in partners. Carry on with TBA data if they don't.

## Steps

1. Get the event key and the user's team. Find the user's current rank, because it decides which picks they're likely to get.
2. Rankings: `get_event_rankings`. Use `sort_order_info` to name the `sort_orders` columns.
3. Every team's status in one call: `get_event_teams_statuses` (rank, record, matches played, and alliance once selection has happened).
4. Ratings: `get_event_oprs` and `get_event_coprs`. Choose the components that match the roles a partner can fill this season (main scoring pieces, auto, endgame). If `get_event_coprs` is empty, say so and use total OPR and per-robot rates.
5. Reliability: for the candidate teams (usually the top 20–24 by your criteria, not the whole event), `get_team_event_matches` at this event, counting `...RobotN` outcomes per team (see `references/score-breakdown.md`). Count DQs separately. Summarize each team as you go; don't keep raw matches in context.
6. Scouting data: if provided, normalize team numbers to `frcNNNN`, average each metric per team, and join it to the TBA data. Prefer scouting data for anything TBA can't attribute to one robot.
7. Build the lists:
   - First-pick list: teams that add the most scoring or fill the role the user's alliance most needs.
   - Second-pick list: teams likely to be available late, chosen for reliability and a complementary role (a dependable climber, a defender, a robot that rarely breaks). Defense quality comes from scouts only.
   - Do-not-pick column: left empty for the user. Never put a team there yourself, even if its data looks bad; that's a judgment for the team's scouts and strategists.

## Output

Tiers, not a strict order, because teams within a few OPR points of each other are statistically tied. For each team: rank, record, matches played, OPR, the chosen component OPRs, reliability counts, scouting averages if any, and one line on its role.

### Coach mode

- A recommended first-pick and second-pick list in tiers, with the weights or rules used stated up front (for example "50% scouted teleop scoring, 30% endgame reliability, 20% auto"). Invite the user to change the weights.
- A mock draft from the current rankings: the top eight are captains and pick in seed order. When a higher seed picks a lower captain, the captains below move up and the next highest-ranked team not yet on an alliance becomes a captain. Second picks usually go in reverse order (8 to 1); check the event's rules. Show who the higher seeds would probably take before the user's turn, so the user sees who will realistically be left.
- A short "where strong teams would disagree" note drawn from `references/pick-list-debates.md`, covering the choices that changed this list (for example, ranking by data instead of by qualification rank).

### Analyst mode

A sortable table of every candidate team with the columns above, plus the criteria a team could sort by and the tradeoffs between them (see `references/pick-list-debates.md`). No recommended order and no mock draft unless asked.

## Caveats to always include

- OPR needs about 5–6 matches per team and has an error of roughly ±15 points. Use tiers, not fine rankings. DPR and CCWM are mostly noise; don't use them to judge defense.
- Qualification rank depends heavily on schedule luck.
- TBA can't tell which robot scored which piece or how well a robot defends. Without scouting data, the list is a starting point only.
- This server has no Statbotics EPA; statbotics.io has it if the user wants another view.

## During and after selection

- "Who's left?": call `get_event_alliances` (or `get_event_teams_statuses`) to see who has been picked, remove them, and show the remaining tiers.
- After selection, the unpicked teams are the backup-robot pool. List them from `get_event_alliances` and the roster (`get_event_teams_keys`), ordered by reliability, since a backup robot is usually called in for a broken one.
