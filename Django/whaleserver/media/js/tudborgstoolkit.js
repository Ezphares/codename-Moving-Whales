//inheritance helper from https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/create
if(true){
	if (!Object.create) {  
	    Object.create = function (o) {  
	        if (arguments.length > 1) {  
	            throw new Error('Object.create implementation only accepts the first parameter.');  
	        }  
	        function F() {}  
	        F.prototype = o;  
	        return new F();  
	    };  
	} 
}


Array.prototype.remove = function(item) {
	var c = 0;
	for(var i = 0; i < this.length; i++) {
		if(this[i] === item) {
			this.splice(i,1);
			c++;
		}
	}
	return c;
};

Array.prototype.sum = function() {
	var s = 0;
	for(var i = 0; i < this.length; i++) {
		if(typeof this[i] === "number"){
			s += this[i];
		}
	}
	return s;
};