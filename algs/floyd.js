document.querySelector('#alg-floyd').addEventListener('click', floyd);


//  solves all pairs shortest path problem on DIRECTED NOT MULTIGgraph
//  negative edges are allowed
//  no negative cycles are present
function floyd(event) {
    let neg = !noNegativeCycle();
    let dir = graphState.directed === false;
    let mul = graphState.multiGraph === true;
    if (neg || dir || mul) {
        emptyfyAlg();
        let neg = graphState.negativeWeight === true;
        let msg = `Floyd-Warshall algorithm can only be applied to ${dir ? "directed " : ""} graph ${neg ? "with no negative-weight cycles" : ""}`
        msg += `<br> Continuing will ${dir ? "duplicate every undirected edge into two directed" : ""}`
        msg += `${mul && dir ? ", " : ""}`
        msg += `${mul ? "delete extra edges of the same source-target, keeping the ones with the mininmal weight" : ""}`
        msg += `${(mul||dir)&&neg ? ", " : ""}${neg ? "delete edges which might cause negative cycle" : ""}?`
        bootbox.confirm({
            // size: "small",
            message: msg,
            callback: function (result) {
                if (result) {
                    if(graphState.directed === false)
                        graphState.directedToggle(true);
                    if (neg) {
                        graphState.negativeWeightToggle(null);
                    }
                    if (graphState.multiGraph === true) {
                        graphState.multiGraphToggle("min");
                    }
                    runFloyd(event);
                } else {
                }
            }
        })
    } else {
        runFloyd(event);
    }
}
function runFloyd(event){
    resetView();
    loadPseudocode('floyd');
    eh.enableDrawMode();
    let nodes = cy.nodes();
    let edges = cy.edges();
    let q = new Queue();
    let s = cy.collection();

    //default pre-defined classes
    let nodeClass = ""; 
    let edgeClass = ""; 
    let stepI = document.getElementById('step-i');
    let stepLen = document.getElementById('step-len');
    let stepIi = 0;
    showAlg();

    nodes.forEach(function(node){
        node.classes('white');
    })

    edges.forEach(function(edge){
        if(edge.visible()){
            edge.classes('dimmed');
        }
    });

    /**********************************************************/
    initBreakpoints();
    //start of breakpoints initial 
    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId] = [nodedata.color,nodedata.color];
    })
    edges.forEach(function (edge) {
        let edgeClassList = 'dimmed';
        let edgedata = edgeClassList;
        breakpoints.edges[edge.id()] = [edgedata,edgedata];
    });
    breakpoints.other['initial'] = () => {
        highlightLines([0]);
        algX.parentElement.style.display = 'none';
        algQ.parentElement.style.display = 'none';
        algQ.innerHTML = "empty";
        stepI.innerHTML = "0";
        algSteps.ptr = 0;
    }
    breakpoints.jump = function (side = 0) {
        if (side !== 0) side = 1;
        for (id in breakpoints.nodes) {
            let data = breakpoints.nodes[id][side];
            let node = cy.getElementById(id);
            node.classes(nodeClass.concat(data || 'white'));
        }
        for (id in breakpoints.edges) {
            let data = breakpoints.edges[id][side];
            let edge = cy.getElementById(id);
            edge.classes(edgeClass.concat(data));
        }
        if (side === 0) {
            breakpoints.other['initial']();
        } else {
            breakpoints.other['final']();
        }
    }
    //end of breakpoints initial
    /**********************************************************/

    if (!dragNodeEnabled) eh.disableDrawMode();
    algQ.parentElement.style.display = 'none';
    algSteps.flush();

    
    let n = nodes.length;
    let W = [];
    for(let i=0; i<n; i++) {
        W[i] = [];
        for(let j=0; j<n; j++) {
            W[i][j] = Infinity;
        }
    }

    // assistance data for inner function formatWtoHtml
    let idName = {}; // Maps nodes id to its name
    let nodesNames = [];

    nodes.forEach(function (x) {
        idName[x.id()] = x.data('name');
        nodesNames.push(x.data('name'));
    })
    let nodesLen = nodes.length;
    // end of assistance data

    nodes.forEach( function(x,i){
        nodes.forEach(function(y,j){
            if(i==j)
                W[i][j] = 0;
            else
                W[i][j] = x.edgesTo(y).data('weight') || Infinity;
        })
    })
    
    let D = [];
  
    D[0] = W;
    console.log(D[0]);

    let prevX = formatWtoHtml(W,"0");
    let currX = prevX;
    algX.innerHTML = currX;
    let lastLines = [0];

    algSteps.add(new StepFrame(algX, { name: 'innerHTML', from: prevX, to: prevX }, {}));
    algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from:  (stepIi===0) ? "0": stepIi, to: ++stepIi }, {}, true));
    algSteps.add(new StepFrame(algX.parentElement.style, {
        name: 'display', from: 'none', to: 'initial'
    }, {}, true));
    algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [1,2] }));
    lastLines=[1,2]
    for(let k=1;k<=n;k++){
        D[k] = [];
        for(let i=0;i<n;i++)D[k][i]=[];
        for(let i=0;i<n;i++){
            for(let j=0;j<n;j++){
                D[k][i][j] = Math.min( D[k-1][i][j], (D[k-1][i][k-1] + D[k-1][k-1][j]));
            }
        }
        console.log(D[k]);
        
        prevX = currX;
        currX = formatWtoHtml(D[k],k);
        algSteps.add(new StepFrame(algX, { name: 'innerHTML', from: prevX, to: currX }, {}));
        algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
        algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [3,7] }));
        lastLines = [3,7];
    }
    
    // start of breakpoints final
    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId][1] = nodedata.color;
    })
    breakpoints.other['final'] = () => {
        highlightLines(8);
        algQ.parentElement.style.display = 'none';
        algX.parentElement.style.display = 'initial';
        algX.innerHTML = currX;
        stepI.innerHTML = stepIi;
        algSteps.ptr = algSteps.stepList.length-1;
    }
    // end of breakpoints final

    stepLen.innerHTML = algSteps.duration;
    stepI.innerHTML = 0;
    algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [8] }));
    lastLines = [8];
    algSteps.add(new StepFrame(algX, { name: 'innerHTML', from: currX, to: currX }, {}));

    function formatWtoHtml(A, k) {
        let len = nodesLen;
        let s = `<table class="table table-sm ">
                <thead>
                    <tr>
                    <th scope="col">D<sup>(${k})</sup></th>`
        for (let i = 0; i < len; i++){
            s+=`<th scope="col">${nodesNames[i]}</th>`
        }
        s += `</tr></thead>`
        s += `<tbody>`
            
        for (let i = 0; i < len; i++){
            s += `<tr><th scope="row">${i + 1}</th>`
            for (let j = 0; j < len; j++){
                s+=`<td>${A[i][j]===Infinity ? "&infin;" : A[i][j]}</td>`
            }
            s+=`</tr>`
        }
        s += `</tbody></table>`
        return s;
    }
}