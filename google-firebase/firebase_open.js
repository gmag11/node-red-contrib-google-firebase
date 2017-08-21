module.exports = function(RED) {
      var firebase = require('firebase');
      var Utils = require('./utils/utils');
	  var result = false;

      function FirebaseOpen(config) {
            RED.nodes.createNode(this, config);
            var node = this;

            var open = function() {
                  firebase.auth().signInWithEmailAndPassword(config.email, config.password).then(function() {
                        node.log("Session Opened...");
                        node.send({"auth": true});
                        node.status({ fill: "green", shape: "ring", text: "Auth at " + Utils.getTime()});
						result = true;
                  }, function(error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;

                        node.error("Errors Open Auth : " + errorCode + " " + errorMessage);
                        node.send({"auth": false});
                        node.status({ fill: "red", shape: "ring", text: "Auth FAIL!" });
                  });
            }
            node.on('input', function(msg) {
                  open();
				  payload = "Auth at " + Utils.getTime();
				  msg.payload = payload;
				  msg.auth = result;
            });
      }
      RED.nodes.registerType("google-firebase-open", FirebaseOpen);
}
