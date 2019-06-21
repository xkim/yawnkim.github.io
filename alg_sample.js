var algSample={};

algSample.mst = {
  nodes: [
    { data: { id: 'n0',name: 'a' }, position: {x: 100, y:200} },
    { data: { id: 'n1',name: 'b' }, position: {x: 200, y:100} },
    { data: { id: 'n2',name: 'c' }, position: {x: 300, y:100} },
    { data: { id: 'n3',name: 'd' }, position: {x: 400, y:100} },
    { data: { id: 'n4',name: 'e' }, position: {x: 500, y:200} },
    { data: { id: 'n5',name: 'f' }, position: {x: 400, y:300} },
    { data: { id: 'n6',name: 'g' }, position: {x: 300, y:300} },
    { data: { id: 'n7',name: 'h' }, position: {x: 200, y:300} },
    { data: { id: 'n8',name: 'i' }, position: {x: 250, y:200} },
  ],

  edges: [
    { data: { source: 'n0', target: 'n1', weight: 4} },
    { data: { source: 'n1', target: 'n2', weight: 8} },
    { data: { source: 'n1', target: 'n7', weight: 11} },
    { data: { source: 'n0', target: 'n7', weight: 8} },
    { data: { source: 'n7', target: 'n8', weight: 7} },
    { data: { source: 'n7', target: 'n6', weight: 1} },
    { data: { source: 'n6', target: 'n8', weight: 6} },
    { data: { source: 'n8', target: 'n2', weight: 2} },
    { data: { source: 'n2', target: 'n3', weight: 7} },
    { data: { source: 'n2', target: 'n5', weight: 4} },
    { data: { source: 'n6', target: 'n5', weight: 2} },
    { data: { source: 'n3', target: 'n5', weight: 14} },
    { data: { source: 'n3', target: 'n4', weight: 9} },
    { data: { source: 'n5', target: 'n4', weight: 10} }
  ]
};


algSample.sssp = {
  nodes: [
    { data: { id: 'n0',name: 's' }, position: {x: 100, y:200} },
    { data: { id: 'n1',name: 't' }, position: {x: 200, y:100} },
    { data: { id: 'n2',name: 'x' }, position: {x: 400, y:100} },
    { data: { id: 'n3',name: 'z' }, position: {x: 400, y:300} },
    { data: { id: 'n4',name: 'y' }, position: {x: 200, y:300} }
    ],

  edges: [
    { data: { source: 'n0', target: 'n1', weight: 6} },
    { data: { source: 'n0', target: 'n4', weight: 7} },
    { data: { source: 'n1', target: 'n2', weight: 5} },
    { data: { source: 'n1', target: 'n3', weight: -4} },
    { data: { source: 'n3', target: 'n1'}, classes: 'invisible' },
    { data: { source: 'n1', target: 'n4', weight: 8} },
    { data: { source: 'n2', target: 'n1', weight: -2} },
    { data: { source: 'n3', target: 'n0', weight: 2} },
    { data: { source: 'n3', target: 'n2', weight: 7} },
    { data: { source: 'n4', target: 'n2', weight: -3} },
    { data: { source: 'n2', target: 'n4'}, classes: 'invisible' },
    { data: { source: 'n4', target: 'n3', weight: 9} }
  ]
};

algSample.sssp = {
  nodes: [
    { data: { id: 'n0',name: 's' }, position: {x: 100, y:200} },
    { data: { id: 'n1',name: 't' }, position: {x: 200, y:100} },
    { data: { id: 'n2',name: 'x' }, position: {x: 400, y:100} },
    { data: { id: 'n3',name: 'z' }, position: {x: 400, y:300} },
    { data: { id: 'n4',name: 'y' }, position: {x: 200, y:300} }
    ],

  edges: [
    { data: { source: 'n3', target: 'n2', weight: 6} },
    { data: { source: 'n0', target: 'n1', weight: 10} },
    { data: { source: 'n0', target: 'n4', weight: 5 } },
    { data: { source: 'n1', target: 'n2', weight: 1} },
    { data: { source: 'n2', target: 'n3', weight: 4} },
    { data: { source: 'n4', target: 'n1', weight: 3} },
    { data: { source: 'n1', target: 'n4', weight: 2} },
    { data: { source: 'n4', target: 'n2', weight: 9} },
    { data: { source: 'n4', target: 'n3', weight: 2} },
    { data: { source: 'n3', target: 'n0', weight: 7} },
    ]
};


var tmp = 50;
algSample.elementaryGraph = {
  nodes: [
    { data: { id: '1',name: '1' }, position: {x: 10*tmp, y:10*tmp} },
    { data: { id: '2',name: '2' }, position: {x: 40*tmp, y:10*tmp} },
    { data: { id: '3',name: '3' }, position: {x: 55*tmp, y:25*tmp} },
    { data: { id: '4',name: '4' }, position: {x: 40*tmp, y:40*tmp} },
    { data: { id: '5',name: '5' }, position: {x: 10*tmp, y:40*tmp} },
  ],

  edges: [
    { data: { source: '1', target: '2', weight: 1} },
    { data: { source: '1', target: '5', weight: 1} },
    { data: { source: '2', target: '5', weight: 1} },
    { data: { source: '2', target: '3', weight: 1} },
    { data: { source: '2', target: '4', weight: 1} },
    { data: { source: '3', target: '4', weight: 1 } },
    { data: { source: '4', target: '5', weight: 1} },
  ]
};

algSample.weightedGraph = {
  nodes: [
    { data: { id: '1',name: '1' }, position: {x: 0*tmp, y:0*tmp} },
    { data: { id: '2',name: '2' }, position: {x: 0*tmp, y:30*tmp} },
    { data: { id: '3', name: '3' }, position: { x: 25 * tmp, y: 15 * tmp } },
    { data: { id: '4',name: '4' }, position: {x: 50*tmp, y:15*tmp} },
  ],

  edges: [
    { data: { source: '1', target: '2', weight: 3} },
    { data: { source: '1', target: '3', weight: 7} },
    { data: { source: '2', target: '3', weight: 6 } },
    { data: { source: '4', target: '3', weight: 3 } },
    { data: { source: '3', target: '4', weight: 1} },
  ]
};

algSample.elementaryMultigraph = {
  nodes: [
    { data: { id: '1',name: '1' }, position: {x: 10*tmp, y:10*tmp} },
    { data: { id: '2',name: '2' }, position: {x: 40*tmp, y:10*tmp} },
    { data: { id: '3',name: '3' }, position: {x: 10*tmp, y:40*tmp} },
    { data: { id: '4',name: '4' }, position: {x: 40*tmp, y:40*tmp} },
  ],

  edges: [
    { data: { source: '1', target: '2', weight: 1 } },
    { data: { source: '2', target: '3', weight: 1 } },
    { data: { source: '3', target: '2', weight: 1 } },
     { data: { source: '3', target: '2', weight: 1} },
    { data: { source: '2', target: '4', weight: 1} },
    { data: { source: '3', target: '4', weight: 1 } },
  ]
};

algSample.elementaryLoop = {
  nodes: [
    { data: { id: '1',name: '1' }, position: {x: 10*tmp, y:10*tmp} },
    { data: { id: '2',name: '2' }, position: {x: 40*tmp, y:10*tmp} },
  ],

  edges: [
    { data: { source: '1', target: '2', weight: 1 } },
    { data: { source: '1', target: '1', weight: 1 } },
  ]
};

algSample.elementaryPath = {
  nodes: [
    { data: { id: '1',name: '1' }, position: {x: 10*tmp, y:10*tmp} },
    { data: { id: '2',name: '2' }, position: {x: 40*tmp, y:10*tmp} },
    { data: { id: '3',name: '3' }, position: {x: 10*tmp, y:40*tmp} },
    { data: { id: '4',name: '4' }, position: {x: 40*tmp, y:40*tmp} },
  ],

  edges: [
    { data: { source: '1', target: '2', weight: 1 } },
    { data: { source: '2', target: '3', weight: 1 } },
    { data: { source: '2', target: '4', weight: 1} },
    { data: { source: '3', target: '4', weight: 1 } },
  ]
};


algSample.minSpanTree = {
  nodes: [
    { data: { id: 'a', name: 'a' }, position: {x: 0*tmp, y:1*tmp} },
    { data: { id: 'b', name: 'b' }, position: {x: 1*tmp, y:0*tmp } },
    { data: { id: 'c', name: 'c' }, position: {x: 3*tmp, y:0*tmp} },
    { data: { id: 'd', name: 'd' }, position: {x: 5*tmp, y:0*tmp} },
    { data: { id: 'e', name: 'e' }, position: {x: 6*tmp, y:1*tmp } },
    { data: { id: 'f', name: 'f' }, position: {x: 5*tmp, y:2*tmp } },
    { data: { id: 'g', name: 'g' }, position: {x: 3*tmp, y:2*tmp } },
    { data: { id: 'h', name: 'h' }, position: {x: 1*tmp, y:2*tmp } },
    { data: { id: 'i', name: 'i' }, position: {x: 2*tmp, y:1*tmp} },
  ],

  edges: [
    { data: { source: 'a', target: 'b', weight: 4 } },
    { data: { source: 'a', target: 'h', weight: 8 } },
    { data: { source: 'b', target: 'c', weight: 8 } },
    { data: { source: 'b', target: 'h', weight: 11 } },
    { data: { source: 'c', target: 'd', weight: 7 } },
    { data: { source: 'c', target: 'f', weight: 4 } },
    { data: { source: 'c', target: 'i', weight: 2 } },
    { data: { source: 'd', target: 'e', weight: 9 } },
    { data: { source: 'd', target: 'f', weight: 14 } },
    { data: { source: 'e', target: 'f', weight: 10 } },
    { data: { source: 'f', target: 'g', weight: 2 } },
    { data: { source: 'g', target: 'i', weight: 6 } },
    { data: { source: 'g', target: 'h', weight: 1 } },
    { data: { source: 'h', target: 'i', weight: 7 } },
  ]
};