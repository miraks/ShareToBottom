`const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;`

Cu.import "resource://gre/modules/Services.jsm"


ShareToBottom = do ->
  bundle = Services.strings.createBundle('chrome://browser/locale/browser.properties')
  shareLabelTypes = ['share', 'shareLink', 'shareEmailAddress', 'sharePhoneNumber', 'shareImage', 'shareMedia']
  shareLabels = for type in shareLabelTypes
    bundle.GetStringFromName "contextmenu.#{type}"

  getMenuItems = (aWindow) ->
    aWindow.NativeWindow.contextmenus.items

  load: (aWindow) ->
    return unless aWindow

    ids = []
    menuItems = getMenuItems aWindow

    # Since FF41 UIReady fired right before context menu initialization
    if Object.keys(menuItems).length == 0
      return aWindow.setTimeout (-> ShareToBottom.load aWindow), 1

    for id, data of menuItems
      {label} = data.args
      label = label() if typeof label == 'function'
      ids.push id if label in shareLabels

    return unless ids.length > 0

    for id in ids
      {args} = menuItems[id]
      args._prevOrder = args.order
      args.order = 999

  unload: (aWindow) ->
    return unless aWindow

    for id, data of getMenuItems aWindow
      {args} = data
      args.order = args._prevOrder if args._prevOrder?


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
