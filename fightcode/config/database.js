var db = process.env.DATABASE_URL,
    path = require('path'),
    modelsPath = path.join(process.env.CWD, 'fightcode', 'models'),
    Sequelize = require('sequelize');

if (db == null) {
    db = {
        protocol: 'tcp',
        host: 'localhost',
        port: 5432,
        database: 'fightcode',
        user: 'fightcode',
        password: null
    };
} else {
    matches = db.match(/^(postgres)\:\/\/(.+?):(.+?)@(.+?):(.+?)\/(.+)$/);
    db = {
        protocol: matches[1],
        host: matches[4],
        port: parseInt(matches[5], 10),
        database: matches[6],
        user: matches[2],
        password: matches[3]
    };
}

var sequelize = new Sequelize(db.database, db.user, db.password, {
    protocol: db.protocol,
    host: db.host,
    port: db.port,
    dialect: 'postgres',
    sync: {
        force: true
    }
});

var User = sequelize.import(path.join(modelsPath, 'user'));

module.exports = sequelize;
