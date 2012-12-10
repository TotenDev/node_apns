//
// apnFeedback.js — node_apns
// today is 12/03/12, it is now 06:02 PM
// created by Thierry Passeron
// see LICENSE for details.
//

var definitions = require('./definitions.js')(),
    assert = require("assert"),
    tls = require('tls'),
    Buffer = require('buffer').Buffer,
    events = require('events'),
    util = require('util') ;
/*
    Feedback(<tls_options>);
    Connect to the feedback service and retrieve the informations.
    @arguments
        tls_options: <tls connect options (hash)>
    @returns a new Feedback connection object
    @emits
        - 'connected'
        - 'device'
        - 'error'
        - 'end'
*/
module.exports = function (tls_opts) { return new Feedback(tls_opts); }
function Feedback(tls_opts) {
    assert.ok(tls_opts,"No feedback tls connection options");
    //Initiaze default options
    this.options = {
        host: (function() { return definitions.APNS.push.host.replace('gateway','feedback'); })(),
        port: definitions.APNS.feedback.port,
        bufferSize: 8 /* number of messages that are cached before being flushed */
    };
    //Helper
    this.respondError = function (err,instance) {
      instance.emit('error',err);
      instance.emit('end');
      instance.disconnect();
    }
    //
    var instance = this;
    process.nextTick(function () { instance.connect(tls_opts) });
    return this;
}
util.inherits(Feedback, events.EventEmitter);

/* Private */
Feedback.prototype.connect = function connect(tls_opts) {
  var instance = this; 
  //!=scope     
  cleartextStream = null  /* holds the connection to Apple */,
  buffer = new Buffer(definitions.APNS.feedback.messageSize * this.options.bufferSize) /* holds the received data from Apple */,
  freeIndex = 0 /* the index from which the buffer can be filled with meaningful values */;
  //Catching exceptions :)
  try {
    this.cleartextStream = tls.connect(this.options.port, this.options.host, tls_opts, function () {
      definitions.log('Feedback from ' + this.options.host + ':' + this.options.port);
      //Check if autheticated properly
      if (!cleartextStream.authorized) { 
        instance.respondError("Error in autheticating with apple feedback server (" + instance.cleartextStream.authorizationError + ") --  host: " + instance.options.host + ":" + instance.options.port,instance);
      }
      else {
        if(instance.connectedCallback) { instance.emit('connected'); }
        this.cleartextStream.on('data', function (data) { instance.receiveData(data); });
      }
    });

    this.cleartextStream.on('error', function (err) {
      instance.respondError("Error in connecting with apple feedback server (" + err + ") --  host: " + instance.options.host + ":" + instance.options.port,instance);
    });
    this.cleartextStream.on('clientError', function(err) {
      instance.respondError("Error in establishing connection with apple feedback server (" + err + ") --  host: " + instance.options.host + ":" + instance.options.port,instance);
    });
    this.cleartextStream.on('close', function () {
      instance.emit('end');
      instance.disconnect();
    }); 
    this.cleartextStream.on('end', function () {
      if (freeIndex > 0) { // Flush
          definitions.log('Flushing');
          checkLocalBuffer(function(time, token) { instance.emit('device', time, token.toString('hex')); });
          freeIndex = 0;
      }
      instance.emit('end');
      instance.disconnect();
    });
  }catch (err) { instance.respondError("Exception on feedback server "+err,instance); }
}

Feedback.prototype.disconnect = function disconnect() {
    if (cleartextStream) cleartextStream.removeAllListeners();
    cleartextStream = null;
    this.removeAllListeners();
}

Feedback.prototype.receiveData = function receiveData(data) {
    var freeBytes = buffer.length - freeIndex,
        instance = this;
    if (freeBytes > 0) {
        if (freeBytes > data.length) {
            data.copy(buffer, freeIndex, 0, data.length);
            freeIndex = freeIndex + data.length;
        } else {
            data.copy(buffer, freeIndex, 0, freeBytes);
            freeIndex = freeIndex + freeBytes;
            //
            this.receiveData(data.slice(freeBytes));
        }
    }else {
        this.checkLocalBuffer(function (time, token) { instance.emit('device',time,token.toString('hex')); });
        freeIndex = 0; // buffer is now *empty*
        if (data && data.length) this.receiveData(data);
    }
}

Feedback.prototype.checkLocalBuffer = function checkLocalBuffer (callback) {
    for (var i = 0; i < freeIndex; i = i + definitions.APNS.feedback.messageSize) {
        var tuple = new Buffer(definitions.APNS.feedback.tupleSize);
        buffer.copy(tuple, 0, i, tuple.length);
        //Message structure:
        //Byte  -- |   4 UBE   |     2 UBE   |     32     |
        //Value -- | time(UTC) | tokenLength |   token    |
        callback(tuple.readUInt32BE(0), tuple.slice(6, tuple.readUInt16BE(4) + 6));
    }
}