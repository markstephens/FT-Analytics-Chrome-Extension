/*global ftaceData, $, document, chrome */
if (typeof (ftaceData) === "undefined") {
  var ftaceData = (function () {
    var links = {},
      article_data;

    return {
      init : function () {
        $(document).ready(function () {
          chrome.extension.sendMessage({}, function (ftace) {

            $('a[href^="http://www.ft.com/cms"]').each(function() {
              var link = $(this),
                uuid = link.attr('href').match(/http:\/\/www.ft.com\/cms(\/s)?\/\d\/([\w\-]+).html/);

              if (uuid) {
                links[uuid[2]] = link;
              }
            });

            console.log(links);

            $.ajax({
              url : 'https://realtime.ijento.com/financialtimes/ft-top-articles.txt',
              dataType: "json",
              success : function (data, textStatus, jqXHR) {
                var i, lastHour, impressions, region;
                article_data = data.articles;

                for (i = 0; i < article_data.length; i++) {
                  if (links.hasOwnProperty(article_data[i].uuid)) {
                    lastHour = article_data[i].hours[article_data[i].hours.length - 1];
                    impressions = 0;
                    // {"homepage":[0,0,0,0,0,0],"search":[0,0,0,0,0,0],"external":[0,0,0,0,0,0],"internal":[0,0,0,0,0,0],"other":[0,0,0,0,0,0]}

                    $.each(["homepage", "search", "external", "internal", "other"], function (n, referer) {
                      for (region = 0; region < 6; region++) {
                        impressions += lastHour[referer][region];
                      }
                    });

                    links[article_data[i].uuid].after(['<span class="', ftace.prefix, 'data">', 'Right now: ', impressions, '</span>'].join(''));
                  }
                }
              }
            });
          });
        });
      },

      getUserTypes : function () {
        return article_data;
      },

      stop : function () {
        chrome.extension.sendMessage({}, function (ftace) {
          $('span.' + ftace.prefix + 'data').remove();
        });
      }
    };
  }());
}
