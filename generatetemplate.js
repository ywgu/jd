/**
 * Created by William Gu on 2017/3/14.
 */
// NOTE:
// 1. the x="123" must NOT have space between x and =; use code format before run this program
// 2. NO tranform for text or image component is allowed
// STEPS:
// 0. all replaceable items should be textxx or imagexx.
// text style should be in tspan element.
// remove xml:space="preserve" and format code;
// install new fonts on linux
// 1. node generatetemplate name num idx
// 2. set jd_bd clip area, align text, image for all textxx or imagexx items.
// 3. node generatetemplate2 name num idx
// 4. node checktemplate name num idx
// 5. copy svg, png, jpg, gif files to templates directory

var fs = require("fs");
var path = require('path');
var stream = require('stream');
var transform = require('stream').Transform;
var tools = require('./tools');
var publicDir = path.normalize(path.join(__dirname, '.', 'public'));
var templateDir = path.join(publicDir, "designs/templates");
var tempDir = path.join(publicDir, "designs/templates/designer/temp");


var templateName;
var templateNum;
var templateIdx;

var fontList = ["", "", "", ""];
// use: node generatetemplate 0020001 3 22
// generate from 0020001-0.svg 0020001-1.svg 0020001-2.svg to 002000122-0.svg 002000122-1.svg 002000122-2.svg + png, gif images
process.argv.forEach(function (val, index, array) {
    if (index === 2) {
        templateName = val;
    }
    else if (index === 3) {
        templateNum = val;
    }
    else if (index === 4) {
        templateIdx = val;
    }
});
console.log("args:" + templateName + "," + templateNum + "," + templateIdx);
generate(templateName, templateNum, templateIdx);


// function to process the jd_bg i.e. background image
// function processBgImg(line) {
//     // console.log("line:"+line);
//     if (line.indexOf("\"jd_bg\"") > 0)
//         return line.replace("https://design.jitdiy.com/designs/templates/","../../")+"\n";
//     return line+"\n";
// }

// function to remove the jd_bd i.e. rectangle boundary
function removeBdTag(line) {
    if (line.indexOf("\"jd_bd\"") > 0)
        return "";
    return line + "\n";
}
// function to remove the xml:space="preserve"
function removeXMLSpacePreserveTag(line) {
    if (line.indexOf("xml:space=\"preserve\"") > 0)
        return line.replace("xml:space=\"preserve\"", "") + "\n";
    return line + "\n";
}
// function to process the jd_nt i.e. embedded components
var ntTag = false;
var firstCloseG = false;
function processNtTag(line) {
    // console.log("=="+line);
    if (line.indexOf("<g") === 0 && line.indexOf("jd_nt") > 0) {
        ntTag = true;
        firstCloseG = true;
    }
    else if (ntTag === true && firstCloseG === true && line.indexOf("</g>") === 0) {
        firstCloseG = false;
        return "";
    }
    else if (ntTag === true && line.indexOf("</svg>") === 0)
        return "</g>\n</svg>\n";
    return line + "\n";
}

// function to process the text data with id of "textXX"
function processTextTag(line) {
    var addAttrStr = "";
    var textId = tools.getAttrValue(line, "id");
    // console.log("id:"+textId);
    if (textId !== null && textId.indexOf("text") === 0 && textId.length === 6) {
        // try to add style attribute first if style doesn't exist
        line = tools.addAttr(line, "style", "text-anchor:middle;text-align:center");
        // console.log(line);
        if (line.indexOf("text-anchor:middle") === -1)
            addAttrStr += "text-anchor:middle;";
        if (line.indexOf("text-align:center") === -1)
            addAttrStr += "text-align:center;";
        // console.log(line+",addAttrStr:"+addAttrStr);
        var newStyle = tools.getAttrValue(line, "style") + ";" + addAttrStr;
        line = tools.replaceAttrValue(line, "style", newStyle);
        return line;
    }
    // console.log("getWidth:"+getWidthOfText("aaa","Ewert",16));
    return line + "\n";
}

// function to process the image data with id of "imageXX"
function processImageTag(line) {
    var imageId = tools.getAttrValue(line, "id");
    if (imageId !== null && imageId.indexOf("image") === 0) {
        var newImgLine = "";
        var x = tools.getAttrValue(line, "x");
        var y = tools.getAttrValue(line, "y");
        var w = tools.getAttrValue(line, "width");
        var h = tools.getAttrValue(line, "height");
        var viewBox = "0 0 " + w + " " + h;
        // handle clip-path for image
        var clipPath = tools.getAttrValue(line, "clip-path");
        // console.log(clipPath);
        if (clipPath !== null) {
            newImgLine += "<g clip-path=\"" + clipPath + "\" id=\"cp-layer\">"
        }
        // console.log("viewBox:"+viewBox);
        newImgLine += "<svg version=\"1.1\" viewBox=\"" + viewBox
            + "\" x=\"" + x + "\" y=\"" + y + "\" width=\"" + w + "\" height=\"" + h + "\" preserveAspectRatio=\"xMidYMid meet\">";
        var imgLine = line;
        imgLine = tools.removeAttr(imgLine, "x");
        imgLine = tools.removeAttr(imgLine, "y");
        imgLine = tools.removeAttr(imgLine, "preserveAspectRatio");
        if (clipPath !== null) {
            imgLine = tools.removeAttr(imgLine, "clip-path");
        }
        newImgLine += imgLine;
        newImgLine += "</svg>";
        if (clipPath !== null) {
            newImgLine += "</g>"
        }
        // newImgLine = tools.replaceAttrValue(newImgLine,"xlink:href","/designs/templates/"+getAttrValue(newImgLine,"xlink:href"));
        // newImgLine = tools.replaceAttrValue(newImgLine,"xlink:href","../../"+getAttrValue(newImgLine,"xlink:href"));
        // console.log("img:"+newImgLine);
        return newImgLine + "\n";
    }
    return line + "\n";
}

// function to add font line
function addFontsLine(line, fontStr) {
    if (fontStr.length > 0 && line.indexOf("<?xml ") >= 0) {
        return line + "\n" + "<?xml-stylesheet type=\"text/css\" href=\"https://fonts.googleapis.com/css?family=" + fontStr.substring(0, fontStr.length - 1) + "\"?>\n";
    }
    return line + "\n";
}
// generate from input(0020001-1.svg) to output(002000122-0.svg)
function processSVGImage(i, inputFile, outputFile) {
    console.log("processSVGImage:" + i + "," + inputFile + ",output:" + outputFile);

    // var processBg = new transform();
    // processBg._transform = function (data, encoding, cb) {
    //     // do transformation
    //     cb(null, tools.processData(data,processBgImg));
    // };

    var removeBd = new transform();
    removeBd._transform = function (data, encoding, cb) {
        // do transformation
        cb(null, tools.processData(data, removeBdTag));
    };
    var removeXMLSpacePreserve = new transform();
    removeXMLSpacePreserve._transform = function (data, encoding, cb) {
        // do transformation
        cb(null, tools.processData(data, removeXMLSpacePreserveTag));
    };
    var processNt = new transform();
    processNt._transform = function (data, encoding, cb) {
        // do transformation
        cb(null, tools.processData(data, processNtTag));
    };

    var processTextLine = new transform();
    processTextLine._transform = function (data, encoding, cb) {
        // do transformation
        cb(null, tools.processData(data, processTextTag));
    };

    var processImageLine = new transform();
    processImageLine._transform = function (data, encoding, cb) {
        // do transformation
        cb(null, tools.processData(data, processImageTag));
    };

    // var getFonts = new transform();
    // getFonts._transform = function (data, encoding, cb) {
    //     // do transformation
    //     cb(null, tools.processData(data, getFontsList));
    // };
    var addFonts = new transform();
    addFonts._transform = function (data, encoding, cb) {
        // do transformation
        // console.log("transform:" + fontList[i]);
        cb(null, tools.processData(data, addFontsLine, fontList[i]));
    };

    var inputPath = tempDir + "/" + inputFile + ".svg";
    var inputStream1 = fs.createReadStream(inputPath);
    var outputPath = tempDir + "/" + outputFile + ".svg";
    var outputStream1 = fs.createWriteStream(outputPath);
    inputStream1
        .pipe(removeBd)
        .pipe(removeXMLSpacePreserve)
        .pipe(processNt)
        .pipe(processTextLine)
        .pipe(processImageLine)
        .pipe(addFonts)
        .pipe(outputStream1);

    // delay 2 seconds for the first round is over
    // setTimeout(function () {
    //     console.log("start second round");
    //     var inputStream2 = fs.createReadStream(outputPath);
    //     outputPath = tempDir + "/" + outputFile + ".svg";
    //     var outputStream2 = fs.createWriteStream(outputPath);
    //     inputStream2
    //         .pipe(addFonts)
    //         .pipe(outputStream2);
    // }, 2000);

}

function getFontList(i, inputFile) {
    var inputPath = tempDir + "/" + inputFile + ".svg";
    var contents = fs.readFileSync(inputPath, 'utf8');
    // console.log(contents);
    var fontIdx = contents.indexOf("font-family:");
    while (fontIdx > 0) {
        // console.log(line);
        var aFont = contents.substring(fontIdx + 12, contents.indexOf(";", fontIdx + 12));
        if (aFont.indexOf('\'') === 0)
            aFont = aFont.substring(1,aFont.length - 1);
        aFont = aFont.replace(/ /g,"+");
        aFont = aFont + "|";
        // console.log(fontList+","+aFont);
        // console.log(fontList+aFont);
        if (fontList[i].indexOf(aFont) < 0) {
            fontList[i] = fontList[i].concat(aFont);
            console.log("fontList " + i + ":" + fontList[i]);
        }
        fontIdx = contents.indexOf("font-family:", fontIdx+12);
    }

}
function generate(templateName, templateNum, templateIdx) {
    fontList = [];
    for (var i = 0; i < templateNum; i++) {
        // initialize variables
        fontList[i] = "";
        getFontList(i, templateName + "-" + i);
        processSVGImage(i, templateName + "-" + i, templateName + templateIdx + "--" + i);
    }

    // addToTemplateFile();    // NOTE: add a jd_bd before processing starts

}
