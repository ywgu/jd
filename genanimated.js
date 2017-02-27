/**
 * Created by William Gu on 2016/12/3.
 */
var im = require('imagemagick');
var fs = require("fs");
var path = require('path');
var dataDir = path.normalize(path.join(__dirname, '.', 'public'));
var designDir = path.join(dataDir, "designs");

process.on('message', function (imgInfo) {
    console.log('genanimated started...' + imgInfo);
    var did = imgInfo.substring(0, imgInfo.indexOf('|'));
    var totalPages = parseInt(imgInfo.substring(imgInfo.indexOf('|')+1));
    var isWin = /^win/.test(process.platform);
    // var totalProcessed = 0;
    // var exiting = false;

    // find the count first DONOT use do while for the loop
    for (var i=0; i<totalPages; i++) {
        var svgFile = designDir + "/" + did + "-" + i + ".svg";
        var tempFile = designDir + "/temp-" + did + "-" + i + ".svg";
        // console.log("svgFile:"+svgFile+",tempFile:"+tempFile);
        preprocess(isWin,svgFile,tempFile);
    }
    // generate the animated image
    im.convert(['-delay', '100', '-resize', '600x400', designDir + "/temp-" + did + '-?.svg', designDir + "/" + did + '.gif'],
        function (err, stdout) {
            if (err) throw err;
            console.log('stdout:', stdout);
        });

    function preprocess(isWin,src, dest) {
        console.log("preprocess: src:"+src+",dest:"+dest);
        // delete dest if exists
        if (fs.existsSync(dest))
            fs.unlinkSync(dest);
        fs.readFileSync(src).toString().split('\n').forEach(function (line) {
            // if (line.indexOf("jd_nt") > 0) {
            //     // remove the clip-path attribute
            //     line = line.replace("clip-path", "cp");
            // }
            // else
            if (line.indexOf("\"/designs/temp/") > 0) {
                if (isWin) {
                    line = line.replace("\"/designs/temp/", "\"" + dataDir + "/designs/temp/");
                }
                else {
                    line = line.replace("\"/designs/temp/", "\"./temp/");
                }
            }
            else if (line.indexOf("\"/designs/templates/") > 0) {
                if (isWin) {
                    line = line.replace("\"/design/", "\"" + dataDir + "/design/");
                }
                else { // for rsvg to embedded images can only be in subdirectories
                    line = line.replace("\"/designs/templates/", "\"./templates/");
                }
            }
            // console.log(line);
            fs.appendFileSync(dest, line.toString() + "\n");
        });
    }
});
module.exports = {};