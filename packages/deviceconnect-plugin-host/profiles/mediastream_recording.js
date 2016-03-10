var MJPEG_RASPICAM_PORT = 9000;
var MJPEG_UVCCAM_PORT = 10000;
var AUDIO_SERVER_PORT = 11000;

var addon = require('./build/Release/audio_addon');
var result = addon.setup();
if (result) {
    console.log("open");
} else {
    console.log("cannot open");
}
var WebSocketServer = require('ws').Server;
var wss;

var fs = require('fs');
var exec = require('child_process').exec,
    children = [];
var v4l2camera = require('v4l2camera');
var config = JSON.parse(fs.readFileSync(__dirname + '/mediarecorder.json', 'utf8'));

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
	      recorder.state = 'inactive';
        if (config.recorders[i].type == 'camera') {
            recorder.mimeType = 'image/jpeg';
        } else {
            recorder.mimeType = 'audio/wav';
        }
        getCurrentAspect(i, recorder);
        recorders.push(recorder);
    }
    response.put('recorders', recorders);
    response.ok();
}

function onPutPreview(request, response) {
    var target = request.query.target;
    if (!target) {
      response.error(10, 'Target is invalid.');
      return;
    }
    var recorder = config.recorders[Number(target)];
    if (!recorder) {
      response.error(10, 'Target id is invalid.');
      return;
    }
    
    var command, uri, recorder, aspect;
    getCurrentAspect(Number(target), aspect);
    if (!aspect) {
        response.error(10, 'Aspect is invalid');
        return;
    }
    if (recorder.module == 'raspicam') {
      command = 'mjpg_streamer -o \"output_http.so -w ./www -p ' + MJPEG_RASPICAM_PORT
        + '\" -i \"input_raspicam.so -r ' + aspect.previewWidth + 'x' + aspect.previewHeight + '\"';
      uri = 'http://localhost:' + MJPEG_RASPICAM_PORT + '/?action=stream';
    } else if (recorder.type == 'audio') {
      command = undefined;
      wss = new WebSocketServer({ port: AUDIO_SERVER_PORT });
      wss.on('connection', function connection(ws) {
        console.log("connection open");

        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
        });
        setInterval(function() {
            var data = new Buffer(70560);
            if (addon.polling(data)) {
                ws.send(data);
            } else {
                console.log("error");
            }
        },10);
      });
      uri = 'http://localhost:' + AUDIO_SERVER_PORT + "/"
    } else {
      command = 'mjpg_streamer -o \"input_uvc.so -d ' + recorder.module
                + ' -r ' + aspect.previewWidth + 'x' + aspect.previewHeight
                + '\" -o \"output_http.so -w ./www -p ' + MJPEG_UVCCAM_PORT + '\"';
      uri = 'http://localhost:' + MJPEG_UVCCAM_PORT + '/?action=stream';
    }

    if (command) {
        children[Number(target)] = exec(command,
          function(error, stdout, stderr) {
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              if (error) {
                  console.log('exec error: ' + error);
              }
          });
    }
    response.put('uri', uri);
    response.ok();
}

function onDeletePreview(request, response) {
    var target = request.query.target;
    if (!target) {
	      response.error(10, 'Target is invalid');
        return;
    }

    var child = children[Number(target)];
    if (!child) {
      response.error(10, 'Not working server');
      return;
    }
    child.kill('SIGHUP');
    response.ok();
}


function getCurrentAspect(i, recorder) {
    var cam;
    try {
        cam = new v4l2camera.Camera(config.recorders[i].module);
        recorder.previewWidth = cam.configGet().width;
        recorder.previewHeight = cam.configGet().height;
    } catch (e) {
        if (config.recorders[i].type == 'camera') {
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
}
