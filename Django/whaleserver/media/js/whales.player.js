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
	console.log("SoundManager ready");
});



soundManager.ontimeout(function() {
    console.log("SM2 could not start. Flash blocked, missing or security error? Complain, etc.?");
});

whales.player.createNewSoundManagerObject = function(track) {
    soundManager.createSound({
        id: 'current',
        url: track,
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
}

whales.player.load = function(file,direct) {
	if(direct !== true) direct = false;
    var path = "http://"+location.hostname+":8888/file/";
	var fullpath = (direct) ? file : path+file;

	if(whales.player.sound !== undefined) {
    	whales.player.sound.unload();
		whales.player.sound.load({
		    url:fullpath
		});
	} else {
		whales.player.createNewSoundManagerObject(fullpath);
	}
};

whales.player.play = function(event){
    if(!!event) event.preventDefault();

    if(!!whales.player.sound && whales.player.sound.paused) {
        whales.player.sound.resume();
        $("#btn_player_play > span").removeClass("icon_play").addClass("icon_pause");
    } else if(!!whales.player.sound && whales.player.sound.playState === 1) {
        whales.player.sound.pause();
        $("#btn_player_play > span").removeClass("icon_pause").addClass("icon_play");
    } else if(!!whales.player.sound){
        whales.player.sound.play();
        $("#btn_player_play > span").removeClass("icon_play").addClass("icon_pause");
    } else {
        console.log("whales.player.sound was not defined!");
    }
    $("#btn_player_play").removeClass("selected");
	whales.player.send_sync();
    return false;
};

whales.player.stop = function(event){
    if(!!event) event.preventDefault();

    if(!!whales.player.sound) {
        whales.player.sound.stop();
        whales.player.sound.setPosition(0);
        whales.player.tick(whales.player.sound);
    }
    $("#btn_player_play > span").removeClass("icon_pause").addClass("icon_play");
    $("#btn_player_stop").removeClass("selected");
	whales.player.send_sync();
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
		whales.player.send_sync();
    });
};

whales.player.canvasStyles = {};
whales.player.canvasStyles.gradientLeft;
whales.player.canvasStyles.gradientRight;

whales.player.send_sync = function(){
	if(whales.player.sound !== undefined) {
        var syncPackage = SyncObjects.get("player");
        syncPackage.payload.url = whales.player.sound.url;
        syncPackage.payload.position = whales.player.sound.position;
		syncPackage.payload.paused = whales.player.sound.paused;
		syncPackage.payload.playState = whales.player.sound.playState;

        whales.sync.send(syncPackage);
	}
};



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

    canvas.drawText({
        fillStyle: "#222",
        strokeStyle: "#fff",
        strokeWidth: 3,
        text: "Drag tracks from your library here to play." ,
        align: "center",
        baseline: "middle",
        font: "normal 12pt Arial",
        x: 350,
        y: 35
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


    //debug
    $(".track").bind("click", function(event){
        var trackpath = $(this).data("path");
        console.log("trackpath");
        whales.player.sound.stop();
    });


    $(window).bind("sync_player",function(event){
		var p = event.syncObject.payload;
		console.log(p);
        if(event.syncObject.payload.url !== undefined) {
			if(whales.player.sound === undefined || p.url != whales.player.sound.url) {
				whales.player.load(p.url,true); // the true means that we want to set the url directly
			}

			if(p.playState === 1) {
				whales.player.sound.play();
			} else if (p.playState === 0) {
				whales.player.sound.stop();
			}
			if(p.paused) {
				whales.player.sound.pause();
			}
			whales.player.sound.setPosition(p.position);

        } else {
			console.log("No payload");
        }
    });
});


