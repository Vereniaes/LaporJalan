import { conditionSymbols } from '../../src/public-reports/conditionFeatures';
/* Check observation freshness and physical scale decisions. */
import { test, expect } from '@playwright/test';
import { closureNeedsUpdate,getInspectionRepresentation,type RoadCondition } from '../../src/public-reports/condition';
const condition:RoadCondition={kind:'closure',observedAt:'2026-10-27T12:00:00.000Z',locationConfirmed:true,source:'reporter',geometry:{type:'Point',coordinates:[106.8232095,-6.196562]},access:'closed'};
test('closure becomes stale at 24 hours and never changes its reported access',()=>{
 expect(closureNeedsUpdate(condition,Date.parse(condition.observedAt)+86_400_000-1)).toBe(false);
 expect(closureNeedsUpdate(condition,Date.parse(condition.observedAt)+86_400_000)).toBe(true);
 expect(condition.access).toBe('closed');expect(closureNeedsUpdate({...condition,kind:'construction'},Date.parse(condition.observedAt)+86_400_000)).toBe(false);
});
test('missing dimensions stay symbolic; reported meter values select a bowl without a floor',()=>{
 const pothole={...condition,kind:'pothole' as const};expect(getInspectionRepresentation(pothole)?.kind).toBe('symbol');
 const rep=getInspectionRepresentation({...pothole,dimensions:{method:'measured',tool:'Meteran uji',widthM:.52,depthM:.075}});
 expect(rep?.kind).toBe('bowl');expect(rep?.widthM).toBe(.52);expect(rep?.depthM).toBe(.075);
 expect(getInspectionRepresentation({...pothole,dimensions:{method:'estimated',widthM:.005,depthM:.001}})?.widthM).toBe(.005);
});


test('symbol geometry stays at the confirmed condition point when the report pin differs',()=>{
 const condition={kind:'closure',observedAt:'2026-10-28T10:00:00Z',source:'reporter',locationConfirmed:true,geometry:{type:'Point',coordinates:[106.85,-6.21]}} as const;
 const symbols=conditionSymbols(condition as any,[106.84,-6.2]);
 const ring=(symbols.features[0].geometry as any).coordinates[0] as number[][];
 const lngs=ring.map(p=>p[0]),lats=ring.map(p=>p[1]);
 expect((Math.min(...lngs)+Math.max(...lngs))/2).toBeCloseTo(106.85,7);
 expect((Math.min(...lats)+Math.max(...lats))/2).toBeCloseTo(-6.21,7);
});
