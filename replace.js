const fs = require('fs');
let file = fs.readFileSync('c:/Users/omagg/OneDrive/Desktop/C - 01/EXAMPAD/pages/exceluploadmodule.html', 'utf8');

// Simple regex replaces for more robustness against formatting changes
file = file.replace(/Bulk Import Architect/g, 'Bulk Course Architect');
file = file.replace(/Exam Creator/g, 'Course Creator');

file = file.replace(/<th onclick="selectColumn\(7\)".*?Section<\/th>/, '<th onclick="selectColumn(7)" style="cursor:pointer; width:120px;" title="Click to select column">Module</th>');
file = file.replace(/<th onclick="selectColumn\(8\)".*?Marks<\/th>/, '');

file = file.replace(/const headers = \['title', 'text', 'opt1', 'opt2', 'opt3', 'opt4', 'answer', 'section', 'marks'\];/, 
"const headers = ['title', 'text', 'opt1', 'opt2', 'opt3', 'opt4', 'answer', 'module'];");

file = file.replace(/let exams = JSON\.parse.*?\|\| \{ questions: \[\], sections: \['General'\], title: '' \};/, 
"let courseData = JSON.parse(localStorage.getItem('current_editing_course')) || { modules: [{ title: 'Module 1', lessons: [] }] };");

file = file.replace(/const sectionOptions = \(exams\.sections && exams\.sections\.length > 0 \? exams\.sections : \['General'\]\)[\s\S]*?\.join\(''\);/, 
"const sectionOptions = (courseData.modules && courseData.modules.length > 0 ? courseData.modules : [{title: 'Module 1'}])\n                .map(m => `<option value=\"${m.title}\">${m.title}</option>`).join('');");

file = file.replace(/'marks': 'Points \(Int\)'/, "");

file = file.replace(/if \(h === 'section'\)/g, "if (h === 'module')");
file = file.replace(/<option value="__NEW__" style="font-weight: bold; color: var\(--primary\);">\+ Add New Section\.\.\.<\/option>/g, 
'<option value="__NEW__" style="font-weight: bold; color: var(--primary);">+ Add New Module...</option>');

file = file.replace(/input\.dataset\.key === 'marks' \|\| /g, "");

file = file.replace(/showPromptModal\('Create New Architecture Section', 'Give your new assessment section a clear, academic title.', \(newVal\) => \{/g, 
"showPromptModal('Create New Architecture Module', 'Give your new module a clear, academic title.', (newVal) => {");

file = file.replace(/if \(!exams\.sections\.includes\(trimmed\)\) \{[\s\S]*?updateAllDropdowns\(trimmed\);\s*\}/g,
"if (!courseData.modules.find(m => m.title === trimmed)) {\n                                    courseData.modules.push({ title: trimmed, lessons: [] });\n                                    updateAllDropdowns(trimmed);\n                                }");

file = file.replace(/e\.target\.value = exams\.sections\[0\];/g, "e.target.value = courseData.modules[0].title;");

file = file.replace(/exams\.sections\.map\(s => `<option value="\$\{s\}">\$\{s\}<\/option>`\)\.join\(''\)/g,
"courseData.modules.map(m => `<option value=\"${m.title}\">${m.title}</option>`).join('')");

file = file.replace(/if \(!exams\.sections\.includes\(val\)\) \{[\s\S]*?updateAllDropdowns\(val\);\s*\}/g,
"if (!courseData.modules.find(m => m.title === val)) {\n                                    courseData.modules.push({ title: val, lessons: [] });\n                                    updateAllDropdowns(val);\n                                }");

file = file.replace(/data\.section = select \? select\.value : 'General';/g, "data.module = select ? select.value : courseData.modules[0].title;");

file = file.replace(/if \(!data\.marks\) \{[\s\S]*?errors\.push\('Marks must be positive number'\);\s*\}\s*\}/g, "");

file = file.replace(/if \(!data\.section \|\| data\.section === '__NEW__'\) errors\.push\('Select Section'\);/g, 
"if (!data.module || data.module === '__NEW__') errors.push('Select Module');");

file = file.replace(/exams = JSON\.parse\(localStorage\.getItem\('exampad_creator_temp'\)\) \|\| \{ questions:\[\], sections:\['General'\] \};/g, 
"courseData = JSON.parse(localStorage.getItem('current_editing_course')) || { modules:[{ title: 'Module 1', lessons: [] }] };");

file = file.replace(/window\.location\.href = '\.\/exam-creator\.html';/g, "window.location.href = './course-creator.html';");

file = file.replace(/data\.section = select\.value;/g, "data.module = select.value;");

file = file.replace(/const marksInt = parseInt\(data\.marks\);[\s\S]*?if \(!data\.section \|\| data\.section === '__NEW__'\) rowErrors\.push\('Section'\);/g, 
"if (!data.module || data.module === '__NEW__') rowErrors.push('Module');");

file = file.replace(/const q = \{[\s\S]*?teacherNotes: 'Imported via Site Excel Grid'\s*\};[\s\S]*?validQuestions\.push\(q\);/g, 
`const less = {
                        id: 'mcq_' + Date.now() + Math.random().toString(36).substr(2, 5),
                        type: 'mcq',
                        title: data.title,
                        data: {
                            question: \`<p>\${data.text}</p>\`,
                            options: options,
                            correct: correctlyMappedAnswer
                        }
                    };
                    validQuestions.push({ lesson: less, moduleTitle: data.module });`);

file = file.replace(/validQuestions\.forEach\(q => \{[\s\S]*?if \(typeof db !== 'undefined'\) db\.addToQuestionPool\(q\);\s*\}\);/g, 
`validQuestions.forEach(item => {
                    let mod = courseData.modules.find(m => m.title === item.moduleTitle);
                    if (!mod) {
                        mod = { title: item.moduleTitle, lessons: [] };
                        courseData.modules.push(mod);
                    }
                    mod.lessons.push(item.lesson);
                });`);

file = file.replace(/localStorage\.setItem\('exampad_creator_temp', JSON\.stringify\(exams\)\);/g, 
"localStorage.setItem('current_editing_course', JSON.stringify(courseData));");

file = file.replace(/const key = select\.dataset\.key;[\s\S]*?if \(key === 'section'\) \{[\s\S]*?select\.value = trimmed;\s*\}/g, 
`const key = select.dataset.key;
                        if (key === 'module') {
                            const trimmed = val.trim();
                            if (trimmed && !courseData.modules.find(m => m.title === trimmed)) {
                                courseData.modules.push({ title: trimmed, lessons: [] });
                                updateAllDropdowns(trimmed);
                            }
                            select.value = trimmed;
                        }`);

file = file.replace(/Move to Section\.\.\./g, 'Move to Module...');
file = file.replace(/showSectionPickerModal/g, 'showModulePickerModal');
file = file.replace(/applySectionToSelection/g, 'applyModuleToSelection');

file = file.replace(/function applySectionToSelection\(sectionName\) \{[\s\S]*?showToast\(\`Moved selection to section: \$\{sectionName\}\`\);\s*\}/g, 
`function applyModuleToSelection(moduleName) {
            const minR = Math.min(selectionStart.r, selectionEnd.r);
            const maxR = Math.max(selectionStart.r, selectionEnd.r);
            for (let r = minR; r <= maxR; r++) {
                const tr = gridBody.children[r];
                const select = tr.querySelector('.cell-select');
                if (select) { select.value = moduleName; }
            }
            validateRealtime();
            showToast(\`Moved selection to module: \${moduleName}\`);
        }`);

file = file.replace(/function showSectionPickerModal\(onConfirm\) \{[\s\S]*?const options = exams\.sections\.map/g, 
`function showModulePickerModal(onConfirm) {
            const overlay = document.getElementById('customModalOverlay');
            const options = courseData.modules.map`);

file = file.replace(/SELECT DESTINATION SECTION/g, "SELECT DESTINATION MODULE");
file = file.replace(/Bulk Move to Section/g, "Bulk Move to Module");
file = file.replace(/Choose the section for all/g, "Choose the module for all");
file = file.replace(/Apply Section/g, "Apply Module");

fs.writeFileSync('c:/Users/omagg/OneDrive/Desktop/C - 01/EXAMPAD/pages/exceluploadmodule.html', file);
console.log('Done');
