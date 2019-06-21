var algVlog = new Vlog();
var algQ = document.getElementById('alg-queue');
var algX = document.getElementById('alg-extra');
var adjList = document.getElementById('adj-list');
var adjMatrix = document.getElementById('adj-matrix');
var adjListTab = document.getElementById('list-representation-tab');
var adjMatrixTab = document.getElementById('matrix-representation-tab');

adjListTab.addEventListener('click', (e) => {
    if (!adjListUpToDate) {
        updateAdjList();
        console.log("updated adj list");
    }
})

adjMatrixTab.addEventListener('click', (e) => {
    if(!adjMatrixUpToDate){
        updateAdjMatrix();
        console.log("updated adj martix");
    }
})


function getScratch ( eles, name ){
    if( eles.scratch('_alg') === undefined ){
        eles.scratch('_alg', {});
    }
    let scratchPad = eles.scratch('_alg');
    return (name===undefined) ? scratchPad : scratchPad[name];
}

function setScratch( eles, name, val){
    let scratchPad = getScratch( eles );
    scratchPad[name] = val;
    eles.scratch('_alg', scratchPad);
}

function colorNode(nodeSelector, colorValue){
    setScratch(nodeSelector, 'color', colorValue);
}

function colorEdge(edgeSelector, colorValue, insertive=false){
    if(insertive)
        algVlog.insert( toV(edgeSelector, colorValue) );
    else
        algVlog.add( toV(edgeSelector, colorValue) );
}

function highlightLine(from, to, insertive=false, colour = 'yellow', exclusive = true){
    to = (typeof to !== 'undefined') ?  to : from;
    
    let s = `#pseudocode ol>li:nth-child(n+${from}):nth-child(-n+${to})`;
    let anteS = `#pseudocode ol>li:nth-child(-n+${from-1}) `;
    let postS = `#pseudocode ol>li:nth-child(n+${to+1}) `;
    
    let first = true;
    if(insertive){
        first = false;
    }else{
        algVlog.add( toV(document.querySelector(s),'background-color',colour));
    }
    document.querySelectorAll(s).forEach( (sel)=>{
        if(first){
            first=false;
        }else{
            algVlog.insert( toV(sel, 'background-color',colour));
        }
    })
    
    if(exclusive){
        document.querySelectorAll(anteS).forEach( (sel)=>{
           algVlog.insert( toV(sel, 'background-color', 'inherit'));
        })
        document.querySelectorAll(postS).forEach( (sel)=>{
            algVlog.insert( toV(sel, 'background-color','inherit'));
         })
    }
}

// NOT MULTIGRAPH MEANS THAT EACH NODE CAN ONLY APPEAR ONCE A LIST
function getAdjList(isMultigraph = false, weightInclusive = false) {
    eh.enableDrawMode(); // PREVENT EXTRA REDNODE-FOR-DRAWING-EDGE FROM APPEARRING
    let nodes = cy.nodes();
    let edges = cy.edges();
    if(!dragNodeEnabled)eh.disableDrawMode(); // SETS BACK EDITION TO UNCHANGED STATE
    let arr = {};

    nodes.forEach((u) => {
        // IF ORIENTATIONDISABLED THEN ADJACENCY IGNORES EDGE DIRECTION
        let uAdj = (orientationEnabled) ? u.outgoers() : u.neighborhood();
        arr[u.data("id")] = [];
        let uList = arr[u.data("id")];
        if (!isMultigraph) {
            uAdj.nodes().forEach(function (v) {
                uList.push(v.data("id"))
            })
        } else {
            uAdj.edges().forEach(function (uv) {
                let v = uv.target();
                if (u === v)
                    v = uv.source();
                uList.push(v.data("id"))
            })
        }
    });
    return arr;
}


// labelBy = {"id", "name", some other node data}
function updateAdjList(labelById = true, weightInclusive = false) { 
    adjListUpToDate = true;
    updatedHtml = "";
    let list = getAdjList();
    for (let uid in list) {
        updatedHtml += "<div>";
        updatedHtml += `<span class="adj-list-source"> ${ (labelById) ? uid : cy.$id(uid).data('name') }</span> <div class="adj-list-cell"></div>`;
        updatedHtml += `<div class="adj-list-arrow">&#9472;&#9472;&#9472;&#9472;&#9658;</div>`;
        if (list[uid].length === 0) {
            updatedHtml += `<div class = "adj-list-cell"><big>&empty;</big></div>`;
        } else {
            list[uid].forEach((vid) => {
                let extraData = ""
                if(graphState.hasWeight){   
                    let weightListReduced = (prev, el)=>{ 
                        if (!prev)
                            return el.data('weight');
                        else {
                            prev += ", " + el.data('weight');
                            return prev;
                        }
                    }
                    extraData += " : ";
                    extraData += graphState.directed ? cy.$id(uid).edgesTo(cy.$id(vid)).reduce(weightListReduced) : cy.$id(uid).edgesWith(cy.$id(vid)).reduce(weightListReduced);
                }
                console.log(extraData);
                updatedHtml += `<div class = "adj-list-cell">&nbsp;${ ((labelById) ? vid : cy.$id(vid).data('name')).concat(extraData) }&nbsp;</div>`;
            })
        }    
        updatedHtml += "</div>";
    }
    adjList.innerHTML = updatedHtml;
}

function getAdjMatrix() {
    eh.enableDrawMode(); // PREVENT EXTRA REDNODE-FOR-DRAWING-EDGE FROM APPEARRING
    let nodes = cy.nodes();
    let edges = cy.edges();
    if (!dragNodeEnabled) eh.disableDrawMode(); // SETS BACK EDITION TO UNCHANGED STA
    
    let n = nodes.length;
    let v = [];
    let w = []; //weight function W: V -> V
    for(let i=0; i<n; i++) {
        w[i] = [];
        v[i] = nodes[i].data('id');
    }

    // WARNING: test support of MULTI-(DI)-GRAPHS
    nodes.forEach( function(u,i){
        nodes.forEach(function (v, j) {
            // IF ORIENTATIONDISABLED THEN W_ij IGNORES EDGE DIRECTION
            let uv = (orientationEnabled) ? u.edgesTo(v) : u.edgesWith(v);
            
            if (uv.length === 0) {
                if (i == j) {
                    // w[i][j] = 0;
                    w[i][j] = Infinity;
                } else {
                    // no edges sets w to INFINITY
                    w[i][j] = Infinity;
                }
            } else if (uv.length > 1) {
                // change to string for loading optimization if typeof Number is not used elsewhere in future
                w[i][j] = [];
                for (let k = 0; k < uv.length; k++){
                    w[i][j].push(uv[k].data('weight'));
                }
            } else {
                // if there is an edge that has no weight set it to UNDEFINED
                w[i][j] = uv.data('weight') || undefined;
            }
                
            //}
        })
    })

    return { v, w };    
}

function updateAdjMatrix(labelById = true) {
    adjMatrixUpToDate = true;
    let updatedHtml = "";
    let tmp = getAdjMatrix();
    let v = tmp.v;
    let w = tmp.w;
    
    updatedHtml += `<div class="adj-matrix-row"><div class="adj-matrix-cell">&nbsp;</div>`;
    for (let j = 0; j < v.length; j++){
        updatedHtml += `<div class="adj-matrix-cell"><span>${ (labelById) ? v[j] : cy.$id(v[j]).data('name') } </span></div>`;
    }
    updatedHtml += `</div>`;

    for (let i = 0; i < v.length; i++){
        updatedHtml += `<div class="adj-matrix-row">`;
        updatedHtml += `<div class="adj-matrix-cell"><span>${ (labelById) ? v[i] : cy.$id(v[i]).data('name') } </span></div>`;
        for (let j = 0; j < v.length; j++){
            if (typeof w[i][j] === "undefined") {
                w[i][j] = "?";
            }else if (w[i][j] === Infinity) {
                w[i][j] = graphState.hasWeight ? "&infin;" : "0";
            }else if (Array.isArray(w[i][j])) {
                w[i][j] = w[i][j].join('; ');
            }
            updatedHtml += `<div class="adj-matrix-cell"><span>${ w[i][j] }</span></div>`;
        }
        updatedHtml += `</div>`;
    }
    adjMatrix.innerHTML = updatedHtml;
}


var stepPlay = document.getElementById('step-play');
var stepPause = document.getElementById('step-pause');
var stepRewind = document.getElementById('step-rewind');

stepPlay.addEventListener('click', algPlay)
stepRewind.addEventListener('click', algRewind)