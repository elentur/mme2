/**
 *  Mongoose Schema and Model for Video
 *
 *  @author Johannes Konert
  */
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VideoSchema   = new Schema({
    title:       { type: String, required: true},
    src:         { type: String, required: true},
    description: { type: String, default: ''},
    length:      { type: Number, required: true, min: 0},
    playcount:   { type: Number, default: 0, min: 0},
    ranking:     { type: Number, default: 0}
}, {
    timestamps: {createdAt: 'timestamp'}
});
// optional more indices
VideoSchema.index({ timestamp: 1});

module.exports = mongoose.model('Video', VideoSchema);
