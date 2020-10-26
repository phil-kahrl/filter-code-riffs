const arccore = require("@encapsule/arccore");

const filterRequest = {
    operationID: "6NBRSRutRx2XBc3BIhjzeA",
    operationName: "filter demo",
    operationDescription: "filter demo",
    inputFilterSpec: {
        ____opaque: true
    },
    // outputFilterSpec is optional
    bodyFunction: (request_) => {
        console.log("request_ : " + JSON.stringify(request_));
        return {result: undefined};
    }
};

/**
    1. Making arguments optional.
**/



/**
    1a.  Using "jsUndefined" for ____types or ____accept
**/

filterRequest.inputFilterSpec = {
    ____accept: ["jsObject", "jsUndefined"]
};

arccore.filter.create(filterRequest).result.request();
// OUTPUT: request_ : undefined

/**
    1b.  Using a ____defaultValue
**/

filterRequest.inputFilterSpec = {
    ____accept: "jsObject",
    ____defaultValue: {} // the caller does not need to pass in an argument, but if they do 
                         // it will override the ____defaultValue
};

arccore.filter.create(filterRequest).result.request();
// OUTPUT: request_ : {}
/**
    1c.  Cascading default values.
**/

// Different ways to do default values.

filterRequest.inputFilterSpec = {
    ____accept: "jsObject",
    ____defaultValue: {foo: "bar"}
};
arccore.filter.create(filterRequest).result.request();
// OUTPUT: {foo: "bar"}

// is equivalent to:
filterRequest.inputFilterSpec = {
    ____types: "jsObject", // this needs to be ____types to have sub-namespaces
    ____defaultValue: {},
    foo: {
        ____accept: "jsString",
        ____defaultValue: "bar"
    }
};
arccore.filter.create(filterRequest).result.request();
// OUTPUT: {foo: "bar"}

// Be careful to avoid pruning on sub-namespaces with ____types

filterRequest.inputFilterSpec = {
    ____types: "jsObject"
};

arccore.filter.create(filterRequest).result.request({foo: "bar"});
// The object argument will be pruned to an empty object because there is not sub-namespace under ____types
// OUTPUT: {}

// Same thing applies if ____types is an array element spec.

filterRequest.inputFilterSpec = {
    ____types: "jsArray",
    element: {
        ____types: "jsObject"
    }
};

arccore.filter.create(filterRequest).result.request([{foo: "bar"}]);
// OUTPUT: [{}]

/**
    2.  Deriving multiple similar filter specs from a common base.
**/

const baseFilterSpec = {
    id: {
        ____accept: "jsString",
        ____appdsl: {
            requiredForCreate: true
        }
    },
    name: {
        ____accept: "jsString",
        ____appdsl: {
            editable: true,
        }
    }
};
/**
    'id' should be required for a filter that creates the object.
    for editing the object the 'id' cannot be edited but 'name' can.


**/

// make a copy so the baseFilterSpec isn't mutated.
let createSpec = JSON.parse(JSON.stringify(baseFilterSpec)); 

// iterate over the keys
// anything that is not the create param, will be option (allow undefined) on create.
Object.keys(baseFilterSpec).forEach( (key) => {
    if (!createSpec[key].____appdsl.requiredForCreate && (createSpec[key].____appdsl.editable)) {
        if (createSpec[key].____accept) {
            if (typeof createSpec[key].____accept === "object") {
                createSpec[key].____accept.push("jsUndefined");
            } else {
                createSpec[key].____accept = [createSpec[key].____accept, "jsUndefined"];
            }
        } else if (createSpec[key].____types) {
            if (typeof createSpec[key].____types === "object") {
                createSpec[key].____types.push("jsUndefined");
            } else {
                createSpec[key].____types = [createSpec[key].____types, "jsUndefined"];
            }
        }
    }
    delete createSpec[key].____appdsl;
});

let editSpec = {...baseFilterSpec}; // another way to make a copy using the spread operator.

// similar to iteration of Object.keys
// delete keys that do not have the editParam appdsl.
for (const key in editSpec) {
    if (!(editSpec[key].____appdsl.editable)) {
        delete editSpec[key];
    } else {
        delete editSpec[key].____appdsl;
    }
}

console.log("baseFilterSpec: " + JSON.stringify(baseFilterSpec));
console.log("createSpec: " + JSON.stringify(createSpec));
// createSpec: {"id":{"____accept":"jsString"},"name":{"____accept":["jsString","jsUndefined"]}}
console.log("editSpec: "  + JSON.stringify(editSpec));
//editSpec: {"name":{"____accept":"jsString"}}

/**
    3.  Error handling.
**/
let bodyFunction = () => {
    try {
        console.log("doing something ...");
    } catch (err) {
        // Always return an error from inside a filter body function instead of allowing an exception to be thrown.
        return {error: err.stack};
    }
};

/**
    4.  Dissecting a constructed filter.
**/

const factoryResponse = arccore.filter.create(filterRequest);

if (!factoryResponse.error) {
    // You can see what the request of the constructed filter was by looking at the 'filterDescriptor'
    console.log("filterDescriptor: " + JSON.stringify(factoryResponse.result.filterDescriptor));
    // Trying to modify the filterDescriptor to change the filter will not work.
    factoryResponse.result.filterDescriptor.inputFilterSpec = {____opaque: true}; // has no affect on the constructed filter.
}

// using ____opaque, means any input will work.

filterRequest.inputFilterSpec = {____opaque: true};

arccore.filter.create(filterRequest).result.request({a: "baz", b: 1, c: {d: true}});




