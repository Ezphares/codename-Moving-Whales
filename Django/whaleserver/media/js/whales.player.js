var audio;
var canvas;
$(function(){
	audio = new buzz.sound("/media/a-quiet-party.ogg");
	
	console.log(audio);

	$("#btn_player_play").click(function(e){
		audio.play();
		console.log("doing this!");
	});
	/*$("#btn_player_pause").click(function(e){
		audio.pause();
	});*/
	$("#btn_player_stop").click(function(e){
		audio.pause();
		audio.setTime(0);
		console.log(audio.getTime());
	});
	

	canvas = $("#player_canvas");
	var grad_left = canvas.gradient({
		x1: 0, y1: 0,
		x2: 0, y2: 100,
		c1: "#555", s1: 0,
		c2: "#444", s2: 1
	});
	var grad_right = canvas.gradient({
		x1: 0, y1: 0,
		x2: 0, y2: 100,
		c1: "#eee", s1: 0,
		c2: "#ddd", s2: 1
	});
	
	canvas.drawRect({
		strokeWidth: 0,
		x:400, y:50,
		height:100,
		width:800,
		fillStyle: grad_right
	});
	
	canvas.bind("mousedown.canvas",function(event){
		event.preventDefault();
		event.stopPropagation();
		var wasPaused = audio.isPaused();
		var initialCoords = {x:event.clientX,y:event.clientY};
		var initialOffset = {x:event.offsetX,y:event.offsetY};
		if(!wasPaused) audio.pause();
		audio.setTime(Math.max(0,Math.min(audio.getDuration()*( (initialOffset.x - (initialCoords.x - event.clientX)) / 800),800)));
		$(window).bind("mousemove.canvas",function(event){
			event.preventDefault();
			event.stopPropagation();
			audio.setTime(Math.max(0,Math.min(audio.getDuration()*( (initialOffset.x - (initialCoords.x - event.clientX)) / 800),800)));
		});
		$(window).bind("mouseup.canvas",function(event){
			event.preventDefault();
			event.stopPropagation();
			if(!wasPaused) audio.play();
			canvas.unbind("mouseup.canvas");
			$(window).unbind("mouseup.canvas mousemove.canvas");
		});
	});
	

	
	
	
	
	audio.bind( "timeupdate", function(e) {
		
		var percent = this.getTime()/this.getDuration();
		$("#debug_currentTime").html(this.getTime());
		$("#debug_currentTimePercent").html(percent);
       
       
		canvas.clearCanvas();
       
		canvas.drawRect({
	   		strokeWidth: 0,
			x:percent * 800 / 2, y:50,
	   		height:100,
	   		width:percent * 800,
	   		fillStyle: grad_left
	   	});
       
		canvas.drawRect({
	   		strokeWidth: 0,
			x:800 - ((1-percent) * 800) / 2, y:50,
	   		height:100,
	   		width:(1-percent) * 800,
	   		fillStyle: grad_right
	   	});
		
		$("canvas").drawText({
			  fillStyle: "#9df",
			  strokeStyle: "#111",
			  strokeWidth: 2,
			  text: "Playing some kind of song",
			  align: "center",
			  baseline: "middle",
			  font: "normal 20pt Arial",
			  x: 400,
			  y: 50,
		});
       
    });

	audio.bind("durationchange",function(e){
	       $("#debug_duration").html(this.getDuration());
	       

	   	var seekable = audio.getSeekable();
		console.info("Seekable:");
		for(var i in seekable) {
		    console.log(seekable[i]);
		}
	});
	
	
	
	
	

	
	
	
});
