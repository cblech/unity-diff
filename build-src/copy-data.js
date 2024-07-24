const ncp = require('ncp').ncp;
const path = require('path');
const fs = require('fs');
const { watch } = require('node:fs/promises');

// copy test and prod data to build directory
let src = 'src/';
let dest = 'out';

ncp(src, dest, {
    filter: p => {
        console.log("path: " + p);

        if (fs.statSync(p).isDirectory()) { return true; }

        if (p.includes('test-data')) { return true; }
        if (p.includes('prod-data')) { return true; }

        return false;
    }
}, function (err) { });

async function doWatch() {
    try {
        const watcher = watch(src, { recursive: true });
        for await (const event of watcher) {
            //console.log(event);
            if (event.filename.includes('test-data') || event.filename.includes('prod-data')) {
                // copy the file
                console.log("copying: " + src + event.filename);
                ncp(path.join(src, event.filename), path.join(dest, event.filename), function (err) { });
            }
        }
    } catch (err) {
        if (err.name === 'AbortError') { return; }
        throw err;
    }
};

let shouldWatch = process.argv.some(arg => {
    if (arg === '--watch') {
        return true;
    }
    return false;
});

if(shouldWatch) {
    doWatch();
}
