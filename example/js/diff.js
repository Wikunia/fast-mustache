    
var Diff = {};





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
        // First check: oldData[name] == newData[name] ?
        // no change ==> add to alreadyInUse
        if (_.isEqual(oldData[name],newData[name])) {
            if ($.isEmptyObject(saved)) {
                alreadyInUse.push(name);       
                continue;
            } else {
                // check the saved obj
                cS = Diff.checkSaved(ret,saved,oldData,newData,alreadyInUse);
                oldData = cS.oldData; ret = cS.ret; saved = cS.saved; length = cS.leng; keys = cS.keys;
                alreadyInUse = cS.alreadyInUse;
                k += cS.kCha-1;
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
                    cS = Diff.checkSaved(ret,saved,oldData,newData,alreadyInUse);
                    oldData = cS.oldData; ret = cS.ret; saved = cS.saved; length = cS.leng; keys = cS.keys;
                    alreadyInUse = cS.alreadyInUse;
                    k += cS.kCha;
                    if (k >= length) {
                        continue;   
                    }
                }
                
                
                // check if it is an object
                if (typeof(oldData[k]) == 'object') {
                    ret[k] = Diff.get(oldData[k],newData[k],isObject);    
                } else {          
                    ret[k] = Diff.getChangeObj(oldData[name],newData[name],isObject);
                    oldData[name] = newData[name];
                }
                continue;
            }
            alreadyInUse.push(foundAt);
            // changed but later or before
            saved[k] = foundAt-k;       
        }
        // is object and not equal
        // use name and not k
        else if (typeof(oldData[name]) == 'object') {
            ret[name] = Diff.get(oldData[name],newData[name],isObject);               
        } 
        // no array and no object and not equal
        else {
            ret[name] = Diff.getChangeObj(oldData[name],newData[name],isObject);
            oldData[name] = newData[name];
        }
        
        
        
        /// end of for 
        if (k == length-1) {
            // check the saved obj for adding things in the middle if finished
            if (!$.isEmptyObject(saved)) {
                cS = Diff.checkSaved(ret,saved,oldData,newData,alreadyInUse);
                oldData = cS.oldData; ret = cS.ret; saved = cS.saved; length = cS.leng; keys = cS.keys;
                alreadyInUse = cS.alreadyInUse;
                k += cS.kCha;
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
    // perfect just add highestCounter newData to the first key
    if (keys.length == highestCounter) {
        if (highest > 0) {
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
                // check if current can be perfect
                if (alreadyInUse.indexOf(int_key+highest) === -1 && _.isEqual(oldData[int_key],newData[int_key+highest])) {                
                    alreadyInUse.push(int_key+highest);
                    saved[int_key] = highest;
                    someChanged = true;
                } else {
                    // Trello Todo: improve here [55b383148e4ea3803a44c9fa]
                    for (var kInner = 0; kInner < keys.length; kInner++) {
                        var nameInner 	= keys[kInner];  
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
    isObject = true;
    keys   = Object.keys(diff);  
    length = keys.length;
    var deletedCo = 0;
    var indexChange = false;
        
    for (var k = 0; k < length; k++) {
        var name 	= keys[k];  
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
        if (!("diffType" in diff[name])) {            
            Diff.toHTML($selector,diff[name],tree,currentFind,index);
            deletedCo = 0;
        } else {
            switch (diff[name].diffType) {
                case "changed":
                    $selector.text(diff[name].newV);
                    deletedCo = 0;
                    break;
                case "added":
                    if (!diff[name].typeObj) {
                        Mustache.setCache(currentFind+"_tmpl",tree.partials[currentFind][index[0]]);
                        $selector.find("."+currentFind+"-inner").eq(index[1]).before(Mustache.render(currentFind+"_tmpl",diff[name].newV));
                    } 
                    deletedCo = 0;
                    break;
                case "deleted":
                    if (!diff[name].typeObj) {
                        $selector.find("."+currentFind+"-inner").eq(index[1]-deletedCo).remove();
                        deletedCo++;
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
    for (var k = 0; k < length; k++) {
        var name 	= keys[k];  
        if (!("diffType" in diff[name])) {
            Diff.combine(oldData[name],diff[name]);
            deletedCo = 0;
        } else {
            switch (diff[name].diffType) {
                case "changed":
                    oldData[name] = diff[name].newV;         
                    deletedCo = 0;
                    break;
                case "added":
                    if (!diff[name].typeObj) {
                        oldData.splice(name,0,diff[name].newV);
                    } else {
                        oldData[name] = diff[name].newV;
                    }
                    deletedCo = 0;
                    break;
                case "deleted":
                    if (!diff[name].typeObj) {
                        oldData.splice(name-deletedCo,1);
                        deletedCo++;
                    } else {
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