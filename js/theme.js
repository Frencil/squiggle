"use strict";

// Light/dark theme toggle.
//
// Both theme stylesheets are linked in the header (#theme_light, #theme_dark) so
// switching is instant; this script just activates one and deactivates the other.
// Light is the default. The choice is kept in sessionStorage only so it carries
// across pages within the same tab - no cookies, nothing sent to the server, and
// it's discarded when the tab closes.

var theme = {

  current: "light",
  icons:  { light: "\u263C", dark: "\u23FE" },   // ☼ / ⏾
  labels: { light: "Switch to dark mode", dark: "Switch to light mode" },

  init: function() {
    try {
      if (window.sessionStorage.getItem("theme") === "dark") { this.current = "dark"; }
    } catch (e) {} // storage unavailable (e.g. privacy settings): stay light
    this.apply();
    var self = this;
    document.addEventListener("DOMContentLoaded", function() { self.apply(); });
  },

  apply: function() {
    var light = document.getElementById("theme_light");
    var dark  = document.getElementById("theme_dark");
    if (light && dark) {
      // media="not all" keeps a sheet loaded but inactive (dark starts that way
      // in the header, so pages without JavaScript are simply light)
      light.media = (this.current === "dark") ? "not all" : "all";
      dark.media  = (this.current === "dark") ? "all" : "not all";
    }
    var toggle = document.getElementById("theme_toggle");
    if (toggle) {
      toggle.textContent = this.icons[this.current];
      toggle.title = this.labels[this.current];
      toggle.setAttribute("aria-label", this.labels[this.current]);
    }
  },

  toggle: function() {
    this.current = (this.current === "dark") ? "light" : "dark";
    try { window.sessionStorage.setItem("theme", this.current); } catch (e) {}
    this.apply();
    return false;
  }

};

theme.init();
