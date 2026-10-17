# Actual-map timing observation

Collection completed:2 tests passed, exit0, three30s samples per viewport. This is a sample-validity result, **not a performance acceptance pass**. The paired V5 performance gate remains failed.

| Viewport | RAF median per sample (ms) | RAF p95 per sample (ms) | Input-to-RAF p95 per sample (ms) |
| --- | --- | --- | --- |
| desktop | [127, 137, 132] | [204, 230, 210] | [128, 152, 124] |
| mobile | [99, 96, 104] | [148, 163, 164] | [19, 91, 137] |

Live OpenFreeMap tiles and sprites were preserved, backend writes were blocked, and the fixture uses synthetic0.52m/0.075m damage at the verified OSM road anchor. Normal inspection zoom was25.5desktop/25mobile. App errors were empty and the custom-layer render count increased in every sample. The final screenshots were opened: the green cavity stays within the unobstructed map area on both viewports.

This run uses Chromium149, SwiftShader, DPR1 and active Playwright tracing/screenshots. That tracing adds overhead, which was not isolated. Do not compare these timings directly with untraced V5 or claim deviceFPS. Repeated request-aborted events are retained in raw evidence; their recorded cumulative counts remained12 on desktop and9 on mobile across all three samples. No provider outage or cause is inferred. The sample count differs from render count because counters are read around additional input/completion work.

[Summary, provenance and hashes](performance-real-map/summary.json), [original Playwright report](performance-real-map/results.json), [desktop data](performance-real-map/desktop-observation.json), [mobile data](performance-real-map/mobile-observation.json), [paired benchmark verdict](PERFORMANCE-RESULTS.md).
