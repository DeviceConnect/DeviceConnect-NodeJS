var fs = require('fs');
var v4l2camera = require("v4l2camera");
var config = JSON.parse(fs.readFileSync(__dirname + '/mediarecorder.json', 'utf8'));

//for (var i = 0; i < config.recorders.length; i++) {
//    console.log("name:" + config.recorders[i].name);
//    console.log("module:" + config.recorders[i].module);
//    console.log("type:" + config.recorders[i].type);
//}

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
    var recorders = [];
    for (var i = 0; i < config.recorders.length; i++) {
        var recorder = {};
        recorder.id = i;
        recorder.name = config.recorders[i].name;
	recorder.state = "inactive";
        if (config.recorders[i].type == "camera") {
            recorder.mimeType =  "image/jpeg";
        } else {
            recorder.mimeType = "audio/wav";
        }
        var cam;
	try {
	    cam = new v4l2camera.Camera(config.recorders[i].module);
	    recorder.previewWidth = cam.configGet().width;
 	    recorder.previewHeight = cam.configGet().height;
	} catch (e) {
	    if (config.recorders[i].type == "camera") {
		var previews = config.recorders[i].previewSizes;
		if (previews && previews.length > 0) {
		    recorder.previewWidth = previews[0].width;
		    recorder.previewHeight = previews[0].height;
		}		
	    } else {
		var audio = config.recorders[i].audio;
		if (audio && audio.channel && audio.sampleRate && audio.sampleSize && audio.blockSize) {
		    recorder.audio.channels = audio.channels;
		    recorder.audio.sampleRate = audio.sampleRate;
		    recorder.audio.sampleSize = audio.sampleSize;
		    recorder.audio.blockSize = audio.blockSize;
		}		
	    }
	}
        recorders.push(recorder);
    }
    response.put("recorders", recorders);
    response.ok();
}

function onPutPreview(request, response) {
    response.error(1, 'To be implemented.');
}

function onDeletePreview(request, response) {
    response.error(1, 'To be implemented.');
}
