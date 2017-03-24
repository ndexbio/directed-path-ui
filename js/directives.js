var app = angular.module('directedPathApp'); //ui-bootstrap

/*
==========================================
==========================================
        NETWORK VIS
        DIRECTIVE
==========================================
==========================================
*/
app.directive('visJsGraph', function ($timeout) {
    function link(scope, el, attrs) {
        scope.highlightPath = ["AKT1", "IRS1", "INSR"]
        scope.selectedRow = 99;
        scope.revealCounter = 0;
        scope.highlightThesePaths = {};
        scope.info = {
            doneRendering: false,
            toggleTableClick: false
        };


        scope.init = function(params) {
            $('#graphIsLoading').html('<span class="fa fa-spinner fa-2x fa-pulse"></span>');
            var sourceTargetNodes = _.intersection(scope.sources, scope.targets);

            pathElementIdBase = 20000;
            var edgestmp = [];
            var nodestmp = [];
            var edge_docket = {};
            var highlightPath = ["AKT1", "IRS1", "INSR"];

            nodestmp.push({id: 99994, label: "Fixed1", x: -1000, y: 0, physics: false, hidden: true, shape: "diamond", color: {'background': "#0080FF", "border": "#C0C0C0"}});
            nodestmp.push({id: 99995, label: "Fixed1", x: -1000, y: 200, physics: false, hidden: true, shape: "diamond", color: {'background': "#0080FF", "border": "#C0C0C0"}});
            nodestmp.push({id: 99996, label: "Fixed1", x: -1000, y: -200, physics: false, hidden: true, shape: "diamond", color: {'background': "#0080FF", "border": "#C0C0C0"}});
            nodestmp.push({id: 99997, label: "Fixed2", x: 1000, y: 0, physics: false, hidden: true, shape: "diamond", color: {'background': "#0080FF", "border": "#C0C0C0"}});
            nodestmp.push({id: 99998, label: "Fixed2", x: 1000, y: 200, physics: false, hidden: true, shape: "diamond", color: {'background': "#0080FF", "border": "#C0C0C0"}});
            nodestmp.push({id: 99999, label: "Fixed", x: 1000, y: -200, physics: false, hidden: true, shape: "diamond", color: {'background': "#0080FF", "border": "#C0C0C0"}});

            scope.networkCx.forEach(function(cxElement) {
                if(cxElement.hasOwnProperty('nodes')){
                    if(sourceTargetNodes.indexOf(cxElement.nodes[0].n) > -1){
                    //==========================================
                    // Nodes that are both SOURCES and TARGETS
                    //==========================================
                        nodestmp.push({id: cxElement.nodes[0]["@id"], label: cxElement.nodes[0].n, shape: "dot", color: {'background': "#00FFF0", "border": "#C0C0C0"}, permaColor: {'background': "#00FFF0", "border": "#C0C0C0"}});
                        edgestmp.push({from: 99994, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99995, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99996, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99997, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99998, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99999, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                   } else if(scope.sources.indexOf(cxElement.nodes[0].n) > -1){
                    //==========================================
                    // Nodes that are SOURCES
                    //==========================================
                        nodestmp.push({id: cxElement.nodes[0]["@id"], label: cxElement.nodes[0].n, shape: "dot", color: {'background': "#00F000", "border": "#C0C0C0"}, permaColor: {'background': "#00F000", "border": "#C0C0C0"}});
                        edgestmp.push({from: 99994, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99995, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99996, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                    } else if(scope.targets.indexOf(cxElement.nodes[0].n) > -1) {
                    //==========================================
                    // Nodes that are TARGETS
                    //==========================================
                        nodestmp.push({id: cxElement.nodes[0]["@id"], label: cxElement.nodes[0].n, shape: "dot", color: {'background': "#F0F000", "border": "#C0C0C0"}, permaColor: {'background': "#F0F000", "border": "#C0C0C0"}});
                        edgestmp.push({from: 99997, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99998, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                        edgestmp.push({from: 99999, to: cxElement.nodes[0]["@id"], label: "Attractor", hidden: true});
                    } else {
                        nodestmp.push({id: cxElement.nodes[0]["@id"], label: cxElement.nodes[0].n, shape: "dot", color: {'background': "#F0F0F0", "border": "#C0C0C0"}, permaColor: {'background': "#F0F0F0", "border": "#C0C0C0"}});
                    }
                } else if(cxElement.hasOwnProperty('edges')) {
                    if(cxElement.edges[0]["s"] != cxElement.edges[0]["t"]){ // Don't display self-referencing edges
                        var found_edge = false;
                        if(cxElement.edges[0].hasOwnProperty("k")){
                            if(cxElement.edges[0]["k"]){
                                if(cxElement.edges[0]["i"] != "Complex"){
                                    edgestmp.push({from: cxElement.edges[0]["s"], to: cxElement.edges[0]["t"], arrows:'to', label: cxElement.edges[0]["i"]});
                                } else {
                                    edgestmp.push({from: cxElement.edges[0]["s"], to: cxElement.edges[0]["t"], label: cxElement.edges[0]["i"]});
                                }
                            }
                        }
                    }
                }
            });

            scope.nodes = new vis.DataSet(nodestmp);
            scope.edges = new vis.DataSet(edgestmp);

            var container = document.getElementById('mynetwork');
            var data = {
                nodes: scope.nodes,
                edges: scope.edges
            };

                var options = {
                  nodes: {
                      borderWidth: 1,
                      shape: 'dot',
                      font: {
                        size: 20,
                        face: 'Tahoma'
                      },
                      scaling: {
                        min: 10,
                        max: 30,
                        label: {
                          min: 8,
                          max: 30,
                          drawThreshold: 12,
                          maxVisible: 20
                        }
                      },
                      size: 16
                  },
                  edges:{
                    width: 1.0,
                    smooth: {
                      "type": "continuous",
                      "forceDirection": "none",
                      "roundness": 0.15
                    },
                    physics: true

                  },
                  layout: {
                      improvedLayout:true,
                      hierarchical: {
                        enabled:false,
                        levelSeparation: 150,
                        direction: 'UD',   // UD, DU, LR, RL
                        sortMethod: 'hubsize' // hubsize, directed
                      },
                      randomSeed:780555
                  },
                  interaction:{
                    hideEdgesOnDrag: true,
                    hover:true,
                    tooltipDelay: 300
                  },
                  physics: {
                    stabilization: true,
                    barnesHut: {gravitationalConstant: -30000, springConstant: 0.012, springLength: 200},
                    maxVelocity: 8,
                    minVelocity: 5,
                    solver: 'barnesHut',
                    adaptiveTimestep: true,
                    stabilization: {
                      enabled: true,
                      iterations: 300,
                      updateInterval: 200,
                      onlyDynamicEdges: false,
                      fit: true
                    }

                  }
                };
            scope.network = new vis.Network(container, data, options);
            scope.allNodes = scope.nodes.get({returnType:"Object"});
            scope.allEdges = scope.edges.get({returnType:"Object"});

            scope.network.on("click",scope.getNodeInfo);
            scope.network.on("afterDrawing", scope.afterDrawing);

           $timeout(function() {
             $('#graphIsLoading').html('');
           }, 300);
        };

        scope.afterDrawing = function (params) {
            if(!scope.info.doneRendering){
                scope.info.doneRendering = true;
                scope.network.setOptions({physics: {enabled: false}});
            }
        };

        scope.getNodeInfo = function(params){
          var selectedNode = params.nodes[0];
          if(selectedNode){
              var nodePosition = scope.network.getPositions(selectedNode);
              //console.log("x: " + nodePosition[selectedNode].x.toString() + " y: " + nodePosition[selectedNode].y.toString());
                if (scope.$root.$$phase != "$apply" && scope.$root.$$phase != "$digest") {
                  scope.$apply(function(){
                  if(selectedNode == 99999){
                     scope.revealCounter = 0;
                  } else {
                     scope.revealCounter += 1;
                  }
                  });
                }
          }

        };

        scope.clearHighlight = function(path) {
            scope.selectedRow = 99;
            scope.info.toggleTableClick = false;
            scope.highlightThesePaths = {};

          for (var nodeId in scope.allNodes) {
            if(["99994","99995","99996","99997","99998","99999"].indexOf(nodeId) < 0 || scope.revealCounter > 3){ // Don't reveal the attractor nodes
                scope.allNodes[nodeId].hidden = false;
            }
            scope.allNodes[nodeId].color = scope.allNodes[nodeId].permaColor;
          }

          for (var edgeId in scope.allEdges) {
            if([99994, 99995, 99996, 99997, 99998, 99999].indexOf(scope.allEdges[edgeId].from) < 0  || scope.revealCounter > 3){
                scope.allEdges[edgeId].hidden = false;
            }
          }

            // transform the object into an array
            var updateEdgeArray = [];
            for (edgeId in scope.allEdges) {
              if (scope.allEdges.hasOwnProperty(edgeId)) {
                updateEdgeArray.push(scope.allEdges[edgeId]);
              }
            }

            if(scope.edges){
                scope.edges.update(updateEdgeArray);
            }
            var updateArray = [];
            for (nodeId in scope.allNodes) {
                if (scope.allNodes.hasOwnProperty(nodeId)) {
                  updateArray.push(scope.allNodes[nodeId]);
                }
            }

            if(scope.nodes){
              scope.nodes.update(updateArray);
            }
        };

        scope.neighborhoodHighlight = function(pathToAnalyze, tableIndex, clicked) {
            scope.highlightPath = [];
            scope.highlightEdges = [];
            scope.highlightPathEdges = [];
            scope.highlightNodes = [];

            if(!scope.info.toggleTableClick || clicked){
                if(!scope.highlightThesePaths.hasOwnProperty(tableIndex)){
                    scope.highlightThesePaths[tableIndex] = pathToAnalyze;
                } else {
                    delete scope.highlightThesePaths[tableIndex];

                    //=========================================
                    // Check if any rows are selected.  if not
                    // clear out and display the whole network
                    //=========================================
                    if ($.isEmptyObject(scope.highlightThesePaths)){
                        scope.clearHighlight(null);
                        return;
                    }
                }

                //=========================================
                // Hide all nodes and edges to start with
                //=========================================
                for (var nodeId in scope.allNodes) {
                    scope.allNodes[nodeId].hidden = true;
                }
                for (var edgeId in scope.allEdges) {
                    scope.allEdges[edgeId].hidden = true;
                }

                for(var pathToggled in scope.highlightThesePaths){
                    if(scope.highlightThesePaths.hasOwnProperty(pathToggled)){
                        var path = scope.highlightThesePaths[pathToggled];

                        console.log(scope.highlightThesePaths);
                        scope.selectedRow = tableIndex;
                        for (var i=0; i<path.length; i++){
                            if(i % 2 === 0){
                                scope.highlightPath.push(path[i]);
                            }
                        }

                        for (var i=0; i<scope.highlightPath.length; i++){
                            for (var nodeId in scope.allNodes) {
                                if(scope.highlightPath[i] === scope.allNodes[nodeId].label){
                                    scope.highlightNodes.push(parseInt(nodeId));
                                }
                            }
                        }

                        for (var nodeId in scope.allNodes) {
                            if(scope.highlightPath.indexOf(scope.allNodes[nodeId].label) > -1){
                                scope.allNodes[nodeId].hidden = false;
                            }
                        }

                        //=========================================
                        // Create edge tuples i.e. [(0,1), (1,2)]
                        //=========================================
                        var sliced1 = _.slice(scope.highlightNodes, 1, scope.highlightNodes.length);
                        var zipped = _.zip(scope.highlightNodes, sliced1);

                        for (edgeId in scope.allEdges) {
                          if (scope.allEdges.hasOwnProperty(edgeId)) {
                            if(scope.highlightNodes.indexOf(scope.allEdges[edgeId].from) > -1 && scope.highlightNodes.indexOf(scope.allEdges[edgeId].to) > -1){
                                scope.highlightEdges.push(edgeId);
                            }
                          }
                        }

                        for (var i=0; i<zipped.length; i++){
                            var src = zipped[i][0];
                            var trg = zipped[i][1];

                            for (var j=0; j<scope.highlightEdges.length; j++){
                                if(scope.allEdges[scope.highlightEdges[j]].from === src && scope.allEdges[scope.highlightEdges[j]].to === trg){
                                    scope.highlightPathEdges.push(scope.allEdges[scope.highlightEdges[j]]["id"]);
                                }
                            }
                        }

                        for (var edgeId in scope.allEdges) {
                            if(scope.highlightPathEdges.indexOf(edgeId) > -1){
                                scope.allEdges[edgeId].hidden = false;
                            }
                        }
                    }
                }

                // transform the object into an array
                var updateEdgeArray = [];
                for (edgeId in scope.allEdges) {
                  if (scope.allEdges.hasOwnProperty(edgeId)) {
                    updateEdgeArray.push(scope.allEdges[edgeId]);
                  }
                }

                if(scope.edges){
                    scope.edges.update(updateEdgeArray);
                }

                var updateArray = [];
                for (nodeId in scope.allNodes) {
                    if (scope.allNodes.hasOwnProperty(nodeId)) {
                      updateArray.push(scope.allNodes[nodeId]);
                    }
                }

                if(scope.nodes){
                  scope.nodes.update(updateArray);
                }

            }

            if(clicked) {
                scope.info.toggleTableClick = true;//!scope.info.toggleTableClick;
            }
        };

        scope.init();
    }

    return {
      scope: {
          paths: "=",
          networkCx: "=",
          sources: "=",
          targets: "="
      },
      restrict: "EA",
      templateUrl: "partials/directiveTemplates/visJSTemplate.html",
      link: link
    };
});


