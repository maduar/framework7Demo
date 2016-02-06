require.config({
    baseUrl: 'javascripts',
    paths : {
        Framework7 : 'framework7',
        jquery : 'jquery/jquery',
        loading : '../utils/loading',
        Template7 : 'template7.min'
    },
    shim : {
        Framework7 : {
            exports : 'Framework7'
        },
        Template7 : {
            exports : 'Template7'
        }
    }
});

require(['jquery', ], function($) {
    require(['Framework7', 'Template7'], function(Framework7, Template7) {
        var myApp = new Framework7({
            template7Pages : true
        });

        var $$ = Framework7.$();

        var title = 'mhp';

        var temp = $('.ccc').html();
        var compiledTemplate = Template7.compile(temp);
        var html = compiledTemplate(temp);
        //var mainView = myApp.addView('.view-main', function() {
        //    dynamicNavbar : true
    });
});