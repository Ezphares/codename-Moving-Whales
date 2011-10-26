from users.models import Profile, Profile__Profile
from django.contrib.auth.models import User

def is_friends(user, friend):
	user = get_profile(user)
	firend = get_profile(friend)
	link = None
	try:
		link = Profile__Profile.objects.get(user = user, friend = friend)
	except (Profile__Profile.DoesNotExist):
		pass
		
	if link == None:
		try:
			link = Profile__Profile.objects.get(user = friend, friend = user)
		except (Profile__Profile.DoesNotExist):
			pass

	if link != None:
		if link.type == 1:
			return True
	return False
	
def pending_requests(user):
	user = get_profile(user)
	return Profile__Profile.objects.filter(friend = user, type = 0)
	
def get_profile(user):
	if type(user) == User:
		return Profile.objects.get(userLink = user)
	if type(user) == Profile:
		return user
	return None
