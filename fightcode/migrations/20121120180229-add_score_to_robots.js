module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'Robots',
      'score',
    {
      type: DataTypes.INTEGER,
      allowNull: true,
      default: 0
    });
  },
  down: function(migration) {
    migration.removeColumn('Robots', 'score');
  }
};