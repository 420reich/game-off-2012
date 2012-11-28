var selectFighter, top10;

top10 = (function() {

  function top10(elements) {
    this.elements = elements;
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
    this.bindEvents();
  }

  selectFighter.prototype.bindEvents = function() {
    return this.elements.on('click', this.onClick);
  };

  selectFighter.prototype.onClick = function(ev) {
    var link;
    ev.preventDefault();
    link = $(ev.currentTarget).attr('href');
    return $.ajax(link).done(function(data) {
      console.log(data);
      return $.modal(data, {
        overlayClose: true
      });
    });
  };

  return selectFighter;

})();

new top10($(".top10 li"));

new selectFighter($('.actions .fight'));
