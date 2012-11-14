module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'Sessions',{
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      sid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('Sessions');
  }
};