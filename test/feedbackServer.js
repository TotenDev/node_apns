//
// feedbackServer.js — node_apns
// today is 12/03/12, it is now 06:05 PM
// created by Thierry Passeron
// see LICENSE for details.
//
  
var node_apns = require("./../index.js"),
    server_instance = null;

function connect() {
  if (server_instance) { server_instance.disconnect(); }
  server_instance = node_apns.Feedback({cert:"djkdhjdj", key:"jijk.pem"});
  server_instance.on('device', function(time, token) {
      console.log('Token', token, "is not responding since", new Date(time * 1000));
  });
  server_instance.on('connected', function () { 
      console.log('Connected!'); 
  });
  server_instance.on('error', function (err) { 
      console.log('Server errored ',err);
      console.log('Server will terminate');
  });
  server_instance.on('end', function () { 
      console.log('Done!'); 
//      console.log("Restarting server in 2 secs");
//      setTimeout(function () {  connect();  },2000);
  });
}

connect();