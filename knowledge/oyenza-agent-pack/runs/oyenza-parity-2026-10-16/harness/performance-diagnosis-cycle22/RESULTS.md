# Cycle22 performance diagnosis

Diagnostic scope only: desktop1440x900, DPR1, synthetic V5 fixture, common posezoom19.2/pitch60, actual application Orbit, ChromiumSwiftShader. Existing local app3002 was reused. No app, paired runner, frozen source, threshold or acceptance baseline was changed. No full benchmark was run. Six fresh-context ablation observations used2.5s warmup and10s capture each, plus a separate5s unchanged CPU profile. All commands completedexit0; errors arrays were empty. Source hashes before/after matched each other and all V5 candidate source/config hashes. The diagnostic wrapper adds timing overhead and CPU profiling is kept separate from unprofiled ablations.

## Results

| Variant | sample1 RAFp95 ms | sample2 RAFp95 ms | custom-render CPU elapsed per10s | DEPTH_RANGE query CPU elapsed per10s |
| --- | ---: | ---: | --- | --- |
| Full | 100 | 83.4 | 8173.7 / 8654.3ms | 7978.9 / 8502.4ms |
| Return cached DEPTH_RANGE only during this layer render | 116.8 | 83.4 | 191.5 / 129.6ms | 0.5 / 0ms |
| Skip custom draw, keep actual application camera/input | 116.7 | 83.4 | 0 / 0ms | 0 / 0ms |

The two gl.getParameter calls account for about97.6%-98.2% of instrumented custom-render CPU elapsed in full samples. This is a blocking observation at the query boundary; it can include waiting for queued renderer/driver work. It is not a measurement of GPU execution time. Removing those reads drastically reduces time spent inside that JavaScript function but does NOT improve the observed RAFp95 in these short diagnostic samples. Skipping custom draw also does not materially improve the two RAFp95 observations. Therefore the query sites are a clear production instrumentation cost but are not established as the sole cause of the paired U03 frame-time failure.

CPU stage timing means during full samples: resetState0.084-0.141ms/call; Three.render0.379-0.435ms/call; map.easeTo0.425-0.604ms/call. These synchronous CPU times exclude completion of asynchronously queued graphics work. The separate5s sampled CPU profile contains3364 top-self samples at native getParameter, with401idle samples, corroborating where the main thread waits. It does not identify all upstream graphics work responsible for that wait.

## Diagnostic implementation and validity

profile.mjs wraps the existing layer instance in each fresh browser context. It never edits source. getParameter intercepts only DEPTH_RANGE queries while inside that specific custom render; all other parameters and calls outside that render use the original function. Cached values are used solely for an ablation and must not become a production substitute for live depth-validation evidence. No-custom-draw returns from the layer render and is intentionally not a functional cavity implementation.

Actual Orbit, scene inputs, startpose, browser settings and hover input are the same across variants. Before/after bearing, renderCount, rawRAF/latency arrays and per-call stage values are saved. Normal application orbit remains time-based; warmup and scheduling variance affect exact sampled angles. Variant order is fixed rather than randomized, observations are short and desktop-only, and browser/software rendering conditions are not device performance. Results cannot be presented as a new acceptance threshold verdict.

Evidence: source-hashes.json, source-hashes-after.json, unchanged-cpu-profile.json, profile-top-self.json, summary.json, and all profile-full/full/cached-depth-queries/no-custom-draw JSON files. The script/summary records Node/CPU/OS/browser and actual GPU renderer.

## Recommendation

The smallest defensible production change is opt-in depth verification: default verifyDepth=false guards only the two gl.getParameter reads, while renderer.resetState, rendering, geometry, depth behavior, around-anchor camera and projectedAnchorCss stay unchanged. This removes expensive validation overhead from normal use. It must not return stale or fabricated depth values. It is justified as instrumentation cleanup, not a promised repair of U03RAF ratios.

The prototype should explicitly set verifyDepth:true; every-bearing geometry tests must assert both reported depth ranges are actual length2 arrays of finite numbers before retaining their existing equality assertion. This preserves live per-frame depth evidence and prevents null==null passing. Root authorized and this worker applied only those two test-fixture/assertion edits after all diagnostics ended; no browser re-run was started. Root owns the app option implementation and validation.

For further frame-time attribution, there is an untested source-level difference beyond this layer: candidate Map3D constructs the map with antialias:true, whereas before omits antialias. Whole-map antialias/MSAA cost under SwiftShader would remain when the custom draw is skipped. Camera paths also differ (easeTo around vs baseline setBearing/jumpTo, time-based vs fixed-per-frame angular progression), so V5 is a whole-application scenario comparison rather than an isolated cavity renderer comparison. These are hypotheses to isolate under separately authorized work; no causal claim or additional ablation is made here.

No extra repair, threshold change, geometry simplification, depth disable, around-anchor removal, engine upgrade or misleading diagnostics are recommended from this evidence. Final performance acceptance requires the authorized candidate and full original benchmark protocol; this diagnostic does not replace it.

## Authorized antialias extension

Four new fresh-context desktop10s samples used the same source, fixture, pose, around-anchor Orbit and input. A canvas getContext wrapper changed only the WebGL context antialias creation option, recording actual getContextAttributes().antialias=false and gl.SAMPLES=0. No source was changed. Old observations were retained unchanged. New files: profile-antialias.mjs, aa-summary.json, aa-off-full-{1,2}.json, aa-off-cached-{1,2}.json, aa-source-hashes.json and aa-source-hashes-after.json.

| Variant | RAFp95 samples ms | Inputlatencyp95 samples ms |
| --- | --- | --- |
| antialias:false, live depth queries | 66.7 / 66.7 | 82.8 / 69.7 |
| antialias:false, cached depth query diagnostic | 50 / 50 | 8.7 / 11.3 |

The combination shows a short-run frame/input scheduling benefit over antialias:false alone; this supports testing both minimal changes together. Unlike query elision alone with MSAA active, the combined change improves these observed RAF samples. This is a conditional result on this desktopSwiftShader workload, not a proven general GPU cause or acceptance result. No threshold or baseline was changed.

Normal inspection visual captures are separate from the19.2 timing scenarios: antialias-visual.mjs saved aa-off-normal-1440.png/json atzoom25.5 and aa-off-normal-390.png/json atzoom25. Both images were actually opened. Bowl framing, rim and interior remain visible; controls/layout are unaffected. Compared with cycle20 antialias-on captures, fine wireframe lines are visibly more jagged, discontinuous and stippled, especially inside the desktop bowl. Disabling MSAA has a real visual cost; it is not pixel-equivalent or a free optimization. Source geometry, scale, depth and camera remain unchanged. These images use synthetic map style, not live-road image evidence.

All source/config hashes were verified unchanged after the extension and still match the V5 candidate. Diagnostic browsers endedexit0. Root reauthorized prototype/oracle edits after pixels were inspected: prototype now opts into verifyDepth:true, and every-bearing geometry case requires actual length2 finite-number arrays before comparing before/after depth ranges. Existing geometry/projection/lifecycle assertions remain. No browser suite was run after those edits; root owns app guards and validation.

Final bounded recommendation: antialias:false plus optional verifyDepth with production defaultoff, guarding only the two actual GL queries. Keep live-query prototype opt-in and strengthened assertions. Preserve shared-context depth behavior, physical geometry and around-anchor camera. Report the wireframe aliasing tradeoff and run the unchanged full acceptance/performance protocols on the resulting candidate. Cached return values were diagnostic-only and must not be shipped as fake validation evidence.

## Bounded solid-material depth-bias visual probe

Requested diagnostic: antialias:false, same normal inspection geometry/camera, set only the solid MeshStandardMaterial polygonOffset=true, polygonOffsetFactor=1, polygonOffsetUnits=1 at runtime. Existing GL_LINES, mesh vertices and global depth tests were left unchanged. Script antialias-depth-bias-visual.mjs completedexit0, saving new aa-off-depth-bias-1440.png/json and aa-off-depth-bias-390.png/json without replacing earlier evidence. Both actual contexts report antialiasfalse/SAMPLES0; zooms25.5/25. No application or existing test files were changed by this probe.

Visual verdict: failed. Both opened PNGs show broad missing wireframe sectors around the upper/side bowl and a fan-like discontinuity near the center. Some remaining lines appear continuous, but overall visibility is materially worse than the old MSAA-on reference and does not restore its uniform mesh. The probe is not an acceptable fidelity-preserving substitute. No blocker case or additional parameter attempt was run because the primary visual probe already failed and the bounded instruction requires stopping without more changes.

Recommendation: do not ship this positive solid-material bias solely on these results, and do not describe raw antialiasfalse as fidelity-equivalent. Retain prior diagnostic performance benefit as a separate observation. Further visual approach or product-quality tradeoff requires root's decision within the remaining authorized scope; this worker made no app repair.

## Final bounded wire-overlay separation probe

antialias-wire-separation-visual.mjs completedexit0 and saved aa-off-wire-separation-1440.png/json plus aa-off-wire-separation-390.png/json. It starts fresh contexts with antialiasfalse, no failed solid material polygon offset, and sets only wireframe mesh.position.z=0.0001m (0.1mm). Physical filled-bowl vertex data, width/minZ, around-anchor camera, depth testing and other scene objects are unchanged; diagnostic state still records0.52m/-0.075m geometry. Both PNGs were opened.

Visual verdict: failed to satisfy the requested continuous-line criterion. The large missing sectors from the prior positive solid-bias probe are gone, but many wire segments remain visibly dotted/discontinuous across the inner and far bowl on both desktop and mobile. Some lines, especially the right-side/radial segments, improve; uniform continuous AA-on readability is not restored. Rim, body and framing remain unchanged. This limited improvement is insufficient to approve replacing the prior visual baseline.

No additional variant, blocker experiment, application edit or parameter tuning was performed. Retain the existing antialias-on application until root accepts another supported approach or explicit quality tradeoff. Query opt-in evidence/test edits remain as authorized and are independent of this failed visual alternative.
