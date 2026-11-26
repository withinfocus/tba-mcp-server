---
name: check-scouting-data
description: Use when an FRC team shares its own scouting data (a CSV, a pasted table, or a Google Sheet export) and wants it checked, for example "check our scouting data against TBA", "which matches should we re-watch?", "did our scouts get the teams right?" or "how accurate are our scouts?". Compares the data with The Blue Alliance's official schedule and score breakdowns and lists suspect rows, without changing the data.
---

# Check scouting data

Compare the user's scouting data with TBA's official match records, and list the rows and matches worth a second look. Report problems only; never edit, drop or "fix" the user's data.

Reference files (read when you need the detail):

- `references/scouting-data-formats.md`: normalizing team numbers, match labels and stations from common scouting apps.
- `references/score-breakdown.md`: per-robot and per-alliance fields, and how fouls are recorded.
- `references/tba-keys.md`: match key formats.
- `references/tba-data-variants.md`: fetching many matches without flooding context.

## Pick the mode

Decide from the request, then keep the mode for the rest of the conversation unless the user changes it.

- Coach mode: "what should we fix?", "which scouts need help?", "what should we re-watch first?"
- Analyst mode: "show me the mismatches", "list the problems", "give me the numbers".
- If it isn't clear, ask once: "Do you want a prioritized re-watch list with notes on scouting habits, or just the full list of mismatches?"

## Steps

1. Read the data and map its columns: scout name, match, station, team, and the scouted fields. Use `references/scouting-data-formats.md`. If a column's meaning is ambiguous (for example "climb" could be a yes/no or a level, or "pieces" could be auto or total), ask before guessing. Confirm the event key.
2. Normalize each row to a match key, alliance color, station index and team key. Keep the user's original row number so every finding can point back to it. Rows that can't be normalized go in their own list.
3. Fetch the matches. For a handful of matches, call `get_match` for each. For most of an event, call `get_event_matches` once and immediately reduce it to what you need per match: team keys per station, the per-robot fields, the alliance totals you'll compare, and video keys. Don't keep or quote the raw result.
4. Schedule check: for each row, is the scouted team the team TBA lists at that match, color and station? Flag every row where it isn't, and say who TBA has there. Also flag duplicates (two rows for the same match and station).
5. Per-robot check: where a scouted field matches a per-robot `score_breakdown` field (a `...RobotN` field, such as 2025 `autoLineRobotN` or `endGameRobotN`), compare the row directly with that robot's value. Mismatches here are row-level, so they point at one scout.
6. Totals check: where a scouted field matches an alliance-level field (for example scouted coral per robot against `autoCoralCount` or `teleopCoralCount`), sum the three scouted robots per alliance and compare with TBA. Flag differences bigger than a small tolerance you state (for example 2 pieces or 10%). Only compare when all three robots were scouted.
7. Coverage: list matches and alliances with fewer than three scouted robots, and teams with noticeably fewer scouted matches than they played.
8. Videos: for each suspect match, give the link from the match's `videos` (`https://www.youtube.com/watch?v=<key>` for YouTube entries). `_simple` match variants don't include videos.

## Output

- Summary line: rows checked, matches covered, number of problems by type.
- Suspect matches to re-watch, most serious first: match key, alliance, what's wrong (with the user's row numbers), TBA's value, the scouted value(s), video link.
- Schedule problems: row, scouted team, TBA's team at that station.
- Coverage gaps.
- Rows that couldn't be matched to a TBA match.

### Coach mode

Add a prioritized re-watch list (the few matches that would fix the most data) and, if the data has a scout column, per-scout patterns: how many of each scout's rows had schedule errors or per-robot mismatches, and how often their alliances failed the totals check. Say clearly that one scout's mistake shows up in the whole alliance's total, so per-scout totals error is rough and shouldn't be used to single anyone out. Suggest process fixes (station assignment, team number confirmation) rather than blame. Teams disagree about tracking per-scout accuracy at all: some use it to coach scouts, others avoid it because it can make scouting feel like a test. Mention that and let the user decide.

### Analyst mode

Every finding in tables, grouped by check, with no prioritizing or advice about scouts.

## Caveats to always include

- TBA's alliance totals can't say which robot was wrong, only that the alliance's scouted sum disagrees.
- Some TBA fields are counted differently from what scouts see (for example pieces scored then removed, or points from opponents' fouls). A small, consistent gap may be a definition difference rather than a scouting error.
- Fouls: an alliance's foul counts are fouls it committed; the points go to the opponent (see `references/score-breakdown.md`).
- Field names change every season. If the user's fields don't map to anything in this season's `score_breakdown`, say which ones couldn't be checked.
