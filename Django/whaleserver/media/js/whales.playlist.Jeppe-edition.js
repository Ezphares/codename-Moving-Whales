//whales.common.json(url, data, callback)
// url = url til at pege på mit view som string
// data = {id: playlist_id}
// callback anonym function som styrer hvad der sker når vi får svar

// TODO: Skriv noget til brugeren :D Print "sup son \(=/)/"

whales.playlist.create = function(title){

	if(title != ""){
		
		var args = { type:'POST', url: '/management/createplaylist', datatype: 'json', data = {title:title} };
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
			data = {id: id} 
		};
		$.ajax(args);
	}
		
	return false; // To ensure that the user does not try to delete the playlist twice with one click
};

		
whales.playlist.addsong = function(playlist_id, track_id){

	if(track_id && playlist_id != ""){	
		var args = {
			type: 'POST',
			url: '/management/addsongtoplaylist',
			datatype: 'json',
			data = {playlist_id: playlist_id, track_id: track_id}
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
			data = {playlist_id: playlist_id, 
			track_id: track_id} 
		};
		$.ajax(args);
	}

return false;
};