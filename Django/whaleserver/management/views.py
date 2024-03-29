from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.core.files import File
from django.contrib.auth.models import User
from django.db.models import Q

from management.models import Track, Profile__Track, Playlist, ProfileTrack__Playlist
from management.tracks import get_track_obj
from users.models import Profile
from os import remove, rename
from hashlib import md5
from datetime import datetime

from whales_json import JSONResponse

try:
	from mutagen.mp3 import MP3
	from mutagen.easyid3 import EasyID3
	from mutagen.id3 import ID3
except ImportError:
	print "\n[WARNING] YOU NEED TO INSTALL MUTAGEN\n"
	raise
	
	
def upload(request):
	return render_to_response('management/upload.html', context_instance=RequestContext(request))
	
def sendfile(request):
	response = JSONResponse("file_uploaded")
	if not request.user.is_authenticated():
		response.add_error("Not logged in","access_denied")
		return HttpResponse(response.generate(),mimetype='application/json') # error
		
	filename = datetime.now().strftime('%j%H%M%S%f')
	tempPath = './upload/' + filename
	destination = open(tempPath, 'wb')
	destination.write(request.raw_post_data)
	destination.close()
	hasID3 = True
	audioInfo = None
	
	try:
		ID3(tempPath)
	except:
		hasID3 = False

	try:
		if hasID3:
			audioInfo = MP3(tempPath, ID3 = EasyID3) #Decodes MPEG headers. Raises exception if the file is not mpeg-encoded.
		else:
			audioInfo = MP3(tempPath)
	except:
		remove(tempPath)
		response.add_error("Unknown filetype","invalid_filetype")
		return HttpResponse(response.generate(),mimetype='application/json')
	
	tempTrack = Track()
	tempTrack.duration = audioInfo.info.length
	
	if hasID3:
		tempTrack.title = getID3Info(audioInfo, 'title', 'Unknown Track')
		tempTrack.album = getID3Info(audioInfo, 'album', 'Unknown Album')
		tempTrack.genre = getID3Info(audioInfo, 'genre', 'Unknown Genre')
		tempTrack.artist = getID3Info(audioInfo, 'performer', 'Unknown Artist')
		tempTrack.trackNo = getID3Info(audioInfo, 'tracknumber', 0)
		tempTrack.year = getID3Info(audioInfo, 'date', '0000')
		ID3(tempPath).delete()
	
	try:
		tempTrack.hashNo = getMD5Digest(tempPath)
	except:
		# File error!
		response.add_error("Unknown file error","unkown")
		return HttpResponse(response.generate(),mimetype='application/json')
	
	trackMatch = Track.objects.filter(hashNo=tempTrack.hashNo)

	try:
		profile = Profile.objects.filter(userLink = request.user)[0]
		link = Profile__Track()
		link.profile = profile
	except Exception as ex:
		print ex
		response.add_error(str(ex),"exception_see_error_message")
		return HttpResponse(response.generate(),mimetype='application/json')
		
	if len(trackMatch) == 0:
                databasePathName = tempTrack.hashNo + '.mp3'
		fixedPath = './tracks/' + databasePathName
		tempTrack.path = databasePathName
		tempTrack.save()
		rename(tempPath, fixedPath)
		print "before track assignment"
		link.track = tempTrack
	else:
		# Merge ID3 info on tracks
		if (trackMatch[0].title == 'Unknown Track' and tempTrack.title != 'Unknown Track'):
			trackMatch[0].title = tempTrack.title
		if (trackMatch[0].album == 'Unknown Album' and tempTrack.album != 'Unknown Album'):
			trackMatch[0].album = tempTrack.album
		if (trackMatch[0].genre == 'Unknown Genre' and tempTrack.genre != 'Unknown Genre'):
			trackMatch[0].genre = tempTrack.genre
		if (trackMatch[0].artist == 'Unknown Artist' and tempTrack.artist != 'Unknown Artist'):
			trackMatch[0].artist = tempTrack.artist
		if (trackMatch[0].trackNo == 0 and tempTrack.trackNo != 0):
			trackMatch[0].trackNo = tempTrack.trackNo
		if (trackMatch[0].year == '0000' and tempTrack.year != '0000'):
			trackMatch[0].year = tempTrack.year
		trackMatch[0].save()
		
		print "before second track assignment"
		link.track = trackMatch[0]
		
	print "before save"
	try:
		link.save()
	except Exception as ex:
		print ex
	print "after save"
	
	response.add_data(stored_as=tempTrack.hashNo)
	return HttpResponse(response.generate(),mimetype='application/json')

def getID3Info(ID3Tag, content, default): #TODO: Move to external file
	info = default
	try:
		info = ID3Tag[content][0]
	except:
		try:
			info = ID3Tag[content]
		except:
			pass
	return info

def getMD5Digest(filePath): #TODO: Move to external file
	data = md5()
	file = open(filePath, 'rb')
	lines = file.readlines()
	file.close()
	for eachLine in lines:
		data.update(eachLine)
	return data.hexdigest()

def get_library(request):
	try:
		sort = request.POST.get("sort",None)

		response = JSONResponse("library")
		if not request.user.is_authenticated():
			response.add_error("Not logged in","access_denied")
			return HttpResponse(response.generate(),mimetype='application/json') # error		
			
		profile = request.user.profile
		tracklinks = Profile__Track.objects.filter(profile = profile)
		if sort in ["rating"]:
			tracklinks = tracklinks.order_by(sort)
			print "sorted by "+sort
		else:
			print "did not sort tracklinks"
		
		tracks = Track.objects.filter(id__in = [link.track_id for link in tracklinks])
		#tracks = Track.objects.filter(id__in = tracklinks)
		print request.POST['query']
		
		if sort in ["title","artist","album","year","genre","duration", "-title","-artist","-album","-year","-genre","-duration"]:
			tracks = tracks.order_by(sort)
			print "sorted by "+sort
			if request.POST['query'] != 'null':
				print "Non-weighted search"
				q = Q()
				query = unicode(request.POST['query']).strip().split()
				for part in query:
					q = q | Q(artist__icontains = part) | Q(album__icontains = part) | Q(title__icontains = part)
				tracks = tracks.filter(q)
		else:
			if request.POST['query'] != 'null':
				# Weighted search, mofos
				query = unicode(request.POST['query']).strip().split()
				weighted = []
				for part in query:
					for track in Track.objects.filter(Q(artist__icontains = part) | Q(album__icontains = part) | Q(title__icontains = part)):
						added = False
						for w in weighted:
							if w['track'] == track:
								w['weight'] = w['weight'] + 1
								added = True
						if added == False:
							weighted.append({'track':track, 'weight':1})
				weighted.sort(cmp=lambda x,y: cmp(y['weight'], x['weight']))
				tracks = [t['track'] for t in weighted]
				print "weighted sort"
			
		library = []
		for track in tracks:
			link = Profile__Track.objects.get(track=track, profile=request.user.profile)
			
			trackObj = get_track_obj(link)
			library.append(trackObj)
			
		response.add_data(library=library)
		
		return HttpResponse(response.generate(),mimetype='application/json')
	except Exception as ex:
		print type(ex)
		print ex.args
		print ex

		
def getplaylists(request):
	response = JSONResponse('playlists')
	if request.method != 'POST':
		response.add_error('Bad request.')
	elif not request.user.is_authenticated():
		response.add_error('Not logged in','access_denied')
	else:
		lists = Playlist.objects.filter(user = request.user.profile)
		playlists = []
		for list in lists:
			playlists.append({'id': list.id, 'name': list.title})
		response.add_data(playlists = playlists)
	return response.respond()

def createplaylist(request):
	response = JSONResponse("Playlist created")
	
	if request.method != 'POST':
		response.add_error('Bad request.')

	else:

		if not request.user.is_authenticated():
			response.add_error('You are not logged in', 'access_denied')
			
		elif len(Playlist.objects.filter(user = request.user.profile, title = request.POST['title'])):
			response.add_error('Playlist already created', 'playlist_error')
			
		else:
			playlist = Playlist()
			playlist.user = request.user.profile
			playlist.title = request.POST['title']
			playlist.save()

	return response.respond()
	
def deleteplaylist(request):
	response = JSONResponse("Playlist deleted")
	
	if request.method != 'POST':
		response.add_error('Bad request.')
	
	else:
		
		if not request.user.is_authenticated():
			response.add_error('You are not logged in', 'access_denied')
		else:
			matches = Playlist.objects.filter(user = request.user.profile, id = request.POST['id'])
			if not len(matches):
				response.add_error('Playlist does not exist', 'playlist_error')
			else:
				for m in matches:
					m.delete()

		return response.respond()
					
def addsongtoplaylist(request):
	response = JSONResponse("Song added")
	
	if request.method != 'POST':
		response.add_error('Bad request')
	else:
		
		if not request.user.is_authenticated():
			response.add_error('You are not logged in', 'access_denied')
		
		else:
		
			try:
				pl = Playlist.objects.get(user = request.user.profile, id = request.POST['playlist_id'])
				track = Profile__Track.objects.filter(profile = request.user.profile, id = request.POST['track_id'])
				
			except (Playlist.DoesNotExist, Profile__Track.DoesNotExist):
				response.add_error('Song or playlist does not exist', 'playlist_error')
			
			else:
				ptrack = ProfileTrack__Playlist(playlist_id = request.POST['playlist_id'], track_id = matches[0].id)
				ptrack.save()

	return response.respond()


def deletesongfromplaylist(request):
	response = JSONResponse("Song deleted")
	
	if request.method != 'POST':
		response.add_error('Bad request')
		
	elif not request.user.is_authenticated():
			response.add_error('You are not logged in', 'access_denied')
		
	else:
		try:
			pt = Playlist__Track.objects.get(playlist__profile = request.user.profile, id = request.POST['playlist_track_id'])
			
		except Playlist__TrackDoesNotExist:
			response.add_error('Song does not exist', 'playlist_error')
			
		else:
			pt.delete()
	
	return response.respond()