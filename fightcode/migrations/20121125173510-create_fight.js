module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'Fights',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      finished: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('Fights');
  }
};