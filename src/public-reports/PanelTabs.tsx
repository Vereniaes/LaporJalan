/* Todo:
-> the panel's three views (owner, 11 Nov): Peta | Laporan | Rute
    -> a segmented control: the open tab is a white pill with a green ring
    -> the tab lives in the URL (?tab=), a report link (?laporan=) opens Laporan
*/
export type PanelTab = 'peta' | 'laporan' | 'rute';
export const PANEL_TABS: { id: PanelTab; label: string }[] = [{ id: 'peta', label: 'Peta' }, { id: 'laporan', label: 'Laporan' }, { id: 'rute', label: 'Rute' }];

// tab from the address: ?tab=, else Laporan for a shared report link, else Peta
export function readTab(): PanelTab {
  const params = new URLSearchParams(location.search), asked = params.get('tab');
  if (PANEL_TABS.some(tab => tab.id === asked)) return asked as PanelTab;
  return params.has('laporan') ? 'laporan' : 'peta';
}
// keep the address in step without adding a history entry (the back button stays for reports)
export function writeTab(tab: PanelTab) {
  const url = new URL(location.href);
  tab === 'peta' ? url.searchParams.delete('tab') : url.searchParams.set('tab', tab);
  history.replaceState(history.state, '', url);
}

export function PanelTabs({ tab, onChange, disabled }: { tab: PanelTab; onChange: (tab: PanelTab) => void; disabled?: boolean }) {
  return <div className="lj-tabs" role="tablist" aria-label="Tampilan panel" onKeyDown={event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    const index = PANEL_TABS.findIndex(item => item.id === tab), next = PANEL_TABS[(index + step + PANEL_TABS.length) % PANEL_TABS.length].id;
    onChange(next); document.getElementById(`lj-tab-${next}`)?.focus();
  }}>
    {PANEL_TABS.map(item => <button key={item.id} id={`lj-tab-${item.id}`} role="tab" aria-selected={tab === item.id} aria-controls="lj-tab-panel"
      tabIndex={tab === item.id ? 0 : -1} disabled={disabled} onClick={() => onChange(item.id)}>{item.label}</button>)}
  </div>;
}
