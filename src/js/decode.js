if(typeof(ftaceDecode)==="undefined"){

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

    var ftaceDecode = (function () {
        'use strict';

        var tabs,
            lastUpdate = {},
            prefix,
            allRequests,
            userData,
            updateInterval;

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
                lastUpdate[url] = new Date(0); // Set default last update.

                $('#'+prefix+'_link_decoder #'+prefix+'_tabs ul').append('<li data-active="' + (url == document.location) + '"><a href="#'+id+'" title="'+details.title+' ('+url+')"><span>'+details.title+'</span></a><span class="ui-icon ui-icon-close" data-url="'+url+'">Remove Tab</span></li>');
                $('#'+prefix+'_link_decoder #'+prefix+'_tabs').append('<div id="'+id+'"><ol></ol></div>');
            });

            tabs = $('#'+prefix+'_link_decoder #'+prefix+'_tabs').tabs({active:-1});

            $('#'+prefix+'_link_decoder ol li a').live('click.'+prefix, function(event){
                event.preventDefault();
                zoomIn(this);
            });

            // close icon: removing the tab on click
            $('#'+prefix+'_link_decoder #'+prefix+'_tabs ul span.ui-icon-close').live('click.'+prefix, function() {
                var panelId = $(this).closest("li").remove().attr("aria-controls");
                $("#" + panelId).remove();
                // TODO Remove data
                chrome.extension.sendMessage({ type: 'clearNetworkTabUrl', url: $(this).data('url') }, function(){
                    tabs.tabs("refresh");
                });
            });
        }

        function addRequests(callback) {
            if(typeof callback === "undefined") callback = function(){};

            chrome.extension.sendMessage({}, function(ftace) {
                allRequests = ftace.network_requests;

                $.each(allRequests, function(pageUrl, details){
                    var items = [],
                        id = prefix + '_' + pageUrl.replace(/\W+/g, '').toLowerCase(),
                        requests = details.requests,
                        request,
                        i;

                    if(requests.length > 0){
                        for(i=0;i<requests.length;i++){
                            request = requests[i];

                            if(new Date(request.timestamp) > lastUpdate[pageUrl]) {
                                items.push(buildRequest(pageUrl, request));
                            }
                        }

                        lastUpdate[pageUrl] = new Date(request.timestamp);

                        if(items.length > 0){
                            $('#'+prefix+'_link_decoder #'+prefix+'_tabs #'+id+' ol').append(items.join(''));

                            if(userData.hasOwnProperty("decode.query")){
                                highlight(userData["decode.query"]);
                            }
                        }
                    }
                });

                callback();
            });
        }

        function splitUrl(url) {
            if(typeof url === "undefined") {
                return {};
            }

            var i,n,key,urlPart,parts,kv;

            for(i in url) {
                key = url[i][0];
                urlPart = url[i][1].replace(/%3D/g,'=');
                parts = urlPart.split(/[&\?]/g);

                for(n in parts) {
                    kv = parts[n].split("=");

                    if (typeof kv[1] === "undefined") {
                        parts[n] = [kv[0]];
                    }
                    else {
                        parts[n] = [
                            kv[0],
                            kv[1].replace(/%20/g,'&nbsp;').replace(/%3B/g,';').replace(/%2C/g,',').replace(/%252B/g,'&nbsp;').replace(/undefined/g,'<span class="undefined">undefined</span>')
                        ];
                    }
                }

                url[i][1] = parts;
            }

            return url;
        }

        function buildRequest(pageUrl, request) {
            var url = [],
                u = splitUrl(request.url),
                time = new Date(request.timestamp),
                html = [],
                domain;

            $.each(u,function(key,urlParts){
                url = url.concat(urlParts[1]);
            });

            $.each(url, function(i,urlParts){
                html.push('<mark>' + urlParts.join('=') + '</mark>');
            });

            domain = html.shift();

            return [
                '<li>',
                '<a href="javascript://" data-key="',pageUrl,'" data-timestamp="',request.timestamp,'">',
                '<time title="',request.ijHost,'">',time.getDate(),'&nbsp;',time.getFullMonth(),'&nbsp;',time.getFullYear(),'&nbsp;',time.getHours(),':',time.getFullMinutes(),'</time>',
                ':&nbsp;',
                domain , '?' , html.join('<wbr />&amp;'),
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
                details = allRequests[$item.data('key')],
                data;

            $.each(details.requests, function(i,request){
                if(request.timestamp == $item.data('timestamp')){
                    data = request;
                    return false;
                }
            });

            if(typeof data === "undefined") {
                alert("Something went wrong. Couldn't locate request.");
                return false;
            }

            var time = new Date(data.timestamp),
                url = splitUrl(data.url);

            $.each(url, function(i, urlPart) {
                var label, key=urlPart[0], values=urlPart[1];

                if(key && values.length > 0) {
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

                    output.push('<tr><th colspan="2">'+label+' ('+key+')</th></tr>');
                    $.each(values,function(n, value){
                        var k = value[0], v = value[1];
                        if(k){
                            if(typeof v === "undefined") {
                                output.push('<tr><td colspan="2">'+k+'</td></tr>');
                            }
                            else {
                                output.push('<tr><td>'+k+'</td><td>'+v+'</td></tr>');
                            }
                        }
                    });
                }
            });

            $('#'+prefix+'_link_decoder_view').html('<table><colgroup><col width="1" /><col width="*" /></colgroup>'+output.join('')+'</table>');
            $('#'+prefix+'_link_decoder_view').dialog({width: '60%', title: time + ' ('+data.ijHost+')'});
        }

        return {
            init : function() {
                $(document).ready(function(){
                    chrome.extension.sendMessage({}, function(ftace) {
                        prefix = ftace.prefix;
                        allRequests = ftace.network_requests;
                        userData = ftace.user_data;

                        createInterface();
                        addRequests(function(){
                            $('#'+prefix+'_link_decoder #'+prefix+'_tabs').tabs( "option", "active", $('#'+prefix+'_link_decoder #'+prefix+'_tabs ul li[data-active=true]').index());

                            updateInterval = setInterval(addRequests, 500);
                        });
                    });
                });
            },

            stop : function(){
                lastUpdate = new Date(0);
                clearInterval(updateInterval);

                chrome.extension.sendMessage({}, function(ftace){
                    $('#'+ftace.prefix+'_link_decoder ol li a').off('click');
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
