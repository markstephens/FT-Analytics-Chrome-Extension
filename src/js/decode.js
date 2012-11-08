/*global FT*/

if(typeof(FTACEDecode)==="undefined"){

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
    Date.prototype.getFullMinutes = function(){
        var m = this.getMinutes();
        if(m < 10){
            return "0" + m;
        }

        return m;
    };

    var FTACEDecode = (function () {
        'use strict';

        var lastUpdate = new Date(0),
            prefix,
            allRequests,
            userData;

        //  One time only
        function createInterface(){
            $(document.createElement('div')).attr('id', prefix+'_link_decoder').attr('title','iJento Requests').appendTo('body');
            $(document.createElement('div')).attr('id', prefix+'_link_decoder_view').appendTo('body');
            $('#'+prefix+'_link_decoder').html([
                '<div id="',prefix,'_tabs">',
                '<ul></ul>',
                '</div>'
            ].join(''));

            $('#'+prefix+'_link_decoder').dialog({ width: '80%', height: 400, maxHeight: 600, position: "bottom left" });

            $('#'+prefix+'_link_decoder').prev().append(['<form id="'+prefix+'_search">',
                '<input type="search" placeholder="Enter a key to highlight e.g. &quot;sm&quot;" value="',userData["decode.query"],'" />',
                '</form>'].join(''));

            $('#'+prefix+'_search').on('submit', function(event){
                event.preventDefault();

                var query = $('#'+prefix+'_search input').eq(0).val();
                chrome.storage.sync.set({"decode.query" : query });
                highlight(query);
            });

            $.each(allRequests, function(url, details){
                var id = prefix + '_' + url.replace(/\W+/g, '').toLowerCase();

                $('#'+prefix+'_link_decoder #'+prefix+'_tabs ul').append('<li data-active="' + (url == document.location) + '"><a href="#'+id+'" title="'+details.title+' ('+url+')"><span>'+details.title+'</span></a></li>');
                $('#'+prefix+'_link_decoder #'+prefix+'_tabs').append('<div id="'+id+'"><ol></ol></div>');
            });

            $('#'+prefix+'_link_decoder #'+prefix+'_tabs').tabs({active:-1});

            if(userData.hasOwnProperty("decode.query")){
                highlight(userData["decode.query"]);
            }

            $('#'+prefix+'_link_decoder ol li a').on('click.'+prefix, function(event){
                event.preventDefault();
                zoomIn(this);
            });
        }

        function addRequests() {
            $.each(allRequests, function(pageUrl, details){
                var items = [],
                    id = prefix + '_' + pageUrl.replace(/\W+/g, '').toLowerCase(),
                    request;

                for(var i=0;i<details.requests.length;i++){
                    request = details.requests[i];

                    if(new Date(request.timestamp) > lastUpdate) {
                        items.push(buildRequest(pageUrl, request));
                    }
                }

                console.log(items);

                lastUpdate = new Date(request.timestamp);

                $('#'+prefix+'_link_decoder #'+prefix+'_tabs #'+id+' ol').append(items.join(''));
            });

            $('#'+prefix+'_link_decoder #'+prefix+'_tabs').tabs( "option", "active", $('#'+prefix+'_link_decoder #'+prefix+'_tabs ul li[data-active=true]').index());
        }

        function markupUrl(url, row, column) {
            if(typeof url !== "undefined") {
                if(typeof row === "undefined") { row = "mark"; }
                if(typeof column === "undefined") { column = "mark"; }

                url = '<'+row+'>' + url.split('&').join('</'+column+'><wbr />&amp;<'+column+'>') + '</'+row+'>';
                url = url.replace("?",'</'+row+'>?<'+row+'>');
                url = url.replace(/%20/g,'&nbsp;');
                url = url.replace(/%2C/g,',');
                url = url.replace(/%3B/g,';');
                url = url.replace(/%3D/g,'=');
                url = url.replace(/undefined/g,'<span class="undefined">undefined</span>');

                return url;
            }
        }

        function buildRequest(pageUrl, request) {
            var url = request.url, time = new Date(request.timestamp), fullUrl=[];

            $.each(url,function(key,val){
               fullUrl.push(val);
            });

            fullUrl = markupUrl(fullUrl.join('&'));

            return [
                '<li>',
                '<a href="javascript://" data-key="',pageUrl,'" data-p="',request.url.p,'">',
                '<time title="',request.ijHost,'">',time.getDate(),'&nbsp;',time.getFullMonth(),'&nbsp;',time.getFullYear(),'&nbsp;',time.getHours(),':',time.getFullMinutes(),'</time>',
                ':&nbsp;',
                fullUrl,
                '</a>',
                '</li>'
            ].join('');
        }

        function highlight(query){
            if(typeof query === "undefined"){ query = ""; }

            $('#'+prefix+'_link_decoder ol li mark').removeClass('searchresult');

            if(query !== ""){
                $('#'+prefix+'_link_decoder ol li mark:contains('+ query +')').addClass('searchresult');
            }
        }

        function zoomIn(item){
            var output = [],
                $item = $(item),
                data;

            $.each(allRequests[$item.data('key')], function(request){
                if(request.url.p == $item.data('p')){
                    data = request;
                    return false;
                }
            });

            if(typeof data === "undefined") {
                alert("Something went wrong. Couldn't locate request.");
                return false;
            }

            var url = data.url.p;
            delete data.url.p;

            output.push(markupUrl(url,'tr','td').replace('=', '</td><td>'));

            $.each(data.url, function(key,val){
                var label;
                switch (key) {
                    case 'r': label = "Referrer"; break;
                    case 'p': label = "Request"; break;
                    case 'd': label = "Additional data (screen res/Java enabled)"; break;
                    case 'c': label = "Cookie"; break;
                    case 'u': label = "Pseudo random number to bypass caching"; break;
                    case 't': label = "External click id"; break;
                    case 'f': label = "Tracert path"; break;
                    case 'q': label = "Tracer query data"; break;
                    case 'g': label = "Tag data"; break;
                    case 'w': label = "Is cookie new"; break;
                    case 'y': label = "Tag Type"; break;
                    default: label = "Empty field"; break;
                }

                output.push('<tr><td>'+label+' ('+key+')</td><td>'+val+'</td></tr>');
            });

            $('#'+prefix+'_link_decoder_view').html('<table>'+output.join('')+'</table>');
            $('#'+prefix+'_link_decoder_view').dialog({width: '60%', title: data.timeStamp + ' ('+data.ijHost+')'});
        }

        return {
            init : function() {
                var i,n;

                $(document).ready(function(){
                    chrome.extension.sendMessage({}, function(ftace) {
                        prefix = ftace.prefix;
                        allRequests = ftace.network_requests;
                        userData = ftace.user_data;

                        createInterface();
                        addRequests();
                    });

                    /*
                     TODO WEBAPP IS A GOOD WAY TO TEST THIS
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

                     $('#'+ftace.prefix+'_link_decoder ol li a').on('click',function(){
                     zoomIn(this);
                     });
                     }); */
                });
            },

            stop : function(){
                lastUpdate = new Date(0);

                chrome.extension.sendMessage({}, function(ftace){
                    $('#'+ftace.prefix+'_link_decoder ol li a').off('click');
                    $('#'+ftace.prefix+'_link_decoder').dialog("destroy");
                    $('#'+ftace.prefix+'_link_decoder').remove();
                    $('#'+ftace.prefix+'_link_decoder_view').remove();
                });
            },

            getRequests : function (){
                chrome.extension.sendMessage({}, function(ftace){
                    console.log(ftace.network_requests);
                });
            }
        }
    }());
}