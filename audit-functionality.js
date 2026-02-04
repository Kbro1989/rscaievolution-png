import fs from 'fs';
import path from 'path';

function loadList(filename) {
    if (!fs.existsSync(filename)) return [];
    return fs.readFileSync(filename, 'utf8')
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0)
        .map(l => l.replace(/\\/g, '/'))
    // Filter out non-file lines if possible, or just ignore directories in loop
    // The list contains "com" then "com/openrsc" etc.
    // We only care about .java files for ORSC and .js for CF/2003
}

function normalize(p) {
    return p.replace(/\.(js|java|class)$/, '').toLowerCase();
}

const cfList = loadList('cf_plugins.txt');
const repo2003List = loadList('2003_plugins.txt');
const orscList = loadList('orsc_plugins.txt');

console.log(`CF Plugins: ${cfList.length}`);
console.log(`2003 Plugins: ${repo2003List.length}`);
console.log(`ORSC Plugins: ${orscList.length}`);

const cfSet = new Set(cfList.map(p => normalize(p)));

const missingFrom2003 = [];
repo2003List.forEach(p => {
    if (!p.endsWith('.js') && !p.endsWith('.json')) return;
    if (!cfSet.has(normalize(p))) {
        missingFrom2003.push(p);
    }
});

const missingFromOrsc = [];
orscList.forEach(p => {
    if (!p.endsWith('.java')) return;

    // Strip "com/openrsc/server/plugins/"
    let cleanP = p.replace(/^com\/openrsc\/server\/plugins\//, '');

    // Strip sub-folders like "authentic/", "custom/", "retro/", "shared/"
    cleanP = cleanP.replace(/^(authentic|custom|retro|shared)\//, '');

    // Normalize
    const norm = normalize(cleanP);

    // Hyphenate CamelCase
    const hyphenated = norm.split('/').map(part => {
        return part.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }).join('/');

    if (!cfSet.has(norm) && !cfSet.has(hyphenated)) {
        missingFromOrsc.push(p);
    }
});

const report = [];
report.push(`--- FUNCTIONALITY GAP REPORT (FINAL) ---`);
report.push(`Generated at: ${new Date().toISOString()}`);

report.push(`\n[MISSING FROM 2003SCAPE] (${missingFrom2003.length} files)`);
missingFrom2003.forEach(p => report.push(p));

report.push(`\n[MISSING FROM OPENRSC] (${missingFromOrsc.length} files)`);
missingFromOrsc.forEach(p => report.push(p));

fs.writeFileSync('functionality-gap-report.txt', report.join('\n'));
console.log(`Report generated: functionality-gap-report.txt`);
