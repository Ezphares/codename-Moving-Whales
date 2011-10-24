if(typeof whales === "undefined"){
	console.log("whales not loaded before whales.upload");
}

whales.upload = {}; // base object

whales.common.noop = function(event) {
	event.stopPropagation();
	event.preventDefault();
	return event;
};

whales.upload.files = new Array();


whales.upload.drop = function(event) {
	whales.common.noop(event);
	try {
		var files = event.originalEvent.dataTransfer.files;
	} catch (e) {
		console.log(e);
		return false;
	}
	if (files.length > 0) {
		for (i = 0; i < files.length; i++) {
			whales.upload.files.push(files[i]);
		}
		$(window).trigger("filesupdated");
		
		// remove this and do it by listening to the filesupdated event on the window
		whales.upload.uploadAll();
	}
};

whales.upload.removeFile = function(index) {
	whales.upload.files.splice(index,1);
	$(window).trigger("filesupdated");
};

whales.upload.uploadAll = function() {
	if (whales.upload.files.length > 0) {
		var filesToSend = whales.upload.files;
		whales.upload.files = [];
		console.log("Beginning upload of "+filesToSend.length+" file(s)");
		whales.upload.uploadArray(filesToSend,0,function(arr){
			console.log("upload complete:");
			console.log(arr);
		});
	}
	else
	{
		console.log("No files to upload");
	}
	return false;
};
whales.upload.uploadArray = function(arr,i,callback) {
	if(typeof i !== "number") {
		if(typeof i === "function") {
			callback = i;
		}
		i = 0;
	}
	whales.loading(true,"Uploading "+arr[i].name);
	whales.upload.send(arr[i],function(file,xhr) {
		console.log("uploaded "+file.name);
		if(i < arr.length-1) {
			whales.upload.uploadArray(arr,i+1,callback);
		} else {
			whales.loading(true,"Upload of "+arr.length+" file(s) complete",2000);
			if(typeof callback === "function") {
				callback(arr);
			}
		}
	});
};

whales.upload.send = function(file,callback) {
	xhr = new XMLHttpRequest();
	xhr.open("POST", "/management/sendfile/", true);
	xhr.upload.addEventListener("progress", whales.upload.progress, false);
	
	xhr.onreadystatechange = function(event) {
		if (event.target.readyState == 4) {
			if(typeof callback === "function") {
				callback(file,xhr);
			}
		}
	};
	xhr.setRequestHeader("X-CSRFToken", document.getElementsByName('csrfmiddlewaretoken')[0].value);
	xhr.setRequestHeader("Content-type", "application/octet-stream");
	xhr.setRequestHeader("X-File-Name", file.name);
	console.log("sending "+file.name);
	xhr.send(file);
}

whales.upload.progress = function (event) {
	var percent = event.loaded / event.total * 100;
	console.log("uploading... ("+percent.toFixed(2)+"%)");
}

$(function(){
	$("#library_list").live("dragenter", whales.common.noop, false);
	$("#library_list").live("dragexit", whales.common.noop, false);
	$("#library_list").live("dragover", whales.common.noop, false);
	$("#library_list").live("drop", whales.upload.drop, false);
});






