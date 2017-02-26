/**
 * Created by William Gu on 2016/8/4.
 * framework for the designer, manipulating functions are defined in design.js
 */
console.log("design:"+theDesign.name+","+theDesign.background);

// The boundary of the browser area
var w = $(window).width(), h = $(window).height();
// w = 600; h = 400;
console.log(w+","+h);
// The size of the product theDesign area
var dw = 600, dh = 400;
// URI for the user selected background image, empty if no background
var bgURI = "/images/dogtag-bone.png";
if (theDesign !== null && theDesign !== undefined)
    bgURI = "/images/" + theDesign.background;
var fgURI ="";
var selectedElement = null;

var draw = SVG('design').size(w,h); // whole svg for responsive design
draw.viewbox(0, 0, dw, dh); // only design in the design area
// background and boundary
var background = draw.image(bgURI).loaded(function(loader) {
    // this.size(w);
    this.attr('id', 'jd_bg');
});
// var boundary = draw.rect(w - 9, h - 4).move(5, 2);
var boundary = null;
if (theDesign !== null && theDesign !== undefined) {
    boundaryStr = theDesign.boundary;
    console.log("boundary:" + boundaryStr);
    if (boundaryStr !== null && boundaryStr !== undefined) {
        boundary = draw.path(boundaryStr);
        boundary.attr('id', 'jd_bd');
    }
}

// boundary.transform({y: -650});  // WHY???

// boundary.attr({
//     fill: '#ff0000'
//     , 'opacity': 50
//     , stroke: '#0400ff'
//     , 'stroke-width': 5
//     , 'rx': 50
// });

// design area with user generated elements
// keep all the clickable elements, no group or other types of elements, we don't keep the sequences
// var elementList = [];
var nested = draw.nested();
nested.attr('id','jd_nt');
// all elements are limited within the boundary
if (boundary !== null)
    nested.clipWith(boundary);

var foreground = null;
if (fgURI !== '' && fgURI !== null) {
    foreground = draw.image(fgURI).move(420,300);
    foreground.clipWith(boundary.clone());
    foreground.attr('id','jd_fg');
}

readSVG("/designs/templates/0010002-0.svg");
