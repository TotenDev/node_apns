//
// notification.js — node_apns
// today is 12/03/12, it is now 06:05 PM
// created by Thierry Passeron
// see LICENSE for details.
//
  
var node_apns = require("./../index.js"),
    tap = require('tap');

tap.test("\nInvalid token initialization",function (t) {
  t.plan(3);
  var notification ,
      token = "64656a73";
  t.doesNotThrow(function () {
    notification = node_apns.Notification(token, {foo: "bar", aps:{alert:"Hello world!", sound:"bipbip.aiff"}});
    t.ok(notification,"Notification obj exists");
    t.notOk(notification.isValid(),'invalid token, invalid notification');
  });
});


tap.test("\nValid token initialization",function (t) {
  t.plan(3);
  var notification ,
      token = "64656a736e636f656e646b6462646b6468646c776e6464656465776465776662";
  t.doesNotThrow(function () {
    notification = node_apns.Notification(token, {foo: "bar", aps:{alert:"Hello world!", sound:"bipbip.aiff"}});
    t.ok(notification,"Notification obj exists");
    t.ok(notification.isValid(),'valid device, valid notification');
  });
});


tap.test("\nInitialization content (all params in initialization)",function (t) {
  t.plan(7);
  var notification ,
      token = "64656a736e636f656e646b6462646b6468646c776e6464656465776465776662",
      APS = {alert:"Hello world!", sound:"bipbip.aiff",badge:3};
  t.doesNotThrow(function () {
    notification = node_apns.Notification(token, {foo: "bar", aps:APS});
    t.ok(notification,"Notification obj exists");
    t.ok(notification.isValid(),"Notification obj is valid");
    t.equal(notification.alert,APS["alert"],"Text alert is equal");
    t.equal(notification.sound,APS["sound"],"Sound is equal");
    t.equal(notification.badge,APS["badge"],"Badge is equal");
    //
    notification.badge = notification.badge+2;
    t.equal(notification.badge,APS["badge"]+2,"Badge added is equal");
  });
});

tap.test("\nInitialization content",function (t) {
  t.plan(7);
  var notification ,
      token = "64656a736e636f656e646b6462646b6468646c776e6464656465776465776662",
      APS = {alert:"Hello world!"};
  t.doesNotThrow(function () {
    notification = node_apns.Notification(token, {foo: "bar", aps:APS});
    notification.sound = "bipbip.aiff"; 
    t.ok(notification,"Notification obj exists");
    t.ok(notification.isValid(),"Notification obj is valid");
    t.equal(notification.alert,APS["alert"],"Text alert is equal");
    t.equal(notification.sound,"bipbip.aiff","Sound is equal");
    t.equal(notification.badge,undefined,"Badge is undefined");
    t.equal(notification.payload["foo"],"bar",'preserved external payload content');
  });
});

tap.test("\nEncoding with 'normalizedPayload' function",function (t) {
  t.plan(4);
  var notification ,
      token = "64656a736e636f656e646b6462646b6468646c776e6464656465776465776662",
      APS = {alert:"Hello world!", sound:"bipbip.aiff", };
  t.doesNotThrow(function () {
    notification = node_apns.Notification(token, {foo: "bar", aps:APS});
    var payload = notification.normalizedPayload();
    var supposedPayload = "{ aps: { alert: 'Hello world!', sound: 'bipbip.aiff' } }";
    t.equal(payload["aps"]["alert"],"Hello world!",'APS[\'alert\'] contains all informations');
    t.equal(payload["aps"]["sound"],"bipbip.aiff",'APS[\'sound\'] contains all informations');
    t.equal(payload["foo"],"bar",'preserved external payload content');
  });
});




//Need better coverage 
tap.test("\nEncoding and sending without throw",function (t) {
  t.plan(1);
  var notification ,
      token = "64656a736e636f656e646b6462646b6468646c776e6464656465776465776662",
      APS = {alert:"Hello world!", sound:"bipbip.aiff", };
  t.doesNotThrow(function () {
    notification = node_apns.Notification(token, {foo: "bar", aps:APS});
    //
    var payload = notification.payloadString();
    //
    payload = notification.toNetwork();
    payload = notification.toNetwork(2);
  });
});