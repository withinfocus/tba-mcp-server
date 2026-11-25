---
name: match-preview
description: Use during qualification or playoff matches at an FRC event when a team wants a briefing on an upcoming match, for example "brief us on qm34", "who are we playing with next?", "our next match" or "scout 2025casj_qm10 for the drive team". Produces a one-screen brief on the six teams in the match from The Blue Alliance data and any scouting data the user shares.
---

# Match preview

A one-screen briefing on one match for the drive team and strategy lead: who the partners and opponents are, what each robot reliably does, and what to watch for.

Reference files (read when you need the detail):

- `references/tba-keys.md`: match keys ("Q34" is `<event>_qm34`, playoff numbering).
- `references/score-breakdown.md`: per-robot fields and how to turn them into rates.
- `references/metrics.md`: OPR, component OPR, predictions and their caveats.
- `references/tba-data-variants.md`: keeping large results out of context.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "what should we do?", "what's our strategy?", "how do we win this?"
- Analyst mode: "show me", "compare the six teams", "give me the numbers".
- If it isn't clear, ask once: "Do you want a suggested strategy, or just the side-by-side data?"

## Steps

1. Find the match.
   - A match key or label ("qm34", "Q34", "playoff 7"): build the key with `references/tba-keys.md`. Ask for the event if you don't know it.
   - "Our next match": ask for the team number if you don't know it, then call `get_team_event_status` and use `next_match_key`. If it's empty, look at `get_team_event_matches_simple` for the first match without a result.
2. Get the six teams and their stations from `get_match_simple`. Our alliance is the one with the user's team, if they have one in the match.
3. Context for all six teams in one call: `get_event_teams_statuses` (rank, record, matches played). If it's not available for the event, use `get_event_rankings`.
4. Ratings: `get_event_oprs` for total OPR, and `get_event_coprs` for component OPR. List the component names first and pick the few that matter for this game (scoring pieces by type, auto, endgame). If `get_event_coprs` is empty, say so and use total OPR and per-robot rates.
5. Per-robot rates: for each of the six teams, `get_team_event_matches` at this event, then count the `...RobotN` outcomes for that team's station in each played match (see `references/score-breakdown.md`). Summarize each team as soon as you've read its matches; don't keep the raw matches around.
6. Prediction (optional): `get_event_predictions` has a win probability and predicted score per match in `match_predictions.qual` or `.playoff`, keyed by match key. The result covers the whole event and is large, so fetch it only when the user wants a prediction, and quote only this match.

## Output

One screen. Lead with the most useful line, not with method.

- Header: match key, scheduled time if known, our alliance color and station.
- Partners: per team, two or three lines covering what it reliably does (auto rate, endgame rate, strongest COPR component) and its rank and record.
- Opponents: the same, plus their likely plan (for example, "two strong scorers and a robot that climbs every match").
- Things to watch: anything that can swing the match, such as a robot that often fails to leave in auto, an opponent with a high endgame rate, or a team with DQs.

### Coach mode

Add a suggested plan for our alliance: who should do what in auto, teleop and endgame, and what to deny the opponents. State the facts each suggestion rests on (for example "reached the deep cage in 11 of 12 matches"), and say that the drive team knows things TBA doesn't (robot changes, repairs, a partner's own plan), so they should confirm it with partners in the queue.

### Analyst mode

A side-by-side table with all six teams, grouped by alliance:

| Alliance | Station | Team | Rank | Record | Played | OPR | Key COPRs | Auto rate | Endgame rate |

Follow it with the prediction if fetched, and the caveats. No strategy.

## Caveats to always include

- If any of the six teams has played fewer than about 5–6 matches at this event, say that its OPR and component OPRs aren't reliable yet, and lean on per-robot rates and scouting instead.
- OPR has an error of roughly ±15 points; treat small gaps as ties.
- TBA can't tell which robot scored which game piece, or how well a robot defends. Component OPR is an estimate of that, not a measurement.
- TBA predictions are statistical and weak early in an event.

## With the user's scouting data

If the user shares their scouting data, use it as the main source for what each robot does (game pieces, defense, driver notes, reliability). Use TBA for objective checks and context: the schedule, scores, per-robot auto and endgame from `score_breakdown`, and OPR. Where the two disagree a lot, point it out. Don't change their data.
