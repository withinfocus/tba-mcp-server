# Reading score_breakdown

A full match (`get_match`, `get_team_event_matches`, `get_event_matches`) has `score_breakdown.red` and `score_breakdown.blue`. Most fields are alliance totals. A few are reported per robot, and those are the only per-robot facts TBA has.

## Finding per-robot fields

Per-robot fields end in `Robot1`, `Robot2` and `Robot3`. Find them by that suffix instead of relying on a list of names, because every season's game renames them.

`<field>RobotN` belongs to `alliances.<color>.team_keys[N-1]`. For example, in `2025casj_qm10`:

- `alliances.red.team_keys` is `["frc649", "frc6814", "frc10644"]`.
- `score_breakdown.red.autoLineRobot3` is `"No"`, so `frc10644` didn't leave its starting line in auto in that match.

## Building per-robot rates

For each team, over the matches it played:

1. Find the alliance color and station index from `alliances.<color>.team_keys`.
2. Read each `...RobotN` field for that station.
3. Count outcomes: for example "left the line in 11 of 12 matches" or "deep climb in 7 of 12".

Rules:

- Skip matches where the team was a surrogate (`alliances.<color>.surrogate_team_keys`). Surrogate matches don't count for the team's ranking.
- Report disqualifications (`dq_team_keys`) separately. A DQ is not a robot failure, but it matters for reliability. At 2025casj, three alliance slots were DQs.
- Skip matches with a `null` breakdown (not yet played).
- Give rates as counts ("9 of 12"), not only percentages, so small samples are obvious.

## What TBA cannot tell you

Everything else in `score_breakdown` is per alliance. Game-piece counts (coral, algae, fuel), fouls and most points are totals for three robots. TBA can't say which robot scored which piece, how well a robot defended, or how good its driver is. Only scouts can. When the user asks for these, say so, and use component OPR (see `metrics.md`) as a rough estimate with its caveats.

## Fouls

Checked against every 2025casj match: an alliance's foul count fields count fouls that alliance committed, and the points go to the opponent's `foulPoints`. So a high `foulPoints` for an alliance means its opponents fouled, not that it played cleanly. Foul field names change too (2025 `foulCount` and `techFoulCount`, 2026 `minorFoulCount` and `majorFoulCount`).

## Season notes

Only fields checked against live API data are listed. For any other season, list the `...RobotN` fields from one played match and read their values before building rates.

### 2025 (REEFSCAPE)

Checked against all 2025casj matches.

| Field            | Values seen                                 | Meaning                              |
| ---------------- | ------------------------------------------- | ------------------------------------ |
| `autoLineRobotN` | `Yes`, `No`                                 | Robot left its starting line in auto |
| `endGameRobotN`  | `None`, `Parked`, `ShallowCage`, `DeepCage` | Endgame result                       |

Alliance-level fields worth knowing: `autoCoralCount`, `teleopCoralCount`, `netAlgaeCount`, `wallAlgaeCount`, `endGameBargePoints`, `autoReef` and `teleopReef` (which reef nodes are filled, per alliance), and the bonus flags `autoBonusAchieved`, `coralBonusAchieved`, `bargeBonusAchieved`, `coopertitionCriteriaMet`.

### 2026 (REBUILT)

Checked against 2026casgv and 2026casac.

| Field                | Values seen      | Meaning                        |
| -------------------- | ---------------- | ------------------------------ |
| `autoTowerRobotN`    | `None`, `Level1` | Tower level reached in auto    |
| `endGameTowerRobotN` | `None`, `Level1` | Tower level reached in endgame |

At those two events almost every value was `None`, so other levels may exist that weren't seen. Check a few matches at the user's event before treating `None` as "didn't climb". Fuel is reported per alliance only (`hubScore`, and component OPRs such as "Hub Total Fuel Count").
