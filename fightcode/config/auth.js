var everyauth = require('everyauth'),
    path = require('path'),
    sequelize = require('./database'),
    modelsPath = path.join(process.env.CWD, 'fightcode', 'models'),
    User = sequelize.import(path.join(modelsPath, 'user'));

everyauth.everymodule.findUserById(function (userId, callback) {
    User.find(userId)
        .success(function(user) {
            callback(null, user);
        });
});

everyauth.github
    .appId(process.env.GITHUB_ID || 'b02ea2e0c17338aee416')
    .appSecret(process.env.GITHUB_SECRET || 'dbd2f9c0c1bcd303aab1745d348cc8e008dd278e')
    .scope('gist')
    .findOrCreateUser(function (session, accessToken, accessTokenExtra, githubUserMetadata) {
        var promise = this.Promise();

        User.find({
            where: { githubId: githubUserMetadata.id }
        })
        .success(function(user) {
            if (user == null) {
                User.create({
                    token: accessToken,
                    email: githubUserMetadata.email,
                    login: githubUserMetadata.login,
                    name: githubUserMetadata.name,
                    githubId: githubUserMetadata.id
                }).success(function (user) {
                    promise.fulfill(user);
                });
            }
            else {
                promise.fulfill(user);
            }
        });

        return promise;
    })
    .redirectPath('/')
    .sendResponse( function (res, data) {
        var redirect;

        if (data.session.redirectPath) {
            redirect = data.session.redirectPath;
            data.session.redirectPath = null;
        }

        res.redirect(redirect || // Re-direct to the path stored in the session by route middleware
            this.redirectPath());              // Or redirect to the configured redirectPath
    });

module.exports = everyauth;
