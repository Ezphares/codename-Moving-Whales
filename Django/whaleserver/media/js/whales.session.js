
whales.session = {

    pending_accepts: [],
    pending_invites: [],

    errorHandlers: {
        user_does_not_exist: function(syncObject) {
            console.log(syncObject);
        },
        user_not_online: function(syncObject) {
            whales.loading(true,"User \""+syncObject.payload.data+"\" not online",1000);
        }
    },

    successHandlers: {
        incomming_invite: function(syncObject) {
            whales.session.pending_accepts.push(syncObject.payload);
            whales.loading(true,"Invite from "+syncObject.payload.data,1000);
            if($("#btn_session").hasClass("selected")) {
                nav.session(function(){
                    whales.loading(false);
                });
            }
        },
        incomming_accept: function(syncObject) {
            whales.common.remove(syncObject.payload.data,whales.session.pending_invites);
        },
        request_pending: function(syncObject) {
            whales.session.pending_invites.push(syncObject.payload.data);
            whales.loading(true,"Invite sent to "+syncObject.payload.data,800);
        }
    },

    init: function() {
        $(window).bind("sync_session",function(e){
            var p = e.syncObject;
            if (p.payload.type === "success") {
                if(p.payload.handler in whales.session.successHandlers) {
                    whales.session.successHandlers[p.payload.handler](p);
                } else {
                    console.log("Could not find matching success handler");
                }
            } else if(p.payload.type === "error") {
                if(p.payload.handler in whales.session.errorHandlers) {
                    whales.session.errorHandlers[p.payload.handler](p);
                } else {
                    console.group("Could not find matching error handler");
                    console.log(p);
                    console.groupEnd();
                }
            }
        });
    },

    invite: function(username) {
        var invitePackage = SyncObjects.get("session");
        invitePackage.payload = {
            type:"invite",
            invite:username,
            message:"Will you join my session?"
        };
        whales.sync.send(invitePackage);
    },

    accept: function(username) {
        var acceptPackage = SyncObjects.get("session");
        acceptPackage.payload = {
            type:"accept",
            accept:username
        };
        whales.session.remove_payload_by_username(username);
        whales.loading(true,"Accepted session with "+username, 1000);
        if($("#btn_session").hasClass("selected")) {
            nav.session(function(){
                whales.loading(false);
            });
        }
        whales.sync.send(acceptPackage);
    },

    reject: function(username) {
        whales.session.remove_payload_by_username(username);
        whales.loading(true,"Rejected session with "+username, 1000);
        if($("#btn_session").hasClass("selected")) {
            nav.session(function(){
                whales.loading(false);
            });
        }
    },

    leave: function() {
        var acceptPackage = SyncObjects.get("session");
        acceptPackage.payload = {
            type:"leave"
        };
        whales.sync.send(acceptPackage);
    },

    remove_payload_by_username: function(username) {
        for (var i = 0; i < whales.session.pending_accepts.length; i++) {
            var obj = whales.session.pending_accepts[i];
            if(obj.data === username) {
                whales.common.remove(obj,whales.session.pending_accepts);
            }
        }
    }
};
whales.session.init();


