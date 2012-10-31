/*global FT*/

Date.prototype.getFullMonth = function(){
    switch(this.getMonth()){
        case 0: return 'Jan'; break;
        case 1: return 'Feb'; break;
        case 2: return 'Mar'; break;
        case 3: return 'Apr'; break;
        case 4: return 'May'; break;
        case 5: return 'Jun'; break;
        case 6: return 'Jul'; break;
        case 7: return 'Aug'; break;
        case 8: return 'Sep'; break;
        case 9: return 'Oct'; break;
        case 10: return 'Nov'; break;
        case 11: return 'Dec'; break;
    }
};

FTACEDecode = (function () {
    'use strict';

    function newRequest(request){
        chrome.extension.sendMessage({}, function(ftace){
            var url = request.url,
                time = new Date(request.timestamp);

            url = '<mark>' + url.split('&').join('</mark><wbr />&amp;<mark>') + '</mark>';
            url = url.replace('?','</mark>?<mark>');
            url = url.replace(/%20/g,'&nbsp;');
            url = url.replace(/%2C/g,',');
            url = url.replace(/%3B/g,';');
            url = url.replace(/%3D/g,'=');
            url = url.replace(/undefined/g,'<span class="undefined">undefined</span>');

            $('#'+ftace.prefix+'_link_decoder ol').append([
                '<li>',
                '<a href="javascript://">',
                '<time>',time.getDate(),'&nbsp;',time.getFullMonth(),'&nbsp;',time.getFullYear(),'&nbsp;',time.getHours(),':',time.getSeconds(),'</time>',
                ':&nbsp;',
                url,
                '</a>',
                '</li>'
            ].join(''));
        });
    }

    function highlight(query){
        if(typeof query === "undefined"){ query = ""; }

        chrome.extension.sendMessage({}, function(ftace){
            $('#'+ftace.prefix+'_link_decoder ol li mark').removeClass('searchresult');

            if(query !== ""){
                $('#'+ftace.prefix+'_link_decoder ol li mark:contains('+ query +')').addClass('searchresult');
            }
        });
    }

    function zoomIn(item){
        alert(item);
    }

    return {
        init : function() {
            var i,n;

            $(document).ready(function(){
                chrome.extension.sendMessage({}, function(ftace){
                    if($('#'+ftace.prefix+'_link_decoder').length === 0) {
                        $(document.createElement('div')).attr('id', ftace.prefix+'_link_decoder').addClass(ftace.prefix).appendTo('body');
                        $('#'+ftace.prefix+'_link_decoder').html([
                            '<a href="javascript:// Close" id="'+ftace.prefix+'_close">Close</a>',
                            '<form id="'+ftace.prefix+'_search">',
                            '<input type="search" placeholder="Enter a key to highlight e.g. &quot;sm&quot;" value="',ftace.user_data["decode.query"],'" />',
                            '</form>',
                            '<h1>Requests</h1>',
                            '<ol></ol>'
                        ].join(''));
                        $('#'+ftace.prefix+'_link_decoder').draggable({ handle : ':header' });

                        $('#'+ftace.prefix+'_search').on('submit', function(event){
                            event.preventDefault();

                            var query = $('#'+ftace.prefix+'_search input').eq(0).val();
                            chrome.storage.sync.set({"decode.query" : query });
                            highlight(query);
                        });

                        $('#'+ftace.prefix+'_close').on('click',function(event){
                            event.preventDefault();
                            $('#'+ftace.prefix+'_link_decoder').remove();
                        });
                    }


                    var networkRequests = ftace.network_requests;
                    for(i=0;i<networkRequests.length;i++){
                        newRequest(networkRequests[i]);
                    }

                    if(ftace.user_data.hasOwnProperty("decode.query")){
                        highlight(ftace.user_data["decode.query"]);
                    }

                    $('#'+ftace.prefix+'_link_decoder ol li a').on('click',function(){
                        zoomIn(this);
                    });
                });

                $(window).load(function(){
                    chrome.extension.sendMessage({}, function(ftace){
                        var networkRequests = ftace.network_requests;
                        for(n=i;n<networkRequests.length;n++){
                            newRequest(networkRequests[n]);
                        }

                        if(ftace.user_data.hasOwnProperty("decode.query")){
                            highlight(ftace.user_data["decode.query"]);
                        }
                    });
                });
            });
        },

        stop : function(){
            chrome.extension.sendMessage({}, function(ftace){
                $('#'+ftace.prefix+'_link_decoder').remove();
            });
        },

        getRequests : function (){
            chrome.extension.sendMessage({}, function(ftace){
                console.log(ftace.network_requests);
            });
        }
    }
}());