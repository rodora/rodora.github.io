var UnitList = [];
var app_router;
var UnitParam = {
    CategoryPer: [
        0.38999998569488525,
        0.40000000596046448,
        0.40999999642372131,
        0.41999998688697815,
        0.43000000715255737,
        0.40999999642372131
    ],
    NextExpPer: [
        2.38,
        2.42,
        2.48,
        2.58,
        2.66,
        2.60
    ],
    StylePer: [
        1.1000000238418579,
        1.1000000238418579,
        0.699999988079071,
        0.800000011920929,
        1.25,
        0.85000002384185791,
        0.949999988079071,
        1.0,
        0.949999988079071,
        1.0,
        0.60000002384185791,
        1.2999999523162842
    ]
};
var Unit = {
    init: function (callback) {
        var self = this;
        var force = self.isUnitDataTooOld();
        var json = localStorage.getItem("unit");
        if (json && !force) {
            var data = JSON.parse(json);
            console.log("Get unitdata from cache. ", data);
            UnitList = data;
            callback.call(this);
        }
        else {
            $.ajax({
                url: '/data/unit.json',
                cache: false,
                dataType: "json",
                success: function (data) {
                    localStorage["unit"] = JSON.stringify(data);
                    console.log("Get unitdata from web. ", data);
                    UnitList = data;
                    callback.call(this);
                }
            });
        }
    },

    isUnitDataTooOld: function () {

    },

    doPage: function (mode) {
        var page = 1;
        if (localStorage["page"]) {
            page = JSON.parse(localStorage["page"]);
        }
        var maxUnit = _.max(UnitList, function (o) { return parseInt(o.gId); });
        var maxPage = Math.ceil(parseInt(maxUnit.gId) / 100);
        switch (mode) {
            case "<<<": page = 1; break;
            case "<": page -= 1; break;
            case ">": page += 1; break;
            case ">>>": page = maxPage; break;
        }
        if ($.isNumeric(mode)) {
            page = mode;
        }
        if (page < 1) {
            page = 1;
        }
        if (page > maxPage) {
            page = maxPage;
        }
        localStorage["page"] = JSON.stringify(page);
        $("#pageInfo").text(page + "/" + maxPage);
        this.renderIconList();
    },

    renderIconList: function () {
        var self = this;
        var page = 1;
        if (localStorage["page"]) {
            page = JSON.parse(localStorage["page"]);
        }
        $('#iconContainer').empty();
        var unitpagelist = _.filter(UnitList, function (o) {
            var i = parseInt(o.gId);
            return (i <= page * 100) && (i > (page - 1) * 100);
        });
        $.each(unitpagelist, function (i, o) {
            if (o.gId == 0) {
                return;
            }
            var img = $("<img>");
            img.attr('src', '/img/Icon/icon_locked.png');
            img.attr('data-src', '/img/Icon/I' + o.gId + '.png');
            img.addClass('icon');
            img.data('id', o.id);
            img.error(function () {
                $(this).unbind("error").attr("src", "/img/Icon/icon_locked.png");
            });
            img.click(self.onUnitIconClick);
            var li = $("<li>");
            li.append(img);
            $('#iconContainer').append(li);
        });
        $("img").unveil();
    },
    onUnitIconClick: function (event) {
        console.log("onUnitIconClick");
        var id = $(event.target).data('id');
        app_router.navigate("unit/id/" + id, { trigger: true });
    },
    onEvolveUnitIconClick: function (event) {
        console.log("onEvolveUnitIconClick");
        var $oldmodal = $(event.target).parents(".modal.in");
        $oldmodal.on('hidden.bs.modal', function () {
            var id = $(event.target).data('id');
            app_router.navigate("unit/id/" + id, { trigger: true });
        });
        $oldmodal.modal("hide");
    },
    showDetail: function (unit) {
        var template = _.template($("#unitModalTemplate").html());
        var $modal = $(template(unit));
        $modal.on('show.bs.modal', function (e) {
            console.log("show");
        });
        $modal.on('shown.bs.modal', function (e) {
            console.log("shown");
            var slider = $modal.find('#unitLevel').slider({
                orientation: "vertical",
                min: 1,
                max: unit.lvMax,
                value: 1,
                step: 1,
                tooltip: 'always',
                tooltip_position: 'left',
                reversed: true,
                formatter: function (value) {
                    return 'Lv ' + value;
                }
            });
            slider.change(function (e) {
                var categoryPer = UnitParam.CategoryPer[unit.category - 1];
                var num = (unit.style - 1) * 3;
                var lifePer = UnitParam.StylePer[num];
                var attackPer = UnitParam.StylePer[num + 1];
                var healPer = UnitParam.StylePer[num + 2];
                var lv = e.value.newValue;
                $modal.find("#unitLife").text(Math.floor(Math.pow(Math.pow(lv, categoryPer), lifePer) * unit.life));
                $modal.find("#unitAttack").text(Math.floor(Math.pow(Math.pow(lv, categoryPer), attackPer) * unit.attack));
                $modal.find("#unitHeal").text(Math.floor(Math.pow(Math.pow(lv, categoryPer), healPer) * unit.heal));
            });
            slider.slider('setValue', unit.lvMax, false, true);
            $modal.find("img[data-id]").click(Unit.onEvolveUnitIconClick);
        });
        $modal.on('hide.bs.modal', function (e) {
            app_router.navigate("unit");
        });
        $modal.on('hidden.bs.modal', function () {
            console.log("hidden");
            $(this).remove();
        });
        $modal.modal('show');
    },
    formatStory: function (story) {
        return story.replace(/\\n/g, "<br/>").replace(/\[-\]/g, "</span>").replace(/\[([A-Za-z0-9]{6})\]/g, "<span style='color:#$1'>")
    },
    formatRichText: function (richText) {
        return richText.replace(/\\n/g, "<br/>").replace(/\[-\]/g, "</span>").replace(/\[([A-Za-z0-9]{6})\]/g, "<span style='color:#$1'>")
    },
    convertRarityToStar: function (rarity) {
        return "★".repeat(rarity);
    }
};

function initRouter() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            "unit": "unitRoute",
            "unit/id/:id": "unitDetailRoute",
            "unit/gid/:gid": "unitDetailByGIdRoute",
            "unit/search": "unitSearchRoute",
            '*path': 'defaultRoute'
        },
        defaultRoute: function () {
            app_router.navigate("unit", { trigger: true });
        }
    });
    // Initiate the router
    app_router = new AppRouter;

    app_router.on('route:unitRoute', function (actions) {
        Unit.doPage();
    });
    app_router.on('route:unitDetailRoute', function (id) {
        var unit = _.find(UnitList, function (o) {
            return o.id == id;
        });
        if (!unit) {
            Unit.doPage();
        }
        else {
            Unit.doPage(Math.ceil(unit.gId / 100));
            Unit.showDetail(unit);
        }
    });
    app_router.on('route:unitDetailByGIdRoute', function (gid) {
        var unit = _.find(UnitList, function (o) {
            return o.gId == gid;
        });
        if (!unit) {
            Unit.doPage();
        }
        else {
            Unit.doPage(Math.ceil(unit.gId / 100));
            Unit.showDetail(unit);
        }
    });

    Backbone.history.start();
}

$(function () {
    Unit.init(initRouter);
});