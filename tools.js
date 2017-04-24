/**
 * Created by William Gu on 2017/4/24.
 */

module.exports = {
// get attribute value of attrName
    getAttrValue: function (line, attrName) {
        var attrIdx = line.indexOf(attrName + "=");
        if (attrIdx === -1)
            return null;
        var startIdx = line.indexOf("\"", attrIdx);
        var endIdx = line.indexOf("\"", startIdx + 1);
        if (startIdx !== -1 && endIdx !== -1)
            return line.substring(startIdx + 1, endIdx);
        return null;
    },

// replace attribute value with newVal
    replaceAttrValue: function (line, attrName, newVal) {
        var attrIdx = line.indexOf(attrName + "=");
        if (attrIdx === -1)
            return null;
        var startIdx = line.indexOf("\"", attrIdx);
        var endIdx = line.indexOf("\"", startIdx + 1);
        if (startIdx !== -1 && endIdx !== -1) {
            // console.log(startIdx+","+endIdx+",newValue:"+newVal);
            // console.log("replace:"+line.substring(0,startIdx+1) + newVal + line.substring(endIdx));
            return line.substring(0, startIdx + 1) + newVal + line.substring(endIdx);
        }
        return line;
    },

// add attr (attrName, attrVal) if attrName doesn't exist
    addAttr: function (line, attrName, attrVal) {
        var attrIdx = line.indexOf(attrName + "=");
        if (attrIdx >= 0)
            return line;
        var addedStr = " " + attrName + "=\"" + attrVal + "\" ";
        line = line.replace(" ", addedStr);
        return line;
    },

// remove attr with name of attrName from the line
    removeAttr: function (line, attrName) {
        var attrIdx = line.indexOf(attrName + "=");
        if (attrIdx === -1)
            return line;
        var startIdx = line.indexOf("\"", attrIdx);
        var endIdx = line.indexOf("\"", startIdx + 1);
        if (startIdx !== -1 && endIdx !== -1) {
            return line.substring(0, attrIdx) + line.substring(endIdx + 1);
        }
        return line;
    },


// generic data processor, data is the whole svg file. func is the function used to process the data.
    processData: function (data, func) {
        var tagLine = "";
        var buf = "";
        data.toString().split('\n').forEach(function (line) {
            // get a tag line
            if (line.trim().indexOf("<") === 0) {
                tagLine = line.trim();
                if (line.indexOf(">") > 0) {
                    buf += func(tagLine) + " ";
                    tagLine = "";
                }
            }
            else if (line.trim().indexOf(">") >= 0) {
                tagLine += " " + line.trim();
                buf += func(tagLine) + " ";
                tagLine = "";
            }
            else if (tagLine === "") {  // text line without < or >
                buf += line.trim() + "\n";
                tagLine = "";
            }
            else {
                tagLine += " " + line.trim();
            }
        });
        // console.log("buf:"+buf);
        return buf;
    }
};

