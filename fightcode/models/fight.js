var gravatar = require('gravatar'),
    path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');


module.exports = function(sequelize, DataTypes) {
    Fight = sequelize.define('Fight', {
        random_seed: { type: DataTypes.STRING, allowNull: false}
    }, {
        underscored: true
    });
    return Fight;
};
