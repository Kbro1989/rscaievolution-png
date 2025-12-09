
const fs = require('fs');
const path = require('path');
const { glob } = require('glob'); // Assume we might need glob, or just walk directory manually if dependency missing.
// Actually, let's use manual walk to avoid dependency issues for now.

const SRC_DIR = path.resolve(__dirname, '../rsc-cloudflare/rsc-server/src/plugins');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

function scanPlugins() {
    console.log('Scanning plugins for hardcoded IDs...');
    const files = getAllFiles(SRC_DIR);

    // Regex for:
    // 1. "const ID = 123;"
    // 2. "return 123;" inside certain handlers? (Hard)
    // 3. "if (id === 123)"
    const suspiciousRegex = /(?:id|ID|Id)\s*[=:]\s*(\d{2,})|case\s+(\d{2,}):/g;

    const findings = [];

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let match;
        const relativePath = path.relative(SRC_DIR, file);

        while ((match = suspiciousRegex.exec(content)) !== null) {
            const line = content.substring(0, match.index).split('\n').length;
            findings.push({
                file: relativePath,
                line,
                match: match[0],
                value: match[1] || match[2]
            });
        }
    });

    console.log(`Found ${findings.length} potential hardcoded IDs.`);
    // Group by file
    const byFile = findings.reduce((acc, curr) => {
        if (!acc[curr.file]) acc[curr.file] = [];
        acc[curr.file].push(curr);
        return acc;
    }, {});

    Object.keys(byFile).forEach(f => {
        console.log(`\nFile: ${f}`);
        byFile[f].forEach(item => {
            console.log(`  L${item.line}: ${item.match}`);
        });
    });
}

scanPlugins();
