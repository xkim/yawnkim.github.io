var elesStyleFromJson = [{
    selector: '.source',
    style: {
      'border-color': 'red',
      'border-width': '1px'
    }    
  },{
    selector: '.white',
    style: {
      'background-color': 'white'
    }    
  },{
    selector: '.grey',
    style: {
      'background-color': 'grey'
    }    
  },{
    selector: '.black',
    style: {
      'background-color': 'black'
    }    
  }, {
    //added visible pseudo for a higher specificy over the :selected collection
    selector: '.current:visible',
    style: {
      'border-color': '#ff7b00',
      'border-width': '2px',
      'border-style':'solid'
      // 'width': '35',
      // 'height': '35',
    }    
  },{
    selector: '.dimmed',
    style: {
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      //'source-arrow-color': '#ccc',
    }
  },{
    selector: '.no-arrow',
    style: {
      'target-arrow-shape': 'none',
      'source-arrow-shape': 'none'
    }
  },{
    selector: '.invisible',
    style: {
      'visibility': 'hidden'
    }
  }, {
    selector: '.highl',
    style: {
      'background-color': '#61bffc',
      'line-color': '#61bffc',
      'target-arrow-color': '#61bffc',
      'transition-property': 'background-color, line-color, target-arrow-color',
      'transition-duration': '0.5s'
    }
  }, {
    selector: 'edge',
    style: {
      'transition-property': 'background-color, line-color, target-arrow-color',
      'transition-duration': '0.5s',
      'transition-timing-function':' ease'
    }
  }, {
    selector: 'node',
    style: {
      'transition-property': 'background-color, border-color',
      'transition-duration': '0.5s',
      'transition-timing-function':' ease'
    }
  }, {
    selector: '.no-label',
    style: {
      'text-opacity': '0'
    }
  }
]
