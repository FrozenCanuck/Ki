// ==========================================================================
// Project:   Ki - A Statechart Framework for SproutCore
// Copyright: ©2010 Michael Cohen, and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals Ki */

/** 
  The default name given to a statechart's root state
*/
Ki.ROOT_STATE_NAME = "__ROOT_STATE__";

/**
  The startchart manager mixin allows an object to be a statechart. By becoming a statechart, the
  object can then be manage a set of its own states.
  
  This implemention of the statechart manager closely follows the concepts stated in D. Harel's 
  original paper "Statecharts: A Visual Formalism For Complex Systems" 
  (www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf). 
  
  The statechart allows for complex state heircharies by nesting states within states, and 
  allows for state orthogonally based on the use of parallel states.
  
  At minimum, a statechart must have one state: The root state. All other states in the statechart
  are a decendents of the root state.
  
  The following example shows how states are nested within a statechart:
  
    {{{
    
      MyApp.Statechart = SC.Object.extend(Ki.StatechartManager, {
      
        rootState: Ki.State.design({
      
          initialSubstate: 'stateA',
        
          stateA: Ki.State.design({
            // ... can continue to nest further states
          }),
        
          stateB: Ki.State.design({
            // ... can continue to nest further states
          })
        })
      
      })
    
    }}}
  
  Note how in the example above, the root state as an explicit initial substate to enter into. If no
  initial substate is provided, then the statechart will default to the the state's first substate.
  
  To provide your statechart with orthogonality, you use parallel states. If you use parallel states,
  then your statechart will have multiple current states. That is because each parallel state represents an
  independent state structure from other parallel states. The following example shows how to provide your
  statechart with parallel states:
  
    {{{
    
      MyApp.Statechart = SC.Object.extend(Ki.StatechartManager, {
      
        rootState: Ki.State.design({
      
          substatesAreParallel: YES,
        
          stateA: Ki.State.design({
            // ... can continue to nest further states
          }),
        
          stateB: Ki.State.design({
            // ... can continue to nest further states
          })
        })
      
      })
    
    }}}
  
  Above, to indicate that a state's substates are parallel, you just have to set the substatesAreParallel to 
  YES. Once done, then stateA and stateB will be independent of each other and each will manage their
  own current substates. The root state will then have more then one current substate.
  
  Remember that a startchart can have a mixture of nested and parallel states in order for you to 
  create as complex of statecharts that suite your needs. Here is an example of a mixed state structure:
  
    {{{
    
      MyApp.Statechart = SC.Object.extend(Ki.StatechartManager, {
      
        rootState: Ki.State.design({
      
          initialSubstate: 'stateA',
        
          stateA: Ki.State.design({
          
            substatesAreParallel: YES,
          
            stateM: Ki.State.design({ ... })
            stateN: Ki.State.design({ ... })
            stateO: Ki.State.design({ ... })
          
          }),
        
          stateB: Ki.State.design({
          
            initialSubstate: 'stateX',
          
            stateX: Ki.State.design({ ... })
            stateY: Ki.State.desgin({ ... })
          
          })
        })
      
      })
    
    }}}
  
  Deeping on your needs, a statechart can have lots of states, which can become hard to manage all within
  one file. To modularize your states and make them easier to manage and maintain, you can plug-in states
  into other states. Let's say we are using the statechart in the last example above, and all the code is 
  within one file. We could update the code and split the logic across two or more files like so:
  
    {{{
      ---- state_a.js
  
      MyApp.StateA = Ki.State.extend({
    
        substatesAreParallel: YES,
    
        stateM: Ki.State.design({ ... })
        stateN: Ki.State.design({ ... })
        stateO: Ki.State.design({ ... })
    
      });
    
      ---- state_b.js
    
      MyApp.StateB = Ki.State.extend({
    
        substatesAreParallel: YES,
    
        stateM: Ki.State.design({ ... })
        stateN: Ki.State.design({ ... })
        stateO: Ki.State.design({ ... })
    
      });
    
      ---- statechart.js
    
      MyApp.Statechart = SC.Object.extend(Ki.StatechartManager, {
    
        rootState: Ki.State.design({
    
          initialSubstate: 'stateA',
      
          stateA: Ki.State.plugin('MyApp.stateA'),
      
          stateB: Ki.State.plugin('MyApp.stateB')
        
        })
    
      })
  
    }}}
    
  Using state plug-in functionality is optional. If you use the plug-in feature you can break up your statechart
  into as many files as you see fit.

*/
Ki.StatechartManager = {
  
  // Walk like a duck
  isResponderContext: YES,
  
  // Walk like a duck
  isStatechart: YES,
  
  /**
    Indicates if this statechart has been initialized

    @property {Boolean}
  */
  statechartIsInitialized: NO,
  
  /**
    The root state of this statechart. All statecharts must have a root state.
    
    @property {State}
  */
  rootState: null,
  
  /** 
    Indicates whether to use a monitor to monitor that statechart's activities. If true then
    the monitor will be active, otherwise the monitor will not be used. Useful for debugging
    purposes.
    
    @property {Boolean}
  */
  monitorIsActive: NO,
  
  /**
    A statechart monitor that can be used to monitor this statechart. Useful for debugging purposes.
    A monitor will only be used if monitorIsActive is true.
    
    @property {StatechartMonitor}
  */
  monitor: null,
  
  /**
    Indicates whether to trace the statecharts activities. If true then the statechart will output
    its activites to the browser's JS console. Useful for debugging purposes.
  */
  trace: NO,
  
  initMixin: function() {
    this._registeredStates = [];
    this._gotoStateLocked = NO;
    this._sendEventLocked = NO;
    this._pendingStateTransitions = [];
    this._pendingSentEvents = [];
    
    // Alias method
    this.sendAction = this.sendEvent;
    
    // For some backwards compability with Ki statechart framework
    this.goState = this.gotoState;
    this.goHistoryState = this.gotoHistoryState;
    
    if (this.get('monitorIsActive')) {
      this.set('monitor', Ki.StatechartMonitor.create());
    }
  },
  
  /**
    Initializes the statechart. By initializing the statechart, it will create all the states and register
    them with the statechart. Once complete, the statechart can be used to go to states and send events to.
  */
  initStatechart: function() {
    if (this.get('statechartIsInitialized')) return;
    
    var trace = this.get('trace'),
        rootState = this.get('rootState');
    
    if (trace) SC.Logger.info('BEGIN initialize statechart');
    
    if (!(SC.kindOf(rootState, Ki.State) && rootState.isClass)) {
      throw "Unable to initialize statechart. Root state must be a state class";
    }
    
    rootState = this._createRootState(rootState);
    this.set('rootState', rootState);
    rootState.initState();
    this.set('statechartIsInitialized', YES);
    this.gotoState(rootState);
    
    if (trace) SC.Logger.info('END initialize statechart');
  },
  
  /**
    Returns an array of all the current states for this statechart
    
    @returns {Array} the current states
  */
  currentStates: function() {
    return this.getPath('rootState.currentSubstates');
  }.property(),
  
  /**
    Returns the count of the current states for this statechart
    
    @returns {Number} the count 
  */
  currentStateCount: function() {
    return this.getPath('currentStates.length');
  }.property(),
  
  /**
    Checks if a given state is a current state of this statechart. 
    
    @param state {State} the state to check
    @returns {Boolean} true if the state is a current state, otherwise fals is returned
  */
  stateIsCurrentState: function(state) {
    return this.get('rootState').stateIsCurrentSubstate(state);
  },
  
  /**
    Checks if the given value represents a state is this statechart
    
    @param value {State|String} either a state object or the name of a state
    @returns {Boolean} true if the state does belong ot the statechart, otherwise false is returned
  */
  doesContainState: function(value) {
    return !SC.none(this.getState(value));
  },
  
  /**
    Gets a state from the statechart that matches the given value
    
    @param value {State|String} either a state object of the name of a state
    @returns {State} if a match then the matching state is returned, otherwise null is returned 
  */
  getState: function(value) {
    return this._findMatchingState(value, this._registeredStates);
  },
  
  /**
    When called, the statechart will proceed with making state transitions in the statechart starting from 
    currents state that meet the statechart conditions. When complete, some or all of the statechart's 
    current states will be changed, and all states that were part of the transition process will either 
    be exited or entered in a specific order.
    
    The state that is given to go to will necessarily be a current state when the state transition process
    is complete. The final state or states are dependent on factors such an initial substates, parallel 
    parallel states, and history states.
    
    Because the statechart can have one or more states, it may be necessary to indicate what current state
    to start from. If no current state to start from is provided, then the statechart will default to using
    the first current state that it has; depending of the make up of the statechart (no parallel state vs.
    with parallel states), the outcome may be unexpected. For a statechart with parallel states, it is best
    to provide a current state in which to start from.
    
    When using history states, the statechart will first make transitions to the given state then use that
    state's history state and recursively follow each history state's history state until there are no 
    more history states to follow. If the given state does not have a history state, then the statechart
    will continue following state transition procedures.
    
    @param state {State|String} state the state to go to (may not be the final state in the transition process)
    @param fromCurrentState {State|String} Optional. The current state to start the transition process from.
    @param useHistory {Boolean} Optional. Indicates whether to include using history states in the transition process
  */
  gotoState: function(state, fromCurrentState, useHistory) {
    
    if (!this.get('statechartIsInitialized')) {
      SC.Logger.error('can not go to state %@. statechart has not yet been initialized'.fmt(state));
      return;
    }
    
    var pivotState = null,
        exitStates = [],
        enterStates = [],
        trace = this.get('trace'),
        paramState = state,
        paramFromCurrentState = fromCurrentState;
    
    state = this._findMatchingState(state, this._registeredStates);
    
    if (SC.none(state)) {
      SC.Logger.error('Can not to goto state %@. Not a recognized state in statechart'.fmt(paramState));
      return;
    }
    
    if (this._gotoStateLocked) {
      // There is a state transition currently happening. Add this requested state
      // transition to the queue of pending state transitions. The request will
      // be invoked after the current state transition is finished.
      this._pendingStateTransitions.push({
        state: state,
        fromCurrentState: fromCurrentState,
        useHistory: useHistory
      });
      
      return;
    }
    
    // Lock the current state transition so that no other requested state transition 
    // interferes. 
    this._gotoStateLocked = YES;
    
    if (!SC.none(fromCurrentState)) {
      // Check to make sure the current state given is actually a current state of this statechart
      fromCurrentState =  this._findMatchingState(fromCurrentState, this.get('currentStates'));
      if (SC.none(fromCurrentState)) {
        SC.Logger.error('Can not to goto state %@. %@ is not a recognized current state in statechart'.fmt(paramState, paramFromCurrentState));
        this._gotoStateLocked = NO;
        return;
      }
    } 
    else if (this.getPath('currentStates.length') > 0) {
      // No explicit current state to start from; therefore, just use the first current state as 
      // a default, if there is a current state.
      fromCurrentState = this.get('currentStates')[0];
    }
        
    if (trace) {
      SC.Logger.info('BEGIN gotoState: %@'.fmt(state));
      SC.Logger.info('starting from current state: %@'.fmt(fromCurrentState));
      SC.Logger.info('current states before: %@'.fmt(this.get('currentStates')));
    }

    // If there is a current state to start the transition process from, then determine what
    // states are to be exited
    if (!SC.none(fromCurrentState)) {
      exitStates = this._createStateChain(fromCurrentState);
    }
    
    // Now determine the initial states to be entered
    enterStates = this._createStateChain(state);
    
    // Get the pivot state to indicate when to go from exiting states to entering states
    pivotState = this._findPivotState(exitStates, enterStates);

    if (pivotState) {
      if (trace) SC.Logger.info('pivot state = ' + pivotState);
      if (pivotState.get('substatesAreParallel')) {
        SC.Logger.error('Can not go to state %@. Pivot state %@ has parallel substates.'.fmt(state, pivotState));
        this._gotoStateLocked = NO;
        return;
      }
    }
    
    // Go ahead and exit states recursively
    this._traverseStatesToExit(exitStates.shift(), exitStates, pivotState);
    
    // Now enter states recursively
    if (pivotState !== state) {
      this._traverseStatesToEnter(enterStates.pop(), enterStates, pivotState, useHistory);
    } else {
      this._traverseStatesToExit(pivotState, []);
      this._traverseStatesToEnter(pivotState, null, null, useHistory);
    }
    
    // We're done! Finish by setting this startchart's current states
    this.set('currentStates', this.get('rootState').currentSubstates);
    
    if (trace) {
      SC.Logger.info('current states after: %@'.fmt(this.get('currentStates')));
      SC.Logger.info('END gotoState: %@'.fmt(state));
    }
    
    // Okay. We're done with the current state transition. Make sure to unlock the
    // gotoState and let other pending state transitions execute.
    this._gotoStateLocked = NO;
    this._flushPendingStateTransition();
  },
  
  /**
    When called, the statechart will proceed to make transitions to the given state then follow that
    state's history state. 
    
    You can either go to a given state's history recursively or non-recursively. To go to a state's history
    recursively means to following each history state's history state until no more history states can be
    followed. Non-recursively means to just to the given state's history state but do not recusively follow
    history states. If the given state does not have a history state, then the statechart will just follow
    normal procedures when making state transitions.
    
    Because a statechart can have one or more current states, depending on if the statechart has any parallel
    states, it is optional to provided current state in which to start the state transition process from. If no
    current state is provided, then the statechart will default to the first current state that it has; which, 
    depending on the make up of that statechart, can lead to unexpected outcomes. For a statechart with parallel
    states, it is best to explicitly supply a current state.
    
    @param state {State|String} the state to go to and follow it's history state
    @param fromCurrentState {State|String} Optional. the current state to start the state transition process from
    @param recursive {Boolean} Optional. whether to follow history states recursively.
  */
  gotoHistoryState: function(state, fromCurrentState, recursive) {
    if (!this.get('statechartIsInitialized')) {
      SC.Logger.error("can not go to state %@'s history state. Statechart has not yet been initialized".fmt(state));
      return;
    }
    
    state = this._findMatchingState(state, this._registeredStates);
  
    if (!state) {
      SC.Logger.error("Can not to goto state %@'s history state. Not a recognized state in statechart".fmt(state));
      return;
    }
    
    var historyState = state.get('historyState');
    
    if (!recursive) { 
      if (historyState) {
        this.gotoState(historyState, fromCurrentState);
      } else {
        this.gotoState(state, fromCurrentState);
      }
    } else {
      this.gotoState(state, fromCurrentState, YES);
    }
  },
  
  /**
    Sends a given event to all the statechart's current states.
    
    If a current state does can not respond to the sent event, then the current state's parent state
    will be tried. This process is recursively done until no more parent state can be tried.
    
    @param event {String} name of the event
    @param sender {Object} object sending the event
    @param context {Object} Optional. additonal context info
    @returns {SC.Responder} the responder that handled it or null
  */
  sendEvent: function(event, sender, context) {
    var logLevel = this.get('logLevel'),
        eventHandled = NO,
        currentStates = this.get('currentStates'),
        len = 0,
        i = 0,
        responder = null;
    
    if (this._sendEventLocked || this._goStateLocked) {
      // Want to prevent any actions from being processed by the states until 
      // they have had a chance to handle the most immediate action or completed 
      // a state transition
      this._pendingSentEvents.push({
        event: event,
        sender: sender,
        context: context
      });

      return;
    }
    
    this._sendEventLocked = YES;
    
    len = currentStates.get('length');
    for (; i < len; i += 1) {
      eventHandled = NO;
      responder = currentStates[i];
    
      while (!eventHandled && responder) {
        if (responder.tryToPerform) {
          try {
            eventHandled = responder.tryToPerform(event, sender, context);
          } catch (ex) { /** Gobal the exception and move on */ }
        }
        if (!eventHandled) responder = responder.get('parentState');
      }
    }
    
    // Now that all the states have had a chance to process the 
    // first event, we can go ahead and flush any pending sent events.
    this._sendEventLocked = NO;
    this._flushPendingSentEvents();
    
    return responder ;
  },

  /** @private
  
    States call this to register themselves with the statechart
  */
  _registerState: function(state) {
    if (!SC.none(this.getState(state.get('name')))) {
      var msg = 'can not register state %@ with statechart since there is already a registered state with name %@';
      SC.Logger.error(msg.fmt(state, state.get('name')));
      return;
    }
    this._registeredStates.push(state);
  },
  
  /** @private
  
    Creates a chain of states from the given state to the greatest ancestor state (the root state). Used
    when perform state transitions.
  */
  _createStateChain: function(state) {
    var chain = [];
    
    while (state) {
      chain.push(state);
      state = state.get('parentState');
    }
    
    return chain;
  },
  
  /** @private
  
    Finds a pivot state from two given state chains. The pivot state is the state indicating when states
    go from being exited to states being entered during the state transition process. The value 
    returned is the fist matching state between the two given state chains. 
  */
  _findPivotState: function(stateChain1, stateChain2) {
    if (stateChain1.length === 0 || stateChain2.length === 0) return null;
    
    var pivot = stateChain1.find(function(state, index) {
      if (stateChain2.indexOf(state) >= 0) return YES;
    });
    
    return pivot;
  },
  
  /** @private
    
    Recursively follow states that are to be exited during a state transition process. The exit
    process is to start from the given state and work its way up to when either all exit
    states have been reached based on a given exit path or when a stop state has been reached.
    
    @param state {State} the state to be exited
    @param exitStatePath {Array} an array representing a path of states that are to be exited
    @param stopState {State} an explicit state in which to stop the exiting process
  */
  _traverseStatesToExit: function(state, exitStatePath, stopState) {
    if (!state || state === stopState) return;
    
    var trace = this.get('trace');
    
    // This state has parallel substates. Therefore we have to make sure we
    // exit them up to this state before we can go any further up the exit chain.
    if (state.get('substatesAreParallel')) {
      var i = 0;
      var states = state.get('currentSubstates');
      var len = states.length;
      
      for (; i < len; i += 1) {
        var chain = this._createStateChain(states[i]);
        this._traverseStatesToExit(chain.shift(), chain, state);
      }
    }
     
    if (state.get('currentSubstates').indexOf(state) >= 0) {  
      var parentState = state.get('parentState');
      while (parentState) {
        parentState.get('currentSubstates').removeObject(state);
        parentState = parentState.get('parentState');
      }
    }
      
    if (trace) SC.Logger.info('exiting state: ' + state);
    
    if (state.stateWillExitState) state.stateWillExitState(state);
    state.exitState();
    if (state.stateDidExitState) state.stateDidExitState(state);
    
    if (this.get('monitorIsActive')) this.get('monitor').pushExitedState(state);
    state.set('currentSubstates', []);
    this._traverseStatesToExit(exitStatePath.shift(), exitStatePath, stopState);
  },
  
  /** @private
  
    Recursively follow states that are to be entred during the state transition process. The
    enter process is to start from the given state and work its way down a given enter path. When
    the end of enter path has been reached, then continue entering states based on whether 
    an initial substate is defined, there are parallel substates or history states are to be
    followed; when none of those condition are met then the enter process is done.
    
    @param state {State} the sate to be entered
    @param enterStatePath {Array} an array representing an initial path of states that are to be entered
    @param pivotState {State} The state pivoting when to go from exiting states to entering states
    @param useHistory {Boolean} indicates whether to recursively follow history states 
  */
  _traverseStatesToEnter: function(state, enterStatePath, pivotState, useHistory) {
    if (!state) return;
    
    var trace = this.get('trace');
    
    // We do not want to enter states in the enter path until the pivot state has been reached. After
    // the pivot state has been reached, then we can go ahead and actually enter states.
    if (pivotState) {
      if (state !== pivotState) {
        this._traverseStatesToEnter(enterStatePath.pop(), enterStatePath, pivotState, useHistory);
      } else {
        this._traverseStatesToEnter(enterStatePath.pop(), enterStatePath, null, useHistory);
      }
    }
    
    // If no more explicit enter path instructions, then default to enter states based on 
    // other criteria
    else if (!enterStatePath || enterStatePath.length === 0) {
      this._enterState(state);
      
      var initialSubstate = state.get('initialSubstate'),
          historyState = state.get('historyState');
      
      // State has parallel substates. Need to enter all of the substates
      if (state.get('substatesAreParallel')) {
        this._traverseParallelStatesToEnter(state.get('substates'), null, useHistory);
      }
      
      // State has substates and we are instructed to recursively follow the state's
      // history state if it has one.
      else if (state.get('hasSubstates') && historyState && useHistory) {
        this._traverseStatesToEnter(historyState, null, null, useHistory);
      }
      
      // State has an initial substate to ener
      else if (initialSubstate) {
        this._traverseStatesToEnter(initialSubstate, null, null, useHistory);  
      } 
      
      // Looks like we hit the end of the road. Therefore the state has now become
      // a current state if the statechart. Will will update the state itself and 
      // all of its ancestor states to include this state as one of their current 
      // substates.
      else {
        if (state.stateWillBecomeCurrentState) state.stateWillBecomeCurrentState(state);
        
        var parentState = state;
        while (parentState) {
          parentState.get('currentSubstates').push(state);
          parentState = parentState.get('parentState');
        }
        
        if (state.stateDidBecomeCurrentState) state.stateDidBecomeCurrentState(state);
      }
    }
    
    // Still have an explicit enter path to follow, so keep moving through the path.
    else if (enterStatePath.length > 0) {
      this._enterState(state);
      var nextState = enterStatePath.pop();
      this._traverseStatesToEnter(nextState, enterStatePath, null, useHistory); 
      
      // We hit a state that has parallel substates. Must go through each of the substates
      // and enter them
      if (state.get('substatesAreParallel')) {
        this._traverseParallelStatesToEnter(state.get('substates'), nextState, useHistory);
      }
    }
  },
  
  /** @private
  
    Iterate over all the given parallel states and enter them
  */
  _traverseParallelStatesToEnter: function(states, exclude, useHistory) {
    var i = 0,
        len = states.length,
        state = null;
    
    for (; i < len; i += 1) {
      state = states[i];
      if (state !== exclude) this._traverseStatesToEnter(state, null, null, useHistory);
    }
  },
  
  /** @private
    
    Will actually enters a given state
  */
  _enterState: function(state) {
    if (this.get('trace')) SC.Logger.info('entering state: ' + state);
    var parentState = state.get('parentState');
    if (parentState && !state.get('isParallelState')) parentState.set('historyState', state);
    
    if (state.stateWillEnterState) state.stateWillEnterState(state);
    state.enterState();
    if (state.stateDidEnterState) state.stateDidEnterState(state);
    
    if (this.get('monitorIsActive')) this.get('monitor').pushEnteredState(state);
  },
  
  /** @private
    
    Will create a root state for the statechart
  */
  _createRootState: function(state, attrs) {
    if (!attrs) attrs = {};
    attrs.statechart = this;
    attrs.name = Ki.ROOT_STATE_NAME;
    state = state.create(attrs);
    return state;
  },
  
  /** @private
  
    Given a value, if there is a state that makes it, then it will be returned, otherwise
    null will be returned.
    
    @param value {State|String} can either be a state object or the name of a state
    @param states {Array} a list of states to match against
    @returns {State} a match state or null
  */
  _findMatchingState: function(value, states) {
    if (SC.none(value)) return null;
    
    var state = null,
        i = 0,
        len = states.length,
        valueIsString = (SC.typeOf(value) === SC.T_STRING),
        valueIsObject = (SC.typeOf(value) === SC.T_OBJECT);
              
    for (; i < len; i += 1) {
      state = states[i];
      if (valueIsString) {
        if (state.get('name') === value) return state;
      } else if (valueIsObject) {
        if (state === value) return state;
      }
    }
    
    return null;
  },
  
  /** @private
  
    Called by gotoState to flush a pending state transition at the front of the 
    pending queue.
  */
  _flushPendingStateTransition: function() {
    var pending = this._pendingStateTransitions.shift();
    if (!pending) return;
    this.gotoState(pending.state, pending.fromCurrentState, pending.useHistory);
  },
  
  /** @private

     Called by sendEvent to flush a pending actions at the front of the pending
     queue
   */
  _flushPendingSentEvents: function() {
    var pending = this._pendingSentEvents.shift();
    if (!pending) return;
    this.sendEvent(pending.event, pending.sender, pending.context);
  },
  
  _monitorIsActiveDidChange: function() {
    if (this.get('monitorIsActive') && SC.none(this.get('monitor'))) {
      this.set('monitor', Ki.StatechartMonitor.create());
    }
  }.observes('monitorDidChange')
  
};

/**
  A Startchart class. 
*/
Ki.Statechart = SC.Object.extend(Ki.StatechartManager);