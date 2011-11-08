__author__ = "tudborg"
__date__ = "$29-10-2011 00:05:55$"
if __name__ == "__main__":
	print "websocket.session module is not stand-alone"


import logging
import time
from management.tracks import get_track_obj,  find_other_owner
from management.models import Track, Profile__Track
from users.models import *
from users.relations import get_user_obj
from collections import deque

from helpers import *


class WhalesSessionManager():
	managers = []

	@classmethod
	def syncronize(cls, lock=None):
		prevStatusLine = "";
		while True:
			time.sleep(5) #sleep time makes sense when about 10-20
			lock.acquire()
			count_update = 0
			count_remove = 0
			for manager in cls.managers:
				if manager.alive():
					manager._synchandle()
					count_update += 1
				else:
					cls.managers.remove(manager)
					count_remove += 1

			lock.release()
			
			newStatusLine = "sync... managers: %d removed, %d sync'd" % (count_remove, count_update)
			if prevStatusLine != newStatusLine:
				logging.info(newStatusLine)
				prevStatusLine = newStatusLine

	def _synchandle(self):
		for session in self.sessions:
			try:
				for con in session.connections:
					con.send_ping()
			except:
				logging.info("could not send ping")


	def __init__(self, connection=None):
		self.next_playlist_id = 0
		self.managers.append(self)
		self.owner = None
		self.sessions = []
		self.waiting_acceptance_from = []
		self.packageHandler = WhalesPackageHandler(self)
		self.playlist = []

		if(connection != None):
			self.owner = WhalesUserSession(connection)
			self.waiting_acceptance_from.append(self.owner.user)
			self.join(connection)



	def __del__(self):
		self.managers.remove(self)

	@classmethod
	def find_manager_by_connection(cls, connection):
		for manager in cls.managers:
			session = manager.find_session_by_connection(connection)
			if session != None:
				return manager
		return None

	@classmethod
	def find_manager_by_user(cls, user):
		for manager in cls.managers:
			session = manager.find_session_by_user(user)
			if session != None:
				return manager
		return None

	def find_session_by_user(self, user):
		for session in self.sessions:
			if session.user == user:
				return session
		return None


	def find_session_by_connection(self, connection):
		for session in self.sessions:
			if session.has_connection(connection):
				return session
		return None

	def find_user_by_connection(self, connection):
		for session in self.sessions:
			if session.has_connection(connection):
				return session.user
		return None
		
	#join a user to a connection on this manager
	def join(self, connection):
		logging.info("Join")
		session = self.find_session_by_connection(connection)
		if session == None:
			session = WhalesUserSession(connection)
			if session.user in self.waiting_acceptance_from:
				self.sessions.append(session)
				self.waiting_acceptance_from.remove(session.user)
				self.write_message(encode(self.get_userlist()))
			else:
				logging.info("User \"%s\" tried to join a session without an invite" % session.user);
		else:
			session.add_connection(connection)
			connection.write_message(encode(self.get_userlist()))

		connection.write_message(encode(self.get_playlist()))
		if(self.owner == None):
			self.owner = session
		connection.sessionManager = self

	#depart a connection from the manager
	def depart(self, connection):
		session = self.find_session_by_connection(connection)
		if session == None:
			raise Exception("No session found for that connection")
		else:
			length = session.remove_connection(connection)
			if length < 1: #no more connections for this usersession
				self.sessions.remove(session) #remove it
				for track in self.playlist:
					if track[1].profile.userLink == session.user:
						replace = None #find_other_owner(track[1], [s.user for s in self.sessions])
						if (replace == None):
							self.playlist.remove(track)
						""" TODO: Test
						else:
							loc = self.playlist.index(track)
							self.playlist[loc] = replace
						""" 
				self.write_message(encode(self.get_userlist()))
				self.write_message(encode(self.get_playlist()))
		connection.sessionManager = None
		return len(self.managers)

	def alive(self):
		if len(self.sessions) > 0:
			return True
		else:
			return False


	def handle_package(self, package, connection):
		self.packageHandler.handle(package, connection)

	def get_userlist(self):
		user_list = [get_user_obj(session.user) for session in self.sessions]
		list_response = SyncObject('userlist')
		list_response.package['payload'] = {
			'type':'success',
			'users':user_list
		}
		return list_response.package
		
	def get_playlist(self):
		tracklist = []
		for track in self.playlist:
			track_obj = get_track_obj(track[1])
			track_obj['playlist_id'] = track[0]
			tracklist.append(track_obj)
		list_response = SyncObject('playlist')
		list_response.package['payload'] = {
			'type':'success',
			'playlist':tracklist
		}
		return list_response.package
		
	def playlist_addtrack(self, link):
		self.playlist.append((self.next_playlist_id, link))
		self.next_playlist_id = self.next_playlist_id + 1
		self.write_message(encode(self.get_playlist()))
		
	def playlist_removetrack(self, playlist_id):
		for track in self.playlist:
			if track[0] == playlist_id:
				self.playlist.remove(track)
		self.write_message(encode(self.get_playlist()))
			
	def write_message(self, package):
		for session in self.sessions:
			session.write_message(package)
	
	"""
	Handlers
	"""
	#def update_chat_cache(self, package):
	#	self.chat_cache.append(package)
	#	if len(self.chat_cache) > self.chat_cache_size:
	#	   self.chat_cache = self.chat_cache[-self.chat_cache_size:]


class WhalesUserSession():

	def __init__(self, connection, user=None):

		if user == None:
			cookies = get_cookies(connection)
			if "sessionid" in cookies:
				user = user_from_session_key(cookies['sessionid'])
			else:
				return None

		self.user = user
		self.connections = []
		self.add_connection(connection)

	def move(self,fromManager,toManager):
		logging.info(str(fromManager.sessions) + ' to ' + str(toManager.sessions))
		allowed = self.user in toManager.waiting_acceptance_from
		if self in fromManager.sessions:
			for connection in self.connections:
				fromManager.depart(connection)
				if allowed:
					toManager.join(connection)
				else:
					raise Exception("User tried to join session without permission")
		else:
			raise Exception("User did not exist in fromManager?!")
		logging.info(str(fromManager.sessions) + ' to ' + str(toManager.sessions))

	def has_connection(self, connection):
		for con in self.connections:
			if con == connection:
				return True
			return False

	def add_connection(self, connection):
		self.connections.append(connection)
		return len(self.connections)

	def remove_connection(self, connection):
		self.connections.remove(connection)
		return len(self.connections)

	def write_message(self, message):
		logging.info("Logging message to %s" % self.user);
		for con in self.connections:
			try:
				con.write_message(message)
			except IOError as ioe:
				print "Yo, dawg, i saw an IO error"
				print ioe
				self.remove_connection(con)



class WhalesPackageHandler():
	def __init__(self,manager):
		self.manager = manager

	def __str__(self):
		return encode(self.package)

	def handle(self,package,connection):
		handler = getattr(WhalesPackageHandler,"handle_"+package['type'],WhalesPackageHandler.handle_default)
		if handler != None:
			handler(self,package,connection)


	def handle_default(self,package,connection):
		logging.info("Could not find a matching handler for type: %s" % package["type"]);

	#pretty easy
	def handle_chat(self,package,connection):
		for session in self.manager.sessions:
			session.write_message(encode(package))

	#harder
	def handle_session(self, package,connection):
		if package["payload"]["type"] == "invite":
			self.handle_session_invite(package, connection)
		elif package["payload"]["type"] == "accept":
			self.handle_session_accept(package, connection)
		elif package["payload"]["type"] == "leave":
			self.handle_session_leave(package, connection)


	def handle_session_leave(self,package,connection):
		try:
			fromUser = self.manager.find_user_by_connection(connection)
			fromManager = self.manager.find_manager_by_user(fromUser)
			fromSession = fromManager.find_session_by_user(fromUser)
		except IndexError as ie:
			errorResponse = SyncObject("session")
			errorResponse.package['payload'] = {
				"type":"error",
				"handler":"user_does_not_exist", #the client side error handler
				"message":"The user \"%s\" does not exist" % package['payload']['accept'],
				"data":package['payload']['accept']
			}
			connection.write_message(encode(errorResponse.package))
			return

		emptyManager = WhalesSessionManager( None ) #new empty manager for user
		emptyManager.waiting_acceptance_from.append(fromSession.user)
		fromSession.move(fromManager,emptyManager)

		logging.info("creating new sessionManager")


	def handle_session_accept(self,package,connection):
		try:
			fromUser = self.manager.find_user_by_connection(connection)
			fromManager = self.manager.find_manager_by_user(fromUser)
			fromSession = fromManager.find_session_by_user(fromUser)
			toUser = User.objects.filter(username=package['payload']['accept'])[0]
			if fromUser == toUser:
				raise IndexError()
		except IndexError as ie:
			errorResponse = SyncObject("session")
			errorResponse.package['payload'] = {
				"type":"error",
				"handler":"user_does_not_exist", #the client side error handler
				"message":"The user \"%s\" does not exist" % package['payload']['accept'],
				"data":package['payload']['accept']
			}
			connection.write_message(encode(errorResponse.package))
			return
			#END IF NO TOUSER

		#we need the users connection
		#first the users manager
		toManager = self.manager.find_manager_by_user(toUser)
		if toManager == None:
			errorResponse = SyncObject("session")
			errorResponse.package['payload'] = {
				"type":"error",
				"handler":"user_not_online", #the client side error handler
				"message":"The user \"%s\" is currently not online" % package['payload']['accept'],
				"data":package['payload']['accept']
			}
			connection.write_message(encode(errorResponse.package))
			return
			#END IF NO MANAGER

		toSession = toManager.find_session_by_user(toUser)
		if toSession == None:
			raise Exception("This should not happen. How the hell did we get a manager but not a session?!")
		#"We have our from and to, lets form an invite object
		#also lets make a "request-pending" response to the "from" client

		acceptPackage = SyncObject("session")
		acceptPackage.package['payload'] = {
			"type":"success",
			"handler":"incomming_accept", #the client side success handler
			"data":fromUser.username
		}
		toSession.write_message(encode(acceptPackage.package))

		joiningSessionPackage = SyncObject("session")
		joiningSessionPackage.package['payload'] = {
			"type":"success",
			"handler":"joining_session", #the client side success handler
			"message":"Joining session with \"%s\"" % package['payload']['accept'],
			"data":package['payload']['accept']
		}
		connection.write_message(encode(joiningSessionPackage.package))

		logging.info("User %r joins user %r's session" % (fromUser,toUser));

		#do the actual session moving
		fromSession.move(fromManager,toManager)




	def handle_session_invite(self,package,connection):
		try:
			# [AWESOME]
			fromUser = self.manager.find_user_by_connection(connection)
			fromManager = self.manager.find_manager_by_user(fromUser)
			toUser = User.objects.filter(username=package['payload']['invite'])[0]
			if fromUser == toUser:
				raise IndexError()
		except IndexError as ie:
			errorResponse = SyncObject("session")
			errorResponse.package['payload'] = {
				"type":"error",
				"handler":"user_does_not_exist", #the client side error handler
				"message":"The user \"%s\" does not exist" % package['payload']['invite'],
				"data":package['payload']['invite']
			}
			connection.write_message(encode(errorResponse.package))
			return
			#END IF NO TOUSER


		#we need the users connection
		#first the users manager
		toManager = self.manager.find_manager_by_user(toUser)
		if toManager == None:
			errorResponse = SyncObject("session")
			errorResponse.package['payload'] = {
				"type":"error",
				"handler":"user_not_online", #the client side error handler
				"message":"The user \"%s\" is currently not online" % package['payload']['invite'],
				"data":package['payload']['invite']
			}
			connection.write_message(encode(errorResponse.package))
			return
			#END IF NO MANAGER

		toSession = toManager.find_session_by_user(toUser)
		if toSession == None:
			raise Exception("This should not happen. How the hell did we get a manager but not a session?!")
		#"We have our from and to, lets form an invite object
		#also lets make a "request-pending" response to the "from" client

		invitePackage = SyncObject("session")
		invitePackage.package['payload'] = {
			"type":"success",
			"handler":"incomming_invite", #the client side success handler
			"message":package['payload']['message'],
			"data":fromUser.username
		}
		toSession.write_message(encode(invitePackage.package))

		requestPendingPackage = SyncObject("session")
		requestPendingPackage.package['payload'] = {
			"type":"success",
			"handler":"request_pending", #the client side success handler
			"message":"Request to \"%s\" pending" % package['payload']['invite'],
			"data":package['payload']['invite']
		}
		connection.write_message(encode(requestPendingPackage.package))

		# Place a pending accept request in the fromUser's manager and wait for response from toUser
		fromManager.waiting_acceptance_from.append(toUser) # [AWESOME]

		logging.info("User %r invites user %r to join a session" % (fromUser,toUser))
		
	def handle_addtrack(self, package, connection):
		try:
			link = Profile__Track.objects.get(id=package['payload']['link_id'])
			user = self.manager.find_user_by_connection(connection)
		except IndexError as ie:
			#TODO: No track received?
			return
		except Profile__Track.DoesNotExist as ex:
			#TODO: Handle error.
			return
		
		if link.profile != user.profile:
			#TODO: Adding from another persons library. Needs some validation before it should be possible.
			return

		manager = self.manager.find_manager_by_connection(connection)
		manager.playlist_addtrack(link)
		responsePackage = SyncObject('playlist_action')
		responsePackage.package['payload'] = {
			'type':'success',
			'message':'Track added to playlist.'
		}
		connection.write_message(encode(responsePackage.package))
		
	def handle_removetrack(self, package, connection):
		try:
			playlist_id = package['payload']['playlist_id']
		except IndexError as ie:
			#TODO: No track to remove?
			return
			
		manager = self.manager.find_manager_by_connection(connection)
		manager.playlist_removetrack(playlist_id)
		responsePackage = SyncObject('playlist_action')
		responsePackage.package['payload'] = {
			'type':'success',
			'message':'Track added to playlist.'
		}