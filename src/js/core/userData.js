FTAnalyticsChromeExtension.prototype.startupData = function(callback) {
    if(typeof callback === "undefined"){ callback = function(){} };

    var self = this;

    chrome.storage.sync.get(null, function(items){
        self.user_data = items;
        callback();
    });
};

FTAnalyticsChromeExtension.prototype.setUserData = function(name, value) {
    var obj = {};
    obj[name] = value;
    this.user_data[name] = value;
    chrome.storage.sync.set(obj);
};

FTAnalyticsChromeExtension.prototype.delUserData = function(name) {
    chrome.storage.sync.remove(name);
    delete this.user_data[name];
};

FTAnalyticsChromeExtension.prototype.getUserData = function(name) {
    if(name){
        return this.user_data[name];
    }

    return this.user_data;
};

FTAnalyticsChromeExtension.prototype.decodeIJentoRequest = function (url) {
    //We get handed a string, assume that it is a fully formatted url
    //We will regex out the value we are interested in

    var decodedUrl = {},
        search = new RegExp(/(?:https?:\/\/)?[^?]*\?f=([^&]*)&d=([^ ]*)/im),
        elements = search.exec(url),
        //elements[1] is the value of the definition fields
        //elements[2] is the data values
        names = elements[1].split(""),
        data = elements[2].replace(/#/g,"+").replace(/_/g,"=").split("*");

    // Base 64 Decode all the array elements
    for (var i in data) {
        decodedUrl[names[i]] = atob(data[i]);
    }

    /* KEYS
     r: Referrer
     p: Request
     d: Additional data (screen res/Java enabled)
     c: Cookie
     u: Pseudo random number to bypass caching
     t: External click id
     f: Tracert path
     q: Tracer query data
     g: Tag data
     w: Is cookie new
     y: Tag Type
     o: Index
     otherwise: Empty field
     */

    this.log('decodedUrl',decodedUrl)

    return decodedUrl;
};

FTAnalyticsChromeExtension.prototype.storeNetworkRequest = function(tabid, request) {
    if(/^http:\/\/stats/.test(request.url)){
        var self = this;

        chrome.tabs.get(tabid,function(tab){
            if(!self.network_requests.hasOwnProperty(tabid)) {
                self.network_requests[tabid] = {};
            }

            var home_re = /^http:\/\/www.ft.com\/home\//, title = tab.title, url = tab.url, ijHost = request.url.match(/^http:\/\/([\w\-\.]+)/);

            if(home_re.test(url)){
                title = url.replace(home_re,'').toUpperCase() + " Home";
            }
            else {
                title = title.replace(" - FT.com", "");
            }

            if(!self.network_requests[tabid].hasOwnProperty(url)) {
                self.network_requests[tabid][url] = { title: title, requests: []};
            }

            self.network_requests[tabid][url].requests.push({ timestamp:request.timeStamp, url:self.decodeIJentoRequest(request.url), ijHost:ijHost[1] });
        })
    }
};

FTAnalyticsChromeExtension.prototype.getNetworkRequests = function(tabid) {
    if(this.network_requests.hasOwnProperty(tabid)) {
        return this.network_requests[tabid];
    }

    return [];
};