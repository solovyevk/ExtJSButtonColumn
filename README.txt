Recently I had a task to execute number of actions from the grid. I couldn't use Ext.grid.column.Action because there are not
just a few but many actions, the actions set is unique for each record and user want to select them from drop down. My first
implementation was a real split button injected into grid with http://skirtlesden.com/ux/component-column component.It works
fine but some of my clients use IE7 and performance degraded, So I looked into button rendering and simulate it:

A Ext.grid.column.Column subclass which renders a button like background in each column cell. It offers a scoped click handler
for it. You can make it like a Split Button with a dropdown menu to execute multiple actions. The dropdown can be configured
like a Ext.grid.column.Action with "items" array config option or generated at runtime with "setupMenu" method. Options provided
for styling, enabling/disabling button and it's menu items
