module.exports = function (RED) {
        var firebase = require('firebase');
        var Utils = require('./utils/utils');

        function FirebaseOnce(n) {
                RED.nodes.createNode(this, n);

                this.firebaseConfig = RED.nodes.getNode(n.firebaseConfig);
                this.childpath = n.childpath;
                this.eventType = n.eventType;
                this.activeRequests = [];
                this.ready = false;
                var node = this;

                var QueryOnce = function() {
                        firebase.database().ref(node.childpath).once(node.eventType.toString()).then(function (snapshot) {
                                var msg = {};

                                msg.payload = snapshot.val();
                                node.send(msg);
                                node.status({ fill: "green", shape: "ring", text: "Received Data(Once) at " + Utils.getTime() });
                        });
                }

                if (!node.firebaseConfig) {
                        node.status({ fill: "red", shape: "ring", text: "invalid credentials" })
                        node.error('You need to setup Firebase credentials!');
                        return;
                }

                node.status({ fill: "green", shape: "ring", text: "Connected" });

                node.on('input', function(msg) {
                        if (!node.firebaseConfig.fbConfig.fbApp) {
                                return;
                        }
                        QueryOnce();
                });

                node.validEventTypes = {
                        "value": true,
                        "child_added": true,
                        "child_changed": true,
                        "chiled_removed": true,
                        "child_moved": true
                };
        }
        RED.nodes.registerType('google.firebase.once', FirebaseOnce);
};
