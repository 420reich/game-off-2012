module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'RobotRevisionFights',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      robotId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fightId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shotsFired: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shotsHit: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      enemiesKilled: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      positionX: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
      positionY: {
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
