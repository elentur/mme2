/**
 * Created by Inga Schwarze on 20.12.2016.
 *
 */

// get mongoose library
var mongoose = require('mongoose');
// mongoose knows Schema, used to create our own Schema
var Schema = mongoose.Schema;

// Object with attributes > structure declaration
var VideoSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, default: ''},
    src: {type: String, required: true},
    length: {type: Number, min: 0, required: true},
    playcount: {type: Number, min: 0, default: 0},
    ranking: {type: Number, min: 0, default: 0}
}, {
    // overwrite createdAt
    timestamps: {createdAt: 'timestamp'}
});

// __v, updatedAt is set automatically

// export
module.exports = mongoose.model('Video', VideoSchema);
