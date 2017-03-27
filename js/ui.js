define(['jquery', 'underscore'], function ($, _) {
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
    var currentLang = '';
    var data = [];
    //navbar
    data["list"] = { "ja-JP": "図鑑", "zh-TW": "圖鑑", "en-US": "Encyclopedia", "zh-CN": "图鉴" };
    data["search"] = { "ja-JP": "検索", "zh-TW": "搜索", "en-US": "Search", "zh-CN": "搜索" };
    data["category"] = { "ja-JP": "", "zh-TW": "分類", "en-US": "Category", "zh-CN": "分类" };
    data["about"] = { "ja-JP": "", "zh-TW": "關於", "en-US": "About", "zh-CN": "关于" };
    data["info"] = { "ja-JP": "お知らせ", "zh-TW": "通知", "en-US": "Notices", "zh-CN": "游戏公告" };
    data["ui"] = { "ja-JP": "", "zh-TW": "界面語言", "en-US": "UI", "zh-CN": "界面语言" };
    data["data"] = { "ja-JP": "", "zh-TW": "資料語言", "en-US": "Data", "zh-CN": "数据语言" };
    data["helptranslation"] = { "ja-JP": " ", "zh-TW": "協助翻譯", "en-US": "Help Translation", "zh-CN": "协助翻译" };
    //unit detail
    data["life"] = { "ja-JP": "HP", "zh-TW": "HP", "en-US": "HP", "zh-CN": "HP" };
    data["attack"] = { "ja-JP": "攻撃力", "zh-TW": "攻擊力", "en-US": "ATK", "zh-CN": "攻击力" };
    data["heal"] = { "ja-JP": "回復", "zh-TW": "回復力", "en-US": "REC", "zh-CN": "回复" };
    data["pt"] = { "ja-JP": "進化pt", "zh-TW": "進化點數", "en-US": "EV Pts", "zh-CN": "进化pt" };
    data["exp"] = { "ja-JP": "経験値", "zh-TW": "經驗值", "en-US": "EXP", "zh-CN": "经验值" };
    data["evolve"] = { "ja-JP": "進化", "zh-TW": "進化", "en-US": "Evolve", "zh-CN": "进化" };
    data["evolvept"] = { "ja-JP": "必要進化pt", "zh-TW": "必須進化點數", "en-US": "Evolve", "zh-CN": "进化所需pt" };
    data["awakening"] = { "ja-JP": "覚醒pt", "zh-TW": "覺醒點數", "en-US": "Awakening", "zh-CN": "觉醒pt" };
    data["skill"] = { "ja-JP": "スキル", "zh-TW": "技能", "en-US": "Skill", "zh-CN": "技能" };
    data["party"] = { "ja-JP": "パーティスキル", "zh-TW": "隊伍技能", "en-US": "Party Skill", "zh-CN": "被动技能" };
    data["active"] = { "ja-JP": "アクティブスキル", "zh-TW": "主動技能", "en-US": "Active Skill", "zh-CN": "主动技能" };
    data["panel"] = { "ja-JP": "パネルスキル", "zh-TW": "方塊技能", "en-US": "Panel Skill", "zh-CN": "光板技能" };
    data["limit"] = { "ja-JP": "リミットスキル", "zh-TW": "極限技能", "en-US": "Limit Skill", "zh-CN": "Limit技能" };
    data["soul"] = { "ja-JP": "消費ソウル", "zh-TW": "消耗魂", "en-US": "Souls", "zh-CN": "消耗魂" };
    data["story"] = { "ja-JP": "ストーリー", "zh-TW": "故事", "en-US": "Story", "zh-CN": "故事" };
    data["cutin"] = { "ja-JP": "カットイン台詞", "zh-TW": "切入台詞", "en-US": "Special Move Lines", "zh-CN": "特写台词" };
    data["accessory"] = { "ja-JP": "アクセサリー", "zh-TW": "飾品", "en-US": "Accessory", "zh-CN": "饰品" };
    data["lasttext"] = { "ja-JP": "ラストカットイン", "zh-TW": "最終切入台詞", "en-US": "Final Cutin", "zh-CN": "最终特写台词" };
    //search


    var getText = function (key) {
        return data[key][getLang()] || data[key]['en-US'];
    };
    var getLang = function () {
        if (!currentLang) {
            setLang();
        }
        return currentLang;
    };
    var setLang = function (lang) {
        lang = lang || localStorage["uilang"] || navigator.language || navigator.browserLanguage;
        if (_.any(supportedLang, function (o) { return o.key == lang }) == false) {
            lang = 'ja-JP';
        }
        currentLang = lang;
        localStorage["uilang"] = lang;
        $('#currentLang').text(_.find(supportedLang, function (o) {
            return o.key == lang;
        }).text);
    };
    return {
        supportedLang: supportedLang,
        getText: getText,
        getLang: getLang,
        setLang: setLang,
    };
});