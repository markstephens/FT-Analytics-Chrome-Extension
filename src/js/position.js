/*global ftacePosition, $, document, chrome*/
if (typeof ftacePosition === "undefined") {
    var ftacePosition = (function () {

        /**
         * Returns a string with the element info in the format of SI tracking.
         * @param info Object Info about the elements in the format returned by the getElementInfo function
         */
        function getSiFormatOfElementInfo(info) {
            return $.grep([
                info.zone,
                info.container,
                info.pos,
                info.name,
                info.storyPackage
            ], function (obj) { return (obj); }).join('/');
        }

        /**
         * Returns the element positioning info:
         * zone, component view, component name, component index and position
         *
         * @param element Object The element clicked.
         */
        function getElementInfo(element) {
            var zone = element.closest('[data-track-zone], [data-zone]'),
                container = element.closest('[data-track-comp-view], [data-track-comp-name], [data-comp-view], [data-comp-name]'),
                pos = element.closest('[data-track-pos], [data-pos]'),
                name = element.attr('href') || '',
                story = element.closest('.contentPackage');

            // Build in error coping, as above assumes all attributes are there and available.
            zone = (zone.length > 0 ? (zone.data('track-zone') || zone.data('zone')) : null);
            container = (container.length > 0 ? (container.data('track-comp-view') || container.data('track-comp-name') || container.data('comp-view') || container.data('comp-name')) : null);
            pos = (pos.length > 0 ? (typeof pos.data('track-pos') !== "undefined" ? pos.data('track-pos') : pos.data('pos')).toString() : null);
            name = name.replace(/^http:\/\/[\w\.]+/, '') // Remove http://[something].
                .replace(/^\//, '') // Remove slash at beginning
                .replace(/(\?|#).*$/, '') // Remove query string and page anchor (#)
                .replace(/\/$/, '') // Remove trailing slash
                .replace(/\.[a-z]{3,4}$/, ''); // Remove final ".com" or similar
            story = !!story.length;

            // If it's an external URL
            if (name === '') {
                name = element.attr('href').replace(/^http:\/\//, '').split('?')[0].replace(/\/$/, '');
            }

            // If it broke completely...
            if (name.length === 0) {
                return { zone: '', container: '', pos: '', name: '', storyPackage: '' };
            }

            // Last 2 items of URL
            name = $.grep(name.split('/').slice(-2), function (obj) { return (obj); });

            // If uuid then take final value only
            if (name.slice(-1)[0].match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)) {
                name = name.slice(-1);
            }

            // Remove slashes as final outcome is slash delimited
            name = (name.length > 1 ? name.slice(0, 2).join('-') : name[0]).toLowerCase();

            return {
                zone: zone,
                container: container,
                pos: pos,
                name: name,
                storyPackage: (story ? 'storyPackage' : null)
            };
        }

        return {
            init : function () {
                $(document).ready(function () {
                    chrome.extension.sendMessage({}, function (ftace) {
                        $(document).tooltip({ track: true, items: "[data-pos] a, [data-track-pos] a", hide: false });

                        $('[data-pos] a, [data-track-pos] a').on('mouseenter.' + ftace.prefix, function () {
                            var $element = $(this);
                            $element.css('outline', 'dashed 2px #F00');
                            $(document).tooltip("option", "content", '<span style="font-size: smaller;font-family: courier">' + getSiFormatOfElementInfo(getElementInfo($element)) + '</span>');
                        });

                        $('[data-pos] a, [data-track-pos] a').on('mouseleave.' + ftace.prefix, function () {
                            $(this).css('outline', '');
                            $(document).tooltip("close");
                        });
                    });
                });
            },

            stop : function () {
                chrome.extension.sendMessage({}, function (ftace) {
                    $(document).tooltip("destroy");
                    $('[data-comp-view],[data-comp-name],[data-zone],[data-pos] a').off('.' + ftace.prefix);
                });
            }
        };
    }());
}
