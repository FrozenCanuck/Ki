// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki statechart State */

var obj1, rootState1, stateA, stateB;
var obj2, rootState2, stateC, stateD;
var owner;

module("Ki.Statechart: Change Statechart Owner Property Tests", {
  setup: function() {
    owner = SC.Object.create({
      toString: function() { return "owner"; }
    });
    
    obj1 = SC.Object.extend(Ki.StatechartManager, {
      
      initialState: 'stateA',
      
      stateA: Ki.State.design({
        foo: function() {
          this.gotoState('stateB');
        }
      }),
      
      stateB: Ki.State.design({
        bar: function() {
          this.gotoState('stateA');
        }
      })
      
    });
    
    obj1 = obj1.create();
    rootState1 = obj1.get('rootState');
    stateA = obj1.getState('stateA');
    stateB = obj1.getState('stateB');  
    
    obj2 = SC.Object.extend(Ki.StatechartManager, {
      
      owner: owner,
      
      initialState: 'stateC',
      
      stateC: Ki.State.design({
        foo: function() {
          this.gotoState('stateD');
        }
      }),
      
      stateD: Ki.State.design({
        bar: function() {
          this.gotoState('stateC');
        }
      })
      
    });
    
    obj2 = obj2.create();
    rootState2 = obj2.get('rootState');
    stateC = obj2.getState('stateC');
    stateD = obj2.getState('stateD');
  },
  
  teardown: function() {
    obj1 = rootState1 = stateA = stateB = null;
    obj2 = rootState2 = stateC = stateD = null;
  }
});

test("check obj1", function() {
  equals(rootState1.get('owner'), obj1, "root state's owner should be obj");
  equals(stateA.get('owner'), obj1, "state A's owner should be obj");
  equals(stateB.get('owner'), obj1, "state B's owner should be obj");
  
  obj1.set('owner', owner);
  
  equals(rootState1.get('owner'), owner, "root state's owner should be owner");
  equals(stateA.get('owner'), owner, "state A's owner should be owner");
  equals(stateB.get('owner'), owner, "state B's owner should be owner");
  
  obj1.set('owner', null);
  
  equals(rootState1.get('owner'), obj1, "root state's owner should be obj");
  equals(stateA.get('owner'), obj1, "state A's owner should be obj");
  equals(stateB.get('owner'), obj1, "state B's owner should be obj");
});

test("check obj2", function() {
  equals(rootState2.get('owner'), owner, "root state's owner should be owner");
  equals(stateC.get('owner'), owner, "state C's owner should be owner");
  equals(stateD.get('owner'), owner, "state D's owner should be owner");
  
  obj2.set('owner', null);
  
  equals(rootState2.get('owner'), obj2, "root state's owner should be obj");
  equals(stateC.get('owner'), obj2, "state C's owner should be obj");
  equals(stateD.get('owner'), obj2, "state D's owner should be obj");
});