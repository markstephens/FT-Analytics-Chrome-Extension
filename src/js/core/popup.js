var ftace = chrome.extension.getBackgroundPage().ftace,
    user_data = ftace.getUserData();

chrome.tabs.getSelected(null, function(tab) {
    ftace.log('Popup user_data',ftace.user_data);

    // Load
    for(var i=0; i < ftace.modules.length; i++){
        if(ftace.user_data[ftace.modules[i]]){
            $('input[type=checkbox][name="'+ftace.modules[i]+'"]').attr('checked','checked');
        }
    }

    // Click
    $('input[type=checkbox]').on('click',function(){
        var input = $(this),
            name = input.attr('name');


        if(input.is(":checked")){
            input.after('<img src="images/loading.gif" alt="" class="loading '+name+'" />')
            ftace.setUserData(name, true);
            ftace.load(tab.id, name, function() {
                input.next('.loading.'+name).remove();
            });
        }
        else {
            ftace.delUserData(name);
            ftace.unload(tab.id, name);
        }

        ftace.setIcon(tab.id);
    });

});