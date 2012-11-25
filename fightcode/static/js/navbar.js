
(function() {
  var currentPathname, navbar;
  currentPathname = location.pathname;
  navbar = $('.menu-container');
  navbar.find('.checked').removeClass('checked');
  return navbar.find("a[href='" + currentPathname + "'], a[data-navbar-href='" + currentPathname + "']").addClass('checked');
})();
