if(typeof whales === "undefined"){
	console.log("whales not loaded before whales.upload");
}

whales.community = {};

whales.community.viewprofile = function(id)
{
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
		}
	});
}