define(['jquery', 'jquery.unveil'], function () {
    var data = {};
    var supportedLang = [
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
        }
    ];
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
    var getLang = function () {
        var lang = localStorage["unitlang"] || navigator.language || navigator.browserLanguage;
        if (_.any(supportedLang, function (o) {
            return o.key == lang
        }) == false) {
            lang = 'ja-JP';
        }
        localStorage["unitlang"] = lang;
        $('#currentDataLang').text(_.find(supportedLang, function (o) {
            return o.key == lang;
        }).text);
        return lang;
    };
    var setLang = function (lang) {
        var delKeys = [];
        for (var i = 0; i < localStorage.length; i++) {
            key = localStorage.key(i);
            if (_.any(supportedLang, function (o) {
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
        localStorage["unitlang"] = lang;
    };
    var init = function (type, lang) {
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
                var jsondata = JSON.parse(json);
                console.log("Get data from cache. ", key);
                if (lang) {
                    data[lang] = data[lang] || {};
                    data[lang][type] = jsondata;
                } else {
                    data[type] = jsondata;
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
                    .done(function (jsondata) {
                        localStorage[key] = JSON.stringify(jsondata);
                        console.log("Get data from web. ", key);
                        if (lang) {
                            data[lang] = data[lang] || {};
                            data[lang][type] = jsondata;
                        } else {
                            data[type] = jsondata;
                        }
                    });
            }
        });
    };
    var getUnitForTemplate = function (unit) {
        unit.star = convertRarityToStar(unit.category);
        unit.storyFormatted = formatStory(unit.lang ? unit.lang.story : unit.story);
        if (unit.accessory) {
            unit.accessory.detailFormatted = formatRichText(unit.accessory.detail);
            unit.accessory.detailFormattedLocal = formatRichText(unit.lang && unit.lang.accessory ? unit.lang.accessory.detail : unit.accessory.detail);
        }
        unit.revUnit = [];
        _.each(unit.revData, function (o, i) {
            var revUnit = _.find(data.unit, function (u) { return u.id == o; });
            if (!revUnit)
            { }
            else {
                revUnit.star = convertRarityToStar(revUnit.category);
            }
            unit.revUnit.push(revUnit);
        });
        return unit;
    };
    var getSkillForTemplate = function (skill) {
        with (skill) {
            if (party) {
                party.textFormatted = formatRichText(party.text);
                party.textFormattedLocal = formatRichText(party.lang ? party.lang.text : party.text);
            }
            if (active) {
                active.textFormatted = formatRichText(active.text);
                active.textFormattedLocal = formatRichText(active.lang ? active.lang.text : active.text);
            }
            if (panel) {
                panel.textFormatted = formatRichText(panel.text);
                panel.textFormattedLocal = formatRichText(panel.lang ? panel.lang.text : panel.text);
            }
            if (limit) {
                limit.textFormatted = formatRichText(limit.general_text);
                limit.textFormattedLocal = formatRichText(limit.lang ? limit.lang.general_text : limit.general_text);
                _.each(limit.active, function (active, i) {
                    active.textFormatted = formatRichText(active.text);
                    active.textFormattedLocal = formatRichText(active.lang ? active.lang.text : active.text);
                });
            }
        }
        return skill;
    };
    var formatStory = function (story) {
        return formatRichText(story);
    };
    var formatRichText = function (richText) {
        return richText.replace(/(?:\r\n|\r|\n|\\n)/g, "<br/>").replace(/\[-\]/g, "</span>").replace(/\[([A-Za-z0-9]{6})\]/g, "<span style='color:#$1'>");
    };
    var convertRarityToStar = function (rarity) {
        var star = "";
        for (var index = 0; index < rarity; index++) {
            star += "★";
        }
        return star;
        //return "★".repeat(rarity);    //repeat is ES6 function
    };
    var getStatusByLevel = function (unit, lv) {
        var categoryPer = UnitParam.CategoryPer[unit.category - 1];
        var num = (unit.style - 1) * 3;
        var lifePer = UnitParam.StylePer[num];
        var attackPer = UnitParam.StylePer[num + 1];
        var healPer = UnitParam.StylePer[num + 2];
        return {
            life: Math.floor(Math.pow(Math.pow(lv, categoryPer), lifePer) * unit.life),
            attack: Math.floor(Math.pow(Math.pow(lv, categoryPer), attackPer) * unit.attack),
            heal: Math.floor(Math.pow(Math.pow(lv, categoryPer), healPer) * unit.heal),
            pt: Math.floor((lv - 1) * Math.pow(unit.setPt, 0.5) + unit.setPt),
            minExp: Math.floor(Math.pow(lv - 1, UnitParam.NextExpPer[unit.category - 1]) * unit.grow),
            maxExp: Math.floor(Math.pow(lv, UnitParam.NextExpPer[unit.category - 1]) * unit.grow)
        };
    }
    return {
        supportedLang: supportedLang,
        data: data,
        getLang: getLang,
        setLang: setLang,
        init: init,
        getUnitForTemplate: getUnitForTemplate,
        getSkillForTemplate: getSkillForTemplate,
        applyLanguage: function (lang) {
            console.log("applyLanguage");
            _.each(data.unit, function (o) {
                var unitlang = _.find(data[lang].unit, function (l) {
                    return l.id == o.id;
                });
                o.lang = unitlang;
            });
            _.each(data.skill.party, function (o) {
                var unitlang = _.find(data[lang].skill.party, function (l) {
                    return l.id == o.id;
                });
                o.lang = unitlang;
            });
            _.each(data.skill.active, function (o) {
                var unitlang = _.find(data[lang].skill.active, function (l) {
                    return l.id == o.id;
                });
                o.lang = unitlang;
            });
            _.each(data.skill.panel, function (o) {
                var unitlang = _.find(data[lang].skill.panel, function (l) {
                    return l.id == o.id;
                });
                o.lang = unitlang;
            });
            _.each(data.skill.limit, function (o) {
                var unitlang = _.find(data[lang].skill.limit, function (l) {
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
        getStatusByLevel: getStatusByLevel,
        getSkillByLevel: function (unit, lv) {
            if (!lv) {
                lv = unit.lvMax;
            }
            var skill = {
                party: unit.partySkill ? _.find(data.skill.party, function (o) {
                    return o.id == unit.partySkill[Math.floor(lv / 10)];
                }) : null,
                active: unit.activeSkill ? _.find(data.skill.active, function (o) {
                    return o.id == unit.activeSkill[Math.floor(lv / 10)];
                }) : null,
                panel: unit.panelSkill ? _.find(data.skill.panel, function (o) {
                    return o.id == unit.panelSkill[Math.floor(lv / 10)];
                }) : null,
                limit: unit.limitSkill ? _.find(data.skill.limit, function (o) {
                    return o.id == unit.limitSkill[Math.floor(lv / 10)];
                }) : null
            };
            if (skill.limit) {
                skill.limit.active = [
                    _.find(data.skill.active, function (o) {
                        return o.id == skill.limit.skill_id_00;
                    }),
                    _.find(data.skill.active, function (o) {
                        return o.id == skill.limit.skill_id_01;
                    }),
                    _.find(data.skill.active, function (o) {
                        return o.id == skill.limit.skill_id_02;
                    })
                ];
            }
            return skill;
        },
    };
});