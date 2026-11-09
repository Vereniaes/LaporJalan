/* Todo:
-> hold the visible road pin for two seconds before automatic lift
-> cancel on rewind and pause elapsed time while the page is hidden
*/
// --- visible-time gate ---

// Purpose: Own the two-second hold without blocking native page scroll.
// Input: wake callback and optional lift duration in ms. Output: sampled target, lifecycle and timing evidence.
export function createLiftClock(wake:()=>void,duration=3200){
 let state='idle',timer=0,pinAt=0,liftAt=0,deadline=0,remaining=2000,pausedAt=0,disposed=false;const events: {type:string;time:number}[]=[];
 function note(type:string){events.push({type,time:performance.now()});if(events.length>40)events.shift();}
 function beginLift(){timer=0;if(disposed||state!=='holding'||pausedAt)return;state='lifting';liftAt=performance.now();note('lift');wake();}
 function schedule(){clearTimeout(timer);deadline=performance.now()+remaining;timer=window.setTimeout(beginLift,remaining);}
 function reset(){clearTimeout(timer);timer=0;if(state!=='idle')note('reset');state='idle';pinAt=liftAt=pausedAt=0;remaining=2000;}
 return {
  sample(requested:number,visual:number){
   if(disposed)return requested;
   if(requested<.69&&state!=='idle')reset();
   if(state==='idle'&&requested>=.72&&visual>=.72){state='holding';pinAt=performance.now();remaining=2000;note('pin');schedule();}
   if(state==='holding')return .8;
   if(state==='lifting'){const t=Math.max(0,Math.min(1,(performance.now()-liftAt)/duration));if(t===1){state='done';note('done');}return .8+.2*t*t*(3-2*t);}
   if(state==='done')return 1;
   return requested>=.72?.8:requested;
  },
  pause(){if(pausedAt||disposed)return;pausedAt=performance.now();if(state==='holding'){remaining=Math.max(0,deadline-pausedAt);clearTimeout(timer);timer=0;}note('pause');},
  resume(){if(!pausedAt||disposed)return;if(state==='lifting')liftAt+=performance.now()-pausedAt;pausedAt=0;if(state==='holding')schedule();note('resume');wake();},
  finish(){clearTimeout(timer);timer=0;state='done';note('done');},
  reset,
  metrics(){return {state,duration,pinAt,liftAt,remaining:state==='holding'?pausedAt?remaining:Math.max(0,deadline-performance.now()):0,paused:Boolean(pausedAt),disposed,events:[...events]};},
  dispose(){if(disposed)return;disposed=true;clearTimeout(timer);timer=0;note('dispose');}
 };
}
// --- end of visible-time gate ---
