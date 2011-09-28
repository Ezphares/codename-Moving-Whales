# Create your views here.
from django.http import HttpResponse
from users.models import User, User__User
import json

def profile(request, user_id):
	user = User.objects.get(pk=user_id)
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