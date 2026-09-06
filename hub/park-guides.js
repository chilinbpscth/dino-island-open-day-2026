// Road junctions follow the illustrated paths; destinations stop beside each habitat.
const nodes=[[15,85],[15,73],[17,65],[25,64],[32,62],[42,62],[51,60],[59,64],[66,64],[73,61],[85,65],[29,53],[30,45],[27,39],[31,34],[40,36],[51,39],[56,35],[65,35],[73,35],[84,37],[73,44],[72,52]];
const edges=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[3,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[19,21],[21,22],[22,9],[16,6]];
const destinations=[13,15,18,20,3,5,7,10,2,6,9];
function route(start,end){
 const distance=nodes.map(()=>Infinity),previous=[];distance[start]=0;const remaining=new Set(nodes.map((_,i)=>i));
 while(remaining.size){const a=[...remaining].reduce((x,y)=>distance[x]<distance[y]?x:y);remaining.delete(a);if(a===end)break;for(const edge of edges){if(!edge.includes(a))continue;const b=edge[0]===a?edge[1]:edge[0],cost=distance[a]+Math.hypot(nodes[a][0]-nodes[b][0],(nodes[a][1]-nodes[b][1])*4/7);if(cost<distance[b]){distance[b]=cost;previous[b]=a;}}}
 const result=[end];while(result[0]!==start)result.unshift(previous[result[0]]);return result.map(i=>nodes[i]);
}
export function mountParkGuides(island,player,onArrive){
 const guides=island.querySelector('.park-guides'),status=document.querySelector('#guide-status');
 let node=Number.isInteger(player.mapGuideNode)&&nodes[player.mapGuideNode]?player.mapGuideNode:0,frame=0,cancelled=false,busy=false;
 const position=([x,y])=>{guides.style.left=x+'%';guides.style.top=y+'%';};position(nodes[node]);
 return {walk(index,name){
  if(busy)return;busy=true;island.setAttribute('aria-busy','true');island.querySelectorAll('[data-zone]')[index].classList.add('travelling');status.textContent=`跟住小蓮、小志去${name}！`;
  const points=route(node,destinations[index]),path=document.createElementNS('http://www.w3.org/2000/svg','path');
  let d=`M ${points[0].join(' ')}`;for(let i=1;i<points.length-1;i++){const p=points[i],n=points[i+1];d+=` Q ${p.join(' ')} ${(p[0]+n[0])/2} ${(p[1]+n[1])/2}`;}if(points.length>1)d+=` L ${points.at(-1).join(' ')}`;path.setAttribute('d',d);
  const length=path.getTotalLength(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduced?250:Math.max(1300,Math.min(3200,length*32));let started;
  if(!reduced)guides.classList.add('walking');
  function tick(now){if(cancelled)return;started??=now;const progress=Math.min(1,(now-started)/duration),point=length&&!reduced?path.getPointAtLength(length*progress):{x:nodes[destinations[index]][0],y:nodes[destinations[index]][1]};position([point.x,point.y]);
   const viewport=island.parentElement;if(viewport.scrollWidth>viewport.clientWidth)viewport.scrollLeft=Math.max(0,point.x/100*island.clientWidth-viewport.clientWidth/2);
   if(progress<1){frame=requestAnimationFrame(tick);return;}node=destinations[index];guides.classList.remove('walking');player.mapGuideNode=node;status.textContent=`到咗${name}，一齊照顧小龍！`;onArrive(index);
  }
  frame=requestAnimationFrame(tick);
 },cleanup(){cancelled=true;cancelAnimationFrame(frame);}};
}
