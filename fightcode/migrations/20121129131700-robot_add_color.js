module.exports = {
    up: function(migration, DataTypes) {
        var columnOptions = {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "#ed002"
        };
        migration.addColumn('Robots', 'color', columnOptions);
    },

    down: function(migration) {
        migration.removeColumn('Robots', 'color');
    }
};
