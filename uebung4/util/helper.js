'use strict';

var Helper = function(source){
    this.source = source;
};

Helper.prototype.filter = function(params) {

    if(params && this.source) {

        var filters = params.split(",");

        if (!filters.length > 0) return this;

        if (Array.isArray(this.source)) {

            var filterArray = [];
            this.source.forEach(function (obj) {
                var filterSource = {};
                filters.forEach(function (filter) {
                    if (obj.hasOwnProperty(filter)) {
                        filterSource[filter] = obj[filter];
                    } else {
                        var err = new Error("Attribut " + filter + " does not exist!");
                        err.status = 400;
                        throw err;

                    }
                });
                filterArray.push(filterSource);
            });
            this.source = filterArray;

        } else {
            var filterSource = {};
            var that = this;
            filters.forEach(function (filter) {
                //console.log(that.source);
                if (that.source.hasOwnProperty(filter)) {
                    filterSource[filter] = that.source[filter];
                } else {
                    var err = new Error("Attribut " + filter + " does not exist!");
                    err.status = 400;
                    throw err;
                }
            });
            this.source = filterSource;
        }
    }

    return this;
};

Helper.prototype.limit = function(limit){

    if (limit && Array.isArray(this.source)) {

        // TODO welcher error bei falschen variablen?
        if (isNaN(parseInt(limit)) || limit <= 0) {
            var err = new Error("Limit has to be positiv and a number!");
            err.status = 400;
            throw err;
        }

        this.source = this.source.slice(0, limit);
    }

    return this;

};

Helper.prototype.offset = function(offset){

    if(offset && Array.isArray(this.source)) {

        // TODO welcher error bei falschen variablen?
        if (isNaN(parseInt(offset)) || offset < 0 || offset >= this.source.length) {
            var err = new Error("Offset has to be positiv and a number!");
            err.status = 400;
            throw err;
        }

        this.source = this.source.slice(offset, this.source.length);
    }

    return this;
};

Helper.prototype.get = function(){
    return this.source;
};


module.exports = Helper;