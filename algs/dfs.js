document.querySelector('#alg-dfs').addEventListener('click', dfs);

function dfs(event) {
    resetView();
    loadPseudocode('dfs');
    eh.enableDrawMode();
    let nodes = cy.nodes();
    let edges = cy.edges();
    let orientationInclusive = orientationEnabled;

    //default pre-defined classes
    let nodeClass = ""; 
    let edgeClass = orientationInclusive ? "" : " no-arrow "; 
    let stepI = document.getElementById('step-i');
    let stepLen = document.getElementById('step-len');
    let stepIi = 0;
    showAlg();

    nodes.forEach(function(node){
        setScratch(node, 'color', 'white');
        setScratch(node, 'pi', null);
        node.classes('white');
    })

    
    edges.forEach(function(edge){
        let edgeClassList = 'dimmed';
        if(!orientationInclusive)edgeClassList+=' no-arrow ';
        if(edge.visible()){
            edge.classes(edgeClass.concat(' dimmed'));
        }
    });

    initBreakpoints();
    //start of breakpoints initial 
    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId] = [nodedata.color,nodedata.color];
    })
    edges.forEach(function (edge) {
         let edgeClassList = 'dimmed';
        if (!orientationInclusive) edgeClassList += ' no-arrow ';
        let edgedata = edgeClassList;
        breakpoints.edges[edge.id()] = [edgedata,edgedata];
    });
    breakpoints.other['initial'] = () => {
        highlightLines([0]);
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


    if(!dragNodeEnabled)eh.disableDrawMode();
    
    algQ.parentElement.style.display = 'none';
    algSteps.flush();

    
    let time = 0;
    nodes.forEach(function(u){
        if (getScratch(u, 'color') == 'white') {
            dfsVisit(u);
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
    
    function dfsVisit(u){
        time = time + 1;
        setScratch(u, 'd', time);
        setScratch(u, 'color', 'grey');

        algSteps.add(new StepFrame(u, {}, { name: 'classes', from: nodeClass.concat('white'), to: nodeClass.concat('grey') }));
        algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: (stepIi===0) ? "0": stepIi, to: ++stepIi }, {}, true));
        
        u.outgoers().nodes().forEach(function(v){
            if( getScratch(v, 'color') == 'white'){
                setScratch(v, 'pi', u);
                let edgeFromUtoV = (orientationEnabled) ? u.edgesTo(v)[0] : u.edgesWith(v)[0];
                
                breakpoints.edges[edgeFromUtoV.id()][1] = edgeClass.concat('grey');

                algSteps.add(new StepFrame(edgeFromUtoV, {}, { name: 'classes', from: edgeClass.concat('dimmed'), to: edgeClass.concat('grey') }));
                algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));

                dfsVisit(v);
            }
        })
        
        
        setScratch(u, 'color', 'black');
        time = time + 1;
        setScratch(u, 'f', time);

        algSteps.add(new StepFrame(u, {}, { name: 'classes', from: nodeClass.concat('grey'), to: nodeClass.concat('black') }));
        algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
    }
    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: "", to: "" }, {}));
}


