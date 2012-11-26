var gravatar = require('gravatar'),
    path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');


module.exports = function(sequelize, DataTypes) {
    Fight = sequelize.define('Fight', {
        randomSeed: { type: DataTypes.STRING, allowNull: false}
    }, {
        underscored: true
    });
    Fight.hasMany(RobotRevision);
    return Fight;
};
