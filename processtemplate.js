var sax = require('sax'),
    printer = sax.createStream(false, {lowercasetags: true, trim: true}),
    fs = require('fs');

var tagMap = new Map([
    [ 'foreignobject', 'foreignObject' ],
    [ 'i:pgfref', 'i:pgfRef' ]
]);
var attrMap = new Map([
    [ 'requiredextensions', 'requiredExtensions' ]
]);

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
printer.on('opentag', function (tag) {
    // if (tag.name === 'rect') {
    //     return;
    // }
    this.indent();
    this.level++;
    var newName = tagMap.get(tag.name);
    if (newName !== undefined && newName !== null) {
        print('<' + newName);
        for (var i in tag.attributes) {
            var newAttrName = attrMap.get(i);
            if (newAttrName !== undefined && newAttrName !== null) {
                print(' ' + newAttrName + '="' + entity(tag.attributes[i]) + '"')
            }
            else {
                print(' ' + i + '="' + entity(tag.attributes[i]) + '"')
            }
        }
        print('>')
    }
    else {
        print('<' + tag.name);
        for (var i in tag.attributes) {
            var newAttrName = attrMap.get(i);
            if (newAttrName !== undefined && newAttrName !== null) {
                print(' ' + newAttrName + '="' + entity(tag.attributes[i]) + '"')
            }
            else {
                print(' ' + i + '="' + entity(tag.attributes[i]) + '"')
            }
        }
        print('>')
    }
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
    // if (tag === 'rect') {
    //     return;
    // }
    this.level--;
    this.indent();
    var newName = tagMap.get(tag);
    if (newName !== undefined && newName !== null) {
        print('</' + newName + '>');
    }
    else {
        print('</' + tag + '>');
    }
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

var inStream = null;
var instructions = null;
var outStream = null;

function processTemplateFile(inputFile, outputFile, instructs) {
    instuctions = instructs;
    inStream = fs.createReadStream(inputFile, { encoding: 'utf8' })
    outStream = fs.createWriteStream(outputFile);
    outStream.on('drain', function () {
        inStream.resume()
    });
    outStream.write("<?xml version=\"1.0\" encoding=\"utf-8\"?>");
    inStream.pipe(printer).pipe(fs.createWriteStream("nochange"));
}

processTemplateFile("0020001-2.svg","output.svg", "");

module.exports = {};
