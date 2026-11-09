/* Todo:
-> one drawing request at a time for a stretch (line) or an area, shared by the map page and the account page
    -> onActive lets each page make room for the map while drawing
*/
import { useState } from 'react';
import type { ConditionGeometry, GeometryDrawingStarter } from './condition';

export type DrawingRequest = { id: string; mode: 'line' | 'area'; complete: (geometry: ConditionGeometry) => void };

// input param : onActive(true) when drawing starts, onActive(false) when it ends either way
// output      : the open request (for PublicMap) and start/finish/cancel for the form and the map
export function useDrawing(onActive?: (active: boolean) => void) {
  const [drawing, setDrawing] = useState<DrawingRequest | null>(null);
  const start: GeometryDrawingStarter = (mode, complete) => { onActive?.(true); setDrawing({ id: crypto.randomUUID(), mode, complete }); };
  function finish(geometry: ConditionGeometry) { const request = drawing; setDrawing(null); onActive?.(false); request?.complete(geometry); }
  function cancel() { setDrawing(null); onActive?.(false); }
  return { drawing, setDrawing, start, finish, cancel };
}
