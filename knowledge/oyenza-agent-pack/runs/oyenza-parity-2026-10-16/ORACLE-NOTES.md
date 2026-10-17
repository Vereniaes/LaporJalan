# Oracle corrections

## C05 coordinate equality

The delayed-report regression reproduced a real jump before repair: expected the second report at 106.8234/-6.202, received the last report at 106.8168/-6.2195. After the application patch, both viewports reached 106.82339999999999/-6.201999999999998. Exact array equality incorrectly rejected this floating-point representation.

The new assertion checks coordinate distance below 1e-9 degrees, well below the 2 CSS pixel anchor tolerance. The requirement remains that a delayed initial response must preserve the user's newer selection; the heading assertion remains unchanged. Original failure and repaired-state traces are retained in harness/race-before and harness/race-after. This is a numerical oracle correction, not a changed product threshold. Independent review remains pending because child workers reached their usage limit.

## Prototype frame readiness

The first geometry browser check timed out waiting for an idle event after setting a camera pose that was already current. The failure screenshot contains the rendered cavity, and the separate lifecycle check completed 20 cycles. The harness now registers a render listener before changing the camera and requests a frame explicitly. The blocker check additionally waits for its GeoJSON source. Visual, scale, depth and projection assertions remain intact. Initial traces remain in harness/prototype-first.

## Cycle 18 verification fixture naming

The new label-restoration fixture used ID label-point, which accidentally matches the existing /poi|shield|housenumber/ style filter. The first run therefore failed before testing the new close-zoom policy. Renamed that test-only ID to label-city, keeping point placement and all visibility assertions unchanged. This isolates the intended close-zoom behavior instead of altering an application criterion. Failed evidence remains in cycle18-interactions. Popup DOM measurements already passed on both viewports.

## Cycle 19 orbit and visual verification

The real orbit button test now measures a complete360degree turn, records four quadrants, retains the original viewport-bound assertions and adds <=2CSSpx anchor drift plus DOM hit-testing for every sampled rim point. The original90degree failure remains in cycle18-visual-probes. Mapped-road static bearings now rotate around the declared damage anchor, matching the repaired explicit orbit. All four angles, physical dimensions and strictly newer frame assertion remain unchanged. This preserves the intended composition after the inspection camera offset, rather than rotating around a different point.

## Cycle22 depth diagnostics opt-in

Prototype now explicitly sets verifyDepth:true after production diagnostics became opt-in. Each four-bearing depth oracle additionally requires real arrays of2finite numbers before the existing equality. This prevents null==null from passing. Physical-scale, projection, bearing, lifecycle and blocker expectations are unchanged. No baseline images or performance threshold were replaced. Barycentric surface-grid rendering changes vertex layout but preserves physical coordinates; final visual occlusion is still required.
