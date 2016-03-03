const errors = [];
errors[1] = 'Unknown error was encountered.';
errors[2] = 'Non-supported Profile was accessed.';
errors[3] = 'Non-supported HTTP method was used.';
errors[4] = 'Non-supported attribute was used.';
errors[5] = 'Service ID is required.';
errors[6] = 'Service was not found.';
errors[7] = 'Response timeout.';
errors[8] = 'Illegal or nonexistent attribute or interface was accessed.';
errors[9] = 'No enough battery to control the device.';
errors[10] = 'Request parameters are invalid.';
//errors[11] = 'Authorization error.';
//errors[12] = 'Access token expired.';
//errors[13] = 'Access token was required.';
//errors[14] = 'Request is out of scope.';
//errors[15] = 'clientId was not found.';
errors[16] = 'State of device is illegality.';
errors[17] = 'State of server is illegality.';
//errors[18] = 'Origin of request is invalid.';

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
    if (message === undefined) {
        message = errors[code];
    }
    if (message !== undefined) {
        this.put('errorMessage', message);
    }
};
Response.prototype.toJson = function() {
    return this.json;
};

module.exports = Response;
