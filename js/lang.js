var Lang = {
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
    get: function () {
        var lang = localStorage["lang"] || navigator.language || navigator.browserLanguage;
        if (_.any(this.supportedLang, function (o) { return o.key == lang }) == false) {
            lang = 'ja-JP';
        }
        localStorage["lang"] = lang;
        $('#currentLang').text(_.find(this.supportedLang, function (o) {
            return o.key == lang;
        }).text);
        return lang;
    },
    set: function (lang) {
        localStorage["lang"] = lang;
    },
};
//navbar
Lang["list"] = { "ja-JP": "図鑑", "zh-TW": "圖鑑", "en-US": "Encyclopedia", "zh-CN": "图鉴" };
Lang["search"] = { "ja-JP": "検索", "zh-TW": "搜索", "en-US": "Search", "zh-CN": "搜索" };
Lang["category"] = { "ja-JP": "", "zh-TW": "分類", "en-US": "Category", "zh-CN": "分类" };
Lang["about"] = { "ja-JP": "", "zh-TW": "關於", "en-US": "About", "zh-CN": "关于" };
Lang["info"] = { "ja-JP": "お知らせ", "zh-TW": "通知", "en-US": "Notices", "zh-CN": "游戏公告" };
Lang["ui"] = { "ja-JP": "", "zh-TW": "界面語言", "en-US": "UI", "zh-CN": "界面语言" };
Lang["data"] = { "ja-JP": "", "zh-TW": "資料語言", "en-US": "Data", "zh-CN": "数据语言" };
//unit detail
Lang["life"] = { "ja-JP": "HP", "zh-TW": "HP", "en-US": "HP", "zh-CN": "HP" };
Lang["attack"] = { "ja-JP": "攻撃力", "zh-TW": "攻擊力", "en-US": "ATK", "zh-CN": "攻击力" };
Lang["heal"] = { "ja-JP": "回復", "zh-TW": "回復力", "en-US": "REC", "zh-CN": "回复" };
Lang["pt"] = { "ja-JP": "進化pt", "zh-TW": "進化點數", "en-US": "EV Pts", "zh-CN": "进化pt" };
Lang["exp"] = { "ja-JP": "経験値", "zh-TW": "經驗值", "en-US": "EXP", "zh-CN": "经验值" };
Lang["evolve"] = { "ja-JP": "進化", "zh-TW": "進化", "en-US": "Evolve", "zh-CN": "进化" };
Lang["evolvept"] = { "ja-JP": "必要進化pt", "zh-TW": "必須進化點數", "en-US": "Evolve", "zh-CN": "进化所需pt" };
Lang["awakening"] = { "ja-JP": "覚醒pt", "zh-TW": "覺醒點數", "en-US": "Awakening", "zh-CN": "觉醒pt" };
Lang["skill"] = { "ja-JP": "スキル", "zh-TW": "技能", "en-US": "Skill", "zh-CN": "技能" };
Lang["party"] = { "ja-JP": "パーティスキル", "zh-TW": "隊伍技能", "en-US": "Party Skill", "zh-CN": "被动技能" };
Lang["active"] = { "ja-JP": "アクティブスキル", "zh-TW": "主動技能", "en-US": "Active Skill", "zh-CN": "主动技能" };
Lang["panel"] = { "ja-JP": "パネルスキル", "zh-TW": "方塊技能", "en-US": "Panel Skill", "zh-CN": "光板技能" };
Lang["limit"] = { "ja-JP": "リミットスキル", "zh-TW": "極限技能", "en-US": "Limit Skill", "zh-CN": "Limit技能" };
Lang["soul"] = { "ja-JP": "消費ソウル", "zh-TW": "消耗魂", "en-US": "Souls", "zh-CN": "消耗魂" };
Lang["story"] = { "ja-JP": "ストーリー", "zh-TW": "故事", "en-US": "Story", "zh-CN": "故事" };
Lang["cutin"] = { "ja-JP": "カットイン台詞", "zh-TW": "切入台詞", "en-US": "Special Move Lines", "zh-CN": "特写台词" };
Lang["accessory"] = { "ja-JP": "アクセサリー", "zh-TW": "飾品", "en-US": "Accessory", "zh-CN": "饰品" };
//search