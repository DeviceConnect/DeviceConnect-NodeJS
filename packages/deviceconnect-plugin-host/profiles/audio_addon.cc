#include <node.h>
#include <node_buffer.h>
#include <fcntl.h>
#include <linux/soundcard.h>
#include <stdio.h>
#include <sys/ioctl.h>
#include <unistd.h>

namespace audio {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Boolean;

/**
 * 量子化ビット数 : 16 bits
 * サンプリング周波数 : 44.1 KHz
 * チャンネル数 : 1
 * 録音/再生時間 : 0.1 sec
 *
 * 分のバッファ領域
 *
 */
#define BUFSIZE 70560

/**
 * /dev/dspへのファイルディスクリプタ.
 */
static int mFD = -1;

static int setup_dsp(int fd) {
    int fmt = AFMT_S16_LE;
    int freq = 44100;
    int channel = 1;

    // サウンドフォーマットの設定
    if (ioctl(fd, SOUND_PCM_SETFMT, &fmt) == -1) {
        perror("ioctl(SOUND_PCM_SETFMT)");
        return -1;
    }

    // チャンネル数の設定
    if (ioctl(fd, SOUND_PCM_WRITE_CHANNELS, &channel) == -1) {
        perror("ioctl( SOUND_PCM_WRITE_CHANNELS )");
        return -1;
    }

    // サンプリング周波数の設定
    if (ioctl(fd, SOUND_PCM_WRITE_RATE, &freq) == -1) {
        perror("ioctl(SOUND_PCM_WRITE_RATE)");
        return -1;
    }

    return 0;
}

void SetupMethod(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();

    if (mFD == -1 && (mFD = open("/dev/dsp", O_RDWR)) == -1) {
        perror("open()");
        args.GetReturnValue().Set(Boolean::New(isolate, false));
    } else {
        if (setup_dsp(mFD) == 0) {
            args.GetReturnValue().Set(Boolean::New(isolate, true));
        } else {
            args.GetReturnValue().Set(Boolean::New(isolate, false));
        }
    }
}

void CloseMethod(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    if (mFD != -1) {
        close(mFD);
        mFD = -1;
        args.GetReturnValue().Set(Boolean::New(isolate, true));
    } else {
        args.GetReturnValue().Set(Boolean::New(isolate, false));
    }
}

void PollingMethod(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    if (mFD != -1) {
        Local<Object> bufferObj = args[0]->ToObject();
        char* buf = node::Buffer::Data(bufferObj);
        int len = node::Buffer::Length(bufferObj);
        int rtn;
        if ((rtn = read(mFD, buf, len)) == -1) {
            perror("read()");
            args.GetReturnValue().Set(Boolean::New(isolate, false));
        } else {
            args.GetReturnValue().Set(Boolean::New(isolate, true));
        }
    } else {
        args.GetReturnValue().Set(Boolean::New(isolate, false));
    }
}

void init(Local<Object> exports) {
     NODE_SET_METHOD(exports, "setup", SetupMethod);
     NODE_SET_METHOD(exports, "close", CloseMethod);
     NODE_SET_METHOD(exports, "polling", PollingMethod);
}

NODE_MODULE(addon, init)

}  // namespace audio
