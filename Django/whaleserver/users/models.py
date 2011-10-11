from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Profile(models.Model):
	# Linking the profile to a auth'able user
	userLink = models.OneToOneField(User)

	username = models.CharField(max_length = 200)
	password = models.CharField(max_length = 200)
	firstname = models.CharField(max_length = 200)
	lastname = models.CharField(max_length = 200)
	emailaddress = models.EmailField(max_length = 200)
	created = models.DateTimeField(auto_now_add=True)
	modified = models.DateTimeField(auto_now=True)
	lastlogin = models.DateTimeField(auto_now_add=True)
	country = models.CharField(max_length = 200)
	birthday = models.DateField()
	biography = models.TextField()
	rights = models.IntegerField(max_length = 2)

class Profile__Profile(models.Model):
	user = models.ForeignKey('Profile', related_name='user')
	friend = models.ForeignKey('Profile', related_name='friend')
	type = models.IntegerField(max_length = 2) # 0 = request, 1 = friend, 2 = ignored
	created = models.DateTimeField(auto_now_add=True)