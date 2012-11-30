var EJS = require('ejs'),
    gravatar = require('gravatar');

EJS.filters.gravatar_url = function(email, size) {
    return gravatar.url(email || '', {s: size});
};
