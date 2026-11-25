# TBA keys

Every TBA tool takes keys, not names. Turn whatever the user typed into a key before calling anything.

## Team keys

`frc` plus the team number, no padding: team 254 is `frc254`, team 10644 is `frc10644`.

- "254", "Team 254", "frc254" and "the Cheesy Poofs" all mean `frc254`. For a team name, look it up with `get_event_teams_simple` at the event in question, or ask.
- Never pad with zeros (`frc0254` doesn't exist).

## Event keys

Year plus the event code, lower case: `2025casj` (Silicon Valley Regional 2025), `2025mil` (Milstein division at Championship 2025).

- Event codes are reused across years, so a code without a year is ambiguous. Assume the current season only if the user's context makes that clear; otherwise ask.
- If the user gives an event name or city, find the key with `get_events_simple` for the year, or a team's `get_team_events_simple`.
- Don't guess a key from a city name. Codes are not predictable (`2026casj` does not exist, for example, even though `2025casj` does).

## Match keys

`<event key>_<level><set>m<match>`.

| Level                                     | Key pattern                        | Example          | Notes                                                                                                              |
| ----------------------------------------- | ---------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| Qualification                             | `qm<N>`                            | `2025casj_qm10`  | Set is omitted. "Quals 10", "Q10", "qm10" and "match 10" all mean this.                                            |
| Playoff (double elimination, 2023 onward) | `sf<N>m1`                          | `2025casj_sf7m1` | Every bracket match is its own set, numbered 1–13 in bracket order, and each has one match (`m1`), except replays. |
| Finals                                    | `f1m<N>`                           | `2025casj_f1m2`  | Best of three, so `f1m1` to `f1m3`.                                                                                |
| Older bracket events (2022 and before)    | `qf<S>m<N>`, `sf<S>m<N>`, `f1m<N>` | `2022casj_qf2m3` | Best-of-three sets.                                                                                                |

"Playoff match 7" or "M7" at a double-elimination event is `sf7m1`. If the user says "semifinal 2" at a double-elimination event, ask which bracket match they mean, because the bracket has no semifinals in the old sense.

Team status results (`get_team_event_status`, `get_event_teams_statuses`) report a team's playoff round as `double_elim_round` ("Round 2", "Finals"), and `last_match_key` and `next_match_key` give exact keys.

Practice matches have their own tools (`get_event_practice_matches_simple`) and don't count for rankings or OPR.

## District keys

Year plus the district code: `2025pnw`, `2025fim`, `2025ne`. List a year's districts with `get_districts`.

## Alliance positions

A match's `alliances.red.team_keys` and `alliances.blue.team_keys` are in station order: index 0 is Red 1 or Blue 1, index 1 is station 2, index 2 is station 3. Scouting apps often write stations as "R1", "Red 1", "red1" or "B3".

In `get_event_alliances`, each alliance's `picks` list starts with the captain, then the first pick, then the second pick (and a third at events that use one). A team status's `alliance.pick` uses the same numbering: 0 is captain.
