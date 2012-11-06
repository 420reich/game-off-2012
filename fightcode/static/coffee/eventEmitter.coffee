# Class obtained from https://gist.github.com/2759355

class EventEmitter
  constructor: ->
    @events = {}

  emit: (event, args...) ->
    return false unless @events[event]
    listener(args...) for listener in @events[event]
    return true

  addListener: (event, listener) ->
    (@events[event]?=[]).push listener
    return @

  on: @::addListener

  once: (event, listener) ->
    fn = =>
      @removeListener event, fn
      listener arguments...
    @on event, fn
    return @

  removeListener: (event, listener) ->
    return @ unless @events[event]
    @events[event] = (l for l in @events[event] when l isnt listener)
    return @

  removeAllListeners: (event) ->
    delete @events[event]
    return @
