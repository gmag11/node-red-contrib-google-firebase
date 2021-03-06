module.exports = function (RED) {
        var firebase = require('firebase');
        var events = require("events");
        var path = require("path");
        var https = require("follow-redirects").https;
        var urllib = require("url");

        var connectionPool = function () {
        var connections = [];
        var isInitialized = false;
        var mainApp = {};

        return {
                get: function (config, configNodeID) {
                        if (isInitialized) {
                                return mainApp;
                        }

                        isInitialized = true;
                        var _emitter = new events.EventEmitter();

                        var _emit = function (a, b) {
                                if (this.lastEvent == a && this.lastEventData == b) {
                                        return;
                                }
                                this.lastEvent = a;
                                this.lastEventData = b;

                                _emitter.emit(a, b)
                        };

                        mainApp = {
                                fbApp: firebase.initializeApp(config),
                                on: function (a, b) { _emitter.on(a, b); },
                                once: function (a, b) { _emitter.once(a, b); },
                        };
                        return mainApp;
                },
        }
        } ();


        function RemoteServerNode(n) {
                RED.nodes.createNode(this, n);

                this.databaseUrl = "https://" + n.databaseUrl + ".firebaseio.com";
                this.authDomain =  "https://" + n.authDomain + ".firebaseapp.com";
                this.apiKey = n.apiKey;
                this.projectId = n.authDomain;
                this.storageBucket = n.authDomain + ".appspot.com";
                this.messagingSenderId = n.senderId;
                this.email = n.email;
                this.password = n.password;

                var node = this;

                var closeSession = function() {
                        firebase.auth().signOut().then(function() {
                                node.log("Session closed Succesfull...")
                        }, function(error) {
                                node.error("Error closing session...")
                        });
                }

                if (this.databaseUrl) {
                        var config = {
                                apiKey: this.apiKey,
                                authDomain: this.authDomain,
                                databaseURL: this.databaseUrl,
                                projectId: this.projectId,
                                storageBucket: this.storageBucket,
                                messagingSenderId: this.messagingSenderId
                        };
                        this.fbConfig = connectionPool.get(config, this.id);
                } else {
                        this.error('Firebase Not configured!!');
                }
        }

        RED.nodes.registerType("google-firebase-config", RemoteServerNode);
};
