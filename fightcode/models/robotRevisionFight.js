var path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');

module.exports = function(sequelize, DataTypes) {
    RobotRevision = sequelize.import(path.join(basePath, 'models', 'robotRevision'));
    Fight = sequelize.import(path.join(basePath, 'models', 'fight'));
    RobotRevisionFight = sequelize.define('RobotRevisionFight', {
        position: { type: DataTypes.INTEGER, allowNull: false},
        shotsFired: { type: DataTypes.INTEGER, allowNull: false},
        shotsHit: { type: DataTypes.INTEGER, allowNull: false},
        enemiesKilled: { type: DataTypes.INTEGER, allowNull: false},
        positionX: { type: DataTypes.FLOAT, allowNull: false},
        positionY: { type: DataTypes.FLOAT, allowNull: false},
        angle: { type: DataTypes.FLOAT, allowNull: false}
    },{
        instanceMethods:{
        },
        underscored: true
      }
    );
    RobotRevisionFight.belongsTo(RobotRevision);
    RobotRevisionFight.belongsTo(Fight);
    return RobotRevision;
};
