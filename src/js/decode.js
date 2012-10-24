/*global FT*/

FTAnalyticsChromeExtension = FTAnalyticsChromeExtension || {};

FTAnalyticsChromeExtension.Decode = (function () {
    'use strict';

    var FTACE = FTAnalyticsChromeExtension;

    function newRequest(debuggeeId, message, params){
        $('#'+FTACE.prefix+'_link_decoder ol').append('<li>' + message + '</li>');
    }

    return {
        init : function(tabId) {
            if($('#'+FTACE.prefix+'_link_decoder').length === 0) {
                $('#'+FTACE.prefix+'_link_decoder').html('<ol></ol>');


                $(document.createElement('div')).attr('id', FTACE.prefix+'_link_decoder').addClass(FTACE.prefix).css({
                    position: 'fixed',
                    right: '1em',
                    bottom: '1em'
                }).appendTo('body');


            }
        },

        stop : function(){
            $('#'+FTACE.prefix+'_link_decoder').remove();
        }
    }
}());