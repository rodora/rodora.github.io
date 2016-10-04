require.config({
    shim: {
        "bootstrap": { "deps": ['jquery'] },
        "bootstrap-select": { "deps": ['bootstrap'] },
        "jquery.unveil": { "deps": ['jquery'] },
        'LZString': {
            exports: 'LZString'
        },
    },
    baseUrl: 'js',
    paths: {
        "text": "libs/require-text",
        "jquery": "libs/jquery-1.12.3.min",
        "jquery.unveil": "libs/jquery.unveil",
        "underscore": "libs/underscore-min",
        "backbone": "libs/backbone-min",
        "nprogress": "libs/nprogress",
        "LZString": "libs/lz-string.min",
        "bitset": "libs/bitset.min",
        "nouislider": "libs/nouislider.min",
        "bootstrap": "libs/bootstrap.min",
        "bootstrap-select": "libs/bootstrap-select.min"
    }
});
NProgress.start();
require(['jquery', 'underscore', 'unit', 'ui', 'view', 'router'], function ($, _, Unit, Ui, View, Router) {
    $(function () {
        NProgress.set(0.33);
        View.initUiLanguage();
        $.when(Unit.init("unit"), Unit.init("skill"))
            .then(function () {
                console.log("base data inited");
                NProgress.set(0.66);
                localStorage.setItem("lastUpdate", JSON.stringify(new Date()))
                var lang = Unit.getLang();
                $.when(Unit.init("unit", lang), Unit.init("skill", lang)).done(function () {
                    console.log("lang data inited");
                    NProgress.set(0.9);
                    localStorage.setItem("lastUpdate." + lang, JSON.stringify(new Date()))
                    Unit.applyLanguage(lang);
                    NProgress.inc();
                    Router.init();
                    NProgress.inc();
                    View.initControls();
                    NProgress.done();
                });
            });
    });
}, function (err) {
    console.log("network error, will auto reload.");
    location.reload();
});