/**
 * Created by William Gu on 2016/12/3.
 */
var gmm = require('gm');
var fs  = require("fs");
var path = require('path');
var cmd = require('node-cmd');
var dataDir = path.normalize(path.join(__dirname, '.', 'public'));
var designDir = path.join(dataDir, "designs");
var imageMagick = gmm.subClass({ imageMagick: true });

process.on('message', function (imgInfo) {
    console.log('svgtopng started...'+imgInfo);
    var imgsStr = imgInfo.substring(0,imgInfo.lastIndexOf('|'));
    var imgList = JSON.parse(imgsStr).images;
    var zoomStr = imgInfo.substring(imgInfo.lastIndexOf('|')+1)+",";
    var count = 0;
    for (var i=0; i<imgList.length; i++) {
        var imgPath = designDir+"/"+imgList[i].image+".svg";
        var tempImgPath = designDir+"/temp-"+imgList[i].image+".svg";
        var imgDest = imgPath.substring(0,imgPath.lastIndexOf('.'))+".png";
        console.log("svgtopng for "+imgPath+" to："+imgDest);
        var x = zoomStr.substring(0,zoomStr.indexOf(','));
        zoomStr = zoomStr.substring(zoomStr.indexOf(',')+1);
        var y = zoomStr.substring(0,zoomStr.indexOf(','));
        zoomStr = zoomStr.substring(zoomStr.indexOf(',')+1);
        var w = zoomStr.substring(0,zoomStr.indexOf(','));
        zoomStr = zoomStr.substring(zoomStr.indexOf(',')+1);
        var h = zoomStr.substring(0,zoomStr.indexOf(','));
        zoomStr = zoomStr.substring(zoomStr.indexOf(',')+1);
        console.log("x,y,w,h="+x+","+y+","+w+","+h);
        // for linux only
        var isWin = /^win/.test(process.platform);
        preprocess(isWin,imgPath,tempImgPath);
        console.log("isWin:"+isWin);
        // use inkscape for conversion from svg to png
        // convert to inkscape area definition (x1,y1,x2,y2)
        var x1 = parseInt(x);
        var y1 = 1000-parseInt(y)-parseInt(h);
        var x2 = parseInt(x)+parseInt(w);
        var y2 = y1+parseInt(h);
        console.log("x1:"+x1+",y1:"+y1+",x2:"+x2+",y2:"+y2);
        var area = x1+":"+y1+":"+x2+":"+y2;
        var cmdline = "inkscape -a "+area+" -e "+imgDest+" "+tempImgPath;
        console.log("cmd is "+cmdline);
        cmd.get(
            cmdline,
            function(data) {
                console.log('the result is :' + data + '|');
                count++;
                if (count === imgList.length)
                    process.exit("DONE");
            }
        );
        // use ImageMagick has text on textPath issue!!!
        // if (!isWin) {
        //     var tempPngPath = designDir+"/temp-"+imgList[i].image+".png";
        //     var thisZoom = x+","+y+","+w+","+h;
        //     var cmdline = "rsvg "+tempImgPath+" "+tempPngPath+"\necho \'|"+imgDest+"|"+tempPngPath+"|"+thisZoom+"\'";
        //     cmd.get(
        //         cmdline,
        //         function(data) {
        //             console.log('the result is :'+data+'\n\n');
        //             if (data.indexOf('|') >= 0) {
        //                 data = data.substring(data.indexOf('|') + 1);
        //
        //                 var destPath = data.substring(0, data.indexOf('|'));
        //                 data = data.substring(data.indexOf('|') + 1);
        //                 var srcPath = data.substring(0, data.indexOf('|'));
        //                 var zooms = data.substring(data.indexOf('|') + 1);
        //                 var x1 = zooms.substring(0, zooms.indexOf(','));
        //                 zooms = zooms.substring(zooms.indexOf(',') + 1);
        //                 var y1 = zooms.substring(0, zooms.indexOf(','));
        //                 zooms = zooms.substring(zooms.indexOf(',') + 1);
        //                 var w1 = zooms.substring(0, zooms.indexOf(','));
        //                 var h1 = zooms.substring(zooms.indexOf(',') + 1);
        //                 // var h1 = zooms.substring(0, zooms.indexOf(','));
        //                 console.log("src:" + srcPath + ",dest:" + destPath + ",x:" + x1 + ",y:" + y1 + ",w:" + w1 + ",h:" + h1);
        //                 imageMagick(srcPath)
        //                 // .resize(1050, 788)   // 7 inch x 5.25 inch with 150 dpi
        //                     .crop(w1, h1, x1, y1)
        //                     .write(destPath, function (err) {
        //                             if (err) {
        //                                 console.log(err);
        //                                 process.exit("something wrong crop png");
        //                                 return console.dir(arguments);
        //                             }
        //                             console.log(this.outname + ' created :: ' + arguments[3]);
        //                             count++;
        //                             if (count === imgList.length)
        //                                 process.exit("DONE");
        //                         }
        //                     )
        //             }
        //         }
        //     )
        // }
        // // end for linux only
        // else { // windows
        //     // use ImageMagick which has text on textPath doesn't render issue.
        //     imageMagick(tempImgPath)
        //     // .resize(1050, 788)   // 7 inch x 5.25 inch with 150 dpi
        //         .crop(w, h, x, y)
        //         .write(imgDest, function (err) {
        //                 if (err) {
        //                     console.log(err);
        //                     process.exit("something wrong svg to png");
        //                     return console.dir(arguments);
        //                 }
        //                 console.log(this.outname + ' created :: ' + arguments[3]);
        //                 count++;
        //                 if (count === imgList.length)
        //                     process.exit("DONE");
        //             }
        //         );
        // }
    }

    function preprocess(isWin,src, dest) {
        // delete dest if exists
        if (fs.existsSync(dest))
            fs.unlinkSync(dest);
        var checkBgCloseImageTag = false;
        fs.readFileSync(src).toString().split('\n').forEach(function (line) {
            if (checkBgCloseImageTag && line.indexOf("</image>") >= 0) {    // remove the </image> for jd_bg image tag
                line = "";
                checkBgCloseImageTag = false;
            }
            if (line.indexOf("jd_bg") > 0) {
                // remove this line
                line = "";
                checkBgCloseImageTag = true;
            }
            else if (line.indexOf("jd_nt") > 0) {
                // remove the clip-path attribute
                line = line.replace("clip-path", "cp");
            }
            else if (line.indexOf("\"/designs/temp/") > 0) {
                if (isWin) {
                    line = line.replace("\"/designs/temp/", "\"" + dataDir + "/designs/temp/");
                }
                else {
                    line = line.replace("\"/designs/temp/", "\"./temp/");
                }
            }
            else if (line.indexOf("\"/designs/templates/") > 0) {
                if (isWin) {
                    line = line.replace("\"/designs/", "\"" + dataDir + "/designs/");
                }
                // else { // for rsvg to embedded images can only be in subdirectories
                //     line = line.replace("\"/design/templates/", "\"./templateimgs/");
                // }
            }
            // console.log(line);
            fs.appendFileSync(dest, line.toString() + "\n");
        });
    }

});
module.exports = {};