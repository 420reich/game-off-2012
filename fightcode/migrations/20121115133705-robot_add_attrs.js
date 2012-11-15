module.exports = {
  up: function(migration, DataTypes) {

    migration.addColumn(
      'Robots',
      'isPublic', {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    });

    migration.addColumn(
      'Robots',
      'title', {
        type: DataTypes.STRING,
        allowNull: false
    });

  },
  down: function(migration) {
    migration.removeColumn('Robots', 'isPublic');
    migration.removeColumn('Robots', 'title');
  }
};
