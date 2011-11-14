from django.conf.urls.defaults import *

urlpatterns = patterns('',
	(r'^upload/$', 'management.views.upload'),
	(r'^sendfile/$', 'management.views.sendfile'),
	(r'^library/$', 'management.views.get_library'),
	(r'^createplaylist/$', 'management.views.createplaylist'),
	(r'^deleteplaylist/$', 'management.views.deleteplaylist'),
	(r'^addsongtoplaylist/$', 'management.views.addsongtoplaylist'),
	(r'^deletesongtoplaylist/$', 'management.views.deletesongtoplaylist'),
)