from django.conf.urls.defaults import *

urlpatterns = patterns('',
	(r'^upload/$', 'management.views.upload'),
	(r'^sendfile/$', 'management.views.sendfile'),
)