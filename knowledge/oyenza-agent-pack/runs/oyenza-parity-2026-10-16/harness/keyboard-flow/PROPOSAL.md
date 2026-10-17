# Keyboard journey proposal

Status: **not_run**. Five proposed cases in `tests/keyboard-flow.browser.spec.ts`, ten executions across existing desktop/mobile projects. No browser, test collection, compiler or benchmark was started. Root owns the browser schedule and must review/freeze this source before running it. The prior acceptance-gaps spec is frozen and unchanged.

Todo:
-> Root reviews the five bounded flows and focus oracle.
-> Root freezes the source hash and confirms a free browser slot.
-> Run both existing viewports; retain traces/screenshots/focus paths for failures.
-> Reconcile only the demonstrated A01 scope; report missing paths separately.

## Proposed behavior

| Case | Keyboard input | Expected behavior |
| --- | --- | --- |
| Navigation/search/map | Tab and Shift+Tab through Daftar, Retak/Semua, second report, search suggestion, 2D toggle and zoom; Enter/Space and text insertion | Empty filter removes report markers, report selection opens its detail, suggestion navigates to fixed fixture coordinates, manual2D stays pitch0 while zoom increases/decreases. |
| Inspection | Tab to explicit inspection, orbit start/stop, Jalanan and Atas; Enter/Space | Controls are visibly focused and reachable; orbit button reflects both states; Atas removes inspection and restores manual2D. No frame-rate/orbit-speed assertion is implied. |
| Profile/comparison | Tab to triggers/profile rotation/slider; Space, ArrowRight, Tab/Shift+Tab and Escape | Optional profile rotates through its existing keyboard button, native dialog keeps focus inside in both directions, comparison slider changes50->55, Escape restores each trigger. |
| Report | Tab to Lapor/sample/save; Enter/Space and Escape | Open dialog contains focus, Escape returns to Lapor, reopening and selecting the existing sample enables a keyboard-reachable save, saving produces the local example and returns focus. No file picker/upload or persistence claim. |
| CCTV | Tab to CCTV tab and camera card/expand; Enter/Space and Escape | Current static source/title expand, native dialog contains focus, Escape returns to expand, second Escape closes popup and returns focus to the camera card. |

## Focus oracle and evidence

The bounded helper tries at most64 Tab or Shift+Tab presses per requested target and fails if it cannot reach the actual target. It records each visited focused element's tag/id/role, inferred name, rectangle, focus-visible state, outline and center hit test. The target must be fully within the viewport, have an unobstructed center, match `:focus-visible`, and have a nonzero visible outline style. Decorative box shadows are recorded but do not satisfy the focus-indicator assertion.

The helper never invokes focus, click, dispatchEvent, scrollIntoView or pointer actions. All tested user actions use `page.keyboard`; evaluation only reads DOM/map state. `prepare` handles fixed network/style setup. Native application autofocus/restoration is product behavior and remains active. Modal containment checks eight successive Tab and eight Shift+Tab presses, not an exhaustive proof of every modal focus cycle.

A `keyboard-focus-path` JSON attachment is preserved even when a flow fails. Checkpoint screenshots cover suggestion, zoom, inspection, profile, slider, report-save and CCTV controls. Computed focus styles plus screenshots require review: the center hit test does not prove every outline pixel survives ancestor clipping or meets contrast requirements. No contrast threshold is invented.

## Remaining scope and limits

- This is practical, bounded keyboard coverage, not blanket A01 approval. Map-marker keyboard selection, keyboard map panning/rotation, all alternate report/filter combinations, all CCTV cards, copy-location, device fullscreen, details disclosure, reset-camera, file upload and screen-reader output remain outside these five flows.
- A failed target reachability/visibility/occlusion or return-focus assertion is a finding. There is no programmatic-focus/pointer fallback, skip or weakened assertion.
- Source correctness, actual keyboard behavior and first-run timing remain unverified. No existing test, helper, fixture, baseline or production file was changed. No package installation/server/commit/push operation occurred.
- Budget22/23 remains unchanged; verification authoring is not a repair cycle, and remaining repair authorization is performance-only.

Read basis: current A01 gap in REMAINING-ACCEPTANCE, existing secondary/layout tests, App/Map3D/CctvPopover/CctvModal, modal hook, profile/comparison/report components, CSS focus/layout rules and existing test fixtures/helpers/config. Reused engineering:testing-strategy guidance already read for the acceptance collection. Official network source consulted for the preceding collection remains https://playwright.dev/docs/network . No new external API or dependency was needed.

Root run command after review and exclusive browser-slot confirmation:

```sh
PATH=/home/vereniaes/.nvm/versions/node/v22.23.3/bin:$PATH PW_OUTPUT=knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/keyboard-flow/execution node node_modules/@playwright/test/cli.js test tests/keyboard-flow.browser.spec.ts --project=desktop --project=mobile
```

Browser/test/build exit codes: null, reason: **not_run pending root review and browser coordination**. Existing Vite3000 must survive; existing Playwright configuration uses3002.

Read-only checkpoint: keyboard spec SHA256 `21a52fcdee167e41a9deb17709359df1cf03cff50386e97bfa07bcf65e3903cf`. Initial hash is null because this assigned file did not exist. Frozen acceptance spec remains SHA256 `e8bd2c5aecc1f9d585e8760b71e9f1082def9a9a61e486c7e71c6aba27a9bb71`. Git status path list matches the pre-task checkpoint; shared existing changes are preserved.

Root authorized the proven exact named CCTV image selector correction before the first keyboard run. The sole changed line is the expanded preview image locator, now `getByRole('img', { name: 'Gambar contoh untuk ' + camera.name, exact: true })`. Assertions are unchanged. Original source is preserved byte-for-byte in `archive/keyboard-flow.21a52fc.spec.ts.txt`. New frozen keyboard SHA256: `7d392b75afea95c6f3496ac6a297aa17fff68f40f444e4410fd9fc18d2c328ae`. All keyboard tests remain **not_run**.

Separate real A01 finding from the completed acceptance run: installed MapLibre4.7.1 overwrites custom marker aria-label during addTo, so camera/report markers expose the generic accessible name Map marker. Details and original browser evidence are referenced in `../acceptance-gaps/SELECTOR-DIAGNOSIS.md`. Application source remains unchanged. This finding prevents blanket A01 approval even if these practical journeys later pass.
