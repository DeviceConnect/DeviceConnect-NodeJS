module.exports = {

    name: 'notification',

    apis: [
        {
            method: 'POST',
            profile: 'notification',
            attribute: 'notify',
            onRequest: onPostNotify
        }
    ]
};

function onPostNotify(request, response) {
    var type = request.query.type;
    if (type === undefined) {
        response.error(10, 'type is undefined.');
        return;
    }
    type = filterNumber(type);
    switch (type) {
        case 0:
        case 1:
        case 2:
        case 3:
            if (request.query.body !== undefined) {
              console.log(request.query.body);
            }
            response.ok();
            return;
        default:
            response.error(10, 'target is invalid.')
            return;
    }
}

function filterNumber(value) {
  if(/^([0-9]+)$/.test(value))
    return Number.parseInt(value, 10);
  return NaN;
}
