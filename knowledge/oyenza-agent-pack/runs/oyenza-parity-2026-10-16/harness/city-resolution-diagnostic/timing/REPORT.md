# Paired actual-city timing diagnostic

Terminal: command/session11762 exited0. Started2026-10-17T04:18:27.853Z; finished04:20:50.072Z. Own browser closed; own Vite3006 exited0. User server3000 was untouched. Before/after hashes of the seven application/fixture/helper sources match. Script identity is in script.sha256; full execution output is in run.log; raw frame intervals and context/source observations are in results.json. No application patch or oracle/baseline change occurred.

Command:

```sh
/home/vereniaes/.nvm/versions/node/v22.23.3/bin/node knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/city-resolution-diagnostic/timing/measure.mjs
```

## Observations

Same fixed initial city pose, real OpenFreeMap buildings, browserDPR1, Chromium/SwiftShader, no trace/fake clock. Each viewport uses ABBA order: AAtrue/native, AAfalse/ratio1.5, AAfalse/ratio1.5, AAtrue/native. Each fresh context warms for2.5seconds, then follows the same10second20degree elapsed-time bearing trajectory around the map center. Runtime elapsed can exceed10seconds until the next RAF; all samples end at bearing3degrees. No trusted pointer-input latency was collected.

| Viewport | Variant | Sample p95 RAF intervals, ms | Sample medians, ms | Interval counts |
| --- | --- | --- | --- | --- |
|1440x900 |AAtrue/native |416.7,416.7 |183.3,216.6 |52,44 |
|1440x900 |AAfalse/ratio1.5 |200.0,216.7 |83.4,100.0 |109,99 |
|390x844 |AAtrue/native |183.3,166.6 |83.3,83.3 |114,120 |
|390x844 |AAfalse/ratio1.5 |83.3,116.6 |33.4,50.0 |249,202 |

The simple mean of two sample p95 values gives SSAA/reference ratios about0.500 desktop and0.571 mobile. These are descriptive summaries of short diagnostic samples, not a replacement for the frozen benchmark's aggregation or1.20 acceptance threshold. Both SSAA samples were below both reference samples on each viewport. Absolute RAF intervals are still high on software rendering; this does not establish device FPS, presentation latency or satisfactory production interaction speed.

Actual AAtrue contexts report4samples and native buffers; SSAA contexts reportAAfalse/0samples and1.5ratio buffers, matching the prior screenshot diagnostic. Pre-sample building counts match across variants:145 desktop,83 mobile. No page exceptions or sample exceptions occurred. One first desktop reference ended with sourceReadyfalse, while the other seven endedtrue. Real-network tile/placement work during camera movement, fresh-context timing variation and only two samples limit causal precision. No result was omitted or rerun to force success.

## Feasibility verdict

**The combined source, pixel and short timing evidence supports a bounded trial of the minimal public navigation-resolution policy.** The1.5ratio city screenshots showed smoother roofs than nativeAAfalse while retaining readable labels; these short actual-city observations do not show a cost regression against the requestedAAtrue/native reference on this environment. That is sufficient to make a small cycle23 candidate plausible, not to accept it before implementation checks.

A policy such as normal2D/3D ratio=max(nativeDPR,1.5), explicit inspection ratio=nativeDPR, uses public setPixelRatio, preserves the single context and does not change physical geometry. NativeDPR>1 was not tested here; maintaining the native value avoids intentionally reducing existing resolution. A minimal implementation still needs mode transition/resize cleanup, drawing-buffer/CSS alignment, popup/geometry projection and current screenshots checked. V6 belongs to the cycle22 implementation; it cannot be relabeled as final-candidate evidence after this policy changes.

The diagnostic compared SSAA toAAtrue, not to nativeAAfalse timing. It therefore does not claim the resolution increase is free relative to cycle22, and it does not repair the broader missing acceptance evidence. Root alone allocates the final correction and determines the required candidate checks. No further browser, benchmark or application action is started by this report.
