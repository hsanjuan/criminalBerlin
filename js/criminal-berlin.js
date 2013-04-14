var api_url = 'https://api.twitter.com/1/statuses/user_timeline.json?callback=?'
var api_data = {
    screen_name : 'berlinpolice',
    count : 200,
    exclude_replies : true,
}

var areas = [
    "Friedrichshain-Kreuzberg",
    "Neukölln",
    "Mitte",
    "Charlottenburg-Wilmersdorf",
    "Tempelhof-Schöneberg",
    "Treptow-Köpenick",
    "Lichtenberg",
    "Reinickendorf",
    "Pankow",
    "Spandau",
    "Marzahn-Hellersdorf",
    "Steglitz-Zehlendorf"
]

function getReports(){
    $.getJSON(api_url, api_data, function(results){
        processResults(results)
    })
}

function processResults(results){
    var aggregates = {}
    for (var i = 0; i < results.length; i++){
        var r = results[i]
        var m = r.text.match(/–.+[-\/]?.+ /)
        if (!m)
            continue

        var category = m[0].split('–')
        category = category[category.length - 1].replace(/[ –]/g,'').split('/')[0]
        if (-1 == $.inArray(category, areas))
            continue
        if (aggregates[category])
            aggregates[category] += 1
        else
            aggregates[category] = 1
    }

    var since = new Date(results[results.length - 1].created_at)
    since = since.getDate() + '/' + (since.getMonth() + 1)
    var to = new Date(results[0].created_at)
    to = to.getDate() + '/' + (to.getMonth() + 1)
    var categories = []
    var data = []
    for (category in aggregates) {
        categories.push(category)
        data.push(aggregates[category])
    }

    plot(categories, data, since, to)
}


function plot(categories, data, since, to){
    $('#container').css('height', ($(window).height()-20) + 'px')
    $('#container').highcharts({
        chart: {
            type: 'column',
            margin: [ 50, 50, 200, 80],
        },
        title: {
            text: 'Reported police incidents per area ('+since+ ' - ' + to + ')'
        },
        xAxis: {
            categories: categories, //array of labels
            labels: {
                rotation: -45,
                align: 'right',
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Reports'
            }
        },
        legend: {
            enabled: false
        },
        tooltip: {
            formatter: function() {
                return '<b>'+ this.x +'</b><br/>'+
                    Highcharts.numberFormat(this.y, 0) + ' incidents';
            }
        },
        series: [{
            name: 'Incidents',
            data: data, //array of values
            dataLabels: {
                enabled: true,
                rotation: -90,
                color: '#FFFFFF',
                align: 'right',
                x: 4,
                y: 10,
                style: {
                    fontSize: '13px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        }]
    });
}

$(document).ready(function(){
    getReports()
})
