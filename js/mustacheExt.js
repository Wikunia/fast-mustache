Mustache.fastCache  = {};
Mustache.renderFast = function (selector, tmpl,name,tree,data) {
    console.log('here i am');  
    if (name in Mustache.fastCache) {
        console.log('create diff');   
        console.time('create diff');   
        var diff = Diff.get(Mustache.fastCache[name],data);           
        console.timeEnd('create diff');  
        console.log('generated diff: ',JSON.stringify(diff, null, 2));
        console.time('html');
        Diff.toHTML($(selector),diff,tree);            
        console.timeEnd('html');
    } else {
        console.time('html');
        $(selector).html(Mustache.render(tmpl,data));  
        console.timeEnd('html');
    }
    Mustache.fastCache[name] = data;   
};


Mustache.getTree = function (mObj,currentScope,usageObj,pObj) {
    currentScope    = (typeof currentScope === "undefined") ? "" : currentScope;
    usageObj        = (typeof usageObj === "undefined") ? {} : usageObj;
    pObj            = (typeof pObj === "undefined") ? {} : pObj;
    
    var data;
    var htmlTag;
    for (var i = 0; i < mObj.length; i++) {
        data = mObj[i];
        switch(data[0]) {
            case "#":
            case "name":
                var eleName = (data[0] == "name") ? "span" : "div";
                var className = currentScope+data[1];
                if (className in usageObj) {
                    usageObj[className]++;   
                } else {
                    usageObj[className] = 1;   
                }
                if (mObj[i].length >= 5) {
                    mObj[i][4].unshift(["text","<"+eleName+" class='"+className+"-inner'>",0,0]);
                    mObj[i][4].push(["text","</"+eleName+">",0,0]);   
                }
                
                mObj.splice(i,0,["text","<"+eleName+" class='"+className+"'>",0,0]);
                mObj.splice(i+2,0,["text","</"+eleName+">",0,0]);
                
                if (!(className in pObj)) {
                    pObj[className] = [];  
                }
                pObj[className].push(mObj[i+1][4]);   
                
                i = i+2; 
                break;
        }
        if (data.length > 4) {
            var nextScope = ((currentScope === "" ) ? "" : currentScope+"_")+data[1]+"_";
            Mustache.getTree(data[4],nextScope,usageObj,pObj);   
        }


    }
    return {tree: mObj,usage: usageObj, partials: pObj};
};