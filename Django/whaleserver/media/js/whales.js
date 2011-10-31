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


whales.common = {};
whales.common.login = function(){
	whales.modal({}, templates.template_form_login).show()
};

whales.common.json = function(url,data,callback) {
	if(typeof(url) !== "string") {
		throw new Exception("wtf!");
	}
	if(typeof(callback) === "undefined" && typeof(data) === "function"){
		callback = data;
		data = {};
	}
	
	return $.ajax({
		url: url,
		dataType: 'json',
		type: 'POST',
		data: data,
		headers: {
			'X-CSRFToken' : $('*[name=csrfmiddlewaretoken]').val()
		},
		success: function(ret){
			handled = false;
			if(ret.meta.errors.length > 0)	{
				switch(ret.meta.type){
					// handle common errors here. (not logged in, could not retrieve data, etc)
					case "access_denied":
						console.log("not logged in");
						$("#content_wrapper").html(templates.template_notloggedin.html);
						whales.common.setUserValid(false);
						break;
					default:
						console.log("The response contained errors:");
						console.log(ret);
						break;
				}
			}
			if(!handled) {
				callback(ret);
			}
		}
	});
};

whales.common.setUserValid = function (isValid) {
	if(isValid){
		$("#profile").show();
		// Post-login procedures:
		whales.common.json('/users/profile/', function(data){
			pn = $('#profile .profile_name');
			pn.children('span:first').html(data.data.profile['firstname']);
			pn.children('span:last').html(data.data.profile['lastname']);
		});
	} else {
		$("#profile").hide();
		whales.common.login();
	}
};


//navigation shortcuts and functions
nav = {};
nav.library_sort = "title";
nav.library = function(callback){
    $("#content_wrapper").html(templates.template_library.html); // load template into content
    $(window).trigger("resize"); // call resize event. Allways a good idea when changing layouts

    nav.load_library(callback);
	return true;
};

nav.load_library = function(callback){
    whales.common.json("management/library/",{"sort":nav.library_sort},function(data){
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
    $("#content_wrapper").html(templates.template_session.html); // load template into content
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
