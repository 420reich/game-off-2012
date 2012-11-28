var path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');

module.exports = function(sequelize, DataTypes) {
    Robot = sequelize.import(path.join(basePath, 'models', 'robot'));
    RobotRevision = sequelize.define('RobotRevision', {
        robot_id: { type: DataTypes.INTEGER, allowNull: false},
        gist_hash: { type: DataTypes.STRING, allowNull: false},
        code: { type: DataTypes.STRING, allowNull: false}
    },{
        instanceMethods:{
        },
        underscored: true
      }
    );
    RobotRevision.belongsTo(Robot)
    return RobotRevision;
};
