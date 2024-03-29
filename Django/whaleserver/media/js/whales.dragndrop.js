if(typeof whales === "undefined"){	
	console.log("whales not loaded before whales.dragndrop");
}

whales.dragndrop = {};

whales.dragndrop.init = function(){
	
	$(window).bind("library_loaded", function(event){
		$('#library_list > .track').attr("draggable", "true").bind("dragstart", function(event){
			var dt = event.originalEvent.dataTransfer;
			dt.setData("Text", $(this).data('link_id').toString());
			//whales.playlist.flyout(true);
			return true;
		}).bind("dragend", function(event){
			//whales.playlist.flyout(false);
			return false;
		});
	});

	$('#sidebar_playlist > .sidebar_pane').bind("drop", function(event){
		var dt = event.originalEvent.dataTransfer;
		console.log(dt);
		var msg = SyncObjects.get("addtrack");
		msg.payload = {type: 'addtrack', link_id: dt.getData('Text')};
		whales.sync.send(msg);
		return false;
	}).bind("dragenter dragover dragleave", function(event){
		return false;
	});

	$('#player_wrapper').bind("drop", function(event){
		var dt = event.originalEvent.dataTransfer;
		whales.player.stop();
                var path = $(".track[data-link_id="+dt.getData('Text')+"]").data("path");
                whales.player.load(path);
                whales.player.play();
		return false;
	}).bind("dragenter dragover dragleave", function(event){
		return false;
	});
};

whales.dragndrop.init();
