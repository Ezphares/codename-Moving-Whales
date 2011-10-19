from django.conf.urls.defaults import patterns, include, url
	
urlpatterns = patterns ('',
	(r'^(\d+)/$', 'users.views.profile'),
	(r'^login/$', 'users.views.login_view'),
	(r'^register/$', 'users.views.register'),
	(r'^edit/$', 'users.views.edit'),
)