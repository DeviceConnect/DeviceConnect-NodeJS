var Request = function(expressReq) {
    this.method = expressReq.method
    this.api = expressReq.params.api;
    this.profile = expressReq.params.profile;
    this.interface = expressReq.params.interface;
    this.attribute = expressReq.params.attribute;
    this.query = expressReq.query || {};
}

module.exports = Request;
