# Mapped road render failure - cycle 16

Status: failed, actual application rendering exception identified. No application files changed by this task. Assigned writer: /root/parity_planner, tests/mapped-road.browser.spec.ts only. Root owns the budget and phase verdict.

The original wait blocked inside a Promise awaiting MapLibre `render` after changing bearing from -17 to 0. A bounded poll now requires both requested bearing (including normalized wrap) and a strictly newer cavity renderCount. It preserves the four-bearing criterion and records state before/after. The diagnostic did not turn a failed render into a passing test.

## Commands and results

- `PW_OUTPUT=knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/mapped-road-diagnostic node node_modules/@playwright/test/cli.js test tests/mapped-road.browser.spec.ts --project=desktop --project=mobile` - exit 1, 0 passed / 2 failed at bearing 0. Both changed camera bearing successfully, but rendered no newer cavity frame within 10 seconds.
- `PW_OUTPUT=knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/mapped-road-diagnostic/direct-probe node node_modules/@playwright/test/cli.js test tests/mapped-road.browser.spec.ts --project=desktop` - exit 1, 0 passed / 1 failed at the same strict poll. Additional direct `_render(0)` inside try/catch captured the swallowed exception, not used to satisfy any assertion.

Desktop first diagnostic: renderCount 9 before/after; mobile: 15 before/after. Pose changed -17 to 0. Map was not removed, WebGL context was not lost, no frame request remained pending. Source/style readiness was true. The same validated OSM anchor and 0.52 m / 0.075 m dimensions remained present.

## Actual exception

The `direct-render-diagnostic-0` attachment in `direct-probe/results.json` records:

```text
TypeError: Cannot read properties of undefined (reading '_mult')
  at Mt (node_modules/.vite/deps/maplibre-gl.js:11483:25)
  at Tt (...:11397:194)
  at Ft.placeCollisionCircles (...:11514:511)
  at Gt.placeLayerBucketPart (...:11787:91)
  at de._updatePlacement (...:12697:466)
  at Map._render (...:17273:611)
```

Installed source correspondence:

- `node_modules/maplibre-gl/src/symbol/projection.ts:798`: `currentLineSegment._mult(...)` in `placeGlyphAlongLine`. The segment has not been initialized. The loop at line 747 can be skipped when `absOffsetX` is NaN; exact originating label/value has not been instrumented and remains unknown.
- `node_modules/maplibre-gl/src/symbol/collision_index.ts:224`: collision-circle placement calls `projection.placeFirstAndLastGlyph` for line-aligned symbols.
- `node_modules/maplibre-gl/src/ui/map.ts:3150` region: `_updatePlacement` runs before `painter.render`, so the exception prevents both the cavity frame and the subsequent render event.
- `node_modules/maplibre-gl/src/ui/map.ts:3284-3288`: scheduled `_render` runs in a Promise with an empty catch. This explains why there were no page errors and why the original event wait hung.

The failure is in extreme-close real-map symbol placement, before cavity drawing. It is not evidence of an incorrect cavity profile or a lost shared context. Synthetic fixtures do not contain these road labels and therefore do not reproduce it.

## Bounded options for root

1. Suppress line-placement symbol labels during close inspection and restore their prior visibility on exit/style reload. Preserve normal navigation labels and all physical geometry. This is the smallest candidate workaround, requires an explicitly allocated app repair and unchanged mapped-road tests.
2. Set an inspection-specific maximum zoom for affected symbol labels, retaining map/cavity zoom. Verify labels at ordinary zoom and close-view four bearings. This is a style policy variant of option 1.
3. Cap inspection camera zoom until the engine path is avoided, disclosing reduced detail. This may make 0.52 m unreadable and cannot be accepted without the existing readability/geometry gate.

No option was applied. No engine/node_modules patch, assertion relaxation, timeout expansion, baseline rewrite, app edit, commit, push or extra child was performed. Four-bearing mapped-road screenshots remain unavailable because bearing 0 fails. Current results must remain failed. Further app repairs require root/user budget authorization beyond the cycle 16 cap; this diagnosis does not reset that cap.
