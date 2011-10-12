from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.views.generic.simple import direct_to_template
# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',

	(r'^$', direct_to_template, {'template':'whales_index.html'}),

	(r'^management/', include('management.urls')),
	(r'^users/', include('users.urls')),

	(r'^media/(?P<path>.*)$', 'django.views.static.serve',
        	{'document_root': settings.STATIC_DOC_ROOT}),

    # Examples:
    # url(r'^$', 'whaleserver.views.home', name='home'),
    # url(r'^whaleserver/', include('whaleserver.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
