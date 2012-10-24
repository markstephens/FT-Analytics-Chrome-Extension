FTAnalyticsChromeExtension.prototype.setUserData = function(name, value) {
    window.localStorage.setItem(name, value);
    this.user_data[name] = value;
};

FTAnalyticsChromeExtension.prototype.delUserData = function(name) {
    window.localStorage.removeItem(name);
    delete this.user_data[name];
};

FTAnalyticsChromeExtension.prototype.getUserData = function(name) {
    if(name){
        return this.user_data[name];
    }

    return this.user_data;
};