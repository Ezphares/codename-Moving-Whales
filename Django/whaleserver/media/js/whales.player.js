$(document).ready(function(){
	//soundManager.debugFlash = true			
	soundManager.url = '/media/swf/';
	soundManager.flashVersion = 9; // optional: shiny features (default = 8)
	soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
	
	soundManager.onready(function() {
		playlist = new Array();
					
					function createTrack(cId,cUrl){
						playlist.push(
							soundManager.createSound({
								id: cId,
								url: cUrl,
								autoLoad: true,
								autoPlay: false,
								stream: true,
								onload: function(){
										//alert('The sound '+this.sID+' loaded!');
									},
								whileloading: function (){
											var nSec = Math.floor(this.duration/1000),
			      								    min = Math.floor(nSec/60),
			      								    sec = nSec-(min*60);
										},
								whileplaying: function (){
											var nSec = Math.floor(this.position/1000),
			      								    min = Math.floor(nSec/60),
			      								    sec = nSec-(min*60),
										 	    width = Math.floor((this.position/this.duration)*100);
											//$("#filler").css("width",width);
											$("#filler").attr("value",width);
											//soundManager._writeDebug("TEEEST: "+$("#filler").attr("value"));
										},
								volume: 50
							})
						);
					}
					
					function procentageToMilliSec(procentage,SMObject){
						return (SMObject.duration/100)*procentage;
					}
					
					createTrack('test','media/a-quiet-party.ogg');
					
					$("#btn_player_play").click(function (){
						playlist[0].togglePause();
						/*
						if(!playlist[0].paused){
							$(this).addClass("selected");
						} else {	
							$(this).removeClass("selected");
						}*/
					});
					
					$("#btn_player_stop").click(function (){
						playlist[0].setPosition(1);
						//playlist[0].stop();
						console.log(playlist[0]);
					});
	});
});
