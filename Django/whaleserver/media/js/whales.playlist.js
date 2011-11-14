whales.playlist = {}

whales.playlist.init = function() {
	whales.playlist.is_flyout = false
	
	$(window).bind('library_loaded', function(event) {
		whales.playlist.is_flyout = false;
		whales.playlist.pinned = false
		whales.playlist.get();
	});
	
	$('.playlist_wrapper').live('click', function(event){
		console.log("test");
		var playlist_id = $(this).data('playlist_id');
		if (playlist_id !== -1){
			nav.library_playlist = playlist_id;
			nav.load_library();
			nav.librart_playlist = -1;
		} else {
			whales.modal({}, templates.template_newplaylist).show();
			$('.btn_playlist_create').bind('click', function(event) {
				whales.playlist.create($('#playlist_name').val());
				whales.modal().hide();
			});			
		}
	});
	
	$('#btn_playlist').live('click', function(event) {
		whales.playlist.pinned = !whales.playlist.pinned;
		whales.playlist.flyout(whales.playlist.pinned);
	});
	
	$('.playlist_wrapper').live('drop', function(event) {
		var playlist_id = $(this).data('playlist_id');
		var dt = event.originalEvent.dataTransfer;
		if (playlist_id != -1) {
			whales.playlist.addsong(playlist_id, dt.getData('Text'));
		} else {
			whales.modal({}, templates.template_newplaylist).show();
			$('.btn_playlist_create').bind('click', function(event) {
				whales.playlist.addsong(playlist_id, dt.getData('Text'), $('#playlist_name').val());
				whales.modal().hide();
			});
		}
		return false;
	}).live('dragenter dragover dragleave', function(event) {
		return false;
	});
	
	$('.btn_playlist_cancel').live('click', function(event) {
		whales.modal().hide();
	});
};

whales.playlist.flyout = function(enable) {
	if (typeof enable === 'undefined') {
		enable = !whales.playlist.is_flyout;
	}
		
	if (whales.playlist.pinned && !enable) {
		enable = true;
	}
	
	console.log(enable);
	var width = 0;
	if (enable === true) {
		width = 200;
	}

	whales.playlist.is_flyout = enable;
	
	$('#library_flyout').stop().animate({'width': width}, 250);

};

whales.playlist.get = function() {
	whales.common.json('/management/getplaylists/', {}, function(data) {
		if (data.meta.errors.length === 0) {
			var list = data.data.playlists;
			console.log(list);
			list.push({id: -1, name: '&lt CREATE NEW PLAYLIST &gt'});
			$('#playlists').html(tEngine.apply(list, templates.template_playlist));
		}
	});
};

/* ANDERS KODE */

whales.playlist.create = function(title){

	if(title != ""){
		var args = { type:'POST', url: '/management/createplaylist', datatype: 'json', data: {title:title} };
		$.ajax(args);
	}
	
	return false; // I sure hope this overwrites default HTML button behavior so the user won't create the same playlist twice with one click!!
};

	
whales.playlist.remove = function(id){

	if(id != ""){
		var args = { 
			type: 'POST', 
			url: '/management/deleteplaylist', 
			datatype: 'json', 
			data: {id: id} 
		};
		$.ajax(args);
	}
		
	return false; // To ensure that the user does not try to delete the playlist twice with one click
};

whales.playlist.addsong = function(playlist_id, track_id){ //TODO: Take a playlist title as well, for adding to new playlists

	if(track_id && playlist_id != ""){	// TODO: track_id må gerne være 0, wtf?
		var args = {
			type: 'POST',
			url: '/management/addsongtoplaylist',
			datatype: 'json',
			data: {playlist_id: playlist_id, track_id: track_id}
			};
		$.ajax(args);
	}
		
	else {
		throw new Exception("Bad input");
	}
	
	return false;
};

whales.playlist.removesong = function(playlist_id, track_id){
	
	if(track_id && playlist_id != ""){		
		var args = { 
			type: 'POST', 
			url: '/management/deletesongfromplaylist', 
			datatype: 'json', 
			data: {
				playlist_id: playlist_id, 
				track_id: track_id
			} 
		};
		$.ajax(args);
	}

return false;
};

whales.playlist.init();
