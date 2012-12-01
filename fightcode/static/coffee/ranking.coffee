class top10
  constructor: (@elements) ->
    @fighterSelected = false
    @bindEvents()

  bindEvents: ->
    @elements.on('hover', (ev) =>
      @elements.removeClass 'open'
      $(ev.currentTarget).addClass 'open'
    )

class selectFighter
  constructor: (@elements) ->
    @bindEvents()

  bindEvents: ->
    @elements.on 'click', @onClick

  preventDoubleClick: (dialog)->
    $('.choose-area .start-fight').on('click', (ev)=>
      ev.preventDefault() if @fighterSelected
      @fighterSelected = true
    )

  onClick: (ev) =>
    self = @
    ev.preventDefault()
    link = $(ev.currentTarget).attr('href')
    $.ajax(link).done((data) ->
      modal = $.modal(data, {overlayClose: true, opacity: 75})
      self.preventDoubleClick(modal)
    )



new top10($(".top10 li"))

new selectFighter($('.actions .fight'))