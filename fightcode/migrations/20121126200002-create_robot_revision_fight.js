module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'RobotRevisionFights',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      robot_revision_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fight_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shots_fired: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shots_hit: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      enemies_killed: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      position_x: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      position_y: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      angle: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('RobotRevisionFights');
  }
};
