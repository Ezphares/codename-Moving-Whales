var whales = {};
whales.loadingTimeout = false;
whales.loading = function(isLoading,message,keepAlive) {
	clearTimeout(whales.loadingTimeout);
    if(typeof isLoading === "undefined") {
        isLoading = true;
    }
    if(typeof message === "undefined") {
        message = "Loading...";
    }

    $("#navigation_loading").stop();
    if(isLoading) {
        $("#navigation_loading").show(0);
        $("#navigation_loading_text > span:first-child").html($("#navigation_loading_text > span:last-child").html());
        $("#navigation_loading_text > span:last-child").html(message);
    } else {
        $("#navigation_loading").hide(0,function(){
            $("#navigation_loading_text > span").empty();
        });
    }
	
    if(typeof keepAlive === "number") {
        whales.loadingTimeout = setTimeout("whales.loading(false)",keepAlive);
    }

    return true;
}

whales.modal = function (data,template) {
	if ( typeof data === "string" && typeof template === "undefined") {
		template = data;
		data = {};
	}
	if(typeof template !== "undefined") {
		var modalContent = tEngine.apply(data, template);
		$("#modal > .content").html(modalContent);
	}

	return $([$("#modal_wrapper")[0],$("#modal_bg")[0]]);
};


//navigation shortcuts and functions
nav = {};
nav.library_sort = "title";
nav.library_query = null;
nav.library_playlist = -1;
nav.library = function(callback){
    $("#content_wrapper").html(templates.template_library.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts

    nav.load_library(callback);
	return true;
};

nav.load_library = function(callback){
    whales.common.json("management/library/",{"sort":nav.library_sort,"query":nav.library_query,"playlist":nav.library_playlist},function(data){
        if(data.meta.errors.length == 0) {
            // no errors continue
            //process raw data
            for(var i = 0; i < data.data.library.length; i++) {
                var timeObj = secondsToTime(data.data.library[i]["duration"]);
                data.data.library[i]["duration"] = String(timeObj.hours).lpad("0",2)+
                ":"+String(timeObj.minutes).lpad("0",2)+
                ":"+String(timeObj.seconds).lpad("0",2);
            }

            $("#library_list").html(tEngine.apply(data.data.library,templates.template_track));
			$(window).trigger("library_loaded");

            if(typeof callback === "function") {
                callback(true);
            }
        } else {
			if(data.meta.type === "access_denied") {
				// if access is denied, the user is not logged in
				
				
			}
			
            if(typeof callback === "function") {
                callback(false);
            }
		}
    });
};

nav.community = function(callback){
    $("#content_wrapper").html(templates.template_community.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    whales.common.json("media/library.json",{},function(data){

        if(typeof callback === "function") {
            callback();
        }
    });

};

nav.profile = function(callback){
    $("#content_wrapper").html(templates.template_profilepage.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    whales.common.json("media/library.json",{},function(data){
        if(typeof callback === "function") {
            callback();
        }
    });

};

nav.session = function(callback){

    $("#content_wrapper").html(tEngine.apply({
        "session_btns":tEngine.apply(whales.session.pending_accepts,templates.template_session_btn)
    },templates.template_session)); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    whales.common.json("media/library.json",{},function(data){

        if(typeof callback === "function") {
            callback();
        }
    });

};

nav.settings = function(callback){
    $("#content_wrapper").html(templates.template_settings.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    whales.common.json("media/library.json",{},function(data){

        if(typeof callback === "function") {
            callback();
        }
    });

};
