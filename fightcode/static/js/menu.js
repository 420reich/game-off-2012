
(function() {
  var codeContainer, codeRibbon, menuContainer, ribbon, topBorder;
  menuContainer = $(".menu-container");
  topBorder = $(".ribbon-container");
  ribbon = menuContainer.find(".ribbon");
  ribbon.on("click", function(ev) {
    ev.preventDefault();
    return menuContainer.toggleClass("open");
  });
  ribbon.on("hover", function() {
    return topBorder.trigger("hover");
  });
  codeContainer = $(".code-container");
  codeRibbon = codeContainer.find(".ribbon");
  return codeRibbon.on("click", function(ev) {
    ev.preventDefault();
    return $(ev.currentTarget).parents(".code-container").first().toggleClass("open");
  });
})();
