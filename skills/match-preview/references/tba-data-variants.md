# Choosing data variants

Many TBA tools come in three versions. Pick the smallest one that has what you need, because every tool result goes into context.

| Variant          | What it returns                       | Use it for                                                  |
| ---------------- | ------------------------------------- | ----------------------------------------------------------- |
| `_keys`          | Only keys (`frc254`, `2025casj_qm10`) | Counting, finding what exists, building a list to loop over |
| `_simple`        | Core fields only                      | Rosters, schedules, scores, who played where                |
| Full (no suffix) | Everything                            | Things only the full version has (below)                    |

What only the full version has, checked against live 2025 data:

- Matches: `videos` and `score_breakdown`. `get_event_matches_simple`, `get_team_event_matches_simple` and `get_match_simple` return `alliances` (teams and score), `winning_alliance`, and the times, but no videos and no breakdown.
- Teams: website, rookie year, school and similar profile fields. The `_simple` team has key, number, nickname, name and location, which is enough for a roster.

## Keeping big results out of context

Tool results come back as pretty-printed JSON. Measured sizes at 2025casj (37 teams, 89 matches):

| Call                                            | Size         |
| ----------------------------------------------- | ------------ |
| `get_match` (one match, full)                   | about 7 KB   |
| `get_team_event_matches` (one team, 15 matches) | about 115 KB |
| `get_event_matches` (whole event)               | about 700 KB |
| `get_event_predictions`                         | about 165 KB |
| `get_event_teams_statuses`                      | about 60 KB  |
| `get_event_coprs`                               | about 40 KB  |

Full matches are big because each carries its whole `score_breakdown` (in 2025, a node-by-node map of the reef). Per-robot rates are the most expensive thing to compute, so:

- For per-robot counts on a few teams, list their matches with `get_team_event_matches_keys` and call `get_match` on the recent played ones.
- `get_team_event_matches` is fine for one or two teams, not for a whole list.
- For a cheap estimate across many teams, use the component OPRs of per-robot point fields (see `metrics.md`).
- Avoid `get_event_matches` unless the host can save a large result to a file and process it with code, or the event is small.
- For the schedule, use `get_event_matches_simple` or `get_team_event_matches_simple`.
- For video links for a handful of matches, call `get_match` on just those match keys.
- `get_event_teams_statuses` gives every team's rank, record, alliance and playoff result in one call. Prefer it to calling `get_team_event_status` once per team.
- `get_team_event_statuses` gives one team's status at every event it attended in a year, which is the fastest way to summarize a season.

Whatever you fetch, extract what you need (for example, per-robot fields) and work from that summary rather than quoting raw JSON back to the user.

## Past matches and finished events

TBA answers with everything played so far, which leaks hindsight when the user asks about a match or event that's already over (a review, a practice run on an old event, or the wrong year).

- Check first. A match with a `score_breakdown` or `actual_time` has been played; an event whose `end_date` has passed is over. Say so in the first line of the reply and ask whether they meant another event or year.
- Build the analysis only from matches played before the one being asked about: compare `comp_level` and match number, or `actual_time`. Per-robot counts, records and averages can be rebuilt from those earlier matches.
- `get_event_oprs`, `get_event_coprs`, `get_event_rankings`, `get_event_teams_statuses` and `get_event_alliances` describe the event as it stands now, not as it stood before the match. Leave them out of a preview of a past match, or label them as hindsight. Early in an event few matches exist, so say how many each team had played.
- If the real result is useful, give it in a separate section at the end, clearly marked as what actually happened.

## Data that may be missing

- Events that haven't started have no matches, rankings, OPRs or predictions. Tools return empty lists or `null`.
- `get_event_coprs` and `get_event_predictions` can be empty for some events even after matches start. Fall back to total OPR and `score_breakdown`, and say so.
- Offseason events often have no `score_breakdown` at all.
- `score_breakdown` is `null` for matches that haven't been played.
