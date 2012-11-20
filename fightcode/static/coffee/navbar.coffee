do ->
    currentPathname = location.pathname
    navbar = $('.navbar')
    navbar.find('li.active')
        .removeClass('active')
    navbar.find("a[href='#{currentPathname}']")
        .closest('li').addClass('active')
