# Performance source triage

Date: 16 October 2026. Status: source hypotheses only. V5 was still measuring when this note was prepared. No application change, ablation, CPU profile or GPU timing has been performed. Requested worker: gpt-6.1-sol/medium; root reconciled its source findings with primary documentation. Actual model/usage telemetry is unavailable.

## Observed signal

The completed desktop orbit group contains baseline p95 samples 33.5, 50 and 50 ms, and candidate samples 83.3, 83.4 and 83.4 ms. Median sample p95 is therefore 50 versus 83.4 ms, ratio 1.668, exceeding the frozen 1.20 threshold. The entire V5 run must finish before its final result is assigned. Idle and inspection workloads remain separate. Raw files are retained under performance-candidate-v5; rounded numbers here do not replace them.

## Hypotheses, not established causes

1. DamageLayer.render reads DEPTH_RANGE twice per frame, allocates a Vector3/arrays and calculates a projected anchor for diagnostics. Query cost is plausible but not measured. MDN explains that WebGL state queries may cause synchronous stalls; implementations can cache some results, so a stall cannot be inferred from this source alone. [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices#avoid_blocking_api_calls_in_production).
2. The candidate draws a local depth surface, shaded bowl, wireframe and three contours through Three. The baseline has flat damage overlays and decorative buildings. More work is expected, but its contribution to the observed regression needs measurement. State reset is required for a context shared with another renderer and must not simply be removed as an optimization. [Three r170 renderer source](https://github.com/mrdoob/three.js/blob/r170/src/renderers/WebGLRenderer.js).
3. Candidate orbit uses elapsed time and easeTo around the selected coordinate. Baseline uses 0.35 degrees per callback and setBearing, which delegates to jumpTo. Equal initial pose does not imply equal camera trajectory or actual angular speed. V5 evaluates the two application behaviors under the same inputs, not isolated geometry cost. [MapLibre v4.7.1 camera source](https://github.com/maplibre/maplibre-gl-js/blob/v4.7.1/src/ui/camera.ts).

## Bounded next diagnosis if authorized

- Capture a short CPU profile of the unchanged candidate before choosing an optimization. Separate camera calculations, renderer work, GL queries and GC. CPU duration of render is not GPU duration.
- Use separately named diagnostic copies if an ablation is needed. Compare full candidate, diagnostic queries disabled, and custom draw disabled while preserving the same camera workload. An ablation is not an accepted product candidate.
- If necessary, compare a shared deterministic camera trajectory separately. Preserve V5's application-action result and threshold; do not replace the baseline to erase a failure.
- Select the smallest evidenced patch, preserving 1:1 dimensions, shared-context depth, anchor stability and current visual acceptance. Repeat affected functional/visual checks and then freeze a new candidate for the same performance threshold.

Budget: all 21 authorized correction cycles are allocated. This note grants no further repair authorization. Actual-map timing collection already planned under U03 is independent observation and does not change the V5 acceptance threshold.
