var elements;

elements = $(".top10 li");

elements.on('hover', function(ev) {
  elements.removeClass('open');
  return $(this).addClass('open');
});
