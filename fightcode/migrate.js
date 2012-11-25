process.env.CWD = process.cwd();

var path = require('path'),
    configPath = path.join(process.env.CWD, 'fightcode', 'config'),
    migrator = require(path.join(configPath, 'migration'));

migrator.migrate();