const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');

// copy test data to build directory
let src = 'src/';
let dest = 'out';

ncp(src, dest, {
    filter: p => {
        console.log("path: " + p);

        if (fs.statSync(p).isDirectory()) { return true; }

        if (p.includes('test-data')) { return true; }

        return false;
    }
}, function (err) { });