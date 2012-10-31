/*
 * EXTENSION BASIC FUNCTIONS
 */
function FTAnalyticsChromeExtension() {
    this.debug = true;
    this.url = "ft.com";
    this.prefix = "FTACE";
    this.modules = ["position", "data", "decode"];
    this.user_data = {};
    this.network_requests = {};
    this.loaded = {};
    this.activeIcon = "images/logo-16.png";
    this.inactiveIcon = "images/logo-16.grey.png";
}

FTAnalyticsChromeExtension.prototype.log = function() {
    if(this.debug){
        console.log(arguments);
    }
};

FTAnalyticsChromeExtension.prototype.contentScript = function(tabid) {
    return {
        prefix : this.prefix,
        user_data : this.getUserData(),
        network_requests : this.getNetworkRequests(tabid)
    };
};

FTAnalyticsChromeExtension.prototype.setIcon = function(tabId){
    var i, active = false, data = this.getUserData();

    for(i=0; i < this.modules.length; i++){
        if(data.hasOwnProperty(this.modules[i])) {
            active = true;
            break;
        }
    }

    this.log('setIcon active?', active);

    if(active) {
        chrome.pageAction.setIcon({ path: this.activeIcon, tabId: tabId});
    }
    else {
        chrome.pageAction.setIcon({ path: this.inactiveIcon, tabId: tabId});
    }
};

FTAnalyticsChromeExtension.prototype.init = function() {
    var self = this,
        i;

    this.startupData(function(){
        self.log('INIT: user_data', self.getUserData());

        // Called when the url of a tab changes.
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            if (tab.url.indexOf(self.url) > -1) {
                if(changeInfo.status == "loading") {
                    self.log("TAB: LOADING");
                    chrome.pageAction.show(tabId);
                    self.setIcon(tabId);
                }

                if(changeInfo.status == "complete") {
                    self.log("TAB: COMPLETE");

                    delete self.loaded[tabId];

                    // Turn on already activated modules
                    for (i = 0; i < self.modules.length; i = i + 1) {
                        if(typeof self.getUserData(self.modules[i]) !== "undefined"){
                            self.log('TAB: Load modules on Startup', self.modules[i]);

                            self.load(tabId, self.modules[i], function(){
                                self.log('TAB: Loaded ' + self.modules[i]);
                            });
                        }
                    }
                }
            }
        });
    });
};

