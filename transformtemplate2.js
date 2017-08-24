var processtemplate = require('./processtemplate.js');
var fs = require("fs");
var path = require('path');
var cmd = require('node-cmd');
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
            console.log("fontList " + i + ":" + fontList[i]);
        }
        fontIdx = contents.indexOf("font-family:", fontIdx+12);
    }
}

function generatePngs(src,dest) {
    var cmdline = "inkscape -a 0:-300:1600:1300 -w 64 -h 64 -e "+dest+" "+src;
    console.log("cmd is "+cmdline);
    cmd.get(
        cmdline,
        function(data) {
            console.log('the generatePngs result is :' + data + '|');
            // process.exit("generatePngs DONE");
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

// 1. tag or attr
// 2. D: delete; RA: ReplacePartialValue; SI: Special process for image tag; AF: Add Fonts; PP: Prepend to the value
// 3. attr=value
// 4. new settings
function transform(templateName, templateNum, templateIdx) {
    fontList = [];
    var cmds = [
        "attr|PP|id=jd_bg|xlink:href=/designs/templates/",
        "attr|PP|id=image[0-9][0-9]|xlink:href=/designs/templates/",
        "tag|AF|<fonts>"
    ];
    for (var i = 0; i < templateNum; i++) {
        // initialize variables
        fontList[i] = "";
        getFontList(i, templateName + "-" + i);
        generatePngs(tempDir+"/"+templateName + templateIdx + "--" + i+".svg", tempDir+"/"+templateName + templateIdx + "-" + i+".png");
        require('wait-for-stuff').for.time(1);
        var currentCmds = cmds.slice();
        for (var j in currentCmds) {
            currentCmds[j] = currentCmds[j].replace("<fonts>",fontList[i]);
        }
        processtemplate(tempDir + "/" + templateName + templateIdx + "--" + i + ".svg",tempDir + "/" + templateName + templateIdx + "-" + i + ".svg", currentCmds);
        require('wait-for-stuff').for.time(1);
    }
    generateGif(tempDir+"/"+templateName + templateIdx + "--?"+".svg", tempDir+"/"+templateName + templateIdx + ".gif");
    processTemplatesJson(templateName, templateNum, templateIdx);
}


function processTemplatesJson(templateName, templateNum, templateIdx) {
    fs.readFile(templateDir+'/templates.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            var obj = JSON.parse(data); //now turn it into an object
            // var results = [];
            var results = {};
            // var newZooms = [];
            // var newInputs = [];
            for (var i = 0; i < templateNum; i++) {
                results = require("./collectsvgdata.js")(tempDir + "/" + templateName + templateIdx + "-" + i + ".svg");
                // console.log("result "+i+":"+results[i].zoom+"|"+results[i].inputs);
                // newZooms.push(results[i].zoom);
                // newInputs.push(results[i].inputs);
                require('wait-for-stuff').for.time(1);
            }
            var tid = templateName+templateIdx;
            results["tid"] = tid;
            // find the group
            for (var j in obj.templates) {
                // console.log(obj.templates[j].name);
                var group = obj.templates[j];
                if (group[templateName] !== null && group[templateName] !== undefined) {
                    group[templateName].push(results);
                }
            }
            json = JSON.stringify(obj, null, 2); //convert it back to json
            fs.writeFile(templateDir+'/templates2.json', json, 'utf8', function(err){
                if(err) throw err;
            }); // write it out
        }});
}


// test call here
// for (var j in cmds) {
//     cmds[j] = cmds[j].replace("<fonts>",fontList[0]);
//     console.log("cmd:"+cmds[j]);
// }
// processtemplate("output.svg","output2.svg", cmds);