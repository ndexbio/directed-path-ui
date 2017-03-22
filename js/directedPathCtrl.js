var app = angular.module('directedPathApp'); //ui-bootstrap


app.controller('directedPathCtrl', function ($scope, $http) {
    $scope.useDev = false;
    $scope.lastKey = "";
    $scope.enableSubmit = true;
    $scope.previousLastKey = "";
    $scope.dirty_source = {"term_list": ""};
    $scope.dirty_target = {"term_list": ""};
    $scope.dirty = {"term_list": ""};
    $scope.pathsWithBestEdge = [];
    $scope.networkCx = null;
    $scope.sourceNodes = [];
    $scope.targetNodes = [];
    $scope.viewGraph = true;
    $scope.numPaths = 15;

    $scope.sources = [
    {"id": "AKT1"},
    {"id": "MDM2"},
    {"id": "MTOR"}
    ];

    $scope.targets = [
    {"id": "INSR"},
    {"id": "IRS1"},
    {"id": "EGFR"}
    ];

    $scope.addSource = function(){
        $scope.sources.push({"id": "128888"});
    };

    $scope.add_target_terms = function (termList) {
        termList = $scope.parseTerms(termList);

        for (addThisTerm in termList){
            $scope.targets.push({"id": termList[addThisTerm]});
        }

        $scope.dirty_target.term_list = "";
        $scope.checkSubmitButton();
    };

    $scope.add_source_terms = function (termList) {
        termList = $scope.parseTerms(termList);

        for (addThisTerm in termList){
            $scope.sources.push({"id": termList[addThisTerm]});
        }

        $scope.dirty_source.term_list = "";
        $scope.checkSubmitButton();
    };

    $scope.parseTerms = function(termList) {
            var terms = angular.copy(termList);
            //var terms = _.terms($scope.dirty.term_list, /[\w0-9\-_]+/g);
            if(terms.indexOf("JSON_CALLBACK") > -1){
                terms = terms.replace(/JSON_CALLBACK/g, "");
            }
            terms = terms.replace(/\//g, "");
            terms = terms.replace(/\?/g, "");
            terms = terms.replace(/^\s+|\s+$/g,''); //Trim trailing and leading spaces
            terms = terms.replace(/ +/g, " "); // Trim multiple spaces
            terms = terms.replace(/(?:\r\n|\r|\n|\s)/g, ',');
            terms = terms.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',');

            if((terms.slice(-1) === ',') || (terms.slice(-1) === ' ')) {
                terms = terms.substring(0, terms.length - 1);
            }

            termsArray = terms.split(',');

            //for (addThisTerm in termsArray){
            //    $scope.targets.push({"id": termsArray[addThisTerm]});
            //}

            console.log(termsArray);

            return termsArray;
    };

    $scope.checkSubmitButton = function() {
        if(($scope.sources.length > 0) && ($scope.targets.length > 0)){
            $scope.enableSubmit = true;
        } else {
            $scope.enableSubmit = false;
        }
    };

    $scope.checkSubmitButton2 = function() {
        $scope.pathsWithBestEdge = [];
        var tmpSources = [];
        var tmpTargets = [];
        $scope.sources.forEach(function(entry) {
            tmpSources.push(entry.id);
        });

        $scope.targets.forEach(function(entry) {
            tmpTargets.push(entry.id);
        });

        var uuid = "84f321c6-dade-11e6-86b1-0ac135e8bacf";
        var serverHost = "public.ndexbio.org";

        var myUrl = "directedpath/query?source=" + tmpSources.join() + "&target=" + tmpTargets.join() + "&pathnum=" + $scope.numPaths + "&uuid=" + uuid + "&server=" + serverHost;
        $scope.sourceNodes = tmpSources;
        $scope.targetNodes = tmpTargets;
        //console.log(myUrl);

        $http({
            method : "POST",
            url : "directedpath/query?source=" + tmpSources.join() + "&target=" + tmpTargets.join() + "&pathnum=" + $scope.numPaths + "&uuid=" + uuid + "&server=" + serverHost
        }).then(function mySucces(response) {
            var processData = response.data.data;
            $scope.networkCx = processData.network;
            //console.log(processData);
            processData.forward_english.forEach(function(topPaths) {
                var tmpPath = [];
                topPaths.forEach(function(pathElement) {
                    if(typeof pathElement === "string"){
                        tmpPath.push(pathElement);
                    } else { //assume it's an array
                        tmpPath.push(pathElement[0].interaction);
                    }
                });
                $scope.pathsWithBestEdge.push(tmpPath);
            });
            //console.log($scope.pathsWithBestEdge);

            $scope.viewGraph = false;

            $scope.myWelcome = response.data;
            //console.log($scope.myWelcome);
        }, function myError(response) {
            $scope.myWelcome = response.statusText;
            console.log($scope.myWelcome);
        });
    };

    $scope.deleteSource = function(obj){
        //console.log(obj);
        $scope.sources = _.without($scope.sources, obj);
        $scope.checkSubmitButton();
    };

    $scope.deleteTarget = function(obj){
        //console.log(obj);
        $scope.targets = _.without($scope.targets, obj);
        $scope.checkSubmitButton();
    };

});
