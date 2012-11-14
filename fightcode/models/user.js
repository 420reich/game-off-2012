var gravatar = require('gravatar');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User', {
        token: { type: DataTypes.STRING, allowNull: false},
        email: { type: DataTypes.STRING },
        login: { type: DataTypes.STRING, allowNull: false},
        name: { type: DataTypes.STRING, allowNull: false},
        githubId: { type: DataTypes.INTEGER, allowNull: false, unique: true}
    }, {
        instanceMethods: {
            thumb: function() {
                return gravatar.url(this.email, {s:'45'});
            }
        },
        underscored: true
    });
};
