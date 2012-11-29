var path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode'),
    Sequelize = require('sequelize'),
    Util = require(path.join(basePath, 'helpers', 'util')),
    dateFormat = require('dateformat'),
    gravatar = require('gravatar');

module.exports = function(sequelize, DataTypes) {
    Robot = sequelize.define('Robot', {
        gist: { type: DataTypes.STRING, allowNull: false},
        title: { type: DataTypes.STRING, allowNull: false},
        color: { type: DataTypes.STRING, allowNull: true, defaultValue: "#ed002"},
        linesOfCode: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        ownerLogin: { type: DataTypes.STRING, allowNull: false},
        victories: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        defeats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        draws: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
    },{
        instanceMethods:{
            updateScore: function(callback){
                var WonPoints = this.victories * 3,
                    LostPoints = this.defeats * -1,
                    DrawPoints = this.draws;

                this.score = this.score + WonPoints + LostPoints + DrawPoints;
                this.save().success(function() {
                    callback(this);
                });
            },

            addVictory: function(callback) {
                this.victories += 1;
                this.updateScore(callback);
            },

            addDefeat: function(callback) {
                this.defeats += 1;
                return this.updateScore(callback);
            },

            addDraw: function(callback) {
                this.draws += 1;
                return this.updateScore(callback);
            },

            rankNear: function(callback) {
                var sql = 'WITH robot_position AS ( '+
                                  'SELECT * FROM '+
                                    '(SELECT id, score, row_number() '+
                                      'OVER (ORDER BY score DESC) '+
                                      'FROM "Robots" ORDER BY score) AS rank '+
                                    'WHERE rank.id = ? '+
                                    'ORDER BY rank.row_number) '+
                            'SELECT robots.*, u.email, u.login '+
                              'FROM (SELECT *, row_number() '+
                                'OVER (ORDER BY score DESC) '+
                                'FROM "Robots") AS robots '+
                                'INNER JOIN "Users" u ON (robots.user_id = u.id) '+
                              'WHERE '+
                              'row_number '+
                              'BETWEEN '+
                                '(SELECT row_number FROM robot_position) - 3 '+
                                'AND '+
                                '(SELECT row_number FROM robot_position) '+
                              'OR '+
                              'row_number BETWEEN '+
                                '(SELECT row_number FROM robot_position) '+
                                'AND '+
                                '(SELECT row_number FROM robot_position) + 3 '+
                              'ORDER BY row_number ASC';
                var query = Sequelize.Utils.format([sql, this.id]);
                sequelize.query(query, null, {raw: true, type: 'SELECT'}).success(callback);
            }
        },
        classMethods: {
            top10: function(callback) {
                var sql =   'WITH robot_statistics AS ( '+
                            'SELECT r.id, sum(rf.enemies_killed) enemies_killed,  '+
                            'sum(shots_fired) shots_fired, sum(shots_hit) shots_hit '+
                            'FROM "RobotRevisions" rev '+
                            'INNER JOIN "Robots" r ON (r.id = rev.robot_id) '+
                            'INNER JOIN "RobotRevisionFights" rf ON (rev.id = rf.robot_revision_id) '+
                            'WHERE r.id IN (SELECT id FROM "Robots" ORDER BY score LIMIT 10) '+
                            'GROUP BY r.id) '+
                            'SELECT row_number() OVER (ORDER BY score DESC), '+
                            'r.*, u.email, u.login, robot_statistics.* '+
                            'FROM "Robots" r '+
                            'INNER JOIN "Users" u ON (r.user_id = u.id) '+
                            'LEFT OUTER JOIN robot_statistics ON (r.id = robot_statistics.id) '+
                            'ORDER BY r.score DESC LIMIT 10 ';
                sequelize.query(sql, null, {raw: true, type: 'SELECT'})
                    .success(function(data){
                        for (i=0; i < data.length; i++) {
                            data[i].hitsPercentage = Util.calculatePercentage(data[i].shots_hit, data[i].shots_fired);
                        }
                        callback(data);
                    });
            },

            lastFights: function(callback) {
                var sql =   'WITH last_fights AS ( '+
                            'SELECT * FROM "Fights" '+
                            'ORDER BY created_at DESC '+
                            'LIMIT 3 '+
                            ') '+
                            'SELECT last_fights.id, rob.title, rob.row_number, u.email, u.login FROM "RobotRevisionFights" revF '+
                            'INNER JOIN last_fights ON (last_fights.id = revF.fight_id) '+
                            'INNER JOIN "RobotRevisions" rev ON (rev.id = revF.robot_revision_id) '+
                            'INNER JOIN (SELECT *, row_number() OVER (ORDER BY score DESC) FROM "Robots") rob ON (rev.robot_id = rob.id) '+
                            'INNER JOIN "Users" u ON (rob.user_id = u.id) '+
                            'ORDER BY last_fights.id DESC ';

                sequelize.query(sql, null, {raw: true, type: 'SELECT'}).success(function(data){
                    var fightList = [], i;
                    for (i=0; i < data.length; i += 2) {
                        fightList.push([data[i], data[i+1]]);
                    }
                    callback(fightList);
                });
            }
        },
        underscored: true
      }
    );

    Robot.timelineFights = function(callback) {
        var sql = 'SELECT f.id fight_id, f.created_at created_at, r.title robot_name, r.gist, r.color, u.id user_id, u.email, u.name ' + 
                  'FROM "RobotRevisionFights" rrf ' +
                  '   INNER JOIN "Fights" f ON (rrf.fight_id = f.id) ' +
                  '   INNER JOIN "RobotRevisions" rev ON (rrf.robot_revision_id = rev.id) ' +
                  '   INNER JOIN "Robots" r ON (rev.robot_id = r.id) ' +
                  '   INNER JOIN "Users" u ON (r.user_id = u.id) ' +
                  'ORDER BY f.created_at DESC LIMIT 100';

        sequelize.query(sql, null, {raw: true, type: 'SELECT'}).success(function(data){
            var fightList = [], i;
            for (i=0; i < data.length; i += 2) {
                // Date
                data[i].created_at = dateFormat(data[i].created_at, "dddd, mmmm dS, yyyy");
                data[i + 1].created_at = dateFormat(data[i + 1].created_at, "dddd, mmmm dS , yyyy");

                // Thumb
                data[i].thumb = gravatar.url(data[i].email, {s: 110});
                data[i + 1].thumb = gravatar.url(data[i + 1].email, {s: 110});

                fightList.push([data[i], data[i+1]]);
            }
            callback(fightList);
        });
    };

    return Robot;
};
