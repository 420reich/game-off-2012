function checkCredentials (req, res, next) {
    if (!req.loggedIn) { /* req.loggedIn is provided by everyauth */
        // Store the custom redirect path in the session for later use -- see above
        req.session.redirectPath = req.url;

        // Redirect the user to the facebook oauth dialog
        return res.redirect('/auth/github');
    }

    // Otherwise, pass control to the route handler -- see above
    return next();
}

module.exports = checkCredentials;