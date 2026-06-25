const fs = require('fs');
const path = require('path');

function replaceTextInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    if (content.includes('>exampad<') || content.includes('>exampad<')) {
        content = content.replace(/>exampad</g, '>exampad<');
        content = content.replace(/>exampad</g, '>exampad<');
        changed = true;
    }
    // Also replace exampad with exampad if it's the brand name or logo text
    // as it might be prefixed with space or newline
    const regex1 = />\s*exampad\s*</g;
    const regex2 = />\s*exampad\s*</g;
    if (regex1.test(content) || regex2.test(content)) {
        content = content.replace(regex1, '>exampad<');
        content = content.replace(regex2, '>exampad<');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Replaced text in ${filePath}`);
    }
}

function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            replaceTextInFile(fullPath);
        }
    }
}

traverseDir(__dirname);
