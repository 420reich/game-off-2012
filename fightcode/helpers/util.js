var Util = {

  mapStatistcs: function(list) {
    var statistcs = {};

    for (var i=0; i < list.length; i++){
        var id = list[i].id;
        delete list[i].id;

        list[i].hitsPercentage = this.calculatePercentage(list[i].shots_hit, list[i].shots_fired);

        statistcs[id] = list[i];
    }
    return statistcs;
  },

  calculatePercentage: function(shots_hit, shots_fired) {
    if (!!shots_fired) {
      return Math.round((shots_hit * 100) / shots_fired);
    }
    return 0;
  }
};

module.exports = Util;