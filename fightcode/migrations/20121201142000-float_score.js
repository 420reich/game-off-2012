module.exports = {
  up: function(migration, DataTypes) {
    migration.changeColumn(
      'Robots',
      'score',
    {
      type: DataTypes.FLOAT,
      allowNull: false
    });
  },
  down: function(migration) {
    migration.changeColumn(
      'Robots',
      'score',
    {
      type: DataTypes.INTEGER,
      allowNull: false
    });
  }
};
