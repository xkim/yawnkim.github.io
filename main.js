var cy = cytoscape({
  container: document.getElementById('cy'),
  layout: {
    name: 'grid'
  },
  style: [
    {
      selector: 'node',
      style: {
        'background-color': 'white',
        //'background-color': 'data(faveColor)', // can be binded to property data(name) or scratch(name)
        //'content': 'data(id)',
        'label': 'data(name)',
        //'font-weight': 'bold',
        'color': 'white',
        'text-outline-color': 'black',
        'text-outline-width': '1px',
        'text-valign': 'center',
        'text-halign': 'center',
        'z-index': '0',
        'border-color': 'black',
        'border-width': '0.3px',
        'border-style': 'solid',
      }
    },

    {
      selector: 'node:selected',
      style: {
        'border-color': 'red',
        'border-width': '2px',
        'border-style': 'dotted',
        'z-index': '1'
      }
    },

    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'label': 'data(weight)',
        //'text-rotation' : 'autorotate',
        'text-wrap': 'ellipsis',
        'text-max-width': '50px',
        'text-outline-color': 'white',
        'text-outline-width': '1px',
        'border-width': 12,
        'border-color': 'red',
        'z-index': '0'
      }
    },

    // some style for the extension

    {
      selector: '.eh-handle',
      style: {
        'background-color': 'red',
        'width': 12,
        'height': 12,
        'shape': 'ellipse',
        'overlay-opacity': 0,
        'border-width': 12, // makes the handle easier to hit
        'border-opacity': 0,
        'content' : ""
      }
    },

    {
      selector: '.eh-hover',
      style: {
        'background-color': 'red'
      }
    },

    { // source node
      selector: '.eh-source',
      style: {
        'border-width': 2,
        'border-color': 'red',
      }
    },

    { // target node
      selector: '.eh-target',
      style: {
        'border-width': 2,
        'border-color': 'grey'
      }
    },

    { // target node/edge preview
      selector: '.eh-preview, .eh-ghost-edge',
      style: {
        'background-color': 'red',
        'line-color': 'red',
        'target-arrow-color': 'red',
        'source-arrow-color': 'red',
        // 'target-arrow-shape': 'triangle'
      }
    },

    { // ghost line from source to cursor
      selector: '.eh-ghost-edge.eh-preview-active',
      style: {
        'opacity': 0
      }
    },
    {
      selector: 'core',
      style: {
        'active-bg-color': 'black',
      }
    },
    {
      selector: 'edge:selected',
      style: {
        // 'line-color': 'blue',
        // 'target-arrow-color': 'blue',
        'z-index': '1'
      }
    },
  ].concat(elesStyleFromJson),
   
  // ZOOM INTERACTION
  wheelSensitivity: 0.1,
  
});



var adjListUpToDate = false;
var adjMatrixUpToDate = false;

function outdateAdjacency(negated=true) {
  adjListUpToDate = !negated;
  adjMatrixUpToDate = !negated;
  console.log("adjacency list/matrix were set to " + !negated);
  let adjMatrixTab = document.getElementById('matrix-representation-tab');
  let adjListTab = document.getElementById('list-representation-tab');

  if (hasClass(adjMatrixTab, 'active')) {
    updateAdjMatrix()
    console.log("matrix view is in focus, so i update it");
  }
  if (hasClass(adjListTab, 'active')) {
    updateAdjList()
    console.log("list view is in focus, so i update it");
  }
}


// ADDING EDGE EXTENTION
var eh = cy.edgehandles({
  loopAllowed: function (node) {
    // return whether edges from itself to itself are allowed
    return true;
  },
  complete: function( sourceNode, targetNode, addedEles ){
    // set default weight of an edge to 1
    addedEles.data('weight', 1);

    if (!orientationEnabled) {
      addedEles.toggleClass('no-arrow');
    } 
    
    if (hasClass(settingsTab, 'active')) {
      setTimeout(()=>{graphState.update()}, 100);
      // graphState.update();
    }
    outdateAdjacency();
  },
  
});

// also resets color and alg
document.querySelector('#reset-view').addEventListener('click', resetView);
function resetView() {
  eh.enableDrawMode();
  let nodes = cy.nodes();
  let edges = cy.edges();
  let orientationInclusive = orientationEnabled;

  nodes.forEach(function(node){
      node.classes();
  })
  edges.forEach(function (edge) {
    let edgeClassList = "";
    if(!orientationInclusive)edgeClassList=' no-arrow';
    if(edge.visible()){
        edge.classes(edgeClassList);
    }
  });
  if (!dragNodeEnabled) eh.disableDrawMode();
  
  algSteps.flush();
  initBreakpoints();
  emptyfyAlg();
  let x = document.getElementById('layout-setting').value;
  cy.layout({ name: x }).run();
  algQ.parentElement.style.display = 'none';
  algQ.innerHTML = "empty";
  algX.parentElement.style.display = 'none';
  algX.innerHTML = "";
};

function setLoopAllowed(val) {
  eh.options.loopAllowed = () => { return (val === true) };
}




var dragNodeEnabled = false; // always inverted, wrong initial naming, maybe change later
var graphEditEnabled = true;
var orientationEnabled = true;

document.querySelector('#toggle-dragNode').addEventListener('click', function() {
  dragNodeEnabled  = !dragNodeEnabled;
  dragNodeEnabled ? eh.enableDrawMode() : eh.disableDrawMode();
  this.style.textDecoration = dragNodeEnabled ? "line-through" : "none";
});


document.querySelector("#toggle-graphEdit").addEventListener('click',function(){
  graphEditEnabled = !graphEditEnabled;
  graphEditEnabled ? function () { cy.on('tap', addNodeOnTap); eh.enable(); }() : function () { cy.removeListener('tap', addNodeOnTap); eh.disable(); }();
  this.style.textDecoration = !graphEditEnabled ? "line-through" : "none";
});



var nid;
function resetGenerator() {
  nid = function*(){
    let startingValue = 0;
    //while (cy.$id("n".concat(startingValue)).length !== 0) startingValue++;
    let Idpattern = "n";
    cy.nodes(`[id^="${Idpattern}"]`).forEach(function (node) {
      let currValue = Number(node.id().slice(Idpattern.length));
      startingValue = currValue >= startingValue ? (currValue + 1) : startingValue;
    });
    while (true) {
      yield "n".concat(startingValue++);
    }
  }();
};
resetGenerator();

function addNodeOnTap(event){
  var evtTarget = event.target;
  if( evtTarget === cy ){
    let idInt = nid.next().value;
    
    let node = cy.add([
      {group: "nodes", data:{ id: idInt, name: idInt.slice(1) }, position: event.position}
    ])
    console.log('added a new node with id ' + idInt);
    addSelectOption(node);
    outdateAdjacency();
  } else {
    console.log( 'clicked on ' + evtTarget.id() );
  }
}

// Create new node on canvas tap
cy.on('tap', addNodeOnTap);

// Disable multiple selection
cy.on('select', 'node, edge', e => {
  cy.elements().not(e.target).unselect();
});


function getId( selector ){
  return selector.id();
}

function getName( selector ){
  return selector.data('name');
}

function changeEles(elesJson){
  cy.remove(cy.nodes());
  cy.add(elesJson);
  cy.fit();
}



var weightEditContainer = document.getElementById('weight-edit-container');
var weightEditSource = document.getElementById("weight-source");
var weightEditTarget = document.getElementById("weight-target");
var weightEditValue = document.getElementById("weight-value");
var weightEditConfirm = document.getElementById("weight-confirm");
var weightEditCancel = document.getElementById("weight-cancel");
var weightEditDelete = document.getElementById("weight-delete");
var weightEditTab = document.getElementById("menu-edit-tab");

weightEditTab.addEventListener('click', function (e) {
  updateSelectOptions();
  bindWeightSelect();
  bindNodeSelect();
})

function bindWeightSelect(selected = cy.filter(':selected')) {
  if (selected.edges().length === 1) {
    let edge = selected.edges()[0];
    let uid = edge.source().id();
    let vid = edge.target().id();
    let w = edge.data('weight');
    if (typeof w === "undefined") w = "";
    weightEditSource.value = uid;
    weightEditTarget.value = vid;
    weightEditValue.value = w;
  } 
}

function bindNodeSelect(selected = cy.filter(':selected')) {
  if (selected.nodes().length === 1) {
    let node = selected.nodes()[0];
    let uid = node.id();
    let uname = node.data('name');
    if (typeof uname === "undefined") uname = "";
    nodeEditId.value = uid;
    nodeEditName.value = uname;
  }
}


cy.on('select', 'edge', function(e){
  bindWeightSelect(e.target);
  nodeEditContainer.style.display = 'none';
  weightEditContainer.style.display = 'block';
})

cy.on('tap', 'edge', function (e) {
  eh.hide();
})


var nodeEditId = document.getElementById("node-id");
var nodeEditName = document.getElementById("node-name");
var nodeEditConfirm = document.getElementById("node-confirm");
var nodeEditCancel = document.getElementById("node-cancel");
var nodeEditDelete = document.getElementById("node-delete");
var nodeEditContainer = document.getElementById('node-edit-container');
cy.on('select', 'node', function(e){
  bindNodeSelect(e.target);
  nodeEditContainer.style.display = 'block';
  weightEditContainer.style.display = 'none';
})

weightEditValue.addEventListener('input', function(e){
  weightEditValue.value = weightEditValue.value.replace(/[^0-9\,\.\-\+]+/g, '');
});

weightEditSource.addEventListener('change', selectEdgeFromOption)

weightEditTarget.addEventListener('change', selectEdgeFromOption)

nodeEditId.addEventListener('change', selectNodeFromOption)

function selectEdgeFromOption(e) {
  let uid = weightEditSource.value;
  let vid = weightEditTarget.value;
  let u = cy.getElementById(uid);
  let v = cy.getElementById(vid);
  let edgeFromUtoV = (orientationEnabled) ? u.edgesTo(v)[0] : u.edgesWith(v)[0];
  if (typeof edgeFromUtoV==='undefined')
    cy.elements().unselect()
  else {
    edgeFromUtoV[0].select();
  } 
}

function selectNodeFromOption() {
  let uid = nodeEditId.value;
  let u = cy.getElementById(uid);
  if (typeof u==='undefined')
    cy.elements().unselect()
  else {
    u.select();
  } 
}

function selectNode(nid=-1){
  // default select first in an array
  if (nid < 0) {
    let u = cy.nodes()[0];
    u.select();
  } else {
    let u = cy.getElementById(nid);
    u.select();
  }
}

// CONFIRM WEIGHT EDITION
weightEditConfirm.addEventListener('click', function (e) {
  let val = weightEditValue.value;
  let uid = weightEditSource.value;
  let vid = weightEditTarget.value;
  
  let edge = cy.$(':selected').edges()[0]; 
  
  if (val.match(/^[-+]?[0-9]*(\.|\,)?[0-9]+$/)) {
    let str = "Are you sure you want to change the weight to \"" + val + "\"?";
    if (typeof edge === 'undefined')
      str = `Do want to create a new edge (${uid},${vid}) with weight "${val}"?`;
    bootbox.confirm({
      size: "small",
      message: str,
      callback: function (result) {
        if(result){
          if (typeof edge==='undefined') {
            cy.add([
              { group: "edges", data: { source: uid, target: vid, weight: Number(val) } }
            ]).select();

          } else {
            edge.data('weight', Number(val));
          }
          graphState.update();
          outdateAdjacency();
        }
      }
    })
  } else {
    bootbox.alert({
      message: "Only real number values are allowed.",
      size: 'small'
    });
  }
});

// CANCEL WEIGHT EDITION
weightEditCancel.addEventListener('click', function (e) {
  weightEditValue.value = "";
  bindWeightSelect();
})

// DELETE SELECTED EDGE
weightEditDelete.addEventListener('click', function (e) {
  let edge = cy.$(':selected').edges()[0]; 
  if (typeof edge === 'undefined') {
    bootbox.alert({
      message: "Nothing to delete, edge does not exist",
      size: 'small'
    });
  } else {
    confirmDeleteEdge(); 
  }
})

function confirmDeleteEdge() {
  bootbox.confirm({
    size: "small",
    message: "Are you sure you want to delete selected edge?",
    callback: function (result) { 
      if (result) {
        let edge = cy.$(':selected').edges()[0]; 
        cy.remove(edge);
        outdateAdjacency();
      }
    }  
  })
}

// CONFIRM NODE CHANGE
nodeEditConfirm.addEventListener('click', function (e) {
  let val = nodeEditName.value;
  let str = "Are you sure you want to change the node name to \"" +val + "\"?";
  bootbox.confirm({
    size: "small",
    message: str,
    callback: function (result) {
      if (result) {
        let node = cy.$(':selected').nodes()[0]; 
        node.data('name', val);      
      }
    }
  })
});

// CANCEL NODE CHANGE
nodeEditCancel.addEventListener('click', function (e) {
  bindNodeSelect();
})

// DELETE SELECTED NODE
nodeEditDelete.addEventListener('click', function (e) {
  confirmDeleteNode();
})

function confirmDeleteNode() {
  bootbox.confirm({
    size: "small",
    message: "Are you sure you want to delete selected node?",
    callback: function (result) { 
      if (result) {
        let node = cy.getElementById(nodeEditId.value) || cy.$(':selected').nodes()[0];
        cy.remove(node);
        updateSelectOptions();
        selectNode();
        outdateAdjacency();
      } else {
        selectNode(nodeEditId.value);
      }
    }  
  })
}

//combined for both node and weight edition
function updateSelectOptions(withName = true) {
  let weightUpdatedHtml = "";
  let nodeUpdatedHtml = "";
  let tmp = getNodeData();
  let nodeId = tmp.nodeIdList;
  let nodeName = tmp.nodeNameList;
  let n = nodeId.length;
  for (let i = 0; i < n; i++){
    weightUpdatedHtml += `<option value = "${nodeId[i]}"> ${nodeId[i] + (withName ? (" (" + nodeName[i] + ")") : "")} </option>`;
    nodeUpdatedHtml += `<option value = "${nodeId[i]}"> ${nodeId[i]} </option>`;
  }
  weightEditSource.innerHTML = weightUpdatedHtml;
  weightEditTarget.innerHTML = weightUpdatedHtml;
  nodeEditId.innerHTML = nodeUpdatedHtml;
}

function addSelectOption(node,withName=true) {
  let id = node.data('id');
  let name = node.data('name');

  let weightOption = document.createElement('option');
  let nodeOption = document.createElement('option');
  weightOption.text = id + (withName ? (" (" + name + ")") : "");
  weightOption.value = id;
  nodeOption.text = id;
  nodeOption.value = id;
  weightEditSource.appendChild(weightOption);
  weightEditTarget.appendChild(weightOption.cloneNode(true));
  nodeEditId.appendChild(nodeOption);
}


function getNodeData() {
  eh.enableDrawMode(); // PREVENT EXTRA REDNODE-FOR-DRAWING-EDGE FROM APPEARRING
  let nodes = cy.nodes();
  let edges = cy.edges();
  if (!dragNodeEnabled) eh.disableDrawMode(); // SETS BACK EDITION TO UNCHANGED STA
  
  let n = nodes.length;
  let nodeIdList = [];
  let nodeNameList = [];
  for(let i=0; i<n; i++) {
    nodeIdList[i] = nodes[i].data('id');
    nodeNameList[i] = nodes[i].data('name');
  }
  
  return { nodeIdList, nodeNameList };
}


// DISPLAY FULL EDGE LABEL ON HOVER
cy.on('mouseover', 'edge', function(event) {
  var edge = event.target;
  edge.style('text-max-width', '1000px')
}).on('mouseout', 'edge', function (event) {
  var edge = event.target;
  edge.style('text-max-width', '50px');
});

document.getElementById('cy').addEventListener('mouseout', function (e) {
  eh.hide()
})

var editTab = document.getElementById('menu-edit-tab')

// ALTERNATIVE TO JQUERY HASCLASS METHOD
function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className);
  else
    return  new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
}


function test1() {
  bootbox.prompt({
      title: "Edges with negative weight will be:",
      inputType: 'radio',
      inputOptions: [
      {
          text: 'Changed orientation-wise with positive weight',
          value: '1',
      },
      {
          text: 'Deleted',
          value: '2',
      },
      {
          text: 'Given new weight value',
          value: '3',
      }
      ],
      callback: function (result) {
          if (result === null) {
              e.preventDefault();
          } else {
              
          }
          console.log(result);
      }
  });
}


function toggleLabel() {
  cy.edges().toggleClass('no-label');
}

// UPDATES SELECT OPTIONS ON ELEMENTS CREATE/DELETE
function updateHtmlView(){
  updateSelectOptions();
}


// UPDATES OTHER REPRESENTATION CORRESPONDING TO AN ACTION ON ELEMENTS CREATE/DELETE/EDIT
function updateRepresenatationView() {
  
}

// ANIMATE ALG STEPS
var algAnimationTimeoutHandle = null;
function pauseAnimation() {
  clearTimeout(algAnimationTimeoutHandle);
  algAnimationTimeoutHandle = null;
}
function playAnimation() {
  if (algAnimationTimeoutHandle === null) {
    timedCount();
  }
}

function timedCount() {
  if (algSteps.isEnd()) {
    clearInterval(algAnimationTimeoutHandle)
    algAnimationTimeoutHandle = null;
    stepPauseIcon(true);
  } else {
    algSteps.play();
    let aSpeed = document.getElementById('animation-speed');
    let delay = (Number(aSpeed.max) - Number(aSpeed.value)) * 1000 + 500;
    algAnimationTimeoutHandle = setTimeout(timedCount, delay);
  }
}

document.getElementById('animation-speed').addEventListener('change', function () {
  if (algAnimationTimeoutHandle) {
    pauseAnimation();
    playAnimation();
  }
})

var breakpoints;

function initBreakpoints() {
  breakpoints = {
    'nodes': {},
    'edges': {},
    'other': {},
    'jump': () => { return 0; },
  };  
}
initBreakpoints();

var stepStop = document.getElementById('step-stop');
var inPlayMode;
stepStop.addEventListener('click', function (e) {
  if (inPlayMode) {
    pauseAnimation();
    stepPauseIcon(true);
  }
  breakpoints.jump(0);
})
var stepEnd = document.getElementById('step-end');
stepEnd.addEventListener('click', function (e) {
  if (inPlayMode) {
    pauseAnimation();
    stepPauseIcon(true);
  }
  breakpoints.jump(1);
})

var stepPause = document.getElementById('step-pause');
stepPause.addEventListener('click', function (e) {
  if (this.innerHTML === '<i class="fa fa-pause"></i>') {
    stepPauseIcon(true);
    pauseAnimation();
  } else {
    stepPauseIcon(false);
    playAnimation();
  }
})


function stepPauseIcon(willBePlay=false) {
  if (willBePlay) {
    stepPause.innerHTML = '<i class="fa fa-play"></i>'
    inPlayMode = false;
    removeClass(stepPause, 'btn-outline-warning');
    addClass(stepPause, 'btn-outline-success');
  } else {
    stepPause.innerHTML = '<i class="fa fa-pause"></i>'
    inPlayMode = true;
    removeClass(stepPause, 'btn-outline-success');
    addClass(stepPause, 'btn-outline-warning');
  }
}


function removeClass(sel, className) {
  let reg = new RegExp("\\b"+className+"\\b", "g")
  sel.className = sel.className.replace(reg, "");
}

function addClass(sel, name) {
  let arr = sel.className.split(" ");
  if (arr.indexOf(name) == -1) {
    sel.className += " " + name;
  }
}

