module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'Fights',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      random_seed: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('Fights');
  }
};
