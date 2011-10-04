from django.conf.urls.defaults import patterns, include, url
	
urlpatterns = patterns ('',
	(r'^(\d+)/$', 'users.views.profile'),
	(r'^(\d+)/edit/$', 'users.views.edit'),
)