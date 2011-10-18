#!/usr/bin/env python
__author__ = "Tudborg"
__date__ = "$12-10-2011 16:31:16$"

import json

class JSONResponseException(Exception):
	def __init__(self, value):
		self.value = value
	def __str__(self):
		return repr(self.value)

class JSONResponse():

	errors = None
	data = None
	type = None

	def __init__(self, type="generic_response"):
		self.type = type
		self.data = {}
		self.errors = []

	def generate(self):

		if self.type is None:
			raise JSONResponseException("No type defined on JSONResponse")

		structure = {
			'meta': {
				'type': self.type,
				'errors': self.errors
			},
			'data': self.data
		}
		return json.dumps(structure, sort_keys=True, indent=4)


	def add_error(self, error, type="generic_error"):
		self.errors.append(error)
		self.type = type

	def add_data(self, * args, ** kwargs):
		for element in args:
			if type(element) is dict:
				self.data.update(element)
		self.data.update(kwargs)

	def force_type(self, type=None):
		self.type = type

	def force_data(self, data=None):
		self.data = data

	def __unicode__(self):
		return self.__str__()

	def __str__(self):
		return self.generate()



if __name__ == "__main__":
	
	print "testing JSONResponse\n========================================"

	resp = JSONResponse("someTypeHere")

	resp.add_data({"key":"value"})
	resp.add_data(key={"key":"value"})
	resp.add_data({"key2":"value"})
	resp.add_data(somekey="somevalue")
	resp.add_data(somearraykey=["somevalue","somevalue","somevalue"])

	print resp.generate()
	print "========================================\nThis is a test of the JSONResponse class\nDon't run this module alone. it's silly."