/**
 * Created by William Gu on 2016/10/16.
 */
// var gulp = require('gulp');
// var imagemin = require('gulp-imagemin');
// var imageResize = require('gulp-image-resize');
// var jimp = require("jimp");
var gm = require('gm');

// function processImg(imgSrc,imgDest) {
//     return gulp.src(imgSrc)
//     // compress and save
//         .pipe(imagemin({optimizationLevel: 5}))
//         .pipe(gulp.dest(imgDest+".jpg"))
//         // save
//         .pipe(imageResize({
//             width: 800,
//             height: 600,
//             crop: true
//         }))
//         .pipe(gulp.dest(imgDest+"-zip"));
// }
process.on('message', function (imgInfo) {
    console.log('Image processing started...');
    // var imgDest = imgInfo.substring(0,imgInfo.lastIndexOf('/')+1)+imgInfo.substring(imgInfo.lastIndexOf('/')+4);
    var processingType = imgInfo.substring(0,imgInfo.indexOf('|'));
    var tempImgInfo = imgInfo.substring(imgInfo.indexOf('|')+1);
    var imgPath = tempImgInfo.substring(0,tempImgInfo.indexOf('|'));
    // var imgName = imgPath.substring(0,imgPath.lastIndexOf('/')+1);
    var imgDest = imgPath.substring(0, imgPath.lastIndexOf('/')+1) +"gpc/"+imgPath.substring(imgPath.lastIndexOf('/')+1, imgPath.lastIndexOf('.'))+".png";
    console.log("imgPath:"+imgPath+",imgDest:"+imgDest);
    var imgData = tempImgInfo.substring(tempImgInfo.indexOf('|')+1);
    // convert from base64 to jpg
    var base64Data = imgData.replace(/^data:image\/jpeg;base64,/, "");

    require("fs").writeFile(imgPath, base64Data, 'base64', function(err) {
        if (err)
            console.log(err);
        else {
            if (processingType === "gpc") {
                gm(imgPath)
                    .resize(1600, 1600)   // 4 inch x 4 inch with 400 dpi
                    .colorspace("GRAY")
                    .operator('gray', 'negate', '100%')
                    .modulate(100, 0, 100)  // brightness +30%
                    .edge(2.5)
                    .operator('gray', 'negate', '100%')
                    .threshold('20%')
                    // .normalize()
                    .dither(true)
                    .monochrome()
                    .transparent("white")
                    .write(imgDest, function (err) {
                            if (err) return console.dir(arguments);
                            console.log(this.outname + ' created :: ' + arguments[3]);
                            process.exit("DONE");
                        }
                    );
            }
            else {
                // do nothing for none
            }
        }
    });
    // var imgDest = imgInfo.substring(0,imgInfo.lastIndexOf(".")) + ".png";
    // var darkness = 0;
    // var buffer;
    // gm(imgInfo)
    //     .resize(1,1)
    //     .colorspace("GRAY")
    //     // .monochrome()
    //     .toBuffer('TXT',function (err, buffer) {
    //         if (err) return handle(err);
    //         console.log('get darkness text:'+buffer);
    //         var bufferStr = buffer.toString();
    //         bufferStr = bufferStr.substring(bufferStr.indexOf(":")+1);
    //         darkness = bufferStr.substring(bufferStr.indexOf("(")+1, bufferStr.indexOf(","));
    //         console.log('darkness:'+darkness);
    //         var brightness = 120;   // default add 20% brightness
    //         // only make it brighter if it's dark
    //         if (darkness < 80)
    //             brightness += (128-darkness)/4;
    //         console.log("brightness:"+brightness);

        // });

    // jimp.read(imgInfo, function (err, img) {
    //     if (err) throw err;
    //     img
    //         .scale(0.3)
    //         .greyscale()
    //         .posterize(7.5)
    //         .contrast(1.0)
    //         .write(imgDest); // save
    // });
    // process.send("DONE");
    // var imgDest = imgInfo.substring(0,imgInfo.lastIndexOf('/')+1)+imgInfo.substring(imgInfo.lastIndexOf('/')+4);
    // console.log(imgInfo+"|"+ imgDest);
    // var stream = processImg(imgInfo,imgDest);
    // stream.on('end', function () {
    //     process.send('Image processing complete');
    //     process.exit();
    // });
    // stream.on('error', function (err) {
    //     process.send(err);
    //     process.exit(1);
    // });
});
module.exports = {};