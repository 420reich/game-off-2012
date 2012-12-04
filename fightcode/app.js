
/**
 * Module dependencies.
 */

process.env.CWD = process.cwd();

var express = require('express'),
    http = require('http'),
    path = require('path'),
    gravatar = require('gravatar'),
    cluster = require('cluster'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy;

var index = require('./routes/index.js'),
    create = require('./routes/create.js'),
    user = require('./routes/user.js'),
    ranking = require('./routes/ranking.js'),
    fight = require('./routes/fight.js');

var app = express();

var staticPath = path.join(process.env.CWD, 'fightcode', 'static');
var viewsPath = path.join(process.env.CWD, 'fightcode', 'views');
var configPath = path.join(process.env.CWD, 'fightcode', 'config');
var filtersPath = path.join(process.env.CWD, 'fightcode', 'filters');
var helpersPath = path.join(process.env.CWD, 'fightcode', 'helpers');
var modelsPath = path.join(process.env.CWD, 'fightcode', 'models');

var dbSession = require(path.join(configPath, 'session'));
//var everyauth = require(path.join(configPath, 'auth'));
var checkCredentials = require(path.join(filtersPath, 'login'));

require(path.join(helpersPath, 'rankingHelper'));
require(path.join(helpersPath, 'dateHelper'));
require(path.join(helpersPath, 'robotHelper'));

var sequelize = require(path.join(configPath, 'database')),
    User = sequelize.import(path.join(modelsPath, 'user'));

passport.serializeUser(function(user, done) {
    var profile = user.profile;
    var token = user.accessToken;

    var email = profile.email;
    if (!email && profile.emails && profile.emails.length > 0) {
        email = profile.emails[0].value;
    }
    User.find({
        where: { githubId: profile.id }
    })
    .success(function(user) {
        if (user == null) {
            User.create({
                token: token,
                email: email,
                login: profile.username,
                name: profile.displayName || profile.username,
                githubId: profile.id
            }).success(function(newUser){
                done(null, newUser.id);
            });
        }
        else {
            user.token = token;
            user.email = email;
            user.login = profile.username;
            user.save().success(function(){
                done(null, user.id);
            });
        }
    });
});

passport.deserializeUser(function(obj, done) {
    User.find(obj).success(function(user) {
        done(null, user);
    });
});

passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_ID || 'b02ea2e0c17338aee416',
        clientSecret: process.env.GITHUB_SECRET || 'dbd2f9c0c1bcd303aab1745d348cc8e008dd278e',
        callbackURL: process.env.AUTH_REDIRECT_URL || "http://local.fightcodegame.com:3000/auth/github/callback",
        scope: ['gist']
    },
    function(accessToken, refreshToken, profile, done) {
        return done(null, {
            profile: profile,
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
));

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', viewsPath);
    app.set('view engine', 'ejs');
    app.use(express.favicon(path.join(process.env.CWD, 'fightcode', 'static', 'favicon.ico')));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('fnakfnkj3141349139dsikdkw'));
    app.use(express.cookieSession());
    app.use(express.session(dbSession));
    //app.use(everyauth.middleware(app));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function(req, res, next){
        res.locals.req = req;
        res.locals.gravatar = gravatar;
        return next();
    });

    app.use(function(req, res, next) {
        match = req.url.match(/[.](js|png|gif|jpg|jpeg|css)$/);
        if(match !== null && match.length > 1) {
            res.setHeader("Cache-Control", "public, max-age=604800"); // 7 days
            res.setHeader("Expires", new Date(Date.now() + 604800000).toUTCString());
        }
        return next();
    });

    app.use(express.static(staticPath));

    app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

if (process.env.NODE_ENV != 'production') {
    app.get('/fight-test', fight.fightTest);
}
app.get('/robots/replay/:fight_id', fight.replayFight);
app.get('/robots/ranking', checkCredentials, ranking.index);
app.get('/robots/create', checkCredentials, create.createView);
app.post('/robots/create', checkCredentials, create.create);
app.get('/robots/update/:robot_id', checkCredentials, create.updateView);
app.get('/robots/timeout/:robot_id', checkCredentials, fight.timeoutView);
app.put('/robots/update/:robot_id', checkCredentials, create.update);
app.get('/robots/fork/:robot_id', checkCredentials, create.fork);
app.get('/robots/fight/:robot_id/:opponent_id', checkCredentials, fight.createFight);
app.get('/robots/randomfight/:robot_id', checkCredentials, fight.randomFight);
app.get('/', index.index);
app.get('/robots/fight/:robot_id', checkCredentials, fight.prepareFight);
app.get(/^\/profile\/(.+?)\/robots\/(.+?)\/fight\/(\d+)\/?$/, checkCredentials, fight.startFight);
app.get(/^\/profile\/(\w+)\/?$/, checkCredentials, user.show);
app.get('/my-profile', checkCredentials, user.myProfile);

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback
app.get('/auth/github',
    passport.authenticate('github'),
    function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
    }
);

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect(req.session.redirectPath || '/');
    }
);

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

module.exports = app;
