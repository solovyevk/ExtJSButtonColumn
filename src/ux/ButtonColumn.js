Ext.define('Ext.ux.ButtonColumnMenuItem', {
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


Ext.define('Ext.ux.ButtonColumn', {
  extend: 'Ext.grid.column.Column',
  alias: ['widget.buttoncolumn'],

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


  btnRe: new RegExp(Ext.baseCSSPrefix + 'btn'),

  triggerRe: new RegExp(Ext.baseCSSPrefix + 'btn-split'),

  triggerCls: 'x-btn-split x-btn-split-right',

  btnTpl: '<em class="{triggerCls}">' +
          '<button {tooltip} autocomplete="off" role="button" hidefocus="true" type="button" class="x-btn-center" aria-haspopup="true">' +
          '<span class="x-btn-inner">{buttonText}</span>' +
          '<span class="x-btn-icon {iconCls}">&nbsp;</span>' +
          '</button>' +
          '</em>',


  constructor: function (config) {
    var me = this,
      cfg = Ext.apply({}, config),
      items = cfg.items;
    // This is a Container. Delete the items config.
    delete cfg.items;
    me.callParent([cfg]);
    //init menu
    if (items || me.setupMenu) {
      this.menu = Ext.create('Ext.menu.Menu');
      if (items) {
        var i, l = items.length
        for (i = 0; i < l; i++) {
          this.menu.add(new Ext.ux.ButtonColumnMenuItem(items[i]));
        }
      }
    }
    //init template
    me.initBtnTpl();
    me.renderer = function (v, meta, record) {
      var data = {};
      data.tooltip = me.tooltip ?  Ext.String.format('data-qtip="{0}"', me.tooltip) : '';
      data.buttonText = me.buttonText;
      data.iconCls = Ext.isFunction(me.getClass) ? me.getClass.apply(me, arguments) : (me.iconCls || 'x-hide-display');
      //allocate place for icon on button
      data.iconClsBtn = data.iconCls === 'x-hide-display' ? me.getBtnCls('noicon').join(' ') : me.getBtnCls('icon-text-left').join(' ');
      data.disabledCls = me.isDisabledFn && me.isDisabledFn.apply(me,
        arguments) ? me.disabledCls + ' ' + me.getBtnCls('disabled').join(' ')/*(Ext.isIE7 ? me.disabledCls : me.disabledCls + ' ' + me.getBtnCls('disabled').join(' '))*/ : '';
      v = Ext.isFunction(cfg.renderer) ? cfg.renderer.apply(this, arguments) : v;
      data.buttonText = data.buttonText ? data.buttonText : Ext.isEmpty(v) ? '--Action--' : v;
      return me.btnTpl.apply(data);
    };
  },

  //private
  initBtnTpl: function () {
    var me = this,
      mainDivStr = '<div class="x-btn x-btn-default-small {iconClsBtn} {disabledCls}">{0}</div>',
      btnFrameTpl = '<TABLE><TBODY><TR>' +
                    '<TD style="PADDING-LEFT: 3px; BACKGROUND-POSITION: 0px -6px" class="x-frame-tl x-btn-tl x-btn-default-small-tl" role=presentation></TD>' +
                    '<TD style="BACKGROUND-POSITION: 0px 0px; HEIGHT: 3px" class="x-frame-tc x-btn-tc x-btn-default-small-tc" role=presentation></TD>' +
                    '<TD style="PADDING-LEFT: 3px; BACKGROUND-POSITION: right -9px" class="x-frame-tr x-btn-tr x-btn-default-small-tr" role=presentation></TD>' +
                    '</TR><TR>' +
                    '<TD style="PADDING-LEFT: 3px; BACKGROUND-POSITION: 0px 0px" class="x-frame-ml x-btn-ml x-btn-default-small-ml" role=presentation></TD>' +
                    '<TD style="BACKGROUND-POSITION: 0px 0px" class="x-frame-mc x-btn-mc x-btn-default-small-mc" role=presentation>' +
                    '{0}' +
                    '</TD>' +
                    '<TD style="PADDING-LEFT: 3px; BACKGROUND-POSITION: right 0px" class="x-frame-mr x-btn-mr x-btn-default-small-mr" role=presentation></TD>' +
                    '</TR><TR>' +
                    '<TD style="PADDING-LEFT: 3px; BACKGROUND-POSITION: 0px -12px" class="x-frame-bl x-btn-bl x-btn-default-small-bl" role=presentation></TD>' +
                    '<TD style="BACKGROUND-POSITION: 0px -3px; HEIGHT: 3px" class="x-frame-bc x-btn-bc x-btn-default-small-bc" role=presentation></TD>' +
                    '<TD style="PADDING-LEFT: 3px; BACKGROUND-POSITION: right -15px" class="x-frame-br x-btn-br x-btn-default-small-br" role=presentation></TD>' +
                    '</TR></TBODY></TABLE>'
    //The triggerCls class added if we have menu - it defined at design time (items array or setupMenu function in config)
    me.btnTpl = me.btnTpl.replace('{triggerCls}', me.menu ? me.triggerCls : '');
    if (Ext.supports.CSS3BorderRadius) {
      me.btnTpl = Ext.create('Ext.XTemplate', Ext.String.format(mainDivStr, me.btnTpl))
    } else {
      me.btnTpl = Ext.create('Ext.XTemplate', Ext.String.format(Ext.String.format(mainDivStr, btnFrameTpl), me.btnTpl));
    }
  },

  //private
  getBtnCls: function (suffix) {
    var cls = ['', 'btn-', 'btn-default-', 'btn-default-small-'],
      i, l;
    for (i = 0, l = cls.length; i < l; i++) {
      cls[i] = Ext.baseCSSPrefix + cls[i] + suffix;
    }
    return cls;
  },


  showMenu: function (el) {
    var me = this;
    if (me.rendered && me.menu) {
      if (me.menu.isVisible()) {
        me.menu.hide();
      }
      me.menu.showBy(el, me.menuAlign);
    }
    return me;
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
      btnMatch = e.getTarget().className.match(me.btnRe),
      triggerMatch = e.getTarget().className.match(me.triggerRe);
    if (btnMatch) {
      var btnEl = Ext.fly(cell).down('div.x-btn');
      if (btnEl.hasCls(me.disabledCls)) {
        return me.stopSelection !== true;
      }
      if (type == 'click') {
        if (triggerMatch) {
          var record = view.getStore().getAt(recordIndex),
            menuItems,
            menu = me.menu;
          if (me.setupMenu) {
            menuItems = me.setupMenu.call(me.setupMenuScope || me, record, recordIndex);
            menu.removeAll(true);
            var i, l = menuItems.length;
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
          me.showMenu(btnEl);
        } else {
          if (me.handler) {
            me.handler.call(me.scope || me, view, recordIndex, cellIndex, e);
          }
        }
      } else if (type == 'mouseover') {
        btnEl.addCls(me.getBtnCls('over'));
      } else if (type == 'mouseout') {
        btnEl.removeCls(me.getBtnCls('over'));
      } else if (type == 'mousedown') {
        btnEl.addCls(me.getBtnCls('pressed'));
        return me.stopSelection !== true;
      } else if (type == 'mouseup') {
        btnEl.removeCls(me.getBtnCls('pressed'));
      }
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
  }
});