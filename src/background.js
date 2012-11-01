var ftace = new FTAnalyticsChromeExtension();
ftace.init();

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        var storageChange = changes[key];
        if (storageChange.hasOwnProperty("newValue")) {
            ftace.user_data[key] = storageChange.newValue;
        }
    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse(ftace.contentScript(sender.tab.id));
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
        ftace.storeNetworkRequest(details.tabId, details);
    },
    { urls: [ "<all_urls>" ], types: ["image"] });