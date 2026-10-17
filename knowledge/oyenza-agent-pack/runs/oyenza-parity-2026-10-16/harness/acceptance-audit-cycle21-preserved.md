# Acceptance audit - cycle20 application / cycle21 runner

This audit separates scope-specific evidence from final completion. Latest source hashes are in candidate-cycle20.json. The final cycle20-full suite completed82passed/0failed. FINAL-INDEPENDENT-REVIEW.md gives scoped application/visual approval. V4 setup failure is preserved. V5 completed36valid samples and failed3of6performance groups. Actual-map observation completed2cases with trace overhead; it does not override that failure. Rows retain scoped evidence and limits, not a blanket pass.

| IDs | Evidence in this run | Remaining proof or limitation |
| --- | --- | --- |
| B01 | baseline.json, before/, before.diff, harness fixture hashes and README | Verify all ledger linkage before final handoff. StreetSimulation3D and mockData remain byte-identical to the saved dirty baseline. |
| B02, R01 | harness/build-cycle20.log exit0 | Large production JS chunk warning remains. No commit/push or backend/schema change. |
| B03 | Baseline before/frozen-before images; visual-audit-cycle16 current images | Historical baseline defects remain recorded rather than relabelled passing. |
| C01 | parity.browser report/search/CCTV cases on both viewports | Current cycle20-full rerun passed on both viewports. |
| C02 | interaction.browser zoom in/out during 2D transition; parity reset; secondary reduced-motion reset | Focused cycle17/18 assertions passed. |
| C03-C04 | parity.browser explicit inspect/exit and orbit cancellation | Current cycle20-full rerun passed these existing cases. |
| C05 | races.browser late initial response; review.browser invalid/same-ID coordinates; interaction.browser out-of-order geocoder | These cover specific races, not every possible report/search/CCTV interleaving. Final review must assess remaining scope. |
| C06 | parity filter, review empty response, empty-mode.browser | Targeted and final full candidate mode assertions passed. |
| D01-D02, G01 | dimensions and geometry unit tests | Physical0.52m/0.075m, invalid/zero handling and shared contour sampler covered. |
| D03-D04 | Secondary profile/report flow; image/file/canvas failure tests; source labels | Provenance remains unknown/heuristic/example as appropriate. No measured road width or surveyed occurrence is claimed. |
| G02 | inspection.browser confirms shared canvas; webgl-fallback.browser passed on both viewports | WebGL1 fallback was executed: explicit unavailable status, one canvas and usable2D zoom. |
| G03-G04 | Synthetic blocker/four-bearing geometry; cycle17-camera real mapped-road four bearings | Renderer and corrected mobile framing passed. Independent reviewer inspected all eight real-road images. Real-road source data does not contain surveyed pothole obstruction geometry; controlled blocker verifies depth semantics. |
| G05 | Geometry/lifecycle projection assertions <=2CSSpx | Explicit full-orbit test additionally checks four quadrants, rim visibility and <=2CSSpx anchor drift. All passed on both viewports. |
| G06 | lifecycle style/context recovery; label-restoration-verified2passed | Original visibility restored after zoom, exit and style replacement. |
| L01-L03 | Full20-cycle application lifecycle desktop/mobile; owned resources, listeners, canvas and RAF | GPU total memory and collected heap retention unavailable; do not claim total zero leak. |
| U01-U02 | FINAL-INDEPENDENT-REVIEW.md, cycle20-orbit-complete and cycle20-visual images | Cycle19/20 resolved the reproduced clipping and attribution overlap. Full-turn and DOM hit-test assertions passed; reviewer inspected current pixels and approved the captured states. No exact-parity percentage. |
| U03 | harness/PERFORMANCE-RESULTS.md, V5 result/integrity and REAL-MAP-RESULTS.md | FAILED: desktop orbit1.668x, desktop pan4.958x, mobile orbit2.0x exceed frozen1.20 threshold. Three other groups pass. Actual-map timings are observational with trace overhead. |
| M01, M04 | Static snapshot labels, media source review, no fabricated freshness/provider | No real streaming source is available. Live-stream freshness cannot be claimed or tested as an implemented capability. |
| M02 | layout/secondary dialogs and interaction fullscreen rejection | Device denial leaves usable preview, Escape/focus checked. |
| M03 | cycle18-interactions actual popup DOM anchor after pan/zoom/resize | <=2CSSpx passed both viewports; rapid-camera source replacement still requires full-scope review. |
| A01-A02 | Native modal focus/Escape, profile/comparison keyboard, reduced-motion tests | Focused main flows tested; final manual keyboard sweep not independently approved. |
| R02-R03 | Report mock flow, filter/search, secondary comparison/profile | Mock writes blocked; production backend is not exercised. Source fixture/media limits are explicit. |
| H01-H02 | run.json, immutable evidence directories, ORACLE-NOTES and budgets | Follow-up dispatch history was not completely logged; actual usage/model telemetry unavailable. Do not infer runtime token totals. Baseline25file hashes and current source manifest verified. Bounded ledger/link checks passed; the complete planned executable ledger invariant validator remains absent. Do not claim H01/H02 fully validated. |
| H03 | HANDOFF.md and PROGRESS.md | Handoff records82functional passes, independent scoped approval, V5 performance failure and actual-map observations. |

No row's narrow passing test substitutes for the remaining visual, performance or independent-review requirements. No all-green status is inferred from file presence or build success.
