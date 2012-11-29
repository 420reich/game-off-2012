module.exports = {
  up: function(migration, DataTypes) {

    migration.addColumn(
      'Robots',
      'linesOfCode', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    });
  },
  down: function(migration) {
    migration.removeColumn('Robots', 'linesOfCode');
  }
};
