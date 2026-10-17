# Native modal focus oracle investigation

The first keyboard execution reports body as active after the last dialog control. This alone does not prove focus reached background application content. W3C H102 explicitly permits keyboard focus in native modal content or browser chrome; primary page content must remain inert. Source checked17October2026: https://www.w3.org/WAI/WCAG22/Techniques/html/H102 .

A minimal native modal/nonmodal control probe is prepared but not_run. It records document.hasFocus, active element and real Tab/Shift+Tab navigation. No application changes. Only after the probe proves the distinction may the test accept a browser-chrome transition, with body + document unfocused and mandatory next-key return to the dialog. Background controls remain a failure. Original test/results must be preserved. Search coordinates, visible focus and restoration assertions remain unchanged.
