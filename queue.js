function Queue(){
    this.items = [];
    this.enqueue = function(_item){
        if(typeof(this.items) === 'undefined'){
            this.items = [];
        }
        this.items.push(_item);
    };
    this.dequeue = function(){
        return this.items.shift();
    };
    this.isEmpty = function(){
        return this.items.length==0;
    };
    this.clear = function(){
        this.items = [];
    }

    this.toString = function(_separator,_callback){
        let str = "";
        let len = this.items.length;

        if( _callback === undefined){
            return this.items.join(_separator);
        }else{
            let copy = [];
            this.items.forEach(function(item){
                copy.push(_callback(item));
            });
            
            return copy.join(_separator);
        }
    }

    this.toArray = function(_callback){
        return this.items.map(_callback);
    }


    this.extract = function(_callback){
        let x = this.items.reduce(_callback);
        let i = this.items.indexOf(x);
        return this.items.splice(i,1)[0];
    }
    
}

function formatQueueToHtml(q, delimeter = ' | '){
    let s = q.toArray(getName).join(delimeter);
    if(s=="")s="empty";
    return `<span  class="col-sm-2 pl-0"> Queue: </span><span class="col-sm-9">${s}</span>`;
}



function PriorityQueue( _compareCallback = (a,b)=>{ return a>b } ){
    this.items = [];
    this.compareCallback = _compareCallback;


    this.enqueue = function(_item){
        if(typeof(this.items) === 'undefined'){
            this.items = [];
        }
        
        let ptr = 0;
        let len = this.items.length;
        while( ptr<len && compareCallback(_item, this.items[ptr]) ){
            ptr++;
        }
        this.items.splice(ptr, 0, _item);
    };
    this.dequeue = function(){
        return this.items.shift();
    };
    this.isEmpty = function(){
        return this.items.length==0;
    };
    this.clear = function(){
        this.items = [];
    }

    this.toString = function(_separator,_callback){
        let str = "";
        let len = this.items.length;

        if( _callback === undefined){
            return this.items.join(_separator);
        }else{
            let copy = [];
            this.items.forEach(function(item){
                copy.push(_callback(item));
            });
            
            return copy.join(_separator);
        }
    }

    this.toArray = function(_callback){
        return this.items.map(_callback);
    }
}