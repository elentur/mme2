'use strict';

var Validator = function (args) {

    this.body = {};
    this.roules = {};

    var that = this;

    for (var key in args) {

        var roules = args[key].split("|");

        if (roules.length <= 0) continue;

        that.roules[key] = [];

        roules.forEach(function (roule) {
            if (typeof that[roule] === "function") {
                that.roules[key].push(roule);
            } else {
                var err = new Error(roule + " is not a function");
                err.status = 400;
                throw err;
            }
        });
    }
};

Validator.prototype.required = function (key, value) {
    if (!value) {
        var error = new Error(key + " is required and must be set!");
        error.status = 400;
        throw error;
    }
};

Validator.prototype.string = function (key, value) {
    if (value && typeof value != "string") {
        var error = new Error(key + " has to be a string!");
        error.status = 400;
        throw error;
    }
};

Validator.prototype.num = function (key, value) {
    if (value && typeof value != "number") {
        var error = new Error(key + " has to be a number!");
        error.status = 400;
        throw error;
    }
};

Validator.prototype.positive = function (key, value) {
    if (value && value < 0) {
        var error = new Error(key + " has to be positiv!");
        error.status = 400;
        throw error;
    }
};

Validator.prototype.validate = function (body) {
    this.body = body;

    for (var key in this.roules) {

        var that = this;

        this.roules[key].forEach(function (roule) {
            that[roule](key, that.body[key]);
        });
    }

    return this;
};

Validator.prototype.clean = function (args) {

    var obj = {};

    for (var field in args) {

        if(field.length > 0 && !this.body[field]){
            this.body[field] = args[field][0];
        }

        obj[field] = this.body[field];
    }

    this.body = obj;

    return this;
};

Validator.prototype.get = function () {
    return this.body;
};

module.exports = Validator;