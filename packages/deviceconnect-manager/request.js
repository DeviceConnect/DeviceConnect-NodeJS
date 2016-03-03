var Request = function(expressReq) {
    this.method = expressReq.method
    this.api = expressReq.params.api;
    this.profile = expressReq.params.profile;
    this.interface = expressReq.params.interface;
    this.attribute = expressReq.params.attribute;
}

module.exports = Request;
