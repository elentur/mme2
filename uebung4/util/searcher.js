'use strict';

var Search = function (items) {
    this.items = items;
};

Search.prototype.searchTerms = function(terms){
    for(var term in terms){
        console.log(term);
    }
};

Search.prototype.get = function(){
    return this.items;
};

module.exports = Search;