var cntNode = 0;
var cntEdge = 0;
var node1 = "";
var node2 = "";
var Delete = false;
var graph = {
    "nodes": {}
    , "edges": {}
};

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
    if (vis) {
        axisEl.setAttribute("visible", "false");
    }
    else {
        axisEl.setAttribute("visible", "true");
    }
}

function toggleDelete() {
    if (Delete == true) {
        Delete = false;
    }
    else {
        Delete = true;
    }
}

function addNode(name, randColor, pos) {
    cntNode = (name == null) ? ++cntNode : parseInt(name.substr(4));
    name = (name != null) ? name : "node" + cntNode;
    randColor = (randColor.charAt(0) != '#') ? getRandomColor() : randColor;
    var sceneEl = document.querySelector('a-scene');
    var graphEl = sceneEl.querySelector('#graph');
    var cursorEl = sceneEl.querySelector('a-cursor');
    pos = (pos == null) ? sceneEl.querySelector('a-camera').getAttribute('position') : pos;
    var node = document.createElement('a-sphere');
    node.setAttribute('id', 'node' + cntNode);
    node.setAttribute('material', {
        color: randColor
    });
    node.setAttribute('position', {
        x: pos.x
        , y: pos.y
        , z: pos.z
    });
    node.setAttribute('radius', '.5');
    node.addEventListener('mouseenter', function () {
        if (Delete == false) {
            node.setAttribute('color', '#FFF');
        }
        else {
            node.setAttribute('color', '#ff3f3f')
        }
    });
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
    graph["nodes"][name] = {
        "position": pos
        , "color": randColor
    };
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
                edge.addEventListener('mouseenter', function () {
            if (Delete == true) {
                edge.setAttribute('color', '#ff3f3f');
            }
        });
        edge.addEventListener('mouseleave', function () {
            edge.setAttribute('color', '#55575b');
        });
        edge.addEventListener('click',function(){
            if (Delete == true) {
                var id = node.getAttribute('id');
                $('#'+id).remove();
                delete graph['edges'][id];
                Delete = false;
            }
        });
        name = (name == null) ? node1.substr(4) + 'edge' + node2.substr(4) : name;
        edge.setAttribute('id', name);
        graph["edges"][node1.substr(4) + 'edge' + node2.substr(4)] = {
            "A": n0
            , "B": n1
        }
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
        //for all nodes X, addNode(nodeX.color, nodeX.pos)
        // for all edges Y, addEdge(edgeY.A,edgeY.B)
    }
    else {
        console.log("Improper JSON Object!")
    }
} //FIXME