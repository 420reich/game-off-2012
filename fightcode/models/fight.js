var gravatar = require('gravatar'),
    path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');


module.exports = function(sequelize, DataTypes) {
    Fighter = sequelize.import(path.join(basePath, 'models', 'fighter'));
    Fight = sequelize.define('Fight', {
        finished: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
    },{
        underscored: true
    });
    Fight.hasMany(Fighter);
    return Fight;
};
