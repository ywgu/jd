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

var designRouter = express.Router();
designRouter.use(bodyParser.json());

// make sure data directory exists
var dataDir = path.normalize(path.join(__dirname, '..', 'public'));
var uploadDir = path.join(dataDir, "uploads");
var designDir = path.join(dataDir, "designs");
fs.existsSync(dataDir) || fs.mkdirSync(dataDir);
fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir);
fs.existsSync(designDir) || fs.mkdirSync(designDir);

designRouter.route('/')
    .get(function (req, res, next) {
        var now = new Date();
        res.render('home', { year: now.getFullYear(), month: now.getMonth() });
        // Designs.find({}, function (err, design) {
        //     if (err) throw err;
        //     res.json(design);
        // });
    })
    .post(function (req, res, next) {
        console.log('design created!'+req.body.svgText);
        var newName = Date.now()+".svg";
        fs.writeFile(designDir+"/"+newName, req.body.svgText, function(err) {
            if(err) {
                return console.log(err);
            }

            console.log("The file was saved!");
            // res.end("/designs/"+newName);
            res.redirect(303, '/designs/'+newName);
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
        res.render('dogtag', { year: now.getFullYear(), month: now.getMonth() });
        // Designs.find({}, function (err, design) {
        //     if (err) throw err;
        //     res.json(design);
        // });
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
        form.parse(req, function(err, fields, files){
            // if(err) return res.redirect(303, '/error');
            if(err) return res.end("Error uploading file.");
            if(err) {
                res.session.flash = {
                    type: 'danger',
                    intro: 'Oops!',
                    message: 'There was an error processing your submission. ' +
                    'Pelase try again.',
                };
                // return res.redirect(303, '/contest/vacation-photo');
                res.end("File uploading error.")
            }
            var photo = files.photo;
            // var dir = uploadDir + '/' + Date.now();
            var newName = Date.now().toString().slice(8)+"_"+photo.name;
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


 module.exports = designRouter;