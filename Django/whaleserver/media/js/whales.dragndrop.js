if(typeof whales === "undefined"){	
	console.log("whales not loaded before whales.dragndrop");
}

whales.dragndrop = {};

whales.dragndrop.init = function(){
	
	$(window).bind("library_loaded", function(event){
		$('#library_list > .track').attr("draggable", "true").bind("dragstart", function(event){
			var dt = event.originalEvent.dataTransfer;
			dt.setData("Text", $(this).data('link_id').toString());
			return true;
		}).bind("dragend", function(event){
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
};

whales.dragndrop.init();
