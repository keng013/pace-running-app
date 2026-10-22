export const distances = [{label:"5K",km:5},{label:"10K",km:10},{label:"Half Marathon",km:21.0975},{label:"Marathon",km:42.195}];
export function paceSeconds(minutes:number,seconds:number){return minutes*60+seconds;}
export function finishSeconds(distance:number,pace:number){return distance*pace;}
export function formatTime(seconds:number){const n=Math.round(seconds);return [Math.floor(n/3600),Math.floor(n%3600/60),n%60].map((x,i)=>i===0?String(x):String(x).padStart(2,"0")).join(":");}
export function formatPace(seconds:number){const n=Math.round(seconds);return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");}
export function predictTime(knownTime:number,knownDistance:number,targetDistance:number){return knownTime*Math.pow(targetDistance/knownDistance,1.06);}
export function splits(distance:number,pace:number,strategy:"even"|"negative"|"positive"="even"){const count=Math.ceil(distance);const segments=Array.from({length:count},(_,i)=>{const km=Math.min(1,distance-i);const progress=(i+km/2)/distance;const factor=strategy==="negative"?1.04-0.08*progress:strategy==="positive"?0.96+0.08*progress:1;return {km:i+1,length:km,seconds:km*pace*factor};});const raw=segments.reduce((sum,s)=>sum+s.seconds,0);let elapsed=0;return segments.map(s=>{const seconds=s.seconds*distance*pace/raw;elapsed+=seconds;return {...s,seconds,elapsed};});}
