# Proposed acceptance gap checks

Status: **not_run**. Browser, Playwright collection, compilation and benchmark were not started. Root must review this source and explicitly confirm an uncontended browser slot before execution. Authoring is verification-only; application source, helpers, existing fixtures, acceptance thresholds and historical evidence are unchanged.

Task: acceptance_verifier, 17 October 2026. Budget supplied by root: repairs22/23; remaining repair is performance-only. This collection consumes no repair cycle. Actual model/usage telemetry is unavailable.

Todo:
-> Root reviews new test source and proposed oracle scope.
-> Root resolves the remaining maintenance/local-save-label contract boundaries below.
-> Root runs desktop/mobile collection after confirming the browser slot.
-> Record actual case outcomes and preserve failures without application repair.

## Proposed cases and expected behavior

Source: `tests/acceptance-gaps.browser.spec.ts`, 13 cases per browser project, 26 proposed executions across existing desktop/mobile projects.

| ID | Scenario | Expected outcome |
| --- | --- | --- |
| C05 | Report B flight, report A marker event, manual2D | A heading/coordinates win; pitch0, togglefalse, no inspection. Marker dispatch is deliberately synthetic to force the rapid timing; this is not keyboard/pointer reachability evidence. |
| C05 | Delayed initial refresh, then search and manual2D | Refreshed old report cannot replace search coordinates; manual2D remains. |
| C05 | Delayed initial refresh, then CCTV B and manual2D | B popup and settled target remain after old coordinates arrive; no inspection or restored tilt. CCTV offset means map center is preserved rather than equated with camera GPS. |
| G06 | Reports arrive while style response is gated | Explicitly observe reports count2 while style is not ready, then both report markers/decal IDs and a rendering inspection after release. |
| M03 | A image gated, B selected, late A failure | Exactly one B popup, B loaded source/title, <=2 CSSpx anchor error, B expanded preview, Escape focus return. No real live source is claimed. |
| M01 | Static camera image abort in popup/expanded view | Unavailable message, static/unverified label, no LIVE text, both previews closable by Escape. |
| R02 | Traffic before filter, after empty report filter and style replacement | All three fixed segment IDs/geometries/status/color mappings remain, with one traffic line layer using feature color. This checks source/style integration, not pixel color sampling. |
| R02 | Reports GET abort,503,invalidJSON (3 cases) | Initial reports remain usable and visibly Demo-labelled; manual2D works. Does not assert a new offline indicator that current product has not defined. |
| R02 | Geocoder abort after successful suggestions | Old suggestions disappear after failed request; clearing input/manual2D remain usable. |
| R02 | Report POST405/abort (2 cases) | Example remains visible locally, dialog closes, count increments and Demo stays visible after known write failure. This does not certify server persistence or an explicit sync status. |

## Review boundaries and uncovered scope

- **Maintenance remains uncovered.** Every existing camera fixture is `online`; App has no camera-state injection API. Production source confirms a supported maintenance label, but changing existing fixtures is outside ownership. A new isolated component fixture or browser module-response override can cover that branch after root chooses the harness boundary. No application change is required or authorized here.
- Local POST behavior is frozen as current accepted demo/local example behavior only. App ignores the backend boolean and has no explicit failed-sync badge. Whether Demo alone is sufficient disclosure is a product/acceptance finding, not a pass invented by this collection.
- GET malformed response uses invalid JSON. Non-array `data` and geocoder503/invalidJSON are still uncovered; abort covers the representative geocoder failure outcome.
- A01 whole-keyboard traversal is outside this collection. Existing Escape/focus assertions do not close that gap.
- No real stream, source freshness, surveyed dimensions, display FPS or total GPU-memory claim follows from these cases.
- This is proposed source pending review, not a passing test result. Flight timing, browser image-cancellation ordering and selectors need the first actual run. Do not weaken product assertions to make these pass.

## Read basis and external reference

Read common/harness prompts, guardrails, current HANDOFF, REMAINING-ACCEPTANCE, model/phases/harness/analysis/ADR/skills guidance, helper/fixture/config/package, existing race/interaction/review/secondary/close-label tests, App/Map3D/CctvPopover/CctvModal/API/mockData source. No frontend requirement/mockup file appeared in the bounded parent/project directory filename search; the gap audit contains the existing saved-reference interpretation.

Applied engineering:testing-strategy to keep bounded integration cases focused on races and failures. Official Playwright network interception guidance was consulted on17 October2026: https://playwright.dev/docs/network . Existing local `page.route` and request/response gates are reused; no package was installed.

Git status was recorded before authoring: existing application/package/knowledge changes and untracked pack/tests belong to the shared worktree. Only the assigned new spec and this new report were written. No commit/push/deploy/reset/server operation occurred.

Suggested root command after review and exclusive slot confirmation:

```sh
PATH=/home/vereniaes/.nvm/versions/node/v22.23.3/bin:$PATH PW_OUTPUT=knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/acceptance-gaps/execution node node_modules/@playwright/test/cli.js test tests/acceptance-gaps.browser.spec.ts --project=desktop --project=mobile
```

Uses existing Playwright3002 config. Existing Vite3000 must survive. Command exit code: null, reason: not_run pending root review/browser coordination.

Final read-only checkpoint: git status after authoring matches the initial tracked/untracked path list. New spec SHA256: `e8bd2c5aecc1f9d585e8760b71e9f1082def9a9a61e486c7e71c6aba27a9bb71`. Initial hash is null because the assigned spec did not exist before this task. No browser evidence or exit code exists yet.
