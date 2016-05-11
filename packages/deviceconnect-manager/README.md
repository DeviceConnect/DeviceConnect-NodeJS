# Device Connect Manager for Node.js

## Install

```
$ git clone https://github.com/DeviceConnect/DeviceConnect-NodeJS
$ cd DeviceConnect-NodeJS/packages/deviceconnect-manager/
$ npm install
```

## Run

Execute below command to start DeviceConnect system on the directory 'deviceconnect-manager'.

```
$ npm start
```

## Check availability

Send the following Availability API request from a client to Device Connect Manager for Node.js on the same LAN:

```
$ curl -X GET "http://localhost:4035/gotapi/availability"
```

or

```
$ curl -X GET "http://<IP_ADDRESS>:4035/gotapi/availability"
```

If avaiable, the following response will be returned from the manager.

```
{
    "result": 0,
    "errorCode": 0,
    "errorMessage": "",
    "product": "deviceconnect-manager",
    "version":"x.x.x"
}
```
