from django.db import models

# Create your models here.

class User(models.Model):
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

class User__User(models.Model):
	user = models.ForeignKey(User, related_name='user')
	friend = models.ForeignKey(User, related_name='friend')
	type = models.IntegerField(max_length = 2) # 0 = request, 1 = friend, 2 = ignored
	created = models.DateTimeField(auto_now_add=True)