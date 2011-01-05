    Ki Framework
    
    -- A Statechart Framework for Sproutcore

#Overview

Ki is a statechart framework that supports:

  * __State Hierarchy__ - nesting of states
  * __State Orthogonality__ - state that are independent (concurrent) of each other
  * __State Clustering__ - grouping states together within a state 
  * __State History__ - keeping track of states that were entered, both shallow and deep history
  * __Event Handling__ - states reacting to incoming events
  * __Asynchronous State Transitioning__ - allow for asynchronous actions during a state transition process
  * __Module Design__ - building states independently that can then be connected and reused within a statechart
  
The framework's design was closely based on David Harel's original paper ["Statecharts: A Visual Formalism For Complex Systems"](http://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.pdf).

#Why Use Statecharts?

In most applications that react to external and internal asynchronous events, some form of states are used to 
help manage when an action can respond to those incoming events. Usually these states are represented as kinds of
variables whose value are checked and updated throughout various objects and modules that make up the application.
The problem with states that are built as such are the following:

  * The actions that rely on the state variables are spread throughout the system and not 
    centralized with a single entity, such as the state or states they use
  * States represented as simple variables are difficult to test as independent entities
  * States that are independent of or dependent on other states are not represented explicitly, but, 
    rather, buried within statements of code
  * Transitioning between states is often not done in a centralized and consistent manner
  * Modularizing and being able to reuse state logic is often error prone and not done in a consistent manner
  
Ki resolves these issues and thereby helps make your state logic more maintainable, testable, and easier to analyze. 

#Some Background on Statecharts

David Harel originally developed the idea of statecharts back in the early 80s while working on a complex application for the 
Israel Aircraft Industries. Given the complexity of the system and the vast number of events the system had
to react to, Harel attempted to make use of traditional state transition diagrams to explicitly design how the 
system would use states to react to events and transition to other states within the system. However, trying to use a tradition 
approach to representing finite states during the design process led to a few problems. 

First, a small change to the system would often represent a large change to the state transition diagram, and, ultimately, 
would lead to exponential growth. This made the state transition diagrams difficult if not
impossible to maintain and analyze. Next, there was no method of being able to abstract away details. No abstraction 
meant there was no method of being able to zoom in and out of the state transition diagrams. State transition diagrams were 
also not well suited to depict how a group of states were dependent on a common state or states or how states were independent 
(orthogonal) of one another. Finally, given that state transition diagrams were drawn on paper, there was no way to economically represent 
states and state transitions in order to conserve space.   

Through various experimentation while working on the application, Harel and a team of others worked on new approaches 
to address the problems with traditional state transition diagrams. This eventually led to a new way of depicting, analyzing,
and maintaining an application's states: Statecharts.  

Statechart diagrams are able to address the shortcomings of traditional state transition diagrams. They allowed states to be grouped
together and placed with a common parent state. Grouping of states into a common parent state also allowed for abstraction. 
In addition, grouping states into a common parent state meant that the number of state transitions could be reduced.
States that were independent of each other could be depicted in statecharts with minimal effort. 

This new approach of depicting states meant that diagrams could now be properly managed for complex systems and would not
grow or change exponentially in size based on small changes to the system. Another benefit of statecharts was its 
formal and precise way of describing states, but also allowing for relative ease of analyzing the diagrams even by people who 
were not experts of statecharts.           
    
For more information about the history of statecharts, please refer to Harel's paper ["Statecharts in the Making: 
A Personal Account"](http://www.wisdom.weizmann.ac.il/~harel/papers/Statecharts.History.pdf).

#Adding Ki to Your SproutCore Project

To add Ki to your SproutCore project, start by acquiring the framework from github:

    $ cd <your sproutcore project's root directory>
    $ mkdir frameworks # if you don't already have a frameworks folder
    $ cd frameworks
    $ git clone git://github.com/FrozenCanuck/Ki.git ki
  
Once acquired, you then need to update your project's `Buildfile` file. This can be done like so:

    config :all, :required => [:sproutcore, :ki]
  
Congrats! You're now on your way to using Ki.

#Getting Started

If you're new to Ki or just want information to help you apply statecharts to your app, then refer to the 
[Ki wiki](http://github.com/FrozenCanuck/Ki/wiki).