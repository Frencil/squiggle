"use strict";

/* Page: fibonacci.js */

var page = new Page();
page.setTitle("Fibonacci");
page.load = function(callback){
    var seq = [ 1, 1 ];
    var n = 0;
    while (n < 10){
        seq.push(seq[seq.length-1]+seq[seq.length-2]);
        n++;        
    }
    document.getElementById("page_content").innerHTML = "This page generates the Fibonacci Sequence.\n[" + seq.toString() + "]";
    callback();
}
nav.cache[page.id] = page;
