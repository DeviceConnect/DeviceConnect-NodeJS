var Response = function() {
    this.json = {
        result: 1,
        errorCode: 0,
        errorMessage: ''
    };
};
Response.prototype.get = function(key) {
    return this.json[key];
};
Response.prototype.put = function(key, value) {
    this.json[key] = value;
};
Response.prototype.isOk = function() {
    return this.get('result') === 0;
};
Response.prototype.ok = function() {
    this.put('result', 0);
    this.put('errorCode', 0);
    this.put('errorMessage', '');
};
Response.prototype.error = function(code, message) {
    this.put('result', 1);
    this.put('errorCode', code);
    this.put('errorMessage', message);
};
Response.prototype.toJson = function() {
    return this.json;
};

module.exports = Response;
