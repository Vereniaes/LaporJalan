# V4 performance runner failure diagnosis

This is a harness diagnosis, not a benchmark or performance pass. No application, runner, frozen source, threshold, or V4 failure artifact was changed. The only writes are diagnostic scripts/results in sibling performance-diagnostic and this report. No full measurement was repeated.

## Observed cause

V4 failed at tests/performance.mjs:137 before any completed sample. It combines two preconditions into one message: at least two RAF intervals and at least one input latency. V4 error.json omits raw values because the runner throws before writing the sample artifact.

A bounded scratch probe reused the immutable V4 baseline source and the same browser/fixture/network policy. It used an external diagnostic Vite cache and did not edit the frozen tree. Two 3-second diagnostic windows produced:

- Original event names: 100 RAF intervals, 0 latencies, 0 events.
- Additional mousemove observation: 180 RAF intervals, 0 latencies, 0 events.
- Canvas bounding rectangle: x=1440, y=0, width=400, height=900, at a 1440x900 viewport.

The runner computes x=box.x+box.width*0.6 at line117, giving x=1680. That point is outside the viewport. page.mouse.move therefore does not produce an input event in the document. RAF was available; input samples were missing. Adding mousemove does not repair the cause.

The baseline layout was invalid because in-process Vite/Tailwind config resolution and relative content globs used the invoking repository context rather than explicitly isolating the frozen baseline's Tailwind configuration and content. Baseline-only layout classes were not generated correctly. Its canvas moved outside the viewport. This is a benchmark setup defect, not an application performance failure or missing browser capability.

## Controlled confirmation

A second bounded scratch probe changed only its diagnostic Vite CSS pipeline: import the baseline tailwind.config.js explicitly and pass absolute baseline index.html and src/**/*.{js,ts,jsx,tsx} content globs to tailwindcss, plus autoprefixer. It used its own new cache. The corrected diagnostic canvas bounds were x=460, y=0, width=980, height=900 at viewport1440x900, placing its input x=1048 inside the canvas. Same baseline, viewport, routes and original pointer event names now produced 171 RAF intervals and 3 trusted pointermove latency samples during three seconds. Adding mousemove as an observation produced 180 intervals and six records, as expected from observing both event types. This confirms configuration/layout isolation, rather than event-name replacement, is the correction needed.

Evidence:

- ../performance-diagnostic/probe.mjs
- ../performance-diagnostic/probe-result.json
- ../performance-diagnostic/probe-explicit-tailwind.mjs
- ../performance-diagnostic/probe-explicit-result.json

Both probes exited0 and cleaned up their owned server/browser. They are short diagnostics, not the required 3x30-second paired samples and not a change to the frozen 1.20 threshold.

## Minimal proposed correction, not implemented

1. In the runner's createServer call (line85), explicitly load each frozen source's own Tailwind config and give its content globs absolute paths, using Vite css.postcss with the already installed tailwindcss/autoprefixer plugins. The diagnostic demonstrates this limited fix; no package install is needed. Alternatively, separate child processes with the source root as cwd can isolate default config resolution, but this is more orchestration than the explicit CSS config.
2. Before warmup/sampling, validate that the intended input point lies within both viewport and canvas, and that elementFromPoint targets the actual map/canvas rather than a panel/HUD. This detects invalid setup without silently clamping points or changing scenarios.
3. Save raw failed sample counts/data before throwing at line137. Keep missing samples a failure and retain the existing acceptance threshold.
4. Preserve V4 as failed. A corrected harness requires a new manifest/run ID and independently reviewed setup before starting the full paired measurement.

No correction is authorized by this diagnosis. Budget is exhausted at 20/20, so root must obtain any required additional authorization before editing or rerunning the full benchmark. U03 remains incomplete; no median/p95 ratio, 60FPS, device performance or benchmark pass can be claimed from these probes.

Installed API/config verification: Tailwind3.4.19, Vite5.4.21, and existing postcss.config.js uses tailwindcss/autoprefixer. Both frozen Tailwind configs declare content ['./index.html', './src/**/*.{js,ts,jsx,tsx}']. The diagnostic imports the config, preserves its theme/plugins/options by object spread, and passes plugins through Vite css.postcss.plugins. The proposed runner correction should map the original content entries with path.resolve(source.root, glob), preserving future glob exclusions/options, rather than hardcode replacement globs or call process.chdir while two servers coexist.
