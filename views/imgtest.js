/**
 * Created by William Gu on 2016/9/8.
 */
var Jimp = require("jimp");

// open a file called "lenna.png"
Jimp.read("sample5.jpg", function (err, lenna) {
    if (err) throw err;
    lenna
        .scale(0.5)
        // .brightness(0.2)
        // .dither565()
        // .contrast(0.6)
        .greyscale()
        .posterize(7.5)
        .contrast(1)
        // .blur(1)
        .write("test.jpg"); // save
});