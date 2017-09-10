// pull out image/text tags

var sax = require('sax');
var fs = require('fs');

var newInput = null;
var result = {
    tid: "",
    zooms: [],
    inputs: []
};

function collectData(svgFile) {
    newInput = [];
    fs.readFile(svgFile, function (er, d) {
        var xmlstr = d.toString('utf8')
        // console.log("parsing file:"+svgFile);
        var parser = sax.parser(true)

        parser.onclosetag = function (tagName) {
        };

        var processingTag = null;
        parser.onopentag = function (tag) {
            if (tag.attributes.id !== null && tag.attributes.id !== undefined) {
                if (tag.attributes.id === "jd_bd") {
                    var d = tag.attributes.d;
                    // console.log("d:"+d);
                    var items = d.split(" ");
                    var newZoom = "";
                    var temp = items[1].split(",");
                    newZoom += Math.round(temp[0])+","+Math.round(temp[1])+",";
                    temp = items[2].split(",");
                    newZoom += Math.round(temp[0])+",";
                    temp = items[3].split(",");
                    newZoom += Math.round(temp[1]);
                    // console.log("newZoom:"+newZoom);
                    result.zooms.push(newZoom);
                }
                var matches = tag.attributes.id.match("text[0-9][0-9]");
                if (matches && tag.attributes.id.length === 6) {    // check for textxx
                    processingTag = tag.attributes.id;
                }
                matches = tag.attributes.id.match("image[0-9][0-9]");
                if (matches && tag.attributes.id.length ===7) {
                    var item = {};
                    item["image"] = true;
                    item["id"] = tag.attributes.id;
                    item["title"] = "Girl";
                    newInput.push(item);
                }
            }
        };

        parser.ontext = function (text) {
            // if (currentTag) currentTag.children.push(text)
            if (processingTag !== null) {
                var displayText = null;
                var textLength = 0;
                displayText = text.trim();
                textLength = displayText.length < 5? displayText.length:60;
                // if (text.trim().length > 10) {
                //     displayText = text.trim().substring(0,10)+"...";
                //     textLength = 21;
                // }
                // else{
                //     displayText = text.trim();
                //     textLength = displayText.length>3 ? 21 : displayText.length;
                // }
                // console.log(processingTag+",text:"+displayText);
                var item = {};
                item["image"] = false;
                item["id"] = processingTag;
                item["title"] = displayText;
                item["max"] = textLength;
                newInput.push(item);
                processingTag = null;
            }
        };

        parser.onend = function () {
            result.inputs.push(newInput);
            console.log("end collecting svg data:"+svgFile);
        };

        parser.write(xmlstr).end()

    });
    return result;
}

module.exports = collectData;