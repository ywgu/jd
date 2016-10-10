/**
 * Created by William Gu on 2016/7/16.
 * all functions for manipulating the designer
 */

// select a single element
function selectElement(selected) {
    // deselect current selected
    // for (i=0; i<elementList.length; i++) {
    if (selectedElement !== null) {
        selectedElement.draggable(false);
        selectedElement.selectize(false);
        selectedElement.resize('stop');
    }
    selectedElement = selected;
    selected.draggable().selectize().resize();
}

function moveUp() {
    if (selectedElement !== null)
        selectedElement.forward();
}

function moveDown() {
    if (selectedElement !== null)
        selectedElement.backward();
}

function getTextFontList() {
    var fontList = "";
    nested.each(function (i, children) {
        aElement = children[i];
        attr = children[i].attr("font-family");
        if (attr !== null && attr !== undefined) {
            attr = attr.replace(/ /g, "+");
            if (fontList.indexOf(attr) < 0) {
                if (fontList.length > 0)
                    fontList += "|";
                fontList += attr;
            }
        }
    }, true);
    return fontList;
}

// send SVG doc to server
function sendSVG() {
    // deselect the element
    if (selectedElement !== null) {
        selectedElement.selectize(false);
        selectedElement = null;
    }
    // add svg head and font styles in the front
    var fontList = getTextFontList();
    var svgText = "<?xml version=\"1.0\" standalone=\"no\"?>" +
        "<?xml-stylesheet type=\"text/css\" href=\"https://fonts.googleapis.com/css?family=" + fontList + "\"?>" +
        "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
    svgText += document.getElementById('design').innerHTML;
    // fix a bug with IE browser
    searchStr = "xmlns=\"http://www.w3.org/2000/svg\"";
    strPos = svgText.indexOf(searchStr);
    secondStrPos = svgText.indexOf(searchStr, strPos + searchStr.length);
    if (secondStrPos !== -1) {
        temp = svgText.substr(0, secondStrPos) + svgText.substr(secondStrPos + searchStr.length + 1);
        svgText = temp;
    }

    var form = document.createElement("form");
    form.setAttribute("method", "post");
    form.setAttribute("action", "/design/");
    form.setAttribute("accept-charset", "UTF-8");

    var hiddenSVGField = document.createElement("input");
    hiddenSVGField.setAttribute("type", "hidden");
    hiddenSVGField.setAttribute("name", "svgText");
    hiddenSVGField.setAttribute("value", svgText);

    // console.log("svg："+svgText);

    form.appendChild(hiddenSVGField);
    document.body.appendChild(form);
    form.submit();
}

function readSVG(url) {
    var rawSVG = '<defs id="SvgjsDefs1002"><clipPath id="SvgjsClipPath1011"><path id="jd_bd" d="M304.85999 421.86261A22.859842 24.3596 0 0 1 283.37451 446.17815A22.859842 24.3596 0 0 1 259.30556 424.78635A22.859842 24.3596 0 0 1 277.89696000000004 397.89863A22.859842 24.3596 0 0 1 304.20137000000005 416.05740000000003M110.64062 363.55935C82.235266 363.1175 53.511262 378.43139 32 396.36208C27.936798 402.04298 24.256625 408.00889 21.173828 414.28005C3.2747002000000016 446.54118 13.598364 486.57800000000003 36.658203 513.37575C44.593646 525.56655 61.766067 533.55386 56.085938 550.07106C45.117669 563.76295 31.587711 577.07845 23.382812 593.33669C4.5663623000000015 623.73461 9.001579900000001 664.13051 31.636719 691.17653C43.010683 709.56637 66.288542 713.66116 86.019531 717.39528C127.72342 724.1173 164.19881 694.47037 184 660.36208L379 661.36208C387.21659999999997 679.31834 398.85147 696.21928 414.94336 707.97341C442.40817999999996 729.6359199999999 482.2072 724.2257199999999 508.98438 704.2448899999999C534.2985 691.12047 546.03364 665.46458 547.64062 637.90505C553.21794 604.42383 532.91684 572.48243 504.65039 556.03005C499.10992 550.45214 504.81314000000003 539.2885 504 531.36208C536.33403 510.57698999999997 555.95102 468.8318 544.07617 431.12185C534.34717 395.39477999999997 499.28932000000003 373.45754 464.29102000000006 368.22927C430.6012600000001 361.36877999999996 401.6436800000001 385.17494 382.5332000000001 410.18044C377.6949100000001 423.55386 364.7983500000001 420.24886999999995 353.8164100000001 420.907C338.59368000000006 424.71475999999996 333.8608700000001 417.51081999999997 332.8105500000001 402.50466C325.2584700000001 376.73408 295.86052000000007 366.55877 271.3945300000001 370.7156C243.29816000000008 371.43467 231.9732800000001 399.70236 222.00000000000009 421.36208L184.00000000000009 420.36208C175.2678300000001 401.04353 162.2927400000001 382.55993 143.38867000000008 372.10231C132.82208000000008 366.31717 121.75577000000007 363.73224 110.64062000000007 363.55935Z " transform="matrix(1,0,0,1,0,-350)"></path></clipPath><filter id="SvgjsFilter1013"><feColorMatrix id="SvgjsFeColorMatrix1014" type="luminanceToAlpha" result="SvgjsFeColorMatrix1014Out" in="SourceGraphic"></feColorMatrix></filter></defs><image id="jd_bg" xlink:href="/images/dogtag-bone.png" width="560" height="392"></image><svg id="jd_nt" clip-path="url(&quot;#SvgjsClipPath1011&quot;)" style="overflow: visible;"><image id="SvgjsImage1012" xlink:href="/uploads/28150_adexchange.jpg" width="630.4734802246094" height="415.57271575927734" filter="url(#SvgjsFilter1013)" x="-44.249114990234375" y="-13.506187438964844"></image></svg>';
    $.ajax({
        type: "GET",
        url: url,
        success: function (text) {
            rawSVG = new XMLSerializer().serializeToString(text);
            console.log("read " + url + " succeeds:"+rawSVG);
            rawSVG = rawSVG.slice(rawSVG.indexOf("<image"),rawSVG.lastIndexOf("</defs>")+7);
            console.log("rawSVG：" + rawSVG);
            draw.clear();
            draw.svg(rawSVG).size(w, h);
            draw.viewbox(0, 0, dw, dh);
            // read background, boundary, nested, foreground and set corresponding variable
            background = SVG.get('jd_bg');
            nested = SVG.get('jd_nt');
            boundary = SVG.get('jd_bd');
            foreground = SVG.get('jd_fg');
            // all elements in nested are selectable, draggable, resizable
            nested.each(function (i, children) {
                selectElement(this);
                this.on('click', function () {
                    selectElement(this);
                });
                this.on('del', function () {
                    delElement(this);
                });
            });
            // need to load text used fonts to the page
            var fontList = getTextFontList();
            // console.log("fontList:"+fontList);
            var defs = draw.defs();
            var styleEle = defs.element("style");
            styleEle.attr("type","text/css");
            var urlStr = "@import url('http://fonts.googleapis.com/css?family="+fontList+"');";
            styleEle.words(urlStr);

            // console.log("draw.parent:"+draw.parent);
        },
        error: function () {
            // An error occurred
            console.log("error reading from " + url);
        }
    });

}

// hide and display the specific form
var formShown = 'none';
function showForm(id) {
    // hide current displayed form
    if (formShown !== 'none') {
        document.getElementById(formShown).style.display = "none";
    }
    document.getElementById(id).style.display = "inline";
    formShown = id;
}
function hideForm(id) {
    document.getElementById(id).style.display = "none";
    formShown = 'none';
}
// functions for add/remove elements
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function getSelectedFontName() {
    var fontOptions = document.getElementsByName("text-family-list-font-family");
    if (fontOptions.length > 0) {
        for (var i = 0, max = fontOptions.length; i < max; i++) {
            var aFont = fontOptions[i];
            if (aFont.checked === true) {
                return aFont.value;
            }
        }
    }
}
function addText() {
    var textData = document.getElementById("text").value;
    var text = nested.text(textData);
    // text.clipWith(boundary.clone());
    text.move(dw / 2 - text.rbox().width / 2, dh / 2 - text.rbox().height / 2);

    var selectedFont = getSelectedFontName();
    text.font({
        family: selectedFont
        , anchor: 'middle'
        , size: 20
    });
    var textId = "tid" + getRandomInt(0, 10000);
    text.addClass(textId);
    // elementList.push(text);
    // click to select
    text.on('click', function () {
        selectElement(this);
    });
    text.on('del', function () {
        delElement(this);
    });
    // force select the last element
    selectElement(text);
    hideForm("addtxt");
}

function addImg(imgURL) {
    console.log("addImg");
    // var imgURL = "http://s2.nuomi.bdimg.com/upload/deal/2014/1/V_L/623682-1391756281052.jpg";
    var image = nested.image(imgURL).loaded(function (loader) {
        // this.move(w/2-loader.width/2, h/2-loader.height/2);
        if (loader.width > dw || loader.height > dh)
            if (loader.width > loader.height)
                this.size(dw);
            else
                this.size(null, dh);
        this.center(dw / 2, dh / 2);
    });
    // image.clipWith(boundary.clone());
    // filter the image if necessary
    image.filter(function (add) {
        // add.colorMatrix('matrix', [ .343, .669, .119, 0, 0
        //     , .249, .626, .130, 0, 0
        //     , .172, .334, .111, 0, 0
        //     , .000, .000, .000, 1, 0 ])
        add
            .colorMatrix('saturate', 0)
        // add.flood('white',0.5);
        // add.colorMatrix('luminanceToAlpha');
        // add.componentTransfer({
        //     g: { type: 'gamma', amplitude: 1, exponent: 0.5 }
        // })
        // transparent for white color
        //     .colorMatrix('matrix', [
        //         1.0, 0, 0, 0, 0
        //         , 0, 1.0, 0, 0, 0
        //         , 0, 0, 1.0, 0, 0
        //         , -0.5, -0.5, -0.5, 1.5, 0])
            .colorMatrix('matrix', [
                1.0, 0, 0, 0, 0
                , 0, 1.0, 0, 0, 0
                , 0, 0, 1.0, 0, 0
                , -1, -1, -1, 1, 0])
        //     .colorMatrix('matrix', [
        //         0, 0, 0, 1, 0
        //         , 0, 0, 0, 1, 0
        //         , 0, 0, 0, 1, 0
        //         , 1, 1, 1, 0, 1])
        // .gaussianBlur(1);
    });
    // elementList.push(image);
    image.on('click', function () {
        selectElement(this);
    });
    image.on('del', function () {
        delElement(this);
    });
    // force select the last element
    selectElement(image);
    hideForm("addimg");
}

function delElement(ele) {
    // console.log("delElement:"+ele);
    if (selectedElement === ele) {
        selectedElement.selectize(false);
        selectedElement = null;
    }
    // elementList.pop(ele);
    if (ele.attr('filter') !== undefined && ele.attr('filter') !== null) {
        ele.unfilter(true);
    }
    ele.remove();
}

<!-- for font picker -->
var webFontsAPIKey = 'AIzaSyBb2tYhJu7VFKLXHyABwSfO-KghHaJXKG0', webFontsAPIURL = 'https://www.googleapis.com/webfonts/v1/webfonts?', webFontsURL = 'http://fonts.googleapis.com/css?';
var defaultFonts = [
    {
        label: 'Default sans-serif',
        family: 'sans-serif',
        kind: 'default'
    },
    {
        label: 'Default serif',
        family: 'serif',
        kind: 'default'
    },
    {
        label: 'Default monospaced',
        family: 'monospace',
        kind: 'default'
    },
    {
        label: 'Default handwriting',
        family: 'cursive',
        kind: 'default'
    }
];
var sortOrderOptions = [
    'popularity',
    'trending',
    'alpha'
];
var webFonts = defaultFonts, sortOrder = sortOrderOptions[0], batchSize = 10;
var importStyleSheet = d3.select('head').append('style').attr('class', 'font-picker-fontImportRules').node().sheet;
var fontStyleSheet = d3.select('head').append('style').attr('class', 'font-picker-fontRules').node().sheet;
var lastFontID = 0;
var picker = d3.selectAll('div.font-picker').datum(function (d) {
    d = d || {};
    var thisPicker = d3.select(this);
    d.id = this.id || 'font-picker-id-' + lastFontID++;
    if (!this.id)
        thisPicker.attr('id', d.id);
    d.targetSelector = thisPicker.attr('data-target-selector');
    return d;
}).call(updateFamilyList).call(loadWebFontList);
function updateFamilyList(fontPicker) {
    fontPicker.each(function (parent) {
        d3.select(this).selectAll('.font-family.selection-list').datum(function (d) {
            if (d)
                return d;
            var selector;
            if (this.hasAttribute('data-target-selector')) {
                var parentSplit = parent.targetSelector.split(',');
                var thisSplit = this.getAttribute('data-target-selector').split(',');
                var selectorList = [];
                parentSplit.forEach(function (p) {
                    thisSplit.forEach(function (t) {
                        selectorList.push(p + ' ' + t);
                    });
                });
                selector = selectorList.join(', ');
            } else {
                selector = parent.targetSelector;
            }
            var id = this.id || parent.id + '-list';
            return {
                targetSelector: selector,
                id: id
            };
        });
    });
    var familyPick = fontPicker.selectAll('.font-family.selection-list').on('scroll', function (d) {
        if (d.trigger)
            clearTimeout(d.trigger);
        var that = this;
        d.trigger = setTimeout(function () {
            var children = that.querySelectorAll('div.option'), visible = that.scrollTop;
            for (var i = 0, max = children.length; i < max; i++) {
                if (window.CP.shouldStopExecution(1)) {
                    break;
                }
                if (children[i].offsetTop >= visible) {
                    loadWebFontTitles(i - 1, batchSize);
                    break;
                }
            }
            window.CP.exitedLoop(1);
            d.trigger = null;
        }, 300);
    }).on('change', function (d) {
        if (d.trigger2)
            clearTimeout(d.trigger2);
        var that = this, theEvent = d3.event;
        d.trigger2 = setTimeout(function () {
            loadNewFont.call(that, d, theEvent);
            d.trigger2 = null;
        }, 500);
    });
    var familyOptions = familyPick.selectAll('div.option').data(webFonts, function (d) {
        return d.family;
    });
    var newOptions = familyOptions.enter().insert('div').attr('class', 'font-family option');
    newOptions.append('input').attr('type', 'radio').attr('id', familyAsID).attr('name', listAsName).attr('value', function (d) {
        return d.family;
    }).on('focus', function (d, i) {
        this.offsetParent.scrollTop = this.offsetTop - 10;
    });
    newOptions.append('label').attr('for', familyAsID).text(function (d) {
        return d.label || d.family;
    }).style('font-family', function (d) {
        return d.family;
    }, 'important');
    function listAsName(d) {
        return this.parentNode.parentNode.id + '-font-family';
    }

    function familyAsID(d) {
        return listAsName.call(this, d) + d.family.replace(/\s/, '');
    }
}
function loadWebFontList(fontPicker) {
    var completeURL = webFontsAPIURL + 'key=' + webFontsAPIKey + '&sort=' + sortOrder;
    d3.json(completeURL, processFontList);
    function processFontList(error, fontList) {
        if (error) {
            console.log('Could not access ', webFontsAPIURL);
            return;
        }
        webFonts = webFonts.concat(fontList.items);
        webFonts.forEach(function (d) {
            d.familyPlus = d.family.replace(/\s/g, '+');
            d.url = encodeURIComponent(d.family);
        });
        loadWebFontTitles(0, batchSize);
        updateFamilyList(fontPicker);
    }
}
function loadWebFontTitles(startIndex, length) {
    var slice = webFonts.slice(startIndex, startIndex + length).filter(function (d) {
        return !d.importRule && d.kind == 'webfonts#webfont';
    });
    if (!slice.length)
        return;
    var ruleNum = importStyleSheet.cssRules.length;
    var familyList = '', textList = '';
    slice.forEach(function (d) {
        familyList += '|' + d.familyPlus;
        if (d.variants.indexOf('regular') < 0)
            familyList += ':' + d.variants[0];
        textList += d.url;
    });
    familyList = familyList.slice(1);
    importStyleSheet.insertRule('@import url(' + webFontsURL + 'family=' + familyList + '&text=' + textList + ')', ruleNum);
    var rule = importStyleSheet.cssRules[ruleNum++];
    slice.forEach(function (d) {
        d.importRule = rule;
    });
}
function loadNewFont(familyPickerData, changeEvent) {
    var fontData = d3.select(changeEvent.target).datum();
    var ruleNum = fontStyleSheet.cssRules.length;
    if (!fontData.fontFaceRule && fontData.kind == 'webfonts#webfont') {
        var variant = {};
        var file = fontData.files['regular'];
        if (!file) {
            variant.name = fontData.variants[0];
            variant.weight = variant.name.replace(/\D*/, '');
            variant.style = variant.name.replace(/\d*/, '');
            file = fontData.files[variant.name];
        }
        fontStyleSheet.insertRule([
            '@font-face {',
            'font-family:',
            fontData.family,
            '; font-style:',
            variant.style || 'normal',
            '; font-weight:',
            variant.weight || '400',
            '; src:',
            'local(' + fontData.family + '),',
            'local(' + fontData.family.replace(/\s/g, '') + '),',
            'url(' + file + ')',
            '}'
        ].join(' '), ruleNum);
        fontData.fontFaceRule = fontStyleSheet.cssRules[ruleNum++];
    }
    if (!familyPickerData.targetRule) {
        fontStyleSheet.insertRule(familyPickerData.targetSelector + '{}', ruleNum);
        familyPickerData.targetRule = fontStyleSheet.cssRules[ruleNum++];
    }
    familyPickerData.targetRule.style['fontFamily'] = fontData.family;
}
// var styleElement = d3.select('head').append('style').attr('class', 'colour-picker-styles');
// var styleSheet = styleElement.node().sheet;
// var lastID = 0;
// var formatPercent = d3.format('0.5%');
// var radiansPerDegree = Math.PI / 180;
// function initializeColourPickers() {
//     var colourPick = d3.selectAll('div.colour-picker');
//     colourPick.datum(function (d, i) {
//         if (!d) {
//             d = d || {};
//             var thisPicker = d3.select(this);
//             d.id = this.id || 'colour-picker-id-' + lastID++;
//             if (!this.id)
//                 thisPicker.attr('id', d.id);
//             d.inputNode = thisPicker.select('input').node();
//             d.hslValue = d3.hsl(d.inputNode.value || '#888');
//             d.targetSelector = thisPicker.attr('data-target-selector');
//             d.targetStyle = thisPicker.attr('data-target-style');
//             var ruleNum = styleSheet.cssRules.length;
//             styleSheet.insertRule(d.targetSelector + '{}', ruleNum);
//             d.targetRule = styleSheet.cssRules[ruleNum++];
//             styleSheet.insertRule('#' + d.id + '::before {}', ruleNum);
//             d.circleLightnessRule = styleSheet.cssRules[ruleNum++];
//             styleSheet.insertRule('#' + d.id + ' > *:last-child::before {}', ruleNum);
//             d.circleDarknessRule = styleSheet.cssRules[ruleNum++];
//             styleSheet.insertRule('#' + d.id + ' > *:last-child::after {}', ruleNum);
//             d.colourPointRule = styleSheet.cssRules[ruleNum++];
//             styleSheet.insertRule('#' + d.id + '::after {}', ruleNum);
//             d.brightnessPointRule = styleSheet.cssRules[ruleNum++];
//         }
//         return d;
//     }).each(updateAria).each(updateStyles).on('mousedown', function (d) {
//         if (d3.event.target != this)
//             return;
//         var mouse = d3.mouse(this), styles = getComputedStyle(this);
//         d.width = parseFloat(styles['width']);
//         d.height = parseFloat(styles['height']) + parseFloat(styles['paddingBottom']);
//         d.fontSize = parseFloat(styles['fontSize']);
//         if (mouse[1] >= d.height - d.width - d.fontSize / 2) {
//             trackColourCircle.call(this, d);
//             d3.select(this).on('mousemove.colour', trackColourCircle);
//         } else {
//             trackBrightnessSlider.call(this, d);
//             d3.select(this).on('mousemove.colour', trackBrightnessSlider);
//         }
//     }).on('mouseup', function (d) {
//         d3.select(this).on('mousemove.colour', null);
//     }).on('keydown', trackArrows).on('keypress', trackPlusMinus).select('input').on('change', function (d) {
//         d.hslValue = d3.hsl(this.value);
//         updateStyles(d);
//     }).on('focus', function (d) {
//         d3.select('#' + d.id).attr('inputFocused', true);
//     }).on('blur', function (d) {
//         d3.select('#' + d.id).attr('inputFocused', null);
//     });
// }
// function hueSaturationAsLeftPercent(d) {
//     if (isNaN(d.hslValue['h']))
//         return '50%';
//     var x = d.hslValue['s'] * Math.sin((d.hslValue['h'] + 30) * radiansPerDegree);
//     return formatPercent(0.5 + x / 2);
// }
// function hueSaturationAsBottomPercent(d) {
//     if (isNaN(d.hslValue['h']))
//         return '50%';
//     var y = d.hslValue['s'] * Math.cos((d.hslValue['h'] + 30) * radiansPerDegree);
//     return formatPercent(0.5 + y / 2);
// }
// function hueSaturationAsPureColour(d) {
//     return d.hslValue['s'] ? d3.hsl(d.hslValue['h'], d.hslValue['s'], 0.5).toString() : '#888888';
// }
// function lightnessAsLeftPadding(d) {
//     return formatPercent(d.hslValue['l']);
// }
// function lightnessAsRightPadding(d) {
//     return formatPercent(1 - d.hslValue['l']);
// }
// function lightnessAsProportionIntensity(d) {
//     return Math.min(1, 2 * (1 - d.hslValue['l']));
// }
// function lightnessAsTranslucentBlack(d) {
//     return 'rgba(0,0,0,' + Math.max(0, 1 - 2 * d.hslValue['l']) + ')';
// }
// function updateAria(d, i) {
//     var selectThis = d3.select(this).attr('role', 'slider').attr('aria-controls', d3.selectAll(d.targetSelector)[0].map(function (element) {
//         return element.id;
//     }).join('; '));
//     var labelElement = selectThis.select('label'), labelString = 'Colour selector for ';
//     if (labelElement.empty())
//         labelString += d.targetStyle;
//     else {
//         labelString += labelElement.text();
//     }
//     selectThis.attr('aria-label', labelString);
// }
// function updateStyles(d, i) {
//     d.inputNode.value = d.hslValue.toString();
//     d3.select(d.inputNode).style('border-color', d.hslValue);
//     d3.select('#' + d.id).attr('aria-valuenow', 'hue:' + d.hslValue.h + ' degrees; Saturation:' + formatPercent(d.hslValue.h) + '; Lightness:' + formatPercent(d.hslValue.l));
//     d.targetStyle.split(',').forEach(function (style) {
//         d.targetRule.style[style.trim()] = d.hslValue.toString();
//     });
//     d.circleLightnessRule.style['opacity'] = lightnessAsProportionIntensity(d);
//     d.circleDarknessRule.style['backgroundColor'] = lightnessAsTranslucentBlack(d);
//     d.colourPointRule.style['marginBottom'] = hueSaturationAsBottomPercent(d);
//     d.colourPointRule.style['marginLeft'] = hueSaturationAsLeftPercent(d);
//     d.brightnessPointRule.style['backgroundColor'] = hueSaturationAsPureColour(d);
//     d.brightnessPointRule.style['paddingLeft'] = lightnessAsLeftPadding(d);
//     d.brightnessPointRule.style['paddingRight'] = lightnessAsRightPadding(d);
// }
// function trackColourCircle(d) {
//     var mouse = d3.mouse(this), radius = d.width / 2, relX = radius - mouse[0], relY = radius - (d.height - mouse[1]), r = Math.sqrt(relX * relX + relY * relY), a = Math.atan2(-relX, -relY);
//     d.hslValue = d3.hsl((360 + a / radiansPerDegree - 30) % 360, Math.min(1, r / radius), d.hslValue['l']);
//     updateStyles(d);
// }
// function trackBrightnessSlider(d) {
//     var mouse = d3.mouse(this);
//     d.hslValue['l'] = mouse[0] / d.width;
//     updateStyles(d);
// }
// function trackPlusMinus(d) {
//     if (d3.event.target != this)
//         return;
//     switch (d3.event.charCode) {
//         case 43:
//             d.hslValue['l'] = Math.min(1, d.hslValue['l'] + 0.01);
//             break;
//         case 45:
//             d.hslValue['l'] = Math.max(0, d.hslValue['l'] - 0.01);
//             break;
//         default:
//             return;
//     }
//     updateStyles(d);
// }
// function trackArrows(d) {
//     if (d3.event.target != this)
//         return;
//     var arrows = {
//         left: 37,
//         up: 38,
//         right: 39,
//         down: 40,
//         numLeft: 100,
//         numUp: 104,
//         numRight: 102,
//         numDown: 98,
//         leftUp: 36,
//         numLeftUp: 103,
//         rightUp: 33,
//         numRightUp: 105,
//         rightDown: 34,
//         numRightDown: 99,
//         leftDown: 35,
//         numLeftDown: 97,
//         center: 12,
//         numCenter: 101
//     };
//     if (isNaN(d.hslValue['h']))
//         d.hslValue['h'] = 0;
//     var x = d.hslValue['s'] * Math.sin((d.hslValue['h'] + 30) * radiansPerDegree), y = d.hslValue['s'] * Math.cos((d.hslValue['h'] + 30) * radiansPerDegree);
//     switch (d3.event.keyCode) {
//         case arrows.left:
//         case arrows.numLeft:
//         case arrows.leftUp:
//         case arrows.numLeftUp:
//         case arrows.leftDown:
//         case arrows.numLeftDown:
//             x = Math.max(-1, x - 0.05);
//             break;
//         case arrows.right:
//         case arrows.numRight:
//         case arrows.rightUp:
//         case arrows.numRightUp:
//         case arrows.rightDown:
//         case arrows.numRightDown:
//             x = Math.min(1, x + 0.05);
//             break;
//         case arrows.up:
//         case arrows.numUp:
//         case arrows.down:
//         case arrows.numDown:
//         case arrows.center:
//         case arrows.numCenter:
//             break;
//         default:
//             return;
//     }
//     switch (d3.event.keyCode) {
//         case arrows.up:
//         case arrows.numUp:
//         case arrows.leftUp:
//         case arrows.numLeftUp:
//         case arrows.rightUp:
//         case arrows.numRightUp:
//             y = Math.max(-1, y + 0.05);
//             break;
//         case arrows.down:
//         case arrows.numDown:
//         case arrows.leftDown:
//         case arrows.numLeftDown:
//         case arrows.rightDown:
//         case arrows.numRightDown:
//             y = Math.min(1, y - 0.05);
//             break;
//         case arrows.center:
//         case arrows.numCenter:
//             x = 0;
//             y = 0;
//     }
//     d3.event.preventDefault();
//     var r = Math.sqrt(x * x + y * y), a = Math.atan2(x, y);
//     d.hslValue = d3.hsl((360 + a / radiansPerDegree - 30) % 360, Math.min(1, r), d.hslValue['l']);
//     updateStyles(d);
// }
// initializeColourPickers();
// //# sourceURL=pen.js
