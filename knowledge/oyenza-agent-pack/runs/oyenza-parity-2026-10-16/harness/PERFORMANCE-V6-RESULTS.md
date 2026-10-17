# Performance V6 - cycle22 candidate

Completed36 valid samples, execution exit0, **all6groups passed** at the original1.20 threshold. Root independently recomputed every median/p95 from saved raw arrays and each group ratio. This is paired synthetic timing acceptance only. The AA-disabled candidate has an explicitly unresolved city-edge quality regression; a timing pass does not approve that tradeoff or complete the overall goal.

| Viewport | Scenario | Baseline median sample p95 ms | Candidate median sample p95 ms | Ratio | Result |
| --- | --- | ---: | ---: | ---: | --- |
| 1440x900 | idle | 16.7 | 16.7 | 1.000 | passed |
| 1440x900 | inspection-orbit | 33.4 | 33.4 | 1.000 | passed |
| 1440x900 | pan-in-inspection | 16.7 | 16.8 | 1.006 | passed |
| 390x844 | idle | 16.8 | 16.7 | 0.994 | passed |
| 390x844 | inspection-orbit | 16.7 | 16.7 | 1.000 | passed |
| 390x844 | pan-in-inspection | 16.7 | 16.7 | 1.000 | passed |

Each group uses three30-second samples per source after5-second warmup with alternating source order, DPR1 and initial zoom19.2/pitch60. Baseline, runner, fixture and all settings matchV5, verified by hashes. Candidate changes are confined to Map3D antialias, DamageLayer and the new material helper. Thresholds and prior evidence were not changed. Baseline desktop orbit itself differs between runs (V5median50ms,V6median33.4ms), so cross-run speedup is not a controlled causal statistic; the within-run ratios are the acceptance metric.

The new material preserves physical triangles/profile while blending smooth grid edges in the solid draw. Depth queries remain real and opt-in for geometry tests. The full existing82-case suite and build passed. The AA-on/off diagnostic found an explicit performance/edge-quality tradeoff; it is not a replacement for these36acceptance samples.

Environment: Node22.23.3, Chromium149.0.7827.55, WSL, i7-11800H, SwiftShader software rendering. RAF callback intervals/input-to-next-RAF are not display FPS or hardware performance. Synthetic style, initial pose and different historical orbit trajectories limit inference. Actual-map timing of this new candidate is not measured. All36sample application-error lists are empty. Input latencies and raw frame intervals are retained.

[Full result](performance-candidate-v6/result.json), [execution](performance-candidate-v6/execution.json), [raw-statistics integrity](performance-candidate-v6/integrity.json), [freeze checks](performance-candidate-v6/freeze-integrity.json), [material/city review](CYCLE22-REVIEW.md), [AA diagnostic](performance-diagnosis-cycle22-material/RESULTS.md), [current visual evidence](../PREVIEW-CYCLE22.md), [remaining acceptance](../REMAINING-ACCEPTANCE.md).

Budget remains22/23. The cycle22 timing defect is verified resolved for this candidate, but the city-quality finding remains open. Further scope/design decisions must not be hidden by a broad passed status.
