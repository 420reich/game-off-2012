var path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');

module.exports = function(sequelize, DataTypes) {
    RobotRevision = sequelize.import(path.join(basePath, 'models', 'robotRevision'));
    Fight = sequelize.import(path.join(basePath, 'models', 'fight'));
    RobotRevisionFight = sequelize.define('RobotRevisionFight', {
        position: { type: DataTypes.INTEGER, allowNull: false},
        shots_fired: { type: DataTypes.INTEGER, allowNull: false},
        shots_hit: { type: DataTypes.INTEGER, allowNull: false},
        enemies_killed: { type: DataTypes.INTEGER, allowNull: false},
        position_x: { type: DataTypes.FLOAT, allowNull: false},
        position_y: { type: DataTypes.FLOAT, allowNull: false},
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
