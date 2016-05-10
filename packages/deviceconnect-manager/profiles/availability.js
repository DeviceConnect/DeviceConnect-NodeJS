module.exports = {

  provides: [
    {
      method: 'GET',
      api: 'gotapi',
      profile: 'availability',
      onRequest: function(request, response) {
        response.ok();
      }
    }
  ]

};
