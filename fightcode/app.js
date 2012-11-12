
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    everyauth = require('everyauth'),
    Sequelize = require('sequelize');

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

var app = express();

process.env.CWD = process.cwd();
var staticPath = path.join(process.env.CWD, 'fightcode', 'static');
var modelsPath = path.join(process.env.CWD, 'fightcode', 'models');

var sequelize = new Sequelize('fightcode', 'bernardo', null, {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    sync: {
        force: true
    }
});

var User = sequelize.import(path.join(modelsPath, 'user'));
sequelize.sync();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('fnakfnkj3141349139dsikdkw'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(staticPath));
    app.use(everyauth.middleware());
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

everyauth.helpExpress(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
