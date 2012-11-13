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
    .appId('4c5572cd92672de4bd8d')
    .appSecret('08a51a82e0b1f05ce0a747cb23e7723ab751bd73')
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
    .redirectPath('/');

module.exports = everyauth;