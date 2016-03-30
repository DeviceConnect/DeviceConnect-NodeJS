# Host Device Plug-in for Node.js

## Install

Let below '<DeviceConnect-NodeJS>' be the path on which this repository has been cloned.

```
$ cd <DeviceConnect-NodeJS>/packages/deviceconnect-plugin-host
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
