
/**
 * Module dependencies.
 */

process.env.CWD = process.cwd();

var express = require('express'),
    http = require('http'),
    path = require('path'),
    gravatar = require('gravatar'),
    cluster = require('cluster');

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

var dbSession = require(path.join(configPath, 'session'));
var everyauth = require(path.join(configPath, 'auth'));
var checkCredentials = require(path.join(filtersPath, 'login'));

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', viewsPath);
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('fnakfnkj3141349139dsikdkw'));
    app.use(express.cookieSession());
    app.use(express.session(dbSession));
    app.use(express.static(staticPath));
    app.use(everyauth.middleware(app));

    app.use(function(req, res, next){
        res.locals.req = req;
        res.locals.gravatar = gravatar;
        next();
    });

    app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/robots/ranking', checkCredentials, ranking.index);
app.get('/robots/create', checkCredentials, create.createView);
app.post('/robots/create', checkCredentials, create.create);
app.get('/robots/update/:robot_id', checkCredentials, create.updateView);
app.put('/robots/update/:robot_id', checkCredentials, create.update);
app.get('/robots/fork/:robot_id', checkCredentials, create.fork);
app.get('/', index.index);
app.get(/^\/profile\/(.+?)\/robots\/(.+?)\/fight\/(\d+)\/?$/, checkCredentials, fight.startFight);
app.get(/^\/profile\/(\w+)\/?$/, user.show);
app.get('/my-profile', checkCredentials, user.myProfile);

module.exports = app;
