/*
 * EXTENSION BASIC FUNCTIONS
 */
/*global chrome*/
function FTAnalyticsChromeExtension() {
    this.debug = true;
    this.urls = ["ft.com", "ftadviser.com", "ftsub.com", "ft-live.com", "ftdata.co.uk"];
    this.prefix = "FTACE";
    this.modules = ["position", "data", "quarters", "decode"];
    this.user_data = {};
    this.network_requests = {};
    this.loaded = {};
    this.activeIcon = "images/logo-16.png";
    this.inactiveIcon = "images/logo-16.grey.png";
}

FTAnalyticsChromeExtension.prototype.log = function () {
    /*global console*/
    if (this.debug) {
        console.log(arguments);
    }
};

FTAnalyticsChromeExtension.prototype.contentScript = function (tabid) {
    return {
        prefix : this.prefix,
        user_data : this.getUserData(),
        network_requests : this.getNetworkRequests(tabid)
    };
};

FTAnalyticsChromeExtension.prototype.setIcon = function (tabId) {
    var module_index, active = false, data = this.getUserData();

    for (module_index = 0; module_index < this.modules.length; module_index = module_index + 1) {
        this.log("ICON: ", this.modules[module_index], data.hasOwnProperty(this.modules[module_index]));
        if (data.hasOwnProperty(this.modules[module_index])) {
            active = true;
            break;
        }
    }

    this.log('setIcon active?', active, data);

    if (active) {
        chrome.pageAction.setIcon({ path: this.activeIcon, tabId: tabId});
    } else {
        chrome.pageAction.setIcon({ path: this.inactiveIcon, tabId: tabId});
    }
};

FTAnalyticsChromeExtension.prototype.init = function () {
    var self = this,
        module_index,
        url_index;

    this.startupData(function () {
        self.log('INIT: user_data', self.getUserData());

        // Called when the url of a tab changes.
        chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
            for (url_index = 0; url_index < self.urls.length; url_index = url_index + 1) {
                if (tab.url.indexOf(self.urls[url_index]) > -1) {
                    if (changeInfo.status === "loading") {
                        self.log("TAB: LOADING");
                        chrome.pageAction.show(tabId);
                        self.setIcon(tabId);
                    }

                    if (changeInfo.status === "complete") {
                        self.log("TAB: COMPLETE");

                        delete self.loaded[tabId];

                        // Turn on already activated modules
                        for (module_index = 0; module_index < self.modules.length; module_index = module_index + 1) {
                            if (typeof self.getUserData(self.modules[module_index]) !== "undefined") {
                                self.log('TAB: Load modules on Startup', self.modules[module_index]);

                                self.load(tabId, self.modules[module_index], function () {
                                    self.log('TAB: Loaded ' + self.modules[module_index]);
                                });
                            }
                        }
                    }
                }
            }
        });
    });
};

