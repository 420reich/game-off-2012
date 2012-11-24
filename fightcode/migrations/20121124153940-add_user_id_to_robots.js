module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'Robots',
      'user_id',
    {
      type: DataTypes.INTEGER,
      allowNull: false
    });
  },
  down: function(migration) {
    migration.removeColumn('Robots', 'user_id');
  }
};