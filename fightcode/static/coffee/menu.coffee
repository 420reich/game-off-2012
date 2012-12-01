do ->
  menuContainer = $(".menu-container")
  topBorder = $(".ribbon-container")
  ribbon = menuContainer.find(".ribbon")

  ribbon.on "click", (ev) ->
    ev.preventDefault()
    menuContainer.toggleClass "open"

  ribbon.on "hover", ->
    topBorder.trigger "hover"

  codeContainer = $(".code-container")
  codeRibbon = codeContainer.find(".ribbon")

  codeRibbon.on "click", (ev) ->
    ev.preventDefault()
    $(ev.currentTarget).parents(".code-container").first().toggleClass "open"
