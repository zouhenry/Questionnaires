

questionnaires.app.module("layout", function (layout, app) {

    //header view with navigation buttons
    layout.HeaderView = Marionette.ItemView.extend({
        template: "#template_headerView",
        className: "row",
        events: {
            "click #btnPrev": function () {
                var newindex = this.model.get("index") - 1;
                this.model.set("index", newindex < 1 ? 1 : newindex);
            },
            "click #btnNext": function () {
                var newindex = this.model.get("index") + 1;
                var total = this.model.get("total");
                this.model.set("index", newindex > total ? total : newindex);
            }
        },
        bindings: {
            "#index": { //two-way binding via stickit
                observe: "index"
            }
        },
        initialize: function () {   
            var maxIndex = this.collection.length - 1;
            //listen to model's index value change
            this.listenTo(this.model, "change:index", function (model, index) {
                index < 1 ? 1 : index;
                index > maxIndex ? maxIndex : index;
                var selectedTest = this.collection.at(index - 1);
                this.collection.trigger("item:selected", selectedTest);
            });
        },
        onShow: function () {
            this.stickit();
        }
    });

    // final view with the grades
    layout.scoreView = Marionette.ItemView.extend({
        template: "#template_score",
        serializeData: function () {
            var data = { grade: 0, total: 3 };
            return data;
        }
    });

    // answer section where the choices are
    layout.ChoiceView = Marionette.ItemView.extend({
        template: "#template_multipleChoice",
        tagName: "li"
    });


    //test view
    layout.TestView = Marionette.CompositeView.extend({
        template: "#template_testView",
        itemViewContainer: "[data-id=choices]",
        itemView:layout.ChoiceView
    });

    //controller for test header view
    layout.HeaderController = questionnaires.ViewController.extend({
        itemView: layout.HeaderView
    });

    //controller for test view
    layout.TestController = questionnaires.ViewController.extend({
        itemView: layout.TestView,
        itemViewOptions: function () {
            return {model: this.model, collection: new Backbone.Collection(this.model.get("choices")) };
        }
    });

    //  this is the layout for the quiz application
    layout.pageLayout = Marionette.Layout.extend({
        template: "#layout",
        className: "row",
        regions: {
            headerRegion: "#pageHeader",
            testingRegion: {    //using this testing region with special fade transition type
                selector: "#testingArea",
                regionType: questionnaires.FadeTransitionRegion
            }
        },
        showHeaderView: function (view) {   //show/render header view
            this.headerRegion.show(view);
        },
        showTestView: function (view) {     //show/render test view
            this.testingRegion.show(view);
        }
    });

    //Create a new controller using Custom ViewController
    layout.Controller = questionnaires.ViewController.extend({
        itemView: layout.pageLayout,    //use layout.pageLayout as the view type
        onInitialize: function () {
            //Listen to collection's "item:selected" event, then render view for that model
            this.listenTo(this.collection, "item:selected", function (selectedModel) {
                this.model = selectedModel;
                this.renderTest();
            });
        },
        getCollection: function(){
            var collection = new Backbone.Collection(this.options.questionPool);
            return collection;
        },
        onViewShow: function () {   //gets called when the view triggers "show" event, see "questionnaires.ViewController"
            this.renderHeader();
            this.renderTest();
        },
        renderHeader: function () {
            this.headerModel = new Backbone.Model({ total: this.options.totalQuestions, index: 1 });    //create model for header
            this.headerController = new layout.HeaderController({ model: this.headerModel, collection: this.collection });  //create controller for header view
            this.view.showHeaderView(this.headerController.createView());   //render header view into dom
        },
        renderTest: function () {  //render question
            if (this.testController && this.model === this.testController.model) {   //prevents re-rendering the same question
                return;
            }
            this.testController = new layout.TestController({ model: this.model });
            this.view.showTestView(this.testController.createView());
        }
    });
})