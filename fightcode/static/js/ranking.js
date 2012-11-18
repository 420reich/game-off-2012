var Ranking, container, ranking;

container = $(".ranking-container");

Ranking = (function() {

  function Ranking(container) {
    this.container = container;
    this.bindEvents();
  }

  Ranking.prototype.bindEvents = function() {
    var links;
    links = this.container.find('.actions a');
    return links.bind('click', function(ev) {
      var link, opponentId;
      link = $(ev.currentTarget);
      opponentId = link.attr('data-robot-id');
      return window.location = '/heynemann/robots/MYROBOT/fight/' + opponentId;
    });
  };

  return Ranking;

})();

if (container.length > 0) {
  ranking = new Ranking(container);
}
