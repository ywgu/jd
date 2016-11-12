/**
 * Created by William Gu on 2016/9/8.
 */
var Jimp = require("jimp");

// open a file called "lenna.png"
Jimp.read("sample5.jpg", function (err, lenna) {
    if (err) throw err;
    lenna
        .scale(0.5)
        .brightness(0.3)
        // .dither565()
        .contrast(0.4)
        .greyscale()
        .posterize(6)   // 7.2 is the best
        // .contrast()
        // .blur(1)
        .write("test.bmp"); // save
});