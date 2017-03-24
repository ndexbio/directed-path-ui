var app = angular.module("directedPathApp", ["ngRoute"]); //ui-bootstrap

var useLocalHost = false;

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
        .when('/about', {
            templateUrl: 'partials/about/mainAboutTemplate.html',
            controller: 'directedPathCtrl',
            activetab: 'MAINABOUT'
        })
        .otherwise({
            redirectTo: '/about'
        });
    }]);


