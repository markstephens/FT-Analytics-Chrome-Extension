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
    function decode_base64(s) {
        var e = {}, i, k, v = [], r = '', w = String.fromCharCode,
            n = [
                [65, 91],
                [97, 123],
                [48, 58],
                [47, 48],
                [43, 44]
            ],
            z, b = 0, c, x, l = 0, o;

        for (z in n) {
            if (n.hasOwnProperty(z)) {
                for (i = n[z][0]; i < n[z][1]; i += 1) {
                    v.push(w(i));
                }
            }
        }
        for (i = 0; i < 64; i++) {
            e[v[i]] = i;
        }

        for (i = 0; i < s.length; i += 72) {
            b = 0;
            l = 0;
            o = s.substring(i, i + 72);
            for (x = 0; x < o.length; x++) {
                c = e[o.charAt(x)];
                b = (b << 6) + c;
                l += 6;
                while (l >= 8) {
                    r += w((b >>> (l -= 8)) % 256);
                }
            }
        }
        return r;
    }

    var d, c, arr, str, i;

    d = url.split("&d=")[1];
    if(typeof d == "undefined"){
        return url;
    }
    c = d.split("&c=")[0];

    c.replace("#", "+");
    c.replace("_", "=");
    arr = c.split("*");

    str = "";

    for (i = 0; i < arr.length; i++) {
        str += decode_base64(arr[i]) + ";";
    }

    str = encodeURIComponent(str).replace(/%00/g, "");
    str = decodeURIComponent(str);
    str = str.substring(0, str.length - 1);
    /*if (window.console && console.log) {
     console.log(str.replace(/;+/g, "\n"));
     }*/
    return str;
};
FTAnalyticsChromeExtension.prototype.storeNetworkRequest = function(tabid, request) {
    if(!this.network_requests.hasOwnProperty(tabid)) {
        this.network_requests[tabid] = [];
    }

    this.network_requests[tabid].push({ timestamp:request.timeStamp, url:this.decodeIJentoRequest(request.url) });
};
FTAnalyticsChromeExtension.prototype.getNetworkRequests = function(tabid) {
    if(this.network_requests.hasOwnProperty(tabid)) {
        return this.network_requests[tabid];
    }

    return [];
};