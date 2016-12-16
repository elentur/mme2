/**
 * Created by roberto on 16.12.16.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var VideoSchema = new Schema({
    title: { type: String, required: true},
    description: { type: String, default: ""},
    src:{ type: String, required: true},
    length:{type: Number, min:0, required: true},
    playcount:{type: Number, min:0, default: 0},
    ranking:{type: Number, min:0, default: 0}

}, {
    timestamps: {createdAt: 'timestamp'}
});

module.exports = mongoose.model('Video', VideoSchema);