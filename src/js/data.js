if(typeof(ftaceData)==="undefined"){
    var ftaceData = (function(){
        var userTypes;

        return {
            init : function() {
                $(document).ready(function(){
                    chrome.extension.sendMessage({}, function(ftace){

                        $.ajax({
                            url : 'https://realtime.ijento.com/financialtimes/ft-subs-articles.txt',
                            dataType: "text",
                            success : function(data, textStatus, jqXHR) {
                                userTypes = $.parseJSON(data);
                            }
                        });

                        $('#page-container').wrap('<div id="'+ftace.prefix+'DataWrapper" style="width:'+$('#page-container').width()+'px; margin: 0 auto; z-index:0"></div>');
                        $('#page-container').addClass(ftace.prefix+'Data');
                    });
                });
            },

            getUserTypes : function(){
                return userTypes;
            },

            stop : function(){
                chrome.extension.sendMessage({}, function(ftace){
                    $('#'+ftace.prefix+'DataWrapper').attr('id','');
                    $('#page-container, [data-pos] a').removeClass(ftace.prefix+'Data');
                });
            }
        }
    }());
}
