var decEqual = function(actual, expected, message, tolerance) {
  if (tolerance === null || tolerance === undefined) {
    tolerance = 0.001;
  }
  ok(Math.abs(actual - expected) <= tolerance, message);
};

module('Vector');

test('exists', function() {
  ok(window.Vector2);
});

test('#new', function() {

  v = new Vector2(-100, 1);

  equal(v.x, -100);
  equal(v.y, 1);

});

test('#rotate', function() {

  v = new Vector2(-100, -1);
  pivot = new Vector2(0, 0);

  v.rotate(0, pivot);
  decEqual(v.x, -100, '0 x');
  decEqual(v.y, -1, '0 y');

  v.rotate(90, pivot);
  decEqual(v.x, 1, '90 x');
  decEqual(v.y, -100, '90 y');

  v.rotate(-90, pivot);
  decEqual(v.x, -100, '-90 x');
  decEqual(v.y, -1, '-90 y');

  v.rotate(180, pivot);
  decEqual(v.x, 100, '180 x');
  decEqual(v.y, 1, '180 y');

  v.rotate(270, pivot);
  decEqual(v.x, 1, '270 x');
  decEqual(v.y, -100, '270 y');

});
