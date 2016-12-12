'use strict';

var Validator = function (body) {
    this.body = body;
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

Validator.prototype.validate = function (rules) {

    for (var key in rules) {

        var that = this;

        rules[key].split("|").forEach(function (rule) {

            console.log(rule);

            if (typeof that[rule] === "function") {
                that[rule](key, that.body[key]);
            } else {
                var err = new Error(rule + " is not a function");
                err.status = 400;
                throw err;
            }

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