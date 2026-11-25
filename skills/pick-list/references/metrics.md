# Metrics and their caveats

## OPR, DPR and CCWM (`get_event_oprs`)

The result has three maps keyed by team: `oprs`, `dprs` and `ccwms`.

- OPR (offensive power rating) estimates how many points a team adds to its alliance's score per match. It's computed by solving for the per-team values that best explain every alliance score at the event.
- DPR estimates points a team "allows" the opponents. CCWM is OPR minus DPR.

Caveats to state whenever you use them:

- OPR needs about 5–6 played matches per team before it settles. Before that, say it's unreliable, or don't use it.
- Even at the end of quals the error is roughly ±15 points (more for high-scoring games). Teams a few points apart are effectively tied. Group teams into tiers instead of ranking on small differences.
- DPR and CCWM are mostly noise. Defense barely shows up in the opponent's score next to random variation. Don't rank teams on them, and say why if the user asks.
- Fouls inflate OPR. Foul points go into alliance totals, so a team whose opponents fouled a lot looks better than it is.
- OPR blends a robot's work with its partners'. A team carried by strong partners, or dragged down by broken ones, is misrated.
- Negative or tiny OPRs mean "contributed little in this model", not literally negative points.

## Component OPR (`get_event_coprs`)

The same calculation, done separately for individual `score_breakdown` fields. The result is an object keyed by component name, each a map of team to value. Component names change every season. 2025casj had, among others, `L1 Coral Count` through `L4 Coral Count`, `Total Coral Count`, `Total Algae Count`, `autoPoints`, `teleopPoints`, `endGameBargePoints` and `foulPoints`. 2026 events have names such as `Hub Total Fuel Count` and `totalTowerPoints`. List the keys before using them.

- Component OPR is the closest TBA gets to per-robot game-piece numbers, but it's an estimate with the same caveats as OPR, and noisier for rare actions.
- `foulPoints` and foul-count components are mostly noise; don't use them to call a team clean or dirty.
- If the result is empty for the event, fall back to total OPR and per-robot `score_breakdown` rates, and tell the user.

## TBA predictions (`get_event_predictions`)

Includes match predictions (`match_predictions.qual` and `.playoff`, each keyed by match key, with `winning_alliance`, `prob`, and a predicted score per alliance) and ranking predictions. They're statistical estimates from earlier matches and are weak early in an event. Some events have none.

## Rankings (`get_event_rankings`)

Each entry has `rank`, `record`, `matches_played`, `dq` and `sort_orders`. The names of the `sort_orders` values are in `sort_order_info` (for 2025: Ranking Score, Avg Coop, Avg Match, Avg Auto, Avg Barge). Rank depends heavily on schedule luck; it's a weak measure of robot strength.

## Statbotics EPA

EPA (Expected Points Added) from statbotics.io is a widely used alternative to OPR that carries information across events. This server doesn't have EPA data. When a user would benefit (early in an event, or comparing teams across events), mention that they can look it up at statbotics.io. Don't invent EPA numbers.
