var path = require('path'),
    sequelize = require('./database');

sequelize.getMigrator({path: path.join(process.env.CWD, 'fightcode', 'migrations')});
module.exports = sequelize;