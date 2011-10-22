# Create your views here.
from django.http import HttpResponse
from users.models import Profile, Profile__Profile
from django.template import RequestContext
from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import json
import datetime
from whales_json import *
import re

mail_re = None

def profile(request, user_id): #TODO: user_id as POST data
	response = JSONResponse()
	if request.method != 'POST':
		response.add_error('Bad request.')
	if False:
		pass
	else:
		if user_id == None:
			user_id = request.user.id
		try:
			profile = Profile.objects.get(pk=user_id)
			user = User.objects.get(pk=profile.userLink_id)
		except (Profile.DoesNotExist, User.DoesNotExist) as ex:
			response.add_error('Profile not found.', 'does_not_exist')
		else:
			info_level = 0
			if request.user.is_authenticated():
				myprofile = Profile.objects.filter(userLink=request.user)[0]
				if profile == myprofile:
					info_level = 2
				else:
					friend_profiles = Profile__Profile.objects.filter(user = profile)
					for i in friend_profiles:
						if i.friend == myprofile and i.type == 1:
							info_level = 1
					friend_profiles = Profile__Profile.objects.filter(friend = profile) #TODO: This is doing double work, move a function to external file
					for i in friend_profiles:
						if i.user == myprofile and i.type == 1:
							info_level = 1
			profile_obj = {
				'username':user.username,
				'firstname':profile.firstname,
				'lastname':profile.lastname,
				'emailaddress':'',
				'created':'',
				'modified':'',
				'lastlogin':'',
				'country':'',
				'birthday':'',
				'biography':profile.biography,
				'rights':0
				}
			if info_level > 0:
				profile_obj['country'] = profile.country
				profile_obj['birthday'] = profile.birthday.strftime('%B %d, %Y')
				profile_obj['emailaddress'] = profile.emailaddress
			if info_level > 1:
				profile_obj['created'] = profile.created.strftime('%B %d, %Y')
				profile_obj['modified'] = profile.modified.strftime('%B %d, %Y')
				profile_obj['lastlogin'] = profile.lastlogin.strftime('%B %d, %Y')
				profile_obj['rights'] = profile.rights
			response.add_data(profile=profile_obj)
			response.force_type('profile')
	return response.respond()

def register(request):
	response = JSONResponse()
	if request.method != 'POST':
		response.add_error('Bad request.')
	else:
		print request.POST['birthday']
		valid = True
		match = User.objects.filter(username = request.POST['username'])
		if len(match) > 0:
			response.add_error('Username is already in use.', 'register_error')
			valid = False
		match = User.objects.filter(email = request.POST['email'])
		if len(match) > 0:
			response.add_error('Email address is already registered.', 'register_error')
			valid = False
		if len(request.POST['password']) < 6:
			response.add_error('The entered password is less than 6 characters.', 'register_error')
			valid = False
		if len(request.POST['username']) < 3:
			response.add_error('The requested username is too short.', 'register_error')
			valid = False
		global mail_re
		if mail_re == None:
			mail_re = re.compile('^[a-zA-Z0-9._%-]+@[a-zA-Z0-9._%-]+.[a-zA-Z]{2,6}$')
		if mail_re.match(request.POST['email']) is None:
			response.add_error('Invalid email address', 'register_error')
			valid = False
		if valid == True:
			user = User.objects.create_user(request.POST['username'], request.POST['email'], request.POST['password'])
			user.save()
			profile = Profile()
			profile.userLink = user
			profile.birthday = datetime.datetime.strptime(request.POST['birthday'], '%Y-%m-%d').date()
			profile.firstname = request.POST['firstname']
			profile.lastname = request.POST['lastname']
			profile.country = request.POST['country']
			profile.biography = request.POST['bio']
			profile.rights = 0
			profile.save()
			user = authenticate(username=request.POST['username'], password=request.POST['password'])
			login(request, user)
			response.force_type('success')
	return response.respond()

def login_view(request):
	response = JSONResponse()
	if request.method != 'POST':
		response.add_error('Bad request.')
	else:
		user = authenticate(username=request.POST['username'], password=request.POST['password'])
		if user is not None:
			if user.is_active:
				login(request, user)
				response.force_type('success')
			else:
				response.add_error('Account disabled.', 'login_error')
		else:
			response.add_error('Wrong username or password.', 'login_error')
	return response.respond()
		
def logout_view(request):
	response = JSONResponse("logout")
	if not request.user.is_authenticated():
		response.add_error('No user logged in.', 'logout_error')
	else:
		logout(request)
		if request.user.is_authenticated():
			response.add_error('Could not log out.', 'logout_error')
		else:
			response.add_data(message='Logout successful')
	return response.respond()	
	
def edit(request):
	response = JSONResponse('profile_edit')
	if request.method != 'POST':
		response.add_error('Bad request.')
	elif not request.user.is_authenticated():
		response.add_error('Not logged in','access_denied')
	else:
		profile = Profile.objects.filter(userLink=request.user)[0]
		response.add_data(firstname = profile.firstname)
		response.add_data(lastname = profile.lastname)
		response.add_data(birthday = profile.birthday.strftime('%Y-%m-%d'))
		response.add_data(bio = profile.biography)
		response.add_data(country = profile.country)
		response.add_data(emailaddress = profile.emailaddress)
	return response.respond()
	
def edit_submit(request):
	response = JSONResponse('success')
	if request.method != 'POST':
		response.add_error('Bad request.')
	elif not request.user.is_authenticated():
		response.add_error('Not logged in','access_denied')
	else:
		profile = Profile.objects.filter(userLink=request.user)[0]
		profile.birthday = datetime.datetime.strptime(request.POST['birthday'], '%Y-%m-%d').date()
		profile.firstname = request.POST['firstname']
		profile.lastname = request.POST['lastname']
		profile.country = request.POST['country']
		profile.biography = request.POST['bio']
		profile.save()
	return response.respond()