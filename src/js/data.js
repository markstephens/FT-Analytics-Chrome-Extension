if(typeof(ftaceData)==="undefined"){
    var ftaceData = (function(){
        var links = {}, userTypes;

        return {
            init : function() {
                $(document).ready(function(){
                    chrome.extension.sendMessage({}, function(ftace){

                        $('a[href^="http://www.ft.com/cms"]').each(function() {
                            var link = $(this),
                                uuid = link.attr('href').match(/http:\/\/www.ft.com\/cms(\/s)?\/\d\/([\w\-]+).html/);

                            if(uuid) {
                                links[uuid[2]] = link;
                            }
                        });

                        console.log(links);

                        $.ajax({
                            url : 'https://realtime.ijento.com/financialtimes/ft-subs-articles.txt',
                            dataType: "json",
                            success : function(data, textStatus, jqXHR) {
                                userTypes = data.articles;

                                for(var i=0;i<userTypes.length;i++) {
                                    if(links.hasOwnProperty(userTypes[i].uuid)) {
                                        links[userTypes[i].uuid].after([
                                            '<span class="',ftace.prefix,'data">',
                                            'Impressions: ', userTypes[i].impressions,' ',
                                            'Anonymous: ', userTypes[i].anon,' ',
                                            'Registered: ', userTypes[i].reg,' ',
                                            'Subscriber: ', userTypes[i].subs,' ',
                                            '</span>'
                                        ].join(''))
                                    }
                                }
                            }
                        });
                    });
                });
            },

            getUserTypes : function(){
                return userTypes;
            },

            stop : function(){
                chrome.extension.sendMessage({}, function(ftace){
                    $('span.'+ftace.prefix+'data').remove();
                });
            }
        }
    }());
}
