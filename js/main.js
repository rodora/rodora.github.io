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
    init: function (type, lang) {
        var dtd = $.Deferred();
        if (!type) {
            dtd.reject();
            return dtd.promise();
        }
        type = type.toLowerCase();
        var key = lang ? lang + "." + type : type;
        var self = this;
        return self.isDataTooOld(lang).then(function (force) {
            var json = localStorage.getItem(key);
            if (json && !force) {
                var data = JSON.parse(json);
                console.log("Get data from cache. ", key);
                if (lang) {
                    Data[lang] = Data[lang] || {};
                    Data[lang][type] = data;
                } else {
                    Data[type] = data;
                }
                dtd.resolve();
                return dtd.promise();
            }
            else {
                var url = lang ? '/data/lang/' + lang + '/' + type + '.json' : '/data/' + type + '.json'
                return $.ajax({
                    url: url,
                    cache: false,
                    dataType: "json"
                })
                    .done(function (data) {
                        localStorage[key] = JSON.stringify(data);
                        console.log("Get data from web. ", key);
                        if (lang) {
                            Data[lang] = Data[lang] || {};
                            Data[lang][type] = data;
                        } else {
                            Data[type] = data;
                        }
                    });
            }
        });
    },
    supportedLang: [
        {
            key: 'ja-JP',
            text: '日本語'
        },
        {
            key: 'zh-TW',
            text: '正體中文'
        },
        {
            key: 'en-US',
            text: 'English'
        },
        {
            key: 'zh-CN',
            text: '简体中文'
        }],
    getLang: function () {
        var lang = localStorage["datalang"] || navigator.language || navigator.browserLanguage;
        if (_.any(this.supportedLang, function (o) {
            return o.key == lang
        }) == false) {
            lang = 'ja-JP';
        }
        localStorage["datalang"] = lang;
        $('#currentDataLang').text(_.find(this.supportedLang, function (o) {
            return o.key == lang;
        }).text);
        return lang;
    },
    setLang: function (lang) {
        var delKeys = [];
        for (var i = 0; i < localStorage.length; i++) {
            key = localStorage.key(i);
            if (_.any(Unit.supportedLang, function (o) {
                return key.startsWith(o);
            })) {
                delKeys.push(key);
                console.log(key);
            }
        }
        if (delKeys.length > 4) {
            _.each(delKeys, function (key) {
                localStorage.removeItem(key);
            });
        }
        localStorage["datalang"] = lang;
    },
    applyLanguage: function (lang) {
        console.log("applyLanguage");
        _.each(Data.unit, function (o) {
            var unitlang = _.find(Data[lang].unit, function (l) {
                return l.id == o.id;
            });
            o.lang = unitlang;
        });
        _.each(Data.skill.party, function (o) {
            var unitlang = _.find(Data[lang].skill.party, function (l) {
                return l.id == o.id;
            });
            o.lang = unitlang;
        });
        _.each(Data.skill.active, function (o) {
            var unitlang = _.find(Data[lang].skill.active, function (l) {
                return l.id == o.id;
            });
            o.lang = unitlang;
        });
        _.each(Data.skill.panel, function (o) {
            var unitlang = _.find(Data[lang].skill.panel, function (l) {
                return l.id == o.id;
            });
            o.lang = unitlang;
        });
        _.each(Data.skill.limit, function (o) {
            var unitlang = _.find(Data[lang].skill.limit, function (l) {
                return l.id == o.id;
            });
            o.lang = unitlang;
        });
    },
    isDataTooOld: function (lang) {
        var dtd = $.Deferred();
        var key = lang ? "lastUpdate." + lang : "lastUpdate";
        var lastUpdate = localStorage.getItem(key);
        if (!lastUpdate) {
            dtd.resolve(true);
            return dtd.promise();
        }
        var url = lang ? '/data/lang/' + lang + '/lastUpdate.json' : '/data/lastUpdate.json'
        return $.ajax({
            url: url,
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
        $("body>div").hide();
        switch (mode.toLowerCase()) {
            case "unitlist":
                {
                    $('#unitListMenuItem').addClass('active');
                    $("#unitList").show();
                    break;
                }
            case "unitsearch":
                {
                    $('#unitSearchMenuItem').addClass('active');
                    $("#unitSearch").show();
                    break;
                }
            case "unitcategory":
                {
                    $('#unitCategoryMenuItem').addClass('active');
                    $("#unitCategory").show();
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
        var maxUnit = _.max(Data.unit, function (o) {
            return parseInt(o.gId);
        });
        var maxPage = Math.ceil(parseInt(maxUnit.gId) / 100);
        switch (mode) {
            case "<<<":
                page = 1;
                break;
            case "<":
                page -= 1;
                break;
            case ">":
                page += 1;
                break;
            case ">>>":
                page = maxPage;
                break;
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
            .sortBy(function (o) {
                return o.gId;
            })
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
                title: "No." + o.gId + "<br/>" + (o.lang ? o.lang.name : o.name)
            });
            var li = $("<li>");
            li.append(img);
            $(target).append(li);
        });
        setTimeout(function () {
            //a little delay to unveil for better unveil effect
            $(target).find("img").unveil();
        }, 100);
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
            var condition = JSON.parse(LZString.decompressFromEncodedURIComponent(conditionJson));
            console.log(condition);
            //set control
            $('#unitSearch #chkItemLimit').prop("checked", condition.maxItem ? true : false);
            $('#unitSearch #txtSearch').val(condition.text);
            $("#unitSearch #searchRangeLanguage label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range.language[i]);
                condition.range.language[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch #searchRangeGeneral label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range.general[i]);
                condition.range.general[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch #searchRangeAccessory label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range.accessory[i]);
                condition.range.accessory[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch #searchRangeSkillParty label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range.skill.party[i]);
                condition.range.skill.party[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch #searchRangeSkillActive label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range.skill.active[i]);
                condition.range.skill.active[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch #searchRangeSkillPanel label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range.skill.panel[i]);
                condition.range.skill.panel[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch #searchRangeSkillLimit label.btn input").each(function (i, o) {
                $(o).prop('checked', condition.range.skill.limit[i]);
                condition.range.skill.limit[i] ?
                    $(o).parent().addClass('active') :
                    $(o).parent().removeClass('active');
            });
            $("#unitSearch .selectpicker").each(function (i, o) {
                $(o).selectpicker('val', condition.select[i]);
            });
            //do real search            
            var result = _.chain(Data.unit)
                .filter(function (o) {
                    var isInType = [
                        condition.select[0] ? o.category == condition.select[0] : true,
                        condition.select[1] ? o.style == condition.select[1] : true,
                        condition.select[2] ? o.attribute == condition.select[2] : true,
                        condition.select[3] ? o.subAttribute == condition.select[3] : true,
                    ];
                    return _.every(isInType, function (o) {
                        return o;
                    });
                })
                .filter(function (o) {
                    var hasText = [];
                    var skill = Unit.getSkillByUnit(o);
                    if (condition.range.language[0]) {
                        hasText = hasText.concat([
                            condition.range.general[0] ? o.name.indexOf(condition.text) > -1 : false,
                            condition.range.general[1] ? o.story.indexOf(condition.text) > -1 : false,
                            condition.range.general[2] ? _.any(o.cutin, function (ci) {
                                return ci.indexOf(condition.text) > -1;
                            }) : false,
                        ]);
                        if (o.accessory) {
                            hasText = hasText.concat([
                                condition.range.accessory[0] ? o.accessory.name.indexOf(condition.text) > -1 : false,
                                condition.range.accessory[1] ? o.accessory.detail.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.party) {
                            hasText = hasText.concat([
                                condition.range.skill.party[0] ? skill.party.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.party[1] ? skill.party.text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.active) {
                            hasText = hasText.concat([
                                condition.range.skill.active[0] ? skill.active.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.active[1] ? skill.active.text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.panel) {
                            hasText = hasText.concat([
                                condition.range.skill.panel[0] ? skill.panel.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.panel[1] ? skill.panel.text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.limit) {
                            hasText = hasText.concat([
                                condition.range.skill.limit[0] ? skill.limit.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.limit[1] ? skill.limit.general_text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                    }
                    if (condition.range.language[1] && o.lang) {
                        hasText = hasText.concat([
                            condition.range.general[0] ? o.lang.name.indexOf(condition.text) > -1 : false,
                            condition.range.general[1] ? o.lang.story.indexOf(condition.text) > -1 : false,
                            condition.range.general[2] ? _.any(o.lang.cutin, function (ci) {
                                return ci.indexOf(condition.text) > -1;
                            }) : false,
                        ]);
                        if (o.lang.accessory) {
                            hasText = hasText.concat([
                                condition.range.accessory[0] ? o.lang.accessory.name.indexOf(condition.text) > -1 : false,
                                condition.range.accessory[1] ? o.lang.accessory.detail.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.party && skill.party.lang) {
                            hasText = hasText.concat([
                                condition.range.skill.party[0] ? skill.party.lang.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.party[1] ? skill.party.lang.text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.active && skill.active.lang) {
                            hasText = hasText.concat([
                                condition.range.skill.active[0] ? skill.active.lang.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.active[1] ? skill.active.lang.text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.panel && skill.panel.lang) {
                            hasText = hasText.concat([
                                condition.range.skill.panel[0] ? skill.panel.lang.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.panel[1] ? skill.panel.lang.text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                        if (skill.limit && skill.limit.lang) {
                            hasText = hasText.concat([
                                condition.range.skill.limit[0] ? skill.limit.lang.name.indexOf(condition.text) > -1 : false,
                                condition.range.skill.limit[1] ? skill.limit.lang.general_text.indexOf(condition.text) > -1 : false,
                            ]);
                        }
                    }
                    return _.any(hasText, function (o) {
                        return o;
                    });
                })
                .sortBy(function (o) {
                    return o.gId;
                });
            $('#searchResultCount').text("Count:" + result.size().value());
            Unit.renderIconList('#searchResultContainer', result.filter(function (o, i) {
                return condition.maxItem ? i < condition.maxItem : true;
            }).value());
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
            range: {
                language: _.map($("#unitSearch #searchRangeLanguage label.btn input"), function (o) {
                    return o.checked
                }),
                general: _.map($("#unitSearch #searchRangeGeneral label.btn input"), function (o) {
                    return o.checked
                }),
                accessory: _.map($("#unitSearch #searchRangeAccessory label.btn input"), function (o) {
                    return o.checked
                }),
                skill: {
                    party: _.map($("#unitSearch #searchRangeSkillParty label.btn input"), function (o) {
                        return o.checked
                    }),
                    active: _.map($("#unitSearch #searchRangeSkillActive label.btn input"), function (o) {
                        return o.checked
                    }),
                    panel: _.map($("#unitSearch #searchRangeSkillPanel label.btn input"), function (o) {
                        return o.checked
                    }),
                    limit: _.map($("#unitSearch #searchRangeSkillLimit label.btn input"), function (o) {
                        return o.checked
                    }),
                }
            },
            select: _.map($("#unitSearch .selectpicker"), function (o) {
                return $(o).selectpicker('val')
            }),
        };
        var json = LZString.compressToEncodedURIComponent(JSON.stringify(condition));
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
            var slider = $modal.find('#unitLevel')[0];
            noUiSlider.create(slider, {
                animate: true,
                animationDuration: 300,
                start: unit.lvMax,
                step: 1,
                connect: 'lower',
                direction: 'rtl',
                orientation: 'vertical',
                range: {
                    'min': 1,
                    'max': unit.lvMax == 1 ? 1.0001 : unit.lvMax
                },
                pips: {
                    mode: 'values',
                    values: [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99],
                    density: 3,
                    stepped: true
                },
                tooltips: {
                    to: function (value) {
                        return 'Lv&nbsp;' + Math.round(value);
                    },
                    from: function (value) {
                        return value.replace('Lv&nbsp;', '');
                    }
                }
            });
            var onSliderChange = function (e) {
                var categoryPer = UnitParam.CategoryPer[unit.category - 1];
                var num = (unit.style - 1) * 3;
                var lifePer = UnitParam.StylePer[num];
                var attackPer = UnitParam.StylePer[num + 1];
                var healPer = UnitParam.StylePer[num + 2];
                var lv = Math.round(e[0]);
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
                var skill = Unit.getSkillByUnit(unit, lv);
                var skilltemplate = _.template($("#unitSkillTemplate").html());
                $('#unitSkillListGroup').html(skilltemplate(skill));
                initUiLanguage();
            };
            slider.noUiSlider.on('update', onSliderChange);
            $modal.find("img[data-id]").click(Unit.onEvolveUnitIconClick);
            $('[data-toggle="tooltip"]').tooltip();
            initUiLanguage();
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
    getSkillByUnit: function (unit, lv) {
        if (!lv) {
            lv = unit.lvMax;
        }
        var skill = {
            party: unit.partySkill ? _.find(Data.skill.party, function (o) {
                return o.id == unit.partySkill[Math.floor(lv / 10)];
            }) : null,
            active: unit.activeSkill ? _.find(Data.skill.active, function (o) {
                return o.id == unit.activeSkill[Math.floor(lv / 10)];
            }) : null,
            panel: unit.panelSkill ? _.find(Data.skill.panel, function (o) {
                return o.id == unit.panelSkill[Math.floor(lv / 10)];
            }) : null,
            limit: unit.limitSkill ? _.find(Data.skill.limit, function (o) {
                return o.id == unit.limitSkill[Math.floor(lv / 10)];
            }) : null
        };
        if (skill.limit) {
            skill.limit.active = [
                _.find(Data.skill.active, function (o) {
                    return o.id == skill.limit.skill_id_00;
                }),
                _.find(Data.skill.active, function (o) {
                    return o.id == skill.limit.skill_id_01;
                }),
                _.find(Data.skill.active, function (o) {
                    return o.id == skill.limit.skill_id_02;
                })
            ];
        }
        return skill;
    },
    formatStory: function (story) {
        return this.formatRichText(story);
    },
    formatRichText: function (richText) {
        return richText.replace(/(?:\r\n|\r|\n|\\n)/g, "<br/>").replace(/\[-\]/g, "</span>").replace(/\[([A-Za-z0-9]{6})\]/g, "<span style='color:#$1'>");
    },
    convertRarityToStar: function (rarity) {
        var star = "";
        for (var index = 0; index < rarity; index++) {
            star += "★";
        }
        return star;
        //return "★".repeat(rarity);    //repeat is ES6 function
    }
};

function initRouter() {
    var AppRouter = Backbone.Router.extend({
        routes: {
            "unit": "unitRoute",
            "unit/id/:id": "unitDetailRoute",
            "unit/gid/:gid": "unitDetailByGIdRoute",
            "unit/search/*condition": "unitSearchRoute",
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
            if (!activeMenu) {
                Unit.doPage(Math.ceil(unit.gId / 100));
            }
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
            if (!activeMenu) {
                Unit.doPage(Math.ceil(unit.gId / 100));
            }
            Unit.showDetail(unit);
        }
    });
    app_router.on('route:unitSearchRoute', function (condition) {
        Unit.doSearch(condition);
    });
    app_router.on('route:languageChangeRoute', function (lang) {
        Lang.set(lang);
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

function initControls() {
    $('#btnSearch').click(Unit.onSearchClick);
    $('#btnClearSearch').click(function () {
        app_router.navigate("unit/search/reset", { trigger: true });
    });
}

function initUiLanguage() {
    $('[data-lang]').each(function () {
        var $this = $(this);
        var key = $this.data("lang");
        var value = Lang[key][Lang.get()] || Lang[key]["en-US"];
        $this.text(value);
    });
}

$(function () {
    NProgress.start();
    NProgress.inc();
    initUiLanguage();
    $.when(Unit.init("unit"), Unit.init("skill"))
        .then(function () {
            console.log("base data inited");
            NProgress.set(0.5);
            localStorage.setItem("lastUpdate", JSON.stringify(new Date()))
            var lang = Unit.getLang();
            $.when(Unit.init("unit", lang), Unit.init("skill", lang)).done(function () {
                console.log("lang data inited");
                NProgress.set(0.9);
                localStorage.setItem("lastUpdate." + lang, JSON.stringify(new Date()))
                Unit.applyLanguage(lang);
                NProgress.inc();
                initRouter();
                NProgress.inc();
                initControls();
                NProgress.done();
            });
        });
});