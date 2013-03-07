/*global ftaceQuarters, $, window, document, chrome */
if (typeof (ftaceQuarters) === "undefined") {
    var ftaceQuarters = (function ($) {

        return {
            init : function () {
                $(document).ready(function () {
                    chrome.extension.sendMessage({}, function (ftace) {
                        var documentHeight = $(document).height(),
                            quartile = documentHeight / 4,
                            i;
                        for (i = 0; i < 5; i = i + 1) {
                            $('body').append('<hr class="' + ftace.prefix + 'quarters" style="top:' + quartile * i + 'px" />');
                        }
                    });
                });
            },

            stop : function () {
                chrome.extension.sendMessage({}, function (ftace) {
                    $('.' + ftace.prefix + 'quarters').remove();
                });
            }
        };
    }($));
}
