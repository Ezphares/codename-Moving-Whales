/*
 * This file keeps the layout updated
 *
 * I bind a custom event called layout. The layout event must calculate the
 * elements size and set it
 */
var $middle_wrapper;
$(function(){

    $middle_wrapper = $("#middle_wrapper");
    
    $(window).bind('resize',function(e){
        // make sure that the middle wrapper is sized correctly
        
        // TODO HERE!!!!!!!!!!!!!
        $middle_wrapper.height($(window).height() - parseInt($middle_wrapper.css('top')) - 1 );
        $("#library").height($middle_wrapper.height() - parseInt($("#library").css('top')) - 1 );
        $("#library_list").height($("#library").height() - $("#library_controls").height());
        

        $(".sidebar_pane_wrapper").trigger('layout'); // trigger layout event on pane wrappers
    });

    $(".sidebar_pane_wrapper").bind('layout',function(e){
        var header_height = $($(this).find(".sidebar_header")[0]).height() | 0;
        var footer_height = $($(this).find(".sidebar_footer")[0]).height() | 0;
        var pane_height = $(this).height() - ( (header_height > 0) ? header_height+3 : 0 ) - ( (footer_height > 0) ? footer_height+3 : 0);
        $(this).find(".sidebar_pane").height(pane_height);
    });


    
    // attach events

    //sidebar collapse
    $(".sidebar_pane_wrapper > .sidebar_header").click(function(e){
        $(this).parent().toggleClass("collapse");
    });



    //all whales buttons
    $(".whales_btn").bind("click",function(){
        $("*[collection='"+$(this).parent().attr("collection")+"'] > .whales_btn").removeClass("selected");
        $(this).addClass("selected");
    });

    //navigation
    $("#btn_library").bind("click",function(){
        whales.loading(true, "Loading Library...");
        nav.library(function(){
            whales.loading(false);
        });

    });
    $("#btn_community").bind("click",function(){
        whales.loading(true, "Loading Community..");
        nav.community(function(){
            whales.loading(false);
			whales.community.viewprofile()
        });
    });
    $("#btn_profile").bind("click",function(){
        whales.loading(true, "Loading Profile..");
        nav.profile(function(){
            whales.loading(false);
        });
    });
    $("#btn_session").bind("click",function(){
        whales.loading(true, "Loading Session..");
        nav.session(function(){
            whales.loading(false);
        });
    });
	
    $("#btn_logout").bind("click",function(){
        whales.common.json("/users/logout/",function(data){
			$("#btn_logout").removeClass("selected");
			if(data.message) console.log(data.message);
			whales.common.setUserValid(false);
		});
    });
	
	$('#btn_settings').bind("click",function(){
		whales.common.json('/users/edit/', function(data){
			whales.modal(data.data, templates.template_form_edit).show()
		});
	});
	
	//sort buttons in library
    $(".track.sorting_controls .btn_sort").live("click",function(){
        if($(this).hasClass("selected")){
            $(this).toggleClass("reverse_sort");
        }
        else{
            $(this).parent().parent().find(".btn_sort").removeClass("selected").removeClass("reverse_sort");
            $(this).addClass("selected");
        }

        if($(this).hasClass("reverse_sort")){
			$(this).removeClass("icon_round_down").addClass("icon_round_up");
            nav.library_sort = "-"+$(this).parent().attr("class");
        }
        else{
			$(this).addClass("btn_sort icon_round_down").removeClass("icon_round_up");
            nav.library_sort = $(this).parent().attr("class");
		}
		nav.load_library();
		console.log("sorting by: "+nav.library_sort);
    });

    //search buttons in library
    $(".whales_square_btn_set .btn_search").live("click",function(){
        console.log($(this).parent().find(".btn_search"));
        
    });

	/* FORM EVENTS */
	
	$('#form_login_submit').live("click",function(ev){
		ev.preventDefault();
		var data = {
			'username' : $('#form_login_username').val(),
			'password' : $('#form_login_password').val()
		};
		whales.common.json('/users/login/', data, function(data){
			if (data.meta.errors.length === 0)
			{
				whales.modal().hide();
				whales.common.setUserValid(true);
				// TODO: Post-login procedure
			}
			else if (data.meta.type === 'login_error')
			{
				var error_string = '';
				for (var i in data.meta.errors)
				{
					error_string += data.meta.errors[i] + '<br/>';
				}
				$('#form_login_error').html(error_string);
			}
		});
	});
	
	$('#form_login_register').live("click",function(ev){
		ev.preventDefault();
		whales.modal({}, templates.template_form_register).show()
	});
	
	$('#form_login_resetpass').live("click",function(ev){
		ev.preventDefault();
		// TODO: Password reset form
	});
	
	
	$('#form_register_submit').live("click",function(ev){
		ev.preventDefault();
		if ($('#form_register_password').val() != $('#form_register_passwordrepeat').val())
		{
			$('#form_register_error').html('Passwords do not match.<br/>');
			return;
		}
		var data = {
			'username' : $('#form_register_username').val(),
			'password' : $('#form_register_password').val(),
			'email' : $('#form_register_email').val(),
			'firstname' : $('#form_register_firstname').val(),
			'lastname' : $('#form_register_lastname').val(),
			'birthday' : $('#form_register_birthday').val(),
			'country' : $('#form_register_country').val(),
			'bio' : $('#form_register_bio').val()
		};
		whales.common.json('/users/register/', data, function(data){
			if (data.meta.errors.length === 0)
			{
				whales.modal().hide();
				whales.common.setUserValid(true);
				// TODO: Post-login procedure
			}
			else if (data.meta.type === 'register_error')
			{
				var error_string = '';
				for (var i in data.meta.errors)
				{
					error_string += data.meta.errors[i] + '<br/>';
				}
				$('#form_register_error').html(error_string);
			}
		});
	});
	
	$('#form_register_back').live("click",function(ev){
		ev.preventDefault();
		whales.common.login();
	});
	
	
	$('#form_edit_save').live("click",function(ev){
		ev.preventDefault();
		var data = {
			'firstname': $('#form_edit_firstname').val(),
			'lastname': $('#form_edit_lastname').val(),
			'country': $('#form_edit_country').val(),
			'email': $('#form_edit_email').val(),
			'birthday': $('#form_edit_birthday').val(),
			'bio': $('#form_edit_bio').val(),
		}
		whales.common.json('/users/edit/submit/', data, function(data){
			if (data.meta.errors.length === 0)
			{
				whales.modal().hide();
				$('#btn_settings').removeClass("selected");
				whales.common.setUserValid(true)
			}
			//TODO: Handle any remaining errors
		});
	});
	
	$('#form_edit_cancel').live("click",function(ev){
		ev.preventDefault();
		whales.modal().hide();
		$('#btn_settings').removeClass("selected");
	});
	
	$('.btn_request_deny').live("click", function(ev){
		var id = $(this).data().user_id;
		$('.request' + id + ' > .request_buttons').html('<span>Denying...</span>');
		var data = {
			'friend_id':id,
			'response':'deny'
		};
		whales.common.json('/users/profile/answerrequest/', data, function(data){
			if (data.meta.errors.length === 0)
			{
				$('.request' + id + ' > .request_buttons').html('<span>Denied.</span>');
			}
			else
			{
				// Todo: Some weird error...
				$('.request' + id + ' > .request_buttons').html('<span>Error</span>');
			}
		});
	});
	
	$('.btn_request_accept').live("click", function(ev){
		var id = $(this).data().user_id;
		$('.request' + id + ' > .request_buttons').html('<span>Accepting...</span>');
		var data = {
			'friend_id':id,
			'response':'accept'
		};
		whales.common.json('/users/profile/answerrequest/', data, function(data){
			if (data.meta.errors.length === 0)
			{
				$('.request' + id + ' > .request_buttons').html('<span>Accepted!</span>');
			}
			else
			{
				// Todo: Some weird error...
				$('.request' + id + ' > .request_buttons').html('<span>Error</span>');
			}
		});
	});

    $(window).resize(); // fire resize event to callibrate UI

    $(window).bind('load',function(e){
		whales.common.json("/users/profile/",function(data){
			if(data.meta.type === "does_not_exist") {
				whales.common.setUserValid(false);
				whales.common.login();
			} else {
				whales.common.setUserValid(true);
				console.log("welcome, "+data.data.username);

				$("#btn_library").click();
			}
		});
        $("#splash").fadeOut(1000);
    });
});



