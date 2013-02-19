/*global chrome, FTAnalyticsChromeExtension*/
FTAnalyticsChromeExtension.prototype.load = function (tab, module, callback) {
    if (typeof callback === "undefined") { callback = function () {}; }

    if (this.modules.indexOf(module) !== -1) {
        this.log("LOADER", tab, module);

        // Load module.
        var self = this,
            needs_loading = !this.isLoaded(tab, module);
        this.log('LOADER: loaded?', tab, module, !needs_loading);

        if (needs_loading) {
            // jQuery is needed by everything, but only once per tab!
            self.jquery(tab, function () {

                // And Extension core.
                self.core(tab, function () {

                    self.setLoaded(tab, module);
                    // Load module
                    switch (module) {
                    case 'position':
                        self.position(tab, callback);
                        break;
                    case 'data':
                        self.data(tab, callback);
                        break;
                    case 'decode':
                        self.decode(tab, callback);
                        break;
                    }
                });
            });
        } else {
            callback();
        }
    }
};

FTAnalyticsChromeExtension.prototype.isLoaded = function (tab, module) {
    if (!this.loaded[tab]) {
        return false;
    }

    return this.loaded[tab].indexOf(module) >= 0;
};

FTAnalyticsChromeExtension.prototype.setLoaded = function (tab, module) {
    if (!this.loaded[tab]) {
        this.loaded[tab] = [module];

        return true;
    }

    if (this.loaded[tab].indexOf(module) < 0) {
        this.loaded[tab].push(module);

        return true;
    }

    return false;
};

FTAnalyticsChromeExtension.prototype.unload = function (tab, module) {
    if (this.loaded[tab] && this.loaded[tab].indexOf(module) > -1) {
        this.loaded[tab].splice(this.loaded[tab].indexOf(module));
    }

    switch (module) {
    case 'position':
        chrome.tabs.executeScript(null, { code : "ftacePosition.stop();"});
        break;
    case 'data':
        chrome.tabs.executeScript(null, { code : "ftaceData.stop();"});
        break;
    case 'decode':
        chrome.tabs.executeScript(null, { code : "ftaceDecode.stop();"});
        // If actually turning off, clear out the data.
        this.clearNetworkRequests();
        break;
    }
};

FTAnalyticsChromeExtension.prototype.jquery = function (tab, callback) {
    if (typeof callback === "undefined") { callback = function () {}; }

    var needs_loading = !this.isLoaded(tab, 'jquery');

    if (needs_loading) {
        this.setLoaded(tab, 'jquery');
        this.log('LOADER: Loading', 'jQuery');
        chrome.tabs.executeScript(tab, { file : "js/core/jquery-1.8.2.min.js" }, function () {
            chrome.tabs.executeScript(tab, { file : "js/core/jquery-ui-1.9.1.custom.min.js" }, callback);
        });
    } else {
        callback();
    }
};

FTAnalyticsChromeExtension.prototype.core = function (tab, callback) {
    if (typeof callback === "undefined") { callback = function () {}; }

    var needs_loading = !this.isLoaded(tab, 'core');

    if (needs_loading) {
        this.setLoaded(tab, 'core');
        this.log('LOADER: Loading', 'Core');
        chrome.tabs.insertCSS(tab, { file : "css/jquery-ui-1.9.1.custom.min.css" });
        chrome.tabs.executeScript(tab, { file : "js/core/extension.js" }, callback);
    } else {
        callback();
    }
};

FTAnalyticsChromeExtension.prototype.position = function (tab, callback) {
    if (typeof callback === "undefined") { callback = function () {}; }
    this.log('LOADER: Loading', 'Position');

    chrome.tabs.executeScript(tab, { file : "js/position.js" }, function () {
        chrome.tabs.executeScript(tab, { code : "ftacePosition.init();"}, callback);
    });
};

FTAnalyticsChromeExtension.prototype.data = function (tab, callback) {
    if (typeof callback === "undefined") { callback = function () {}; }
    this.log('Loading', 'Data');

    chrome.tabs.insertCSS(tab, { file : "css/data.css" });
    chrome.tabs.executeScript(tab, { file : "js/core/d3.v3.min.js" }, function () {
        chrome.tabs.executeScript(tab, { file : "js/data.js" }, function () {
            chrome.tabs.executeScript(tab, { code : "ftaceData.init();"}, callback);
        });
    });
};

FTAnalyticsChromeExtension.prototype.decode = function (tab, callback) {
    if (typeof callback === "undefined") { callback = function () {}; }
    this.log('LOADER: Loading', 'Decode');

    chrome.tabs.executeScript(tab, { file : "js/decode.js" }, function () {
        chrome.tabs.executeScript(tab, { code : "ftaceDecode.init();"}, callback);
    });
};
