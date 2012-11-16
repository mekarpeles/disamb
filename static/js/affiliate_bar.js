$(function(){
    window.abarModel = Backbone.Model.extend({});
    window.abarView = Backbone.View.extend({
        el: "#affiliate_bar",
        button: $("#get-link"),
        template: $("#affiliate_bar-template"),
        serverVars: serverVars,
        popup: $("#affiliate_bar-pop-up"),
        reflink: $("#ref_link"),
        events: {
            "click #get-link" : "getLink",
            "click #close-popup": "closePopup",
            "keydown *": "closePopupOnEsc",
        },
        initialize: function() {
            this.model = new abarModel({view: this});
            _.bindAll(this, 'render');
            this.render()
        },
        getLink: function() {
            var ref = 'http://' + serverVars.http_host + '/ref/' 
                + serverVars.username + '@default/' 
                + serverVars.http_host + serverVars.http_path;
            var coords = $(this.button).offset();
            coords.left = coords.left - 60;
            coords.top = coords.top + 26;
            $(this.reflink).html(ref);
            $(this.popup).css('top', coords.top);
            $(this.popup).css('left', coords.left);
            $(this.popup).show();
            selectAll($(this.reflink))
        },
        closePopup: function() {
            $(this.popup).hide();
        },
        closePopupOnEsc: function(e) {
            if (e.keyCode == '27') {
                $(this.popup).hide();
            }
        },
        render: function() {
            return this;
        }
    });
    window.App = new abarView();
});
