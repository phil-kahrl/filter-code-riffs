const arccore = require("@encapsule/arccore");

/**

**/

/**
    1. Making arguments optional.
**/



/**
    1a.  Using "jsUndefined" for ____types or ____accept
**/

let filterSpec_1a = {
    ____accept: ["jsObject", "jsUndefined"]
};

/**
    1b.  Using a ____defaultValue
**/

let filterSpec_1b = {
    ____accept: "jsObject",
    ____defaultValue: {} // the caller does not need to pass in an argument, but if they do 
                         // it will override the ____defaultValue
};
/**
    1c.  Cascading default values.
**/

// Different ways to do default values.

let filterSpec_1c = {
    ____accept: "jsObject",
    ____defaultValue: {foo: "bar"}
};

// is equivalent to:

let filterSpec_1d = {
    ____types: "jsObject", // this needs to be ____types to have sub-namespaces
    ____defaultValue: {},
    foo: {
        ____accept: "jsString",
        ____defaultValue: "bar"
    }
};

// Be careful to avoid pruning on sub-namespaces with ____types

let filterSpec_1e = {
    ____types: "jsObject"
};

// or 

let filterSpec_1f = {
    ____types: "jsArray",
    element: {
        ____types: "jsObject"
    }
};

/**
    2.  Deriving multiple similar filter specs from a common base.
**/

const baseFilterSpec = {
    id: {
        ____accept: "jsString",
        ____appdsl: {
            createParam: true
        }
    },
    name: {
        ____accept: "jsString",
        ____appdsl: {
            editParam: true,
            createParam: true
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
Object.keys(baseFilterSpec).forEach( (key) => {
    if (!createSpec[key].____appdsl.createParam) {
        delete createSpec[key];
    }
});

let editSpec = {...createSpec}; // make a copy using the spread operator.

// similar to iteration of Object.keus
for (const key in editSpec) {
    const value = editSpec[key];
    if (!(value.____appdsl.editParam)) {
        delete editSpec[key];
    }
}

/**
    3.  Error handling.
**/

let bodyFunction = (request_) => {
    try {

    } catch (err) {
        // Return an error instead of allowing an exception to be thrown.
        return {error: err.stack}
    }

}

/**
    4.  Dissecting a constructed filter.
**/

/**
    5.  Factory patterns
**/