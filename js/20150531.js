"use strict";

var Page = function(){
    this.id = null;     // URL-friendly string
    this.title = null;  // Arbitrary string
    this.is404 = false; // Boolean
    this.load = null;   // Function to contain all page logic
};

// Method to convert arbitrary title string into a URL-friendly ID string
Page.prototype.titleToId = function(){
    return this.title.toLowerCase().replace(/\W/g,"_");
};

// Method to set title and automatically set ID
Page.prototype.setTitle = function(title){
    this.title = title.toString();
    this.id = this.titleToId();
};

var Nav = function(){
    this.current = null; // Page
    this.next = null;    // Page
    this.attempt = null; // Page.id
    this.cache = {};     // associative array: Page.id => Page
};

Nav.prototype.call = function(page_id, frompopstate){
    this.next = null;
    if (typeof frompopstate == 'undefined'){ var frompopstate = false; }
    (function(nav, page_id, frompopstate){
        nav.fetch(page_id, function(){      // Fetch the next page from the server
            nav.next.load(function(){       // Execute the next page's load function
                nav.finalize(frompopstate); // Page loaded: complete the transaction
            });
        });
    })(this, page_id, frompopstate);
};

Nav.prototype.fetch = function(page_id, callback){
    
    // If the page is already in the cache then fetch it from there
    if (typeof this.cache[page_id] != "undefined"){
        this.next = this.cache[page_id];
        callback();
        
    // Otherwise we need to load it from the server
    } else {
        
        // Store the ID we're attempting to load
        if (page_id != '404'){ this.attempt = page_id; }

        // Execute the load in a closure
        (function(nav, page_id, callback){
            
            // Compose the page URI
            var src = 'js/' + page_id + '.js?t=' + new Date().getTime();

            // Create a new script element in the document's head
            var head = document.getElementsByTagName("head")[0] || document.documentElement;
            var script = document.createElement('script');
            script.type = 'text/javascript';

            // Set the new script element's src, onload, and onerror values
            script.src = src;
            script.onload = function(){
                nav.next = nav.cache[page_id];
                callback();
            }
            script.onerror = function(){
                nav.next = nav.cache["404"];
                callback();
            }

            // Append the new script element to the page to trigger the loading
            head.appendChild(script);
            
        })(this, page_id, callback);
    }
};

Nav.prototype.finalize = function(frompopstate){
    this.current = this.next;
    this.next = null;
    if (!frompopstate){
        this.pushUrl();
    }
};

// Push URL and history for enabled browsers
Nav.prototype.pushUrl = function(){
    if (Modernizr.history){
        var id = this.current.id;
        var title = this.current.title;
        if (this.current.is404){
            id = this.attempt;
            title = '404 - Page Not Found';
        }
        var state = { page: id };
        var uri = "?" + id;
        history.pushState(state, title, uri);
    }
};

