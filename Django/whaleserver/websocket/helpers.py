
from django.conf import settings
from django.contrib.auth import SESSION_KEY, BACKEND_SESSION_KEY, load_backend
from django.contrib.auth.models import AnonymousUser
import json
import re
import time


def millitime():
    return time.time() * 1000

def decode(message):
    return json.loads(message)

def encode(package):
    return json.dumps(package)


def user_from_session_key(session_key):
    session_engine = __import__(settings.SESSION_ENGINE, {}, {}, [''])
    session_wrapper = session_engine.SessionStore(session_key)
    user_id = session_wrapper.get(SESSION_KEY)
    auth_backend = load_backend(session_wrapper.get(BACKEND_SESSION_KEY))

    if user_id and auth_backend:
      return auth_backend.get_user(user_id)
    else:
      return None


def get_cookies(connection):
    match = re.findall(r"(\w+)=([\w\d]+)(?:; )?", connection.request.headers['Cookie'],re.I)
    return dict(match)

class SyncObject():

    package = {
        "type":None,
        "from":"server",
        "time":{
            "created": None,
            "sent":None,
            "parsed":None,
            "recived":None
        },
        "payload":{}
    }

    def __init__(self, type):
        self.package['time']['created'] = int(millitime())
        self.package['type'] = type

    def __str__(self):
        return encode(self.package)