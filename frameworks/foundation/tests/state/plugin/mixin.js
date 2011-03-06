// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki TestState */

TestState = null;
var obj, MixinA, MixinB, stateA, stateB, stateC;

module("Ki.State.plugin: Mixin Tests", {
  setup: function() {
    
    MixinA = {
      isMixinA: YES
    };
    
    MixinB = {
      isMixinB: YES
    };

    TestState = Ki.State.extend({
      isTestState: YES
    });

    obj = SC.Object.create(Ki.StatechartManager, {
      
      initialState: 'stateA',
      
      stateA: Ki.State.plugin('TestState'),
      
      stateB: Ki.State.plugin('TestState', MixinA),
      
      stateC: Ki.State.plugin('TestState', MixinA, MixinB)
      
    });
    
    stateA = obj.getState('stateA');
    stateB = obj.getState('stateB');
    stateC = obj.getState('stateC');

  },
  
  teardown: function() {
    obj = TestState = MixinA = MixinB = null;
    stateA = stateB = stateC = null;
  }

});

test("check plugin state A", function() {
  ok(SC.kindOf(stateA, TestState));
  ok(stateA.get('isTestState'));
  ok(!stateA.get('isMixinA'));
  ok(!stateA.get('isMixinB'));
});

test("check plugin state B", function() {
  ok(SC.kindOf(stateB, TestState));
  ok(stateB.get('isTestState'));
  ok(stateB.get('isMixinA'));
  ok(!stateB.get('isMixinB'));
});

test("check plugin state C", function() {
  ok(SC.kindOf(stateC, TestState));
  ok(stateC.get('isTestState'));
  ok(stateC.get('isMixinA'));
  ok(stateC.get('isMixinB'));
});