//scan document for templates and load them into the templates object
$(function(){
    $("*[type='text/html']").each(function(i,el){
        templates[$(el).attr('id')] = new Template(($(el).html()));
    });
});

var templates = {};
var tEngine = {};
tEngine.debug = true;
/**
 * Method to apply some data to a template
 * The data must be a javascript object containing key-value pairs,
 * where the key matches a template variable name
 * the data argument can be a single object, og an array of objects (eg. a list of tracks)
 */
tEngine.apply = function(data,template) {
    if(!is_array(data)) {
        data = [data];
    }
    var libArray = [];
    for(var i = 0; i < data.length; i++) {
        var workingTemplate = template.html;
        for(var key in template.regex) {
            workingTemplate = workingTemplate.replace(template.regex[key],data[i][key]);
        }
        libArray.push(workingTemplate);
    }
	if(this.debug) {
		console.log("rendered "+i+" templates");
	}
    return libArray.join("\n");
};


/*
	Template class - used for parsing templates
	All templates are created onload and is stored as their id attribute in the "templates" object.
	a template with the id="template_hello_world" would be found as a template object in templates.template_hello_world
*/
var Template = function(html) {

    this.html = html;
    this.regex = [];

	/*
		The init function detects all template variables in the template and creates and compiles a regular expression.
		This is used when applying the template to a set of data.
	*/
    this.init = function() {
        var findTemplateVars_re = new RegExp(this.varStart+"(.+?)"+this.varEnd,"g");
        var trimVarChars_re = new RegExp("^"+this.varStart+"|"+this.varEnd+"$","g");

        findTemplateVars_re.compile(findTemplateVars_re);
        trimVarChars_re.compile(trimVarChars_re);

        var matches = html.match(findTemplateVars_re);

        if(matches !== null) {
            for(var i = 0; i < matches.length; i++) {
                var key = matches[i].replace(trimVarChars_re,"").trim();

                this.regex[key] = new RegExp(this.varStart+"\w*"+key+"\w*"+this.varEnd,"g");
                this.regex[key].compile(this.regex[key]);
            }

        }
    };
    this.init();
};
//Django uses {{ and }}, so lets not
//Template.prototype.varStart = "{{";
//Template.prototype.varEnd = "}}";
Template.prototype.varStart = "%";
Template.prototype.varEnd = "%";
