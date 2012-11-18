var FightArena, arena, container;

container = $(".fight-arena");

FightArena = (function() {

  function FightArena(container) {
    this.container = container;
    this.bindEvents();
  }

  FightArena.prototype.bindEvents = function() {};

  return FightArena;

})();

if (container.length > 0) {
  arena = new FightArena(container);
}
