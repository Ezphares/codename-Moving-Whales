from django.db import models

class Track(models.Model):
	title = models.CharField(max_length=30, default='Unknown Track')
	artist = models.CharField(max_length=30, default='Unknown Artist')
	album = models.CharField(max_length=30, default='Unknown Album')
	year = models.CharField(max_length=4, default='')
	comment = models.CharField(max_length=30, default='')
	genre = models.CharField(max_length=30, default='Unknown Genre')
	trackNo = models.IntegerField(default = 0)
	duration = models.FloatField()
	path = models.CharField(max_length=200)
	hashNo = models.CharField(max_length=32)
	