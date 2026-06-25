const fs = require('fs');
let html = fs.readFileSync('pages/comexam-attempt.html', 'utf8');

// Extract all <script> blocks
let scriptMatches = html.match(/<script>([\s\S]*?)<\/script>/g);
if (scriptMatches) {
    scriptMatches.forEach((scriptTag, idx) => {
        let code = scriptTag.replace(/<\/?script>/g, '');
        fs.writeFileSync(`temp_script_${idx}.js`, code);
        try {
            require('child_process').execSync(`node -c temp_script_${idx}.js`, {stdio: 'pipe'});
            console.log(`Script ${idx} is syntactically valid.`);
        } catch (e) {
            console.log(`Script ${idx} HAS SYNTAX ERROR:`);
            console.log(e.stderr ? e.stderr.toString() : e.message);
        }
    });
} else {
    console.log("No scripts found");
}
