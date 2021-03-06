var cntNode = 0;
var cntEdge = 0;
var node1 = "";
var node2 = "";
var Delete = false;
var DeleteEdge = false;
var DeleteEdge = false;
var graph = {"nodes": {}, "edges": {}};
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    if (color == '55575b' || color == 'FFFFFF') {
        return getRandomColor();
    }
    return color;
}
function toggleXYZ() {
    var sceneEl = document.querySelector("a-scene");
    var axisEl = sceneEl.querySelector("#axis");
    var vis = axisEl.getAttribute("visible");
    if (vis) {
        axisEl.setAttribute("visible", "false");
    }
    else {
        axisEl.setAttribute("visible", "true");
    }
}
function toggleGrnd() {
    var sceneEl = document.querySelector("a-scene");
    var axisEl = sceneEl.querySelector("a-plane");
    var vis = axisEl.getAttribute("visible");
    if (vis) {    axisEl.setAttribute("visible", "false");}
    else {     axisEl.setAttribute("visible", "true"); }
}
function toggleDelete() {
    if (Delete == true) {       Delete = false;}
    else {      Delete = true;}
}
function hideAllSelectCubes(){
        var allChildren = document.getElementById('graph').children;
    for (var i=0; i<allChildren.length;i++){
            var childChildren = allChildren[i].children;
            for (var k=0; k<childChildren.length;k++){
                childChildren[k].setAttribute('visible','false');
            }
        }
}
function toggleDeleteEdge() {
    if (DeleteEdge == true) {       
        DeleteEdge = false;
        hideAllSelectCubes();
    }
    else {
        DeleteEdge = true;
        var allChildren = document.getElementById('graph').children;
        for (var i=0; i<allChildren.length;i++){
            var childChildren = allChildren[i].children;
            for (var k=0; k<childChildren.length;k++){
                childChildren[k].setAttribute('visible','true');
            }
        }
    }
}
function addNode(name, randColor, pos) {
    cntNode = (name == null) ? ++cntNode : parseInt(name.substr(4));
    name = (name != null) ? name : "node" + cntNode;
    randColor = (randColor.charAt(0) != '#') ? getRandomColor() : randColor;
    var sceneEl = document.querySelector('a-scene');
    var graphEl = sceneEl.querySelector('#graph');
    pos = (pos == null) ? sceneEl.querySelector('a-camera').getAttribute('position') : pos;
    var node = document.createElement('a-sphere');
    node.setAttribute('id', 'node' + cntNode);
    node.setAttribute('color', randColor);
    node.setAttribute('position', {x: pos.x, y: pos.y, z: pos.z});
    node.setAttribute('radius', '.5');
    node.addEventListener('mouseenter', function () {
        if (Delete == false) {    node.setAttribute('color', '#FFF');}
        else {    node.setAttribute('color', '#ff3f3f')}});
    node.addEventListener('mouseleave', function () {
    node.setAttribute('color', randColor);
    });
    node.addEventListener('click', function () {
        if (Delete == true) {
            var id = node.getAttribute('id');
            delAllInstOf(id);
            Delete = false;
        }
        else {
            node.setAttribute('color', '#4dff4f');
            if (node1 == "") {
                node1 = node.getAttribute('id');
            }
            else {
                node2 = node.getAttribute('id');
                addEdge();
                node1 = "";
                node2 = "";
            }
        }
    });
            graph["nodes"]['node'+cntNode] = {
                "position":{x: pos.x, y: pos.y, z: pos.z},
                "color":node.getAttribute('color')
        }
    graphEl.appendChild(node);
}
function addEdge(name, nodeA, nodeB) {
    if (node1 == node2 && name == null) {
        console.log("Cannot make self-loops")
    }
    else {
        var sceneEl = document.querySelector('a-scene');
        var graphEl = sceneEl.querySelector('#graph');
        var n0 = nodeA
            , n1 = nodeB;
        if (nodeA == null || nodeB == null) {
            n0 = document.getElementById(node1).getAttribute('position');
            n1 = document.getElementById(node2).getAttribute('position');
        }
        var edge = document.createElement('a-entity');
        edge.setAttribute('meshline', {
            path: n0.x + " " + n0.y + " " + n0.z + " ," + n1.x + " " + n1.y + " " + n1.z
            , lineWidth: 10
            , lineWidthStyler: 1
            , color: '#55575b'
        });
        name = (name == null) ? node1.substr(4) + 'edge' + node2.substr(4) : name;
        edge.setAttribute('id', name);
        graph["edges"][node1.substr(4) + 'edge' + node2.substr(4)] = {
            "A": n0
            , "B": n1
        }
        
        var selectSquare = document.createElement('a-box');
            selectSquare.setAttribute('opacity','.5');
            selectSquare.setAttribute('width','.25');
           selectSquare.setAttribute('height','.25');
            selectSquare.setAttribute('depth','.25');
            selectSquare.setAttribute('color','#FFF');
            selectSquare.setAttribute('visible','false');
            selectSquare.addEventListener('mouseenter',function(){
                if(DeleteEdge){
                    selectSquare.setAttribute('color','#FF3F3f');
                }
            })
            selectSquare.addEventListener('mouseleave',function(){
                selectSquare.setAttribute('color','#FFF');
            })
            selectSquare.addEventListener('click', function(){
                if(DeleteEdge){
                    var id = edge.getAttribute('id');
                    $('#' + id).remove();
                    delete graph['edges'][id];
                    DeleteEdge = false;
                    hideAllSelectCubes();
                }
            })
            selectSquare.setAttribute('position',{x:(n0.x+n1.x)/2,
                                                  y:(n0.y+n1.y)/2,
                                                  z:(n0.z+n1.z)/2});
        edge.appendChild(selectSquare);
        graphEl.appendChild(edge);
    }
}
function delAllInstOf(id) {
    var sceneEl = document.querySelector('a-scene');
    var itemsInGraph = document.getElementById('graph').children;
    var numItems = itemsInGraph.length;
    for (var i = 0; i < itemsInGraph.length; i++) {
        var element = itemsInGraph[i];
        var elId = element.getAttribute('id');
        if (elId.includes('edge')) {
            var nodes = elId.split('edge');
            if (nodes[1] == id.substr(4) || nodes[0] == id.substr(4)) {
                document.getElementById('graph').removeChild(element);
                delete graph["edges"][elId];
                i--;
            }
        }
        else if (elId == id) {
            document.getElementById('graph').removeChild(element);
            delete graph["nodes"][elId];
            i--;
        }
    }
}
function genTextFile() {
    JSONifyNodes();
    var blob = new Blob([JSON.stringify(graph)], {
        type: "text/plain;charset=utf-8"
    });
    saveAs(blob, "graph.txt");
}
function showUploadButton() {
    $('.showAfterClick').css("visibility", "visible");
}
function impTextFile() {
    var fr = new FileReader();
    fr.onload = function () {
        graph = null;
        graph = JSON.parse(this.result);
        console.log(graph);
        processNewGraph();
    }
    fr.readAsText(document.getElementById('openFile').files[0]);
    $('.showAfterClick').css("visibility", "hidden");
}
function processNewGraph() {
    if (graph.hasOwnProperty('edges') && graph.hasOwnProperty('nodes')) {
        $('#graph').empty();
        for (node in graph['nodes']) {
            addNode(node, graph['nodes'][node]['color'], graph['nodes'][node]['position'])
        }
        for (edge in graph['edges']) {
            addEdge(edge, graph['edges'][edge]['A'], graph['edges'][edge]['B']);
        }
    }
    else {
        console.log("Improper JSON Object!")
    }
}
function JSONifyNodes() {
    var graphEl = document.getElementById('graph');
    var graphElChildren = graphEl.children;
    for (var i=0; i<graphElChildren.length;i++){
        if (graphElChildren[i].getAttribute('id').includes('node')){
            console.log(graphElChildren[i].getAttribute('color'));
            graph['nodes'][graphElChildren[i].getAttribute('id')] = {
                "position":graphElChildren[i].getAttribute('position'),
                "color":graphElChildren[i].getAttribute("color")
            }
        }
    }
}