---
name: pre-scout-event
description: Use when an FRC team is preparing for an upcoming event and wants to know who they'll be playing with and against, for example "we're going to 2025casj next week", "pre-scout our next event" or "which teams at our regional should we watch videos of". Builds a roster of every team's season so far from The Blue Alliance, plus a short list of match videos to watch.
---

# Pre-scout an event

Summarize every team attending an upcoming event from its earlier events this season, and pick out the match videos worth watching. Works on TBA data alone, and gets better with the user's own scouting data from earlier events.

Reference files (read when you need the detail):

- `references/tba-keys.md`: turning team numbers, event names and match labels into keys.
- `references/tba-data-variants.md`: which tool variant to call and how to keep large results small.
- `references/metrics.md`: what OPR means and how far to trust it.
- `references/score-breakdown.md`: per-robot fields such as auto and endgame.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "who should we watch?", "who's dangerous?", "what should we focus on?"
- Analyst mode: "show me", "give me a table", "compare", "just the numbers".
- If it isn't clear, ask once: "Do you want a recommendation (who to watch and a draft tiering) or just the data?"

## Steps

1. Get the event key. If the user gave a name or "our next event", find it with `get_team_events_simple` for their team, or `get_events_simple` for the year. Confirm the event and year if there's any doubt.
2. Get the roster with `get_event_teams_simple` (or `get_event_teams_keys` if you only need keys).
3. For each team, get its season so far with `get_team_event_statuses` for the event's year. Each entry has rank, record, alliance (with `pick`: 0 is captain, 1 is first pick, and so on) and playoff result. Ignore the upcoming event itself and any event with no matches played.
4. For each earlier event that any roster team attended, call `get_event_oprs` once and pull out the roster teams. One call per event covers every team that was there, so don't call it per team.
5. Awards: `get_team_awards` for the year, per team. Keep only notable ones (event winner, finalist, technical awards, Impact, Engineering Inspiration). For a large roster, do this only for the teams you shortlist in step 6.
6. Shortlist the teams that matter most: the strongest by results and OPR, likely alliance partners or opponents the user named, and any team the user asks about. Usually 6–10 teams.
7. Videos: for each shortlisted team, pick two or three recent matches (a playoff match, its best qualification match, and one where it struggled are good choices). Get the links with `get_match` per match key, or `get_team_event_matches` for one team at one event. The `_simple` variants don't include `videos`. YouTube entries have `type: "youtube"` and `key`; the link is `https://www.youtube.com/watch?v=<key>`.
8. Optional, for shortlisted teams only: per-robot auto and endgame rates from `score_breakdown` in `get_team_event_matches` at their most recent event (see `references/score-breakdown.md`).

Tell the user roughly how many calls a big roster needs before starting a long run, and keep raw JSON out of the reply.

## Output

A roster table, one row per team:

| Team | Name | Events so far | Best rank / record | Alliance role | Playoff result | OPR (event) | Notable awards |

Then the video list: team, match, why it's worth watching, link.

### Coach mode

Add:

- A short "watch closely" list (three to six teams) with one line each on why.
- A draft tiering (for example "likely captains", "strong picks", "solid", "unknown") with the rules you used to sort teams, such as "captain or first pick at an earlier event" or "OPR in the top quarter there". Say that a scouting lead should adjust it after watching videos and seeing robots in the pits.

### Analyst mode

Give the roster table sorted by the column the user chose (ask if they care; default to best rank at an earlier event). No recommendations. List the caveats below.

## Caveats to always include

- Robots change between events. Results from weeks ago may not reflect the robot that shows up.
- Early-season and rookie teams may have no history this year. Say "no data yet" for them rather than ranking them low.
- OPR from an earlier event is only comparable within that event; strength of field differs. Don't rank across events on OPR differences of a few points. See `references/metrics.md`.
- This server has no Statbotics EPA. For cross-event strength ratings, suggest statbotics.io.
- TBA can't attribute game pieces to individual robots. What a robot actually scores needs video or scouts.

## With the user's scouting data

If the user shares scouting data from earlier events (CSV, a pasted table, or a sheet export), normalize team numbers to `frcNNNN` keys and merge per-team averages into the roster as extra columns. Say which columns came from their data and which from TBA. Don't change their data.
