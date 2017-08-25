// 1. tag or attr
// 2. D: delete; RA: ReplacePartialValue; SI: Special process for image tag; AF: Add Fonts; PP: Prepend to the value
// 3. attr=value
// 4. new settings
// command format: level|command|filter|key=<updates>
// meaning: for level tag or attribute, run command if filter is matched, update attribute key's value to <updates>
// var cmds = [
//     "tag|D|id=jd_bd",
//     "attr|PP|id=jd_bg|xlink:href=/designs/templates/",
//     "attr|RPV|id=text??|style=text-anchor:middle",
//     "attr|RPV|id=text??|style=text-align:center",
//     "tag|SI|id=image??",
//     "tag|AF|<fonts>"
// ];
var sax = require('sax'),
    printer = sax.createStream(true, {trim: true}),
    fs = require('fs');


var inStream = null;
var instructions = null;
var outStream = null;
var isDone = false;

function replacePartialValue(orig, key, newVal) {
    var splits = orig.split(";");
    var result = "";
    var needAppend = true;
    for (var idx=0; idx<splits.length; idx++) {
        var subKey = newVal.substring(0,newVal.indexOf(":"));
        if (splits[idx].indexOf(subKey+":") === 0) {
            result += newVal+";";
            needAppend = false;
        }
        else {
            result += splits[idx]+";";
        }
    }
    if(needAppend) {
        result += newVal;
    }
    return result;
}

function entity (str) {
    return str.replace('"', '&quot;')
}

printer.tabstop = 2;
printer.level = 0;
printer.indent = function () {
    print('\n');
    for (var i = this.level; i > 0; i--) {
        for (var j = this.tabstop; j > 0; j--) {
            print(' ')
        }
    }
};
// we don't support embedded tags yet
var currentDeleteTag = null;
var currentProcessTag = null;
printer.on('opentag', function (tag) {
    for (var idx=0; idx<instructions.length; idx++) {
        // processing tag command
        var items = instructions[idx].split("|");
        if (items[0] === "tag") {
            // mapping for attr=value
            var filter = items[2];
            var filterKey = filter.substring(0, filter.indexOf('='));
            var filterVal = filter.substring(filter.indexOf('=') + 1);
            var theVal = tag.attributes[filterKey];
            if (theVal !== undefined && theVal !== null) {
                var matches = theVal.match(filterVal);
                if (matches && matches.length) {    // the tag matches
                    if (items[1] === "D") { // delete the tag
                        currentDeleteTag = tag.name;
                        console.log("DELETED A LINE TAG:" + currentDeleteTag);
                        return;
                    }
                    if (items[1] === "DA") { // delete attribute
                        // tag.attributes[items[3]] = undefined;
                        delete tag.attributes[items[3]];
                        console.log("DELETED AN ATTRIBUTE:" + items[3]);
                    }
                    if (items[1] === "SI") {
                        var filterKey = items[2].substring(0, items[2].indexOf("="));
                        var filterVal = items[2].substring(items[2].indexOf("=") + 1);
                        // console.log(filterKey+","+filterVal);
                        var theVal = tag.attributes[filterKey];
                        if (theVal !== undefined && theVal !== null) {
                            var matches = theVal.match(filterVal);
                            if (matches && matches.length) {
                                // !!! special check for imagexx
                                if ((theVal.indexOf("image") === 0 && theVal.length === 7)) {
                                    console.log("PROCESSING IMAGE TAG");
                                    var newImgLine = "";
                                    var x = tag.attributes.x;
                                    var y = tag.attributes.y;
                                    var w = tag.attributes.width;
                                    var h = tag.attributes.height;
                                    var viewBox = "0 0 " + w + " " + h;
                                    // handle clip-path for image
                                    var clipPath = tag.attributes["clip-path"];
                                    if (clipPath !== null && clipPath !== undefined) {
                                        this.indent();
                                        print("\n<g clip-path=\"" + clipPath + "\" id=\"cp-layer\">");
                                    }
                                    // console.log("viewBox:"+viewBox);
                                    this.indent();
                                    print("<svg version=\"1.1\" viewBox=\"" + viewBox
                                        + "\" x=\"" + x + "\" y=\"" + y + "\" width=\"" + w + "\" height=\"" + h + "\" preserveAspectRatio=\"xMidYMid meet\">");
                                    tag.attributes.x = undefined;
                                    tag.attributes.y = undefined;
                                    tag.attributes.preserveaApectRatio = undefined;
                                    if (clipPath !== null && clipPath !== undefined) {
                                        tag.attributes["clip-path"] = undefined;
                                    }
                                    var imgLine = "";
                                    this.indent();
                                    print('  <image');
                                    for (var i in tag.attributes) {
                                        if (tag.attributes[i] !== undefined)
                                            print(' ' + i + '="' + entity(tag.attributes[i]) + '"');
                                    }
                                    print('/>');
                                    this.indent();
                                    print("</svg>");
                                    if (clipPath !== null && clipPath !== undefined) {
                                        this.indent();
                                        print("</g>");
                                    }
                                    currentProcessTag = "image";
                                    return;
                                }
                            }
                        }
                    }
                }
            }
        }
        // end processing tag command
        // processing attr command
        if (items[0] === "attr") {
            var filterKey = items[2].substring(0, items[2].indexOf("="));
            var filterVal = items[2].substring(items[2].indexOf("=") + 1);
            var theVal = tag.attributes[filterKey];
            if (theVal !== undefined && theVal !== null) {
                var matches = theVal.match(filterVal);
                if (matches && matches.length) {
                    if (items[1] === "RPV") {
                        // !!! special check for textxx
                        if ((theVal.indexOf("text") === 0 && theVal.length === 6)) {
                            console.log("RPV:MATCH THE PATTERN:" + matches);
                            var replaceAttrKey = items[3].substring(0, items[3].indexOf("="));
                            var replaceAttrVal = items[3].substring(items[3].indexOf("=") + 1);
                            // console.log("replaceAttrKey:"+replaceAttrKey+",replaceAttrVal:"+replaceAttrVal);
                            tag.attributes[replaceAttrKey] = replacePartialValue(tag.attributes[replaceAttrKey], replaceAttrKey, replaceAttrVal);
                            // console.log("new value:" + tag.attributes[replaceAttrKey]);
                        }
                    }
                    if (items[1] === "PP") {
                        // !!! special check for imagexx
                        console.log("PP:MATCH THE PATTERN:" + matches);
                        var replaceAttrKey = items[3].substring(0, items[3].indexOf("="));
                        var replaceAttrVal = items[3].substring(items[3].indexOf("=") + 1);
                        tag.attributes[replaceAttrKey] = replaceAttrVal + tag.attributes[replaceAttrKey];
                    }
                }
            }
        }
        // end processing attr command
    }

    this.indent()
    this.level++
    print('<' + tag.name)
    for (var i in tag.attributes) {
        print(' ' + i + '="' + entity(tag.attributes[i]) + '"')
    }
    print('>')
});

printer.on('text', ontext);
printer.on('doctype', ondoctypetext);
function ontext (text) {
    this.indent();
    print(text)
}
function ondoctypetext (text) {
    this.indent();
    print("<!DOCTYPE "+text+">")
}
printer.on('closetag', function (tag) {
    // processing tag|D command
    if (tag === currentDeleteTag) {
        currentDeleteTag = null;
        return;
    }
    // end processing tag|D command
    // processing tag|SI|id=image[0-9][0-9]
    if (tag === currentProcessTag) {
        currentProcessTag = null;
        return;
    }
    // end processing tag|SI|id=image[0-9][0-9]
    this.level--;
    this.indent();
    print('</' + tag + '>');
});

printer.on('cdata', function (data) {
    this.indent();
    print('<![CDATA[' + data + ']]>')
});

printer.on('comment', function (comment) {
    this.indent();
    print('<!--' + comment + '-->')
});

printer.on('error', function (error) {
    console.error(error);
    throw error
});

// if (!process.argv[2]) {
//     throw new Error('Please provide an xml file to prettify\n' +
//         'TODO: read from stdin or take a file')
// }


function print (c) {
    if (!outStream.write(c)) {
        inStream.pause()
    }
}


function processTemplateFile(inputFile, outputFile, instructs) {
    isDone = false;
    instructions = instructs;
    inStream = fs.createReadStream(inputFile, { encoding: 'utf8' })
    outStream = fs.createWriteStream(outputFile);
    outStream.on('drain', function () {
        inStream.resume()
    });
    outStream.on('finish', function() {
        isDone = true;
    });
    outStream.write("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
    // add fonts line if in the cmds
    for (var i in instructs) {
        if (instructs[i].indexOf("tag|AF|") === 0  && instructs[i].substring(7) !== "undefined") {
            var fontStr = instructs[i].substring(7);
            outStream.write("\n<?xml-stylesheet type=\"text/css\" href=\"https://fonts.googleapis.com/css?family=" + fontStr.substring(0, fontStr.length - 1) + "\"?>");
        }
    }
    inStream.pipe(printer)
        // .pipe(fs.createWriteStream("nochange"));
}

function isDone() {
    return isDone;
}
// processTemplateFile("0020001-2.svg","output.svg", "");

module.exports = processTemplateFile;
