/**
* @fileOverview News Specials AMD Simple Template Engine.
* Adapted from simple JavaScript templating by John Resig
* @author BBC / Steven Atherton 
* @version RC1
*/

/** @module template-engine */
define(function () {
    // retain scope inside module..
    var that;
    /**
    * Represents a Templating Engine
    * @constructor
    * @this {TemplateEngine}
    */
    var TemplateEngine = function () { 
        // Assign scope
        that = this;
        // Attach cache to Template object as a property
        this.cache = {};
    };
    /**
    * Builds the HTML string from the template and the data
    * @public    
    * @method
    * @param {String} str - The template represented as a String
    * @param {Object} data - Template variables
    * @returns {String} - HTML string for appending to the DOM
    */
    TemplateEngine.prototype.render = function (str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
        that.cache[str] = that.cache[str] ||
        that.render(str) :
      
        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        // We dont want jslint complaining, we know its not good but it is how we need to do this...
        /*jslint evil: true */
        new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
        
            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, " ")
              .split("<&").join("\t")
              .replace(/((^|&>)[^\t]*)'/g, "$1\r")
              .replace(/\t=(.*?)&>/g, "',$1,'")
              .split("\t").join("');")
              .split("&>").join("p.push('")
              .split("\r").join("\\'") + "');}return p.join('');");
    
        // Provide some basic currying to the user
        // Currying is the technique of transforming a function that takes multiple arguments (or a tuple of arguments) in such a way that it can be called as a chain of functions, each with a single argument (partial application).
        // see http://en.wikipedia.org/wiki/Currying for more info.
        return data ? fn(data) : fn;
    };

    return TemplateEngine;

});