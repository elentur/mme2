/**
 * Created by Inga Schwarze on 11.12.2016.
 */
/**
 * Klasse Optimizer mit Konstruktor zur Übergabe von einem oder mehreren Videos
 * @param videoSource - Array von Videos oder einzelnes Video-Objekt
 * @constructor
 */
var Optimizer = function(videoSource){
this.videoSource = videoSource;

};

/**
 * allgemeine Filterfunktion für alle Video-Objekte
 * @param filterString - String von Filtern, getrennt durch Komma
 * @returns {Optimizer}
 */
Optimizer.prototype.filter = function(filterString) {
    // wenn es Filter gibt
    if(filterString) {

        // generate array from filterString
        var filters = filterString.split(",");

        // leere Filter Arrays werden nicht durchlaufen
        if(filters.length <= 0) return this;

        // soll ein video oder mehrere videos gefiltert werden? > videoSource = array?
        if (Array.isArray(this.videoSource)) {
            // Array für die gefilterten Videos
            var filteredVideos = [];
            // alle Videos holen und durchgehen
            this.videoSource.forEach(function (video) {
                // neues Objekt für jedes gefilterte Video
                var filteredVideoObj = {};

                // durchlaufe jedes Filterattribut, Fehler bei nicht existierendem Attribut ausgeben
                filters.forEach(function (filter) {
                    if (!video[filter]) {
                        var error = new Error(filter + " is not an existing attribute!");
                        error.status = 400;
                        throw error;
                    }
                    // gesuchtes Feld übernehmen und in neues Video Objekt packen
                    filteredVideoObj[filter] = video[filter];
                });
                // gefiltertes Video Objekt in Array speichern
                filteredVideos.push(filteredVideoObj);
            });
            // videoSource überschreiben
            this.videoSource = filteredVideos;


            // Kein Array, sondern Objekt > nur noch ein einziges Video
        } else {
            // this für alle Funktionen gleich
            var that = this;

            var filteredVideoObj = {};
            filters.forEach(function (filter) {
                if (!that.videoSource[filter]) {
                    var error = new Error(filter + " is not an existing attribute!");
                    error.status = 400;
                    throw error;
                }
                filteredVideoObj[filter] = that.videoSource[filter];
            });
            this.videoSource = filteredVideoObj;
        }
    }
    return this;
};

/**
 * Wenn offset gesetzt ist und ein Video-Array vorliegt, kann mit dem offset Wert eingegrenzt werden,
 * ab welchem Index die Videos zurückgegeben werden sollen.
 * @param offset - positive number, not bigger than max size of video array
 * @returns {Optimizer}
 */

Optimizer.prototype.offset = function (offset) {

    if(offset && Array.isArray(this.videoSource)) {
        if(isNaN(parseInt(offset)) || offset < 0 || offset >= this.videoSource.length){
            var error = new Error("offset has to be a positive number and must not be bigger than the videoSource length!")
            error.status = 400;
            throw error;
        }
        this.videoSource = this.videoSource.slice(offset,this.videoSource.length);
    }
    return this;
};

/**
 * Wenn limit gesetzt ist und ein Array von Videos vorliegt, kann mit dem limit Wert angegeben werden,
 * wie viele Videos angezeigt werden. Limit Wert 5 zeigt Videos mit Index 0-4.
 * @param limit - a positive number that must not be smaller than zero!
 * @returns {Optimizer}
 */

Optimizer.prototype.limit = function (limit) {

    if(limit && Array.isArray(this.videoSource)) {
        if(isNaN(parseInt(limit)) || limit <= 0){
            var error = new Error("limit has to be positive number and must not be smaller than zero!");
            error.status = 400;
            throw error;
        }
        this.videoSource = this.videoSource.slice(0, limit);
    }
    return this;
};


/**
 * Getter von Videos > gibt gefilterte Videos zurück
 * @returns {*}
 */
Optimizer.prototype.get = function () {
   return this.videoSource;
};


// Optimizer kommt in den globalen Namensraum
module.exports = Optimizer;
