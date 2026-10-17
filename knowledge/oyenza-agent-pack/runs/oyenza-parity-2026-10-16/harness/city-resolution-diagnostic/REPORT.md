# Actual-city canvas resolution diagnostic

Date/time: 17 October2026, 04:13:18-04:13:44 UTC. Scope: isolated browser diagnostic, not cycle23 application repair or acceptance benchmark. Requested model remains gpt-6.1-sol/high; actual telemetry unavailable.

**Outcome: pixelRatio1.5 visibly improves the AAfalse city edges on both reviewed viewports and is a feasible public-API candidate for further bounded validation. It does not establish visual equivalence to AAtrue or acceptable navigation performance. No application patch was made.**

## Execution and reuse

Command, from the frontend root:

```sh
/home/vereniaes/.nvm/versions/node/v22.23.3/bin/node knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/city-resolution-diagnostic/capture.mjs
```

Exit0, all6captures completed. Script imports existing fixture report/snapshot from tests/fixtures.ts through the installed TypeScript transpiler, reuses the read-only React map-ref discovery pattern from tests/helpers/map.ts, and uses the harness's Chromium/SwiftShader flags. Browser DPR stays1; no trace recording. API routes return the same two fixture reports and block writes; test image assets use the existing static SVG. The actual Positron/vector map remains public OpenFreeMap data, with openmaptiles building features. Constructor AA was overridden only inside each diagnostic browser context's getContext call, before the application created its canvas. The1.5variant then uses the public map.setPixelRatio(1.5) after readiness.

The user server3000 initially returned503 to an HTTP readiness probe and was not touched. The script started its own Vite3006 and closed it in finally. results.json records ownServerExitCode0, browserClosedtrue, userServerUntouchedtrue and matching before/after source hashes. Hashes cover App, Map3D, DamageLayer, damageMaterial, index.css and the reused fixture/helper sources. Source files were read, not edited. Only scratch script/evidence in this directory were written.

All views use center[106.8232,-6.1965], zoom16.5, pitch56 and bearing-17. Desktop viewport1440x900 has map CSS1040x900; mobile viewport390x844 has map CSS390x844 with the existing bottom-sheet padding. Building feature counts match within each viewport across all variants:145 desktop and83 mobile. No page errors or capture exceptions were recorded. Some OpenFreeMap requests ended ERR_ABORTED, recorded in results.json; these can occur during camera/resolution changes or page close. Loaded tile readiness and matched source feature counts support the saved scene comparison; this is not a guarantee that every remote tile/network request was identical.

## Actual context observations

| Variant | Actual AA / SAMPLES | Desktop drawing buffer | Mobile drawing buffer | CSS/map size |
| --- | --- | --- | --- | --- |
| aa-on-native | true /4 |1040x900 |390x844 |1040x900 desktop;390x844 mobile |
| aa-off-native | false /0 |1040x900 |390x844 |unchanged |
| aa-off-ratio15 | false /0 |1560x1350 |585x1266 |unchanged |

All contexts report preserveDrawingBufferfalse, depth/stenciltrue. Thus the1.5capture is actual higher-resolution AAfalse rendering, not an ignored request or hidden MSAA. Browser version, exact context attributes, pose, source IDs, errors and source hashes are in results.json.

## Pixels inspected at native screenshot size

Opened each of `aa-on-native-{1440,390}.png`, `aa-off-native-{1440,390}.png` and `aa-off-ratio15-{1440,390}.png` using view_image original detail.

- **Desktop roofs/silhouettes:** native AAfalse has noticeably coarse stair steps on upper dense footprints, large diagonal tower roofs and foreground building edges. Ratio1.5 reduces the harsh one-pixel steps and produces finer/smoother roofline coverage. AAtrue remains the smoother reference at some thin diagonals; ratio1.5 is not pixel-identical and does not eliminate all visible aliasing.
- **Mobile roofs/silhouettes:** ratio1.5 visibly softens the coarse steps on the large foreground roofs and tall building sides compared with native AAfalse. The overall city scene is closer to the AAtrue reference. Some residual edge steps remain; no exact parity score is assigned.
- **Labels/roads/UI:** road names remain readable in every variant. Ratio1.5 makes map labels look somewhat finer/softer through the canvas scaling; no missing road name, marker or building was observed. The DOM sidebar, markers, controls and attribution retain the same layout and remain readable. No new overflow was observed in these captured states. This is visual review of saved scenes, not a full keyboard or anchor-drift test.

The supported conclusion is **real qualitative improvement**, not a forced success verdict. It is reasonable for root to consider a minimal navigation-only pixel-ratio policy, provided its cost and transitions are verified. The initial AAfalse city-edge regression remains the reference defect until a new candidate is accepted; these isolated overrides do not silently replace the application candidate.

## Limits before a patch or acceptance

PixelRatio1.5 renders2.25times the native pixels. The optional10second continuous-city timing comparison was not run; no navigation timing or performance acceptance is claimed. Root may resume exclusive browser/benchmark work now because this diagnostic process is terminal and cleaned up.

These captures do not implement a navigation/inspection transition policy. An actual patch would need to preserve the original device ratio appropriately, switch only the intended navigation state, restore inspection ratio, and verify resized canvas alignment, popup projection, mode changes, style recovery and both viewport visuals. It must not change the frozen browser DPR, baseline,1.20threshold or physical geometry. V6's accepted timings belong to the cycle22 source/configuration; they do not automatically validate a ratio-policy candidate or actual-city navigation.

No new renderer, engine/source edit, postprocess, geometry reduction, FPS throttling, default city hiding, private painter mutation, commit or push was used. Full acceptance remains incomplete per REMAINING-ACCEPTANCE.md.
