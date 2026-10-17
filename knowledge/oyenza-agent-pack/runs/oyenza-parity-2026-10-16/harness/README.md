# P0 harness and frozen oracle

This folder records local test setup and observations. No application source was edited by the harness owner.

- [x] Read app state, map lifecycle, camera callers, API fallback, CCTV media and acceptance notes.
- [x] Record baseline typecheck/build and desktop/mobile screenshots.
- [x] Freeze browser fixture and camera assertions before P1 application edits.
- [x] Add separate pure-helper unit project and freeze dimension assertions agreed with root.
- [ ] Run focused P1 verification after writer signals readiness.
- [ ] Independent review and full final application acceptance remain pending.

Use WSL from `/home/vereniaes/project/hackathon/LaporJalan`. Runner is `@playwright/test` 1.61.1, Chromium 149.0.7827.55 (existing cache revision 1228). Commands use existing Node 22.23.3 at `/home/vereniaes/.nvm/versions/node/v22.23.3/bin/node`. Node 20.18.0 and npm 10.8.2 were present initially. No browser, app runtime upgrade, global package or second test framework was installed. One npm install added Playwright/test and its two transitive packages. npm 10 removed unrelated libc lock metadata; the harness restored those fields from the immutable before lockfile.

`package.json` now has `test`, `test:unit`, `test:browser`. Playwright config separates `*.unit.spec.ts` (no page/browser fixture) and browser desktop 1440x900/mobile 390x844 at DPR 1, id-ID, Asia/Jakarta. The dev server already running at 127.0.0.1:3002 was reused. Automatic webServer can start it when absent.

```sh
PW_OUTPUT=knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/after-p1 /home/vereniaes/.nvm/versions/node/v22.23.3/bin/node node_modules/@playwright/test/cli.js test --project=unit --project=desktop --project=mobile --grep 'C0|D0|B01'
```

Use a new PW_OUTPUT for each evidence run. Do not overwrite `before`, `frozen-before`, hash manifests, fixture or assertions to hide a failure. Existing app baseline sources remain in the sibling `before` directory owned by root.

`before` is initial harness smoke: 7 passed, 4 failed. Selecting the already selected report was found to be a harness coverage gap, so the corrected frozen oracle selects a distinct second report. `frozen-before` retains the corrected run, including its actual failures. P1 was authorized while this longer run was still completing; subsequent source HMR may contaminate later cases, so only the initial `before` and pre-P1 corrected report-selection observations establish initial app state. Later P1 evidence uses its own output directory.

Fixture time fixes Date only, preserving real RAF/camera progress; seed 1 is metadata, application Math.random is not overridden. No claim is made that application random locations are deterministic or measured. API GET reports returns fixed synthetic reports; places return a fixed synthetic search result. All other API GET returns empty predictions; every API write is rejected locally with 405. CCTV/traffic remain app static inputs. All image requests return an explicit STATIC TEST SNAPSHOT SVG; no real stream is simulated. Deterministic map style has a solid background and app overlays, with no remote tiles/fonts/media readiness dependency. The distinct live-integration map test retains the real OpenFreeMap style, but still uses mocked reports and static test images; it is not a production data test. The fixture geographic origin is synthetic, and ROAD_ANCHOR_TO_VERIFY remains null. Inspection zoom 23 is proposed, not yet calibrated; P2 must calibrate before visual geometry acceptance.

Readiness polls MapLibre style readiness and stopped camera animation, with bounded failure. Map access walks the existing React ref in tests/helpers/map.ts without changing production code. Screenshot state includes camera/viewport/browser/toggle and traces retain DOM. These images establish initial appearance and observed defects; they are not pixel parity assertions or an approval of current design.

Acceptance mapping: B01 fixture/manifest; B02 typecheck/build; B03 two viewport screenshots and trace; C01 report/search/CCTV preserve2D; C02 reset2D; C03 explicit inspect and exit restoration; C04 orbit cancellation; C06 selected-report filter removal; D01D02 scale/invalid/zero; M01 no LIVE on static image. C05 race, remaining C02 zoom/delayed callbacks, full accessibility, G01G06, L01L03, M02M04 and full R02R03 remain not_run unless later evidence is added. Fixture unit smoke checks fixture consistency, not application dimensional correctness; D01D02 import the real adapter.

U03 criterion accepted by root after baseline capture and before performance work: paired identical fixture/hardware after warmup, three 30-second samples per viewport, idle/orbit/pan separately. Median of sample p95 frame time(candidate) must be <=1.20*baseline. Baseline app source is immutable in sibling before directory and can run on a separate local Vite port for paired measurements. No performance run has occurred. Software rendering is explicit in environment.json, and no 60 FPS or device performance claim is made.

Ordinary reference navigation to https://transit.oyenza.com returned HTTP403 nginx on both viewports. reference-results.json and oyenza-1440.png/oyenza-390.png record this limitation; historical video comparison images remain the visual reference. No login or access bypass was attempted.

Primary technical references checked on 2026-10-16: https://playwright.dev/docs/test-projects and https://playwright.dev/docs/clock. Projects isolate unit/browser coverage. Fixed Date preserves ongoing timers while freezing displayed time. npm install reported existing/transitive audit vulnerabilities (3 moderate, 6 high, 1 critical); no audit fix or runtime package updates were performed in this task.
