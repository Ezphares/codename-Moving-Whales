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
	
class User__Track(models.Model):
	user = models.ForeignKey('users.User')
	track = models.ForeignKey('Track')
	created = models.DateTimeField(auto_now_add = True)
	playCount = models.IntegerField()
	userRating = models.IntegerField()
	joinable = models.BooleanField()
	note = models.CharField(max_length=200)
	
class Playlist(models.Model):
	user = models.ForeignKey('users.User')
	title = models.CharField(max_length=200)
	created = models.DateTimeField(auto_now_add = True)
	
class UserTrack__Playlist(models.Model):
	playlist = models.ForeignKey('Playlist')
	userTrack = models.ForeignKey('User__Track')
	created = models.DateTimeField(auto_now_add = True)