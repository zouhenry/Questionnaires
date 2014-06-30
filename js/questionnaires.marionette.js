window.questionnaires.ViewController = Marionette.Controller.extend({
    itemView: null,
    view: null,
    itemViewOptions: function () {
        return _.extend({}, this.options, { controller: this, model: this.model });
    },
    getItemView: function () {
        return Marionette.getOption(this, "itemView");
    },
    initialize: function (options) {
        this.triggerMethod("before:initialize", options);
        this.triggerMethod("initializing", options);
        this.triggerMethod("initialize", options);
    },
    onInitializing: function (options) {
        this.collection = this.getCollection();
        this.model = this.getModel();
    },
    getCollection: function () {
        return this.collection || Marionette.getOption(this, "collection") || new Backbone.Collection();
    },
    getModel: function () {
        return this.options.model || (this.collection.length > 0 ? this.collection.at(0) : new Backbone.Model());
    },
    createView: function () {
        var doCreateView = this.triggerMethod("before:create:view");
        if (doCreateView === false) {
            //if onBeforeCreateView returns false, it indicates not to render views
            return null;
        }
        this.triggerMethod("creating:view");
        this.triggerMethod("create:view");
        return this.view;
    },
    onCreatingView: function () {
        var args = this.itemViewOptions();
        var view = this.getItemView();
        this.view = new view(args);
        this.listenTo(this.view, "show", function () {
            this.triggerMethod("view:show");
        });
        this.delegateEvents();
    },
    delegateEvents: function(){
        Marionette.bindEntityEvents(this, this.view, Marionette.getOption(this, "viewEvents"));
        Marionette.bindEntityEvents(this, this.model, Marionette.getOption(this, "modelEvents"));
        Marionette.bindEntityEvents(this, this.collection, Marionette.getOption(this, "collectionEvents"));
    },
    undelegateEvents: function(){
        Marionette.unbindEntityEvents(this, this.view, Marionette.getOption(this, "viewEvents"));
        Marionette.unbindEntityEvents(this, this.model, Marionette.getOption(this, "modelEvents"));
        Marionette.unbindEntityEvents(this, this.collection, Marionette.getOption(this, "collectionEvents"));
    },
    close: function () {
        this.triggerMethod("before:close");
        this.triggerMethod("closing");
        this.triggerMethod("close");
    },
    onClosing: function () {
        this.undelegateEvents();
        this.stopListening();
    }
});

window.questionnaires.FadeTransitionRegion = Marionette.Region.extend({
    show: function(view) {
        this.ensureEl();
        view.render();

        this.close(function() {
            if(this.currentView && this.currentView !== view) {
                return;
            }
            this.currentView = view;

            this.open(view, function() {
                if(view.onShow) {
                    view.onShow();
                }
                view.trigger("show");

                if(this.onShow) {
                    this.onShow(view);
                }
                this.trigger("view:show", view);
            });
        });

    },

    close: function(cb) {
        var view = this.currentView;
        delete this.currentView;

        if(!view) {
            if(cb) {
                cb.call(this);
            }
            return;
        }

        var self = this;
        view.$el.fadeOut(function() {
            if(view.close) {
                view.close();
            }
            if(view.controller && view.controller.close) {
                view.controller.close();
            }

            self.trigger("view:closed", view);
            if(cb) {
                cb.call(self);
            }
        });

    },

    open: function(view, callback) {
        var self = this;
        this.$el.html(view.$el.hide());
        view.$el.fadeIn(function() {
            callback.call(self);
        });
    }
});

window.questionnaires.SpinnerTransitionRegion = Marionette.Region.extend({
    open: function (view, callback) {
        var self = this;

        var selector = view.clearSelector ? view.$el.find(view.clearSelector) : view.$el;

        this.$el.html(view.$el);
        selector.hide().css({ opacity: 0.0, visibility: "hidden" });
        this.showSpinner(view);
        view.containingRegion = this;
        selector.fadeIn().css({ opacity: 0.0, visibility: "visible" }).animate({ opacity: 1.0 }, function () {
            self.hideSpinner(view);
            if (callback && typeof callback === "function") {
                callback.call(self);
            }
        });
    },
    showSpinner: function (view) {
        ppsa.log_verbose("showSpinner");
        view = view || this.currentView;
        this.ensureEl();
        if (view) {
            var selector = view.clearSelector ? view.$el.find(view.clearSelector) : view.$el;
            selector.css({ opacity: 0, visibility: "hidden" });
        }
        this.$el.toggleClass("spinner_middle", true);
    },
    hideSpinner: function (view) {
        ppsa.log_verbose("hideSpinner");
        view = view || this.currentView;
        if (view) {
            var selector = view.clearSelector ? view.$el.find(view.clearSelector) : view.$el;
            selector.css({ opacity: 1, visibility: "visible" });
        }
        this.$el.toggleClass("spinner_middle", false);
    }
});