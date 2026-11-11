/* Todo:
-> long lists render a page at a time (owner, 12 Nov: the /peta list drew all 3.148 rows at once; the other lists too)
    -> useWindowed: show the first rows of a list held in memory, add more as the end comes near
    -> useLoadMore: a sentinel near the list's end calls "more" (next slice, or the next page from the server)
    -> the sentinel is a real button, so keyboard and no-IntersectionObserver users can still ask for more
*/
import { useEffect, useRef, useState } from 'react';

// the nearest ancestor that scrolls, so the look-ahead margin counts inside a scrolling panel, not the window
function scrollParent(element: HTMLElement | null): HTMLElement | null {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

// input param : more (called when the sentinel comes within ~2 screens), active (false: nothing left or loading), shown (rows now shown)
// output      : a ref for the sentinel element
// Why/Note: observing again whenever "shown" changes fires at once if the sentinel is still in reach, so a tall screen fills up
export function useLoadMore<T extends HTMLElement>(more: () => void, active: boolean, shown: number) {
  const sentinel = useRef<T>(null), call = useRef(more);
  call.current = more;
  useEffect(() => {
    const element = sentinel.current;
    if (!element || !active || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) call.current(); }, { root: scrollParent(element), rootMargin: '800px 0px' });
    observer.observe(element);
    return () => observer.disconnect();
  }, [active, shown]);
  return sentinel;
}

// input param : the whole list, how many per step, a key that resets to the first step (filters)
// output      : the rows to draw, whether more exist, and "more"
export function useWindowed<T>(items: T[], step: number, resetKey: string) {
  const [limit, setLimit] = useState(step);
  useEffect(() => { setLimit(step); }, [resetKey, step]);
  const count = Math.min(items.length, limit);
  return { visible: items.slice(0, count), hasMore: count < items.length, more: () => setLimit(value => value + step), count };
}
