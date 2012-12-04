 //
// apnDevice.js — node_apns
// today is 12/03/12, it is now 06:02 PM
// created by Thierry Passeron
// see LICENSE for details.
//
var assert = require("assert");
/* 
  Create a device with a token
  @arguments
    token: a hex String or a Buffer
*/
module.exports = function (token) { return new Device(token); }
var Device = function (token) {
  if (false === (this instanceof Device)) { return new Device(token); }
    if (!token) assert.ok(false,"No token in device initizalition");
    if ((typeof(token) === "object") && (token instanceof Buffer)) { token = token.toString('hex'); }
    this.token = token;
    return this;
}
// Check if a device is valid (basic checking, we only check it's a valid hex string and it's length)
Device.prototype.isValid = function () {
  try { this.toNetwork(); } 
  catch (e) { console.log(e); return false; }
  return (this.token.length == 64);
}
// Return the token in network (binary) format
Device.prototype.toNetwork = function () { return new Buffer(this.token.replace(/\s+/g, ''), 'hex'); }