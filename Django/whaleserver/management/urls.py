from django.conf.urls.defaults import *

urlpatterns = patterns('',
	(r'^upload/$', 'management.views.upload'),
	(r'^sendfile/$', 'management.views.sendfile'),
	(r'^library/$', 'management.views.get_library'),
	(r'^getplaylists/$', 'management.views.getplaylists')
)