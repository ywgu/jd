/**
 * Created by William Gu on 2016/12/3.
 */
var im = require('imagemagick');
var fs = require("fs");
var path = require('path');
var dataDir = path.normalize(path.join(__dirname, '.', 'public'));
var designDir = path.join(dataDir, "designs");
var cmd = require('node-cmd');

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
    // generate the animated image： following command had a missing image error
    // im.convert(['-delay', '100', '-resize', '600x400', designDir + "/temp-" + did + '-?.svg', designDir + "/" + did + '.gif'],
    //     function (err, stdout) {
    //         if (err) throw err;
    //         console.log('stdout:', stdout);
    //     });
    var cmdline = "cd "+designDir+";convert -delay 100 -resize \"150x100\" temp-" + did + "-?.svg " + did + ".gif";
    console.log("cmd is "+cmdline);
    cmd.get(
        cmdline,
        function(data) {
            console.log('the result is :' + data + '|');
            process.exit("DONE");
        }
    );

    // generate a larger animated gif image with water mark for sharing
    var cmdline2 = "cd "+designDir+";convert -delay 100 -resize \"600x400\" temp-" + did + "-?.svg " + did + "-s.gif";
    cmdline2 += "; convert "+did+"-s.gif  -font Arial -pointsize 16 -draw \"gravity northeast fill black text 3,4 'JITDIY.COM' fill white  text 4,3 'JITDIY.COM' \" "+did+"-s.gif";
    cmdline2 += ";ffmpeg -i "+did+"-s.gif -movflags faststart -pix_fmt yuv420p -vf \"scale=trunc(iw/2)*2:trunc(ih/2)*2\" "+did+".mp4";
    cmdline2 += ";convert -resize \"600x375\" temp-" + did + "-0.svg " + did + "-s.jpg";
    console.log("cmd2 is "+cmdline2);
    cmd.get(
        cmdline2,
        function(data) {
            console.log('the result for cmd2 is :' + data + '|');
            // // add watermark on the image
            // var cmdline3 = "convert "+did+"-s.gif  -font Arial -pointsize 20 -draw \"gravity southeast fill black text 10,18 'JITDIY.COM' fill white  text 11,17 'JITDIY.COM' \" "+did+"-s.gif";
            // console.log("cmd3 is "+cmdline3);
            // cmd.get(
            //     cmdline3,
            //     function(data) {
            //         console.log('the result for cmd3 is :' + data + '|');
            //         process.exit("DONE");
            //     }
            // );
            process.exit("DONE");
        }
    );




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