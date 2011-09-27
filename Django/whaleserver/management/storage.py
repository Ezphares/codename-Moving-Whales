from django.conf import settings
from django.core.files.storage import Storage

class MyStorage(Storage):
	def __init__(self, option=None):
		if not option:
			option = settings.CUSTOM_STORAGE_OPTIONS