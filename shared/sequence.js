// Coordinates: x right, y down. Heading is north/east/south/west (0..3).
export const COMMANDS={forward:'前進',left:'左轉',right:'右轉',jump:'跳過'};
export const SEQUENCE_LEVELS=[
 {size:4,start:{x:0,y:2,heading:1},goal:{x:2,y:2},rocks:[],solution:['forward','forward']},
 {size:4,start:{x:1,y:2,heading:0},goal:{x:2,y:1},rocks:[],solution:['forward','right','forward']},
 {size:4,start:{x:2,y:3,heading:0},goal:{x:0,y:3},rocks:[{x:1,y:3}],solution:['left','jump']}
];
export function runSequence(level,commands){
 let position={...level.start};const frames=[];
 for(const command of commands){
  if(!Object.hasOwn(COMMANDS,command))throw Error('未知指令');
  if(command==='left'||command==='right')position={...position,heading:(position.heading+(command==='left'?3:1))%4};
  else{
   const [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][position.heading],distance=command==='jump'?2:1;
   const next={...position,x:position.x+dx*distance,y:position.y+dy*distance};
   if(next.x<0||next.y<0||next.x>=level.size||next.y>=level.size||level.rocks.some(r=>r.x===next.x&&r.y===next.y))return {frames,position,success:false,blocked:true};
   position=next;
  }
  frames.push({...position,command});
 }
 return {frames,position,success:position.x===level.goal.x&&position.y===level.goal.y,blocked:false};
}
