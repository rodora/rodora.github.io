var Data = {};
var app_router;
var activeMenu = "";
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
    init: function (type) {
        var dtd = $.Deferred();
        if (!type) {
            dtd.reject();
            return dtd.promise();
        }
        type = type.toLowerCase();
        var self = this;
        return self.isDataTooOld().then(function (force) {
            var json = localStorage.getItem(type);
            if (json && !force) {
                var data = JSON.parse(json);
                console.log("Get data from cache. ", type);
                Data[type] = data;
                dtd.resolve();
                return dtd.promise();
            }
            else {
                return $.ajax({
                    url: '/data/' + type + '.json',
                    cache: false,
                    dataType: "json"
                })
                    .done(function (data) {
                        localStorage[type] = JSON.stringify(data);
                        console.log("Get data from web. ", type);
                        Data[type] = data;
                    });
            }
        });
    },

    isDataTooOld: function () {
        var dtd = $.Deferred();
        var lastUpdate = localStorage.getItem("lastUpdate");
        if (!lastUpdate) {
            dtd.resolve();
            return dtd.promise(false);
        }
        return $.ajax({
            url: '/data/lastUpdate.json',
            cache: false,
            dataType: "json"
        }).then(function (data) {
            var local = JSON.parse(lastUpdate);
            var remote = data;
            return new Date(local).getTime() < new Date(remote).getTime();
        });
    },
    setActiveMenu: function (mode) {
        activeMenu = mode;
        $("nav.navbar .active").removeClass('active');
        $("#unitList").hide();
        $("#unitSearch").hide();
        switch (mode.toLowerCase()) {
            case "unitlist":
                {
                    $('#unitMenu').addClass('active');
                    $('#unitListMenuItem').addClass('active');
                    $("#unitList").show();
                    break;
                }
            case "unitsearch": {
                $('#unitMenu').addClass('active');
                $('#unitSearchMenuItem').addClass('active');
                $("#unitSearch").show();
                break;
            }
        }
    },
    doPage: function (mode) {
        console.log("doPage");
        this.setActiveMenu("unitList");
        var page = 1;
        if (localStorage["page"]) {
            page = JSON.parse(localStorage["page"]);
        }
        var maxUnit = _.max(Data.unit, function (o) { return parseInt(o.gId); });
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
        var unitpagelist = _.chain(Data.unit)
            .filter(function (o) {
                var i = parseInt(o.gId);
                return (i <= page * 100) && (i > (page - 1) * 100);
            })
            .sortBy(function (o) { return o.gId; })
            .value();
        this.renderIconList('#iconContainer', unitpagelist);
    },
    renderIconList: function (target, data) {
        console.log("renderIconList");
        var self = this;
        $(target).empty();
        $.each(data, function (i, o) {
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
            img.tooltip({
                html: true,
                placement: "top",
                title: "No." + o.gId + "<br/>" + o.name
            });
            var li = $("<li>");
            li.append(img);
            $(target).append(li);
        });
        $(target).find("img").unveil();
    },
    doSearch: function (conditionJson) {
        console.log("doSearch", conditionJson);
        this.setActiveMenu("unitsearch");
        if (!conditionJson) {
            return;
        }
        if (conditionJson == "reset") {
            $('#unitSearch #chkItemLimit').prop("checked", true);
            $('#unitSearch #txtSearch').val("");
            $("#unitSearch label.btn input").each(function (i, o) {
                if (i == 0) {
                    $(o).prop('checked', true);
                    $(o).parent().addClass('active');
                }
                else {
                    $(o).prop('checked', false);
                    $(o).parent().removeClass('active');
                }
            });
            $("#unitSearch .selectpicker").each(function (i, o) {
                $(o).selectpicker('val', "");
            });
            app_router.navigate("unit/search/", { trigger: true });
            return;
        }
        try {
            var condition = JSON.parse(Base64.decode(conditionJson));
            console.log(condition);
            //set control
            $('#unitSearch #chkItemLimit').prop("checked", condition.maxItem ? true : false);
            $('#unitSearch #txtSearch').val(condition.text);
            $("#unitSearch label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range[i]);
                condition.range[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch .selectpicker").each(function (i, o) {
                $(o).selectpicker('val', condition.select[i]);
            });
            //do real search            
            var result = _.chain(Data.unit)
                .filter(function (o) {
                    var conditions = [
                        condition.select[0] ? o.category == condition.select[0] : true,
                        condition.select[1] ? o.style == condition.select[1] : true,
                        condition.select[2] ? o.attribute == condition.select[2] : true,
                        condition.select[3] ? o.subAttribute == condition.select[3] : true,
                    ];
                    return _.every(conditions, function (o) { return o; });
                })
                .filter(function (o) {
                    var conditions = [
                        condition.range[0] ? o.name.indexOf(condition.text) > -1 : false,
                        condition.range[1] ? o.story.indexOf(condition.text) > -1 : false,
                        condition.range[2] ? _.any(o.cutin, function (ci) { return ci.indexOf(condition.text) > -1; }) : false,

                        condition.range[3] ? o.name.indexOf(condition.text) > -1 : false,
                        condition.range[4] ? o.name.indexOf(condition.text) > -1 : false,
                        condition.range[5] ? o.name.indexOf(condition.text) > -1 : false,
                        condition.range[6] ? o.name.indexOf(condition.text) > -1 : false,

                        condition.range[7] ? o.name.indexOf(condition.text) > -1 : false,
                        condition.range[8] ? o.name.indexOf(condition.text) > -1 : false,
                        condition.range[9] ? o.name.indexOf(condition.text) > -1 : false,
                        condition.range[10] ? o.name.indexOf(condition.text) > -1 : false,
                    ];
                    return _.any(conditions, function (o) { return o; });
                })
                .sortBy(function (o) { return o.gId; });

            $('#searchResultCount').text("Count:" + result.size());
            Unit.renderIconList('#searchResultContainer', result.filter(function (o, i) { return condition.maxItem ? i < condition.maxItem : true; }).value());
        } catch (error) {
            console.log("search error", error);
            app_router.navigate("unit/search/", { trigger: true });
            return;
        }
    },
    onSearchClick: function (event) {
        console.log("onSearchClick");
        var condition = {
            maxItem: $('#unitSearch #chkItemLimit')[0].checked ? 100 : 0,
            text: $('#unitSearch #txtSearch').val(),
            range: _.map($("#unitSearch label.btn input"), function (o) { return o.checked }),
            select: _.map($("#unitSearch .selectpicker"), function (o) { return $(o).selectpicker('val') }),
        };
        var json = Base64.encodeURI(JSON.stringify(condition));
        console.log(json);
        app_router.navigate("unit/search/" + json, { trigger: true });
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
            $modal.find("img").error(function () {
                $(this).unbind("error").attr("src", $(this).attr("data-src"));
            });
        });
        $modal.on('shown.bs.modal', function (e) {
            console.log("shown");
            var slider = $modal.find('#unitLevel').slider({
                orientation: "vertical",
                min: 1,
                max: unit.lvMax,
                value: unit.lvMax,
                step: 1,
                tooltip: 'always',
                tooltip_position: 'left',
                reversed: true,
                formatter: function (value) {
                    return 'Lv ' + value;
                }
            });
            var onSliderChange = function (e) {
                var categoryPer = UnitParam.CategoryPer[unit.category - 1];
                var num = (unit.style - 1) * 3;
                var lifePer = UnitParam.StylePer[num];
                var attackPer = UnitParam.StylePer[num + 1];
                var healPer = UnitParam.StylePer[num + 2];
                var lv = e ? e.value.newValue : unit.lvMax;
                $modal.find("#unitLife").text(Math.floor(Math.pow(Math.pow(lv, categoryPer), lifePer) * unit.life));
                $modal.find("#unitAttack").text(Math.floor(Math.pow(Math.pow(lv, categoryPer), attackPer) * unit.attack));
                $modal.find("#unitHeal").text(Math.floor(Math.pow(Math.pow(lv, categoryPer), healPer) * unit.heal));
                $modal.find("#unitPt").text(Math.floor((lv - 1) * Math.pow(unit.setPt, 0.5) + unit.setPt));
                var minExp = Math.floor(Math.pow(lv - 1, UnitParam.NextExpPer[unit.category - 1]) * unit.grow);
                var maxExp = Math.floor(Math.pow(lv, UnitParam.NextExpPer[unit.category - 1]) * unit.grow);
                if (lv == unit.lvMax) {
                    $modal.find("#unitExp").text(minExp);
                }
                else {
                    $modal.find("#unitExp").text(minExp + "~" + (maxExp - 1));
                }
                var skill = {
                    party: unit.partySkill ? _.find(Data.skill.party, function (o) { return o.id == unit.partySkill[Math.floor(lv / 10)]; }) : null,
                    active: unit.activeSkill ? _.find(Data.skill.active, function (o) { return o.id == unit.activeSkill[Math.floor(lv / 10)]; }) : null,
                    panel: unit.panelSkill ? _.find(Data.skill.panel, function (o) { return o.id == unit.panelSkill[Math.floor(lv / 10)]; }) : null,
                    limit: unit.limitSkill ? _.find(Data.skill.limit, function (o) { return o.id == unit.limitSkill[Math.floor(lv / 10)]; }) : null
                };
                if (skill.limit) {
                    skill.limit.active = [
                        _.find(Data.skill.active, function (o) { return o.id == skill.limit.skill_id_00; }),
                        _.find(Data.skill.active, function (o) { return o.id == skill.limit.skill_id_01; }),
                        _.find(Data.skill.active, function (o) { return o.id == skill.limit.skill_id_02; })
                    ];
                }
                console.log(skill);
                var skilltemplate = _.template($("#unitSkillTemplate").html());
                $('#unitSkillListGroup').html(skilltemplate(skill));
            };
            onSliderChange();   //init
            slider.change(onSliderChange);
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
        return this.formatRichText(story);
    },
    formatRichText: function (richText) {
        return richText.replace(/(?:\r\n|\r|\n|\\n)/g, "<br/>").replace(/\[-\]/g, "</span>").replace(/\[([A-Za-z0-9]{6})\]/g, "<span style='color:#$1'>");
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
            "unit/search/*condition": "unitSearchRoute",
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
        Unit.doPage();
    });
    app_router.on('route:unitDetailRoute', function (id) {
        var unit = _.find(Data.unit, function (o) {
            return o.id == id;
        });
        if (!unit) {
            Unit.doPage();
        }
        else {
            if (!activeMenu) { Unit.doPage(Math.ceil(unit.gId / 100)); }
            Unit.showDetail(unit);
        }
    });
    app_router.on('route:unitDetailByGIdRoute', function (gid) {
        var unit = _.find(Data.unit, function (o) {
            return o.gId == gid;
        });
        if (!unit) {
            Unit.doPage();
        }
        else {
            if (!activeMenu) { Unit.doPage(Math.ceil(unit.gId / 100)); }
            Unit.showDetail(unit);
        }
    });
    app_router.on('route:unitSearchRoute', function (condition) {
        Unit.doSearch(condition);
    });

    Backbone.history.start();
}

function initControls() {
    $('#btnSearch').click(Unit.onSearchClick);
    $('#btnClearSearch').click(function () {
        app_router.navigate("unit/search/reset", { trigger: true });
    });

}

$(function () {
    $.when(Unit.init("unit"), Unit.init("skill")).done(function () {
        console.log("all data inited");
        localStorage.setItem("lastUpdate", JSON.stringify(new Date()))
        initRouter();
        initControls();
    });
});