document.querySelector('#alg-kruskal').addEventListener('click', kruskal);

// can run on multigraphs
//ONLY UN-DIRECTED GRAPHS
//proposition: add setid->color function to show which findset node belongs
function kruskal(event) {
    if (graphState.directed === true) {
        emptyfyAlg();
        bootbox.confirm({
            size: "small",
            message: "Kruskal algorithm can only be applied to undirected graph <br> Continuing will make every edge undirected?",
            callback: function (result) {
                if (result) {
                    graphState.directedToggle();
                    runKruskal(event);
                } else {
                }
            }
        })
    } else {
        runKruskal(event);
    }
}

function runKruskal(event) {
    resetView();
    loadPseudocode('kruskal');
    eh.enableDrawMode();
    let nodes = cy.nodes();
    let edges = cy.edges();
    let findset = {};


    let nodeClass = "";
    let edgeClass = "no-arrow ";
    let stepI = document.getElementById('step-i');
    let stepLen = document.getElementById('step-len');
    let stepIi = 0;
    showAlg();

    nodes.forEach(function(node){
        setScratch(node, 'set', node.id() );
        node.classes('white');

        findset[node.id()] = cy.collection();
        findset[node.id()] = findset[node.id()].add(node);
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

    if(!dragNodeEnabled)eh.disableDrawMode();
    
    
    
    // algQ holds values for the set A content
    algQ.parentElement.style.display = 'none';
    let lastLines = [0];
    algSteps.flush();

    // Include lexicographical order on node id
    edges = edges.sort( function(a,b){
        let aw = a.data('weight');
        let bw = b.data('weight');
        if(aw == bw){
            let s;
            let t;
            
            s = a.source().id();
            t = a.target().id()
            let ai = ( s < t ) ? s.concat(t) : t.concat(s);
            
            s = b.source().id();
            t = b.target().id()
            let bi = ( s < t ) ? s.concat(t) : t.concat(s);

            if( ai < bi ){
                return -1;
            }else{
                return 1;
            }

        }else
            return aw-bw;
    });

    // Simplified version (better performance)
    // edges = edges.sort( function(a,b){
    //     return a.data('weight') - b.data('weight');
    // });
    
    let A = cy.collection();
    let prevQ = "empty";
    let currQ = formatQueueToHtml(A);
    prevQ = currQ;
    algQ.innerHTML = prevQ;

    let prevX = 0;
    let currX = 0;
    algX.innerHTML = formatXToHtml(currX);


    algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: "0", to: ++stepIi }, {}));
    algSteps.add(new StepFrame(algQ.parentElement.style, { name: 'display', from: 'none', to: 'initial' }, {}, true));
    algSteps.add(new StepFrame(algX.parentElement.style, { name: 'display', from: 'none', to: 'initial' }, {}, true));
    algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [1, 4] }));
    lastLines = [1, 4];
    let onetime = true;
    edges.forEach(function (edge) {
        let u = edge.source();
        let v = edge.target();
        let uset = getScratch(u, 'set');
        let vset = getScratch(v, 'set');

        // same as edge.connectedNodes()
        if( uset != vset ){
            A = A.add(edge);
            prevQ = currQ;
            currQ = formatQueueToHtml(A);
            prevX = currX;
            currX += Number(edge.data('weight')) || 0;

            colorEdge(edge, 'dimmed');

            breakpoints.edges[edge.id()][1] = edgeClass.concat('grey');
            algSteps.add(new StepFrame(edge, {}, { name: 'classes', from: edgeClass.concat('dimmed'), to: edgeClass.concat('grey =') }));
            algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}, true));
            algSteps.add(new StepFrame(algX, { name: 'innerHTML', from: formatXToHtml(prevX), to: formatXToHtml(currX) }, {}, true));
            algSteps.add(new StepFrame(stepI, { name: 'innerHTML', from: stepIi, to: ++stepIi }, {}, true));
            if (onetime) {
                onetime = false;
                algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [5,8] }));
                lastLines = [5, 8];
            }
                        
            findset[vset].forEach( (ele)=>{
                setScratch(ele, 'set', uset);
                findset[uset] = findset[uset].add(ele);
            });
            findset[vset] = undefined;
        }
    })

    prevQ = currQ;
    currQ = formatQueueToHtml(A);
    algSteps.add(new StepFrame(null, {}, {}, true, { name: highlightLines, argsFrom: lastLines, argsTo: [9] }));
    lastLines = [9];
    
    stepLen.innerHTML = algSteps.duration;
    stepI.innerHTML = 0;
    algSteps.add(new StepFrame(algQ, { name: 'innerHTML', from: prevQ, to: currQ }, {}));

    // start of breakpoints final
    nodes.forEach(function (node) {
        let nodedata = getScratch(node);
        let nodeId = node.id();
        breakpoints.nodes[nodeId][1] = nodedata.color;
    })
    
    breakpoints.other['final'] = () => {
        highlightLines([9]);
        algQ.parentElement.style.display = 'initial';
        algX.parentElement.style.display = 'initial';
        algQ.innerHTML = currQ;
        algX.innerHTML = formatXToHtml(currX);
        stepI.innerHTML = stepIi;
        algSteps.ptr = algSteps.stepList.length-1;
    }
    // end of breakpoints final

    function formatQueueToHtml(A, byName = true) {
        let s = "";
        if (byName) {
            A.forEach((e) => {
                s+= `{${getName(e.source())},${getName(e.target())}}, `
            })
        } else {
            A.forEach((e) => {
                s+= `{${e.source().id()},${e.target().id()}}, `
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

    function formatXToHtml(x) {
        return `<span  class="col-sm-2 pl-0"> <i>w(T)</i> =  </span><span class="col-sm-9">${x}</span>`;
    }
}
