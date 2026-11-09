/* Todo:
-> share landing identity, feedback and capability-aware report action
*/
import { motion } from 'motion/react';
import { ArrowUpRight, Route } from 'lucide-react';

// --- shared landing controls ---
export const spring = { type: 'spring' as const, stiffness: 400, damping: 40, mass: .7 };
export const feedback = { whileHover: { y: -2 }, whileTap: { y: 1 } };
export function Brand() {
  return <a className="lp-brand" href="/" aria-label="LaporJalan - halaman utama"><span><Route size={25} strokeWidth={2.2} /></span><strong>LaporJalan</strong></a>;
}
/** Purpose: Continue through the existing report/session entry when available.
 * Input: service availability. Output: the shared report button.
 */
export function ReportAction({ available }: { available: boolean }) {
  return <motion.button type="button" className={`lp-button lp-button-primary${available ? '' : ' is-unavailable'}`} disabled={!available} onClick={() => location.assign('/peta?buat=1')} {...(available ? feedback : {})}>Laporkan jalan <ArrowUpRight size={18} /></motion.button>;
}
// --- end of shared landing controls ---
