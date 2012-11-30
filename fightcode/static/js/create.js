
$('#robo-code-form').submit(function(ev) {
  var titleTextarea;
  titleTextarea = $(this).find('[name=title]');
  if (titleTextarea.val() === "") {
    titleTextarea.addClass('error');
    ev.preventDefault();
    return false;
  }
});
