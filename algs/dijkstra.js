document.querySelector('#alg-dijkstra').addEventListener('click', dijkstra);

// weightened directed graphs with non-negative edges
changeEles(algSample.sssp);

function dijkstra(event) {
    if (graphState.directed === false || graphState.negativeWeight === true) {
        emptyfyAlg();
        let dir = (graphState.directed === false);
        let neg = (graphState.negativeWeight === true);
        let both = dir && neg;
        let msg = `Dijkstra algorithm can only be applied to ${dir ? "directed " : ""} graph ${neg ? "in which all edge weights are non-negative" : ""}.`
        msg+=   `<br> Continuing will ${dir ? "duplicate every undirected edge into two directed" : ""}${both ? ", ": ""}${neg ? "delete edges which weight is negative":""}?`
        bootbox.confirm({
            message: msg,
            callback: function (result) {
                if (result) {
                    if(graphState.directed === false)
                        graphState.directedToggle(true);
                    if (graphState.negativeWeight === true)
                        graphState.negativeWeightToggle(null);
                    runDijkstra(event);
                } else {
                }
            }
        })
    } else {
        runDijkstra(event);
    }
}
function runDijkstra(event){
    resetView();
    loadPseudocode('dijkstra');
    // init-single-source
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
        setScratch(node, 'd', Infinity);
        setScratch(node, 'pi', null);
        
        node.classes('white');
        q.enqueue(node);
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
        breakpoints.nodes[nodeId] = [nodedata.color,'white'];
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

    let r = cy.filter(':selected').nodes()[0] || nodes[0];
    setScratch(r, 'd', 0);

    let prevQ = "empty";
    let currQ = formatQueueToHtml(q);    
    algQ.parentElement.style.display = 'none';
    prevQ = currQ;
    algQ.innerHTML = prevQ;

    let prevX = formatXToHtml(s);
    let currX = formatXToHtml(s);
    algX.innerHTML = currX;
    

    let minKeyCallback = function(acc, cur){
        if( getScratch(acc, 'd') <= getScratch(cur, 'd') )
            return acc;
        else
            return cur;
    }
    
    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: prevQ }, {}));
    algSteps.add(new StepFrame(algX, { name: 'innerHTML', from: prevX, to: prevX }, {}, true));
    algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from:  (stepIi===0) ? "0": stepIi, to: ++stepIi }, {}, true));
    
    algSteps.add(new StepFrame(algQ.parentElement.style, { name: 'display', from: 'none', to: 'initial' }, {}, true));
    algSteps.add(new StepFrame(algX.parentElement.style, { name: 'display', from: 'none', to: 'initial' }, {}, true));

    

    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}));
    while(! q.isEmpty() ){
        let u = q.extract(minKeyCallback);
        s = s.add(u);

        prevQ = currQ;
        currQ = formatQueueToHtml(q);
        prevX = currX;
        currX = formatXToHtml(s);

        algSteps.add(new StepFrame(u, {}, {
            name: 'classes', from: nodeClass.concat('white'), to: nodeClass.concat('black current')
        },true ));
        algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
        
        algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}, true));
        algSteps.add(new StepFrame(algX, { name: 'innerHTML', from: prevX, to: currX }, {}, true));
        
        u.outgoers().nodes().forEach(function(v){
            let minEdge = u.edgesTo(v).min(function(x){return x.data('weight')});
            relax(u, v, minEdge.ele);
        });
        
        if (q.isEmpty()) {
            algSteps.add(new StepFrame(u, {}, {
                name: 'classes', from: nodeClass.concat('black current'), to: nodeClass.concat('black')
            },true));
        } else {
            algSteps.add(new StepFrame(u, {}, {
                name: 'classes', from: nodeClass.concat('black current'), to: nodeClass.concat('black')
            }));
        }
    }

    stepLen.innerHTML = algSteps.duration;
    stepI.innerHTML = 0;

    // start of breakpoints final
    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId][1] = 'black';
    })
    breakpoints.other['final'] = () => {
        highlightLines([0]);
        algQ.parentElement.style.display = 'initial';
        algX.parentElement.style.display = 'initial';
        algQ.innerHTML = currQ;
        algX.innerHTML = currX;
        stepI.innerHTML = stepIi;
        algSteps.ptr = algSteps.stepList.length-1;
    }
    // end of breakpoints final

    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: currQ, to: currQ }, {}));


    function relax( u, v, edge ){
        let ud = getScratch(u, 'd');
        let vd = getScratch(v, 'd');
        let w = edge.data('weight')
        if (vd > ud + w) {
            algSteps.add(new StepFrame(edge, {}, { name: 'classes', from: edgeClass.concat('dimmed'), to: edgeClass.concat('grey') }));
            algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
            breakpoints.edges[edge.id()][1] = edgeClass.concat('grey');

            let vpi = getScratch(v, 'pi');
            if(vpi!=null){
                let prevEdge = vpi.edgesTo(v)[0];
                if(vpi!=u){
                    algSteps.add(new StepFrame(prevEdge, {}, { name: 'classes', from: edgeClass.concat('grey'), to: edgeClass.concat('dimmed') }, true));
                    breakpoints.edges[prevEdge.id()][1] = edgeClass.concat('dimmed');
                }
            }
            setScratch(v, 'd', w+ud);
            setScratch(v, 'pi', u);
            prevQ = currQ;
            currQ = formatQueueToHtml(q);
            algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}, true));
        }
    }

    function formatQueueToHtml(q, delimeter = ' | ') {
        let s = q.toArray(function (x) {
            let tmp = getScratch(x, 'd');
            return `${getName(x)} : ${tmp == "Infinity" ? ("&infin;") : tmp}`;
        }).join(delimeter);
        if(s=="")s="&#8709;";
        return `<span  class="col-sm-2 pl-0"> Queue: </span><span class="col-sm-9">${s}</span>`;
    }

    function formatXToHtml(A, byName = true) {
        let s = "";
        if (byName) {
            A.forEach( (x) => {
                s+= `${getName(x)}, `
            })
        } else {
            A.forEach( (e) => {
                s+= `${x.id()}, `
            })
        }
        s = s.substring(0, s.length - 2);

        if (s != "") {
            s = "{ " + s + " }";
        } else {
            s = "&#8709;"
        }
        return `<span  class="col-sm-2 pl-0"> A =  </span><span class="col-sm-9">${s}</span>`;
    }
}

