// Gentle head-motion participation checks; these do not verify limb technique.
function features(poses){
 if(poses.length!==1)return {error:poses.length?'multiple':'no-person'};
 const p=poses[0]?.[0];
 if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||(p.visibility??0)<.4||(p.presence??1)<.4||p.x<0||p.x>1||p.y<0||p.y>1)return {error:'unclear'};
 return {x:p.x,y:p.y};
}
const shift=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class PoseActions{
 constructor(){this.reset();}
 reset(){this.baseline=null;this.calibration=null;this.calibrationStart=null;this.lastTime=null;this.command=null;this.clearAction();}
 clearAction(){this.holdStart=null;this.anchor=null;this.complete=false;}
 setCommand(command){if(!['jump','sit','stand','hands','left','right','freeze'].includes(command))throw Error('Unknown movement');this.command=command;this.clearAction();}
 update(poses,now){
  const gap=this.lastTime!==null&&(now-this.lastTime>800||now<=this.lastTime);this.lastTime=now;
  if(gap){this.clearAction();this.calibration=null;this.calibrationStart=null;}
  const f=features(poses);
  if(f.error){this.clearAction();this.calibration=null;this.calibrationStart=null;return {status:f.error,progress:0};}
  if(!this.baseline){
   if(!this.calibration||shift(f,this.calibration)>.04){this.calibration=f;this.calibrationStart=now;}
   const progress=Math.min(1,(now-this.calibrationStart)/600);
   if(progress===1){this.baseline=f;this.clearAction();return {status:'ready',progress:1};}
   return {status:'calibrating',progress};
  }
  if(!this.command)return {status:'ready',progress:1};
  if(this.complete)return {status:'success',progress:1};
  const dx=f.x-this.baseline.x,dy=f.y-this.baseline.y;
  let matches=false,duration=250;
  // Mirrored preview: camera x increasing is screen-left.
  switch(this.command){
   case 'left':matches=dx>.035;break;
   case 'right':matches=dx<-.035;break;
   case 'sit':matches=dy>.035;break;
   case 'stand':matches=Math.abs(dy)<.05;duration=500;break;
   case 'hands':case 'jump':matches=dy<-.035;break;
   case 'freeze':
    duration=900;if(!this.anchor)this.anchor=f;
    matches=shift(f,this.anchor)<.035;
    if(!matches){this.anchor=f;this.holdStart=null;}break;
  }
  if(!matches){this.holdStart=null;return {status:'tracking',progress:0};}
  this.holdStart??=now;const progress=Math.min(1,(now-this.holdStart)/duration);
  if(progress===1)this.complete=true;
  return {status:this.complete?'success':'tracking',progress};
 }
}
