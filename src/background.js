var ftace = new FTAnalyticsChromeExtension();
ftace.init();

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse(ftace.contentScript());
});