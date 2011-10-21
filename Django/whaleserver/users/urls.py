from django.conf.urls.defaults import patterns, include, url
	
urlpatterns = patterns ('',
	(r'^profile/$', 'users.views.profile',{"user_id":None}),
	(r'^profile/(\d+)/$', 'users.views.profile'),
	(r'^login/$', 'users.views.login_view'),
	(r'^logout/$', 'users.views.logout_view'),
	(r'^register/$', 'users.views.register'),
	(r'^edit/$', 'users.views.edit'),
)