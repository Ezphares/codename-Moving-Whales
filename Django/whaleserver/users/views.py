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

def profile(request, user_id): # TODO: Code should be clarified to distinguish User and Profile
	user = Profile.objects.get(pk=user_id)
	obj = {
		'meta': {
			'errors': [],
			'type': 'profile'
		},
		'data': {
			'username': user.username,
			'firstname': user.firstname,
			'lastname': user.lastname,
			'emailaddress': user.emailaddress,
			'created': user.created.strftime("%d/%m-%Y %H:%M"),
			'modified': user.modified.strftime("%d/%m-%Y %H:%M"),
			'lastlogin': user.lastlogin.strftime("%d/%m-%Y %H:%M"),
			'country': user.country,
			'birthday': user.birthday.strftime("%d/%m-%Y"),
			'biography': user.biography,
			'rights': user.rights,
		}
	}
	return HttpResponse(json.dumps(obj))

def register(request):
	print "a"
	response = JSONResponse()
	if request.method != 'POST':
		response.add_error('Bad request.')
	else:
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
		if valid == True:
			user = User.objects.create_user(request.POST['username'], request.POST['email'], request.POST['password'])
			user.save()
			profile = Profile()
			profile.userLink = user
			profile.birthday = datetime.datetime.now()
			profile.rights = 0
			profile.save()
			user = authenticate(username=request.POST['username'], password=request.POST['password'])
			login(request, user)
			response.force_type('success')
	print response
	return HttpResponse(response.generate(), mimetype='application/json')

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
	return HttpResponse(response.generate(), mimetype='application/json')
		
def logout_view(request):
	logout(request)
	# Todo: Redirect	
	
def edit(request, user_id):
	user = Profile.objects.get(pk=user_id)
	#if request.method != 'POST':
		#return HttpResponse("Error") # TODO: Json
	if request.user.is_authenticated() and request.user == user.userLink:
		obj = {
			'meta': {
				'errors': [],
				'type': 'edit'
			},
			'data': {
				'username': user.username,
				'firstname': user.firstname,
				'lastname': user.lastname,
				'emailaddress': user.emailaddress,
				'created': user.created.strftime("%d/%m-%Y %H:%M"),
				'modified': user.modified.strftime("%d/%m-%Y %H:%M"),
				'lastlogin': user.lastlogin.strftime("%d/%m-%Y %H:%M"),
				'country': user.country,
				'birthday': user.birthday.strftime("%d/%m-%Y"),
				'biography': user.biography,
				'rights': user.rights,
			}
		}
	else:
		obj = {
			'meta': {
				'errors': [], #Some error. you are not authenticated or not the user..
				'type': 'edit'
			},
			'data': {
			}
		}
	return HttpResponse(json.dumps(obj))	
