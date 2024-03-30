// THIS FILE WAS GENERATED DURING BUILD

// start html header

import RSInjectConfig from './config.js';

const nextTick = (f: Function) => {
    setTimeout(f,500);
};

const store = {
    dispatch: (c) => {
        if (c==='rsinject/disable') {
            RSInject.disable();
        }
    }
};

// end html header

