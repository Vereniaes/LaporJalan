# Initial execution diagnosis and selector correction

Status: original root execution completed exit1,20 passed/6 failed/0 skipped; corrected spec is **not_run**. Root confirmed terminal session70409 before authorizing this edit. No browser was launched by this verifier. Root's original artifacts remain under `execution/`; original results and byte-identical test source are additionally retained under `archive/`.

## Proven harness corrections

1. Original C05 marker lookup timed out on `aria-label="Fixture pothole 52 cm"`. Installed MapLibre4.7.1 `node_modules/maplibre-gl/src/ui/marker.ts:319` unconditionally overwrites custom element aria-label inside `addTo`. The existing title survives. Selector now uses `.map-report-marker[title="${fixture.report.title}"]`; dispatch timing and all intended behavior assertions are unchanged.
2. Original M03 image lookup failed strict-mode resolution on four elements: the photograph and three Lucide SVG icons. The error context explicitly lists the intended image and exact alt text. Both popup image assertions and expanded-image assertion now use `getByRole('img', { name: 'Gambar contoh untuk ' + b.name, exact: true })`. Expected URL/naturalWidth/title/anchor<=2CSSpx/focus return remain unchanged.

The complete four-line selector diff is `selector-corrections.diff`. Neither image matching `.first()` nor relaxed locator/assertion thresholds were used.

## Separate application findings

- **Marker accessible names are overwritten.** Application `Map3D.tsx:527-534` and `547-555` sets meaningful camera/report title and aria-label before calling `.addTo(map)`. The installed library then replaces aria-label with locale `Marker.Title`, whose installed default is `Map marker` (`default_locale.ts:10`). Original browser snapshots show all six camera/report buttons named Map marker. This is an actual A01 naming finding, independent of correcting the C05 behavioral-test locator. No application repair is authorized or performed.
- **Search then manual2D interrupts the target flight.** Original desktop run expected106.824 but settled at106.82329332414508, exceeding unchanged6-decimal precision by0.0007066758549143515degrees. This is not a selector defect. `Map3D.tsx:590-603` stops the previous animation before starting each move. Search passes its center at613-615. The mode-change branch630-632 supplies only zoom, so toggling2D during a flight retains the intermediate center instead of completing the latest target. Source explains the observed failure; no assertion or code correction was made. The selected-report-clear branch633-634 can also stop motion; exact interleaving of that branch in other scenarios remains unverified.

The keyboard proposal's CCTV case also has a generic `dialog.getByRole('img')` locator and will need the same exact named-image disambiguation before its first run. That separate spec remains frozen/unchanged pending root authorization, at SHA21a52fcdee167e41a9deb17709359df1cf03cff50386e97bfa07bcf65e3903cf.

## Integrity and next step

| Artifact | SHA256 |
| --- | --- |
| Archived original spec | `e8bd2c5aecc1f9d585e8760b71e9f1082def9a9a61e486c7e71c6aba27a9bb71` |
| Corrected current spec | `015a932d2e0bd53ad6ea5657e24318c646f6b0c3f020915de3c243818c35f02c` |
| Original and archived results JSON | `d8b1747e1c2b6898e95f04f3ec18ed3bb2a7dbbf69170d19f36fd2d6eae24336` |

Only assigned harness source/archive/report paths were written. Selector correction consumes no application repair cycle; budget22/23 and remaining performance-only authorization are unchanged. No compile, collection or browser rerun occurred. Root must review the diff and schedule any subsequent run after the sole timing workload finishes. Keep original failures as historical evidence; corrected behavioral outcomes remain unknown.
