document.querySelector('#alg-prim').addEventListener('click', prim);

//changeEles(algSample.mst);
//ONLY UN-DIRECTED GRAPHS
function prim(event) {
    if (graphState.directed === true) {
        bootbox.confirm({
            size: "small",
            message: "Prim algorithm can only be applied to undirected graph <br> Continuing will make every edge undirected?",
            callback: function (result) {
                if (result) {
                    graphState.directedToggle();
                    runPrim(event);
                } else {
                }
            }
        })
    } else {
        runPrim(event);
    }
    // now graph is undirected
}

function runPrim(event) {
    resetView();
    loadPseudocode('prim');
    eh.enableDrawMode();
    let nodes = cy.nodes();
    let edges = cy.edges();
    let q = new Queue();
        
    let nodeClass = "";
    let edgeClass = "no-arrow ";
    let stepI = document.getElementById('step-i');
    let stepLen = document.getElementById('step-len');
    let stepIi = 0;
    showAlg();

    nodes.forEach(function(node){
        setScratch(node, 'pi', null);
        setScratch(node, 'key', Infinity);
        setScratch(node, 'color', 'white');

        node.classes('white');
        q.enqueue(node);
    })

    edges.forEach(function(edge){
        if(edge.visible()){
            edge.classes('dimmed no-arrow');
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
        edgeClassList += ' no-arrow ';
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
    
    if (!dragNodeEnabled) eh.disableDrawMode();


    let sortedQ = []; // reversed engineered queue
    let prevQ = "empty";
    let currQ = formatQueueToHtml(q);    
    algQ.parentElement.style.display = 'none';
    prevQ = currQ;
    algQ.innerHTML = prevQ;

    let prevX = 0;
    let currX = 0;
    algX.innerHTML = formatXToHtml(currX);


    let lastLines = [0];
    algSteps.flush();

    algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: "0", to: ++stepIi }, {}));
    algSteps.add(new StepFrame(algQ.parentElement.style, { name: 'display', from: 'none', to: 'initial' }, {}, true));
    algSteps.add(new StepFrame(algX.parentElement.style, { name: 'display', from: 'none', to: 'initial' }, {}, true));
    algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [1, 5] }));
    lastLines = [1, 5];
    
    
    // get source node OR set default to be first one
    let r = cy.filter(':selected').nodes()[0] || nodes[0];
    setScratch(r, 'key', 0);
    
    let minKeyCallback = function(acc, cur){
        if( getScratch(acc, 'key') <= getScratch(cur, 'key') )
            return acc;
        else
            return cur;
    }

    
    while(!q.isEmpty() ){
        let u = q.extract(minKeyCallback);
        sortedQ.push(u);

        
        setScratch(u, 'color', 'black');
        algSteps.add(new StepFrame(u, {}, { name: 'classes', from: nodeClass.concat('white'), to: nodeClass.concat('black') }));
        algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [6, 11] }));
        lastLines = [6, 11];
        
        algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));

        if(u!=r){
            let pi = u.edgesWith( getScratch(u,'pi')  ).min(function(x){return x.data('weight')}).ele;
            algSteps.add(new StepFrame(pi, {}, { name: 'classes', from: edgeClass.concat('dimmed'), to: edgeClass.concat('grey') }, true));
            breakpoints.edges[pi.id()][1] = edgeClass.concat('grey');
            
            prevX = currX;
            currX +=Number(pi.data('weight'))
        }
 
        u.neighborhood().nodes().forEach(function(v){
            // minEdge if multigraph
            let minEdge = u.edgesWith(v).min(function (x) {
                return x.data('weight')
            });

            if( getScratch(v, 'color') == 'white' && 
            minEdge.value < getScratch(v,'key') ){
                setScratch(v,'pi',u);
                setScratch(v,'key', minEdge.value);
            }
        });

        prevQ = currQ;
        currQ = formatQueueToHtml(q);
        algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}, true));
        
        algSteps.add(new StepFrame(algX, { name: 'innerHTML', from: formatXToHtml(prevX), to: formatXToHtml(currX) }, {}, true));
    }
    prevQ = currQ;
    currQ = formatQueueToHtml(q);
    stepLen.innerHTML = algSteps.duration;
    stepI.innerHTML = 0;

    // start of breakpoints final
    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId][1] = nodedata.color;
    })
    
    breakpoints.other['final'] = () => {
        highlightLines( 6,11 );
        algQ.parentElement.style.display = 'initial';
        algX.parentElement.style.display = 'initial';
        algQ.innerHTML = currQ;
        algX.innerHTML = formatXToHtml(currX);


        stepI.innerHTML = stepIi;
        algSteps.ptr = algSteps.stepList.length-1;
    }
    // end of breakpoints final

    function formatQueueToHtml(q, delimeter = ' | ') {
        let s = q.toArray(function (x) {
            let tmp = getScratch(x, 'key');
            return `${getName(x)} : ${tmp == "Infinity" ? ("&infin;") : tmp}`;
            //return `${getName(x)} ( &#120587; = ${tmp=="Infinity" ? ("&infin;") : tmp})`;
        }).join(delimeter);
        if(s=="")s="empty";
        return `<span  class="col-sm-2 pl-0"> Queue: </span><span class="col-sm-9">${s}</span>`;
    }

    function formatXToHtml(x) {
        return `<span  class="col-sm-2 pl-0"> <i>w(T)</i> =  </span><span class="col-sm-9">${x}</span>`;
    }
    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}, true));
}
