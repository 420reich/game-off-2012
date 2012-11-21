module.exports = {
  up: function(migration, DataTypes) {
    migration.addColumn(
      'Robots',
      'title',
    {
      type: DataTypes.STRING,
      allowNull: true,
      default: ''
    });
  },
  down: function(migration) {
    migration.removeColumn('Robots', 'title');
  }
};