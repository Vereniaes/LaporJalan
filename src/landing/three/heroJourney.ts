/* Todo:
-> sample the hero camera from a three-quarter view into the road
-> reuse the approved rider pose and wheel travel
*/
import { clamp, smooth, sampleJourney } from './journey';
import type { StoryFrame, StoryProfile } from './types';

// --- opening camera ---
/** Purpose: Move the camera with scroll while the rider continues down the road.
 * Input: progress and layout. Output: one frame for the shared scene renderer.
 */
export function sampleHero(value: number, profile: StoryProfile): StoryFrame {
  const p = clamp(value), t = smooth(p), frame = sampleJourney(p * .12, profile);
  const stacked = profile === 'stacked';
  const from = stacked ? [1, 1.9, 3.4] : [1.8, 2.45, 2.2];
  const to = stacked ? [-.15, 2.2, 4] : [-.15, 2.35, 3.4];
  const aim = stacked ? [-1.4, 1.1, 6.2] : [-1.4, 1.4, 6.2];
  const end = stacked ? [-1.4, 1.2, 8] : [-1.4, 1.2, 8.4];
  return { ...frame, camera: from.map((v, i) => v + (to[i] - v) * t), look: aim.map((v, i) => v + (end[i] - v) * t), fov: stacked ? 44 : 42 };
}
// --- end of opening camera ---
