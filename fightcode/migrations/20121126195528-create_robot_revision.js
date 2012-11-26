module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'RobotRevisions',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      gistHash: {
          type: DataTypes.STRING,
          allowNull: false
      },
      code: {
          type: DataTypes.TEXT,
          allowNull: false
      },
      robotId: {
          type: DataTypes.INTEGER,
          allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('RobotRevisions');
  }
};
