module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'Fighters',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      shotsFired: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shotsHit: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      shotsTaken: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      winner: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      gistContent: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      robot_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fight_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('Fighters');
  }
};