var FTACEPosition = (function(){

    var $colors = ['#090', '#00F', '#F90', '#F0F', '#099', '#666', '#000'],
        $increment = 0,
        $max_increment = $colors.length - 1,
        $path = {};

    function getElementPositionalData($element) {
        var zoneEl = $element.closest('[data-zone]'),
            compEl    = $element.closest('[data-comp-view][data-comp-index][data-comp-name]'),
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
            key : $.map($items, function (str) { return ("" + str).toLowerCase().replace(/\W+/g, ''); }).join(''),
            position : $position
        };
    }

    return {
        init : function() {
            chrome.extension.sendMessage({}, function(ftace){
                if($('#'+ftace.prefix+'_link_positionator').length === 0) {
                    $(document.createElement('div')).attr('id', ftace.prefix+'_link_positionator').addClass(ftace.prefix).css({display: 'none'}).appendTo('body');
                    $(document.createElement('div')).attr('id', ftace.prefix+'_test').addClass(ftace.prefix).css({display: 'fixed', top: 10, right: 10}).appendTo('body').html('<ul></ul>');

                    $('[data-comp-view],[data-comp-name],[data-zone]').on('mouseenter.'+ftace.prefix,function () {
                        var $element = $(this),
                            $color,
                            $data = getElementPositionalData($element);

                        $increment = ($increment > $max_increment ? 0 : ($increment + 1));
                        $color = $colors[$increment];
                        $path[$data.label[$data.label.length-1]] = $color;
                        $element.css('outline', 'dashed 2px ' + $color);

                        $('#'+ftace.prefix+'_test').append('<li>'+$data.label[$data.label.length-1]+': '+$color+'</li>')

                    });
                    $('[data-comp-view],[data-comp-name],[data-zone]').on('mouseleave.'+ftace.prefix,function () {
                        var $element = $(this),
                            $data = getElementPositionalData($element);

                        delete $path[$data.label.join('/')];
                        $increment = ($increment < 0 ? 0 : ($increment - 1));
                        $element.css('outline', '');
                        $('#'+ftace.prefix+'_test li:last').remove();
                    });

                    $('[data-pos] a').on('mouseenter.'+ftace.prefix,function () {
                        var $element = $(this),
                            $data = getElementPositionalData($element),
                            $label=[],
                            i= 0,n=0;

                        $element.css('outline', 'dashed 2px #F00');

                        $path[$data.label[$data.label.length-1]] = "#F00";
                        if($data.label[$data.label.length-1] == "storyPackage"){
                            $path[$data.label[$data.label.length-2]] = "#F00";
                        }

                        for(i=0;i<$data.label.length;i++) {
                            $label.push('<span style="color:'+$path[$data.label[i]]+'">'+$data.label[i]+'</span>');
                        }


                        $('#'+ftace.prefix+'_link_positionator').show().css({ top : $data.position.top }).html($label.join('/'));
                    });

                    $('[data-pos] a').on('mouseleave.'+ftace.prefix,function () {
                        $(this).css('outline', '');
                        $('#'+ftace.prefix+'_link_positionator').hide();
                    });
                    $('[data-pos] a').on('mousemove.'+ftace.prefix,function(event){
                        $('#'+ftace.prefix+'_link_positionator').css({ top : event.pageY+10, left: event.pageX+10 })
                    });

                    $(document).on('keydown.'+ftace.prefix,function(event) {
                        if(event.keyCode === 27) {
                            FTACEPosition.stop();
                        }
                    });
                }
            });
        },

        getPath : function () {
            console.log($path);
        },

        stop : function(){
            chrome.extension.sendMessage({}, function(ftace){
                $('#'+ftace.prefix+'_link_positionator').remove();
                // TODO Teardown doesn't seem to be fully working
                $('[data-comp-view],[data-comp-name],[data-zone],[data-pos] a').off('.'+ftace.prefix);
            });
        }
    }

}());