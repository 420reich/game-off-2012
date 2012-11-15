module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'Robots',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      gists: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ownerLogin: {
        type: DataTypes.STRING,
        allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('Robots');
  }
};
