# Independent review record

Reviews are scoped evidence, not blanket phase or final approval. Requested model was gpt-6.1-sol; actual model/token telemetry is unavailable.

## P1 - parity_harness, medium

Read-only review of application camera/dimensions/data against before snapshot. Reviewer authored initial tests, not P1 application code. First review requested changes for successful empty arrays, invalid coordinates, and same-ID coordinate refresh. Root reproduced all three in review-before, repaired them in cycle8, and review-after passed those cases. Follow-up found C06 empty selection removed HUD but retained inspect mode. empty-mode-before reproduced it; cycle15 and empty-mode-after passed desktop/mobile mode and pitch assertions.

Final scoped message: approved for the reported P1 defects, no additional actionable finding in the reread. Full out-of-order geocoder and pending-flight/zoom coverage still unproven. This is not final catalogue approval.

## P2-P5 - parity_planner, high

Reviewer authored earlier P1 camera candidate and explicitly excluded P1 from independent approval. Reviewed root geometry, shared GL, UI, media and screenshots. Synthetic prototype accepted visually for visible negative cavity, shared profile and opaque blocker. Full actual road/data gates were not approved by synthetic evidence.

Requested changes: camera framing ignores width, FileReader completion overrides new selection, image failure produces fabricated analysis, and real-road fixture anchor lacks verification. Root reproduced failures; review-after passed dimension-aware framing and image sequencing/load cases. Re-review found missing 2D canvas fallback; canvas-before reproduced it, cycle14 rejects that branch, integrated-candidate passed both viewport cases.

Mapped anchor source membership was independently verified from public OSM XML. Damage remains synthetic. Final four-bearing mapped-road visual review pending cycle16 verifier diagnosis.

## Gates still open

Performance uses frozen candidates and has not yet run. Integrated full suite had62passed/2mapped-road wait failures, while the subsequent targeted empty-mode repair passed2cases. Final success needs the remaining evidence and coverage audit, not addition of these counts as if one suite passed.

## Cycle 16 follow-up - parity_harness, medium

Read-only review confirmed two different interaction failures: direct zoomIn/zoomOut bypass the mode-aware camera policy and cancel the 2D transition; map._popups is not available in installed MapLibre and therefore invalidates the M03 probe. No fix or threshold change was made. Use the existing popup ref or DOM identity, then compare the popup rectangle bottom midpoint relative to the map container against map.project(anchor) plus [0, -28], within the unchanged 2 CSS px tolerance. Comparing internal _pos to the same projection would not independently verify DOM placement.

The reviewer recommends deferring performance V3 until renderer and C02 corrections have passed. A new frozen candidate will be required. Four interaction checks passed, four failed; final review remains request_changes.

## Cycle22 - parity_planner, high

Read-only review of material/shared-layer source and14saved closeinspection/blocker/orbit images: scoped approval, with physical/profile/query/disposal compatibility checked against installedr170. Supplemental actual-city desktop comparison identifies more jagged AA-disabled building silhouettes; layout/readability remain intact. No whole-city quality approval or benchmark verdict inferred. Full report: harness/CYCLE22-REVIEW.md. Separate source feasibility: harness/CYCLE23-FEASIBILITY.md. Later verified82-case/V6results supersede earlier execution statuses, not reviewer scope.
