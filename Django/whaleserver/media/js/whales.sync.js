/*
 * incomming events should be bound to window
 */


whales.sync = {
    debug: true,
    reconnect_attempts_on_close: 5,
    reconnect_attempt_delay: 1000,
    socket: null, // where the websocket is going to be
    events: {}, // define below
    _server: { // server information setable with whales.sync.server()
        host:window.location.hostname,
        port:"8888",
        adress:"sync/",
        protocol:"ws"
    },

    //time
    time: {
        _latencyoffset: 0, //offset set by server
        _localoffset:0, //offset calculated locally
        _localOffsetArray: [],
        _localOffsetArraySize: 3, // should be 3-10
        _latencyOffsetArray: [],
        _latencyOffsetArraySize: 3, // should be 3-10
        now: function() {
            return $.now() + this.latencyoffset();
        },
        pushLocalOffset: function(delta) {
            // push a delaytime to array and calculate average
            this._localOffsetArray.push(delta);
            while(this._localOffsetArray.length > this._localOffsetArraySize){
                this._localOffsetArray.shift();
            }
            this._localoffset = whales.common.average(this._localOffsetArray);
            return this._localoffset;
        },
        pushLatencyOffset: function(delta) {
            // push a delaytime to array and calculate average
            this._latencyOffsetArray.push(delta);
            while(this._latencyOffsetArray.length > this._latencyOffsetArraySize){
                this._latencyOffsetArray.shift();
            }
            this._latencyoffset = whales.common.average(this._latencyOffsetArray);
            return this._latencyoffset;
        },



        offset: function(milliseconds) {
            if(typeof milliseconds === "undefined") {
                milliseconds = 0;
            }
            return milliseconds + (this._latencyoffset + this._localoffset);
        },
        
        latencyoffset: function() {
            return this._latencyoffset;
        },
        localoffset: function() {
            return this._localoffset;
        }



    },
    
    

    init: function(){
        //whales.sync.start(); //moved this to window event binding user_valid
        console.log("whales.sync initialized");
    },

    start: function(){
        this.socket = new WhalesWebsocket(this.server());
        if(this.socket === null) {
            console.log("Warning, websocket not supported in this browser");
            return;
        }
        this.socket.onopen = function(event){
            var e = $.Event('sync_open',{
                originalEvent:event
            });
            $(window).trigger(e);
        };
        this.socket.onerror = function(event){
            var e = $.Event('sync_error',{
                originalEvent:event
            });
            $(window).trigger(e);
        };
        this.socket.onclose = function(event){
            var e = $.Event('sync_close',{
                originalEvent:event
            });
            $(window).trigger(e);

            // should we try to reconnect to the server?
            /* Maybe implement at a later point
            if(whales.sync.reconnect_attempts_on_close > 0) {
                whales.sync._keepAliveLoop(whales.sync.reconnect_attempts_on_close);
            }
            */
        };
        this.socket.onmessage = function(event){
            var e = $.Event('sync_raw',{
                originalEvent:event
            });
            e.data = event.data;
            $(window).trigger(e);

            var syncObj = whales.sync.decode(event.data);
            whales.sync.handle(syncObj);
        };
        return true;
    },

    stop: function() {
        if(typeof this.socket !== "undefined" && this.socket !== null){
            this.socket.close();
        }
        this.socket = null;
    },

    /* Maybe implement at a later point
    _keepAliveLoopTimeout:null,
    _keepAliveLoop: function(triesLeft){
        if(triesLeft > 0){
            if(whales.sync.socket === null ||
               whales.sync.socket.readyState > 1){ // 1 is OPEN state. everything above is closing or closed
               console.log("Reconnecting websocket." + triesLeft + " tries left..");
               whales.sync.socket = new WhalesWebsocket(whales.sync.server());
               whales.sync._keepAliveLoopTimeout = setTimeout(function(){whales.sync._keepAliveLoop(triesLeft-1)},whales.sync.reconnect_attempt_delay);
            } else {
               console.log(whales.sync.socket);
            }
        } else {
           console.log("Could not reconnect websocket");
        }
    },
     */

    /*
    * look at incomming object, handle the things that should happen automaticly
    * trigger different events, etc
    */
    handle: function(obj) {
        //console.log("recived: "+obj.type);
        obj.time.recived = whales.sync.time.now(); // important to set this

        var deltaTransferTime = obj.time.recived - obj.time.sent;
        if(obj.from !== "server") { // we do not want to calculate average from server
            whales.sync.time.pushLocalOffset(deltaTransferTime);
            
            console.group("DEBUG TIME");
            console.log("local avg: "+ ( whales.sync.time.localoffset() ));
            console.log("latency avg: "+ ( whales.sync.time.latencyoffset() ));
            console.groupEnd();
        }

        var handledCorrect = null;
        if(obj.type in this.handlers) {
            handledCorrect = this.handlers[obj.type](obj);
        } 
        if (handledCorrect === false || handledCorrect === null){
            var e = $.Event('sync_'+obj.type,{
                syncObject:obj
            });
            console.log("Triggering window event: sync_"+obj.type);
            $(window).trigger(e);
        }
    },

    handlers: {
        ping: function (obj) {
            obj = whales.sync.validatedSyncObject(obj);
            //pong back
            obj.type = "pong"; // change object type to pong
            if(obj.from === "server") {
                obj.payload.client = whales.common.readcsrf();
            }
            obj.time.parsed = whales.sync.time.now();
            whales.sync.sendObject(obj);
            return true;
        },
        synctime: function(obj) {
            whales.sync.time._latencyoffset = (obj.payload.settime - $.now());
            console.log("STOP, SYNCTIME - can't touch this! (new offset is "+whales.sync.time.latencyoffset()+" ms)");
        }
    },

    send: function(data) {
        if(typeof data === "object"){
            return whales.sync.sendObject(data);
        }else {
            return whales.sync.sendRaw(data);
        }
    },
    
    sendRaw: function (raw) {
        return whales.sync.socket.send(raw);
    },

    sendObject: function(obj) {
        if(typeof obj === "undefined") throw "sendObject takes exactly 1 argument";
        obj.time.sent = whales.sync.time.now();
        return whales.sync.sendRaw(whales.sync.encode(obj));
    },

    decode: function(raw) {
        var object = null;
        try {
            object = JSON.parse(raw);
        } catch (exception) {
            console.log("could not decode json. Invalid format: "+raw);
            throw exception;
            return object;
        }
        return object;
    },

    encode: function(syncObject) {
        return JSON.stringify(syncObject);
    },

    validatedSyncObject: function (syncObject) {
        if (syncObject.payload === null) syncObject.payload = {};
        if (syncObject.time === null) throw "syncObject is missing time";
        return syncObject;
    },

    server: function(host,port,adress,protocol) {
        if(typeof host !== "undefined") {
            this._server.host = host;
        }
        if(typeof port !== "undefined") {
            this._server.port = port;
        }
        if(typeof adress !== "undefined") {
            this._server.adress = adress;
        }
        if(typeof protocol !== "undefined") {
            this._server.protocol = protocol;
        }
        return this._server.protocol+"://"+this._server.host+":"+this._server.port+"/"+this._server.adress;
    }


};

$(document).ready(function(){
    console.log("whales.sync loading");
    // init could be moved
    whales.sync.init();
});

var WhalesWebsocket = function(adress) {
    if ("WebSocket" in window) {
        return new WebSocket(adress);
    } else if("MozWebSocket" in window) {
        return new MozWebSocket(adress);
    } else {
        return null;
    }
};




var SyncObjects = {};
SyncObjects.get = function(t){
    return {
        type:t,
        from:whales.common.readcsrf(),
        time:{
            created:whales.sync.time.now(),//timestamp here
            sent:null,//timestamp when sending
            parsed:null, //timestamp from server when parsed
            recived:null //timestamp from recieving client asap
        },
        payload:{}
    };
}



//bindings


$(window).bind("user_valid",function(event){
    whales.sync.start(); // when user is valid, start websocket
});
$(window).bind("user_invalid",function(event){
    whales.sync.stop(); // when user is valid, start websocket
});


/*
 * Should be moved or removed.
 * Just to illustrate sync events
 */


$(window).bind("sync_raw",function(event){
    //console.log("sync_raw catched at window");
});
$(window).bind("sync_close",function(event){
    console.log("websocket closed...");
});
$(window).bind("sync_open",function(event){
    console.log("websocket open...");
});
