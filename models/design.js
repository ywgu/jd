/**
 * Created by William Gu on 2017/7/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DesignSchema = new Schema({
    _id: {  // design id for the user generated design
        type: String,
        required: true,
        unique: true
    },
    slug: { // slug for the product related to this design
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var Design = mongoose.model('Design', DesignSchema);

module.exports = Design;