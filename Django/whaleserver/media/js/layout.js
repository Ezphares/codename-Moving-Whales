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
        $("#splash").fadeOut(1000);
    });
});



