if(typeof whales === "undefined"){
	console.log("whales not loaded before whales.upload");
}

whales.community = {};

whales.community.viewprofile = function(id)
{
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
			
			var friendstring = '<br/>Friends:<br/>';
			var i = 0;
			for (i = 0; i < data.data.friends.length; i++)
			{
				friendstring += tEngine.apply(data.data.friends[i], templates.template_user);
			}
			$('#profilepage_friends').html(friendstring);
			
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
		}
	});
	
	// TODO: Move community events here.
}