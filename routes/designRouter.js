/**
 * Created by William Gu on 2016/6/18.
 */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Designs = require('../models/designs');
var path = require('path'),
    fs = require('fs'),
    formidable = require('formidable');
var jimp = require("jimp");

var designRouter = express.Router();
designRouter.use(bodyParser.json());

// make sure data directory exists
var dataDir = path.normalize(path.join(__dirname, '..', 'public'));
var uploadDir = path.join(dataDir, "uploads");
var uploadTempDir = path.join(dataDir, "temp");
var designDir = path.join(dataDir, "designs");
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir);
fs.existsSync(uploadTempDir) || fs.mkdirSync(uploadTempDir);
fs.existsSync(designDir) || fs.mkdirSync(designDir);

designRouter.route('/')
    .get(function (req, res, next) {
        var now = new Date();
        res.render('home', {year: now.getFullYear(), month: now.getMonth()});
        // Designs.find({}, function (err, design) {
        //     if (err) throw err;
        //     res.json(design);
        // });
    })
    .post(function (req, res, next) {
        console.log('design created!' + req.body.svgText);
        var newName = Date.now() + ".svg";
        fs.writeFile(designDir + "/" + newName, req.body.svgText, function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
            // res.end("/designs/"+newName);
            res.redirect(303, '/design/done/' + newName);
        });
        /**Designs.create(req.body, function (err, design) {
            if (err) throw err;
            console.log('design created!');
            var id = design._id;

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the design with id: ' + id);
        });*/
    })
    .delete(function (req, res, next) {
        Designs.remove({}, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

designRouter.route('/dogtag')
    .get(function (req, res, next) {
        var now = new Date();
        res.render('dogtag', {year: now.getFullYear(), month: now.getMonth()});
        // Designs.find({}, function (err, design) {
        //     if (err) throw err;
        //     res.json(design);
        // });
    });

designRouter.route('/designer/:did')
    .get(function (req, res, next) {
        console.log("designer=" + req.app.get('designer'));
        var designer = req.app.get('designer');
        var theDesign = null;
        for (var i = 0; i < designer.designs.length; i++) {
            if (req.params.did === designer.designs[i].did) {
                theDesign = designer.designs[i];
                break;
            }
        }
        console.log("theDesign.name:" + theDesign.name);
        var now = new Date();
        res.render('design/designer', {
            year: now.getFullYear(),
            month: now.getMonth(),
            theDesign: JSON.stringify(theDesign)
        });
        // Designs.find({}, function (err, design) {
        //     if (err) throw err;
        //     res.json(design);
        // });
    });

designRouter.route('/templatelist/:cid')
    .get(function (req, res, next) {
        console.log("templates=" + req.app.get('templates'));
        var templates = req.app.get('templates');
        var templateList = null;
        for (var i = 0; i < templates.templates.length; i++) {
            if (req.params.cid === templates.templates[i].gid) {
                templateList = templates.templates[i].list;
                break;
            }
        }
        res.render('design/templatelist', {layout: 'design', templates: templateList});
    });
designRouter.route('/personalize/:tid')
    .get(function (req, res, next) {
        // console.log("tid:"+req.params.tid);
        var templates = req.app.get('templates');
        var gid = req.params.tid.substr(0, 3);   // the first 3 characters are group id
        var inputList = null;
        var zoomList = null;
        var zoomStr = "";
        for (var i = 0; i < templates.templates.length; i++) {
            if (templates.templates[i].gid === gid) {
                templateList = templates.templates[i].list;
                // found the category
                for (var j = 0; j < templateList.length; j++) {
                    if (templateList[j].tid == req.params.tid) {
                        inputList = templateList[j].inputs;
                        zoomList = templateList[j].zooms;
                        for (var k=0; k<zoomList.length; k++) {
                            zoomStr += zoomList[k]+";";
                        }
                        console.log("inputList:" + inputList+",zoomStr:"+zoomStr);
                        break;
                    }
                }
            }
        }
        res.render('design/personalize', {layout: 'design', tid: req.params.tid, inputs: inputList, zooms: zoomStr});
    });
designRouter.route('/design/:did')
    .get(function (req, res, next) {
        // Designs.findById(req.params.did, function (err, design) {
        //     if (err) throw err;
        //     res.json(design);
        // });
        var now = new Date();
        res.render('design/design', {year: now.getFullYear(), month: now.getMonth(), layout: 'tool'});
    });
designRouter.route('/done/:did')
    .get(function (req, res, next) {
        // Designs.findById(req.params.did, function (err, design) {
        //     if (err) throw err;
        //     res.json(design);
        // });
        res.render('design/done', {did: req.params.did, layout: 'design'});
    });
designRouter.route('/done')
    .post(function (req, res, next) {
        console.log('done posted!' + req.body.svg0);
        tid = req.body.tid;
        count = 0;
        prefix = Date.now().toString().slice(5);
        result = "";
        do {
            xmlName = "svg" + count;
            var xml = req.body[xmlName];
            if (xml === null || xml === undefined)
                break;
            var newName = prefix + "-" + tid + "-" + count + ".svg";
            fs.writeFile(designDir + "/" + newName, xml, function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The svg file was saved!");
                // res.end("/designs/"+newName);
                // res.redirect(303, '/design/done/' + newName);
            });
            result += "i" + count + "=" + newName + "&";
            count++;
        } while (true);
        result = result.length > 0 ? result.slice(0, result.length - 1) : result;
        res.end(result);
    });
designRouter.route('/showdesign')
    .get(function (req, res, next) {
        console.log('showdesign!');
        count = 0;
        imgs = "{\"images\":[ ";
        tidx = "";
        do {
            paramName = "i" + count;
            aParam = req.query[paramName];
            console.log("aParam:" + aParam);
            if (aParam === null || aParam === undefined)
                break;
            if (tidx === "") {
                tidx = aParam.substring(aParam.indexOf('-') + 1, aParam.lastIndexOf('-'));
                console.log("tidx:" + tidx);
            }
            imgs += "{\"image\":\"" + aParam + "\"},";
            count++;
        } while (true);
        imgs = imgs.slice(0, imgs.length - 1) + "] }";
        console.log("imgs:" + imgs);
        res.render('design/showdesign', {layout: 'design', imagelist: JSON.parse(imgs).images, tid: tidx});
    });

designRouter.route('/:designId')
    .get(function (req, res, next) {
        Designs.findById(req.params.designId, function (err, design) {
            if (err) throw err;
            res.json(design);
        });
    })

    .put(function (req, res, next) {
        Designs.findByIdAndUpdate(req.params.designId, {
            $set: req.body
        }, {
            new: true
        }, function (err, design) {
            if (err) throw err;
            res.json(design);
        });
    })

    .delete(function (req, res, next) {
        Designs.findByIdAndRemove(req.params.designId, function (err, resp) {
            if (err) throw err;
            res.json(resp);
        });
    });

designRouter.route('/uploadimg/:year/:month')
    .post(function (req, res, next) {
        console.log('upload image');
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            // if(err) return res.redirect(303, '/error');
            if (err) return res.end("Error uploading file.");
            if (err) {
                res.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'There was an error processing your submission. ' +
                    'Please try again.'
                };
                // return res.redirect(303, '/contest/vacation-photo');
                res.end("File uploading error.")
            }
            var photo = files.photo;
            // var dir = uploadDir + '/' + Date.now();
            var newName = Date.now().toString().slice(5) + "_" + photo.name.toLowerCase();
            // var path = dir + '/' + photo.name;
            // fs.mkdirSync(dir);
            // fs.renameSync(photo.path, dir + '/' + photo.name);
            fs.renameSync(photo.path, uploadDir + '/' + newName);
            // saveContestEntry('vacation-photo', fields.email,
            //     req.params.year, req.params.month, path);
            // req.session.flash = {
            //     type: 'success',
            //     intro: 'Good luck!',
            //     message: 'You have been entered into the contest.',
            // };
            // return res.redirect(303, '/design/');
            res.end(newName);
        });
    });

designRouter.route('/uploaddata')
    .post(function (req, res, next) {
        console.log('upload data');
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            // if(err) return res.redirect(303, '/error');
            if (err) {
                console.log("error:" + err);
                return res.end("Error uploading data.");
            }
            // if(err) {
            //     res.session.flash = {
            //         type: 'danger',
            //         intro: 'Oops!',
            //         message: 'There was an error processing your submission. ' +
            //         'Pelase try again.',
            //     };
            //     // return res.redirect(303, '/contest/vacation-photo');
            //     res.end("Data uploading error.")
            // };
            console.log("fields keyList:" + Object.keys(fields));
            // var keyList = Object.keys(fields);
            var aValue = JSON.stringify(fields);
            console.log("aValue:" + aValue);
            var fValue = "";
            var processing = fields["processing"];
            console.log("processing:" + processing);
            var newPrefix = Date.now().toString().slice(5) + "_";

            // for (var key in files) {
            //     var image = files[key];
            //     var newName = newPrefix + image.name.toLowerCase();
            //     var convertedName = newName.substring(0,newName.lastIndexOf(".")) + ".png";   // convert to png format
            //     fValue = fValue.concat("\"").concat(key).concat("\":\"").concat(convertedName).concat("\",");
            //     fs.renameSync(image.path, uploadTempDir + '/' + newName);
            //     if (processing === "gpc") {
            //         processImage(uploadTempDir + "/" + newName);
            //     }
            // }
            // if (fValue !== "") // remove extra ,
            //     fValue = fValue.slice(0, fValue.length - 1);
            // console.log("fValue:" + fValue);
            // var returnText = aValue;

            // if (fValue !== "") {
            //     if (aValue.length > 2)
            //         returnText = returnText.slice(0, returnText.length - 1) + "," + fValue + "}";
            //     else
            //         returnText = "{" + fValue + "}";
            // }
            var returnText = "";
            for (var key in fields) {
                if (key === "processing" || key === "tidx" || key.indexOf("text") === 0) {
                    returnText = returnText.concat("\"").concat(key).concat("\":\"").concat(fields[key]).concat("\",");
                }
                else if (key.indexOf("image") === 0) {
                    var image = fields[key];
                    var imageData = fields["data-"+key];
                    var newName = newPrefix + image.toLowerCase(); // xxxx-image.png/jpg...
                    var processing = fields["processing"];
                    if (processing === "gpc") {
                        // var convertedName = "gpc/" + newName.substring(0, newName.lastIndexOf(".")) + ".png";   // convert to png format
                        processImage(uploadTempDir + "/" + newName+"|" + imageData);
                        newName = "gpc/" + newName.substring(0, newName.lastIndexOf(".")) + ".png"; // change to .png
                    }
                    returnText = returnText.concat("\"").concat(key).concat("\":\"").concat(newName).concat("\",");
                }
            }
            returnText = "{"+returnText.substring(0,returnText.length-1)+"}";
            console.log("return:" + returnText);
            res.end(returnText);
        });
    });

// require the image editing file
var imgprocessor = path.resolve(__dirname, '../imgprocessor.js');
function processImage(imgInfo) {    // imgInfo : imgPath|imgData
    // We need to spawn a child process so that we do not block
    // the EventLoop with cpu intensive image manipulation
    var childProcess = require('child_process').fork(imgprocessor);
    childProcess.on('message', function (message) {
        console.log(message);
    });
    childProcess.on('error', function (error) {
        console.error(error.stack)
    });
    childProcess.on('exit', function () {
        console.log('process exited');
    });
    // send the work to child process
    childProcess.send(imgInfo);
}

module.exports = designRouter;