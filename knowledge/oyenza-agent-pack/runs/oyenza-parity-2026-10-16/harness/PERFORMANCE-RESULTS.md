# Performance V5 results

Measurement completed at 2026-10-16T17:06:47.578Z. All36 samples are valid. Command execution exit0 means collection completed; **performance acceptance failed** because three of six groups exceeded the frozen1.20 ratio.

| Viewport | Scenario | Baseline median sample p95 (ms) | Candidate median sample p95 (ms) | Ratio | Verdict |
| --- | --- | ---: | ---: | ---: | --- |
| 1440x900 | idle | 16.7 | 16.7 | 1.000 | passed |
| 1440x900 | inspection-orbit | 50.0 | 83.4 | 1.668 | failed |
| 1440x900 | pan-in-inspection | 16.8 | 83.3 | 4.958 | failed |
| 390x844 | idle | 16.7 | 16.7 | 1.000 | passed |
| 390x844 | inspection-orbit | 16.7 | 33.4 | 2.000 | failed |
| 390x844 | pan-in-inspection | 16.8 | 16.7 | 0.994 | passed |

Every group uses three30s samples per source after5s warmup; source order alternates. The viewport, DPR1, fixture, initial camera zoom19.2/pitch60 and threshold are frozen. The application matches candidate-cycle20.json. V4 remains preserved as failed setup evidence; V5 corrected CSS resolution without changing the app, fixture or threshold.

## Environment and limits

Nodev22.23.3; Chromium149.0.7827.55; 11th Gen Intel(R) Core(TM) i7-11800H @ 2.30GHz; WSL6.18.33.2-microsoft-standard-WSL2. Renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver).

Timing measures RAF callback intervals and trusted pointer-event-to-next-RAF scheduling, not display presentation latency or hardwareFPS. Input latency samples remain in every raw JSON. A synthetic style and common initial camera are used; real-map timing is collected separately. The candidate and baseline have different rendering features and orbit trajectories. This is an application-behavior regression result, not causal attribution to Three or any specific API.

## Evidence and next decision

[Full result](performance-candidate-v5/result.json), [independently recomputed raw statistics and hashes](performance-candidate-v5/integrity.json), [runner review](performance-candidate-v5/REVIEW.md), [source hypotheses](PERFORMANCE-TRIAGE.md), and [real-map procedure](REAL-MAP-PERFORMANCE.md).

Cycle21 repaired the runner and completed its authorized benchmark. All21 correction cycles are used. Any application optimization requires a new bounded decision. The next recommendation is a short profile, a minimal patch only for an evidenced bottleneck, affected regression/visual checks, and a fresh frozen run under the unchanged threshold. No automatic engine/model upgrade or baseline replacement.
