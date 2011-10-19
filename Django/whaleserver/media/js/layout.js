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
    $("#btn_settings").bind("click",function(){
        whales.loading(true, "Loading Settings..");
        nav.settings(function(){
            whales.loading(false);
        });
    });


	/* FORM EVENTS */
	$('#form_login_submit').live("click",function(ev){
		ev.preventDefault();
		$.ajax({
			url: '/users/login/',
			dataType: 'json',
			type: 'POST',
			data: {
				'username' : $('#form_login_username').val(),
				'password' : $('#form_login_password').val()
			},
			headers: {
				'X-CSRFToken' : $('*[name=csrfmiddlewaretoken]').val()
			},
			success: function(data){
				if (data.meta.errors.length === 0)
				{
					$('#modal_wrapper').hide();
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
		$.ajax({
			url: '/users/register/',
			dataType: 'json',
			type: 'POST',
			data: {
				'username' : $('#form_register_username').val(),
				'password' : $('#form_register_password').val(),
				'email' : $('#form_register_email').val()
			},
			headers: {
				'X-CSRFToken' : $('*[name=csrfmiddlewaretoken]').val()
			},
			success: function(data){
				if (data.meta.errors.length === 0)
				{
					$('#modal_wrapper').hide();
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
			}
		});
	});
	
	$('#form_register_back').live("click",function(ev){
		ev.preventDefault();
		whales.modal({}, templates.template_form_login).show()
	});

    /* DRAG EVENTS */
    $('.track')
    .live("dragstart",function(){
        return $( this )
        .css({
            "z-index":2000,
            "position":"absolute"
        })
        .appendTo( document.body );
    })
    .live("drag",function( ev, dd ){
        $( dd.proxy ).css({
            top: dd.offsetY,
            left: dd.offsetX
        });
    })
    .live("dragend",function( ev, dd ){
        $( dd.proxy ).remove();
    });

    $('#sidebar_playlist > .sidebar_pane')
    .live("dropstart",function(ev,dd){
        })
    .live("drop",function(ev,dd){
        $( dd.proxy ).clone()
        .css({
            "z-index":"auto",
            "position":"static"
        }).appendTo( $(this) )
    })
    .live("dropend",function(ev,dd){
        });




    $(window).resize(); // fire resize event to callibrate UI

    $("#btn_community").click(); // DEFAULT PAGE ASSIGNMENT


    $(window).bind('load',function(e){
		whales.modal({}, templates.template_form_login).show();
        $("#splash").fadeOut(1000);
    });
});



