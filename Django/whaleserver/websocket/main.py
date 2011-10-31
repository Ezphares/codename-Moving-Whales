#!/usr/bin/env python
#
# Copyright 2009 Facebook
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may
# not use this file except in compliance with the License. You may obtain
# a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
"""
Simplified chat demo for websockets.
Authentication, error handling, etc are left as an exercise for the reader :)
"""

import logging
import threading

from helpers import *
from websocket import Application
import tornado.ioloop
import tornado.options
from tornado.options import define
from tornado.options import options

logging.basicConfig(
                    level=logging.INFO,
                    format='[%(asctime)s] [WEBSOCKET] %(message)s',
                    )

define("port", default=8888, help="run on the given port", type=int)
define("address", default="0.0.0.0", help="run on the given adress", type=str)


class WhalesWebsocket(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)

    def run(self):
        app = Application()
        app.listen(options.port, options.address)
        logging.info("Starting whales websocket server")
        tornado.ioloop.IOLoop.instance().start()



if __name__ == "__main__":
    websocketThread = WhalesWebsocket()
    websocketThread.start()
