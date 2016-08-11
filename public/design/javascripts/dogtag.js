/**
 * Created by William Gu on 2016/8/4.
 */
// The boundary of the browser area
var w = $(window).width(), h = $(window).height();
console.log(w+","+h);
// The size of the product design area
var dw = 560, dh = 400;
// URI for the user selected background image, empty if no background
var bgURI = "/images/dogtag-bone.png";
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
var boundary = draw.path('m 304.85999 421.86261 a 22.859842 24.3596 0 0 1 -21.48548 24.31554 22.859842 24.3596 0 0 1 -24.06895 -21.3918 22.859842 24.3596 0 0 1 18.5914 -26.88772 22.859842 24.3596 0 0 1 26.30441 18.15877 M 110.64062 363.55935 C 82.235266 363.1175 53.511262 378.43139 32 396.36208 c -4.063202 5.6809 -7.743375 11.64681 -10.826172 17.91797 -17.8991278 32.26113 -7.575464 72.29795 15.484375 99.0957 7.935443 12.1908 25.107864 20.17811 19.427735 36.69531 -10.968269 13.69189 -24.498227 27.00739 -32.703126 43.26563 -18.8164497 30.39792 -14.3812321 70.79382 8.253907 97.83984 11.373964 18.38984 34.651823 22.48463 54.382812 26.21875 C 127.72342 724.1173 164.19881 694.47037 184 660.36208 l 195 1 c 8.2166 17.95626 19.85147 34.8572 35.94336 46.61133 27.46482 21.66251 67.26384 16.25231 94.04102 -3.72852 25.31412 -13.12442 37.04926 -38.78031 38.65624 -66.33984 5.57732 -33.48122 -14.72378 -65.42262 -42.99023 -81.875 -5.54047 -5.57791 0.16275 -16.74155 -0.65039 -24.66797 32.33403 -20.78509 51.95102 -62.53028 40.07617 -100.24023 -9.729 -35.72707 -44.78685 -57.66431 -79.78515 -62.89258 -33.68976 -6.86049 -62.64734 16.94567 -81.75782 41.95117 -4.83829 13.37342 -17.73485 10.06843 -28.71679 10.72656 -15.22273 3.80776 -19.95554 -3.39618 -21.00586 -18.40234 -7.55208 -25.77058 -36.95003 -35.94589 -61.41602 -31.78906 -28.09637 0.71907 -39.42125 28.98676 -49.39453 50.64648 l -38 -1 c -8.73217 -19.31855 -21.70726 -37.80215 -40.61133 -48.25977 -10.56659 -5.78514 -21.6329 -8.37007 -32.74805 -8.54296 z');
boundary.attr('id', 'jd_bd');
boundary.transform({y: -350});
//
// boundary.attr({
//     fill: '#ff0000'
//     , 'opacity': 0
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
nested.clipWith(boundary);

var foreground = null;
if (fgURI !== '' && fgURI !== null) {
    foreground = draw.image(fgURI).move(420,300);
    foreground.clipWith(boundary.clone());
    foreground.attr('id','jd_fg');
}

readSVG("");
