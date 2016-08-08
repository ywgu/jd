/**
 * Created by William Gu on 2016/8/4.
 */
// The boundary of the product drawing area
var w = 353, h = 700;
// The size of the product design area
var dw = 353, dh = 700;
// URI for the user selected background image, empty if no background
var bgURI = "/images/bg.jpg";
var selectedElement = null;
//    var width = $("#design").css('width');
//    var height = $("#design").css('height');
//    var ratio = height/353;
var draw = SVG('design').size(w, h);
draw.viewbox(0, 0, w, h);
// background and boundary
var background = draw.image("/images/iphone.png");
// <rect filter="url(#svg_2_blur)" rx="50" opacity="0.2" stroke="#0400ff" id="svg_2" height="700" width="348" y="0" x="116.5" stroke-width="5" fill="#ff0000"/>
var boundary = draw.rect(w - 9, h - 4).move(5, 2);
boundary.attr({
    fill: '#ff0000'
    , 'opacity': 0.2
    , stroke: '#0400ff'
    , 'stroke-width': 5
    , 'rx': 50
});

// background image if set
if (bgURI !== '') {
    var bgContainer = draw.image(bgURI);
    bgContainer.clipWith(boundary.clone());
}

// design area with user generated elements
// keep all the clickable elements, no group or other types of elements, we don't keep the sequences
// var elementList = [];
var nested = draw.nested();
// all elements are limited within the boundary
nested.clipWith(boundary);
// var text = nested.text('Everyday is a gift!');
// text.font({
//     family: 'Allura'
//     , size: 20
// });
// text.addClass("sample-text");
// elementList.push(text);
// text.draggable();
// text.selectize({deepSelect: true}).resize();
//
// var rect = nested.rect(50, 50).attr({fill: '#f06'});
// elementList.push(rect);
// rect.selectize();
//
// rect.draggable(boundary);

// var image = nested.image('http://s2.nuomi.bdimg.com/upload/deal/2014/1/V_L/623682-1391756281052.jpg');
// elementList.push(image);
// image.selectize().resize();
// image.draggable(boundary);
//
// // sample
// var sample = nested.image('images/frame.png').size(100, 100);
// var cover1 = nested.rect(100, 100);
// sample.clipWith(cover1);
// elementList.push(sample);
//

// background part that show through
var camera = draw.image("/images/camera.png").move(129, 10);

/**var cameraBoundary = draw.rect(101,52).move(158,8);
 cameraBoundary.attr({
        'opacity': 0
        , 'stroke-width': 0
        , 'rx': 30
    });
 camera.maskWith(cameraBoundary);*/
//select(image);
//ellipse.draggable();
//sendSVG();

// set all element click to select
// function setAllElementClickable() {
//     for (i=0; i<elementList.length; i++) {
//         elementList[i].on('click', function () {
//             selectElement(this);
//         });
//     }
// }
