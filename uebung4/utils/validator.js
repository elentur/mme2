/**
 * Created by Inga Schwarze on 11.12.2016.
 * CHECK BODY FOR PUT & POST
 */

var Validator = function(body){
    this.body = body;

};

/**
 * Clean baut ein neues Objekt auf, in der Form unserer gewünschten Felder
 * @param params - gewünschte Felder + eventuelle Default Werte
 * @returns {Validator}
 */
Validator.prototype.clean = function (params) {

    var obj = {};
    // Schleife über alle benötigten Felder
    for(var key in params) {

        // wenn es keinen key gibt, z.B. description (nicht required) und es einen default Wert gibt
        if(!this.body[key] && params[key].length > 0){
            // setze description aus dem default wert von der ersten Stelle
            this.body[key] = params[key][0];
        }
        // alle Felder die wir brauchen werden aus dem Body geholt und in obj gespeichert
        // Felder, die nicht gewollt sind, z.B. "Extratitel" werden nicht beachtet
        obj[key] = this.body[key];
    }

    // body wird überschrieben und enthält nur noch die gewollten Felder
    this.body = obj;

    return this;
};

/**
 * Validiert alle Felder auf übergebene Regeln
 * @param rules - ein Objekt mit Feldnamen als key und den Regeln als Array
 * @returns {Validator}
 */

Validator.prototype.validate = function (rules) {

    // rules ist Objekt mit key und Namen der Funktion
    // alle Keys werden durchlaufen
    // von den Keys die einzelnen Namen der Funktion durchlaufen
    // rule kann also z.B. string oder required sein
    // gibt es diese Funktion, die z.B. string heißt?
    // wenn nicht, wird der Error geworfen > is not a function
    // wenn sie aber existiert, wird sie mit that[rule] aufgerufen



    var that = this;
    for(var key in rules) {
        rules[key].forEach(function (rule) {
            // that ruft immer das Object auf > Validator
            // rule ist Name einer Funktion
            // Funktionsaufruf hat in den runden Klammern das key/value Paar
            if(typeof that[rule] == 'function') {

                // this.required('title', value title), wobei value title z.B. = "super toller titel"
                // Funktionen unten werden aufgerufen mit den gebrauchten Werten
                that[rule](key, that.body[key]);
            } else {
                var error = new Error(rule + " is not a function!");
                error.status = 400;
                throw error;
            }

        })
    }
    return this;
};

/*********************************************************************************************
 *
 * Kontroll Klassen, die auf Regeln überprüfen
 **********************************************************************************************/


/**
 * checkt, ob das Attribut existiert
 * @param key - z.B. title
 * @param value - z.B. super toller titel
 */
Validator.prototype.required = function (key, value) {
    if(!value) {
        var error = new Error(key + " is required and has to be set!");
        error.status = 400;
        throw error;
    }
}

/**
 * checkt, ob das Attribut ein String ist
 * @param key - Name des Feldes, z.b. titel
 * @param value - der Wert des Feldes, z.B. toller titel
 */
Validator.prototype.string = function (key, value) {
    if(value && typeof value !== 'string') {
        var error = new Error(key + " has to be a string!");
        error.status = 400;
        throw error;
    }
}

/**
 * checkt, ob das Attribut eine Number ist
 * @param key - Name des Feldes, z.b. titel
 * @param value - der Wert des Feldes, z.B. toller titel
 */

Validator.prototype.number = function (key, value) {
    if(value && typeof value !== 'number') {
        var error = new Error(key + " has to be a number!");
        error.status = 400;
        throw error;
    }
}

/**
 * checkt, ob das Attribut eine positive Zahl ist
 * @param key - Name des Feldes, z.b. titel
 * @param value - der Wert des Feldes, z.B. toller titel
 */

Validator.prototype.positive = function (key, value) {
    if(value && value < 0) {
        var error = new Error(key + " has to be positive!");
        error.status = 400;
        throw error;
    }
}

/**
 * Getter von Videos > gibt validiertes Videos zurück > checkt ob alle Felder valide sind
 * @returns {*}
 */

Validator.prototype.get = function () {
    return this.body;
};


// Optimizer kommt in den globalen Namensraum
module.exports = Validator;