var UserChart,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

$(function() {
  return $(".dial").knob();
});

UserChart = (function() {

  function UserChart(element, data, width, height, bgcolor, colors) {
    this.element = element;
    this.data = data;
    this.width = width;
    this.height = height;
    this.bgcolor = bgcolor;
    this.colors = colors != null ? colors : ["#ed0027"];
    this.draw = __bind(this.draw, this);

    google.load("visualization", "1", {
      packages: ["corechart"]
    });
    google.setOnLoadCallback(this.draw);
  }

  UserChart.prototype.draw = function() {
    var dataTable, options;
    dataTable = google.visualization.arrayToDataTable(this.data);
    options = {
      curveType: "function",
      width: this.width,
      height: this.height,
      lineWidth: 7,
      enableInteractivity: false,
      chartArea: {
        left: 0,
        top: 0,
        width: "100%",
        height: "100%"
      },
      backgroundColor: this.bgcolor,
      colors: this.colors,
      fontSize: 0,
      vAxis: {
        baselineColor: this.bgcolor,
        gridlines: {
          color: this.bgcolor
        },
        textStyle: {
          color: this.bgcolor
        }
      },
      hAxis: {
        baselineColor: this.bgcolor,
        gridlines: {
          color: this.bgcolor
        },
        textStyle: {
          color: this.bgcolor
        }
      }
    };
    return new google.visualization.LineChart(this.element).draw(dataTable, options);
  };

  return UserChart;

})();

$('.user-chart').each(function() {
  var data, text;
  text = $(this).attr('data-chart-values');
  text = text.replace(/[']/gi, "\"");
  text = text.replace(/^\s*/gi, '').replace(/\s*$/gi, '');
  data = JSON.parse(text);
  return new UserChart(this, data, 252, 103, "#f7f7f7");
});
