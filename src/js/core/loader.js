FTAnalyticsChromeExtension.prototype.load = function(tab, module, callback){
    if (typeof callback === "undefined"){ callback = function(){}; }

    if(this.modules.indexOf(module) !== -1) {
        this.log("LOADER", tab, module);

        // Load module.
        var self = this,
            needs_loading = !this.isLoaded(tab, module);
        this.log('LOADER: loaded?', tab, module, !needs_loading);

        if(needs_loading){
            // jQuery is needed by everything, but only once per tab!
            self.jquery(tab, function(){
                // And Extension core.
                self.core(tab, function(){
                    // Load module
                    switch(module){
                        case 'position': self.position(tab, callback); break;
                        case 'data': self.data(tab, callback); break;
                        case 'decode': self.decode(tab, callback); break;
                    }
                });
            });
        }
        else {
            callback();
        }
    }
};

FTAnalyticsChromeExtension.prototype.isLoaded = function(tab,module) {
    if(!this.loaded[tab]) {
        this.loaded[tab] = [module];

        this.log('LOADER: loaded', this.loaded);

        return false;
    }

    if(this.loaded[tab].indexOf(module) < 0) {
        this.loaded[tab].push(module);

        this.log('LOADER: loaded', this.loaded);

        return false;
    }

    this.log('LOADER: loaded', this.loaded);

    return true;
};

FTAnalyticsChromeExtension.prototype.unload = function(tab, module){
    if(this.loaded[tab] && this.loaded[tab].indexOf(module) > -1) {
        this.loaded[tab].splice(this.loaded[tab].indexOf(module));
    }

    switch(module){
        case 'position':chrome.tabs.executeScript(null, { code : "FTACEPosition.stop();"}); break;
        case 'data':  break;
        case 'decode': chrome.tabs.executeScript(null, { code : "FTACEDecode.stop();"}); break;
    }
}


FTAnalyticsChromeExtension.prototype.jquery = function(tab, callback){
    if (typeof callback === "undefined") { callback = function(){} }

    var needs_loading = !this.isLoaded(tab, 'jquery');

    if(needs_loading) {
        this.log('LOADER: Loading','jQuery');
        chrome.tabs.executeScript(tab, { file : "js/core/jquery-1.8.2.min.js" }, callback);
        chrome.tabs.executeScript(tab, { file : "js/core/jquery-ui-1.9.1.custom.min.js" }, callback);
    }
    else {
        callback();
    }
};

FTAnalyticsChromeExtension.prototype.core = function(tab, callback){
    if (typeof callback === "undefined") { callback = function(){} }

    var needs_loading = !this.isLoaded(tab, 'core');

    if(needs_loading){
        this.log('LOADER: Loading','Core');
        chrome.tabs.insertCSS(tab, { file : "css/onscreen.css" })
        chrome.tabs.executeScript(tab, { file : "js/core/extension.js" }, callback);
    }
    else {
        callback();
    }
};

FTAnalyticsChromeExtension.prototype.position = function(tab, callback){
    if (typeof callback === "undefined") { callback = function(){} }
    this.log('LOADER: Loading','Position');

    chrome.tabs.executeScript(tab, { file : "js/position.js" }, function(){
        chrome.tabs.executeScript(tab, { code : "FTACEPosition.init();"}, callback);
    });
}

FTAnalyticsChromeExtension.prototype.data = function(tab, callback){
    if (typeof callback === "undefined") { callback = function(){} }
    this.log('Loading','Data');

    callback();
}

FTAnalyticsChromeExtension.prototype.decode = function(tab, callback){
    if (typeof callback === "undefined") { callback = function(){} }
    this.log('LOADER: Loading','Decode');

    chrome.tabs.executeScript(tab, { file : "js/decode.js" }, function(){
        chrome.tabs.executeScript(tab, { code : "FTACEDecode.init();"}, callback);
    });
}