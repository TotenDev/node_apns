# Apple Push Notifier for node.js

This library helps you send notifications to iOS devices through Apple's Push Notification Service from the wonderful world of Node.js (http://nodejs.org/).

The Push and Feedback objects are EventEmitter-s and publish a large number of events for you to interface your code.

Both simple and enhenced notifications are handled. 

[![Build Status](https://secure.travis-ci.org/TotenDev/node_apns.png?branch=master)](https://travis-ci.org/TotenDev/node_apns)

## Configuration

Almost all configurations are done in initialization of objects, BUT to set Apple push servers to development you must use the code below, so it'll use sandbox gateways to send push notifications.
```js
	process.env['apnsDev'] = "TRUE";
```

## Push

First, require *node_apns*

```js
var Push = require('node_apns').Push;
```

Create a new on-demand push connection

```js
var push = Push({
	cert: require('fs').readFileSync('./cert.pem'), 
	key: require('fs').readFileSync('./key.pem')
});
```

Register for events

```js
push.on('sent', function (notification) {

	// The notification has been sent to the socket (it may be buffered if the network is slow...)
	console.log('Sent', notification);

});

push.on('notificationError', function (errorCode, uid) {

	// Apple has returned an error:
	console.log('Notification with uid', uid, 'triggered an error:', require('node_apns').APNS.errors[errorCode]);

});

push.on('error', function (error) { console.log('Yipikaye!', error); });
```

Create a new Notification

```js
var Notification = require('node_apns').Notification,
	n = Notification("abcdefghabcdefgh", {foo: "bar", aps:{"alert":"Hello world!", "sound":"default"}});
                      /*  ^----- fake device token hex string */
```

Send the notification

```js
if (n.isValid()) push.sendNotification(n);
OR
if (n.isValid()) push.sendNotification(n,function (not){
	console.log("sent notification",not);
});
```

The connection is on-demand and will only be active when a notification needs to be sent. After a first notification, it will stay opened until it dies. When it dies, a new notification will trigger the re-connection.

For everything to work nicely, you should register for 'error' events (push.on('error', function() {...})) to prevent the node's runloop from throwing exceptions when they occur.

### Constructor

	Push(tls_options)

	tls_options: {cert:cert_data, key:key_data [,...]} 
	//see http://nodejs.org/api/tls.html#tls_tls_connect_port_host_options_callback for more details

### Events
Push objects emit these events:

* 'error' (exception) when an error/exception occurs (ENOENT EPIPE etc...)
* 'end' when the server ended the connection (FIN packet)
* 'notificationError' (String errorCode, notificationUID) when Apple reports a *bad* notification
* 'sent' (notification) when a notification has been written to the cleartextStream

### Additional methods
* `push.disconnect();` -- will close as soon as it can


## Feedback
Create an immediate feedback connection

```js
var feedback = require('node_apns').Feedback({cert:cert_data, key:key_data});
feedback.on('device', function(time, token) {
    console.log('Token', token, "is not responding since", new Date(time * 1000));
});
feedback.on('connected', function () { 
    console.log('Connected!'); 
});
feedback.on('error', function (err) { 
    console.log('Server errored ',err);
    console.log('Server will terminate');
});
feedback.on('end', function () { 
    console.log('Done!'); 
});
```

### Constructor

	Feedback(tls_options)
	
	tls_options: {cert:cert_data, key:key_data [,...]} 
	//see http://nodejs.org/api/tls.html#tls_tls_connect_port_host_options_callback for more details

A feedback connection is stopped by Apple when no more devices are to be reported.

### Events
Feedback objects emit these events:
* 'connected' secure connection is established
* 'error' (exception) when an error/exception occurs (ENOENT EPIPE etc...)
* 'end' when the server ended the connection (FIN packet)
* 'device' (uint time, String token) when a device token is reported by Apple

### Additional methods
* `feedback.disconnect();` -- will close as soon as it can

## Notification
You can create Notification objects many different ways:

```js
var Device = require("node_apns").Device,
	tokenString = "abcdefghabcdefgh";

// Create a notification with no device and no payload
n = Notification(); 
	// then...
	n.device = Device(tokenString); 
	n.alert = "Hello world!";

// Create a notification with no payload
n = Notification(tokenString); 
	// then...
	n.alert = "Hello world!";
	n.badge = 1;

// Create a notification with device and payload
n = Notification(tokenString, {foo: "bar"});
	// then...
	n.alert = "Hello world!";
	n.sound = "default";

// Create a notification with device and full payload
n = Notification(tokenString, {foo: "bar", aps:{alert:"Hello world!", sound:"bipbip.aiff"}});
```

### Properties

#### Payload properties
* notification.alert
* notification.badge
* notification.sound

If you need to specify a custom key, then use:
* notification.payload = {...custom-content...}

Example:
```js
n = Notification();
n.payload = {
	from: "terminator",
	to: "rocky-balboa"
};
n.alert = "Diner tonight?";
n.sound = "TheLoveBoat.aiff";
var badge = n.badge;
n.badge = badge+10;
```

Beware that notification.{alert|badge|sound} will overwrite the content of notification.payload.aps if it exists prior to using them.

#### Other properties
* notification.device: the Device object
* notification.encoding: the notification encoding (default is "utf8")
* notification.expiry: when notification expiry
* notification.identifier: notification unique identifier as set (by the push object) when written to the cleartextStream

### Validation
You should always check the notification's validity before sending it.
```js
if (n.isValid()) { push.sendNotification(n); } 
else {
	console.log("Malformed notification", n);
	// ... investigate ...
}
```

## Device
```js
// Create a device object with a token (hex) String with 64 characters
d = Device("abcdefabcdef");

OR

// Create a device object with a Buffer (binary) token
var buffer = new Buffer(32);
d = Device(buffer);
```

### Validation
The token string must be a valid hex string. You can check it with the isValid() method:
```js
if (d.isValid()) { ... }
```

# License terms

The MIT License

Copyright (C) 2012 Thierry Passeron

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.
