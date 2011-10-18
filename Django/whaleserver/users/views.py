# Create your views here.
from django.http import HttpResponse
from users.models import Profile, Profile__Profile
from django.template import RequestContext
from django.shortcuts import get_object_or_404, render_to_response
from django.contrib.auth import authenticate, login, logout
import json

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
	if request.method != 'POST':
		return HttpResponse("Error") # TODO: Json
	# TODO: Server-side validation of input!
	user = User.objects.create_user(request.POST['username'], request.POST['email'], request.POST['password'])
	user.save()
	return HttpResponse("User created!") # TODO: Json

def login_view(request):
	if request.method != 'POST':
		return HttpResponse("Error") # TODO: Json
	user = authenticate(username=request.POST['username'], password=request.POST['password'])
	if user is not None:
		if user.is_active:
			login(request, user)
			return HttpResponse("Logged in!") # TODO: Json
		else:
			return HttpResponse("EBanned!") # TODO: Json
	else:
		return HttpResponse("Wrong combination!") # TODO: Json
		
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
