__author__ = "tudborg"
__date__ = "$31-10-2011 00:05:20$"

import logging
import os.path
import thread
import time

from helpers import *
from whaleserver.websocket.session import WhalesSessionManager
import tornado.escape
import tornado.ioloop
import tornado.options
import tornado.web
import tornado.websocket
import os

class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/sync/", ChatSocketHandler),
            (r"/file/([^/]+)", StreamHandler),
        ]
        settings = dict(
            cookie_secret="43oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o/Vo=",
            template_path=os.path.join(os.path.dirname(__file__), "templates"),
            static_path=os.path.join(os.path.dirname(__file__), "static"),
            xsrf_cookies=False,
            autoescape=None,
            )
        tornado.web.Application.__init__(self, handlers, ** settings)
        self.lock = thread.allocate_lock()
        #thread.start_new_thread(ChatSocketHandler.syncronization, (self.lock, ))
        thread.start_new_thread(WhalesSessionManager.syncronize, (self.lock,))


class StreamHandler(tornado.web.RequestHandler):
    def get(self,path):
        fullpath = os.getcwd()+"/tracks/"+path
        try:
            with open(fullpath,"rb") as f:
                bytes = f.read(1024)
                self.set_header("Content-Type",'audio/mpeg3');
                while bytes != "":
                    self.write(bytes)
                    self.flush()
                    bytes = f.read(1024)
            self.finish()
        except:
            self.set_status(404)
            self.set_header("Content-Type",'text/plain');
            self.write("could not find track")
            self.finish()


class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    _latency_size = 3 #set this to something like 3-5 when not testing
    connections = []

    #this is deprecated. Now we use WhalesSessionManager.syncronize
    @classmethod
    def syncronization(cls, lock):
        while True:
            time.sleep(10) #sleep time makes sense when about 10-20
            lock.acquire()
            for connection in cls.connections:
                try:
                    connection.send_ping()
                except:
                    logging.info("could not send ping")
            lock.release()

    def latency(self):
        return float(sum(self._latency) / len(self._latency))

    def open(self):
        #init
        self.sessionManager = None
        self._latency = []

        try:
            user = user_from_session_key(get_cookies(self)['sessionid'])
        except KeyError as ke:
            logging.error("No sessionid in cookies")
            self.close()
            return None

        if user != None:
            #if the client has a user logged in
            logging.info("user: %s" % user.username)
            self.sessionManager = WhalesSessionManager.find_manager_by_user(user)
            if self.sessionManager == None:
                self.sessionManager = WhalesSessionManager(self) #new manager for user
                logging.info("creating new sessionManager")
            else:
                self.sessionManager.join(self)
                logging.info("found old sessionManager")

            logging.info(self.sessionManager.managers)
            ChatSocketHandler.connections.append(self)

        else:
            try:
                self.close()
            except:
                pass

    def on_close(self):
        logging.info("client disconnected")
        try:
            ChatSocketHandler.connections.remove(self)
            self.sessionManager.depart(self)
        except KeyError as ke:
            print ke


    def on_message(self, message):
        #print "got message: %r" % message
        try:
            package = decode(message)
            package['time']['recived'] = millitime()
        except ValueError as e:
            print type(e)
            print e
            return

        self.handle_latency(package) # allways handle latency from clients

        #let this connections manager
        #check if type is a system handled type. otherwise, let session handle
        if package['type'] not in ["pong"]:
            if self.sessionManager == None:
                self.close()
                return
            self.sessionManager.handle_package(package, self)



    def handle_latency(self, package):
        #latency calculations
        self._latency.append((int(millitime()) - package['time']['sent']))
        if len(self._latency) > self._latency_size:
            self._latency = self._latency[self._latency_size:]

        #find out what client the package came from
        if package['from'] == "server":
            #server sent the initial ping. set time at client
            delay = (millitime() - package['time']['created']) / 2 #2xping / 2
            #logging.info("expected delay to client: %d" % (delay))
            self.send_time(delay)
        else:
            pongBy = package['from']
            logging.info ("[LATENCY] %s to server: %d ms" % (pongBy, self.latency()))


    def send_ping(self):
        pingPack = SyncObject("ping")
        self.send_package(pingPack)

    def send_time(self, initalDelay=0):
        timePack = SyncObject("synctime")
        timePack.package['payload']['settime'] = int(millitime()) + initalDelay
        self.send_package(timePack)

    def send_package(self, package):
        package.package['time']['sent'] = int(millitime())
        self.write_message(str(package))
