/*global ftaceData, $, document, chrome, d3 */
if (typeof (ftaceData) === "undefined") {
    var ftaceData = (function ($, d3) {

        var mini_chart = {
            "width": 300,
            "height": 200,
            "margin": { "top": 5, "right": 5, "bottom": 30, "left": 50 },
            "innerWidth": 0,
            "innerHeight": 0
        };
        mini_chart.innerWidth = mini_chart.width - (mini_chart.margin.left + mini_chart.margin.right);
        mini_chart.innerHeight = mini_chart.height - (mini_chart.margin.top + mini_chart.margin.bottom);

        function getLinks() {
            var links = {};

            $('a[href^="http://www.ft.com/cms"]').each(function () {
                var link = $(this),
                    uuid = link.attr('href').match(/http:\/\/www\.ft\.com\/cms(\/s)?\/\d\/([\w\-]+)\.html/);

                if (uuid) {
                    links[uuid[2]] = link;
                }
            });

            return links;
        }

        function getData(links, callback) {
            if (typeof callback === "undefined") { callback = function () {}; }

            var article_data = {}, min = 10000, max = 0;

            $.ajax({
                url : 'https://realtime.ijento.com/financialtimes/ft-top-articles.txt',
                dataType: "json",
                success : function (json, textStatus, jqXHR) {
                    var data_index, hours, raw_data, raw_index, date, impressions,
                        referers = ["homepage", "search", "external", "internal", "other"], referer_index, region_index, uuid,
                        data = json.articles;

                    for (data_index = 0; data_index < data.length; data_index = data_index + 1) {
                        if (links.hasOwnProperty(data[data_index].uuid)) {
                            hours = [];
                            raw_data = data[data_index].hours.slice(-6);

                            // {"homepage":[0,0,0,0,0,0],"search":[0,0,0,0,0,0],"external":[0,0,0,0,0,0],"internal":[0,0,0,0,0,0],"other":[0,0,0,0,0,0]}

                            // Loop though last six hours
                            for (raw_index = 0; raw_index < 6; raw_index = raw_index + 1) {
                                impressions = 0;
                                date = new Date();
                                date.setHours(date.getHours() - 6 + raw_index);

                                // Loop though referers
                                for (referer_index = 0; referer_index < referers.length; referer_index = referer_index + 1) {
                                    // Loop though regions
                                    for (region_index = 0; region_index < 6; region_index = region_index + 1) {
                                        impressions += raw_data[raw_index][referers[referer_index]][region_index];
                                    }
                                }

                                hours.push({ date: date, impressions: impressions });
                            }

                            article_data[data[data_index].uuid] = {
                                "now": hours[(hours.length - 1)].impressions,
                                "hours" : hours,
                                "link" : links[data[data_index].uuid]
                            };
                        }
                    }

                    for (uuid in article_data) {
                        if (article_data.hasOwnProperty(uuid)) {
                            if (article_data[uuid].now < min) {
                                min = article_data[uuid].now;
                            }
                            if (article_data[uuid].now > max) {
                                max = article_data[uuid].now;
                            }
                        }
                    }

                    callback(article_data, min, max);
                }
            });
        }

        function createColorScale(min, max) {
            var color_scale = d3.scale.linear().domain([min, max]).range(["#99F", "#F33"]),
                svg = d3.select("body")
                    .append("svg")
                    .attr("class", "data-scale")
                    .attr("width", 100)
                    .attr("height", 500)
                    .attr("style", "position: absolute; top:10px; right:10px;")
                    .append("g"),
                gradient = svg.append("svg:defs")
                    .append("svg:linearGradient")
                    .attr("id", "gradient")
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "0%")
                    .attr("y2", "100%")
                    .attr("spreadMethod", "pad");

            gradient.append("svg:stop")
                .attr("offset", "0%")
                .attr("stop-color", color_scale(min))
                .attr("stop-opacity", 1);
            gradient.append("svg:stop")
                .attr("offset", "100%")
                .attr("stop-color", color_scale(max))
                .attr("stop-opacity", 1);

            svg.append("rect")
                .attr("width", 100)
                .attr("height", 500)
                .style("fill", "url(#gradient)");

            svg.append("text")
                .text("Min: " + min)
                .style("fill", "#000")
                .attr("transform", "translate(10,20)");
            svg.append("text")
                .text("Right now")
                .style("fill", "#000")
                .attr("transform", "translate(10,220)");
            svg.append("text")
                .text("Max: " + max)
                .style("fill", "#000")
                .attr("transform", "translate(10,480)");

            return color_scale;
        }

        function createSixHourMiniChart(ftace, article_data) {
            var x = d3.time.scale().range([0, mini_chart.innerWidth]),
                y = d3.scale.linear().range([mini_chart.innerHeight, 0]),
                xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.hours, 2),
                yAxis = d3.svg.axis().scale(y).orient("left"),
                line = d3.svg.line().interpolate("basis").x(function (d) { return x(d.date); }).y(function (d) { return y(d.impressions); }),
                six_hours = d3.select("body")
                    .append("svg")
                    .attr("class", ftace.prefix + "data sixhours")
                    .attr("width", mini_chart.width)
                    .attr("height", mini_chart.height)
                    .append("g")
                    .attr("transform", "translate(" + mini_chart.margin.left + "," + mini_chart.margin.top + ")");

            x.domain([
                d3.min(article_data.hours, function (d) { return d.date; }),
                d3.max(article_data.hours, function (d) { return d.date; })
            ]);
            y.domain([
                d3.min(article_data.hours, function (d) { return d.impressions; }),
                d3.max(article_data.hours, function (d) { return d.impressions; })
            ]);

            six_hours
                .append("path")
                .datum(article_data.hours)
                .attr("class", ftace.prefix + "data line")
                .style("stroke", "#000")
                .attr("d", line);

            six_hours.append("g")
                .attr("class", ftace.prefix + "data x axis")
                .attr("transform", "translate(0," + mini_chart.innerHeight + ")")
                .call(xAxis)
                .append("text")
                .attr("class", ftace.prefix + "data axis-title")
                .attr("x", 20)
                .attr("y", mini_chart.margin.bottom - 10)
                .attr("dy", ".71em")
                .text("Time (GMT)");

            six_hours.append("g")
                .attr("class", ftace.prefix + "data y axis")
                .call(yAxis)
                .append("text")
                .attr("class", ftace.prefix + "data axis-title")
                .attr("transform", "rotate(90)")
                .attr("y", mini_chart.margin.left - 16)
                .attr("x", 20)
                .attr("dy", ".71em")
                .style("text-anchor", "start")
                .text("Page impressions");
        }

        return {
            init : function () {
                $(document).ready(function () {
                    chrome.extension.sendMessage({}, function (ftace) {
                        var links = getLinks();

                        getData(links, function (article_data, min, max) {
                            var uuid, ad, color_scale = createColorScale(min, max);

                            for (uuid in article_data) {
                                if (article_data.hasOwnProperty(uuid)) {
                                    ad = article_data[uuid];
                                    ad.link.data(ftace.prefix + "uuid", uuid).css("background-color", color_scale(ad.now));
                                }
                            }

                            $(links).on("mouseover", function (event) {
                                event.preventDefault();

                                var uuid = $(this).data(ftace.prefix + "uuid");

                                if (article_data.hasOwnProperty(uuid)) {
                                    createSixHourMiniChart(ftace, article_data[uuid]);
                                }
                            });
                        });
                    });
                });
            },

            stop : function () {
                chrome.extension.sendMessage({}, function (ftace) {
                    $(ftace.prefix + 'data').remove();
                });
            }
        };
    }($, d3));
}
