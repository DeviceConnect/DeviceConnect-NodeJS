module.exports = {

    name: 'mediastream_recording',

    apis: [
        {
            method: 'GET',
            profile: 'mediastream_recording',
            attribute: 'mediarecorder',
            onRequest: onGetMediaRecorder
        },
        {
            method: 'PUT',
            profile: 'mediastream_recording',
            attribute: 'preview',
            onRequest: onPutPreview
        },
        {
            method: 'DELETE',
            profile: 'mediastream_recording',
            attribute: 'preview',
            onRequest: onDeletePreview
        }
    ]
};

function onGetMediaRecorder(request, response) {
    response.error(1, 'To be implemented.');
}

function onPutPreview(request, response) {
    response.error(1, 'To be implemented.');
}

function onDeletePreview(request, response) {
    response.error(1, 'To be implemented.');
}
