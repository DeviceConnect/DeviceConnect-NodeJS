# Host Device Plug-in for Node.js

## Install

```
$ git clone https://github.com/TakayukiHoshi1984/DeviceConnect-NodeJS
$ cd DeviceConnect-NodeJS/deviceconnect-plugin-host
$ npm install
```
## audio_addon.cc build

```
$ cd DeviceConnect-NodeJS/deviceconnect-plugin-host
$ npm install -g node-gyp
$ cd profile
$ node-gyp configure
$ node-gyp build
```