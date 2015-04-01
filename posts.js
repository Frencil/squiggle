"use strict";

var render = {

  posts: new Array(),
  current_post_idx: -1,
  current_url_date: window.location.pathname.split('/').pop().replace(".html",""),

  loadPosts: function(callback) {

    // Initialize variables, load raw post data
    var frame = document.getElementById("raw_posts");
    var raw   = frame.contentWindow.document.body.childNodes[0].innerHTML;
    var lines = raw.split("\n");

    // Parse raw post data into usable array of objects, noting which post we're on now if applicable
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf(":") == -1) { continue; }
      var parts = lines[i].split(":");
      var date  = parts.shift();
      var title = parts.join(":");
      var date2 = date.replace(/-/g,"");
      var url   = date2 + ".html";
      var post  = { date: date, title: title, url: url };
      this.posts.push(post);
      if (date2 == this.current_url_date) {
        this.current_post_idx = this.posts.length - 1;
      }
    }

    // Fire a callback (if present) to render post data in a page-specific way
    if (this[callback] != undefined) {
      this[callback]();
    }

  },

  recent: function() {
    if (this.posts.length < 1) {
      document.getElementById("recent_posts").innerHTML = "<i>none</i>\n";
    } else {
      var limit = Math.min(this.posts.length, 4);
      for (var i = this.posts.length - 2; i > this.posts.length - limit - 2; i--) {
        var post = this.posts[i];
        document.getElementById("recent_posts").innerHTML += "<h4><span class=\"date\">" + post.date + ":</span> "
                                                          +  "<a href=\"archives/" + post.url + "\">" + post.title + "</a></h4>\n";
      }
    }
  },

  archives: function() {
    if (this.posts.length < 1) {
      document.getElementById("archives").innerHTML = "<h2>Archives</h2><i>none</i>\n";
    } else {
      var current_year = 0;
      for (var i = this.posts.length - 1; i >= 0; i--) {
        var post = this.posts[i];
        var year = parseInt(post.date.substr(0,4));
        if (year != current_year) {
          current_year = year;
          document.getElementById("archives").innerHTML += "<h2>Archives - " + current_year + "</h2>\n";
        }
        document.getElementById("archives").innerHTML += "<h4><span class=\"date\">" + post.date + ":</span> "
                                                      +  "<a href=\"" + post.url + "\">" + post.title + "</a></h4>\n";
      }
    }
  },

  nav: function() {
    if (this.current_post_idx > 0) {
      var post = this.posts[this.current_post_idx - 1];
      document.getElementById("nav_posts_prev").innerHTML = "<h4><span class=\"date\">Previous:</span> "
                                                          + "<a href=\"" + post.url + "\">" + post.title + "</a></h4>\n";
    }
    if (this.current_post_idx < this.posts.length - 1) {
      var post = this.posts[this.current_post_idx + 1];
      document.getElementById("nav_posts_next").innerHTML = "<h4><span class=\"date\">Next:</span> "
                                                          + "<a href=\"" + post.url + "\">" + post.title + "</a></h4>\n";
    }
  },

};
