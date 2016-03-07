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
    response.error(1, 'To be implemented.');
}
