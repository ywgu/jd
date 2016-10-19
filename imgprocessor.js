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
    console.log('Image processing started...'+imgInfo);
    // var imgDest = imgInfo.substring(0,imgInfo.lastIndexOf('/')+1)+imgInfo.substring(imgInfo.lastIndexOf('/')+4);
    var imgDest = imgInfo.substring(0,imgInfo.lastIndexOf(".")) + ".bmp";
    gm(imgInfo)
        .resize(1050,788)   // 7 inch x 5.25 inch with 150 dpi
        .modulate(120)  // brightness +20%
        .contrast(3)
        // .sharpen(3)
        .colorspace("GRAY")
        .dither(true)
        .monochrome()
        // .density(150,150)
        .write(imgDest, function(err){
                if (err) return console.dir(arguments);
                console.log(this.outname + ' created :: ' + arguments[3]);
                process.exit("DONE");
            }
        );
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