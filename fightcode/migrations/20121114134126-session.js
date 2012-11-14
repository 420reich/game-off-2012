module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'Sessions',{
      sid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    });
  },
  down: function(migration) {
    migration.dropTable('Sessions');
  }
};