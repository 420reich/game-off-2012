var cluster = require('cluster'),
    http = require('http'),
    numCPUs = require('os').cpus().length,
    app = require('./app');

if (cluster.isMaster) {
    console.log("Using " + numCPUs + "CPU(s)");
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        var exitCode = worker.process.exitCode;
        console.log('worker ' + worker.process.pid + ' died ('+exitCode+'). restarting...');
        console.log('signal: ' + signal);
        cluster.fork();
    });
} else {
    // Workers can share any TCP connection
    // In this case its a HTTP server
    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
}