# Create your views here.
from django.http import HttpResponse
from users.models import Profile, Profile__Profile
from django.template import RequestContext
from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from users.relations import *
from django.db.models import Q
import json
import datetime
from whales_json import *
import re

mail_re = None

def profile(request, user_id): #TODO: user_id as POST data
	hidden_data = 'Non-public'
	response = JSONResponse("profile")
	if request.method != 'POST':
		response.add_error('Bad request.')
	else:
		if user_id == None:
			user_id = request.user.id
		try:
			user = User.objects.get(pk=user_id)
			profile = user.profile
		except (Profile.DoesNotExist, User.DoesNotExist) as ex:
			response.add_error('Profile not found.', 'does_not_exist')
		else:
			info_level = 0
			relation_type = None
			requests = []
			if request.user.is_authenticated():
				myprofile = request.user.profile
				if profile == myprofile:
					info_level = 2
				else:
					relation_type = get_relation_type(profile, myprofile)
					if relation_type == 1:
						info_level = 1
			profile_obj = {
				'relation':'stranger',
				'id':user.id,
				'username':user.username,
				'firstname':profile.firstname,
				'lastname':profile.lastname,
				'emailaddress':hidden_data,
				'created':hidden_data,
				'modified':hidden_data,
				'lastlogin':hidden_data,
				'country':hidden_data,
				'birthday':hidden_data,
				'biography':profile.biography,
				'rights':0
				}
			if info_level == 0:
				if relation_type == -1:
					profile_obj['relation'] = 'stranger_add'
			if info_level > 0:
				profile_obj['relation'] = 'friend'
				profile_obj['country'] = profile.country
				profile_obj['birthday'] = profile.birthday.strftime('%B %d, %Y')
				profile_obj['emailaddress'] = profile.userLink.email
			if info_level > 1:
				profile_obj['relation'] = 'self'
				profile_obj['created'] = profile.created.strftime('%B %d, %Y')
				profile_obj['modified'] = profile.modified.strftime('%B %d, %Y')
				profile_obj['lastlogin'] = profile.lastlogin.strftime('%B %d, %Y')
				profile_obj['rights'] = profile.rights
				for request_link in get_relations(profile, 0, 'in'):
					requests.append(get_user_obj(request_link.user))
			response.add_data(profile=profile_obj)
			response.add_data(requests=requests)
			friends = []
			for friend_link in get_relations(profile, 1, 'both'):
				friends.append(get_user_obj(get_other_user(friend_link, profile)))
			response.add_data(friends=friends)
	return response.respond()
	
def add_friend(request):
	response = JSONResponse('success')
	if request.method != 'POST':
		response.add_error('Bad request.')
	elif not request.user.is_authenticated():
		response.add_error('Not logged in','access_denied')
	else:
		try:
			friend = User.objects.get(pk=request.POST['friend_id'])
			friend_profile = friend.profile
		except (Profile.DoesNotExist, User.DoesNotExist) as ex:
			response.add_error('Profile not found.', 'does_not_exist')
		else:
			if get_relation_type(request.user.profile, friend_profile) == -1:
				link = Profile__Profile()
				link.user = request.user.profile
				link.friend = friend_profile
				link.type = 0
				link.save()
			else:
				response.add_error('Users already related.', 'friend_error')
	return response.respond()
	
def answer_request(request):
	response = JSONResponse('success')
	if request.method != 'POST':
		response.add_error('Bad request.')
	elif not request.user.is_authenticated():
		response.add_error('Not logged in','access_denied')
	else:
		link = None
		try:
			friend = User.objects.get(pk=request.POST['friend_id'])
			link = Profile__Profile.objects.get(user = friend.profile, friend = request.user.profile, type = 0)
		except (Profile__Profile.DoesNotExist) as ex:
			response.add_error('No friend request to handle', 'friend_error')
		else:
			if request.POST['response'] == 'accept':
				link.type = 1
				link.save()
			elif request.POST['response'] == 'deny':
				link.delete()
			else:
				response.add_error('Invalid response type', 'friend_error')
	return response.respond()
	
def register(request):
	response = JSONResponse("success")
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
		if len(request.POST['firstname']) == 0 or len(request.POST['lastname']) == 0:
			response.add_error('You must provide both first and last name.', 'register_error')
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
	return response.respond()

def login_view(request):
	response = JSONResponse("success")
	if request.method != 'POST':
		response.add_error('Bad request.')
	else:
		user = authenticate(username=request.POST['username'], password=request.POST['password'])
		if user is not None:
			if user.is_active:
				login(request, user)
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
		profile = request.user.profile
		response.add_data(firstname = profile.firstname)
		response.add_data(lastname = profile.lastname)
		response.add_data(birthday = profile.birthday.strftime('%Y-%m-%d'))
		response.add_data(bio = profile.biography)
		response.add_data(country = profile.country)
		response.add_data(emailaddress = profile.userLink.email)
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
		user = profile.userLink
		user.email = request.POST['email']
		user.save()
	return response.respond()

def search(request):
	response = JSONResponse('search_results')
	if request.method != 'POST':
		response.add_error('Bad request.')
	elif not request.user.is_authenticated():
		response.add_error('Not logged in','access_denied')
	else:
		results = []
		# If the search matches a **username** or **email** exactly, add it with high weight, else exclude usernames
		try:
			user = User.objects.get(Q(username=request.POST['query'])|Q(email=request.POST['query']))
			profile = user.profile
		except (User.DoesNotExist, Profile.DoesNotExist):
			pass
		else:
			user_obj = get_user_obj(profile)
			user_obj['weight'] = 100
			results.append(user_obj)
			
		for term in request.POST['query'].split():
			for profile in Profile.objects.filter(Q(firstname__icontains=term)|Q(lastname__icontains=term)):
				added = False
				# Dublicate avoidance, and weighting
				for check in results:
					if check['id'] == profile.userLink.id:
						added = True
						check['weight'] = check['weight'] + 1
				if added == False:
					user_obj = get_user_obj(profile)
					user_obj['weight'] = 1
					results.append(user_obj)
		results.sort(cmp=lambda x,y: cmp(y['weight'], x['weight'])) # Descending weight sort
		response.add_data(results=results)
		
	return response.respond()