/**
 * Created by Inga Schwarze on 11.12.2016.
 */
/**
 * Klasse Optimizer mit Konstruktor zur Übergabe von einem oder mehreren Videos
 * @param source - Array von Videos oder einzelnes Video-Objekt
 * @constructor
 */
var Optimizer = function(source){
this.source = source;

};

/**
 * allgemeine Filterfunktion für alle Video-Objekte
 * @param params - String von Filtern, getrennt durch Komma
 * @returns {Optimizer}
 */
Optimizer.prototype.filter = function(params) {
    // wenn es keinen Filter gibt
    if(params) {

        var that = this;
        var filters = params.split(",");

        if (Array.isArray(this.source)) {
            // Array für Filter, zeigt alle Felder aus dem Filter an
            var filterArray = [];
            // alle Videos holen und durchgehen
            this.source.forEach(function (video) {
                // neues Objekt für jedes Video
                var filterObj = {};
                filters.forEach(function (filter) {
                    if (!video[filter]) {
                        var error = new Error(filter + " is not an existing attribute!");
                        error.status = 400;
                        throw error;
                    }
                    filterObj[filter] = video[filter];
                });
                filterArray.push(filterObj);
            });
            this.source = filterArray;
            // Kein Array, sondern Objekt > nur noch ein einziges Video
        } else {
            var filterObj = {};
            filters.forEach(function (filter) {
                if (!that.source[filter]) {
                    var error = new Error(filter + " is not an existing attribute!");
                    error.status = 400;
                    throw error;
                }
                filterObj[filter] = that.source[filter];
            });
            this.source = filterObj;
        }
    }
    return this;
};


Optimizer.prototype.offset = function (offset) {

    if(offset && Array.isArray(this.source)) {
        if(isNaN(parseInt(offset)) || offset < 0 || offset >= this.source.length){
            var error = new Error("offset has to be a positive number and must not be bigger than the source length!")
            error.status = 400;
            throw error;
        }
        this.source = this.source.slice(offset,this.source.length);
    }
    return this;
};


Optimizer.prototype.limit = function (limit) {

    if(limit && Array.isArray(this.source)) {
        if(isNaN(parseInt(limit)) || limit <= 0){
            var error = new Error("limit has to be positive number and must not be smaller than zero!");
            error.status = 400;
            throw error;
        }
        this.source = this.source.slice(0, limit);
    }
    return this;
};


/**
 * Getter von Videos > gibt gefilterte Videos zurück
 * @returns {*}
 */
Optimizer.prototype.get = function () {
   return this.source;
};


// Optimizer kommt in den globalen Namensraum
module.exports = Optimizer;
