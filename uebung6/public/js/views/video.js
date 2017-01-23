/**
 *  Backbone View (stub code) using the #xx-yy-zz-template from DOM to render ... into target element #xx-yy-target
 *  Needs model to be set from outside
 *
 *  (file can be deleted or changed für Ü6 videos)
 *
 *  @author Johannes Konert
 */
define(['backbone', 'jquery', 'underscore'], function(Backbone, $, _) {
    return Backbone.View.extend({
        tagName: 'section',
        template: _.template($('#video-template').text()),
        render: function() {
            console.log(this);
            this.$el.html(this.template(this.model.attributes));
            return this;
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        }
    });
});

