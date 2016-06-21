define(['jquery','underscore','backbone','unit','ui','nouislider','LZString','text!/template/unitModal.html','text!/template/unitSkill.html', 'bootstrap', 'bootstrap-select'], function ($,_,Backbone,Unit,Ui,noUiSlider,LZString,unitModalTemplate,unitSkillTemplate) {
    var app_router;
    var activeMenu = "";
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
            doPage();
        });
        app_router.on('route:unitDetailRoute', function (id) {
            var unit = _.find(Unit.data.unit, function (o) {
                return o.id == id;
            });
            if (!unit) {
                doPage();
            }
            else {
                if (!activeMenu) {
                    doPage(Math.ceil(unit.gId / 100));
                }
                showDetail(unit);
            }
        });
        app_router.on('route:unitDetailByGIdRoute', function (gid) {
            var unit = _.find(Unit.data.unit, function (o) {
                return o.gId == gid;
            });
            if (!unit) {
                doPage();
            }
            else {
                if (!activeMenu) {
                    doPage(Math.ceil(unit.gId / 100));
                }
                showDetail(unit);
            }
        });
        app_router.on('route:unitSearchRoute', function (condition) {
            doSearch(condition);
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
    function initControls() {
        $('#btnSearch').click(onSearchClick);
        $('#btnClearSearch').click(function () {
            app_router.navigate("unit/search/reset", { trigger: true });
        });
        $('#btnPageFirst').click(function(){doPage("<<<");});
        $('#btnPagePrev').click(function(){doPage("<");});
        $('#btnPageNext').click(function(){doPage(">");});
        $('#btnPageLast').click(function(){doPage(">>>");});
    }

    function initUiLanguage() {
        $('[data-lang]').each(function () {
            var $this = $(this);
            var key = $this.data("lang");
            var value = Ui.getText(key);
            $this.text(value);
        });
    }
    var setActiveMenu = function (mode) {
        activeMenu = mode;
        $("nav.navbar .active").removeClass('active');
        $("body>div[data-tab]").hide();
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
    };
    var doPage = function (mode) {
        console.log("doPage");
        setActiveMenu("unitList");
        var page = 1;
        if (localStorage["page"]) {
            page = JSON.parse(localStorage["page"]);
        }
        var maxUnit = _.max(Unit.data.unit, function (o) {
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
        var unitpagelist = _.chain(Unit.data.unit)
            .filter(function (o) {
                var i = parseInt(o.gId);
                return (i <= page * 100) && (i > (page - 1) * 100);
            })
            .sortBy(function (o) {
                return o.gId;
            })
            .value();
        renderIconList('#iconContainer', unitpagelist);
    };
    var renderIconList = function (target, data) {
        console.log("renderIconList");
        $(target).find("img").attr('src', '');   //stop image loading when doPage
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
            img.click(onUnitIconClick);
            img.tooltip({
                container:"body",
                html: true,
                placement: "top",
                title: "No." + o.gId + "<br/>" + (o.lang ? o.lang.name : o.name)
            });
            var no = $("<div>").text("No." + o.gId).addClass("icon-no");
            var li = $("<li>");
            li.append(no);
            li.append(img);
            $(target).addClass("icon-list").append(li);
        });
        setTimeout(function () {
            //a little delay to unveil for better unveil effect
            $(target).find("img").unveil();
        }, 100);
    };
    var doSearch = function (conditionJson) {
        console.log("doSearch", conditionJson);
        setActiveMenu("unitsearch");
        if (!conditionJson) {
            //init selectpicker
            $("#unitSearch .selectpicker").each(function (i, o) {
                $(o).selectpicker();
            });
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
            var result = _.chain(Unit.data.unit)
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
                    var skill = Unit.getSkillByLevel(o);
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
            renderIconList('#searchResultContainer', result.filter(function (o, i) {
                return condition.maxItem ? i < condition.maxItem : true;
            }).value());
        } catch (error) {
            console.log("search error", error);
            app_router.navigate("unit/search/", { trigger: true });
            return;
        }
    };
    var onSearchClick = function (event) {
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
        app_router.navigate("unit/search/" + json, { trigger: true });
    };
    var onUnitIconClick = function (event) {
        console.log("onUnitIconClick");
        var id = $(event.target).data('id');
        app_router.navigate("unit/id/" + id, { trigger: true });
    };
    var onEvolveUnitIconClick = function (event) {
        console.log("onEvolveUnitIconClick");
        var $oldmodal = $(event.target).parents(".modal.in");
        $oldmodal.on('hidden.bs.modal', function () {
            var id = $(event.target).data('id');
            app_router.navigate("unit/id/" + id, { trigger: true });
        });
        $oldmodal.modal("hide");
    };
    var showDetail = function (unit) {
        var template = _.template(unitModalTemplate);
        var $modal = $(template(Unit.getUnitForTemplate(unit)));
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
                var lv = Math.round(e[0]);
                var current=Unit.getStatusByLevel(unit,lv);
                $modal.find("#unitLife").text(current.life);
                $modal.find("#unitAttack").text(current.attack);
                $modal.find("#unitHeal").text(current.heal);
                $modal.find("#unitPt").text(current.pt);
                if (lv == unit.lvMax) {
                    $modal.find("#unitExp").text(current.minExp);
                }
                else {
                    $modal.find("#unitExp").text(current.minExp + "~" + (current.maxExp - 1));
                }
                var skill = Unit.getSkillByLevel(unit, lv);
                var skilltemplate = _.template(unitSkillTemplate);
                $('#unitSkillPanel').replaceWith(skilltemplate(Unit.getSkillForTemplate(skill)));
                initUiLanguage();
            };
            slider.noUiSlider.on('update', onSliderChange);
            $modal.find("img[data-id]").click(onEvolveUnitIconClick);
            if (Unit.getLang() == 'ja-JP') {
                $('[data-toggle="tooltip"]').removeAttr('title');
            }
            else {
                $('[data-toggle="tooltip"]').tooltip();
            }
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
    };
    return {
      router:app_router,
      activeMenu:activeMenu,
      initRouter:initRouter,
      initControls:initControls,
      initUiLanguage:initUiLanguage,  
      setActiveMenu:setActiveMenu,
      doPage:doPage,
        renderIconList:renderIconList,
        doSearch:doSearch,
        onSearchClick:onSearchClick,
        onUnitIconClick:onUnitIconClick,
        onEvolveUnitIconClick:onEvolveUnitIconClick,
        showDetail:showDetail
    };
});