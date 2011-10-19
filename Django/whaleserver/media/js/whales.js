var whales = {};
whales.loading = function(isLoading,message) {
    if(typeof isLoading === "undefined") {
        isLoading = true;
    }
    if(typeof message === "undefined") {
        message = "Loading...";
    }

    $("#navigation_loading").stop();
    if(isLoading) {
        $("#navigation_loading").fadeIn(200);
        $("#navigation_loading_text > span:first-child").html($("#navigation_loading_text > span:last-child").html());
        $("#navigation_loading_text > span:last-child").html(message);
    } else {
        $("#navigation_loading").fadeOut(600,function(){
            $("#navigation_loading_text > span").empty();
        });
    }

    return true;
}

whales.modal = function (data,template) {
	var modalContent = tEngine.apply(data, template);
	$("#modal > .content").html(modalContent);
	return $("#modal_wrapper");
};


//navigation shortcuts and functions
nav = {};
nav.library = function(callback){
    $("#content_wrapper").html(templates.template_library.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts
    $.getJSON("media/library.json",{},function(data){
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

            if(typeof callback === "function") {
                callback();
            }
        } else {
			console.log("Returned json contained an error message");
		}
    });
};

nav.community = function(callback){
    $("#content_wrapper").html(templates.template_community.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    $.getJSON("media/library.json",{},function(data){

        if(typeof callback === "function") {
            callback();
        }
    });

};

nav.profile = function(callback){
    $("#content_wrapper").html(templates.template_profilepage.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    $.getJSON("media/library.json",{},function(data){

        if(typeof callback === "function") {
            callback();
        }
    });

};

nav.session = function(callback){
    $("#content_wrapper").html(templates.template_session.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    $.getJSON("media/library.json",{},function(data){

        if(typeof callback === "function") {
            callback();
        }
    });

};

nav.settings = function(callback){
    $("#content_wrapper").html(templates.template_settings.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts


    // fill community here
    $.getJSON("media/library.json",{},function(data){

        if(typeof callback === "function") {
            callback();
        }
    });

};
