/**
 * Created by William Gu on 2017/3/14.
 */

var fs = require("fs");
var path = require('path');
var publicDir = path.normalize(path.join(__dirname, '.', 'public'));
var templateDir = path.join(publicDir,"designs/templates/designer/temp");
var productId = null;
var partIndex = null;
var templateId = null;
var previousTagLine = null;

// check parameters
var jd_bg_exists = false;
var jd_nt_exists = false;
var jd_bd_exists = false;
var textCount = 0;
var imgCount = 0;

var templateName;
var templateNum;
var templateIdx;
// node checktemplate 002000202-1.svg 002000202-2.svg
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
// checkAll(templateName, templateNum, templateIdx);

function checkAll(templateName, templateNum, templateIdx) {
    for (var i = 0; i < templateNum; i++) {
        check(templateName + templateIdx + "-" + i+".svg");
    }
}

function check(svgFile) {
    productId = svgFile.substring(0,svgFile.indexOf("-"));
    productId = productId.substring(0,productId.length-2);
    // console.log("productId:"+productId);
    partIndex = svgFile.substring(svgFile.indexOf("-")+1,svgFile.indexOf("."));
    // console.log("partIndex:"+partIndex);
    templateId = svgFile.substring(0,svgFile.indexOf("-"));
    // console.log("templateId:"+templateId);
    jd_bg_exists = false;
    jd_nt_exists = false;
    jd_bd_exists = false;
    textCount = 0;
    imgCount = 0;

    var svgPath = templateDir +"\\"+svgFile;
    console.log("process svg:" + svgPath);
    if (!fs.existsSync(svgPath))
        console.log("ERROR: SVG file "+svgFile+" doesn't exists.");
    var tagLine = "";
    fs.readFileSync(svgPath).toString().split('\n').forEach(function (line) {
        // get a tag line
        if (line.trim().indexOf("<") == 0) {
            previousTagLine = tagLine;
            tagLine = line.trim();
            if (line.indexOf(">") > 0)
                checkTag(tagLine,svgFile);
        }
        else if (line.trim().indexOf(">") > 0) {
            tagLine += " "+line.trim();
            checkTag(tagLine,svgFile);
        }
        else {
            tagLine += " "+line.trim();
        }
    });
    if (!jd_bg_exists)
        console.log("ERROR: image jd_bg doesn't exists!");
    if (!jd_nt_exists)
        console.log("ERROR: group jd_nt doesn't exists!");
    if (!jd_bd_exists)
        console.log("ERROR: boundary jd_bd doesn't exists!");
    // check necessary files exist
    var pngFile = templateDir +"\\"+svgFile.substring(0,svgFile.indexOf(".")+1)+"png";
    if (!fs.existsSync(pngFile))
        console.log("ERROR: "+pngFile+" doesn't exists.");
    var jpgFile = templateDir +"\\"+productId+"01-"+svgFile.substring(svgFile.indexOf("-")+1,svgFile.indexOf(".")+1)+"jpg";
    // console.log("jpgFile:"+jpgFile);
    if (!fs.existsSync(jpgFile))
        console.log("ERROR: Background image "+jpgFile+" doesn't exists.");
    console.log("INFO: total replaceable text is "+textCount);
    console.log("INFO: total replaceable image is "+imgCount);
    // console.log("INFO: make sure you update the templates.json")
}

function checkTag(tagLine,svgFile) {
    // console.log("Tag:" + tagLine);
    // check if the background image exists and starts with /designs/templates/<background image name>
    if (tagLine.indexOf("\"jd_bg\"") > 0) {
        jd_bg_exists = true;
        var bgStr = "href=\"/designs/templates/"+productId;
        // console.log("check bg:"+bgStr);
        // console.log("tagLine:"+tagLine);
        if (tagLine.indexOf(bgStr) < 0)
            console.log("ERROR: background image url should starts with /designs/templates/");
    }
    // check if jd_nt group exists
    if (tagLine.indexOf("\"jd_nt\"") > 0 && tagLine.indexOf("<g") == 0) {
        jd_nt_exists = true;
        if (tagLine.indexOf("clip-path=") < 0)
            console.log("ERROR: jd_nt should be clipped in jd_bd boundary");
    }
    if (tagLine.indexOf("\"jd_bd\"") > 0) {
        jd_bd_exists = true;
        if (tagLine.indexOf("<path ") != 0)
            console.log("ERROR: jd_bd should be a path.")
    }
    // count replaceable text and image numbers
    if (tagLine.indexOf("tspan ") > 0 && tagLine.indexOf("\"text"+partIndex) > 0) { // only check <tspan> tag, not <text> tag
        textCount++;
        if (tagLine.indexOf("text-anchor:middle") < 0)
            console.log("WARN: text element doesn't have text-anchor:middle style");
        if (tagLine.indexOf("text-align:center") < 0)
            console.log("WARN: text element doesn't have text-align:center");
    }
    if (tagLine.indexOf("\"image"+partIndex) > 0) {
        imgCount++;
        if (previousTagLine.indexOf("<svg ") !== 0 || previousTagLine.indexOf("preserveAspectRatio=\"xMidYMid meet\"") < 0) {
            console.log("previous line:"+previousTagLine);
            console.log("ERROR: image should be wrapped in a svg with preserveAspectRatio=\"xMidYMid meet\"");
        }
        var imgStr = "href=\"/designs/templates/";
        if (tagLine.indexOf(imgStr) < 0)
            console.log("ERROR: replaceable image url should starts with /designs/templates");
        if (tagLine.indexOf("preserveAspectRatio=\"none\"") >= 0)
            console.log("ERROR: replaceable image should avoid using preserveAspectRatio=\"none\"");
    }
}

module.exports = checkAll;