// ==========================================================================
// Ki.Statechart Unit Test
// ==========================================================================
/*globals Ki */

var statechart, stateA, stateB, stateC;

module("Ki.HistoryState Tests", {
  setup: function() {
    statechart = Ki.Statechart.create({initialState: 'a', a: Ki.State.design()});
    stateA = Ki.State.create({ name: 'stateA' });
    stateB = Ki.State.create({ name: 'stateB' });
    stateC = Ki.State.create({ name: 'stateC' });
  },
  
  teardown: function() {
    statechart = stateA = stateB = stateC = null;
  }
});

test("Check default history state", function() {
  var historyState = Ki.HistoryState.create();
  
  equals(historyState.get('isRecursive'), false);
});

test("Check assigned history state", function() {  
  var historyState = Ki.HistoryState.create({
    isRecursive: YES,
    statechart: statechart,
    parentState: stateA,
    defaultState: stateB
  });
  
  equals(historyState.get('statechart'), statechart);
  equals(historyState.get('parentState'), stateA);
  equals(historyState.get('defaultState'), stateB);
  equals(historyState.get('isRecursive'), true);
  equals(historyState.get('state'), stateB);
  
  stateA.set('historyState', stateC);
  
  equals(historyState.get('state'), stateC);
  
  stateA.set('historyState', null);
  
  equals(historyState.get('state'), stateB);
});