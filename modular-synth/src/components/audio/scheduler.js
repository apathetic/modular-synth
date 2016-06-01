/**
 * Schedule events patch-wide,
 * Mainly keeps track of beat + ticks once a tempo is fed in.
 * Modules may then subscribe to listen to events spawned by
 * this master control center.
 * @return {Scheduler} the scheduler object
 */
var Scheduler = function(context, tempo){
  this.now = context.currentTIme;
  this.tempo = tempo;
  this.count;
  return {
    count: this.count;
  }
}

Scheduler.prototype = {
  updateTempo: function(newTempo) {
    this.tempo = newTempo;
  },
  start: function(){

  },
  stop: function(){}

}