from django.db import models

class Track(models.Model):
	title = models.CharField(max_length=30)
	artist = models.CharField(max_length=30)
	album = models.CharField(max_length=30)
	year = models.CharField(max_length=4)
	comment = models.CharField(max_length=30)
	genre = models.IntegerField()
	trackNo = models.IntegerField()
	duration = models.IntegerField()
	path = models.CharField(max_length=200)
	hashNo = models.CharField(max_length=33)
	