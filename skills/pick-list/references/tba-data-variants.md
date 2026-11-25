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

A full match list for one event (`get_event_matches`) is around 380 KB for a 74-match regional, because each match carries its whole `score_breakdown`. Avoid it unless you need breakdowns for every match.

- For one team's matches with breakdowns, use `get_team_event_matches` (about a dozen matches) instead of the whole event.
- For one match, use `get_match`.
- For the schedule, use `get_event_matches_simple` or `get_team_event_matches_simple`.
- For video links for a handful of matches, call `get_match` on just those match keys.
- `get_event_teams_statuses` gives every team's rank, record, alliance and playoff result in one call. Prefer it to calling `get_team_event_status` once per team.
- `get_team_event_statuses` gives one team's status at every event it attended in a year, which is the fastest way to summarize a season.

If you must pull the full event match list, extract what you need (for example, per-robot fields) and work from that summary rather than quoting raw JSON back to the user.

## Data that may be missing

- Events that haven't started have no matches, rankings, OPRs or predictions. Tools return empty lists or `null`.
- `get_event_coprs` and `get_event_predictions` can be empty for some events even after matches start. Fall back to total OPR and `score_breakdown`, and say so.
- Offseason events often have no `score_breakdown` at all.
- `score_breakdown` is `null` for matches that haven't been played.
