var MJPEG_RASPICAM_PORT = 9000;
var MJPEG_UVCCAM_PORT = 10000;
var AUDIO_SERVER_PORT = 11000;

var addon = require('./build/Release/audio_addon');
var result = addon.setup();
if (result) {
    console.log("/dev/dsp open");
} else {
    console.error("/dev/dsp cannot open");
}
var WebSocketServer = require('ws').Server;
var wss, polling;

var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn,
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
    var recorder = config.recorders[Number(target)];
    if (!recorder) {
      recorder = config.recorders[0];
    }
    var command, aspect = {};
    getCurrentAspect(Number(target), aspect);
    if (!aspect && recorder.type == 'camera') {
        response.error(10, 'Aspect is invalid');
        return;
    }
    if (recorder.module == 'raspicam') {
      command = 'mjpg_streamer -o \"output_http.so -w ./www -p ' + MJPEG_RASPICAM_PORT
        + '\" -i \"input_raspicam.so -r ' + aspect.previewWidth + 'x' + aspect.previewHeight + '\" -b';
      response.put('uri', 'http://localhost:' + MJPEG_RASPICAM_PORT + '/?action=stream');
    } else if (recorder.type == 'audio') {
      command = undefined;
      wss = new WebSocketServer({ port: AUDIO_SERVER_PORT });
      wss.on('connection', function connection(ws) {
        ws.on('message', function incoming(message) {
           // console.log('received: %s', message);
        });
        ws.on('close', function() {
           if (polling) {
               clearInterval(polling);
           }
        });
        ws.on('error', function() {
           if (polling) {
               clearInterval(polling);
           }
        });
        polling = setInterval(function() {
            var data = new Buffer(70560);
            if (addon.polling(data)) {
                if (data) {
                    ws.send(data);
                }
            } else {
                console.log("error");
            }
        },10);
      });
      var uri = 'http://localhost:' + AUDIO_SERVER_PORT + "/";
      response.put('audio', {"uri":uri});
    } else {
      command = 'mjpg_streamer -i \"input_uvc.so -d ' + recorder.module
                + ' -r ' + aspect.previewWidth + 'x' + aspect.previewHeight
                + '\" -o \"output_http.so -w ./www -p ' + MJPEG_UVCCAM_PORT + '\" -b';
      response.put('uri', 'http://localhost:' + MJPEG_UVCCAM_PORT + '/?action=stream');
    }

    if (command) {
        children[Number(target)] = exec(command,
          function(error, stdout, stderr) {
              console.log('stdout: ' + stdout);
              console.log('stderr: ' + stderr);
              if (error) {
                  console.log('exec error: ' + error);
              }
              response.ok();
              response.send();
            
       });
       return false;
    }
    response.ok();
    return true;
}

function onDeletePreview(request, response) {
    var target = request.query.target;
    var child = children[Number(target)];
    var record = config.recorders[Number(target)];
    if (!child) {
      child = children[0];
    }
    if (!record) {
      record = config.recorders[0];
    }
    if (record.type == 'camera' && child) {
      spawn('pkill', ['-x', 'mjpg_streamer']);
    } else {
      if (wss) {
          wss.close();
      }
    }
    response.ok();
    setTimeout(function() {
       response.send();
    }, 5000);
    return false;
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
            var audios = config.recorders[i].audio;
            if (audios && audios.channels && audios.sampleRate && audios.sampleSize && audios.blockSize) {
                recorder.audio = {};
                recorder.audio.channels = audios.channels;
                recorder.audio.sampleRate = audios.sampleRate;
                recorder.audio.sampleSize = audios.sampleSize;
                recorder.audio.blockSize = audios.blockSize;
            }
        }
    }
}
