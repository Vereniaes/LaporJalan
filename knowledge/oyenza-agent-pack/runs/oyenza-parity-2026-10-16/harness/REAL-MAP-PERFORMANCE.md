# Real-map timing observation

Status: executed after V5 completed. Desktop/mobile collection passed, exit0. Results and trace-overhead limits are in REAL-MAP-RESULTS.md. This is observational evidence, not a timing acceptance pass, new threshold or repair cycle. The command below is retained as execution provenance; do not rerun without a fresh output ID and reason.

From the frontend WSL directory, after GO:

```sh
PW_OUTPUT=knowledge/oyenza-agent-pack/runs/oyenza-parity-2026-10-16/harness/performance-real-map /home/vereniaes/.nvm/versions/node/v22.23.3/bin/node node_modules/@playwright/test/cli.js test tests/performance-real-map.browser.spec.ts --project=desktop --project=mobile
```

One worker runs two viewport cases sequentially, timeout150s each. Each uses actual live OpenFreeMap style/tiles/sprites at the verified mapped-road.json OSM anchor, synthetic52cm/7.5cm dimensions, normal app inspection camera (desktop25.5/mobile25), and the actual Orbit action. After5s of real RAF warmup it records three30s samples per viewport. Pointer hovers alternate2CSSpx once per second at a DOM-validated unobstructed canvas target. Backend writes remain locally rejected405; example media remain mocked. The map-domain route explicitly preserves live sprite images that the shared helper otherwise mocks.

JSON attachments contain raw RAF intervals, trusted pointer-event-to-next-RAF latency, median/p95/count, renderer frame progression, camera/style readiness, map input and viewport bounds, browser/GPU/CPU/OS, errors, failed map requests and map-anchor provenance. The shared helper fixes Date only; performance.now/RAF stay real. The final screenshot captures the settled observation state. A test pass means samples/readiness/frame progression are valid; no timing pass threshold is applied. Paired V5 median(samplep95candidate)<=1.20baseline remains unchanged and separate. These observations do not establish deviceFPS, display presentation latency or production data accuracy.

No application, fixtures, existing helper/tests, paired runner or frozen manifests were changed. Preparation did not launch a browser or measurement. If live-map readiness fails or samples are invalid, preserve failure artifacts and report the limitation without automatic repair.
