// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki */

var statechart = null;
var mixin = null;

// ..........................................................
// CONTENT CHANGING
// 

module("Ki.Statechart: No Concurrent States - Goto State With Context Tests", {
  setup: function() {

    mixin = {
      context: null,
      enterState: function(context) {
        this.set('context', context);
      }
    };

    statechart = Ki.Statechart.create({
      
      monitorIsActive: YES,
      
      rootState: Ki.State.design({
        
        initialSubstate: 'a',
        
        a: Ki.State.design(mixin, {
        
          initialSubstate: 'c',
          
          c: Ki.State.design(mixin),
          
          d: Ki.State.design(mixin)
          
        }),
        
        b: Ki.State.design(mixin, {
        
          initialSubstate: 'e',
          
          e: Ki.State.design(mixin),
          
          f: Ki.State.design(mixin)
          
        })
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  teardown: function() {
    statechart.destroy();
  }
});

test("go to state c with no context", function() {
  var stateA = statechart.getState('a'),
      stateB = statechart.getState('b'),
      stateC = statechart.getState('c');
  
  stateB.gotoState('c');
  equals(stateC.get('isCurrentState'), true);
  equals(stateA.get('context'), null);
  equals(stateC.get('context'), null);
});

test("go to state c with context = 'foo'", function() {
  var stateA = statechart.getState('a'),
      stateB = statechart.getState('b'),
      stateC = statechart.getState('c');
  
  stateB.gotoState('c', "foo");
  equals(stateC.get('isCurrentState'), true);
  equals(stateA.get('context'), null);
  equals(stateC.get('context'), "foo");
});

test("go to state b with context = 'bar'", function() {
  var stateA = statechart.getState('a'),
      stateB = statechart.getState('b'),
      stateE = statechart.getState('e'),
      stateF = statechart.getState('f');
  
  stateB.gotoState('b', "bar");
  equals(stateE.get('isCurrentState'), true);
  equals(stateA.get('context'), null);
  equals(stateB.get('context'), "bar");
  equals(stateE.get('context'), "bar");
  equals(stateF.get('context'), null);
});