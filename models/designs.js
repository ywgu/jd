/**
 * Created by William Gu on 2016/6/18.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var designSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    designId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

var Designs = mongoose.model('Design', designSchema);

module.exports = Designs;