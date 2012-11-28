class top10
  constructor: (@elements) ->
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

  onClick: (ev) ->
    ev.preventDefault()
    link = $(ev.currentTarget).attr('href')
    $.ajax(link).done((data) ->
      console.log(data)
      $.modal(data, {overlayClose: true})
    )



new top10($(".top10 li"))

new selectFighter($('.actions .fight'))