FTAnalyticsChromeExtension.prototype.sendMessage = function(type,args,callback){
    if (typeof callback === "undefined"){ callback = function(){}; }

    chrome.extension.sendMessage({ type : type, args : args }, callback);
};

FTAnalyticsChromeExtension.prototype.listenMessage = function(){
    var self = this;

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        self.log('INIT: Received message', request.type, request.args);

        switch (request.type){
            case "setIcon": self.setIcon(request.args.tabId); break;
            case "getUserData": sendResponse(self.getUserData(request.args.name)); break;
            case "setUserData": self.setUserData(request.args.name, request.args.value); break;
            case "delUserData": self.delUserData(request.args.name); break;
            case "load": sendResponse(!self.isLoaded(request.args.tab, request.args.module)); break;
            case "unload" : self.unload(request.args.tab, request.args.module); break;
        }
    });
};