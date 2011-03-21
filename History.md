# Ki 0.5.0 March 20, 2011

* Added stateObserves() feature to framework. Thanks to Geoffrey Donaldson (@geoffreyd) for the 
  original suggestion.
* Changed allowTracing to allowStatechartTracing in Ki.StatechartManager
* Enhanced framework to check if a state is currently entered

# Ki 0.4.0 March 6, 2011

* Updated the statechart and state class to now include logic that checks if they can respond to
  and event
* tryToPerform has been added to the statechart mixin
* The state's tryToHandleEvent method now checks if an event handler returned the value NO
* statechart's sendEvent arguments have been made to be more generic. Now arg1 and arg2
* Updated framework's tracing functionality to improve debugging statecharts
* removed the try-catch block in statechart's sendEvent method. Was an old hold-over that is no
  longer useful
* Updated framework to simplify the construction of a statechart
* refactored logging logic for tracing, errors and warning messages
* added invokeStateMethod to the Ki.StatechartManager mixin
* Added firstCurrentState computed property to Ki.StatechartManager mixin
* Updated the gotoState error message when attempting to transition from one state to another state
  where the pivot state's substates are concurrent
* Added destory logic to both Ki.StatechartManager and Ki.State
* Improved the trace and owner feature so that the properties representing them are no longer 
  fixed. Can now use special key properties to change what owner and trace properties to use
* Added feature to statechart to suppress warning messages produced by the statechart
* Enhanced Ki.State.plugin feature so that it can optionally be provided hash objects that
  get added to a plugged-in state upon creation.

# Ki 0.3.0 January 9, 2011

* Refactored Ki.StatechartManager mixin logic. initMixin is now part of the initStatechart method
* Added Ki.HistoryState that can be set as the initial substate
* Updated Ki.State toString method. Now provides a better string representation for debugging
* Added fullPath computed property to Ki.State
* Updated Ki.StatechartMonitor's toString method
* Updated statechart logic so that you can now supply an optional context value to both gotoState
  and gotoHistoryState that will be supplied to all states that are exited and entered during
  a state transition process
* Updated statechart logic so that if a state's initialSubstate is *not* a value then the default
  state used will be an empty state (Ki.EmptyState). A root state must *always* have its
  initialSubstate property assigned an explicit value.

# Ki 0.2.0 October 6, 2010

* Added advanced event handling functionality to framework
* Fixed issue with enterState being called before the state is 
  considered entered [Colin Campbell]
* Updated statechart so that you can plugin the root state just like any 
  other state using Ki.State.plugin
* Updated framework to notify when the statechart's current states have 
  changed and when a state's isCurrentState property has changed.
* Removed statechart alias methods that are no longer useful.

# Ki 0.1.0 September 7, 2010

* First beta release of Ki
* Features:
  * Nested states
  * Parallel states
  * State history
  * Asynchronous state transitioning
  * State Plug-in
  * State Namespacing