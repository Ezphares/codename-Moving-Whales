if(typeof whales === "undefined"){
	console.log("whales not loaded before whales.upload");
}

whales.community = {};

whales.community.getprofile = function(profileid,callback) {
	var url = 'users/profile/';
	if (typeof profileid === 'number') {
		url += profileid + '/';
	}
	whales.common.json(url, {}, callback);
};

whales.community.viewprofile = function(id)
{
	console.log("Rendering profile");
	var url = '';
	if (typeof id === 'undefined')
	{
		url = 'users/profile/';
	}
	else
	{
		url = 'users/profile/' + id + '/';
	}
	
	whales.common.json(url, {}, function(data){
		if (data.meta.errors.length === 0)
		{
			$('#community_content').html(tEngine.apply(data.data.profile, templates.template_profilepage));
			$('#profilepage_friends').html(tEngine.apply(data.data.friends, templates.template_user));
			
			if (data.data.requests.length === 0)
			{
				$('#button_accept_requests').hide();
			}
			else
			{
				var plural = '';
				if (data.data.requests.length > 1)
				{
					plural = 's';
				}
				$('#button_accept_requests').html(data.data.requests.length + ' friend request' + plural);
				$('#button_accept_requests').data('requests', data.data.requests);
			}
			
			if (data.data.profile.relation !== 'stranger_add')
			{
				$('#button_add_friend').hide();
			}

			whales.community.layout();
		}
	});
}

whales.community.layout = function() {
	var chwh = $("#community_header_wrapper").height();
	var h = $("#community_wrapper").height()- chwh - 1; // 1 is border
	$("#community_content_wrapper").height(h);
	$("#community_content_wrapper").css("top",chwh);
};

whales.community.init = function()
{
	$(window).bind("resize", whales.community.layout);
	
	/* COMMUNITY EVENTS */	
	$('#form_friendrequests_close').live("click",function(ev){
		ev.preventDefault();
		whales.modal().hide();
		whales.community.viewprofile();
	});

	$('#community_search_button').live("click", function(ev){
		ev.preventDefault();
		console.log('Searching...');
		whales.common.json('/users/profile/search/', {'query': $('#community_profile_search').val()}, function (data){
			if (data.meta.errors.length === 0)
			{
				$('#community_content').html(tEngine.apply({}, templates.template_community_searchresults));
				$('#community_searchresults_list').html(tEngine.apply(data.data.results, templates.template_user));
			}
			else
			{
				// TODO: Handle remaining errors.
			}
			// Handle search results
		});
	});

	$('#button_add_friend').live("click", function(ev){
		ev.preventDefault();
		var data = {
			'friend_id':$(this).data().user_id
		};
		whales.common.json('/users/profile/addfriend/', data, function(data){
			if (data.meta.errors.length === 0)
			{
				$('#profilepage_addfriend').html('<span>Friend request sent.</span>');
			}
		});
	});

	$('#button_accept_requests').live("click", function(ev){
		ev.preventDefault();
		whales.modal({}, templates.template_form_friendrequests).show();
		var i = 0;
		var requests = $(this).data().requests;
		for (i = 0; i < requests.length; i++)
		{
			$('#form_friendrequests_list').append(tEngine.apply(requests[i], templates.template_request));
			$('.request' + requests[i].id + ' > .request_user').html(tEngine.apply(requests[i], templates.template_user));
		}
	});

	$('#community_content div.user').live("click", function(ev){
		ev.preventDefault();
		whales.community.viewprofile($(this).data().user_id);
	});


};

whales.community.init();
