# Cycle23 - city edge correction

Scope: the second of two authorized performance corrections. Current budget22/23; this allocation consumes cycle23. No unrelated camera/accessibility fixes.

## Evidence and choice

Cycle22 V6 passes all6 synthetic groups, but native DPR1 screenshots show jagged city silhouettes. Public MapLibre4.7.1 setPixelRatio resizes the same canvas. Diagnostic1.5 ratio improves both viewport screenshots. Eight alternating real-city samples have no page errors and unchanged source: desktop AAtrue p95[416.7,416.7]ms vs AAfalse/1.5[200,216.7]; mobile AAtrue[183.3,166.6] vs AAfalse/1.5[83.3,116.6]. Two short samples per variant are feasibility evidence, not acceptance or hardware FPS.

Keep AAfalse. Ordinary2D/3D navigation requests max(native DPR,1.5); explicit inspection uses native DPR. One mode effect and a cleaned-up resize listener synchronize the public setting only when it changes. No geometry/camera target/engine/DOM/baseline changes. Native DPR2 is preserved, not lowered. The requested2.25x pixels at DPR1 trades buffer cost for city edge quality; exact MSAA equivalence is not claimed.

## Validation and stop

Verify DPR1/2, mode transitions, resizing, shared canvas/context, physical geometry and CSS projection; run existing functional coverage plus pending acceptance/keyboard checks, keeping their failures separate. Build/typecheck and inspect current city/inspection screenshots. Freeze V7 from the changed source and run unchanged setup/36-sample paired benchmark. Preserve V6 and all earlier evidence. No browser workload overlaps timing. A failure does not authorize a24th repair or an altered threshold. Existing search interruption/marker naming findings stay open for a separate scope decision.
