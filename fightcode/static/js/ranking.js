var selectFighter, top10,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

top10 = (function() {

  function top10(elements) {
    this.elements = elements;
    this.fighterSelected = false;
    this.bindEvents();
  }

  top10.prototype.bindEvents = function() {
    var _this = this;
    return this.elements.on('hover', function(ev) {
      _this.elements.removeClass('open');
      return $(ev.currentTarget).addClass('open');
    });
  };

  return top10;

})();

selectFighter = (function() {

  function selectFighter(elements) {
    this.elements = elements;
    this.onClick = __bind(this.onClick, this);

    this.bindEvents();
  }

  selectFighter.prototype.bindEvents = function() {
    return this.elements.on('click', this.onClick);
  };

  selectFighter.prototype.preventDoubleClick = function(dialog) {
    var _this = this;
    return $('.choose-area .start-fight').on('click', function(ev) {
      if (_this.fighterSelected) {
        ev.preventDefault();
      }
      return _this.fighterSelected = true;
    });
  };

  selectFighter.prototype.onClick = function(ev) {
    var link, self;
    self = this;
    ev.preventDefault();
    link = $(ev.currentTarget).attr('href');
    return $.ajax(link).done(function(data) {
      var modal;
      modal = $.modal(data, {
        overlayClose: true,
        opacity: 75
      });
      return self.preventDoubleClick(modal);
    });
  };

  return selectFighter;

})();

new top10($(".top10 li"));

new selectFighter($('.actions .fight'));
