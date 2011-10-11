from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.core.files import File
from django.contrib.auth.models import User

from management.models import Track, User__Track
from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3
from os import remove, rename
from hashlib import md5
from datetime import datetime

def upload(request):
	return render_to_response('management/upload.html', context_instance=RequestContext(request))
	
def sendfile(request):
	if not request.user.is_authenticated():
		return HttpResponse("Not logged in.") #TODO: json
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
		return HttpResponse("Unknown file type.")
	
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
		return HttpResponse("Unknown error")
	
	trackMatch = Track.objects.filter(hashNo=tempTrack.hashNo)
	
	link = User__Track()
	link.user_id = request.user.id
	
	if len(trackMatch) == 0:
		fixedPath = './tracks/' + tempTrack.hashNo + '.mp3'
		tempTrack.path = fixedPath
		tempTrack.save()
		rename(tempPath, fixedPath)
		link.track_id = tempTrack.id
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
		link.track_id = trackMatch[0].id
	link.save()
	return HttpResponse("Received: " + tempTrack.hashNo) # TODO: json

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
