Ext.define('Ext.ux.grid.column.ButtonMenuItem', {
  extend: 'Ext.menu.Item',

  setState: function (state) {
    this.state = state;
  },

  onClick: function (e) {
    var me = this;

    if (!me.href) {
      e.stopEvent();
    }

    if (me.disabled) {
      return;
    }

    if (me.hideOnClick) {
      me.deferHideParentMenusTimer = Ext.defer(me.deferHideParentMenus, me.clickHideDelay, me);
    }
    /*This is the only difference, we pass state as 2nd argument*/
    Ext.callback(me.handler, me.scope || me, [me, me.state, e]);
    me.fireEvent('click', me, e);

    if (!me.hideOnClick) {
      me.focus();
    }
  }
});


Ext.define('Ext.ux.grid.column.Button', {
  extend: 'Ext.grid.column.Column',
  alias: ['widget.buttoncolumn'],
  requires: ['Ext.button.Button',
             'Ext.button.Split'],

  /* @cfg {String}  buttonText
   * If defined, will be button text ,otherwise underlying store value will be used
   */

  /**
   * @cfg {String} iconCls
   * A CSS class to apply to the button. To determine the class dynamically, configure the Column with
   * a `{@link #getClass}` function.
   */



  /**
   * @cfg {Function} handler
   * A function called when the button is clicked.
   * @cfg {Ext.view.Table} handler.view The owning TableView.
   * @cfg {Number} handler.rowIndex The row index clicked on.
   * @cfg {Number} handler.colIndex The column index clicked on.
   * @cfg {Object} handler.item The clicked item (or this Column if multiple {@link #items} were not configured).
   * @cfg {Event} handler.e The click event.
   */

  /**
   * @cfg {Object} scope
   * The scope (**this** reference) in which the `{@link #handler}` and `{@link #getClass}` fuctions are executed.
   * Defaults to this Column.
   */


  /**
   * @cfg {Function} isDisabledFn
   * is an 'interceptor' method which can be used to disable button.
   * @cfg {Object} isDisabledFn.value The data value for the current cell
   * @cfg {Object} isDisabledFn.metaData A collection of metadata about the current cell;
   * @cfg {Ext.data.Model} isDisabledFn.record The record for the current row
   * @cfg {Number} isDisabledFn.rowIndex The index of the current row
   * @cfg {Number} isDisabledFn.colIndex The index of the current column
   * @cfg {Ext.data.Store} isDisabledFn.store The data store
   * @cfg {Ext.view.View} isDisabledFn.view The current view
   * @cfg {Boolean}isDisabledFn.return The disabled flag.
   */

  /**
   * @cfg {Object[]} items
   * An Array which may contain multiple menuItem actions definitions
   **/

  /**
   * @cfg {Function} setupMenu
   * is a 'hook' method which called to generate drop down menu for the record. The items config will be ignored
   * @cfg {Object} setupMenu.record The record for the current row
   * @cfg {Object} setupMenu.recordIndex The index of the current row
   * @cfg Ext.menu.Item[]/Ext.Action[]/Object[] setupMenu.return array of menuItems config options.
   */


  /*
   * @cfg {Boolean} [stopSelection=true]
   * Prevent grid _row_ selection upon mousedown.
   */

  header: '&#160;',

  /**
   * @cfg {String} menuAlign
   * The position to align the menu to (see {@link Ext.Element#alignTo} for more details).
   */
  menuAlign: 'tl-bl?',

  sortable: false,

  /**
   * @cfg {String} [baseCls='x-btn']
   * The base CSS class to add to all buttons.
   */
  baseCls: Ext.baseCSSPrefix + 'btn',

  disabledCls: Ext.baseCSSPrefix + 'btn-disabled',

  triggerRe: new RegExp(Ext.baseCSSPrefix + 'btn-split'),

  btnSelector: 'a.' + Ext.baseCSSPrefix + 'btn',

  highlightOnMouseOver: true,

  buttonClickMenuDown: false,

  constructor: function (config) {
    this.initBtnTpl(config);
    var me = this,
      cfg = Ext.apply({}, config),
      items = cfg.items;
    // This is a Container. Delete the items config.
    delete cfg.items;
    me.callParent([cfg]);
    //init menu
    if (items || me.setupMenu) {
      this.menu = Ext.create('Ext.menu.Menu',
        {
          listeners: {
            mouseleave: function (menu, event) {
              if(me.lastMenuCellBox){
                if(!((me.lastMenuCellBox.x <= event.getX() && event.getX()  <= me.lastMenuCellBox.right) &&
                   (me.lastMenuCellBox.y <= event.getY() && event.getY() <= me.lastMenuCellBox.bottom))){
                  menu.hide();
                  Ext.log('hide mouse over menu');
                }
              }
            }
          }
        });
      if (items) {
        var i, l = items.length
        for (i = 0; i < l; i++) {
          this.menu.add(new Ext.ux.grid.column.ButtonMenuItem(items[i]));
        }
      }
    }
    me.renderer = function (v, meta, record) {
      v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments) : v;
      var btnColumnID = 'buttonColumn-' + Ext.id(),
        btnTplData = Ext.apply(me.btnTplData, {
            disabledCls: me.isDisabledFn && me.isDisabledFn.apply(me, arguments) ? me.disabledCls : '',
            id: btnColumnID,
            text: Ext.isEmpty(v) ? me.buttonText || '&#160;' : v
          }
        );
      Ext.apply(btnTplData.$comp, {id: btnColumnID});
      //For IE8
      Ext.apply(btnTplData.renderData, {
        id: btnColumnID,
        text: Ext.isEmpty(v) ? me.buttonText || '&#160;' : v
      });
      return me.btnTplContainer.apply(btnTplData) + me.btnTpl.apply(btnTplData) + '</a></div>';
    };
  },

  initBtnTpl: function (config) {
    var me = this,
      templateButtonConfig = {
        text: 'Default',
        iconCls: config.iconCls,
        tooltip: config.tooltip
      },
      buttonWidthStr = config.buttonWidth ? 'style="width:' + config.buttonWidth + 'px;"' : '',
      templateButton = Ext.create(config.items || config.setupMenu ? 'Ext.button.Split' : 'Ext.button.Button',
        templateButtonConfig);
    templateButton.setScale('small');
    me.btnTplContainer = Ext.create('Ext.XTemplate',
      '<div><a id="{id}" class="x-btn x-unselectable x-btn-default-small x-border-box {disabledCls}"' + buttonWidthStr + ' hidefocus="on" unselectable="on">');
    me.btnTpl = templateButton.getElConfig().tpl;
    me.btnTplData = templateButton.getElConfig().tplData;
    Ext.destroy(templateButton);
  },

  //private
  getBtnGroupCls: function (suffix) {
    var cls = ['', 'btn-', 'btn-default-', 'btn-default-small-'],
      i, l;
    for (i = 0, l = cls.length; i < l; i++) {
      cls[i] = Ext.baseCSSPrefix + cls[i] + suffix;
    }
    return cls;
  },


  showMenu: function (el) {
    var me = this;
    if ( me.lastMenuButtonBox && me.lastMenuButtonBox.y === el.getBox().y && !me.menu.isHidden()) {
      me.menu.hide();
    } else {
      me.menu.showBy(el, me.menuAlign);
    }
    me.lastMenuButtonBox = el.getBox();
    me.lastMenuCellEl = Ext.get(el.findParent('table.x-grid-item'));
    me.lastMenuCellBox = me.lastMenuCellEl.getBox();
    me.lastMenuCellEl.hover(Ext.emptyFn, function(event){
      var menuBox = me.menu.getBox();
        if(!((menuBox.x  <= event.getX() && event.getX()  <= menuBox.right) &&
         (menuBox.y - 5 /*this for IE8*/ <= event.getY() && event.getY() <= menuBox.bottom))){
        me.menu.hide();
      }
    })
  },


  destroy: function () {
    delete this.items;
    delete this.renderer;
    Ext.destroy(this.menu);
    return this.callParent(arguments);
  },

  /**
   * @private
   * Process and refire events routed from the GridView's processEvent method.
   * Also fires any configured click handlers. By default, cancels the mousedown event to prevent selection.
   * Returns the event handler's status to allow canceling of GridView's bubbling process.
   */
  processEvent: function (type, view, cell, recordIndex, cellIndex, e) {
    var me = this,
      target = e.getTarget(),
      triggerMatch = target.className.match(me.triggerRe),
      processMenu = function () {
        var record = view.getStore().getAt(recordIndex),
          menuItems,
          menu = me.menu;
        if (me.setupMenu && Ext.isFunction(me.setupMenu)) {
          menuItems = me.setupMenu.call(me.setupMenuScope || me, record, recordIndex, view);
          menu.removeAll(true);
          var i, l = menuItems.length
          for (i = 0; i < l; i++) {
            menu.add(menuItems[i]);
          }
        } else {
          menuItems = menu.items;
          menuItems.each(function (item) {
            item.setState({
              view: view,
              record: record,
              rowIndex: recordIndex
            });
          }, me);
        }
        if (me.onShowMenu && Ext.isFunction(me.onShowMenu)) {
          me.onShowMenu.call(me.setupMenuScope || me, record, recordIndex);
          /*to have time to adjust controls*/
          Ext.defer(function () {
            me.showMenu(btnEl);
          }, 200);
        } else {
          me.showMenu(btnEl);
        }
      };
    /* mouseout not always cascade down here from Ext.view.View in Ext 5 because of this code: view/View.js:522
     If you want button to be highlighted on mouse over reliably, set highlightOnMouseOver:true and comment out view/View.js:522 in override */
    var btnEl = Ext.fly(cell).down(me.btnSelector);
    if (btnEl.hasCls(me.disabledCls)) {
      return me.stopSelection !== true;
    }


    if (type == 'click') {
      if (me.buttonClickMenuDown) {
        processMenu();
        if (me.handler) {
          me.handler.call(me.scope || me, view, recordIndex, cellIndex, e);
        }
      } else {
        if (triggerMatch) {
          processMenu();
        } else {
          if (me.handler) {
            me.handler.call(me.scope || me, view, recordIndex, cellIndex, e);
          }
          //hide menu if click outside
          me.menu.hide();
        }
      }
    }
    else if (type == 'mouseover' && me.highlightOnMouseOver) {
      if (!me.menu || !me.menu.isVisible()) {
        btnEl.addCls(me.getBtnGroupCls('over'));
      }
    } else if (type == 'mouseout' && me.highlightOnMouseOver) {
      btnEl.removeCls(me.getBtnGroupCls('over'));
    }
    else if (type == 'mousedown') {
      btnEl.addCls(me.getBtnGroupCls('pressed'));
      return me.stopSelection !== true;
    } else if (type == 'mouseup') {
      btnEl.removeCls(me.getBtnGroupCls('pressed'));
    }
    return me.callParent(arguments);
  },

  cascade: function (fn, scope) {
    fn.call(scope || this, this);
  },

  // private
  getRefItems: function (deep) {
    var menu = this.menu,
      items;
    if (menu) {
      items = menu.getRefItems(deep);
      items.unshift(menu);
    }
    return items || [];
  },

  onFocusLeave: function (e) {
    this.callParent([e]);
    if (!this.menu.isHidden()) {
      this.menu.hide();
    }
  }
});