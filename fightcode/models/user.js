var gravatar = require('gravatar'),
    path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode'),
    Sequelize = require('sequelize');

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
                if (this.email == null) {
                    return '';
                }
                return gravatar.url(this.email, {s:'30'});
            },
            photo: function(size) {
                if (this.email == null) {
                    return '';
                }
                return gravatar.url(this.email, {s: size || '185'});
            },

            myRobotsWithRank: function(callback) {
                var sql = 'SELECT * FROM '+
                            '(SELECT *, row_number() '+
                            'OVER (ORDER BY score DESC) '+
                            'FROM "Robots") AS ordered_robots '+
                            'WHERE user_id =?';
                var query = Sequelize.Utils.format([sql, this.id]);
                sequelize.query(query, null, {raw: true, type: 'SELECT'}).success(callback);
            }
        },
        underscored: true
    });
    User.hasMany(Robot);
    return User;
};
