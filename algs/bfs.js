document.querySelector('#alg-bfs').addEventListener('click', bfs);


function bfs(event) {
    resetView();
    loadPseudocode('bfs');
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
        setScratch(node, 'd', Infinity);
        setScratch(node, 'pi', "null");
        node.classes('white');
    })
    
    edges.forEach(function(edge){
        let edgeClassList = 'dimmed';
        if(!orientationInclusive)edgeClassList+=' no-arrow ';
        //there should be no invisible edges though
        if(edge.visible()){
            edge.classes(edgeClassList);
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

    // get source node OR set default to be first one
    let s = cy.filter(':selected').nodes()[0] || nodes[0];
    if(s.selected() === false)s.select()
    setScratch(s, 'color', 'grey');
    setScratch(s, 'd', 0);
    
    let q = new Queue();
    let prevQ = "empty";
    let currQ = formatQueueToHtml(q);
    
    algQ.parentElement.style.display = 'none';
    let lastLines = [0];
    algSteps.flush();
        
    algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [1, 8] }));
    lastLines = [1, 8];
    algSteps.add(new StepFrame(s, {}, { name: 'classes', from: nodeClass.concat('white'), to: nodeClass.concat('grey') }, true));
    algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: "0", to: ++stepIi }, {}, true));

    q.enqueue(s);
    prevQ = currQ;
    algQ.innerHTML = prevQ;
    currQ = formatQueueToHtml(q);
    algSteps.add(new StepFrame(algQ.parentElement.style, { name: 'display', from: 'none', to: 'initial' }, {}, true));
    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}));
    algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
    algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [9] }));
    lastLines = [9];
    while(! q.isEmpty() ){
        let u = q.dequeue();
        algSteps.add(new StepFrame(u, {}, { name: 'classes', from: nodeClass.concat('grey'), to: nodeClass.concat('grey current') }));
        algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [11, 17] }));
        lastLines = [11, 17];
        prevQ = currQ;
        currQ = formatQueueToHtml(q);
        algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}, true));
        algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
        let d = getScratch(u, 'd');
        let uAdj = (orientationInclusive) ? u.outgoers(): u.neighborhood();
        uAdj.nodes().forEach(function(v){
            if( getScratch(v, 'color') == 'white'){
                setScratch(v, 'color', 'grey');
                setScratch(v, 'd', d+1);
                setScratch(v, 'pi', u.id());
                q.enqueue(v);

                let edgeFromUtoV = (orientationInclusive) ? u.edgesTo(v)[0] : u.edgesWith(v)[0];

                breakpoints.edges[edgeFromUtoV.id()][1] = edgeClass.concat('grey');
                algSteps.add(new StepFrame(v, {}, { name: 'classes', from: nodeClass.concat('white'), to: nodeClass.concat('grey') }, true));
                algSteps.add(new StepFrame(edgeFromUtoV, {}, { name: 'classes', from: edgeClass.concat('dimmed'), to: edgeClass.concat('grey') }, true));
            }
        })
        setScratch(u, 'color', 'black');

        algSteps.add(new StepFrame(u, {}, { name: 'classes', from: nodeClass.concat('grey current'), to: nodeClass.concat('black') }));
        
        algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [18] }));
        lastLines = [18];
        prevQ = currQ;
        currQ = formatQueueToHtml(q);
        algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}, true));
        algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
    }
    prevQ = currQ;
    currQ = formatQueueToHtml(q);
    
    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}));
    stepLen.innerHTML = algSteps.duration;
    stepI.innerHTML = 0;
    
    // start of breakpoints final

    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId][1] = nodedata.color;
    })
    
    breakpoints.other['final'] = () => {
        highlightLines([18]);
        algQ.parentElement.style.display = 'initial';
        algQ.innerHTML = currQ;
        stepI.innerHTML = stepIi;
        algSteps.ptr = algSteps.stepList.length-1;
    }
    // end of breakpoints final
}