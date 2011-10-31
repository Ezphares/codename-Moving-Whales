
whales.chat = {
    init: function(){
        if(typeof whales.sync === "undefined") throw "whales.sync not loaded prior to whales.chat";
        //event bindings
        $("#sidebar_chat_input").live("keydown",function(event){
            if(event.keyCode === 13 && !event.shiftKey) {
                var msg = $(this).val();
                $(this).val("");
                whales.chat.send(msg);
            }
        });


        //chat clear
        $("#sidebar_chat .sidebar_pane").empty();

        $(window).bind("sync_chat",function(event){
            console.log(event);
            if(event.syncObject.payload.message.length > 0) {
                $("#sidebar_chat .sidebar_pane").append("<div class=\"msg\">"+event.syncObject.payload.message+"</div>");
                $("#sidebar_chat .sidebar_pane").stop().animate({ scrollTop: $("#sidebar_chat .sidebar_pane")[0].scrollHeight }, 500);
            } else {
            }
        });
    },


    send: function(msg){
        var chatPackage = SyncObjects.get("chat");
        chatPackage.payload.message = msg;
        whales.sync.send(chatPackage);
    }
};








whales.chat.init();