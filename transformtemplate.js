var processtemplate = require('./processtemplate.js');
var fs = require("fs");
var path = require('path');
var publicDir = path.normalize(path.join(__dirname, '.', 'public'));
var templateDir = path.join(publicDir, "designs/templates");
var tempDir = path.join(publicDir, "designs/templates/designer/temp");

var templateName;
var templateNum;
var templateIdx;
var ignoreFontList = [ 'sans-serif', 'serif' ];
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
transform(templateName, templateNum, templateIdx);

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
        if (ignoreFontList.indexOf(aFont) === -1)
            aFont = aFont + "|";
        else
            aFont = "";
        // console.log(fontList+","+aFont);
        // console.log(fontList+aFont);
        if (fontList[i].indexOf(aFont) < 0) {
            fontList[i] = fontList[i].concat(aFont);
            // console.log("fontList " + i + ":" + fontList[i]);
        }
        fontIdx = contents.indexOf("font-family:", fontIdx+12);
    }
}

// 1. tag or attr
// 2. D: delete; RA: ReplacePartialValue; SI: Special process for image tag; AF: Add Fonts
// 3. attr=value
// 4. new settings

function transform(templateName, templateNum, templateIdx) {
    fontList = [];
    var cmds = [
        "tag|D|id=jd_bd",
        "attr|RPV|id=text[0-9][0-9]|style=text-anchor:middle",
        "attr|RPV|id=text[0-9][0-9]|style=text-align:center",
        "tag|DA|id=text[0-9][0-9]|xml:space",
        "tag|SI|id=image[0-9][0-9]",
        "tag|AF|<fonts>"
    ];
    // var i = 1;
    for (var i = 0; i < templateNum; i++) {
        // initialize variables
        fontList[i] = "";
        getFontList(i, templateName + "-" + i);
        // console.log("cmds:"+cmds);
        var currentCmds = cmds.slice();
        for (var j in currentCmds) {
            currentCmds[j] = currentCmds[j].replace("<fonts>",fontList[i]);
            // console.log("cmd:"+currentCmds[j]);
        }
        processtemplate(tempDir + "/" + templateName + "-" + i + ".svg",tempDir + "/" + templateName + templateIdx + "--" + i + ".svg", currentCmds);
        // while (!processtemplate[1]) {
        //     var waitTill = new Date(new Date().getTime() + 2 * 1000);
        //     while(waitTill > new Date()){}
        // }
        require('wait-for-stuff').for.time(1);
    }
    // addToTemplateFile();    // NOTE: add a jd_bd before processing starts
}

// test call here
// for (var j in cmds) {
//     cmds[j] = cmds[j].replace("<fonts>",fontList[0]);
//     console.log("cmd:"+cmds[j]);
// }
// processtemplate("0020001-1.svg","output.svg", cmds);