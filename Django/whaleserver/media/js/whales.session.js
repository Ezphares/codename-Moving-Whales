
whales.session = {

    invites: [],

    errorHandlers: {
        user_does_not_exist: function(syncObject) {
            console.log(syncObject);
        }
    },

    successHandlers: {
        incomming_invite: function(syncObject) {
            console.log("invite from "+syncObject.payload.data);
        },
        incomming_accept: function(syncObject) {
            whales.common.remove(syncObject.payload.data,whales.session.invites);
        },
        request_pending: function(syncObject) {
            whales.session.invites.push(syncObject.payload.data);
            console.log("Request to "+syncObject.payload.data+" pending");
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
                    console.log("Could not find matching error handler");
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
        whales.sync.send(acceptPackage);
    },

    leave: function() {
        var acceptPackage = SyncObjects.get("session");
        acceptPackage.payload = {
            type:"leave"
        };
        whales.sync.send(acceptPackage);
    }
};
whales.session.init();


