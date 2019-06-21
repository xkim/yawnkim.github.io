function Vlog(){
    this.vlist = [];
    this.ptr = 0;
        this.add = (_velem)=>{
        if(Array.isArray(_velem))
            this.vlist.push(_velem);
        else
            this.vlist.push([_velem]);
    };

    this.insert = (_velem, _pos)=>{
        let len = this.vlist.length;

        if( _pos >= len || _pos < 0)
            return;

        if( len == 0 ){
            this.vlist.push([]);
        }

        if( _pos===undefined ){
            _pos = len-1
        }

        if(Array.isArray(_velem)){
            this.vlist[ _pos ].concat(_velem);
        }else{
            this.vlist[ _pos ].push(_velem);
        }

    };
    
    let updateValue = ()=>{
        let velem = this.vlist[this.ptr];
        let len = velem.length;

        for(let i = 0; i < len; i++){
            let selector = velem[i].selector;  
            let target = velem[i].target;
            if(target === 'method'){
                let classes = velem[i].classes;
                selector.toggleClass( classes );
                //cy.nodes()[0].classes( Object.keys(cy.nodes()[1]._private.classes._obj).join(' ') )
            }else if(target === 'html'){
                let newHtml = velem[i].html;
                let oldHtml = selector.innerHTML;

                selector.innerHTML = newHtml;
                this.vlist[ this.ptr ][i].html = oldHtml;
            }else if(target === 'css'){
                let property = velem[i].property;
                let value = velem[i].value;
                let previousValue = selector.style[property];
                // update element with a new property value
                selector.style[property] = value;
                
                // save previous state 
                // [ current velem ][ currently changed element ]
                this.vlist[ this.ptr ][i].value = previousValue;
            }else if(target === 'function'){
                velem[i].callback();
            }
        }
    }
    
    this.nxt = ()=>{
        if(this.ptr >= this.vlist.length)
            return;
        updateValue();
        this.ptr++;
    }

    this.prv = ()=>{
        if(this.ptr == 0)
            return;
        this.ptr--;  
        updateValue();             
    }


    this.clr = ()=>{
        this.vlist = [];
        this.ptr = 0;
    }
}

function toV(_selector, _propertyOrClass, _value){
    if(typeof _selector === 'function'){
        return{
            'callback': _selector,
            'target': 'function'
        }
    }else if(_value===undefined){
        return {
            'selector':_selector,
            'classes':_propertyOrClass,
            'target':'method'
        };
    }else if(_propertyOrClass===undefined){
        return {
            'selector':_selector,
            'html':_value,
            'target':'html'
        };
    }else{
        return {
            'selector':_selector,
            'property':_propertyOrClass,
            'value':_value,
            'target':'css'
        };
    }
}



function StepFrame(_selector, _property = {}, _method = {}, _atomic = false, _callback=null) {
    this.selector = _selector;
    this.propertyName = _property.name || null;
    this.propertyValueFrom = _property.from || null;
    this.propertyValueTo = _property.to || _property.from || null;; 
    
    this.methodName = _method.name || null;
    this.methodParamsFrom = _method.from || null;
    this.methodParamsTo = _method.to || _method.from || null;
    // params and function might differ


    // expect the following object format _callback = { name: callbackFunction, argsFrom: arrayOfArguments, argsTo: arrayOfArguments }
    this.callback = _callback;

    this.isAtomic = _atomic;
    // used to execute a collection of StepFrames in a same time

    this.undo = function () {
        let selector = this.selector;

        let callback = this.callback;
        if (callback !== null) {
            let foo = callback.name;
            let arg = callback.argsFrom;
            foo(...arg);
        }

        if (this.propertyName) {
            selector[this.propertyName] = this.propertyValueFrom;
        }
        if (this.methodName) {
            let methodParamsFrom = this.methodParamsFrom;
            if(Array.isArray(methodParamsFrom))
                selector[this.methodName](...methodParamsFrom);
            else
                selector[this.methodName](methodParamsFrom);
        }
    };
    this.redo = function () {
        let selector = this.selector;

        let callback = this.callback;
        if (callback !== null) {
            let foo = callback.name;
            let arg = callback.argsTo;
            foo(...arg);
        }

        if (this.propertyName) {
            selector[this.propertyName] = this.propertyValueTo;
        }
        if (this.methodName) {
            let methodParamsTo = this.methodParamsTo;
            if(Array.isArray(methodParamsTo))
                selector[this.methodName](...methodParamsTo);
            else
                selector[this.methodName](methodParamsTo);
        }
    };
}

function StepAlbum() {
    this.stepList = [];
    this.ptr = 0;
    this.duration = 0;

    this.add = function (el) {
        if (Array.isArray(el)) {
            for (let i = 0; i < el.length; i++){
                this.stepList.push(el[i]);
                this.duration+=el[i].isAtomic === false;
            }
        } else {
            this.stepList.push(el);
            this.duration+=el.isAtomic === false;
        }
    }

    this.play = function () {
        if (this.stepList.length === 0) return;
        console.log('---------------------------------');
        while (this.ptr < this.stepList.length) {
            let curr = this.stepList[this.ptr];
            curr.redo()
            console.log("played frame #"+this.ptr);
            if(this.ptr+1 < this.stepList.length)this.ptr++;
            else {
                break;
            }
            if (this.ptr < this.stepList.length) {
                let nxt = this.stepList[this.ptr];
                if (nxt.isAtomic) continue;
            }
            break;
        }
        //this.ptr--;
    }

    this.rewind = function () {
        if (this.stepList.length === 0) return;
        let firstAtomic = true;
        console.log('---------------------------------');
        let specialFix = true;
        while (this.ptr >= 0) {
            let curr = this.stepList[this.ptr];
            if (specialFix) {
                specialFix = false;
            } else {
                curr.undo();
                console.log("rewinded frame #"+this.ptr);
            }
            
            if (this.ptr >= 0) {
                this.ptr--;
                if (curr.isAtomic || firstAtomic) {
                    firstAtomic = false;
                    continue;
            }}
            break;
        }
        this.ptr++;
    }
    this.flush = function () {
        this.stepList = [];
        this.ptr = 0;
        this.duration = 0;
    }

    this.isEnd = function () {
        return (this.ptr+1) === this.stepList.length || this.stepList.length === 0;
    }

    this.isStart = function () {
        return (this.ptr) === 0 || this.stepList.length === 0;
    }
}    

var algSteps = new StepAlbum();

function algPlay() {
    algSteps.play();
}

function algRewind() {
    algSteps.rewind();
}
