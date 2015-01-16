const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;;
var ShareToBottom, install, shutdown, startup, uninstall, windowListener,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Cu["import"]("resource://gre/modules/Services.jsm");

ShareToBottom = (function() {
  var bundle, getMenuItems, shareLabelTypes, shareLabels, type;
  bundle = Services.strings.createBundle('chrome://browser/locale/browser.properties');
  shareLabelTypes = ['share', 'shareLink', 'shareEmailAddress', 'sharePhoneNumber', 'shareImage', 'shareMedia'];
  shareLabels = (function() {
    var _i, _len, _results;
    _results = [];
    for (_i = 0, _len = shareLabelTypes.length; _i < _len; _i++) {
      type = shareLabelTypes[_i];
      _results.push(bundle.GetStringFromName("contextmenu." + type));
    }
    return _results;
  })();
  getMenuItems = function(aWindow) {
    return aWindow.NativeWindow.contextmenus.items;
  };
  return {
    load: function(aWindow) {
      var args, data, id, ids, label, menuItems, _i, _len, _results;
      if (!aWindow) {
        return;
      }
      ids = [];
      menuItems = getMenuItems(aWindow);
      for (id in menuItems) {
        data = menuItems[id];
        label = data.args.label;
        if (typeof label === 'function') {
          label = label();
        }
        if (__indexOf.call(shareLabels, label) >= 0) {
          ids.push(id);
        }
      }
      if (!(ids.length > 0)) {
        return;
      }
      _results = [];
      for (_i = 0, _len = ids.length; _i < _len; _i++) {
        id = ids[_i];
        args = menuItems[id].args;
        args._prevOrder = args.order;
        _results.push(args.order = 999);
      }
      return _results;
    },
    unload: function(aWindow) {
      var args, data, id, _ref, _results;
      if (!aWindow) {
        return;
      }
      _ref = getMenuItems(aWindow);
      _results = [];
      for (id in _ref) {
        data = _ref[id];
        args = data.args;
        if (args._prevOrder != null) {
          _results.push(args.order = args._prevOrder);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };
})();

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
