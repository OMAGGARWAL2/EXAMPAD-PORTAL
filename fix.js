const fs = require('fs');
let content = fs.readFileSync('pages/exam-creator.html', 'utf8');

const regex = / \/\/ Rail View \(Grid numbers\).*?secQuestions\.forEach\(\(q, i\) => \{/s;

let newRail = ` // Rail View (Grid numbers)
                railHtml += \`
                    <div style="text-align: center; font-size: 0.65rem; font-weight: 700; color: #888; text-transform: uppercase; margin: 10px 0 4px 0;">\${secName}</div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                \`;
                secQuestions.forEach((q, i) => {
                    railHtml += \`
                        <div class="q-nav-item \${editingQIndex === q.globalIdx ? 'active' : ''}" onclick="editQuestion(\${q.globalIdx})" draggable="true" ondragstart="dragQ(event, \${q.globalIdx})" ondrop="dropQ(event, \${q.globalIdx})" ondragover="allowDrop(event)" ondragenter="dragEnter(event)" ondragleave="dragLeave(event)" ondragend="dragEndQ(event)" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; background: \${editingQIndex === q.globalIdx ? 'var(--primary)' : '#fcfcfc'}; color: \${editingQIndex === q.globalIdx ? '#fff' : '#666'}; border: 1px solid \${editingQIndex === q.globalIdx ? 'var(--primary)' : '#eee'}; border-radius: 0;">
                            \${i + 1}
                        </div>
                    \`;
                });
                railHtml += \`
                    </div>
                \`;
`;

// Wait, I need to match everything up to the next thing:
const fullRegex = / \/\/ Rail View \(Grid numbers\)[\s\S]*?\/\/ Sidebar View \(Detailed cards as per user request\)/;

let replacement = newRail + "                // Sidebar View (Detailed cards as per user request)";

content = content.replace(fullRegex, replacement);

fs.writeFileSync('pages/exam-creator.html', content, 'utf8');
