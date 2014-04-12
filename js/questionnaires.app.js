///////////////////////////////////////////////////////////
// Creates a new application
window.questionnaires = window.questionnaires || {};
window.questionnaires.app = new Marionette.Application();

$(function () {
    //////////////////////////////////////////////////////
    //Definition the controller
    questionnaires.app.controller = Marionette.Controller.extend({
        
        defaultRoute: function () {
            $("#pageContent").append("hello from default route");
            var layoutController = new questionnaires.app.layout.Controller(this.getData());
            questionnaires.app.contentRegion.show(layoutController.createView());
        },
        getData: function () {
            var data = {
                subject: "JavaScript",
                totalQuestions: 3,
                questionPool: [{
                    type: "multipleChoices",
                    question: "\"0\"===false",
                    choices: [{ value: 1, text: "true" }, { value: 0, text: "false" }, { value: 3, text: "undefined" }],
                    answer: 1,
                    score: 1
                },
                {
                    type: "multipleChoices",
                    question: "NaN===NaN",
                    choices: [{ value: 1, text: "true" }, { value: 0, text: "false" }, { value: 3, text: "undefined" }],
                    answer: 2,
                    score: 3
                },
                {
                    type: "multipleChoices",
                    question: "undefined == null",
                    choices: [{ value: 1, text: "true" }, { value: 0, text: "false" }, { value: 3, text: "undefined" }],
                    answer: 1,
                    score: 2
                }]
            };
            return data;
        }
    });

    ////////////////////////////////////////////////////
    // Your application needs to do useful things, like displaying content in your regions, 
    // starting up your routers, and more. To accomplish these tasks and ensure that your Application is fully configured, you can add initializer callbacks to the application.
    questionnaires.app.addInitializer(function (options) {
        new questionnaires.app.route({
            controller: new questionnaires.app.controller()
        });
    
        if (Backbone.history) {
            Backbone.history.start();
        }
    });

    ////////////////////////////////////////////////////
    // Defining page regions to be accessed directly via "MyApp.[region_name]"
    questionnaires.app.addRegions({
        contentRegion: "#pageContent"
    });

    //////////////////////////////////////////////////////
    // Defining the routes
    questionnaires.app.route = Marionette.AppRouter.extend({
        appRoutes: {
            //"": "loadLandingPage",
            "": "defaultRoute"
        }
    });


    //////////////////////////////////////////////////////
    //Kicks off the application
    questionnaires.app.start();
});