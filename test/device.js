//
// device.js — node_apns
// today is 12/03/12, it is now 06:05 PM
// created by Thierry Passeron
// see LICENSE for details.
//
  
var node_apns = require("./../index.js"),
    tap = require('tap');

tap.test("\nInvalid token initialization",function (t) {
  t.plan(4);
  var device ,
      token = "64656a73";
  t.doesNotThrow(function () {
    device = node_apns.Device(token);
    t.notOk(device.isValid(),'invalid device is not valid');
    t.ok(device.toNetwork(),'to network on invalid token');
    t.equal(token,device.token,'invalid device token is same as device obj');
  },"not throw on (invalid)device initialization function");
});

tap.test("\nValid token initialization",function (t) {
  t.plan(4);
  var device ,
      token = "64656a736e636f656e646b6462646b6468646c776e6464656465776465776662";
  t.doesNotThrow(function () {
    device = node_apns.Device(token);
    t.ok(device.isValid(),'valid device is valid');
    t.ok(device.toNetwork(),'to network on valid token');
    t.equal(token,device.token,'invalid device token is same as device obj');
  },"not throw on (valid)device initialization function");
});