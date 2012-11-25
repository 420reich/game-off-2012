var gravatar = require('gravatar'),
    path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');


module.exports = function(sequelize, DataTypes) {
    Fighter = sequelize.define('Fighter', {
        shotsFired: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        shotsHit: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        shotsTaken: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        winner: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
        gistContent: { type: DataTypes.TEXT, allowNull: false, defaultValue: false}
    },{
        underscored: true
    });
    return Fighter;
};
