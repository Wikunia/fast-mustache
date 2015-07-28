    
var Diff = {};


///////////////////////////////////////////////////////////////////////////////
///////////////////////// START OF LOGGING SYSTEM /////////////////////////////
///////////////////////////////////////////////////////////////////////////////

var logTypes = ['toHTML']; // ['get','toHTML'];
	
	
Diff.log = function (types,name,output) {
    if (!logTypes) { return; }
    if (Diff.arrayIntersect(logTypes,types).length > 0) {
        if (typeof(output) === 'undefined') {   
            console.log('['+types[0]+','+types.last()+'] '+name);	
        } else {
            var objOut;
            if (!Array.isArray(output)) {
                objOut = JSON.stringify(output, null, " ");   
            } else {
                objOut = output;   
            }
            console.log('['+types[0]+','+types.last()+'] '+name,objOut);
        }
    }
};

Diff.arrayIntersect = function(a,b) {
    return $.grep(a, function(i) {
        return $.inArray(i, b) > -1;
    });
};

if (!Array.prototype.last){
	Array.prototype.last = function(){
        return this[this.length - 1];
    };
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////// END OF LOGGING SYSTEM ///////////////////////////////
///////////////////////////////////////////////////////////////////////////////


Diff.cloneObj = function (obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    var temp = obj.constructor(); // give temp the original obj's constructor
    for (var key in obj) {
        temp[key] = Diff.cloneObj(obj[key]);
    }

    return temp;
};



/////////////////////////////////////////////////////////////////////////////////
///////////////////////////// OBJECT DIFFERENCE /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

Diff.get = function(oldData, newData, isObject) {
    isObject    = (typeof isObject === "undefined") ? true : isObject;

    var ret = {};
    
    
    
    // newData doesn't exists => delete 
    if (typeof(newData) === 'undefined') {
        ret = Diff.getChangeObj(oldData,undefined,isObject);
        oldData = [];
        return ret;
    }
    
    // oldData doesn't exists => delete 
    if (typeof(oldData) === 'undefined') {
        ret = Diff.getChangeObj(undefined,newData,isObject);
        oldData = newData;
        return ret;
    }
    
    isObject = true;
    if (Array.isArray(oldData)) {
        isObject = false;   
    }
    
    var length, oLength, nLength;
    var keys;
    
    if (!Array.isArray(oldData)) {
        var oKeys   = Object.keys(oldData);
        var nKeys   = Object.keys(newData); 
        oLength = oKeys.length;
        nLength = nKeys.length;
        keys    = $.unique(oKeys.concat(nKeys));
        length  = keys.length;
    } else {
        oLength = oldData.length;	
        nLength = newData.length;	
        length 	= oLength > nLength ? oLength : nLength;
    }	
    
    
    
    var alreadyInUse = [];
    var saved  = {};
    var name;
    var cS;
    
    // make the diff for each object/array element
    for (var k = 0; k < length; k++) {
        name	= !isObject ? k : keys[k];  
        Diff.log(['get','get.for'],'LENGTH,KEY',length+","+name);
        
        Diff.log(['get','get.for'],'isObject',isObject ? "true" : "false");   
        Diff.log(['get','get.for'],'oldData['+name+']',oldData[name]);   
        Diff.log(['get','get.for'],'newData['+name+']',newData[name]);   
        Diff.log(['get','get.for'],'alreadyInUse',alreadyInUse);   
        
        // First check: oldData[name] == newData[name] ?
        // no change ==> add to alreadyInUse
        if (_.isEqual(oldData[name],newData[name])) {
            Diff.log(['get','get.for','get.nochange'],'no change');
            if ($.isEmptyObject(saved)) {
                alreadyInUse.push(name);       
                continue;
            } else {
                // check the saved obj
                Diff.log(['get','get.for','get.nochange'],'check saved 1.1');
                Diff.log(['get','get.for','get.nochange'],'before check saved oldData',Diff.cloneObj(oldData));   
                Diff.log(['get','get.for','get.nochange'],'before check saved ret',Diff.cloneObj(ret));   
                cS = Diff.checkSaved(ret,saved,oldData,newData,alreadyInUse);
                oldData = cS.oldData; ret = cS.ret; saved = cS.saved; length = cS.leng; keys = cS.keys;
                alreadyInUse = cS.alreadyInUse;
                k += cS.kCha-1;
                Diff.log(['get','get.for','get.nochange'],'k changed by',cS.kCha);
                Diff.log(['get','get.for','get.nochange'],'check saved 1.2');
                Diff.log(['get','get.for','get.nochange'],'after check saved oldData',Diff.cloneObj(oldData));   
                Diff.log(['get','get.for','get.nochange'],'after check saved ret',Diff.cloneObj(ret));   
                Diff.log(['get','get.for','get.nochange'],'after check saved',Diff.cloneObj(saved));   
                continue;
            }
        }
        
        // these function only work for arrays
        // use k here instead of name
        if (!isObject) {
            if ($.isEmptyObject(saved) && typeof(newData[k]) === 'undefined') {
                ret[k] = Diff.getChangeObj(oldData[k],undefined,isObject);
                oldData[k] = [];
                continue;
            }
            
            var foundAt = Diff.findObj(oldData[k],newData,alreadyInUse);
            // changed but not later and not before
            if (foundAt == -1) {
                // check the saved obj for adding things in the middle if finished
                if (!$.isEmptyObject(saved)) {
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'check saved 2.1');
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'before check saved oldData',Diff.cloneObj(oldData));   
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'before check saved ret',Diff.cloneObj(ret));   
                    cS = Diff.checkSaved(ret,saved,oldData,newData,alreadyInUse);
                    oldData = cS.oldData; ret = cS.ret; saved = cS.saved; length = cS.leng; keys = cS.keys;
                    alreadyInUse = cS.alreadyInUse;
                    k += cS.kCha;
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'check saved 2.2');
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'after check saved oldData',Diff.cloneObj(oldData));   
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'after check saved ret',Diff.cloneObj(ret));   
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'after check saved saved',Diff.cloneObj(saved));   
                    if (k >= length) {
                        continue;   
                    }
                }
                
                
                // check if it is an object
                if (typeof(oldData[k]) == 'object') {
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'\t IS object');
                    ret[k] = Diff.get(oldData[k],newData[k],isObject);    
                    Diff.log('SMALL EXTRA DIFF FOR OBJECT: ',Diff.cloneObj(ret[k]));
                } else {          
                    Diff.log(['get','get.for','get.changed.not-later-and-before'],'\t is NOT object');
                    ret[k] = Diff.getChangeObj(oldData[name],newData[name],isObject);
                    oldData[name] = newData[name];
                }
                continue;
            }
            alreadyInUse.push(foundAt);
            // changed but later or before
            saved[k] = foundAt-k;       
            Diff.log(['get','get.for','get.changed.later-or-before'],'later or before with saved['+k+'] = ',saved[k]);
        }
        // is object and not equal
        // use name and not k
        else if (typeof(oldData[name]) == 'object') {
            ret[name] = Diff.get(oldData[name],newData[name],isObject);               
        } 
        // no array and no object and not equal
        else {
            Diff.log('no array and no object but changed');
            ret[name] = Diff.getChangeObj(oldData[name],newData[name],isObject);
            oldData[name] = newData[name];
        }
        
        
        
        /// end of for 
        if (k == length-1) {
            // check the saved obj for adding things in the middle if finished
            if (!$.isEmptyObject(saved)) {
                Diff.log(['get','get.end-for'],'check saved 3.1');
                Diff.log(['get','get.end-for'],'before check saved oldData',Diff.cloneObj(oldData));   
                Diff.log(['get','get.end-for'],'before check saved ret',Diff.cloneObj(ret));   
                cS = Diff.checkSaved(ret,saved,oldData,newData,alreadyInUse);
                oldData = cS.oldData; ret = cS.ret; saved = cS.saved; length = cS.leng; keys = cS.keys;
                alreadyInUse = cS.alreadyInUse;
                k += cS.kCha;
                Diff.log(['get','get.end-for'],'check saved 3.2');
                Diff.log(['get','get.end-for'],'after check saved oldData',Diff.cloneObj(oldData));   
                Diff.log(['get','get.end-for'],'after check saved ret',Diff.cloneObj(ret));   
                Diff.log(['get','get.end-for'],'after check saved',Diff.cloneObj(saved));   
            }   
        }
        
    }
    
 
    
    
    return ret;
};


/**
 * Return a change object with diffType added,deleted or changed (therefore check if old and new are both set)
 * @param   {Object}  oldData       old data (if not set ==> added)
 * @param   {Object}  newData       new data (if not set ==> deleted)
 * @param   {Boolean} isObject      object or array?
 * @returns {Object}  {diffType: "added|deleted|changed",oldV:,newV:}
 */
Diff.getChangeObj = function(oldData,newData,isObject) {
    if (typeof(oldData) === 'undefined') {
        return {
            diffType:   "added",
            typeObj:    isObject,
            newV:       newData  
        };
    }
    if (typeof(newData) === 'undefined') {
        return {
            diffType:   "deleted",
            typeObj:    isObject,
            oldV:       oldData  
        };
    }
    return {
        diffType: "changed",
        oldV:     oldData,
        typeObj:  isObject,
        newV:     newData
    }; 
};

Diff.checkSaved = function(ret,saved,oldData,newData,alreadyInUse) {
    Diff.log(['checkSaved','checkSaved.start'],'checkSaved with saved',saved);
    
    var keys = Object.keys(saved);
    var highest = -Number.MAX_VALUE;
    var highestCounter = 0;
    var deletedCo = 0;
    var addedCo = 0;
    
    for (var k = 0; k < keys.length; k++) {
        var key 	= keys[k];     
        if (saved[key] > highest) {
            highest = saved[key];  
            highestCounter = 1;
        } else if (saved[key] == highest) {
            highestCounter++;   
        }
    }
    Diff.log(['checkSaved','checkSaved.highest'],'highest',highest);
    Diff.log(['checkSaved','checkSaved.highest'],'highestCounter',highestCounter);
    Diff.log(['checkSaved','checkSaved.highest'],'total Counter',keys.length);
    Diff.log(['checkSaved','checkSaved.highest'],'alreadyInUse',alreadyInUse);    
    
    // perfect just add highestCounter newData to the first key
    if (keys.length == highestCounter) {
        if (highest > 0) {
            Diff.log(['checkSaved','checkSaved.perfect-add'],'highest,before',[highest,keys[0]]);
            for (k = keys[0]; k < parseInt(keys[0])+highest; k++) {
                ret[k] = {
                    diffType: "added",
                    typeObj: false,
                    newV: newData[k]
                };
                oldData.splice(parseInt(k),0,newData[k]);
                addedCo++;
            }
        } else {
            Diff.log(['checkSaved','checkSaved.perfect-delete'],'highest,before',[highest,keys[0]]);
            
            for (k = parseInt(keys[0])+highest; k < keys[0]; k++) {
                ret[k] = {
                    diffType: "deleted",
                    typeObj: false,
                    oldV: oldData[k]
                };
                oldData.splice(parseInt(k)-deletedCo,1);
                deletedCo++;
            }
        }
    } else {
        var someChanged = false;
        for (k = 0; k < keys.length; k++) { 
            var int_key 	= parseInt(keys[k]);     
            
            if (saved[int_key] < highest) {
                Diff.log(['checkSaved','checkSaved.not-perfect'],'not perfect is ',int_key);  
                Diff.log(['checkSaved','checkSaved.not-perfect'],'oldData['+int_key+']',Diff.cloneObj(oldData[int_key]));  
                Diff.log(['checkSaved','checkSaved.not-perfect'],'newData',Diff.cloneObj(newData));  
                Diff.log(['checkSaved','checkSaved.not-perfect'],'check',int_key+highest);  
                Diff.log(['checkSaved','checkSaved.not-perfect'],'alreadyInUse',alreadyInUse);  
                // check if current can be perfect
                if (alreadyInUse.indexOf(int_key+highest) === -1 && _.isEqual(oldData[int_key],newData[int_key+highest])) {                
                    Diff.log(['checkSaved','checkSaved.not-perfect','checkSaved.not-perfect.can-perfect'],'can be perfect ',int_key);  
                    alreadyInUse.push(int_key+highest);
                    saved[int_key] = highest;
                    Diff.log(['checkSaved','checkSaved.not-perfect','checkSaved.not-perfect.can-perfect'],'new save for '+int_key+'',saved[int_key]);
                    someChanged = true;
                } else {
                    Diff.log(['checkSaved','checkSaved.not-perfect','checkSaved.not-perfect.total'],'can not be perfect ',int_key);  
                    // Trello Todo: improve here [55b383148e4ea3803a44c9fa]
                    for (var kInner = 0; kInner < keys.length; kInner++) {
                        var nameInner 	= keys[kInner];  
                        Diff.log(['checkSaved','checkSaved.not-perfect','checkSaved.not-perfect.total'],'change complete: nr',nameInner);  
                        ret[nameInner] = Diff.getChangeObj(oldData[nameInner],newData[nameInner],false);
                        oldData[nameInner] = newData[nameInner];
                     }
                }
            }
        }
        if (someChanged) {
            return Diff.checkSaved(ret,saved,oldData,newData,alreadyInUse);   
        }
    }
    
    keys = [];
    var length, oLength, nLength;
    if (!Array.isArray(oldData)) {
        var oKeys   = Object.keys(oldData);
        var nKeys   = Object.keys(newData); 
        oLength = oKeys.length;
        nLength = nKeys.length;
        keys    = $.unique(oKeys.concat(nKeys));
        length  = keys.length;
    } else {
        oLength = oldData.length;	
        nLength = newData.length;	
        length 	= oLength > nLength ? oLength : nLength;
    }	
    
    var result = {oldData: oldData,ret: ret, saved: {}, keys: keys, leng: length, kCha: addedCo-deletedCo,alreadyInUse: alreadyInUse};
    Diff.log(['checkSaved','checkSaved.end'],'after checkSaved',Diff.cloneObj(result));
    return result;  
};

/**
 * make the DOM changes inside selector using the Diff
 * @param {jQuery}  $selector        jQuery selector
 * @param {Object}  diff             diff object
 * @param {Object}  tree             mustache tree generated by MustacheTree.get
 * @param {String}  [currentFind=""] find selector
 * @param {Number}  [index=0]        index of the current slice
 */
Diff.toHTML = function($selector,diff,tree,currentFind,index) {
    currentFind  = (typeof currentFind === "undefined") ? "" : currentFind;
    index        = (typeof index === "undefined") ? [0,0] : index;
    
    var isObject;
    var diffKeys,keys,length;
    
    Diff.log(['toHTML','toHTML.start'],'diff',Diff.cloneObj(diff));   
    Diff.log(['toHTML','toHTML.start'],'currentFind',currentFind);   
    
    isObject = true;
    keys   = Object.keys(diff);  
    length = keys.length;
    var deletedCo = 0;
    var indexChange = false;
        
    for (var k = 0; k < length; k++) {
        var name 	= keys[k];  
        
        Diff.log(['toHTML','toHTML.for'],'before index',index);
        
        if (parseInt(name) == name) {
            if (!indexChange) {
                index[0] = index[1];
            }
            index[1] = parseInt(name);            
            indexChange = true;
        } else {        
            if (currentFind === "" && index[1] === 0) {
                currentFind = name;   
                $selector = $selector.find("."+currentFind);
            } else if (parseInt(name) != name) {
                currentFind += "_"+name;
                $selector = $selector.find("."+currentFind);
            }
            $selector = $selector.slice(index[1]*tree.usage[currentFind],(index[1]+1)*tree.usage[currentFind]);
        }
        
        Diff.log(['toHTML','toHTML.for'],'after index',index);
        
        if (!("diffType" in diff[name])) {            
            Diff.toHTML($selector,diff[name],tree,currentFind,index);
            deletedCo = 0;
        } else {
            switch (diff[name].diffType) {
                case "changed":
                    Diff.log(['toHTML','toHTML.for','toHTML.changed'],'changed',diff[name].newV);
                    $selector.text(diff[name].newV);
                    deletedCo = 0;
                    break;
                case "added":
                    Diff.log(['toHTML','toHTML.for','toHTML.added'],'added');
                    if (!diff[name].typeObj) {
                        Diff.log(['toHTML','toHTML.for','toHTML.added'],'added array');
                        Mustache.setCache(currentFind+"_tmpl",tree.partials[currentFind][index[0]]);
                        $selector.find("."+currentFind+"-inner").eq(index[1]).before(Mustache.render(currentFind+"_tmpl",diff[name].newV));
                    } else {
                        Diff.log(['toHTML','toHTML.for','toHTML.added'],'added object');
                    }
                    deletedCo = 0;
                    break;
                case "deleted":
                    Diff.log(['toHTML','toHTML.for','toHTML.deleted'],'deleted');
                    if (!diff[name].typeObj) {
                        Diff.log(['toHTML','toHTML.for','toHTML.deleted'],'deleted array at pos',name-deletedCo);
                        $selector.find("."+currentFind+"-inner").eq(index[1]-deletedCo).remove();
                        deletedCo++;
                    } else {
                        Diff.log(['toHTML','toHTML.for','toHTML.deleted'],'deleted object');
                    }
                    break;
                    
            }
            
        }
        
        
    }
};



/**
 * Combine oldData and add,del diffs to recreate the new data
 * @param   {Object}  oldData       the old data
 * @param   {Object}  diff          diff object (generated using Diff.get)
 * @returns {Object}  newData
 */
Diff.combine = function(oldData,diff) {
    var isObject;
    var diffKeys,keys,length;
    
    
    isObject = true;
    keys   = Object.keys(diff);  
    length = keys.length;
    var deletedCo = 0;

    Diff.log(['combine','combine.start'],'oldData',Diff.cloneObj(oldData));
    for (var k = 0; k < length; k++) {
        var name 	= keys[k];  

        Diff.log(['combine','combine.for'],'name',name);
        Diff.log(['combine','combine.for'],'oldData['+name+']',Diff.cloneObj(oldData[name]));
        Diff.log(['combine','combine.for'],'diff['+name+']',diff && (name in diff) ? Diff.cloneObj(diff[name]) : "NULL");
        
        if (!("diffType" in diff[name])) {
            Diff.combine(oldData[name],diff[name]);
            deletedCo = 0;
        } else {
            switch (diff[name].diffType) {
                case "changed":
                    Diff.log(['combine','combine.for','combine.changed'],'changed');
                    oldData[name] = diff[name].newV;         
                    deletedCo = 0;
                    break;
                case "added":
                    Diff.log(['combine','combine.for','combine.added'],'added');
                    if (!diff[name].typeObj) {
                        Diff.log(['combine','combine.for','combine.added'],'added array');
                        oldData.splice(name,0,diff[name].newV);
                    } else {
                        Diff.log(['combine','combine.for','combine.added'],'added object');
                        oldData[name] = diff[name].newV;
                    }
                    deletedCo = 0;
                    break;
                case "deleted":
                    Diff.log(['combine','combine.for','combine.deleted'],'deleted');
                    if (!diff[name].typeObj) {
                        Diff.log(['combine','combine.for','combine.deleted'],'deleted array at pos',name-deletedCo);
                        oldData.splice(name-deletedCo,1);
                        deletedCo++;
                    } else {
                        Diff.log(['combine','combine.for','combine.deleted'],'deleted object');
                        delete oldData[name];
                    }
                    break;
                    
            }
            
        }
        
        
    }
    return oldData;
};

/**
 * Find val in inArr and return the index
 * the index is -1 if the index is already in use (in alreadyFound)
 * @param   {Object} val          object that should be found in inArr
 * @param   {Array}  inArr        the array that will be searched in
 * @param   {Array}  alreadyInUse the indices that are already in use
 * @param   {Number} [start=0]    the start position
 * @returns {Number} index, not found or already in use => -1
 */
Diff.findObj = function (val,inArr,alreadyInUse,start) {
    start 	      = (typeof start === "undefined") ? 0 : start;
    
    var foundAt = -1;
    for (var i = start; i < inArr.length; i++) {
        if (alreadyInUse.indexOf(i) == -1 && _.isEqual(val,inArr[i])) {
            foundAt = i;
            break;                     
        }
    }
    return foundAt;
};