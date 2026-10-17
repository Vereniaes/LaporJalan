# Visual audit after cycle 18

Status: failed for full visual acceptance. Root inspected image pixels; this is an implementer audit, not an independent approval. The delegated visual reviewer terminated at an account usage limit without a verdict. No parity percentage is assigned.

## Reference and candidate

References are the saved map, inspection and CCTV comparison sheets in knowledge/video-review-2026-10-16. Their upper panels show the reference recordings; lower panels show the old local app, not the current candidate. The inspection reference is labelled generative video, so lane markings, scale and street geometry are illustrative rather than verified Oyenza features.

Current city/layout/CCTV images were captured by six passing existing cases in harness/visual-audit-cycle16. They precede the close-label/zoom policy, which does not change normal city styling. Current real-road cavity images come from harness/cycle17-camera at desktop1440x900/mobile390x844, four bearings, OSM-verified anchor and synthetic damage dimensions0.52m/0.075m.

## Observations from pixels

| Requirement | Observation | Verdict |
| --- | --- | --- |
| Neutral city and source footprints | Current city image has detailed source buildings, grey facades, white roads and grouped white controls. Old decorative rectangular blocks and saturated street basemap are gone. Different district/source data means exact building arrangement cannot match the recording. | Observed improvement; independent U01 approval pending. |
| Sidebar hierarchy | Current400px sidebar contains search, concise overview and selected-report card. The reference contains transit cards and branding; these are reference hierarchy, not a request to replace road-report functionality or copy its mascot. | Structure present; pixel-identical content is not claimed. |
| Shared-map inspection | Negative cavity and green mesh are visible within the actual map canvas; the primary action no longer requires a separate scene. | Observed on mapped-road images. |
| Street context at physical scale | At zoom25 the0.52m cavity is readable but nearby map road edges are broad and blurred; the scene does not reproduce the generative illustration's lane markings/intersection context. No measured lane geometry is available. | Limitation, no invented road measurements. |
| Four-bearing mobile framing | At bearing90 the cavity extends beyond the right screen edge. At bearing180 the HUD covers much of the cavity. Projected anchor changes from about[239,304] at0 to[322,213] at90 and[158,172] at180. | Failed U02. |
| CCTV preview | Mobile preview fits beside the controls, has white frame, explicit example-media label and fullscreen action. Snapshot is a test fixture, not a live CCTV stream. | Observed; DOM anchor probe passed separately. |
| Attribution | Desktop legend overlaps the attribution row in the city screenshot. Mobile report action overlaps part of the expanded attribution text in mapped-road images. | Visually failed; hit-test reproduction pending. |
| Performance | Screenshots do not prove frame rate or device performance. | not_run. |

## Diagnosis and bounded repair proposals

Inspection flyTo offsets the selected point below screen center to leave space for the HUD. The orbit loop calls setBearing, which rotates around the map center instead of that offset point. Consequently the selected damage sweeps across the screen and can leave the usable mobile area. The same behavior appears in direct-bearing verification. The smallest candidate fix is rotateTo/easeTo with the report coordinate as around, preserving its screen position; verify the actual orbit button and all quadrants, not merely one static camera pose.

Keep physical dimensions unchanged. Include the full cavity rim, HUD and controls when checking framing. Do not remove the failing angle or reduce the test viewport to obtain a pass. Attribution can be separated from the desktop legend and mobile report action with layout spacing; attribution itself must remain visible and clickable.

These are newly observed visual gaps after renderer recovery. No further application repair has been applied beyond the18 approved cycles. Full suite and extra orbit/attribution/WebGL fallback probes are still running at this checkpoint. Review final results rather than interpreting this document as a pass.
