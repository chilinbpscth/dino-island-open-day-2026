// A game can run only while visible and while every permission/loading wait is released.
// Each mounted game owns a session so late callbacks cannot resume its replacement.
export class GameClockGate{
 constructor(clock){this.clock=clock;this.visible=true;this.session=null;}
 update(){if(this.visible&&this.session&&this.session.waits.size===0)this.clock.resume();else this.clock.pause();}
 setVisible(visible){this.visible=visible;this.update();}
 begin(){
  this.end();const session={waits:new Set()};this.session=session;this.update();
  return {
   pause:(reason='module')=>{if(this.session!==session)return;session.waits.add(reason);this.update();},
   resume:(reason='module')=>{if(this.session!==session)return;session.waits.delete(reason);this.update();}
  };
 }
 end(){this.clock.pause();this.session=null;}
}
