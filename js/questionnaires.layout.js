

questionnaires.app.module("layout", function (layout, app) {

    layout.HeaderView = Marionette.ItemView.extend({
        template: "#template_headerView",
        className: "row",
        events: {
            "click #btnPrev": function () {
                var newCount = this.model.get("count") - 1;
                this.model.set("count", newCount < 0 ? 0 : newCount);
            },
            "click #btnNext": function () {
                var newCount = this.model.get("count") + 1;
                var total = this.model.get("total");
                this.model.set("count", newCount > total ? total : newCount);
            }
        },
        bindings: {
            "#count": {
                observe: "count"
            }
        },
        onShow: function () {
            this.stickit();
        }
    });

    layout.HeaderController = questionnaires.ViewController.extend({
        itemView: layout.HeaderView
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
        onViewShow: function () {
            this.renderHeader();
        },
        renderHeader: function () {
            this.headerModel = new Backbone.Model({ total: this.options.totalQuestions, count: 0 });
            this.headerController = new layout.HeaderController({ model: this.headerModel });
            this.view.showHeaderView(this.headerController.createView());
        },
        renderQuiz: function () {
            //TODO
        }
    });
})