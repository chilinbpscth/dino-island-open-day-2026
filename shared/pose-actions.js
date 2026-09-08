// Local movement heuristics, not medical/biometric assessment. Tune with real iPad play tests.
const body=[0,11,12,15,16,23,24,25,26,27,28];
const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
function angle(a,b,c){const u={x:a.x-b.x,y:a.y-b.y},v={x:c.x-b.x,y:c.y-b.y};return Math.acos(Math.max(-1,Math.min(1,(u.x*v.x+u.y*v.y)/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y)||1))))*180/Math.PI;}
function features(poses){
 if(poses.length!==1)return {error:poses.length?'multiple':'no-person'};
 const points=poses[0];if(body.some(i=>!points[i]||!Number.isFinite(points[i].x)||!Number.isFinite(points[i].y)||(points[i].visibility??0)<.65||(points[i].presence??1)<.6||points[i].x<.02||points[i].x>.98||points[i].y<.02||points[i].y>.98))return {error:'unclear'};
 const hip=midpoint(points[23],points[24]),shoulder=midpoint(points[11],points[12]),ankle=midpoint(points[27],points[28]);
 const height=ankle.y-points[0].y;if(height<.3)return {error:'unclear'};
 return {points,hip,shoulder,ankle,height,knees:(angle(points[23],points[25],points[27])+angle(points[24],points[26],points[28]))/2};
}
const shift=(a,b)=>Math.max(...body.map(i=>Math.hypot(a.points[i].x-b.points[i].x,a.points[i].y-b.points[i].y)));
export class PoseActions{
 constructor(){this.reset();}
 reset(){this.baseline=null;this.calibration=null;this.calibrationStart=null;this.lastTime=null;this.command=null;this.clearAction();}
 clearAction(){this.holdStart=null;this.anchor=null;this.airStart=null;this.airReady=false;this.complete=false;}
 setCommand(command){if(!['jump','sit','stand','hands','left','right','freeze'].includes(command))throw Error('Unknown movement');this.command=command;this.clearAction();}
 update(poses,now){
  const gap=this.lastTime!==null&&(now-this.lastTime>350||now<=this.lastTime);this.lastTime=now;
  if(gap){this.clearAction();this.calibration=null;this.calibrationStart=null;}
  const f=features(poses);
  if(f.error){this.clearAction();this.calibration=null;this.calibrationStart=null;return {status:f.error,progress:0};}
  if(!this.baseline){
   if(f.knees<155){this.calibration=null;this.calibrationStart=null;return {status:'stand-to-calibrate',progress:0};}
   if(!this.calibration||shift(f,this.calibration)>.04*f.height){this.calibration=f;this.calibrationStart=now;}
   const progress=Math.min(1,(now-this.calibrationStart)/1000);
   if(progress===1){this.baseline=f;this.clearAction();return {status:'ready',progress:1};}
   return {status:'calibrating',progress};
  }
  if(!this.command)return {status:'ready',progress:1};
  if(this.complete)return {status:'success',progress:1};
  const base=this.baseline,h=base.height;
  // Video is displayed mirrored: increasing camera x means moving left on screen.
  const mirroredX=base.hip.x-f.hip.x;
  let matches=false,duration=500;
  switch(this.command){
   case 'hands':matches=f.points[15].y<f.shoulder.y-.12*h&&f.points[16].y<f.shoulder.y-.12*h;break;
   case 'sit':matches=f.knees<145&&f.hip.y>base.hip.y+.08*h;break;
   case 'stand':matches=f.knees>155&&Math.abs(f.hip.y-base.hip.y)<.08*h;break;
   case 'left':matches=mirroredX<-.12*h;duration=400;break;
   case 'right':matches=mirroredX>.12*h;duration=400;break;
   case 'freeze':
    duration=1500;if(!this.anchor)this.anchor=f;
    matches=shift(f,this.anchor)<.035*h;if(!matches){this.anchor=f;this.holdStart=null;}break;
   case 'jump':{
    const airborne=f.ankle.y<base.ankle.y-.07*h&&f.hip.y<base.hip.y-.07*h;
    if(airborne){this.airStart??=now;if(now-this.airStart>=100)this.airReady=true;return {status:'tracking',progress:this.airReady?.6:.3};}
    const landed=Math.abs(f.ankle.y-base.ankle.y)<.06*h;
    if(this.airReady&&landed&&now-this.airStart<=1800){this.complete=true;return {status:'success',progress:1};}
    this.airStart=null;this.airReady=false;return {status:'tracking',progress:0};
   }
  }
  if(!matches){this.holdStart=null;return {status:'tracking',progress:0};}
  this.holdStart??=now;const progress=Math.min(1,(now-this.holdStart)/duration);
  if(progress===1)this.complete=true;
  return {status:this.complete?'success':'tracking',progress};
 }
}
