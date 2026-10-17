# Cycle23 source review

Reviewer: root. The assigned independent reviewer reached a runtime usage limit before reviewing this patch; independent approval is not claimed.

Only Map3D differs from cycle22. The mode effect uses public MapLibre4.7.1 getPixelRatio/setPixelRatio. Installed map.ts shows that setting the ratio calls resize and retains the map/context. It changes the drawing-buffer request, not geographic coordinates, camera target, cavity vertices, media or data. Inspection restores native device ratio; navigation floors it at1.5. A cleaned window resize listener re-reads devicePixelRatio. Repeated same-ratio events avoid redundant resize. Existing ResizeObserver continues sizing/padding. Map removal and effect cleanup release owned references/listeners; no context loss or canvas replacement was introduced.

Cycle23 frozen source manifest contains25 files; compared with cycle22 only src/components/Map3D.tsx changed. Build, mode/resize tests, current visual inspection and V7 are pending. Source review supports the minimal approach but cannot prove rendering behavior or timing.

Diagnostic limits: real-city ABBA used two short samples per variant on SwiftShader; one desktop AAtrue sample ended with sourceReady=false. SSAA1.5 was compared to AAtrue/native, not to current AAfalse/native, so it does not demonstrate zero added cost over cycle22. Higher resolution still has residual aliasing and does not reproduce MSAA exactly. V7 uses the unchanged acceptance workload and threshold.
