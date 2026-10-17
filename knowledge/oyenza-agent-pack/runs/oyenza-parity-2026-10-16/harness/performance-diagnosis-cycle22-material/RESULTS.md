# New material AA comparison

Diagnostic only. Four fresh contexts at the existing synthetic benchmark starting pose, desktop1440x900/DPR1, real orbit and trusted pointer movement. Two10-second samples per option with2.5-second warmup, alternating option order. No Playwright tracing or CPU profiler. Stage wrappers remain installed, so these are not acceptance samples. Source hashes match the preparedV6 candidate, with only context AA overridden before initialization. No application source was edited.

| Context | Sample | Actual MSAA samples | RAF p95 ms |
| --- | --- | --- | --- |
| aa-off | 1 | 0 | 33.4 |
| aa-on | 1 | 4 | 66.7 |
| aa-on | 2 | 4 | 66.7 |
| aa-off | 2 | 0 | 33.4 |

The AA-disabled option is faster in these short paired diagnostics; AA-enabled preserves smoother city edges but does not show equivalent timing. The candidate retains AAfalse for a complete unchanged-threshold benchmark, as an evaluated option with an explicit unresolved city-quality tradeoff. This is not acceptance of a visual regression or evidence of device FPS. All application errors were empty. Setup/scale/anchor information and raw stage/RAF arrays remain in each sample.
