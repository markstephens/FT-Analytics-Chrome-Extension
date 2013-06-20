/*global ftacePosition, $, document, chrome*/
if (typeof ftacePosition === "undefined") {
    var ftacePosition = (function () {

        var $colors = ['#090', '#00F', '#F90', '#F0F', '#099', '#666', '#000'],
            $increment = 0,
            $max_increment = $colors.length - 1,
            $path = {};

        function getElementPositionalData($element) {
            var zoneEl = $element.closest('[data-zone]'),
                compEl    = $element.closest('[data-comp-view],[data-comp-index],[data-comp-name]'),
                posEl = $element.closest('[data-pos]'),
                storyPackageEl = $element.closest('.contentPackage'),
                zone      = zoneEl.length ? zoneEl.data('zone') : null,
                compView  = compEl.length ? compEl.data('comp-view') : null,
                compIndex = compEl.length ? compEl.data('comp-index') : null,
                compName  = compEl.length ? compEl.data('comp-name') : null,
                pos  = posEl.length ? posEl.data('pos').toString() : null,
                storyPackage = !!storyPackageEl.length,
                $position = $element.position(),
                $items = $.grep([
                    zone,
                    compName,
                    compView,
                    compIndex,
                    pos,
                    (storyPackage === true ? 'storyPackage' : false)
                ], function (obj) { return (obj); });
            return {
                label : $items,
                key : $.map($items, function (str) { return (str.toString()).toLowerCase().replace(/\W+/g, ''); }).join(''),
                position : $position
            };
        }

        return {
            init : function () {
                $(document).ready(function () {
                    chrome.extension.sendMessage({}, function (ftace) {
                        $('[data-comp-view],[data-comp-name],[data-zone]').on('mouseenter.' + ftace.prefix, function () {
                            var $element = $(this),
                                $color,
                                $data = getElementPositionalData($element);

                            $increment = ($increment > $max_increment ? 0 : ($increment + 1));
                            $color = $colors[$increment];
                            $path[$data.label[$data.label.length - 1]] = $color;
                            $element.css('outline', 'dashed 2px ' + $color);

                            $('#' + ftace.prefix + '_test').append('<li>' + $data.label[$data.label.length - 1] + ': ' + $color + '</li>');
                        });

                        $('[data-comp-view],[data-comp-name],[data-zone]').on('mouseleave.' + ftace.prefix, function () {
                            var $element = $(this),
                                $data = getElementPositionalData($element);

                            delete $path[$data.label.join('/')];
                            $increment = ($increment < 0 ? 0 : ($increment - 1));
                            $element.css('outline', '');
                            $('#' + ftace.prefix + '_test li:last').remove();
                        });

                        $(document).tooltip({ track: true, items: "[data-pos] a", hide: false });

                        $('[data-pos] a').on('mouseenter.' + ftace.prefix, function () {
                            var $element = $(this),
                                $data = getElementPositionalData($element),
                                $label = [],
                                data_index;

                            $element.css('outline', 'dashed 2px #F00');

                            $path[$data.label[$data.label.length - 1]] = "#F00";
                            if ($data.label[$data.label.length - 1] === "storyPackage") {
                                $path[$data.label[$data.label.length - 2]] = "#F00";
                            }

                            for (data_index = 0; data_index < $data.label.length; data_index = data_index + 1) {
                                $label.push('<span style="color:' + $path[$data.label[data_index]] + '">' + $data.label[data_index] + '</span>');
                            }

                            // New position
                            var link = $(this),
                                zone = link.closest('[data-zone]'),
                                container = link.closest('[data-comp-view], [data-comp-name]'),
                                pos = link.closest('[data-pos]'),
                                name = link.attr('href').replace(/^http:\/\/[\w\.]+/, '').replace(/^\//, '').split('?')[0].replace(/\/$/, '').replace(/\.[a-z]{3,4}$/, ''),
                                story = !!link.closest('.contentPackage').length;

                            if (name === '') {
                                name = link.attr('href').replace(/^http:\/\//, '').split('?')[0].replace(/\/$/, '');
                            }

                            name = $.grep(name.split('/').slice(-2), function (obj) { return (obj); });

                            // If uuid then take final value only
                            if (name.slice(-1)[0].match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)) {
                                name = name.slice(-1);
                            }

                            name = (name.length > 1 ? name.slice(0, 2).join('-') : name[0]).toLowerCase();

                            $(document).tooltip("option", "content", '<span style="font-size: smaller;font-family: courier">' + $label.join('/') + '<br />' + $.grep([
                                zone.data('zone'),
                                container.data('comp-view') || container.data('comp-name'),
                                pos.data('pos').toString(),
                                name,
                                (story ? 'storyPackage' : null)
                            ], function (obj) { return (obj); }).join('/') + ' (new)</span>');
                        });

                        $('[data-pos] a').on('mouseleave.' + ftace.prefix, function () {
                            $(this).css('outline', '');
                            $(document).tooltip("close");
                        });
                    });
                });
            },

            getPath : function () {
                /*global console*/
                console.log($path);
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
