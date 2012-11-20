
(function() {
  var currentPathname, navbar;
  currentPathname = location.pathname;
  navbar = $('.navbar');
  navbar.find('li.active').removeClass('active');
  return navbar.find("a[href='" + currentPathname + "']").closest('li').addClass('active');
})();
