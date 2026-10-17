# Cycle22: remove measured diagnostic cost from normal rendering

Authorization: user added at most2cycles for performance profiling/minimal repair on17October2026 Asia/Jakarta. Cap23; cycle22/attempt1 allocated. No commit or push.

Evidence before patch: V5 failed3of6performance groups. Source is unchanged from the82-case candidate. Preliminary same-workload stage measurements place about98% of custom-layer CPU elapsed inside two DEPTH_RANGE queries. Bounded query-elision and no-draw diagnostic variants must complete before implementation; those variants are not accepted application candidates.

If ablations confirm query cost, the minimal patch is an optional verifyDepth flag in DamageLayerOptions, default off. Guard only the two diagnostic queries. Preserve matrices, projected anchor, resetState, materials, physical dimensions, all draws and camera behavior. Synthetic prototype explicitly enables verifyDepth. Its four-bearing oracle must assert actual two-number finite arrays before equality, preventing null==null from passing. No cached depth values are accepted as verification evidence.

Ownership: root writes DamageLayer and ledger; verifier may update only prototype fixture and geometry oracle after explicit dispatch. The two query guards change normal execution cost while opt-in tests retain actual WebGL observations. No dependency or renderer change.

Verification: TypeScript/build, affected geometry/occlusion/projection/lifecycle/around-anchor and regression suite on both viewports, independent patch review. Then freeze a new candidate for the existing paired benchmark; preserve source baseline, fixture, settings and1.20threshold. Do not overlap browser benchmarks. A failed result uses the remaining bounded attempt only after an evidenced diagnosis, never an automatic threshold or baseline change.

## Diagnostic revision before implementation

The six short ablations did not establish RAF improvement from query elision or removing all custom draws. Full p95[100,83.4], query-elided[116.8,83.4], no-custom-draw[116.7,83.4]ms. Query duration identifies CPU blocking location but may include waiting on earlier GPU work; it is not sufficient proof of the frame-time cause. The proposed verifyDepth patch is deferred.

A source difference now being isolated is candidate Map3D antialias:true versus the baseline's defaultfalse. Fresh contexts request antialias:false, confirm actual attributes and SAMPLES, and measure unchanged custom draw/camera behavior. A second variant additionally elides diagnostic queries. Close-inspection screenshots on both viewports must establish the visual tradeoff before any accepted patch. The shared-map geometry and anchor behavior are preserved.

Primary context reference: [MDN getContextAttributes](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getContextAttributes) documents querying actual context attributes, which can differ from requested values. Installed MapLibre4.7.1 source remains the version authority; newer documentation nests context options differently and is not copied into this patch.

## Selected patch after failed visual probes

Simple AAoff line rendering, positive solid depth bias and0.1mm visualwire separation all failed continuous-grid visual review. Those diagnostics remain rejected. The chosen cycle22 patch instead renders the grid in the filled surface material using per-triangle barycentric coordinates and fragment derivatives. This preserves the same physical triangles/profile/depth while removing the separate coplanar line draw. A small material helper localizes the shader. Map MSAA is disabled and actual DEPTH_RANGE diagnostics become opt-in for prototype validation. Camera, dimensions and controls are unchanged.

Reference pattern: [Three.js r170 wireframe example](https://github.com/mrdoob/three.js/blob/r170/examples/webgl_materials_wireframe.html). Its per-triangle edge-distance technique is applied to opaque surface color, not copied as a transparent alpha-to-coverage layer. The installed r170 opaque_fragment injection point is checked locally. No alphaToCoverage, depth bypass, physical displacement or engine upgrade. Geometry vertices are expanded only to carry independent per-triangle attributes; coordinates remain the same.

Visual and blocker checks must pass before any new paired benchmark. A timing pass cannot excuse missing grid segments or incorrect occlusion.
