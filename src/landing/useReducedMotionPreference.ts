/* Todo:
-> share the current reduced-motion preference across landing scenes
-> update and remove the media listener with the component lifecycle
*/
import { useEffect, useState } from 'react';

// --- live motion preference ---
/** Purpose: Follow preference changes while models are loading or displayed.
 * Input: browser motion preference. Output: the current reduced-motion flag.
 */
export function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)'), change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);
  return reduced;
}
// --- end of live motion preference ---
