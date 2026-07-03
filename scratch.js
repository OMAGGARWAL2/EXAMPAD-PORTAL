const fs = require('fs');
const file = 'c:/Users/omagg/OneDrive/Desktop/C - 01/EXAMPAD/pages/exam-creator.html';
let content = fs.readFileSync(file, 'utf8');

// Step 5 font weight and sizes
content = content.replace(/font-weight:800; font-size:1.05rem;/g, 'font-weight:600; font-size:0.95rem;');
content = content.replace(/font-weight:900; font-size: 1.3rem;/g, 'font-weight:600; font-size: 1rem;');
content = content.replace(/font-weight:800; font-size: 1.1rem; color: #000; background: #fff; border: 2px solid #ccc;/g, 'font-weight:600; font-size: 1rem; color: #000; background: #fff; border: 2px solid #ccc;');

// Step 2 header
content = content.replace(/background: #cf8469; color: white;/g, 'background: var(--primary); color: white;');
content = content.replace(/<div style="font-weight: 500; font-size: 1.25rem;">/g, '<div style="font-weight: 800; font-size: 1.4rem;">');

fs.writeFileSync(file, content, 'utf8');
console.log('done');
