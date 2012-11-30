$('#robo-code-form').submit( (ev)->
  titleTextarea = $(this).find('[name=title]')
  if (titleTextarea.val() == "")
    titleTextarea.addClass('error')
    ev.preventDefault()
    return false
)