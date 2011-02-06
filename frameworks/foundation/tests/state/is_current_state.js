// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki */

var statechart = null;

module("Ki.Statechart: State - isCurrentState Property Tests", {
  setup: function() {

    statechart = Ki.Statechart.create({
      
      monitorIsActive: YES,
      
      rootState: Ki.State.design({
        
        initialSubstate: 'a',
        
        a: Ki.State.design(),
        
        b: Ki.State.design()
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  teardown: function() {
    statechart.destroy();
    statechart = null;
  }
});

test("check binding to isCurrentState", function() {
  var a = statechart.getState('a');

  var o = SC.Object.create({
    value: null,
    valueBinding: SC.Binding.oneWay().from('isCurrentState', a)
  });
  
  SC.run();
  equals(a.get('isCurrentState'), true);
  equals(o.get('value'), true);
  
  SC.run(function() { statechart.gotoState('b'); });
  equals(a.get('isCurrentState'), false);
  equals(o.get('value'), false);
  
  SC.run(function() { statechart.gotoState('a'); });
  equals(a.get('isCurrentState'), true);
  equals(o.get('value'), true);
  
  SC.run(function() { statechart.gotoState('b'); });
  equals(a.get('isCurrentState'), false);
  equals(o.get('value'), false);

});