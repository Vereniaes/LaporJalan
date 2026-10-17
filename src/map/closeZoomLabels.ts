// Keep road labels out of the extreme zoom range that breaks MapLibre 4 line placement.
import type { Map } from 'maplibre-gl';

export function manageCloseZoomLabels(map: Map) {
  const visibility = new globalThis.Map<string, 'visible' | 'none' | undefined>();
  const update = () => {
    const close = map.getZoom() >= 22;
    for (const [id, original] of visibility) {
      if (!map.getLayer(id)) continue;
      const value = close ? 'none' : original;
      if (map.getLayoutProperty(id, 'visibility') !== value) {
        map.setLayoutProperty(id, 'visibility', value ?? null);
      }
    }
  };
  const capture = () => {
    visibility.clear();
    for (const layer of map.getStyle()?.layers ?? []) {
      if (layer.type !== 'symbol') continue;
      const placement = layer.layout?.['symbol-placement'];
      if (placement === 'line' || placement === 'line-center') {
        visibility.set(layer.id, layer.layout?.visibility);
      }
    }
    update();
  };
  map.on('style.load', capture);
  map.on('zoom', update);
  capture();
  return () => {
    map.off('style.load', capture);
    map.off('zoom', update);
  };
}
