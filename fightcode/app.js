
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path');

var index = require('./routes/index.js'),
    create = require('./routes/create.js');

var app = express();

process.env.CWD = process.cwd();
var staticPath = path.join(process.env.CWD, 'fightcode', 'static');
var viewsPath = path.join(process.env.CWD, 'fightcode', 'views');
var configPath = path.join(process.env.CWD, 'fightcode', 'config');

var dbSession = require(path.join(configPath, 'session'));
var everyauth = require(path.join(configPath, 'auth'));
var migrator = require(path.join(configPath, 'migration'));
migrator.migrate();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', viewsPath);
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session(dbSession));
    app.use(express.static(staticPath));
    app.use(everyauth.middleware(app));

    app.use(function(req, res, next){
        res.locals.req = req;
        next();
    });

    app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/robots/create', create.create);
app.get('/', index.index);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
