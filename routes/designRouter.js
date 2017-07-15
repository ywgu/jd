/**
 * Created by William Gu on 2016/6/18.
 */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Designs = require('../models/designs');
var Design = require('../models/design');
var path = require('path'),
    fs = require('fs'),
    formidable = require('formidable');
var jimp = require("jimp");

var designRouter = express.Router();
designRouter.use(bodyParser.json());

// make sure data directory exists
var dataDir = path.normalize(path.join(__dirname, '..', 'public'));
var uploadDir = path.join(dataDir, "uploads");
var designDir = path.join(dataDir, "designs");
var uploadTempDir = path.join(dataDir, "designs/temp");

fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir);
fs.existsSync(designDir) || fs.mkdirSync(designDir);
fs.existsSync(uploadTempDir) || fs.mkdirSync(uploadTempDir);

var templateMap = {};
function findTemplate(req,tid) {
    if (tid in templateMap)
        return templateMap[tid];
    var templates = req.app.get('templates');
    var gid = tid.substr(0,3);   // the first 3 characters are group id
    var pid = tid.substr(0,7);   // the first 7 characters are product id

    for (var i = 0; i < templates.templates.length; i++) {
        // console.log("templates.templates[i].gid:"+templates.templates[i].gid);
        if (templates.templates[i].gid === gid) {
            templateList = templates.templates[i][pid];
            // found the category
            for (var j = 0; j < templateList.length; j++) {
                // console.log("templateList[j].tid:"+templateList[j].tid);
                if (templateList[j].tid == tid) {
                    templateMap[tid] = templateList[j];
                    return templateList[j];
                }
            }
        }
    }
    return null;    // failed to find template
}

function getPartNum(req,tid) {
    var template = findTemplate(req,tid);
    if (template == null || template == undefined)
        return 0;
    else
        return template.zooms.length;
}

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
        // Designs.remove({}, function (err, resp) {
        //     if (err) throw err;
        //     res.json(resp);
        // });
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

designRouter.route('/templatelist/:pid')
    .get(function (req, res, next) {
        console.log("templates=" + req.app.get('templates'));
        var templates = req.app.get('templates');
        var templateList = null;
        var pid = req.params.pid;
        var gid = pid.substr(0,3);
        for (var i = 0; i < templates.templates.length; i++) {
            console.log("gid:"+gid+",template.gid:"+templates.templates[i].gid);
            if (gid === templates.templates[i].gid) {
                templateList = templates.templates[i][pid];
                console.log("found group gid:"+gid+",templateList:"+templateList);
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
        var pid = req.params.tid.substr(0,7);    // the first 7 characters are product id
        var inputList = null;
        var zoomList = null;
        var zoomStr = "";
        for (var i = 0; i < templates.templates.length; i++) {
            if (templates.templates[i].gid === gid) { // found the group
                templateList = templates.templates[i][pid];
                if (templateList !== null && templateList !== undefined) { // found the product
                    console.log("templateList:" + templateList);
                    // found the category
                    for (var j = 0; j < templateList.length; j++) {
                        if (templateList[j].tid == req.params.tid) {
                            inputList = templateList[j].inputs;
                            zoomList = templateList[j].zooms;
                            for (var k = 0; k < zoomList.length; k++) {
                                zoomStr += zoomList[k] + ";";
                            }
                            console.log("inputList:" + inputList + ",zoomStr:" + zoomStr);
                            break;
                        }
                    }
                }
                else {
                    console.log("ERROR: template id can't be found");
                }
            }
        }
        res.render('design/personalize2', {layout: 'design', tid: req.params.tid, inputs: inputList, zooms: zoomStr});
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
        // console.log('done posted!' + req.body.svg0);
        tid = req.body.tid;
        // template = findTemplate(req,tid);
        totalPages = getPartNum(req,tid);
        prefix = Date.now().toString().slice(5);
        // result = "";
        finishedProcessing = 0;
        var did = prefix + "-" + tid;
        for (var i=0; i<totalPages; i++) {
            xmlName = "svg" + i;
            var xml = req.body[xmlName];
            if (xml === null || xml === undefined)
                break;
            var newName = prefix + "-" + tid + "-" + i + ".svg";
            fs.writeFile(designDir + "/" + newName, xml, function (err) {
                if (err) {
                    return console.log(err);
                }
                finishedProcessing++;
                if (finishedProcessing >= totalPages) {
                    // generate the animated gif for the design
                    genanimated(did+"|"+totalPages);
                }
            });
            // result += "i" + i + "=" + newName + "&";
        }
        // result = result.length > 0 ? result.slice(0, result.length - 1) : result;
        res.end(did);
    });
designRouter.route('/donedesign/:did/:prdname')
    .get(function (req, res, next) {
        var did = req.params.did;
        var tid = did.substring(did.indexOf('-')+1);
        var partNum = getPartNum(req,tid);
        // console.log("did:"+did+",tid:"+tid);
        var imgs = "{\"images\":[ ";
        for (var i=0; i<partNum; i++) {
            paramValue = did + "-" + i + ".svg";
            imgs += "{\"image\":\"" + paramValue + "\"},";
        }
        imgs = imgs.slice(0, imgs.length - 1) + "] }";
        // save to database for the new design
        var prdname = req.params.prdname;
        if (prdname !== null && prdname.length > 0) {
            Design.create({
                _id: did,
                slug: prdname
            }, function (err, design) {
                if (err) throw err;
                console.log('design ' + did + ',' + prdname + ' is stored in database.');
            });
        }
        // console.log("imgs:" + imgs);
        res.render('design/donedesign', {layout: 'design', imagelist: JSON.parse(imgs).images, tid: tid, did: did});
    });
// same function but use differnt parameters
// designRouter.route('/donedesign')
//     .get(function (req, res, next) {
//         // console.log('donedesign!');
//         count = 0;
//         imgs = "{\"images\":[ ";
//         tidx = "";
//         did = "";
//         do {
//             paramName = "i" + count;
//             aParam = req.query[paramName];
//             // console.log("aParam:" + aParam);
//             if (aParam === null || aParam === undefined)
//                 break;
//             if (tidx === "") {
//                 tidx = aParam.substring(aParam.indexOf('-') + 1, aParam.lastIndexOf('-'));
//                 // console.log("tidx:" + tidx);
//             }
//             if (did === "") {
//                 did = aParam.substring(0, aParam.lastIndexOf('-'));
//                 console.log("did:" + did);
//             }
//             imgs += "{\"image\":\"" + aParam + "\"},";
//             count++;
//         } while (true);
//         imgs = imgs.slice(0, imgs.length - 1) + "] }";
//         // console.log("imgs:" + imgs);
//         res.render('design/donedesign', {layout: 'design', imagelist: JSON.parse(imgs).images, tid: tidx, did: did});
//     });

designRouter.route('/showdesign/:did')
    .get(function (req, res, next) {
        var templates = req.app.get('templates');
        var did = req.params.did;
        var tid = did.substring(did.indexOf('-')+1);
        // console.log("tid:"+tid);
        var gid = tid.substr(0,3);   // the first 3 characters are group id
        var pid = tid.substr(0,7);   // the first 7 characters are product id
        // console.log("gid:"+gid);
        var totalPage;
        var zoomList = null;
        var done = false;
        for (var i = 0; i < templates.templates.length; i++) {
            // console.log("templates.templates[i].gid:"+templates.templates[i].gid);
            if (templates.templates[i].gid === gid) {
                templateList = templates.templates[i][pid];
                // found the category
                for (var j = 0; j < templateList.length; j++) {
                    // console.log("templateList[j].tid:"+templateList[j].tid);
                    if (templateList[j].tid == tid) {
                        zoomList = templateList[j].zooms;
                        totalPage = zoomList.length;
                        console.log("totalPage:"+totalPage);
                        done = true;
                        break;
                    }
                }
            }
            if (done === true)
                break;
        }
        var count = 0;
        var lastImage;
        var imgs = "{\"images\":[ ";
        for (var i = 0; i<totalPage; i++) {
            lastImage = did + "-"+i;
            imgs += "{\"image\":\"" + lastImage+"\"},";
        }
        imgs = imgs.slice(0, imgs.length - 1) + "] }";
        lastImage += ".png";
        console.log("imgs:" + imgs+",lastImage:"+lastImage);

        // processing image if it is not ready
        console.log("zoomList:"+zoomList);
        // check if the last image exists
        fs.stat(designDir+'/'+lastImage, function(err, stat) {
            if(err == null) {
                console.log('Images were processed. File exists'); // do nothing
            } else if(err.code == 'ENOENT') {
                // file does not exist
                // start a process to generate images
                svgtopng(imgs +"|"+zoomList);
            } else {
                console.log('File stats error: ', err.code);
            }
        });
        res.render('design/showdesign', {did: req.params.did, imagelist: JSON.parse(imgs).images, pages: totalPage, layout: 'design'});
    });

designRouter.route('/sharedesign/:did')
    .get(function (req, res, next) {
        var did = req.params.did;
        var tid = did.substring(did.indexOf('-')+1);
        var partNum = getPartNum(req,tid);
        // console.log("did:"+did+",tid:"+tid);
        var imgs = "{\"images\":[ ";
        for (var i=0; i<partNum; i++) {
            paramValue = did + "-" + i + ".svg";
            imgs += "{\"image\":\"" + paramValue + "\"},";
        }
        imgs = imgs.slice(0, imgs.length - 1) + "] }";
        var prdname = "";
        Design.findById(did,function (err, aDesign) {
            //if it isn't found, we are going to repond with 404
            if (err) {
                console.log(did + ' was not found');
                res.status(404);
                //if it is found we continue on
            } else {
                //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
                console.log(aDesign);
                prdname = aDesign.prdname;
            }
        });
        // console.log("imgs:" + imgs);
        res.render('design/sharedesign', {layout: 'share', imagelist: JSON.parse(imgs).images, tid: tid, did: did, prdname: prdname});
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
            // console.log("aValue:" + aValue);
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

                    if (imageData.length > 50) { // only process image data that is greater than certain size
                        if (processing === "gpc") {
                            // var convertedName = "gpc/" + newName.substring(0, newName.lastIndexOf(".")) + ".png";   // convert to png format
                            processImage("gpc|" + uploadTempDir + "/" + newName + "|" + imageData);
                            newName = "gpc/" + newName.substring(0, newName.lastIndexOf(".")) + ".png"; // change to .png
                        }
                        else { // don't process the image, just decode it
                            processImage("none|" + uploadTempDir + "/" + newName + "|" + imageData);
                        }
                    }
                    else {
                        newName = "default.png";    // return an empty image
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

// converting svg to png
// require the image editing file
var svgtopngProcessor = path.resolve(__dirname, '../svgtopng.js');
function svgtopng(imgInfo) {    // imgInfo : imgPath|imgRect(area of the image to extract)
    // We need to spawn a child process so that we do not block
    // the EventLoop with cpu intensive image manipulation
    var childProcess = require('child_process').fork(svgtopngProcessor);
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

var genanimatedProcessor = path.resolve(__dirname, '../genanimated.js');
function genanimated(imgInfo) {    // did : designid|totalPages
    // We need to spawn a child process so that we do not block
    // the EventLoop with cpu intensive image manipulation
    var childProcess = require('child_process').fork(genanimatedProcessor);
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