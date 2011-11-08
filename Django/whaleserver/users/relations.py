from users.models import Profile, Profile__Profile
from django.contrib.auth.models import User

"""
Get relation type between 2 users or profiles:
-1 means unrelated
"""	
def get_relation_type(user, friend):
	user = get_profile(user)
	friend = get_profile(friend)
	link = None
	type = -1
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
		type = link.type
	return type
	
def get_relations(user, types, direction):
	if type(types) == int:
		types = [types]
	user = get_profile(user)
	relations = []
	if direction == 'out' or direction == 'both':
		for link in Profile__Profile.objects.filter(user = user):
			if link.type in types:
				relations.append(link)
	if direction == 'in' or direction == 'both':
		for link in Profile__Profile.objects.filter(friend = user):
			if link.type in types:
				relations.append(link)
	return relations
	
def get_user_obj(profile):
	profile = get_profile(profile)
	user_obj = {
		'id':profile.userLink.id,
		'username':profile.userLink.username,
		'firstname':profile.firstname,
		'lastname':profile.lastname
	}
	return user_obj
	
def get_other_user(link, user):
	user = get_profile(user)
	if link.user == user:
		return link.friend
	elif link.friend == user:
		return link.user
	else:
		return None
		
def get_profile(user):
	if type(user) == User:
		return user.profile
	if type(user) == Profile:
		return user
	return None

"""	
Legacy functions
"""
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
