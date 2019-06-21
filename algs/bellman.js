document.querySelector('#alg-bellman').addEventListener('click', bellman);

//changeEles(algSample.sssp);

//designed for directed graphs
function bellman(event) {
    if (graphState.directed === false) {
        emptyfyAlg();
        bootbox.confirm({
            message: "Bellman-Ford algorithm can only be applied to directed graph <br> Continuing will duplicate every undirected edge into two directed?",
            callback: function (result) {
                if (result) {
                    graphState.directedToggle(true);
                    runBellman(event);
                } else {
                }
            }
        })
    } else {
        runBellman(event);
    }
}
function runBellman(event){
    resetView();
    loadPseudocode('bellman');
    // init-single-source
    eh.enableDrawMode();
    let nodes = cy.nodes();
    let edges = cy.edges();


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





    if(!dragNodeEnabled)eh.disableDrawMode();
    algQ.parentElement.style.display = 'none';
    algSteps.flush();


    let s = cy.filter(':selected').nodes()[0] || nodes[0];
    if(s.selected() === false)s.select()
    setScratch(s, 'd', 0);

    
    // end-of-init-single-source

    for( let i = 0; i<nodes.length; i++){
        edges.forEach( function( edge ){
            relax( edge.source(), edge.target(), edge);
        });
    }


    let ans = true;
    edges.forEach( function( edge ){
        let u = edge.source();
        let v = edge.target();
        let w = edge.data('weight');

        let ud = getScratch(u, 'd');
        let vd = getScratch(v, 'd');

        if (vd > ud + w) {
            ans = false;
        }
    });


    stepLen.innerHTML = algSteps.duration;
    stepI.innerHTML = 0;

    // start of breakpoints final
    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId][1] = nodedata.color;
    })
    breakpoints.other['final'] = () => {
        algQ.parentElement.style.display = 'none';
        stepI.innerHTML = stepIi;
        algSteps.ptr = algSteps.stepList.length-1;
    }
    // end of breakpoints final

    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: "", to: "" }, {}));
    return ans;


    function relax( u, v, edge ){
        let ud = getScratch(u, 'd');
        let vd = getScratch(v, 'd');
        let w = edge.data('weight')
        if (vd > ud + w) {
            algSteps.add(new StepFrame(edge, {}, { name: 'classes', from: edgeClass.concat('dimmed'), to: edgeClass.concat('grey') }));
            algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from:  (stepIi===0) ? "0": stepIi, to: ++stepIi }, {}, true));
            breakpoints.edges[edge.id()][1] = edgeClass.concat('grey');

            // delete previous v.pi->v edge dimmed
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
        }
    }
    
}

function noNegativeCycle() {
    function cycleRelax( u, v, edge ){
        let ud = getScratch(u, 'negcycle-d');
        let vd = getScratch(v, 'negcycle-d');
        let w = edge.data('weight')
        if( vd > ud + w){
            setScratch(v, 'negcycle-d', w+ud);
            setScratch(v, 'negcycle-pi', u);
        }
    }
    
    // init-single-source
    eh.enableDrawMode();
    let nodes = cy.nodes();
    let edges = cy.edges();

    nodes.forEach(function(node){
        setScratch(node, 'negcycle-d', 0);
        setScratch(node, 'negcycle-pi', null);
    })

    if(!dragNodeEnabled)eh.disableDrawMode();

    
    let s = nodes[0];

    for( let i = 0; i<nodes.length; i++){
        edges.forEach( function( edge ){
            cycleRelax( edge.source(), edge.target(), edge);
        });
    }

    let ans = {
        val: true
    }
    edges.forEach( function( edge ){
        let u = edge.source();
        let v = edge.target();
        let w = edge.data('weight');

        let ud = getScratch(u, 'negcycle-d');
        let vd = getScratch(v, 'negcycle-d');

        if (vd > ud + w) {
            console.log(u.data('name'), v.data('name'));
            ans.val =  false;
        }
    });

    return ans.val;
}

