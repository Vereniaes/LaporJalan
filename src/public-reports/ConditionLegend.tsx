/* Todo:
-> explain the condition colours and patterns drawn on the map
    -> families and kinds come from CONDITION_FAMILIES, labels from CONDITION_LABELS
*/
import { Layers } from 'lucide-react';
import { CONDITION_LABELS } from './condition';
import { CONDITION_FAMILIES, swatchStyle } from './conditionFeatures';

export function ConditionLegend() {
  return <details className="lj-legend">
    <summary><Layers size={16} aria-hidden="true" /> Jenis kondisi</summary>
    {CONDITION_FAMILIES.map(family => <section key={family.label}>
      <h3>{family.label}</h3>
      <ul>{family.kinds.map(kind => <li key={kind}><span className="lj-swatch" style={swatchStyle(kind)} aria-hidden="true" />{CONDITION_LABELS[kind]}</li>)}</ul>
    </section>)}
    <p>Digambar pelapor. Bercak pada titik hanya penanda, bukan ukuran.</p>
  </details>;
}
