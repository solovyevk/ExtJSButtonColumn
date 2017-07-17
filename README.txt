A Ext.grid.column.Column subclass which renders a button like background in each column cell. It offers a scoped click handler
for it. You can make it like a Split Button with a dropdown menu to execute multiple actions. The dropdown can be configured
like a Ext.grid.column.Action with "items" array config option or generated at runtime with "setupMenu" method. Options provided
for styling, enabling/disabling button and it's menu items. This is was tested on 4.0, 4.1 and 4.2. With 4.2 button blue highlight
on mouse over not supported due to grid cell not receiving 'mouseover', 'mouseout' evens. I'm working to overcome this.

10/10/2013 -update:

Button blue highlight on mouse over in version 4.2 is supported now. See mouse-over-highlightetx-ext4.2.txt for details

3/30/2015 - update:

Component migrated to ExtJS 5. Tested with 5.1.0 release.
The Mouseout event not always cascade down to src/ux/ButtonColumn.js:218 from Ext.view.View in Ext 5 because of this code: view/View.js:522
If you want button to be highlighted on mouse over reliably, set highlightOnMouseOver:true and comment out view/View.js:522 in override 

Plans to updgrade to 6.x late 2017
