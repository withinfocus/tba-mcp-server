# Normalizing scouting data

Scouting apps (ScoutingPASS, custom Google Forms, spreadsheets) export similar data with different column names. Map each column to one of these before checking anything, and ask the user when a mapping isn't obvious.

## Teams

- Columns: `team`, `Team #`, `teamNumber`, `t`, `Team Number`.
- Values: `254`, `frc254`, `Team 254`, sometimes `254 Cheesy Poofs`. Take the leading number and write `frc254`.
- A number that doesn't match any team at the event (`get_event_teams_keys`) is a typo; report it, don't correct it.

## Matches

- Columns: `match`, `Match #`, `matchNumber`, `m`, often with a separate `level` or `matchLevel` column.
- Levels: `qm`, `q`, `Q`, `Qualification`, `quals` all mean qualification (`qm`). `p`, `playoff`, `sf` mean a double-elimination playoff match (`sf<N>m1`); `f`, `final`, `finals` mean the finals (`f1m<N>`). `pm` or `practice` rows are practice matches and can't be checked against qualification data.
- "Q12", "qm12" and a level of `qm` with number `12` are all `<event>_qm12`.
- If the data has no level column, assume qualification only when every number is within the event's qualification count, and say so.

## Stations

- Columns: `station`, `robot`, `position`, `alliance` plus `driverStation`.
- Values: `r1`, `R1`, `Red 1`, `red1`, `Red1`, `1` with a separate `red` column, and the same for blue.
- Red 1 is `alliances.red.team_keys[0]`, Red 2 is index 1, Red 3 is index 2.

## Yes/no and level fields

- Booleans: `1`/`0`, `Y`/`N`, `yes`/`no`, `true`/`false`, `x`/blank.
- Endgame or climb: scouting apps often use their own codes (`p` parked, `s` shallow, `d` deep, `n` none). Ask for the code meanings if they aren't in the column header, then map them to that season's `score_breakdown` values.

## Scouts

- Columns: `scouter`, `scout`, `name`, `initials`. Use them only for per-scout patterns in coach mode, and keep findings about scouts constructive.

## Never edit the data

Normalize into your own working view only. Report every problem against the user's original row number and values, and leave decisions about corrections to them.
