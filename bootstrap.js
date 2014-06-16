const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;;
var ShareToBottom, install, shutdown, startup, uninstall, windowListener;

Cu["import"]("resource://gre/modules/Services.jsm");

ShareToBottom = {
  _shareLabel: Services.strings.createBundle('chrome://browser/locale/browser.properties').GetStringFromName('contextmenu.shareLink'),
  load: function(aWindow) {
    var args, data, id, menuItems, shareId;
    if (!aWindow) {
      return;
    }
    shareId = null;
    menuItems = this._getMenuItems(aWindow);
    for (id in menuItems) {
      data = menuItems[id];
      if (data.args.label === this._shareLabel) {
        shareId = id;
      }
    }
    if (shareId == null) {
      return;
    }
    args = menuItems[shareId].args;
    args.oldOrder = args.order;
    return args.order = 999;
  },
  unload: function(aWindow) {
    var args, data, id, _ref, _results;
    if (!aWindow) {
      return;
    }
    _ref = this._getMenuItems(aWindow);
    _results = [];
    for (id in _ref) {
      data = _ref[id];
      args = data.args;
      if (args.oldOrder != null) {
        _results.push(args.order = args.oldOrder);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  },
  _getMenuItems: function(aWindow) {
    return aWindow.NativeWindow.contextmenus.items;
  }
};

install = function() {};

uninstall = function() {};

startup = function(aData, aReason) {
  var win, windows;
  windows = Services.wm.getEnumerator('navigator:browser');
  while (windows.hasMoreElements()) {
    win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    ShareToBottom.load(win);
  }
  return Services.wm.addListener(windowListener);
};

shutdown = function(aData, aReason) {
  var win, windows, _results;
  if (aReason === APP_SHUTDOWN) {
    return;
  }
  Services.wm.removeListener(windowListener);
  windows = Services.wm.getEnumerator('navigator:browser');
  _results = [];
  while (windows.hasMoreElements()) {
    win = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    _results.push(ShareToBottom.unload(win));
  }
  return _results;
};

windowListener = {
  onOpenWindow: function(aWindow) {
    var win;
    win = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    return win.addEventListener('UIReady', function() {
      win.removeEventListener('UIReady', arguments.callee, false);
      return ShareToBottom.load(win);
    }, false);
  },
  onCloseWindow: function() {},
  onWindowTitleChange: function() {}
};
