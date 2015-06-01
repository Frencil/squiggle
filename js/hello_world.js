"use strict";

/* Page: hello_world.js */

var page = new Page();
page.setTitle("Hello World");
page.load = function(callback){
    document.getElementById("page_content").innerHTML = "This page just prints a message.\nHello World!";
    callback();
}
nav.cache[page.id] = page;
