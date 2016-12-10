'use strict';

var Searcher = function (items,except) {
    this.items = items;
    this.except = except || [];
};

Searcher.prototype.searchTerms = function(terms){

    for(var term in terms){

        if(this.except.indexOf(term) > -1) continue;

        for(var i = this.items.length -1 ; i >=0; i-- ){

            var item = this.items[i];

            if(item.hasOwnProperty(term) && item[term]){

                if(typeof item[term] === 'string' && !item[term].includes(terms[term])){
                    this.items.splice(i,1);
                }else if(typeof item[term] === 'number' && item[term] != terms[term]){
                    this.items.splice(i,1);
                }
            }else{
                var err = new Error(term + " does not exist in this resource!");
                err.status = 400;
                throw err;
            }
        }
    }

    return this;
};

Searcher.prototype.get = function(){
    return this.items;
};

module.exports = Searcher;