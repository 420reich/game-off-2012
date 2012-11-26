$(->
    $(".dial").knob()
)

class UserChart
    constructor: (@element, @data, @width, @height, @bgcolor, @colors=["#ed0027"]) ->
        google.load(
            "visualization",
            "1",
            { packages:["corechart"] }
        )

        google.setOnLoadCallback(@draw)

    draw: =>
        dataTable = google.visualization.arrayToDataTable(@data)
        options =
            curveType: "function"
            width: @width
            height: @height
            lineWidth: 7
            enableInteractivity: false
            chartArea:
                left: 0
                top: 0
                width: "100%"
                height: "100%"
            backgroundColor: @bgcolor
            colors: @colors
            fontSize: 0
            vAxis:
                baselineColor: @bgcolor
                gridlines:
                    color: @bgcolor
                textStyle:
                    color: @bgcolor
            hAxis:
                baselineColor: @bgcolor
                gridlines:
                    color: @bgcolor
                textStyle:
                    color: @bgcolor

        new google.visualization.LineChart(@element).draw(dataTable, options)

$('.user-chart').each(->
    text = $(this).attr('data-chart-values')
    text = text.replace(/[']/gi, "\"")
    text = text.replace(/^\s*/gi, '').replace(/\s*$/gi, '')
    data = JSON.parse(text)
    new UserChart(this, data, 252, 103, "#f7f7f7")
)
