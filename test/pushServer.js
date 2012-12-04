//
// pushServer.js — node_apns
// today is 12/04/12, it is now 01:05 AM
// created by Thierry Passeron
// see LICENSE for details.
//
  
var node_apns = require("./../index.js"),
    server_instance = null;

function connect() {
  if (server_instance) { server_instance.disconnect(); }
  server_instance = node_apns.Push({cert:"djkdhjdj", key:"jijk.pem"});
  server_instance.on('sent', function(notification) { console.log("Sent",notification); });
  server_instance.on('notificationError', function(notification) { });
  server_instance.on('error', function (err) { 
      console.log('Server errored ',err);
      console.log('Server will terminate');
  });
  server_instance.on('end', function () { 
      console.log('Done!'); 
//      console.log("Restarting server in 2 secs");
//      setTimeout(function () {  connect();  },2000);
  });
  var Notification = node_apns.Notification,
      n = Notification("abcdefghabcdefgh", {foo: "bar", aps:{"alert":"Hello world!", "sound":"default"}});
  server_instance.sendNotification(n,function (not) { console.log("Sent",not); });
}

connect();