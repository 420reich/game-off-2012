module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'RobotScoreHistories',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      robot_id: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
      score: DataTypes.INTEGER,
      updated_at: DataTypes.DATE,
      created_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('RobotScoreHistories');
  }
};
