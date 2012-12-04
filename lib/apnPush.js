//
// apnPush.js — node_apns
// today is 12/03/12, it is now 06:02 PM
// created by Thierry Passeron
// see LICENSE for details.
//
var util = require('util'),
    events = require('events'),
    tls = require('tls'),
    assert = require('assert'),
    definitions = require('./definitions.js')(),
    Device = require('./apnDevice.js'),
    Buffer = require('buffer').Buffer;

/*
    Push(<{tls_options}>)
    @arguments
        tls_options: <tls connect options (hash)>
    @returns a new Push connection object
    @emits
        - 'error'
        - 'end'
        - 'notificationError'
        - 'sent'
*/
module.exports = function (tls_opts) { return new Push(tls_opts); }
function Push(tls_opts) {
  // Options checking
  assert.ok(tls_opts,"No tls connection options");
  //Helper
  this.respondError = function (err,instance) {
    instance.emit('error',err);
    instance.emit('end');
    instance.disconnect();
  }
  this.options = {
      host: (function() { return definitions.APNS.push.host })(),
      port: definitions.APNS.push.port,
      tls:tls_opts
  }
  this.uid = 0 /* Notifications' id */;
  this.cleartextStream = null  /* holds the stream to Apple */;
  /* You may provide your own method for nextUID() */
  this.nextUID = function () { return uid++; }  
  return this;
}
util.inherits(Push, events.EventEmitter);

Push.prototype.sendNotification = function sendNotification(notification,callback,UID) {
  var instance = this;
  instance.ensureConnection(function() {
    if (!UID) { UID = instance.nextUID(); }
    if (!instance.cleartextStream.write(notification.toNetwork(UID))) { 
      //wait until drain and try to send again
      instance.cleartextStream.once("drain",function () { instance.sendNotification(notification,callback,UID); });
    }else { 
      instance.emit('sent', notification); 
      if (callback) { callback(notification); }
    }
  }); 
}

Push.prototype.disconnect = function disconnect() {
  this.resetConnection();
  this.removeAllListeners();
}

/* Private Functions */
Push.prototype.connect = function connect(callback) {
  var instance = this;
  try {
    this.cleartextStream = tls.connect(instance.options.port, instance.options.host, instance.options.tls, function () {
      definitions.log('Push to ' + instance.options.host + ':' + instance.options.port);
      //Check if autheticated properly
      if (!cleartextStream.authorized) { 
        instance.respondError("Error in autheticating with apple push server (" + instance.cleartextStream.authorizationError + ") --  host: " + instance.options.host + ":" + instance.options.port,instance);
      }else {
        if (callback) callback();
        //normal close
        cleartextStream.on('close', function () { instance.emit('end'); this.disconnect(); });
        cleartextStream.on('end', function () { instance.emit('end'); this.disconnect(); });
        //error close
        cleartextStream.on('timeout', function () { instance.respondError("connection timed out",instance); });
        cleartextStream.on('clientError', function(exception) { instance.respondError("Error in establishing connection with apple push server (" + err + ") --  host: " + instance.options.host + ":" + instance.options.port,instance); });
        cleartextStream.on('error', function (exception) { instance.respondError("Error in connecting with apple push server (" + err + ") --  host: " + instance.options.host + ":" + instance.options.port,instance); });
        //
        cleartextStream.on('data', function (data) {
            // Bytes  --  |  1  |    1    |        4        |
            // Value  --  |  8  | errCode | notificationUID |
            if (data[0] == 8) { instance.emit('notificationError', data[1].toString(), data.readUInt32BE(2)); } 
            definitions.log('Error-response:', data);
        });
      }           
    });
  }catch (err){ instance.respondError("Exception on push server "+err,instance); }
};

Push.prototype.ensureConnection = function ensureConnection(callback) {
  if (this.cleartextStream && this.cleartextStream.writable) {
    definitions.log('Connection is okay')
    callback();
  } else {
    definitions.log('Connection is stale!');
    this.resetConnection();
    this.connect(callback);
  }
}

Push.prototype.resetConnection = function resetConnection() {
  if (this.cleartextStream) {
    this.cleartextStream.removeAllListeners();
    this.cleartextStream.destroySoon();
  } this.cleartextStream = null;
}