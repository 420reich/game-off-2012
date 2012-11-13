
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var app = express();

process.env.CWD = process.cwd();
var staticPath = path.join(process.env.CWD, 'fightcode', 'static');
var modelsPath = path.join(process.env.CWD, 'fightcode', 'models');
var configPath = path.join(process.env.CWD, 'fightcode', 'config');

var everyauth = require(path.join(configPath, 'auth'));

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
    app.use(express.static(staticPath));
    app.use(everyauth.middleware(app));

    app.use(function(req, res, next){
        res.locals.session = req.session;

        res.locals.user = null;
        if (req.session.auth != null && req.session.auth.github.user != null) {
            res.locals.user = req.session.auth.github.user;
        }

        next();
    });

    app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
