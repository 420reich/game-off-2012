do ->
    currentPathname = location.pathname
    navbar = $('.menu-container')
    navbar.find('.checked')
        .removeClass('checked')
    navbar.find("a[href='#{currentPathname}'], a[data-navbar-href='#{currentPathname}']")
        .addClass('checked')
