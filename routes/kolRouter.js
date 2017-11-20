var express = require('express');
var router = express.Router();
var fs = require('fs');

// code for customized transformer from http://codewinds.com/blog/2013-08-20-nodejs-transform-streams.html
var stream = require('stream');
var util = require('util');

// node v0.10+ use native Transform, else polyfill
var Transform = stream.Transform ||
    require('readable-stream').Transform;

/*
 * Filters an object stream properties
 *
 * @param filterProps array of props to replacer
 */
function Replacer(replacerProps, options) {
    // allow use without new
    if (!(this instanceof Replacer)) {
        return new Replacer(replacerProps, options);
    }

    // init Transform
    if (!options) options = {}; // ensure object
    options.objectMode = true; // forcing object mode
    Transform.call(this, options);
    this.replacerProps = replacerProps;
}
util.inherits(Replacer, Transform);

/* replacer each object's sensitive properties */
Replacer.prototype._transform = function (obj, enc, cb) {
    var self = this;
    // console.log(self.replacerProps[0]);
    var aChunk = obj.toString().replace(new RegExp(self.replacerProps[0].orig, 'g'), self.replacerProps[0].new);
    this.push(aChunk);
    cb();
};


// try it out, output to stdout
// replacer phone and email from objects
// var replacer = new Replacer([{'orig':'Hello', 'new':'Hi'}]);
// replacer
//     .on('readable', function () {
//         var obj;
//         while (null !== (obj = replacer.read())) {
//             console.log(obj);
//         }
//     });
// // now send some objects to replacer through
// replacer.write("Hello world");
// replacer.write("Hello phone");
// replacer.end();  // finish
// Copy code end

router.get('/', function (req, res, next) {
    res.send('respond with a kol\'s resource');
});

router.get('/:svg/:kol', function (req, res) {
    var parser = new Replacer([{'orig':'|kol|', 'new': req.params.kol.toLowerCase()}]);
    res.setHeader('Content-Type', 'image/svg+xml');
    // res.write('<!-- Begin stream -->\n');
    fs.createReadStream('./public/kol/svg/'+req.params.svg+'.svg')
        .on('error', function(err) {
            console.log(err);
            res.end();
        })
        .pipe(parser)
        .on('end', function () {
            // res.write('\n<!-- End stream -->')
        }).pipe(res);
});

module.exports = router;