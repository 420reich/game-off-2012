var path = require('path'),
    basePath = path.join(process.env.CWD, 'fightcode');

module.exports = function(sequelize, DataTypes) {
    Fighter = sequelize.import(path.join(basePath, 'models', 'fighter'));
    Robot = sequelize.define('Robot', {
        gist: { type: DataTypes.STRING, allowNull: false},
        title: { type: DataTypes.STRING, allowNull: false},
        ownerLogin: { type: DataTypes.STRING, allowNull: false},
        victories: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        defeats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        draws: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        isPublic: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true}
    },{
        instanceMethods:{
            updateScore: function(){
                var WonPoints = this.victories * 3,
                    LostPoints = this.defeats * -1,
                    DrawPoints = this.draws;

                this.score = this.score + WonPoints + LostPoints + DrawPoints;
                this.save();
            },

            addVictory: function() {
                this.victories += 1;
                this.updateScore();
            },

            addDefeat: function() {
                this.defeats += 1;
                this.updateScore();
            },

            addDraw: function() {
                this.draws += 1;
                this.updateScore();
            },

            rankNear: function(callback) {
                var sql = ['WITH robot_position AS (',
                                  'SELECT * FROM',
                                    '(SELECT id,score,row_number()',
                                      'OVER (ORDER BY score DESC)',
                                      'FROM "Robots" ORDER BY score) AS rank',
                                    'WHERE rank.id = \''+ this.id +'\'',
                                    'ORDER BY rank.row_number)',
                            'SELECT *',
                              'FROM (SELECT *, row_number()',
                                'OVER (ORDER BY score DESC)',
                                'FROM "Robots") AS robots',
                              'WHERE row_number',
                              'BETWEEN',
                                '(SELECT row_number FROM robot_position) - 10',
                                'AND',
                                '(SELECT row_number FROM robot_position)',
                              'OR',
                              'row_number BETWEEN',
                                '(SELECT row_number FROM robot_position)',
                                'AND',
                                '(SELECT row_number FROM robot_position)+10'].join(' ');
                sequelize.query(sql, null, {raw: true, type: 'SELECT'}).success(callback);
            }
        },
        underscored: true
      }
    );
    Robot.hasMany(Fighter);
    return Robot;
};
