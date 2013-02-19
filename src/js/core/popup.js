/*global chrome, $*/
var ftace = chrome.extension.getBackgroundPage().ftace,
    user_data = ftace.getUserData();

chrome.tabs.getSelected(null, function (tab) {
    var module_index;
    ftace.log('Popup user_data', ftace.user_data);

    // Load
    for (module_index = 0; module_index < ftace.modules.length; module_index = module_index + 1) {
        if (ftace.user_data[ftace.modules[module_index]]) {
            $('input[type=checkbox][name="' + ftace.modules[module_index] + '"]').attr('checked', 'checked');
        }
    }

    // Click
    $('input[type=checkbox]').on('click', function () {
        var input = $(this),
            name = input.attr('name');

        if (input.is(":checked")) {
            input.after('<img src="images/loading.gif" alt="" class="loading ' + name + '" />');
            ftace.setUserData(name, true);
            ftace.load(tab.id, name, function () {
                input.next('.loading.' + name).remove();
            });
        } else {
            ftace.delUserData(name);
            ftace.unload(tab.id, name);
        }

        ftace.setIcon(tab.id);
    });
});
