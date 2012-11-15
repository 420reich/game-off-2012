
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Robot', {
        gists: { type: DataTypes.STRING, allowNull: false},
        ownerLogin: { type: DataTypes.STRING, allowNull: false}
    }, {
        underscored: true
    });
};
