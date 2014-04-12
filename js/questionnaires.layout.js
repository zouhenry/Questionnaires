

questionnaires.app.module("layout", function (layout, app) {

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
            "#index": {
                observe: "index"
            }
        },
        initialize: function () {
            var maxIndex = this.collection.length - 1;
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

    layout.ChoiceView = Marionette.ItemView.extend({
        template: "#template_multipleChoice",
        tagName: "li"
    });

    layout.TestView = Marionette.CompositeView.extend({
        template: "#template_testView",
        itemViewContainer: "[data-id=choices]",
        itemView:layout.ChoiceView
    });

    layout.HeaderController = questionnaires.ViewController.extend({
        itemView: layout.HeaderView
    });


    layout.TestController = questionnaires.ViewController.extend({
        itemView: layout.TestView,
        itemViewOptions: function () {
            return {model: this.model, collection: new Backbone.Collection(this.model.get("choices")) };
        }
    });

    layout.pageLayout = Marionette.Layout.extend({
        template: "#layout",
        className: "row",
        regions: {
            headerRegion: "#pageHeader",
            testingRegion: {
                selector: "#testingArea",
                regionType: questionnaires.FadeTransitionRegion
            }
        },
        showHeaderView: function (view) {
            this.headerRegion.show(view);
        },
        showTestView: function (view) {
            this.testingRegion.show(view);
        }
    });

    layout.Controller = questionnaires.ViewController.extend({
        itemView: layout.pageLayout,
        onInitializing:function(){
            this.collection = new Backbone.Collection(this.options.questionPool);
            this.quizModel = this.collection.at(0);
            this.listenTo(this.collection, "item:selected", function (selectedModel) {
                this.renderTest(selectedModel);
            });
        },
        onViewShow: function () {
            this.renderHeader();
            this.renderTest(this.quizModel);
        },
        renderHeader: function () {
            this.headerModel = new Backbone.Model({ total: this.options.totalQuestions, index: 1 });
            this.headerController = new layout.HeaderController({ model: this.headerModel, collection: this.collection });
            this.view.showHeaderView(this.headerController.createView());
        },
        renderTest: function (model) {
            if (this.testController && model === this.testController.model) {
                return;
            }
            this.testController = new layout.TestController({model: model});
            this.view.showTestView(this.testController.createView());
        }
    });
})