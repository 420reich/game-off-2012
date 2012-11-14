module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'user',
    {
      id: DataTypes.INTEGER,
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      githubId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
      }
    });
  },
  down: function(migration) {
    migration.dropTable('user');
  }
};