


whales.common = {};
whales.common.login = function(){
	whales.modal({}, templates.template_form_login).show()
};
whales.common.readcsrf = function(){
    return $("input[type=hidden][name=csrfmiddlewaretoken]").val();
};
whales.common.average = function(array){
    var sum = 0;
    for(var i in array) {
        sum += array[i];
    }
    var avg = sum / array.length;
    return avg;
}

whales.common.remove = function (value,array){
    var c = 0;
    for(var i = 0; i < array.length; i+=1) {
        if(array[i] === value) {
            array.splice(i,1);
            c+=1;
        }
    }
    return c;
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
                $(window).trigger("user_valid"); //adding event triggers to hook in to
		$("#profile").show();
		// Post-login procedures:
		whales.common.json('/users/profile/', function(data){
			pn = $('#profile .profile_name');
			pn.children('span:first').html(data.data.profile['firstname']);
			pn.children('span:last').html(data.data.profile['lastname']);
		});
	} else {
                $(window).trigger("user_invalid"); //adding event triggers to hook in to
		$("#profile").hide();
		whales.common.login();
	}
};