const settingsTab = document.getElementById('menu-settings-tab');
const selectLayout = document.getElementById('layout-setting');
const checkMultigraph = document.getElementById('is-multigraph');
const checkDirected = document.getElementById('is-directed');
const checkWeight = document.getElementById('has-weight');
const checkNegative = document.getElementById('has-negative');
const checkCycle = document.getElementById('has-cycle');
const checkLoop = document.getElementById('self-loop');

const checkBoxList = [
    checkMultigraph,
    checkNegative,
    checkLoop,
    checkDirected,
    checkWeight,
    checkCycle
];

settingsTab.addEventListener('click', function (e) {
    graphState.update();
});

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM content loaded");
    graphState.update();
}, false);


var graphState = {
    multiGraph: false,
    negativeWeight: false,
    selfLoop: false,
    directed: false,
    hasWeight: false, // weight is not ignored (there are other than 1 values)
    hasCycle: false,
    update: function () {
        this.multiGraph = false;
        this.negativeWeight = false
        this.selfLoop = false
        this.directed = false
        this.hasWeight =  false
        this.hasCycle = false
        eh.enableDrawMode(); 
        let nodes = cy.nodes();
        let edges = cy.edges();
        if (!dragNodeEnabled) eh.disableDrawMode();

        for (i = 0; i < edges.length; i++){
            let edge = edges[i];
            // edge: (s) -> (t)
            let s = edge.source();
            let t = edge.target();
            let w = edge.data('weight');

            if (w < 0)
                this.negativeWeight = true;
            if (edge.hasClass('no-label') === false){
                this.hasWeight = true;
            }
            if (s.id() === t.id())
                this.selfLoop = true;
            if (edge.hasClass('no-arrow') === false){
                this.directed = true;
            }
            if (s.edgesTo(t).length > 1)
                this.multiGraph = true;
            if (!orientationEnabled && s.edgesWith(t).length > 1)
                this.multiGraph = true;
            
            // multigraph has no loops
            // add cycle test
        };

        checkMultigraph.checked = this.multiGraph === true;
        checkDirected.checked = this.directed === true;
        checkCycle.checked = this.hasCycle === true;
        checkLoop.checked = this.selfLoop === true;
        checkNegative.checked = this.negativeWeight === true;
        checkWeight.checked = this.hasWeight === true;

        if (this.hasWeight===true) {
            eh.enableDrawMode();
            let edges = cy.edges();
            if (!dragNodeEnabled) eh.disableDrawMode();

            edges.forEach(function (edge) {
                edge.toggleClass('no-label',false);
            })
        } else {
            eh.enableDrawMode();
            let edges = cy.edges();
            if (!dragNodeEnabled) eh.disableDrawMode();

            edges.forEach(function (edge) {
                edge.toggleClass('no-label',true);
            })
        }
    },
    selfLoopToggle: function () {
        if (this.selfLoop) {
            eh.enableDrawMode();
            let nodes = cy.nodes();
            if (!dragNodeEnabled) eh.disableDrawMode();
            nodes.forEach(function (node) {
                cy.remove(node.edgesTo(node));
            });
            this.selfLoop = false;
            // hide checkbox
            outdateAdjacency();
            this.update();
        }
    },
    negativeWeightToggle: function (val = 0) {
        if (this.negativeWeight) {
            let eles = cy.elements('edge[weight < 0]');
            if (val === null) {
                cy.remove(eles);
            } else if (val===-1) {
                negativeToDirected();
            } else {
                eles.forEach(function (edge) {
                    edge.data('weight', val);
                })
            }
            this.negativeWeight = false;
            // hide checkbox
            outdateAdjacency();
            this.update();
        }
    },
    hasWeightToggle: function (val=1) {
        eh.enableDrawMode();
        let nodes = cy.nodes();
        let edges = cy.edges();
        if (!dragNodeEnabled) eh.disableDrawMode();

        edges.forEach(function (edge) {
            edge.data('weight', val);
            edge.toggleClass('no-label');
        })
        this.hasWeight = !this.hasWeight;
        outdateAdjacency();
        this.update();
    },
    directedToggle : function (duplicating = false) {
        cy.edges().toggleClass('no-arrow');
        this.directed = !this.directed;
        orientationEnabled = this.directed;

        if (orientationEnabled) {
            cy.style()
            .selector('.eh-preview, .eh-ghost-edge')
                .style({
                'target-arrow-shape': 'triangle'
                })
        } else {
            cy.style()
            .selector('.eh-preview, .eh-ghost-edge')
                .style({
                'target-arrow-shape': 'none'
                })
        }


        if (duplicating && this.directed) {
            cy.edges().forEach(function (edge) {
                let uid = edge.source().id();
                let vid = edge.target().id();
                let val = edge.data('weight');
                if (uid !== vid) {
                    cy.add([{
                        group: "edges",
                        data: { source: vid, target: uid, weight: Number(val) }
                    }])
                }
            });
        }
        outdateAdjacency();
        this.update();
    },
    multiGraphToggle : function (option="min") {
        if (this.multiGraph) {
            eh.enableDrawMode();
            let nodes = cy.nodes();
            let edges = cy.edges();
            if (!dragNodeEnabled) eh.disableDrawMode();
            
            let N = nodes.length;

            for (let i = 0; i < N; i++){
                let s = nodes[i];
                for (let j = 0; j < N; j++){
                    if (!orientationEnabled && j<i) {
                        continue;
                    }
                    let t = nodes[j];
                    let edgeSet = (orientationEnabled) ? s.edgesTo(t) : s.edgesWith(t);
                    let M = edgeSet.length;
                    if (M <= 1) continue;

                    let chosen = edgeSet[0];
                    let val = chosen.data('weight');

                    //rnd option
                    if (option === 'rnd') {
                        let chosenI = Math.floor(Math.random() * M);
                        chosen = edgeSet[chosenI];
                    } else {
                        for (let i = 1; i < M; i++) {
                            if (option === "min") {
                                if (edgeSet[i].data('weight') < val) {
                                    val = edgeSet[i].data('weight');
                                    chosen = edgeSet[i];
                                }
                            } else if (option === "max") {
                                if (edgeSet[i].data('weight') > val) {
                                    val = edgeSet[i].data('weight');
                                    chosen = edgeSet[i];
                                }
                            } else if (option === "sum") {
                                val += edgeSet[i].data('weight');
                                if (this.hasWeight === false) val = 1;
                                chosen.data('weight', val);
                            }
                        }
                    }
                    edgeSet.difference(chosen).remove();
                    
                }
            }
            this.multiGraph = false;
            outdateAdjacency();
            this.update();
        }
    }
}

let singlePromiseToChangeLayoutOnDrag = true;
selectLayout.addEventListener('change', function (e) {
    let x = selectLayout.value;
    cy.layout({ name: x }).run();
    if (singlePromiseToChangeLayoutOnDrag) {
        singlePromiseToChangeLayoutOnDrag = false;
        cy.pon('drag', 'node').then(function (event) {
            console.log("a node was moved, changing the layout to preset (promise)");
            selectLayout.value = 'preset';
            singlePromiseToChangeLayoutOnDrag = true;
        });
    }
})


function negativeToDirected() {
    let eles = cy.elements('edge[weight < 0]');
    eles.forEach(function (edge) {
        let s = edge.source().id();
        let t = edge.target().id();
        let val = -edge.data('weight');
        
        edge.data('weight', Number(val));
        edge.move({
            source: t,
            target: s,
        })
    })
}

//FIXME: add NODE postion save
function downloadGraph(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

document.getElementById('export-gml').addEventListener('click', function (e) {
    downloadGraph(cy.graphml(), '*.graphml', `application/graphml+xml`);
})

document.getElementById('export-json').addEventListener('click', function (e) {
    downloadGraph(JSON.stringify(cy.json()), '*.json', `application/json`);
})



document.getElementById('export-png').addEventListener('click', function (e) {
    downloadGraph(cy.png({ 'output': 'blob' }), "*.png", 'image/png');    
})

document.getElementById('export-jpg').addEventListener('click', function (e) {
    downloadGraph(cy.jpg({'output': 'blob'}),"*.jpg",'image/jpg');    
})

var jsonImport = document.getElementById('import-json-file');
var gmlImport = document.getElementById('import-gml-file');

jsonImport.addEventListener('change', function (e) {
    if (this.files.length === 0) return;
    else {
        let fr = new FileReader();
        fr.onload = function (e) {
            let str = this.result;
            cy.remove(cy.nodes());
            cy.json(JSON.parse(str));
            selectLayout.value = "preset";
            selectLayout.dispatchEvent(new Event('change'));
            updateVarsOnImport();
        }
        fr.onerror = function (e) {
            console.log("error reading file");
        }
        fr.readAsText(this.files[0], "UTF-8");
        this.value = ""; // reset the input
    }   
})

gmlImport.addEventListener('change', function (e) {
    if (this.files.length === 0) return;
    else {
        let fr = new FileReader();
        fr.onload = function (e) {
            let str = this.result;
            console.log(str);
            cy.remove(cy.nodes());
            cy.graphml(str);
            // cy.layout({ name: "cose" }).run();
            selectLayout.value = "cose";
            selectLayout.dispatchEvent(new Event('change'));
            updateVarsOnImport();
        }
        fr.onerror = function (e) {
            console.log("error reading file");
        }
        fr.readAsText(this.files[0], "UTF-8");
        this.value = ""; // reset the input
    }   
})



checkDirected.addEventListener('click', function (e) {
    if (!this.checked) {
        bootbox.confirm({
            size: "small",
            message: "Are you sure you want to treat every edge as an undirected one?",
            callback: function (result) { 
                if (result) {
                    graphState.directedToggle();
                } else {
                    checkDirected.checked = true;
                }
            }  
        })
    } else {
        bootbox.prompt({
            title: "Choose an action",
            inputType: 'radio',
            inputOptions: [
            {
                text: 'Show arrows, set original edge orientation',
                value: '1',
            },
            {
                text: 'Replace every unoriented edge with a pair of edges of opposite orientation',
                value: '2',
            }
            ],
            callback: function (result) {
                if (result === null) {
                    e.preventDefault();
                    checkDirected.checked = false;
                } else if (result == 1) {
                    graphState.directedToggle();
                } else if (result == 2) {
                    graphState.directedToggle(true);
                }
                console.log(result);
            }
        });
    }
})

checkNegative.addEventListener('click', function (e) {
    if (this.checked) {
        e.preventDefault();
    }
    else {
        bootbox.confirm({
            title: "Choose an action",
            // size: "small",
            message: `
            <form class="bootbox-form">
            <div class="bootbox-radiobutton-list">
                <div class="form-check radio">
                    <label class="form-check-label">
                        <input onClick="(function(){document.getElementById('negativeInput').disabled = true;})();" class="form-check-input bootbox-input bootbox-input-radio" type="radio" name="bootbox-radio" id="negativeRadio1" value="1">
                        Changed orientation-wise with positive weight
                    </label>
                </div><div class="form-check radio">
                    <label class="form-check-label">
                        <input onClick="(function(){document.getElementById('negativeInput').disabled = true;})();" class="form-check-input bootbox-input bootbox-input-radio" type="radio" name="bootbox-radio" id="negativeRadio2" value="2">
                        Deleted
                    </label>
                </div><div class="form-check radio">
                    <label class="form-check-label">
                        <input onClick="(function(){document.getElementById('negativeInput').disabled = false;})();" class="form-check-input bootbox-input bootbox-input-radio" type="radio" name="bootbox-radio" id="negativeRadio3" value="3">
                        Given new weight value
                    </label>
                </div>
            </div>
            <div class="mt-3">
                <input id="negativeInput" class="bootbox-input bootbox-input-number form-control" autocomplete="off" type="number" min='0' disabled>
            </div>
            </form>`,
            callback: function (result) {
                if (result) {
                    let opt1 = document.getElementById('negativeRadio1').checked;
                    let opt2 = document.getElementById('negativeRadio2').checked;
                    let opt3 = document.getElementById('negativeRadio3').checked;
                    if (opt1) {
                        graphState.negativeWeightToggle(-1);
                    } else if (opt2) {
                        graphState.negativeWeightToggle(null);
                    } else if (opt3) {
                        let val = Number(document.getElementById('negativeInput').value);
                        if (val < 0) val = 0;
                        graphState.negativeWeightToggle(val);
                    }
                } else {
                    checkNegative.checked = true;
                }
            }
        })
    }
})

checkWeight.addEventListener('click', function (e){
    if (this.checked) {
        //e.preventDefault();
        bootbox.prompt({
            title: "Show weight labels and set them to",
            inputType: 'number',
            callback: function (result) {
                if (result) {
                    let val = Number(result);
                    graphState.hasWeightToggle(val);
                }else{
                    checkWeight.checked = false;
                }
            }
        });
    } else {
        bootbox.confirm({
            size: "small",
            message: "Are you sure you want to delete/equalize every edge weight?",
            callback: function (result) { 
                if (result) {
                    graphState.hasWeightToggle();
                } else {
                    checkWeight.checked = true;
                }
            }  
        })
    }
})

checkLoop.addEventListener('click', function (e){
    if (this.checked) {
        e.preventDefault();
    } else {
        bootbox.confirm({
            size: "small",
            message: "Do you want to delete all self-loop edges?",
            callback: function (result) { 
                if (result) {
                    graphState.selfLoopToggle();
                } else {
                    checkLoop.checked = true;
                }
            }  
        })
    }
})

//FIXME: modal with option prompt
checkMultigraph.addEventListener('click', function (e){
    if (this.checked) {
        e.preventDefault();
    } else {
        bootbox.prompt({
            title: "Choose an action",
            inputType: 'radio',
            inputOptions: [
            {
                text: 'Keep min weight value edge, delete others',
                value: '1',
            },
            {
                text: 'Keep max weight value edge, delete others',
                value: '2',
            },
            {
                text: 'Randomly choose a single edge to keep from same source-target set',
                value: '3',
            },
            {
                text: 'Sum-up values for the same source-target edges',
                value: '4',
            }
            ],
            callback: function (result) {
                if (result === null) {
                    e.preventDefault();
                    checkMultigraph.checked = true;
                } else if (result == 1) {
                    graphState.multiGraphToggle("min");
                } else if (result == 2) {
                    graphState.multiGraphToggle("max");
                } else if (result == 3) {
                    graphState.multiGraphToggle("rnd");
                } else if (result == 4) {
                    graphState.multiGraphToggle("sum");
                }
                console.log(result);
            }
        });
    }
})

checkCycle.addEventListener('click', function (e) {
    if (this.checked) {
        e.preventDefault();
    } else {
        // graphState.cycleToggle();
    }
});




function randomizeWeights(_from, _to) {
    let from = Number(_from);
    let to = Number(_to);
    let edges = cy.edges();
    let len = edges.size();
    for (let i = 0; i < len; i++){
        let val = (getRandomInt(from, to));
        edges[i].data('weight', val);
    }
}

function getRandomInt(_min, _max) {
    let min = Math.ceil(_min);
    let max = Math.floor(_max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function updateVarsOnImport() {
    eh.enableDrawMode(); 
    let nodes = cy.nodes();
    let edges = cy.edges();
    if (!dragNodeEnabled) eh.disableDrawMode();


    // MAKES ORIENTATION EVEN IN GRAPH
    // IMPORTING GRAPH MIGHT CHANGE SOME ITS IRREGULARITIES
    // EX: IT CAN ONLY BE IN A SINGLE STATE OF ORIENTATION AND LABELING

    orientationEnabled = true;
    if (edges.length != 0 && edges[0].hasClass('no-arrow')) {
        orientationEnabled = false;
    }
    cy.edges().toggleClass('no-arrow', !orientationEnabled);

    let withLabels = true;
    if (edges.length != 0 && edges[0].hasClass('no-label')) {
        withLabels = false;
    }
    cy.edges().toggleClass('no-label', !withLabels);


    graphState.directed = orientationEnabled;
    graphState.hasWeight = withLabels;


    graphState.multiGraph = false;
    graphState.hasCycle = false;
    graphState.selfLoop = false;
    graphState.negativeWeight = false;
    
    for (i = 0; i < edges.length; i++){
        let edge = edges[i];
        // edge: (s) -> (t)
        let s = edge.source();
        let t = edge.target();
        let w = edge.data('weight');

        if (w < 0)
            graphState.negativeWeight = true;
        if (s.id() === t.id())
            graphState.selfLoop = true;
        if (s.edgesTo(t).length > 1)
            graphState.multiGraph = true;
        if (!orientationEnabled && s.edgesWith(t).length > 1)
            graphState.multiGraph = true;
    };

    checkMultigraph.checked = graphState.multiGraph === true;
    checkDirected.checked = graphState.directed === true;
    checkCycle.checked = graphState.hasCycle === true;
    checkLoop.checked = graphState.selfLoop === true;
    checkNegative.checked = graphState.negativeWeight === true;
    checkWeight.checked = graphState.hasWeight === true;
    
    resetGenerator();
    updateAdjList();
    updateAdjMatrix();
    outdateAdjacency(false);
    emptyfyAlg();
}

function emptyfyAlg() {
    loadPseudocode('none');
    let stepI = document.getElementById('step-i');
    let stepLen = document.getElementById('step-len');
    let algQ = document.getElementById('alg-queue');
    let algX = document.getElementById('alg-extra');

    stepI.innerHTML = 0;
    stepLen.innerHTML = 0;
    algQ.parentElement.style.display = 'none';
    algX.parentElement.style.display = 'none';
    if(typeof algSteps!== 'undefined') algSteps.flush();
}
emptyfyAlg();

function showAlg() {
    algQ.style.display = ''
    algQ.parentElement.style.display = ''
}