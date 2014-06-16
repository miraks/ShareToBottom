`const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;`

Cu.import "resource://gre/modules/Services.jsm"


ShareToBottom =
  _shareLabel: Services.strings.createBundle('chrome://browser/locale/browser.properties').GetStringFromName('contextmenu.shareLink')

  load: (aWindow) ->
    return unless aWindow

    shareId = null
    menuItems = @_getMenuItems aWindow

    for id, data of menuItems
      shareId = id if data.args.label == @_shareLabel

    return unless shareId?

    args = menuItems[shareId].args
    args.oldOrder = args.order
    args.order = 999

  unload: (aWindow) ->
    return unless aWindow

    for id, data of @_getMenuItems aWindow
      args = data.args
      args.order = args.oldOrder if args.oldOrder?

  _getMenuItems: (aWindow) ->
    aWindow.NativeWindow.contextmenus.items


install = ->

uninstall = ->

startup = (aData, aReason) ->
  windows = Services.wm.getEnumerator 'navigator:browser'
  while windows.hasMoreElements()
    win = windows.getNext().QueryInterface Ci.nsIDOMWindow
    ShareToBottom.load win

  Services.wm.addListener windowListener

shutdown = (aData, aReason) ->
  return if aReason == APP_SHUTDOWN

  Services.wm.removeListener windowListener

  windows = Services.wm.getEnumerator 'navigator:browser'
  while windows.hasMoreElements()
    win = windows.getNext().QueryInterface Ci.nsIDOMWindow
    ShareToBottom.unload win


windowListener =
  onOpenWindow: (aWindow) ->
    win = aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                 .getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow)

    win.addEventListener 'UIReady', ->
      win.removeEventListener 'UIReady', arguments.callee, false
      ShareToBottom.load win
    , false

  onCloseWindow: ->

  onWindowTitleChange: ->
