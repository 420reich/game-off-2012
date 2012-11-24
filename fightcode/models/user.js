var gravatar = require('gravatar'),
    path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');


module.exports = function(sequelize, DataTypes) {
    Robot = sequelize.import(path.join(basePath, 'models', 'robot'));
    User = sequelize.define('User', {
        token: { type: DataTypes.STRING, allowNull: false},
        email: { type: DataTypes.STRING },
        login: { type: DataTypes.STRING, allowNull: false},
        name: { type: DataTypes.STRING, allowNull: false},
        githubId: { type: DataTypes.INTEGER, allowNull: false, unique: true}
    }, {
        instanceMethods: {
            thumb: function() {
                return gravatar.url(this.email, {s:'45'});
            },
            photo: function(size) {
                return gravatar.url(this.email, {s: size || '185'});
            }
        },
        underscored: true
    });
    User.hasMany(Robot);
    return User;
};
