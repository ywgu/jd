/**
 * Created by William Gu on 2016/12/3.
 */
var gmm = require('gm');
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
        var imgPath = designDir+"/"+imgList[i].image;
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
        gmm(designDir+"/"+"88615815-0020002-3.svg")
            // .resize(1050, 788)   // 7 inch x 5.25 inch with 150 dpi
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