from django.shortcuts import render_to_response
from django.http import HttpResponse, HttpResponseRedirect
from django.template import RequestContext
from django.core.files import File
from management.models import Track
from mutagen.mp3 import MP3
from mutagen.easyid3 import EasyID3
from mutagen.id3 import ID3
from os import remove, rename
from hashlib import md5
from datetime import datetime

def upload(request):
	return render_to_response('management/upload.html', context_instance=RequestContext(request))
	
def sendfile(request):
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
	
	tempTrack = Track();
	tempTrack.duration = audioInfo.info.length
	
	if hasID3:
		tempTrack.title = getID3Info(audioInfo, 'title', 'Unknown Track')
		tempTrack.album = getID3Info(audioInfo, 'album', 'Unknown Album')
		tempTrack.genre = getID3Info(audioInfo, 'genre', 'Unknown Genre')
		tempTrack.artist = getID3Info(audioInfo, 'performer', 'Unknown Artist')
		tempTrack.trackNo = getID3Info(audioInfo, 'tracknumber', 0)
		tempTrack.year = getID3Info(audioInfo, 'date', '0000')
	
	ID3(tempPath).delete()
	tempTrack.hashNo = getMD5Digest(tempPath)
	
	trackMatch = Track.objects.filter(hashNo=tempTrack.hashNo) # TODO: Use a manager for efficient database calls
	if len(trackMatch) == 0:
		fixedPath = './tracks/' + tempTrack.hashNo + '.mp3'
		tempTrack.path = fixedPath
		tempTrack.save()
		rename(tempPath, fixedPath)
		#TODO: Add user link to tempTrack
	else:
		pass #TODO: Merge the tracks, add user link to trackMatch[0]
	
	return HttpResponse("Received: " + tempTrack.hashNo)

def getID3Info(ID3Tag, content, default):
	info = default
	try:
		info = ID3Tag[content][0]
	except:
		try:
			info = ID3Tag[content]
		except:
			pass
	return info

def getMD5Digest(filePath):
	data = md5()
	try:
		file = open(filePath, 'rb')
	except:
		return
	lines = file.readlines()
	file.close()
	for eachLine in lines:
		data.update(eachLine)
	return data.hexdigest()