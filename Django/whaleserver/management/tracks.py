from management.models import Track, Profile__Track
from users.models import Profile

def get_track_obj(tracklink):
	track = tracklink.track
	track_obj = {
		"pk":tracklink.id,
		"title":track.title,
		"artist":track.artist,
		"album":track.album,
		"year":track.year,
		"comment":track.comment,
		"genre":track.genre,
		"rating":tracklink.userRating,
		"trackNumber":track.trackNo,
		"duration":track.duration,
		"playlist_id":-1
	}
	return track_obj
