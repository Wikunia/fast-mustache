
QUnit.module( "Diff " );
QUnit.test( "changed one", function( assert ) {
    var oldData = {"test":[{"nr":10},{"nr":20},{"nr":30}]};
    /*
        0: no change
        1: changed but not later
        ==> change 
        2: no change
    */
    
    var newData = {"test":[{"nr":10},{"nr":25},{"nr":30}]};
    
    
    var newDataCopy, oldDataCopy;
    newDataCopy = Diff.cloneObj(newData);
    oldDataCopy = Diff.cloneObj(oldData);
    
    var diff = Diff.get(oldData,newData);
    console.log('----- Combine ---------');
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "added front", function( assert ) {
    var oldData = {"test":[{"nr":10,"old":2},{"nr":20},{"nr":30}]};
    /*
        0: changed but not later; one same property but changed 
        ==> change all
        1: changed but later => save +1
           2:  changed but later => save +1
            ==> add one ({"nr": 15} (between 0 and 1) 
    */
    
    
    var newData = {"test":[{"nr":2,"new":1},{"nr":15},{"nr":20},{"nr":30}]};
    
    var newDataCopy, oldDataCopy;
    newDataCopy = Diff.cloneObj(newData);
    oldDataCopy = Diff.cloneObj(oldData);
    
    var diff = Diff.get(oldData,newData);
    console.log('----- Combine ---------');
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "added front changed one", function( assert ) {
    var oldData = {"test":[{"nr":10},{"nr":20},{"nr":30}]};
    /*
        0: changed but later => save +1
            1: changed but not later => check if current pos (1) + save length == newData.length (false => change directly)
            ==> change
            2: changed but later => save +1
            ==> add one at the front {"nr":0}
    */
    
    var newData = {"test":[{"nr":0},{"nr":10},{"nr":15},{"nr":30}]};
    
    var newDataCopy, oldDataCopy;
    newDataCopy = Diff.cloneObj(newData);
    oldDataCopy = Diff.cloneObj(oldData);
    
    var diff = Diff.get(oldData,newData);
    console.log('----- Combine ---------');
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "deleted end", function( assert ) {
    var oldData = {"test":[{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":21},{"nr":22}]};
    /*
        0: no change 
        1: no change
        2: no change
        3: no change
        4: no change
        5: end of new => delete last elements of oldData        
    */
    
    var newData = {"test":[{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "added front, deleted end", function( assert ) {
    var oldData = {"test":[{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but later => save +2
            1: changed but later => save +3
            2: changed but later => save +3
            3: changed but later => save +3
            4: changed but later => save +3
            5: changed but not later => check if current pos (1) + save length (highest) == newData.length 
                true => check 0: again because `save` isn't always the same
            0: check +3 ==> possible => save +3
            ==> add 3 at the front 
        6: end of new => delete last elements of oldData        
            
    */
    var newData = {"test":[{"nr":92},{"nr":12},{"nr":192},{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "added middle", function( assert ) {
    var oldData = {"test":[{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: no change 
        1: no change
        2: changed but later => save +1
            3-7: changed but later => save +1
            ==> add one between 1 and 2 {"nr":195}
    */
    
    var newData = {"test":[{"nr":192},{"nr":194},{"nr":195},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "delete front, add end", function( assert ) {
    var oldData = {"test":[{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":21},{"nr":22}]};
    var newData = {"test":[{"nr":198},{"nr":80},{"nr":20},{"nr":21},{"nr":22},{"nr":23},{"nr":24},{"nr":25}]};
   
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});

QUnit.test( "delete front, add end and middle", function( assert ) {
    var oldData = {"test":[{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but not later 
        ==> change
        1: changed but before => save -1
            2: changed but before => save -1    
            3: changed but before => save -1    
            4: changed but before => save -1   
            5: not changed
            ==> switch change at 0 to delete
            {"test":[{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
5-1=>   4: changed but later => save+1
            5: changed but later => save+1        
            6: changed but later => save+1        
            end of old ==> add one between 3 and 4 {"nr":23}
            {"test":[{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":23},{"nr":20},{"nr":20},{"nr":20}]};
        not same length ==> add all other elements at the end
    */
    var newData = {"test":[{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":23},{"nr":20},{"nr":20},{"nr":20},{"nr":21},{"nr":22},{"nr":23}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "delete front,middle,end, add front,middle,end", function( assert ) {
    var oldData = {"test":[{"nr":192},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but not later 
        ==> change
        1: changed but before: save -1
            2: changed but not later
            ==> switch change at 0 to delete
            {"test":[{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
2-1=>   1: changed but not later
        ==> change
        2: no change
        3: no change
        4: changed but not later
        ==> change
        5: changed but not later
        ==> change
        6: end of new ==> delete last elements of oldData {"nr":20}
    */
    
    var newData = {"test":[{"nr":194},{"nr":200},{"nr":198},{"nr":80},{"nr":21},{"nr":22}]};
    
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});
QUnit.test( "nested add and change", function( assert ) {
    var oldData = {"test":[{"nr":[1,2,3]},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but not later and nested
        ==> into nr
            0.0: not changed
            0.1: changed but not later
            ==> change
            0.2: no change
            ==> not same length ==> add 5
        1: changed but not later
        ==> change
        2-end: no change
    
    */
    
    
    var newData = {"test":[{"nr":[1,3,3,5]},{"nr":192},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});

QUnit.test( "complete change", function( assert ) {
    var oldData = {"test":[{"nr":[1,2,3]},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but not later (all props)
        ==> total change
        1-end: changed but not later
        ==> change
    */
    
    var newData = {"test":[{"blue":[1,3,3,5]},{"a":192},{"b":196},{"c":198},{"d":80},{"e":20},{"f":20},{"g":20}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});

QUnit.test( "nested single change", function( assert ) {
    var oldData = {"test":[{"nr":{"i":[1,2,3,{"b":[1,2,3,4]}]}},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but not later but nested
            0.nr: changed but not later but nested
                0.nr.i: changed but not later but nested
                    0.nr.i.0: no change
                    0.nr.i.1: no change
                    0.nr.i.2: no change
                    0.nr.i.3: changed; not later; nested
                        0.nr.i.3.0: no changed
                        0.nr.i.3.1: changed; not later
                        ==> changed
                        0.nr.i.3.2: no change
                        0.nr.i.3.3: no change
        1-end: no change
        
    */
    var newData = {"test":[{"nr":{"i":[1,2,3,{"b":[1,3,3,4]}]}},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});

QUnit.test( "reversed", function( assert ) {
    var oldData = {"test":[{"nr":[1,2,3]},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but later => save +7
        1: changed but later => save +5
        2: changed but later => save +3
        3: changed but later => save +1
        4: changed but before => save -1
        5: changed but before => save -3
        6: changed but before => save -5
        7: changed but before => save -7
        ==> no same save ==> change all
    */
    
    var newData = {"test":[{"nr":20},{"nr":20},{"nr":20},{"nr":80},{"nr":198},{"nr":196},{"nr":194},{"nr":[1,2,3]}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});

QUnit.test( "complete change with one random saveData", function( assert ) {
    var oldData = {"test":[{"nr":[1,2,3]},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    /*
        0: changed but not later (all props)
        ==> total change
        1-4: changed but not later
        ==> change
        5: changed but later => save +2
            6: changed but not later
            add 2 before 5, {"e":20},{"f":20}
            => {"test":[{"blue":[1,3,3,5]},{"a":192},{"b":196},{"c":198},{"d":80},{"e":20},{"f":20},{"nr":20},{"nr":20},{"nr":20}]}
        and of new => delete rest
    */
    
    var newData = {"test":[{"blue":[1,3,3,5]},{"a":192},{"b":196},{"c":198},{"d":80},{"e":20},{"f":20},{"nr":20}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});

QUnit.test( "random change", function( assert ) {
    var oldData = {"test":[{"nr":[1,2,3]},{"nr":194},{"nr":196},{"nr":198},{"nr":80},{"nr":20},{"nr":20},{"nr":20}]};
    
    var newData = {"test":[{"nr":[1,3,2,4,5]},{"nr":192},{"nr":196},{"nr":8},{"nr":810},{"nr":194},{"nr":196},{"nr":20}]};
    
    var oldDataCopy = Diff.cloneObj(oldData);
    var newDataCopy = Diff.cloneObj(newData);
  
    var diff = Diff.get(oldData,newData);
    var combined = Diff.combine(oldDataCopy,diff);
    
    console.log('diff: ',diff);
    console.log('combined: ',combined);
    
    assert.deepEqual( combined, newDataCopy, "The combined data should equal the newData" );
});


