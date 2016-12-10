/**
 * Created by William Gu on 2016/12/3.
 */
var gmm = require('gm');
var fs  = require("fs");
var path = require('path');
var dataDir = path.normalize(path.join(__dirname, '.', 'public'));
var designDir = path.join(dataDir, "designs");

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
        preprocess(imgPath,tempImgPath);
        gmm(tempImgPath)
            // .resize(1050, 788)   // 7 inch x 5.25 inch with 150 dpi
            .crop(w,h,x,y)
            .write(imgDest, function (err) {
                    if (err) {
                        console.log(err);
                        process.exit("something wrong svg to png");
                        return console.dir(arguments);
                    }
                    console.log(this.outname + ' created :: ' + arguments[3]);
                    count++;
                    if (count === imgList.length)
                        process.exit("DONE");
                }
            );
    }

    function preprocess(src, dest) {
        // delete dest if exists
        if (fs.existsSync(dest))
            fs.unlinkSync(dest);
        fs.readFileSync(src).toString().split('\n').forEach(function (line) {
            if (line.indexOf("jd_bg") > 0) {
                // remove this line
                line = "";
            }
            else if (line.indexOf("jd_nt") > 0) {
                // remove the clip-path attribute
                line = line.replace("clip-path", "cp");
            }
            else if (line.indexOf("\"/temp/") > 0) {
                line = line.replace("\"/temp/","\""+dataDir+"/temp/");
            }
            else if (line.indexOf("\"/design/") > 0) {
                line = line.replace("\"/design/","\""+dataDir+"/design/");
            }
            // console.log(line);
            fs.appendFileSync(dest, line.toString() + "\n");
        });
    }

    // // var imgDest = imgInfo.substring(0,imgInfo.lastIndexOf('/')+1)+imgInfo.substring(imgInfo.lastIndexOf('/')+4);
    // var imgPath = imgInfo.substring(0,imgInfo.indexOf('|'));
    // // var imgName = imgPath.substring(0,imgPath.lastIndexOf('/')+1);
    // var imgDest = imgPath.substring(0, imgPath.lastIndexOf('/')+1) +"gpc/"+imgPath.substring(imgPath.lastIndexOf('/')+1, imgPath.lastIndexOf('.'))+".png";
    // console.log("imgPath:"+imgPath+",imgDest:"+imgDest);
    // var imgData = imgInfo.substring(imgInfo.indexOf('|')+1);
    // // convert from base64 to jpg
    // var base64Data = imgData.replace(/^data:image\/jpeg;base64,/, "");
    //
    // require("fs").writeFile(imgPath, base64Data, 'base64', function(err) {
    //     if (err)
    //         console.log(err);
    //     else {
    //         gm(imgPath)
    //             .resize(1050,788)   // 7 inch x 5.25 inch with 150 dpi
    //             .colorspace("GRAY")
    //             .operator('gray','negate','100%')
    //             .modulate(100,0,100)  // brightness +30%
    //             .edge(2.5)
    //             .operator('gray','negate','100%')
    //             .threshold('20%')
    //             // .normalize()
    //             .dither(true)
    //             .monochrome()
    //             .transparent("white")
    //             .write(imgDest, function(err){
    //                     if (err) return console.dir(arguments);
    //                     console.log(this.outname + ' created :: ' + arguments[3]);
    //                     process.exit("DONE");
    //                 }
    //             );
    //     }
    // });

});
module.exports = {};