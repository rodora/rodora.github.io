var Lang = {
    supportedLang: ['ja-JP', 'zh-TW', 'en-US', 'zh-CN'],
    get: function () {
        var lang = localStorage["lang"] || navigator.language || navigator.browserLanguage;
        if (_.any(this.supportedLang, function (o) { return o == lang }) == false) {
            lang = 'ja-JP';
        }
        localStorage["lang"] = lang;
        $('#currentLang').text(lang);
        return lang;
    },
    set: function (lang) {
        localStorage["lang"] = lang;
    },
};
//navbar
Lang["list"] = { "ja-JP": "List", "zh-TW": "List", "en-US": "List", "zh-CN": "列表" };
Lang["search"] = { "ja-JP": "", "zh-TW": "", "en-US": "Search", "zh-CN": "搜索" };
Lang["category"] = { "ja-JP": "", "zh-TW": "", "en-US": "Category", "zh-CN": "分组" };
Lang["about"] = { "ja-JP": "", "zh-TW": "", "en-US": "About", "zh-CN": "关于" };
Lang["ui"] = { "ja-JP": "", "zh-TW": "", "en-US": "UI", "zh-CN": "界面语言" };
Lang["data"] = { "ja-JP": "", "zh-TW": "", "en-US": "Data", "zh-CN": "数据语言" };
//unit detail
Lang["life"] = { "ja-JP": "", "zh-TW": "HP", "en-US": "Life", "zh-CN": "HP" };
Lang["attack"] = { "ja-JP": "", "zh-TW": "攻擊力", "en-US": "Attack", "zh-CN": "攻击力" };
Lang["heal"] = { "ja-JP": "", "zh-TW": "回復力", "en-US": "Heal", "zh-CN": "回复" };
Lang["pt"] = { "ja-JP": "", "zh-TW": "進化點數", "en-US": "Pt", "zh-CN": "进化pt" };
Lang["exp"] = { "ja-JP": "", "zh-TW": "經驗值", "en-US": "Exp", "zh-CN": "经验值" };
Lang["evolve"] = { "ja-JP": "", "zh-TW": "進化", "en-US": "Evolve", "zh-CN": "进化" };
Lang["evolvept"] = { "ja-JP": "", "zh-TW": "必須進化點數", "en-US": "Evolve", "zh-CN": "进化所需pt" };
Lang["awakening"] = { "ja-JP": "", "zh-TW": "覺醒點數", "en-US": "Awakening", "zh-CN": "觉醒pt" };
Lang["skill"] = { "ja-JP": "", "zh-TW": "技能", "en-US": "Skill", "zh-CN": "技能" };
Lang["party"] = { "ja-JP": "", "zh-TW": "隊伍技能", "en-US": "Party", "zh-CN": "被动" };
Lang["active"] = { "ja-JP": "", "zh-TW": "主動技能", "en-US": "Active", "zh-CN": "主动" };
Lang["panel"] = { "ja-JP": "", "zh-TW": "方塊技能", "en-US": "Panel", "zh-CN": "光板" };
Lang["limit"] = { "ja-JP": "", "zh-TW": "極限技能", "en-US": "Limit", "zh-CN": "Limit" };
Lang["soul"] = { "ja-JP": "", "zh-TW": "消耗魂：", "en-US": "Soul:", "zh-CN": "消耗魂：" };
Lang["story"] = { "ja-JP": "", "zh-TW": "故事", "en-US": "Story", "zh-CN": "故事" };
Lang["cutin"] = { "ja-JP": "", "zh-TW": "Cutin", "en-US": "Cutin", "zh-CN": "Cutin" };
Lang["accessory"] = { "ja-JP": "", "zh-TW": "飾品", "en-US": "Accessory", "zh-CN": "饰品" };
//search
Lang["clear"] = { "ja-JP": "", "zh-TW": "", "en-US": "Clear", "zh-CN": "" };
Lang["searchfor"] = { "ja-JP": "", "zh-TW": "", "en-US": "Search for...(Currently only support Japanese)", "zh-CN": "" };
Lang["general"] = { "ja-JP": "", "zh-TW": "", "en-US": "General", "zh-CN": "" };
Lang["name"] = { "ja-JP": "", "zh-TW": "", "en-US": "Name", "zh-CN": "" };
Lang["showonly100"] = { "ja-JP": "", "zh-TW": "", "en-US": "Show only first 100 results.", "zh-CN": "" };
Lang["rarity"] = { "ja-JP": "", "zh-TW": "", "en-US": "Rarity", "zh-CN": "" };
Lang["class"] = { "ja-JP": "", "zh-TW": "", "en-US": "Class", "zh-CN": "" };
Lang["attribute"] = { "ja-JP": "", "zh-TW": "", "en-US": "Attribute", "zh-CN": "" };
Lang["subattribute"] = { "ja-JP": "", "zh-TW": "", "en-US": "SubAttribute", "zh-CN": "" };
Lang["all"] = { "ja-JP": "", "zh-TW": "", "en-US": "All", "zh-CN": "全部" };