# Independent V5 performance harness patch review

Scope: read-only review of tests/performance.mjs and V4/V5 frozen manifests against the V4 diagnosis. No browser, benchmark, test, application/runner edit, source rewriting, delegation, commit or push was performed. Only this review file was written. Reviewer authored the original runner and diagnosis; this is review of root's subsequent correction, not approval of the original failing harness. Requested model gpt-6.1-sol/medium; actual model telemetry unavailable.

Verdict: approved for the bounded correction scope. The patch addresses the diagnosed CSS isolation/input sampling cause without weakening the comparison threshold or altering either application's frozen source. This verdict does not establish setup execution success, a performance pass or full U03 acceptance.

## Checks and evidence

Read-only Python comparison exited0 and reported all six checks true:

- V4/V5 settings identical.
- Fixture source hash and transpiled fixture module hash identical.
- Current runner SHA256 matches V5 manifest runnerHash.
- Baseline source hash map identical between V4 and V5.
- Candidate source hash map identical between V4 and V5.
- Every frozen V5 source file matches its declared SHA256.

The copies at /tmp/laporjalan-performance-O4u3Yb are therefore not rewritten to favor either side. Both versions still use the same installed dependencies, browser arguments and network fixture policy. V4 remains preserved as failed.

## Patch assessment

1. Lines87-92 load each frozen source's own tailwind.config.js, preserve its theme/plugins/options using object spread, resolve original content glob paths against that source.root (including negative glob prefixes), and explicitly pass Tailwind/autoprefixer through Vite css.postcss. Both actual frozen configs use string content arrays, so the implemented mapping fits the inputs. It avoids shared process.chdir and leaves the existing frozen source/config files untouched. Separate Vite caches remain intact. This matches the successful bounded diagnosis probe.
2. Lines123-131 compute the original scenario input coordinates and verify hover/drag endpoints are inside the viewport and hit the map canvas through elementFromPoint. Invalid setups fail and save their geometry/input evidence. No clamping, threshold relaxation or silent replacement of an obstructed target was introduced.
3. Lines157-160 save the raw sample artifact before rejecting insufficient RAF/input observations or application errors. This fixes V4's diagnostic evidence loss. Missing input is still a failure rather than a pass with null statistics.
4. --check covers both sources, two viewports and three scenarios (12 setup combinations), uses a separate check-started/check-result/check-error artifact namespace, and labels its result Setup only, no benchmark verdict. It does not collect the 3x30-second measurements and cannot substitute for --run.
5. Full --run retains three30-second samples, five-second warmup, real monotonic RAF timestamps, DPR1, desktop1440x900/mobile390x844, the same scenarios and pose(center106.8232,-6.1965;zoom19.2;pitch60;bearing0), alternating sample ordering, identical synthetic report/style/static media, and the same median(samplep95 candidate)<=1.20*baseline rule. No acceptance condition or duration was weakened.

## Limits to retain in final reporting

- --check returns before the later full-sample pageerror assertion. Its success proves the intended input geometry and DOM hit checks, not a clean application-error run, receipt of trusted input events or a benchmark result. Full --run does record and reject page errors and missing input samples.
- The unchanged input warmup is RAF-based and does not issue pan gestures during its warmup; the measured pan phase does. This is a pre-existing scenario characteristic, not an expanded performance guarantee from this patch.
- Idle RAF sampling measures browser scheduling even when the map has no pending repaint. Input-event-to-next-RAF latency is not display presentation latency. Synthetic style/media and equal camera pose omit real tile/network workloads; SwiftShader results do not establish device60FPS.
- This review launched no browser and makes no claim about root's concurrently running --check/full benchmark outcome. U03 depends on the completed full measurement evidence and the scoped environment limitations, not this approval alone.
