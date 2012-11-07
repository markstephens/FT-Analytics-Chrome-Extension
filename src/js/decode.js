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

        function createTabs(prefix, allRequests){
            $.each(allRequests, function(url, details){

                var items = [], id = prefix + '_' + url.replace(/\W+/g, '').toLowerCase();

                $('#'+prefix+'_link_decoder #'+prefix+'_tabs ul').append('<li data-active="' + (url == document.location) + '"><a href="#'+id+'" title="'+details.title+' ('+url+')"><span>'+details.title+'</span></a></li>');

                for(var i=0;i<details.requests.length;i++){
                    items.push(newRequest(details.requests[i]));
                }

                $('#'+prefix+'_link_decoder #'+prefix+'_tabs').append('<div id="'+id+'"><ol>'+items.join('')+'</ol></div>');
            });
        }

        function newRequest(request){
            var url = request.url,
                time = new Date(request.timestamp);

            url = '<mark>' + url.split('&').join('</mark><wbr />&amp;<mark>') + '</mark>';
            url = url.replace("?",'</mark>?<mark>');
            url = url.replace(/%20/g,'&nbsp;');
            url = url.replace(/%2C/g,',');
            url = url.replace(/%3B/g,';');
            url = url.replace(/%3D/g,'=');
            url = url.replace(/undefined/g,'<span class="undefined">undefined</span>');

            return [
                '<li>',
                '<a href="javascript://">',
                '<time title="',request.ijHost,'">',time.getDate(),'&nbsp;',time.getFullMonth(),'&nbsp;',time.getFullYear(),'&nbsp;',time.getHours(),':',time.getFullMinutes(),'</time>',
                ':&nbsp;',
                url,
                '</a>',
                '</li>'
            ].join('');
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

        function zoomIn(prefix, item){
            var output = [],
                html = $(item),
                titleEl = $('time', html).eq(0),
                title = titleEl.text() + ' <span style="margin-left:2em">(' + titleEl.attr('title') + ')</span>';

            html.find('mark').each(function(){
                output.push("<tr><td>" + $(this).html().replace('=', '</td><td>') + "</td></tr>");
            });

            $('#'+prefix+'_link_decoder_view').html('<table>'+output.join('')+'</table>');
            $('#'+prefix+'_link_decoder_view').dialog({width: '60%', title: title});
        }

        return {
            init : function() {
                var i,n;

                $(document).ready(function(){
                    chrome.extension.sendMessage({}, function(ftace){
                        $(document.createElement('div')).attr('id', ftace.prefix+'_link_decoder').attr('title','iJento Requests').appendTo('body');
                        $(document.createElement('div')).attr('id', ftace.prefix+'_link_decoder_view').appendTo('body');
                        $('#'+ftace.prefix+'_link_decoder').html([
                            '<div id="',ftace.prefix,'_tabs">',
                            '<ul></ul>',
                            '</div>'
                        ].join(''));

                        $('#'+ftace.prefix+'_link_decoder').dialog({ width: '80%', height: 400, maxHeight: 600, position: "bottom left" });

                        $('#FTACE_link_decoder').prev().append(['<form id="'+ftace.prefix+'_search">',
                            '<input type="search" placeholder="Enter a key to highlight e.g. &quot;sm&quot;" value="',ftace.user_data["decode.query"],'" />',
                            '</form>'].join(''));

                        $('#'+ftace.prefix+'_search').on('submit', function(event){
                            event.preventDefault();

                            var query = $('#'+ftace.prefix+'_search input').eq(0).val();
                            chrome.storage.sync.set({"decode.query" : query });
                            highlight(query);
                        });

                        createTabs(ftace.prefix, ftace.network_requests);
                        $('#'+ftace.prefix+'_link_decoder #'+ftace.prefix+'_tabs').tabs({active: $('#'+ftace.prefix+'_link_decoder #'+ftace.prefix+'_tabs ul li[data-active=true]').index()});

                        if(ftace.user_data.hasOwnProperty("decode.query")){
                            highlight(ftace.user_data["decode.query"]);
                        }

                        $('#'+ftace.prefix+'_link_decoder ol li a').on('click.'+ftace.prefix, function(event){
                            event.preventDefault();
                            zoomIn(ftace.prefix, this);
                        });
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