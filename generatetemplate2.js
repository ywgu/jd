/**
 * Created by William Gu on 2017/4/25.
 */
// NOTE:
// 1. the x="123" must NOT have space between x and =; use code format before run this program
// 2. NO transform for text or image component is allowed

var fs = require("fs");
var path = require('path');
var stream = require('stream');
var transform = require('stream').Transform;
var tools = require('./tools');
var cmd = require('node-cmd');
var publicDir = path.normalize(path.join(__dirname, '.', 'public'));
var templateDir = path.join(publicDir, "designs/templates");
var tempDir = path.join(publicDir, "designs/templates/designer/temp");


var templateName;
var templateNum;
var templateIdx;
// use: node generatetemplate2 0020001 3 22
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
function processBgImg(line) {
    // console.log("line:"+line);
    if (line.indexOf("\"jd_bg\"") > 0)
        return tools.replaceAttrValue(line,"xlink:href","/designs/templates/"+tools.getAttrValue(line,"xlink:href"))+"\n";
    return line+"\n";
}

// function to process the image data with id of "imageXX"
function processImageTag(line) {
    var imageId = tools.getAttrValue(line,"id");
    if (imageId !== null && imageId.indexOf("image") === 0) {
        var newImgLine = tools.replaceAttrValue(line,"xlink:href","/designs/templates/"+tools.getAttrValue(line,"xlink:href"));
        return newImgLine+"\n";
    }
    return line+"\n";
}

// generate from input(0020001-1.svg) to output(002000122-0.svg)
function processImage(inputFile, outputFile) {
    console.log("processImage:" + inputFile + ",output:" + outputFile);
    var inputPath = tempDir + "/" + inputFile + ".svg";
    var inputStream = fs.createReadStream(inputPath);
    var outputPath = tempDir + "/" + outputFile + ".svg";
    var outputStream = fs.createWriteStream(outputPath);

    var processBg = new transform();
    processBg._transform = function (data, encoding, cb) {
        // do transformation
        cb(null, tools.processData(data,processBgImg));
    };

    var processImageLine = new transform();
    processImageLine._transform = function (data, encoding, cb) {
        // do transformation
        cb(null, tools.processData(data,processImageTag));
    };

    inputStream.pipe(processBg).pipe(processImageLine).pipe(outputStream);
}

function generatePngs(src,dest) {
    var cmdline = "inkscape -a 0:-300:1600:1300 -w 64 -h 64 -e "+dest+" "+src;
    console.log("cmd is "+cmdline);
    cmd.get(
        cmdline,
        function(data) {
            console.log('the generatePngs result is :' + data + '|');
            //process.exit("DONE");
        }
    );
}

function generateGif(src, dest) {
    var cmdline = "convert -delay 100 -resize 300x200 " + src + " " + dest;
    console.log("cmd is "+cmdline);
    cmd.get(
        cmdline,
        function(data) {
            console.log('the generateGit result is :' + data + '|');
            // process.exit("DONE");
        }
    );
}

function generate(templateName, templateNum, templateIdx) {
    for (var i = 0; i < templateNum; i++) {
        generatePngs(tempDir+"/"+templateName + templateIdx + "--" + i+".svg", tempDir+"/"+templateName + templateIdx + "-" + i+".png");
        processImage(templateName + templateIdx + "--" + i, templateName + templateIdx + "-" + i);
    }
    generateGif(tempDir+"/"+templateName + templateIdx + "--?"+".svg", tempDir+"/"+templateName + templateIdx + ".gif");
    // addToTemplateFile();    // NOTE: add a jd_bd before processing starts

}
