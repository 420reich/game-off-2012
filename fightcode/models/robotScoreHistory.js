var path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode'),
    Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    RobotScoreHistory = sequelize.define('RobotScoreHistory', {
        robot_id: { type: DataTypes.INTEGER, allowNull: false},
        score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
    },
    {
        classMethods: {
            histories: function(robotIds, callback) {
                if (!robotIds || robotIds.length === 0) {
                    callback({});
                    return;
                }
                var sql = 
                    'select robot_id, date_trunc(?, created_at) as ts, max(score) as score ' +
                    'from "RobotScoreHistories" ' +
                    'where robot_id in (' + robotIds.join(',') + ') ' +
                    'group by robot_id, ts ' +
                    'order by robot_id, ts';
                var query = Sequelize.Utils.format([sql, "hour"]);
                sequelize.query(query, null, {raw: true, type: 'SELECT'}).success(function(histories) {
                    historiesMap = {};
                    histories.forEach(function(el) {
                        historiesMap[el.robot_id] = historiesMap[el.robot_id] || [];
                        historiesMap[el.robot_id].push(el);
                    });
                    callback(historiesMap);
                });
            }

        },
        underscored: true
    });

    return RobotScoreHistory;
};
