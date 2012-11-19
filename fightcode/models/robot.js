
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Robot', {
        gists: { type: DataTypes.STRING, allowNull: false},
        ownerLogin: { type: DataTypes.STRING, allowNull: false},
        victories: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        defeats: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        draws: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0},
        score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
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
            }
        }
      },
      {
        underscored: true
      }
    );
};
