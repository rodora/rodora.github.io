define(['jquery', 'underscore', 'backbone', 'unit', 'ui', 'view'], function ($, _, Backbone, Unit, Ui, View) {
    var app_router;
    function init() {
        var AppRouter = Backbone.Router.extend({
            routes: {
                "unit": "unitRoute",
                "unit/id/:id": "unitDetailRoute",
                "unit/gid/:gid": "unitDetailByGIdRoute",
                "unit/search/*condition": "unitSearchRoute",
                "unit/category/*condition": "unitCategoryRoute",
                "lang/:lang": "languageChangeRoute",
                "lang/data/:lang": "dataLanguageChangeRoute",
                '*path': 'defaultRoute'
            },
            defaultRoute: function () {
                app_router.navigate("unit", { trigger: true });
            }
        });
        // Initiate the router
        app_router = new AppRouter;

        app_router.on('route:unitRoute', function (actions) {
            console.log("route:unitRoute");
            View.doPage();
        });
        app_router.on('route:unitDetailRoute', function (id) {
            var unit = _.find(Unit.data.unit, function (o) {
                return o.id == id;
            });
            if (!unit) {
                View.doPage();
            }
            else {
                if (!View.getActiveMenu()) {
                    View.doPage(Math.ceil(unit.gId / 100));
                }
                View.showDetail(unit);
            }
        });
        app_router.on('route:unitDetailByGIdRoute', function (gid) {
            var unit = _.find(Unit.data.unit, function (o) {
                return o.gId == gid;
            });
            if (!unit) {
                View.doPage();
            }
            else {
                if (!View.getActiveMenu()) {
                    View.doPage(Math.ceil(unit.gId / 100));
                }
                View.showDetail(unit);
            }
        });
        app_router.on('route:unitSearchRoute', function (condition) {
            View.doSearch(condition);
        });
        app_router.on('route:unitCategoryRoute', function (condition) {
            View.doCategory(condition);
        });
        app_router.on('route:languageChangeRoute', function (lang) {
            Ui.setLang(lang);
            app_router.navigate("unit");
            location.reload();
        });
        app_router.on('route:dataLanguageChangeRoute', function (lang) {
            Unit.setLang(lang);
            app_router.navigate("unit");
            location.reload();
        });

        Backbone.history.start();
    }
    return {
        init: init
    };
});