from django.db import models
from django.contrib.auth.models import User

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
	
class User__Track(models.Model):
	user = models.ForeignKey('users.Profile')
	track = models.ForeignKey('Track')
	created = models.DateTimeField(auto_now_add = True)
	playCount = models.IntegerField(default = 0)
	userRating = models.IntegerField(default = -1)
	joinable = models.BooleanField(default = True)
	note = models.CharField(max_length=200)
	
class Playlist(models.Model):
	user = models.ForeignKey('users.Profile')
	title = models.CharField(max_length=200)
	created = models.DateTimeField(auto_now_add = True)
	
class UserTrack__Playlist(models.Model):
	playlist = models.ForeignKey('Playlist')
	userTrack = models.ForeignKey('User__Track')
	created = models.DateTimeField(auto_now_add = True)
