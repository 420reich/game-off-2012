container = $(".ranking-container")

class Ranking
    constructor: (@container) ->
        @bindEvents()

    bindEvents: ->
        links = @container.find('.actions a')
        links.bind('click', (ev) ->
            link = $(ev.currentTarget)
            opponentId = link.attr('data-robot-id')

            window.location = '/heynemann/robots/MYROBOT/fight/' + opponentId;
        )

if container.length > 0
    ranking = new Ranking(container)
