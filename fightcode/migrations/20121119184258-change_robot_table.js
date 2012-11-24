var newFields = ['victories', 'defeats', 'draws'];

module.exports = {
  up: function(migration, DataTypes) {
    for (var i=0; i < newFields.length; i++) {
      migration.addColumn(
        'Robots',
        newFields[i],
      {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0
      });
    }
  },
  down: function(migration) {
    for (var i=0; i < newFields.length; i++) {
      migration.removeColumn('Robots', newFields[i]);
    }
  }
};