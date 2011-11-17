whales.player = {};
var canvas;
whales.player.sound;

soundManager.url = '/media/swf/';
soundManager.flashVersion = 9; // optional: shiny features (default = 8)
soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
soundManager.waitForWindowLoad = true;
soundManager.debugMode = false;
soundManager.defaultOptions.multiShot= false;
soundManager.onready(function() {

    soundManager.createSound({
        id: 'current',
        url: 'http://dl.dropbox.com/u/1313566/sound/2.mp3',
        autoLoad: true,
        autoPlay: false,
        onload: function() {

        },
        whileplaying: function() {
            whales.player.tick(this);
        },
        onid3: function(){
            console.log(this.id3);
        },
        volume: 100
    });

    whales.player.sound = soundManager.getSoundById("current");
});

soundManager.ontimeout(function() {
    console.log("SM2 could not start. Flash blocked, missing or security error? Complain, etc.?");
});


whales.player.play = function(event){
    event.preventDefault();
    if(whales.player.sound.paused) {
        whales.player.sound.resume();
        $("#btn_player_play > span").removeClass("icon_play").addClass("icon_pause");
    } else if(whales.player.sound.playState === 1) {
        whales.player.sound.pause();
        $("#btn_player_play > span").removeClass("icon_pause").addClass("icon_play");
    } else {
        whales.player.sound.play();
        $("#btn_player_play > span").removeClass("icon_play").addClass("icon_pause");
    }
    $("#btn_player_play").removeClass("selected");
    return false;
};

whales.player.stop = function(event){
    event.preventDefault();
    whales.player.sound.stop();
    whales.player.sound.setPosition(0);
    whales.player.tick(whales.player.sound);
    whales.player.sound.unload();
    $("#btn_player_play > span").removeClass("icon_pause").addClass("icon_play");
    $("#btn_player_stop").removeClass("selected");
    return false;
};
whales.player.next = function(event){
    console.log("Not yet implemented");
};
whales.player.prev = function(event){
    console.log("Not yet implemented");
};

whales.player.tick = function(song){
    //triggered on player tick (poition changed)
    var percent = song.position/song.duration;


    //canvas.clearCanvas();
    canvas.drawRect({
        strokeWidth: 0,
        x:(percent * 700) / 2,
        y:35,
        height:70,
        width:percent * 700,
        fillStyle: whales.player.canvasStyles.gradientLeft
    });

    canvas.drawRect({
        strokeWidth: 0,
        x:700 - ((1-percent) * 700) / 2,
        y:35,
        height:70,
        width:(1-percent) * 700,
        fillStyle: whales.player.canvasStyles.gradientRight
    });
    function npad(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }
        return str;
    }
    var raw = song.position/1000;
    var seconds = parseInt(raw % 60);
    var minutes = parseInt(raw / 60) % 60;
    var hours = parseInt(minutes / 60);

    canvas.drawText({
        fillStyle: "#222",
        strokeStyle: "#fff",
        strokeWidth: 3,
        text: npad(hours,2)+":"+npad(minutes,2)+":"+npad(seconds,2) ,
        align: "center",
        baseline: "middle",
        font: "normal 14pt Arial",
        x: 350,
        y: 35
    });

    canvas.drawArc({
        fillStyle: "#a33",
        x:(percent * 700) / 2,
        y:35,
        radius: 5,
        start: 0,
        end: 2*Math.PI,
        ccw: true,
        inDegrees: false
    });
    canvas.drawArc({
        fillStyle: "#33a",
        x:700 - ((1-percent) * 700) / 2,
        y:35,
        radius: 5,
        start: 0,
        end: 2*Math.PI,
        ccw: true,
        inDegrees: false
    });
};


whales.player.mousedown = function(event){
    //triggered on mousedown on canvas
    event.preventDefault();
    event.stopPropagation();
    var wasPaused = whales.player.sound.paused;
    var initialCoords = {
        x:event.clientX,
        y:event.clientY
    };
    var initialOffset = {
        x:event.offsetX,
        y:event.offsetY
    };
    if(!wasPaused) whales.player.sound.pause();
    var percentageOnCanvas = Math.min(Math.max(((initialOffset.x - (initialCoords.x - event.clientX)) / 700),0),1);
    whales.player.sound.setPosition(whales.player.sound.duration*percentageOnCanvas);
    $(window).bind("mousemove.canvas",function(event){
        event.preventDefault();
        event.stopPropagation();
        var percentageOnCanvas = Math.min(Math.max(((initialOffset.x - (initialCoords.x - event.clientX)) / 700),0),1);
        whales.player.sound.setPosition(whales.player.sound.duration*percentageOnCanvas);
    });
    $(window).bind("mouseup.canvas",function(event){
        event.preventDefault();
        event.stopPropagation();
        if(!wasPaused) whales.player.sound.play();
        canvas.unbind("mouseup.canvas");
        $(window).unbind("mouseup.canvas mousemove.canvas");
    });
};

whales.player.canvasStyles = {};
whales.player.canvasStyles.gradientLeft;
whales.player.canvasStyles.gradientRight;





$(function(){
    canvas = $("#player_canvas");

    whales.player.canvasStyles.gradientLeft = canvas.gradient({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 100,
        c1: "#668",
        s1: 0,
        c2: "#556",
        s2: 1
    });
    whales.player.canvasStyles.gradientRight = canvas.gradient({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 100,
        c1: "#eef",
        s1: 0,
        c2: "#dde",
        s2: 1
    });

    canvas.drawRect({
        strokeWidth: 0,
        x:350,
        y:35,
        height:70,
        width:700,
        fillStyle: whales.player.canvasStyles.gradientRight
    });

    canvas.bind("mousedown.canvas",function(event){
        return whales.player.mousedown(event);
    });

    $("#btn_player_play").bind("click",function(event){
        return whales.player.play(event);
    });
    $("#btn_player_stop").bind("click",function(event){
        return whales.player.stop(event);
    });
    $("#btn_player_next").bind("click",function(event){
        return whales.player.next(event);
    });
    $("#btn_player_prev").bind("click",function(event){
        return whales.player.prev(event);
    });
});
