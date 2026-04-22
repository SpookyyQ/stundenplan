const fs = require('fs');
const v = new Date().toISOString().replace(/[-:T]/g,'').slice(0,14);
let html = fs.readFileSync('index.html','utf8');
html = html.replace(/\?v=\d+/g, `?v=${v}`);
fs.writeFileSync('index.html', html);
console.log('Version bumped to', v);
