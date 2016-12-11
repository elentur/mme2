/**
 * Created by Inga Schwarze on 11.12.2016.
 */
// items = videos
// except = array mit namen, die wir nicht kontrollieren wollen

var Search = function(items, except){
    this.items = items;
    this.except = except;

};



Search.prototype.searching = function (searchTerms) {

    console.log(searchTerms);
    // Objekt searchTerms wird durchlaufen > req.query = {filter : "sfdsfdsf", title : "dadsadsadsad"}
    // searchTerm = z.B. filter oder title
    for(var searchTerm in searchTerms) {

        // wenn except suchterm enthält, wird nicht weiter kontrolliert
        if(this.except.indexOf(searchTerm) > -1) continue;

        // jedes Video wird durchlaufen und auf searchTerm durchsucht
        // Schleife von hinten durchlaufen, um Fehler beim löschen zu vermeiden
        for(var i = this.items.length - 1; i >= 0; i--){
            var item = this.items[i];
            if(item[searchTerm]) {
                // check, ob Wert im Video den Suchterm nicht enthält (video.description enthält z.B. "toll"?)
                if(typeof item[searchTerm] == 'string' && !item[searchTerm].includes(searchTerms[searchTerm])){
                    // rausschneiden, was nicht in Suchanfrage enthalten ist
                    // splice ändert direkt das Array, muss nicht mehr neu gespeichert werden
                    this.items.splice(i,1);
                    // wenn man z.B. nach Länge sucht, soll die gesuchte Länge rausgeworfen werden, sofern sie nicht in den Videos existiert
                } else if (typeof item[searchTerm] == 'number' && item[searchTerm] != searchTerms[searchTerm]){
                    this.items.splice(i,1);
                }

            } else {
                var error = new Error(searchTerm + " does not exist in the ressource!");
                error.status = 400;
                throw error;
            }
        }
    }
    return this;

}

/**
 * Getter von Videos > gibt validiertes Videos zurück > checkt ob alle Felder valide sind
 * @returns {*}
 */
Search.prototype.get = function () {
    return this.items;
};


// Optimizer kommt in den globalen Namensraum
module.exports = Search;