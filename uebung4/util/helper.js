'use strict';



var exports = module.exports = filter;

function filter(source, params){
    var filters = params.split(",");
    if (!filters.length > 0) return obj;
    if ("array" === typeof source) {
    var filterArray = [];
    source.forEach(function (video) {
        var filterObj = {};
        filters.forEach(function (filter) {
            filterObj[filter] = video[filter];
            filterArray.push(filterObj);
        });
    });

    return filterArray;
} else {
    var filterObj = {};
    filters.forEach(function (filter) {
        filterObj[filter] = source[filter];
    });
    return filterObj;
}
}