elements = $(".top10 li")

elements.on('hover', (ev) ->
    elements.removeClass 'open'
    $(this).addClass 'open'
)
