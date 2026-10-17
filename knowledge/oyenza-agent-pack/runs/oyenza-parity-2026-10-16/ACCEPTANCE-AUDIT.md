# Acceptance audit - cycle22 candidate / V6 performance

Current candidate identity is candidate-cycle22.json. The existing82-case suite and build passed; V6 completed36samples with all6groups inside the unchanged1.20 threshold. Cavity/material review is approved within scope, while the city-edge regression from disabled MSAA remains unresolved. Full acceptance still lacks the concrete subcases in REMAINING-ACCEPTANCE.md. The prior cycle21 audit is preserved under harness/acceptance-audit-cycle21-preserved.md. Historical failures remain evidence of earlier states, not current blanket failures.

| IDs | Evidence in this run | Remaining proof or limitation |
| --- | --- | --- |
| B01 | baseline.json, before/, before.diff, harness fixture hashes and README | Verify all ledger linkage before final handoff. StreetSimulation3D and mockData remain byte-identical to the saved dirty baseline. |
| B02, R01 | harness/build-cycle22-verified.log exit0 | Large production JS chunk warning remains. No commit/push or backend/schema change. |
| B03 | Baseline before/frozen-before images; visual-audit-cycle16 current images | Historical baseline defects remain recorded rather than relabelled passing. |
| C01 | parity.browser report/search/CCTV cases on both viewports | Current cycle22-full rerun passed on both viewports. |
| C02 | interaction.browser zoom in/out during 2D transition; parity reset; secondary reduced-motion reset | Focused cycle17/18 assertions passed. |
| C03-C04 | parity.browser explicit inspect/exit and orbit cancellation | Current cycle22-full rerun passed these existing cases. |
| C05 | races.browser late initial response; review.browser invalid/same-ID coordinates; interaction.browser out-of-order geocoder | These cover specific races, not every possible report/search/CCTV interleaving. Final review must assess remaining scope. |
| C06 | parity filter, review empty response, empty-mode.browser | Targeted and final full candidate mode assertions passed. |
| D01-D02, G01 | dimensions and geometry unit tests | Physical0.52m/0.075m, invalid/zero handling and shared contour sampler covered. |
| D03-D04 | Secondary profile/report flow; image/file/canvas failure tests; source labels | Provenance remains unknown/heuristic/example as appropriate. No measured road width or surveyed occurrence is claimed. |
| G02 | inspection.browser confirms shared canvas; webgl-fallback.browser passed on both viewports | WebGL1 fallback was executed: explicit unavailable status, one canvas and usable2D zoom. |
| G03-G04 | Synthetic blocker/four-bearing geometry; cycle17-camera real mapped-road four bearings | Renderer and corrected mobile framing passed. Independent reviewer inspected all eight real-road images. Real-road source data does not contain surveyed pothole obstruction geometry; controlled blocker verifies depth semantics. |
| G05 | Geometry/lifecycle projection assertions <=2CSSpx | Explicit full-orbit test additionally checks four quadrants, rim visibility and <=2CSSpx anchor drift. All passed on both viewports. |
| G06 | lifecycle style/context recovery; label-restoration-verified2passed | Original visibility restored after zoom, exit and style replacement. |
| L01-L03 | Full20-cycle application lifecycle desktop/mobile; owned resources, listeners, canvas and RAF | GPU total memory and collected heap retention unavailable; do not claim total zero leak. |
| U01-U02 | harness/CYCLE22-REVIEW.md, cycle22-full, PREVIEW-CYCLE22.md | Full-turn, projection, layout and attribution assertions passed. New cavity grid approved; city silhouettes are more jagged with AAfalse. That visual tradeoff remains unresolved. No exact-parity percentage. |
| U03 | harness/PERFORMANCE-V6-RESULTS.md and V6 result/integrity | PASSED for frozen synthetic paired workload:36validsamples,6/6groups, worst1.006 versus1.20. PriorV5 failure retained. Actual-city timing of cycle22 is unmeasured; historical actual-map observations include trace overhead. Not hardwareFPS. |
| M01, M04 | Static snapshot labels, media source review, no fabricated freshness/provider | No real streaming source is available. Live-stream freshness cannot be claimed or tested as an implemented capability. |
| M02 | layout/secondary dialogs and interaction fullscreen rejection | Device denial leaves usable preview, Escape/focus checked. |
| M03 | cycle18-interactions actual popup DOM anchor after pan/zoom/resize | <=2CSSpx passed both viewports; rapid-camera source replacement still requires full-scope review. |
| A01-A02 | Native modal focus/Escape, profile/comparison keyboard, reduced-motion tests | Focused main flows tested; final manual keyboard sweep not independently approved. |
| R02-R03 | Report mock flow, filter/search, secondary comparison/profile | Mock writes blocked; production backend is not exercised. Source fixture/media limits are explicit. |
| H01-H02 | run.json, immutable evidence directories, ORACLE-NOTES and budgets | Follow-up dispatch history was not completely logged; actual usage/model telemetry unavailable. Do not infer runtime token totals. Baseline25file hashes and current source manifest verified. Bounded ledger/link checks passed; the complete planned executable ledger invariant validator remains absent. Do not claim H01/H02 fully validated. |
| H03 | HANDOFF.md and PROGRESS.md | Handoff must reflect82functional passes, V6 timing pass, city-quality finding and remaining keyboard/race/media/traffic/validator gaps. Current diagnostic/verification work is recorded in PROGRESS/run.json. |

No row's narrow passing test substitutes for the remaining visual, performance or independent-review requirements. No all-green status is inferred from file presence or build success.
