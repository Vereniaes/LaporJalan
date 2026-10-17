# Oyenza parity progress

This log records implementation evidence and the next action. App completion remains unproven.

## 16 October 2026 - P0

- Current worktree inspected; existing application edits preserved in baseline hashes and before-source copies.
- Actual shell Node is 20.18.0. Harness uses already installed Node 22.23.3 and Chromium cache rather than assuming the older environment notes are current.
- Before screenshots confirm oversized sample building blocks, a wide sidebar with large cards, dense labels and weak mobile map/detail balance.
- Browser reproduction confirms search changes pitch from 0 to 58 while the control still says 2D. Static CCTV uses an image but claims LIVE.
- Current Oyenza public HTML/CSS returns HTTP 200 through ordinary PowerShell GET; web-tool access remains unavailable. CSS confirms a 400 px desktop pane at a 900 px breakpoint, system font, neutral cards and grouped white controls. These observations inform styling, not copying whole assets.
- MapLibre 4.7.1 source inspection supports testing a depth-only local surface around a cavity before building extrusions. 2D map layers use layer-depth slots rather than a physical z=0 plane. This is a prototype hypothesis, not a passed rendering result.

Next: freeze baseline test contract; implement one camera mode and dimension adapter; prove the cavity render before broad UI integration.

## P1 and prototype evidence

- One controlled 2D/3D/inspection mode now drives map transitions. Automatic zoom tilt was removed, orbit cancels when switching to 2D, and filtering clears stale selection.
- 22 camera/dimension checks passed at desktop/mobile sizes in harness/p1-root. The late initial report selection race was then reproduced and repaired; two follow-up checks passed in harness/race-verified. The numerical test correction is documented in ORACLE-NOTES.md.
- A radial cavity and contours share one meter-based profile. A local depth-only road surface surrounds the aperture while preserving the map's road color. No shared depth clear, raised cavity or independent canvas is used.
- Six prototype checks passed in harness/prototype-verified: dimensional profile, contour agreement, four camera bearings, projection/depth-range checks and 20 add/remove cycles on each viewport. Root inspected the cavity and blocker screenshots. Context-loss recovery, full application lifecycle/performance and independent final review remain unverified.
- Shared-layer app integration is being checked separately in harness/integration-first. Synthetic fixture passes do not certify surveyed report coordinates.
- Both child workers terminated at the account usage limit. Root took ownership of their released paths and continued local checks. No automatic model escalation or new child was started. Independent final review remains pending.

Repair usage: 3/12 cycles (late selection race, negative-zero profile output, prototype frame waiter). No defect exceeded one repair attempt. Full Oyenza parity is not yet claimed.

## Scope and limits

No commit, push, backend/API migration, engine upgrade or OpenCode installation. Application validation follows PHASES and HARNESS. P0 fixture dimensions and coordinates are explicitly synthetic; a passing synthetic scene does not prove a verified field location or measurement.

## P4/P5 candidate and visual findings

- P3 integration rendered the physical cavity in the existing map canvas on both viewports (integration-first: 2 passed).
- Map now uses Positron and OpenFreeMap building footprints with render_height/render_min_height; the hand-drawn sample blocks are no longer consumed. Labels and controls are quieter. No engine upgrade.
- Report overview uses actual list counts; unverified water level, camera freshness and fixed road-width claims were removed from the main surface. On-map inspection is the primary report action; profile and comparison remain available.
- p4-p5-first: all 34 existing checks passed. Root inspected real-map desktop and mobile inspection images. This is partial evidence, not final visual approval.
- New layout checks then exposed a 460 px desktop panel overriding the intended 400 px, mobile CCTV clipped by 38.875 px after flight, and missing focus restoration after fullscreen close (layout-before: 1 passed, 3 failed). Repairs counted separately; no acceptance thresholds changed.
- Fullscreen uses a native modal with an optional device fullscreen request and explicit rejection status. Static media is always labelled as an example. Clipboard success is shown only after the promise resolves.
- Reference: [MDN showModal](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) checked 2026-10-16 for top-layer/inert behavior; focus restoration is still tested explicitly. [MapLibre FlyToOptions](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FlyToOptions/) checked alongside installed 4.7.1 camera.ts offset implementation.

Current development scope: P4 layout and P5 data/media honesty. Full P6 performance, context recovery, all-app lifecycle and independent gates remain open.

## Independent review and bounded repairs

Both Sol workers became available after the stated account reset time. Review requests covered P1 independently from its author and P2-P5 independently from root. Findings were reproduced: empty data retained reports; invalid search latitude crashed the map; same-ID coordinate refresh left the camera behind; 150 cm geometry clipped; late FileReader replaced a newer image; failed images/canvas produced fabricated analysis.

Repairs preserve the data contract: coordinates are checked at map boundaries, successful empty arrays remain authoritative, report camera updates respect newer search/CCTV intent, framing changes zoom rather than object dimensions, failed image/canvas analysis shows unavailable, and file reads use request tokens plus abort cleanup. review-after: 16 passed, including both full 20-cycle lifecycle runs and context recovery. GPU heap retention remains unavailable.

User explicitly extended the session cap from 12 to 16 repair cycles through /grillme. Cycles13-14 fix Node JSON import compatibility and the reproduced null-canvas fallback. integrated-candidate: 62 passed, 2 failed (mapped-road frame wait timeout). No app error was captured in those two failures; they remain failed until diagnosed.

An additional C06 assertion reproduced hidden stale inspection mode after empty data (empty-mode-before). Cycle15 restores previous navigation mode when selection becomes null. Cycle16 is assigned to the independent verifier for the mapped-road wait diagnosis, preserving visual criteria. No new cycles may start beyond16 without another explicit scope/budget decision.

Mapped road fixture uses OSM node4466350567, verified as a member of way449551306 (Jalan Jenderal Sudirman). Raw public XML and hashes are retained. The anchor is a mapped centerline, while damage dimensions remain synthetic; no real pothole or field measurement is implied.

## Cycle 16 checkpoint - read-only audit

The mapped-road diagnostic identifies an exception in MapLibre 4.7.1 line-symbol placement before painter.render. A source-aware workaround is proposed, not applied: suppress line-placement labels during very close inspection and restore their previous visibility on exit and style reload. Physical geometry remains 1:1.

interaction-first ran 8 cases: 4 passed, 4 failed. Out-of-order geocoder responses and device-fullscreen rejection passed on desktop/mobile. C02 failed on both: zoom interrupted the transition to 2D at pitch 56.17/55.94 degrees. M03 failed on both because the test used nonexistent map._popups; this is a harness failure, not a measured popup drift. Independent review recommends measuring the actual popup DOM anchor against map projection plus the declared offset.

Current build-cycle16-checkpoint.log records TypeScript and production build exit 0. The 1,526.09 kB JS chunk warning remains. No performance claim follows from compilation. Benchmark V3 is intentionally not run because corrections would change the candidate; preserve its manifest and create a fresh version after approved repairs.

Budget remains 16/16. A separate request for two additional correction tasks is pending; no application/test edits were made during this checkpoint audit. Handoff records open gates and exact next steps.

## Authorized cycles 17-18

User explicitly added two cycles. Cycle17 adds a close-zoom label policy and routes zoom buttons through the mode-aware camera helper. Line/line-center symbols retain their original visibility below zoom22 and are hidden above it, including manual zoom, so the failure cannot recur outside an inspection click. Exiting inspection returns to navigation zoom16.5. Style replacement captures that style's own values. No geometry size or engine/dependency change. cycle17-camera: four targeted cases passed across desktop/mobile, including four mapped-road bearings.

Cycle18 replaces the invalid popup probe with actual DOM bottom-midpoint measurement plus the declared offset. Eight interaction cases passed across desktop/mobile. New label-restoration verification initially collided with the existing POI filter because its point-symbol ID contained poi; ORACLE-NOTES records the fixture-only rename with assertions unchanged. label-restoration-verified: two passed. build-cycle18: TypeScript/build exit0; existing chunk-size warning remains.

Root viewed mapped-road images and found that mobile framing clips the cavity at bearing90 and can place it beneath the inspection HUD. Render/projection success does not satisfy that visual criterion. Additional actual-orbit and attribution probes are being run; no fix is inferred. Independent visual worker stopped at its account usage limit, without a verdict.

## Authorized cycles19-20

The user explicitly added two cycles after visual probes reproduced mobile orbit clipping (right rim409.78px in390px viewport) and attribution links covered by the desktop legend. Cycle19 orbits around the selected report using easeTo around, preserving the camera offset and physical scale. Cycle20 moves the legend above attribution, increases mobile report spacing and hides that duplicate floating action during inspection; the panel Lapor action remains available.

cycle20-visual:8passed. cycle20-orbit-complete:6passed, including a full explicit orbit on each viewport with four quadrant samples, <=2CSSpx anchor drift, unobstructed rim and four static mapped-road angles. Root inspected current mobile90/180 images: cavity stays below HUD, inside screen and above attribution. build-cycle20 TypeScript/build passed. Before-source hashes for25files match baseline; preexisting StreetSimulation3D/mockData edits remain intact.

Full82-case verification is running. Performance V4 uses freshly frozen source at /tmp/laporjalan-performance-wJva9K; measurements have not started. A bounded independent app/image review was requested from the existing harness worker, without changing its cheaper model or asking it to approve its own test oracle. No commit/push. Budget20/20; further corrections would require a new decision.

## Final functional verification and performance attempt

cycle20-full completed82passed/0failed/0skipped, exit0. Source hashes still match candidate-cycle20.json. Build also passed. Final independent reviewer opened all eight mapped-road images and current city/CCTV images and approved the reviewed app/source/visible states, with explicit performance/oracle limits.

Performance V4 started at13:57:21UTC and exited1 at13:58:03UTC, before completing any sample, with Insufficient frame/input samples. Owned browser/servers were cleaned up; user port3000 remains running. No frame/FPS/latency result is claimed. The runner author is diagnosing which raw stream is missing using bounded scratch evidence; no repair is authorized beyond20.

## Authorized cycle21 - performance runner isolation

User explicitly authorized one correction cycle limited to the performance runner and a new benchmark with unchanged threshold. The diagnosis found baseline canvas x1440 at viewport1440, placing mouse x1680 outside the viewport. Per-source inline Tailwind/PostCSS with absolute content globs restores baseline canvas x460,width980 and receives trusted pointer input.

V5 preserves exact V4 source hashes for both baseline and candidate, fixture hashes and all settings, including3x30seconds,5second warmup, common camera and1.20threshold. The runner now rejects obstructed/offscreen input points and saves raw data before sample failure. Setup-only checks are labelled separately from measurements. Independent review approved the patch and verified hashes, without claiming benchmark success. Application code remains the82-test candidate.

## Cycle21 verification completed - 17 October2026 Asia/Jakarta

V5 completed36samples, exit0. The runner now yields valid input/frame data for all cases. Performance result is failed: desktop orbit1.668x, desktop pan4.958x and mobile orbit2.0x exceed frozen1.20 threshold; both idle groups and mobile pan pass. Root recomputed p95/ratios from every raw sample and saved hashes. The application remains byte-identical to the82-case candidate.

Actual-map observation ran afterward,2cases passed/6samples. Median sample p95:210ms desktop,163ms mobile, on SwiftShader with trace/screenshot overhead. No timing acceptance verdict is assigned. App errors empty; renderer advanced; opened screenshots show the cavity within the unobstructed map area. Request-aborted network records are retained.

No further application or runner patch was made. All21authorized cycles are used. Source-only triage identifies possible diagnostic GL query cost, render cost and camera work; no causal profile or ablation has been run. Current handoff proposes a separate bounded decision and retains the failed performance gate. Bounded ledger/links/hash checks passed; complete executable ledger validation remains missing.

## Authorized cycle22 - material and depth-query optimization

Two additional performance attempts were approved, cap23. Cycle22 uses a single filled material with derivative-smoothed triangle edges, preserving physical coordinates while removing coplanar wire rendering. Map antialias is false; actual depth-range queries are opt-in. Pure AA-off and depth-bias visual probes were rejected and retained. Query removal alone did not prove a frame-time improvement; combined diagnostics supported the selected candidate, pending full benchmark.

After continuation, persisted cycle22-geometry results show10 expected/0failed/0skipped; the old terminal handle is unavailable and no process remains. Root opened mapped desktop90, mobile0 and blocker screenshots, finding a continuous visible grid, intact rim and correct foreground blocking. The independent reviewer stopped at usage limit without a verdict; review reassigned to the existing Sol planner. New build capture exits0, retaining the bundle-size warning. The complete82-case functional suite is running with fresh output. Source hashes are frozen in candidate-cycle22.json. No benchmark timing pass or full acceptance is claimed.

Cycle22 full verification completed82passed/0failed/0skipped, exit0 in5.8minutes. Independent city comparison found jagged MSAA-disabled building edges despite retained readability. A new isolated4-sample AA-on/off diagnostic uses the new material without application edits; V6 remains prepared but not run. No full visual/performance pass is claimed.

V6 completed36valid samples, all6groups passed at unchanged1.20, execution0. Worst ratio1.006 desktoppan. Raw median/p95 and all ratios independently recomputed, source/runner/settings hashes verified. No browser workload overlapped. Candidate has a documented city-edge AA regression; overall visual acceptance remains open. Bounded installed-source feasibility review is investigating a minimal solution before allocating cycle23.

## 2026-10-17T04:19:14.940583+00:00 - acceptance and city diagnostic

V6 passed6/6 groups with36 samples. New acceptance run exited1:20 passed,6 failed. Search/2D interruption is reproduced; marker and image selector defects are isolated without relaxing assertions. Keyboard5 flows authored, not_run. Real-city1.5 pixel-ratio timing is running alone. Cycle23 not allocated; current app source remains cycle22.

## 2026-10-17T04:21:37.111885+00:00 - cycle23 allocated

Applied one mode-aware public pixel-ratio effect in Map3D: navigation max(native,1.5), inspection native; cleaned resize listener. Only Map3D differs from cycle22 application manifest. Allocation23/23, no later repair authorized. Focused transitions, current visuals/build and fresh V7 benchmark pending.

## 2026-10-17T04:38:31.654101+00:00 - user paused prior goal

Owned suite18216 stopped cooperatively withSIGINT, terminalexit130;69 passed,7 failed,1 interrupted,45 notrun. Candidate23 and build retained. V7 notrun. New task is planning-only public-map rebranding; no further application edits.
