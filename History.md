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