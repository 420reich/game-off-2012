module.exports = {
  up: function(migration, DataTypes) {
    migration.createTable(
      'Users',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: DataTypes.STRING,
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
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
  },
  down: function(migration) {
    migration.dropTable('Users');
  }
};