// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki statechart */

var obj1, rootState1, stateA, stateB;
var obj2;

module("Ki.Statechart: Create Statechart with Assigned Root State Tests", {
  setup: function() {
    obj1 = SC.Object.extend(Ki.StatechartManager, {
      rootState: Ki.State.design({
        
        initialSubstate: 'a',
        
        a: Ki.State.design({
          foo: function() {
            this.gotoState('b');
          }
        }),
        
        b: Ki.State.design({
          bar: function() {
            this.gotoState('a');
          }
        })
        
      })
    });
    
    obj1 = obj1.create();
    rootState1 = obj1.get('rootState');
    stateA = obj1.getState('a');
    stateB = obj1.getState('b');
    
    obj2 = SC.Object.extend(Ki.StatechartManager, {
      autoInitStatechart: NO,
      rootState: Ki.State.design()
    });
    
    obj2 = obj2.create();
  },
  
  teardown: function() {
    obj1 = rootState1 = stateA = stateB = null;
    obj2 = null;
  }
});

test("check obj1", function() {
  ok(obj1.get('isStatechart'), "obj should be statechart");
  ok(obj1.get('statechartIsInitialized'), "obj should be an initialized statechart");
  ok(SC.kindOf(rootState1, Ki.State), "root state should be kind of Ki.State");
  equals(obj1.get('initialState'), null, "obj initialState should be null");
  
  ok(stateA.get('isCurrentState'), "state A should be current state");
  ok(!stateB.get('isCurrentState'), "state B should not be current state");
  
  equals(rootState1.get('owner'), obj1, "root state's owner should be obj");
  equals(stateA.get('owner'), obj1, "state A's owner should be obj");
  equals(stateB.get('owner'), obj1, "state B's owner should be obj");
  
  obj1.sendEvent('foo');
  
  ok(!stateA.get('isCurrentState'), "state A should not be current state");
  ok(stateB.get('isCurrentState'), "state B should be current state");
});

test("check obj2", function() {
  ok(obj2.get('isStatechart'), "obj should be statechart");
  ok(!obj2.get('statechartIsInitialized'), "obj not should be an initialized statechart");
  
  obj2.initStatechart();
  
  ok(obj2.get('statechartIsInitialized'), "obj should be an initialized statechart");
});