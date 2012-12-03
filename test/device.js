//
// device.js — APNRS
// today is 12/03/12, it is now 06:05 PM
// created by TotenDev
// see LICENSE for details.
//
  
var node_apns = require("./../index.js"),
    tap = require('tap');

tap.test("\nInvalid(hexa) token initialization",function (t) {
  t.plan(4);
  var device ;
  t.doesNotThrow(function () {
    device = node_apns.Device("64656a73");
    t.notOk(device.isValid(),'invalid device is not valid');
    t.doesNotThrow(function () {
      t.ok(device.toNetwork(),'to network on invalid token');
    },"not throw on .toNetwork function");
  },"not throw on (invalid)device initialization function");
});

tap.test("\nValid token initialization",function (t) {
  t.plan(4);
  var device ;
  t.doesNotThrow(function () {
    device = node_apns.Device("64656a736e636f656e646b6462646b6468646c776e6464656465776465776662");
    t.ok(device.isValid(),'valid device is valid');
    t.doesNotThrow(function () {
      t.ok(device.toNetwork(),'to network on valid token');
    },"not throw on .toNetwork function");
  },"not throw on (valid)device initialization function");
});