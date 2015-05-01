"use strict";

/**
   Particle - A simple group of shapes and text to depict particles such as protons or neutrons
   Example usage: 
   var p = new Particle().type("foo").appendTo(parent);
*/
var Particle = function(){
    this.node = null;
    this.properties = {
        type: null,
        id: '',
        x: 0,
        y: 0,
        scale: 1
    };
    this.types = {
        proton: {
            circle: { r: 1, stroke_width: 0.1 },
            text: { text: 'p+', x: -0.65, y: 0.4, font_size: 1.3 }
        },
        neutron: {
            circle: { r: 0.9, stroke_width: 0.1 },
            text: { text: 'n', x: -0.4, y: 0.35, font_size: 1.3 }
        },
        electron: {
            circle: { r: 0.1, stroke_width: 0.02 },
            text: { text: 'e-', x: -0.06, y: 0.045, font_size: 0.15 }
        }
    };
};

// Type is a required string and must match a type in this.types
Particle.prototype.type = function(value){
    if (typeof value == "undefined"){
        return this.properties.type;
    } else {
        if (typeof this.types[value] == "undefined"){
            console.log("Error - invalid particle type:" + value);
        } else {
            this.properties.type = value.toString();
        }
        return this;
    }
};

Particle.prototype.id = function(value){
    if (typeof value == "undefined"){
        return this.properties.id;
    } else {
        this.properties.id = value.toString();
        return this;
    }
};

Particle.prototype.x = function(value){
    if (typeof value == "undefined"){
        return this.properties.x;
    } else {
        this.properties.x = parseFloat(value);
        return this;
    }
};

Particle.prototype.y = function(value){
    if (typeof value == "undefined"){
        return this.properties.y;
    } else {
        this.properties.y = parseFloat(value);
        return this;
    }
};

// An arbitrary float to scale the particle's radius and label.
// All particles have a radius relative to the proton, which has a radius of 1.
Particle.prototype.scale = function(value){
    if (typeof value == "undefined"){
        return this.properties.scale;
    } else {
        this.properties.scale = parseFloat(value);
        return this;
    }
};

// Render the particle SVG object group as a child of the provided selector
Particle.prototype.appendTo = function(selector){
    var particle = this.types[this.properties.type];
    if (typeof particle == "undefined"){
        console.log("Error - particle type not set");
        return false;
    }
    this.node = selector.append("g").attr("id", this.properties.id)
        .attr("transform", "translate(" + this.properties.x + "," + this.properties.y + ")");
    for (var object in particle){
        var o = this.node.append(object).attr("class","particle " + this.properties.type);
        for (var attr in particle[object]){
            var val = particle[object][attr];
            var css_attr = attr.replace("_","-");
            switch(css_attr){
            case 'text':
                o.text(val);
                break;
            case 'font-size':
                o.style(css_attr, (val * this.properties.scale) + "px");
                break;
            case "stroke-width":
            case "r":
            case "x":
            case "y":
                val *= this.properties.scale;
            default:
                o.attr(css_attr, val);
                break;
            }
        }
    }
    return this;
};

/**
   Orbit - A path along which a Particle can be made to travel
   Example usage:
   var o = new Orbit().path([ [0, 1], [1, 1], [1, 0], [0, 0] ]).appendTo(parent);
   var p = new Particle().type("foo").appendTo(parent);
   o.attachParticle(p.node);
*/

var Orbit = function(){
    this.node = null;
    this.properties = {
        id: '',
        path: 1,
        stroke: "rgb(128,128,128)",
        stroke_width: 0.1,
        stroke_dasharray: "1, 2",
        tension: 0.5,
        interpolate: "cardinal-closed",
        duration: 1000,
        ease: "out-in",
        scaleFunction: null,
        animateFunction: null
    };
};

Orbit.prototype.id = function(value){
    if (typeof value == "undefined"){
        return this.properties.id;
    } else {
        this.properties.id = value.toString();
        return this;
    }
};

// Path should be provided as an array of two-value arrays (e.g. [ [x1, y1], [x2, y2], ... ])
Orbit.prototype.path = function(value){
    if (typeof value == "undefined"){
        return this.properties.path;
    } else {
        this.properties.path = value;
        return this;
    }
};

Orbit.prototype.stroke = function(value){
    if (typeof value == "undefined"){
        return this.properties.stroke;
    } else {
        this.properties.stroke = value.toString();
        return this;
    }
};

// Tension is a float between 0 and 1
Orbit.prototype.tension = function(value){
    if (typeof value == "undefined"){
        return this.properties.tension;
    } else {
        this.properties.tension = parseFloat(value);
        return this;
    }
};

// See d3 documentation on line interpolation: https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate
Orbit.prototype.interpolate = function(value){
    if (typeof value == "undefined"){
        return this.properties.interpolate;
    } else {
        this.properties.interpolate = value.toString();
        return this;
    }
};

// Time for a particle to travel the full length of the path once, in milliseconds
Orbit.prototype.duration = function(value){
    if (typeof value == "undefined"){
        return this.properties.duration;
    } else {
        this.properties.duration = parseInt(value);
        return this;
    }
};

// See d3 documentation on easing: https://github.com/mbostock/d3/wiki/Transitions#d3_ease
Orbit.prototype.ease = function(value){
    if (typeof value == "undefined"){
        return this.properties.ease;
    } else {
        this.properties.ease = value.toString();
        return this;
    }
};

// Scale is a function that converts a particle's position along the path (float from 0 to 1)
// to scaling transformation on the particle itself (an arbitrary float).
// E.g.: new Orbit().scale(function(t){ return 1 + t; }); will scale a particle from 1x to 2x
// as it travels along the full length of the path from t = 0 to t = 1.
Orbit.prototype.scaleFunction = function(value){
    if (typeof value == "undefined"){
        return this.properties.scaleFunction;
    } else if (typeof value == "function") {
        this.properties.scaleFunction = value;
        return this;
    }
};

// Render the path SVG object as a child of the provided selector
Orbit.prototype.appendTo = function(selector){
    this.node = selector.append("path")
        .attr("id", this.properties.id)
        .attr("class", "orbit")
        .attr("fill", "none")
        .attr("stroke-width", this.properties.stroke_width)
        .attr("stroke", this.properties.stroke)
        .attr("stroke-dasharray", this.properties.stroke_dasharray)
        .data([this.properties.path])
        .attr("d", d3.svg.line().tension(this.properties.tension).interpolate(this.properties.interpolate));
    return this;
};

// Attach an existing particle to the path to animate its motion along the path.
// Note: path and particle must already be rendered as SVG objects before this is called.
Orbit.prototype.attachParticle = function(particle){
    var orbit = this;
    (function(orbit, particle){
        orbit.animateFunction = function(){
            particle.transition()
                .duration(orbit.duration()).ease(orbit.ease())
                .attrTween("transform", orbit.transformAlong(orbit.node.node()))
                .each("end", orbit.animateFunction);
        };
    })(orbit, particle);
    this.animateFunction();
};

// Private function used to generate transform values for every step in a particle's animation along a path
Orbit.prototype.transformAlong = function(path){
    var l = path.getTotalLength();
    var orbit = this;
    return function(d, i, a) {
        return function(t) {
            var p = path.getPointAtLength(t * l);
            var transform = "translate(" + p.x + "," + p.y + ")";
            if (typeof orbit.properties.scaleFunction == "function"){
                var s = orbit.properties.scaleFunction(t); 
                transform += " scale(" + s + ")";
            }
            return transform;
        };
    };
};

/**
  Populate SVG objects in the 20150430 blog post
*/
function renderSVG(){

    // helium4
    var atom = d3.select("#helium4").append("g").attr("transform","translate(20,12) scale(9)");
    var orbit1 = new Orbit().duration(4000)
        .path([ [10.760, 21.414], [1.811, 15.268], [19.108, 3.128], [28.234, 9.598] ])
        .scaleFunction(function(t){ return 5 + (10 * Math.abs(t - 0.5)); })
        .appendTo(atom);
    var orbit2 = new Orbit().duration(4000)
        .path([ [19.604, 23.821], [3.677, 7.278], [9.904, 1.179], [26.476, 17.737] ])
        .scaleFunction(function(t){ return 5 + (10 * Math.abs(t - 0.5)); })
        .appendTo(atom);
    var e1 = new Particle().type("electron").appendTo(atom);
    var e2 = new Particle().type("electron").appendTo(atom);
    orbit1.attachParticle(e1.node);
    orbit2.attachParticle(e2.node);
    new Particle().type("proton").x(13.7).y(10).scale(1.9).appendTo(atom);
    new Particle().type("neutron").x(17).y(11).scale(2).appendTo(atom);
    new Particle().type("neutron").x(12.5).y(13).scale(2).appendTo(atom);
    new Particle().type("proton").x(15.6).y(13.5).scale(2.1).appendTo(atom);

    // interp1
    var i1 = d3.select("#interp1").append("g").attr("transform","scale(10)");
    var i1o = new Orbit().duration(4000)
        .tension(0.5).interpolate("cardinal-closed")
        .path([ [2, 10], [10, 2], [18, 10], [10, 18] ])
        .appendTo(i1);
    var i1p = new Particle().type("neutron").appendTo(i1);
    i1o.attachParticle(i1p.node);

    // interp2
    var i2 = d3.select("#interp2").append("g").attr("transform","scale(10)");
    var i2o = new Orbit().duration(4000)
        .tension(0.1).interpolate("monotone")
        .path([ [2, 10], [10, 2], [18, 10], [10, 18] ])
        .appendTo(i2);
    var i2p = new Particle().type("neutron").appendTo(i2);
    i2o.attachParticle(i2p.node);

    // interp3
    var i3 = d3.select("#interp3").append("g").attr("transform","scale(10)");
    var i3o = new Orbit().duration(4000)
        .tension(0.9).interpolate("step")
        .path([ [2, 10], [10, 2], [18, 10], [10, 18] ])
        .appendTo(i3);
    var i3p = new Particle().type("neutron").appendTo(i3);
    i3o.attachParticle(i3p.node);

    // Protium
    var protium = d3.select("#protium").append("g").attr("transform","scale(10)");
    new Particle().type("proton").x(20).y(5).scale(2.5).appendTo(protium);
    var protium_orbit = new Orbit().duration(4000)
        .path([ [20, 8], [2, 5], [20, 2], [38, 5] ])
        .scaleFunction(function(t){ return 1 + (30 * Math.abs(t - 0.5)); })
        .appendTo(protium);
    var protium_electron = new Particle().type("electron").appendTo(protium);
    protium_orbit.attachParticle(protium_electron.node);

};

window.onload = renderSVG();