/**
 *  Backbone Model (stub)
 *  Connected to REST API /{ressourcepath}
 *
 *  (file can be deleted or used for Ü6 videos)
 *
 *  @author Johannes Konert
 */
define(['backbone', 'underscore'], function(Backbone, _) {
    var result = {};

    result.Model  = Backbone.Model.extend({
        urlRoot : "/videos",
        idAttribute:"_id",
        defauls:{
            title:"",
            src: "",
            description:"",
            length:0,
            playcount:0,
            ranking:0,
            timestamps:0
        },
        initialize: function(){
            console.log("Welcome to this world model");
        },
        validate: function(attr){
            if(!attr.creator){
                return "Missing Creator ID";
            }
        }
    });

    result.Collection = Backbone.Collection.extend({
        model : result.Model,
        url  :"/videos",
        initialize: function(){
            console.log("Welcome to this world collection");
        }
    });

    return result;
});