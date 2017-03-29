var app = angular.module('directedPathApp'); //ui-bootstrap

app.controller('directedPathCtrl', function ($scope, $http) {
    $scope.useDev = false;
    $scope.lastKey = "";
    $scope.enableSubmit = false;
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
    $scope.info = {
        nodeRef: [], //["AKT", "MDM2", "MTOR", "BRAF", "MAP2K3", "FGR"]
        showOtherUuid: false,
        preferenceSchedule: {}
    };

    $scope.info.nodeRef

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

/*    $scope.referenceNetworks = [
        {
            "name": "Default",
            "id": "84f321c6-dade-11e6-86b1-0ac135e8bacf",
            "group": "nci-pid"
        },
        {
            "name": "Insulin Pathway",
            "id": "073b9f25-6194-11e5-8ac5-06603eb7f303",
            "group": "nci-pid"
        },
        {
            "name": "PLK3 signalling events",
            "id": "eac8a4b8-6194-11e5-8ac5-06603eb7f303",
            "group": "nci-pid"
        },
        {
            "name": "Other",
            "id": "eac8a4b8-6194-11e5-8ac5-06603eb7f303",
            "group": "nci-pid"
        }
    ];
*/

    $scope.data = {
        availableOptions: [
          {id: "84f321c6-dade-11e6-86b1-0ac135e8bacf", name: "Default (BigMech evaluation prior)"},
          {id: "073b9f25-6194-11e5-8ac5-06603eb7f303", name: "Insulin Pathway"},
          {id: "eac8a4b8-6194-11e5-8ac5-06603eb7f303", name: "PLK3 signalling events"},
          {id: -1, name: "Other"}
        ],
        selectedOption: {id: "84f321c6-dade-11e6-86b1-0ac135e8bacf", name: "Default"}, //This sets the default value of the select in the ui
        otherSelectedOption: {id: "", name: "Other"}
    };

    $scope.parseTerms = function(termList) {
            var terms = angular.copy(termList);

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

            return termsArray;
    };

    $scope.checkSubmitButton = function(sourceLength, targetLength, refNetworks) {
        if((sourceLength > 0) && (targetLength > 0) && (refNetworks)){
            $scope.enableSubmit = true;
        } else {
            $scope.enableSubmit = false;
        }
    };

    $scope.checkUuid = function() {
        if($scope.data.otherSelectedOption.id.length >= 36){
            $scope.getNetworkNodes($scope.data.otherSelectedOption.id);
            $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, $scope.data.otherSelectedOption.id);
        } else {
            $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, null);
        }
    };

    $scope.findPaths = function() {
        $scope.pathsWithBestEdge = [];
        var tmpSources = [];
        var tmpTargets = [];
        $scope.sources.forEach(function(entry) {
            tmpSources.push(entry.id);
        });

        $scope.targets.forEach(function(entry) {
            tmpTargets.push(entry.id);
        });

        var uuid = "";
        if($scope.data.selectedOption.id != -1){
            uuid = $scope.data.selectedOption.id;
        } else {
            uuid = $scope.data.otherSelectedOption.id;
        }
        var serverHost = "public.ndexbio.org";

        var myUrl = "directedpath/query?source=" + tmpSources.join() + "&target=" + tmpTargets.join() + "&pathnum=" + $scope.numPaths + "&uuid=" + uuid + "&server=" + serverHost;
        $scope.sourceNodes = tmpSources;
        $scope.targetNodes = tmpTargets;

        $http({
            method : "POST",
            url : "directedpath/query?source=" + tmpSources.join() + "&target=" + tmpTargets.join() + "&pathnum=" + $scope.numPaths + "&uuid=" + uuid + "&server=" + serverHost
        }).then(function mySucces(response) {
            var processData = response.data.data;
            $scope.networkCx = processData.network;
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

            $scope.viewGraph = false;

            $scope.myWelcome = response.data;
        }, function myError(response) {
            console.log(response.statusText);
        });
    };

    $scope.getNetworkNodes = function(networkUuid) {
        $scope.info.nodeRef = [];
        var serverHost = "public.ndexbio.org";

        var myUrl = "v2/network/" + networkUuid + "/aspect/nodes?size=500";
        $http({
            method : "GET",
            url : myUrl
        }).then(function mySucces(response) {
            response.data.forEach(function(node) {
                if(typeof node === "string"){
                    console.log("return data is in the wrong format (str)");
                } else { //assume it's an array
                    $scope.info.nodeRef.push(node.n);
                }
            });
        }, function myError(response) {
            console.log(response.statusText);
        });
    };

    $scope.getPreferenceSchedule = function() {
        var myUrl = "getPreferenceSchedule";
        $http({
            method : "GET",
            url : myUrl
        }).then(function mySucces(response) {
            console.log(response.data);
            $scope.info.preferenceSchedule = response.data.data;
        }, function myError(response) {
            console.log(response.statusText);
        });
    };

    $scope.searchForNetworks = function(networkUuid) {
        $scope.info.nodeRef = [];
        var serverHost = "public.ndexbio.org";
        var searchString = {"searchString": "RAS"};

        var myUrl = "v2/search/network?start=0&size=20";
        $http({
            method : "POST",
            url : myUrl,
            data: searchString,
        }).then(function mySucces(response) {
            response.data.forEach(function(node) {
                if(typeof node === "string"){
                    console.log("return data is in the wrong format (str)");
                } else { //assume it's an array
                    $scope.info.nodeRef.push(node.n);
                }
            });
        }, function myError(response) {
            console.log(response.statusText);
        });
    };

    //================================
    //================================
    // ADD/DELETE SOURCES and TARGETS
    //================================
    //================================
    $scope.add_target_terms = function (termList) {
        termList = $scope.parseTerms(termList);

        for (addThisTerm in termList){
            $scope.targets.push({"id": termList[addThisTerm]});
        }

        $scope.dirty_target.term_list = "";
        $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, $scope.data.selectedOption.id);
    };

    $scope.add_source_terms = function (termList) {
        termList = $scope.parseTerms(termList);

        for (addThisTerm in termList){
            $scope.sources.push({"id": termList[addThisTerm]});
        }

        $scope.dirty_source.term_list = "";
        $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, $scope.data.selectedOption.id);
    };

    $scope.refNetworkChanged = function(item){
        if(item != -1){
            $scope.info.showOtherUuid = false;
            $scope.getNetworkNodes(item);
            $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, item);
        } else {
            $scope.info.showOtherUuid = true;
            $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, null);
        }
    }

    $scope.deleteSource = function(obj){
        $scope.sources = _.without($scope.sources, obj);
        $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, $scope.data.selectedOption.id);
    };

    $scope.deleteTarget = function(obj){
        $scope.targets = _.without($scope.targets, obj);
        $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, $scope.data.selectedOption.id);
    };
    $scope.checkSubmitButton($scope.sources.length, $scope.targets.length, $scope.data.selectedOption.id);
});
