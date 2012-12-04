//
// definitions.js — node_apns
// today is 12/03/12, it is now 06:05 PM
// created by Thierry Passeron
// see LICENSE for details.
//

function definitions () {
  this.APNS = {
      /* SOURCE: http://developer.apple.com/library/ios/#DOCUMENTATION/NetworkingInternet/Conceptual/RemoteNotificationsPG/CommunicatingWIthAPS/CommunicatingWIthAPS.html */
      push: {
          host: (process.env['apnsDev']=="TRUE" ? 'gateway.sandbox.push.apple.com' : 'gateway.push.apple.com'),
          port: 2195
      },
      feedback: {
          port: 2196,
          messageSize: 38 /* The feedback binary tuple's size in Bytes (4 + 2 + 32) */
      },
      errors : {
          '0': 'No errors encountered',
          '1': 'Processing error',
          '2': 'Missing device token',
          '3': 'Missing topic',
          '4': 'Missing payload',
          '5': 'Invalid token size',
          '6': 'Invalid topic size',
          '7': 'Invalid payload size',
          '8': 'Invalid token',
          '255': 'None (unknown)'
      }       
  }

  this.log = function () {
      var args = [].slice.call(arguments);
      args.unshift(new Date + " -");
//      console.log.apply(null, args);
  }
  return this;
}
definitions.instance = null;
module.exports = function () {
  if (definitions.instance === null) { this.instance = new definitions(); }
  return this.instance;
}