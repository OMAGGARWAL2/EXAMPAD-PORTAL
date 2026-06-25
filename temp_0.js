
        let courseData = { title: '', summary: '', category: 'Engineering & Technology', modules: [], assignments: [], library: [] };
        let currentActiveTab = 'modules';
        let attemptsChart = null;
        
        function renderLibrary() {
            const container = document.getElementById('libraryItemsContainer');
            if (!courseData.library || courseData.library.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 60px 40px; background: #fff; border-radius: 20px; border: 1px dashed #eee;">
                        <i class="fas fa-book-open" style="font-size: 3rem; color: #ddd; margin-bottom: 16px;"></i>
                        <h3 style="font-family: 'Outfit'; color: #888;">No resources added yet</h3>
                        <p style="color: #aaa; font-size: 0.9rem;">Click "Add Resource" to enrich your course with external materials.</p>
                    </div>`;
                return;
            }
            
            container.innerHTML = courseData.library.map((item, idx) => `
                <div style="background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; transition: all 0.2s;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="background: ${item.type === 'pdf' ? '#fee2e2' : '#e0e7ff'}; color: ${item.type === 'pdf' ? '#ef4444' : '#3b82f6'}; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase;">
                                ${item.type}
                            </span>
                            <h4 style="font-family: 'Outfit'; font-size: 1.1rem; color: #202124; margin: 0;">${item.title}</h4>
                        </div>
                        <p style="color: #666; font-size: 0.9rem; margin-bottom: 12px; max-width: 600px;">${item.desc || 'No description provided.'}</p>
                        <a href="${item.url}" target="_blank" style="color: var(--primary); font-size: 0.85rem; font-weight: 600; text-decoration: none;"><i class="fas fa-external-link-alt"></i> Access Resource</a>
                    </div>
                    <button class="btn btn-ghost" style="color: #ef4444;" onclick="deleteLibraryItem(${idx})"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }

        function addLibraryItem() {
            showModal({
                title: "Add Digital Resource",
                desc: "Provide a link to a PDF, external tool, or reference document.",
                body: `
                    <div class="field-group">
                        <label class="field-label">Resource Title</label>
                        <input type="text" id="libTitle" class="standard-input" placeholder="e.g. Course Syllabus">
                    </div>
                    <div class="field-group">
                        <label class="field-label">Resource URL</label>
                        <input type="text" id="libUrl" class="standard-input" placeholder="https://...">
                    </div>
                    <div class="field-group">
                        <label class="field-label">Description / Instructions</label>
                        <textarea id="libDesc" class="standard-input" rows="3" placeholder="Brief context..."></textarea>
                    </div>
                    <div class="field-group">
                        <label class="field-label">Type</label>
                        <select id="libType" class="standard-input">
                            <option value="link">External Link</option>
                            <option value="pdf">PDF Document</option>
                        </select>
                    </div>
                `,
                confirmText: "Add Resource",
                onConfirm: () => {
                    const title = document.getElementById('libTitle').value;
                    const url = document.getElementById('libUrl').value;
                    if (!title || !url) return showToast("Title and URL are required");
                    
                    if (!courseData.library) courseData.library = [];
                    courseData.library.push({
                        title: title,
                        url: url,
                        desc: document.getElementById('libDesc').value,
                        type: document.getElementById('libType').value
                    });
                    
                    saveToLocal();
                    renderLibrary();
                    closeModal();
                    showToast("Resource added successfully");
                }
            });
        }

        function deleteLibraryItem(idx) {
            if (confirm("Remove this resource?")) {
                courseData.library.splice(idx, 1);
                saveToLocal();
                renderLibrary();
            }
        }

        function renderAttempts() {
            const tbody = document.getElementById('attemptsTableBody');
            const progressData = JSON.parse(localStorage.getItem('TESTPAD_course_progress') || '[]');
            const courseProgress = progressData.filter(p => p.courseId === (courseData.id || 'N/A'));

            if (courseProgress.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="padding: 24px; text-align: center; color: #888;">No student attempts found yet.</td></tr>';
                if(attemptsChart) attemptsChart.destroy();
                return;
            }

            // Group by student
            const studentsMap = {};
            courseProgress.forEach(p => {
                if (!studentsMap[p.userId]) {
                    studentsMap[p.userId] = { 
                        id: p.userId, 
                        name: p.userName || 'Unknown Student',
                        timeSpent: 0,
                        completedItems: new Set()
                    };
                }
                studentsMap[p.userId].timeSpent += (p.timeSpent || Math.floor(Math.random() * 60) + 10);
                (p.completedItems || []).forEach(item => studentsMap[p.userId].completedItems.add(item));
            });

            const totalLessons = (courseData.modules || []).reduce((sum, m) => sum + (m.lessons ? m.lessons.length : 0), 0) + 
                                 (courseData.assignments || []).reduce((sum, m) => sum + (m.lessons ? m.lessons.length : 0), 0);

            const studentsList = Object.values(studentsMap);

            tbody.innerHTML = studentsList.map(s => {
                const progressPct = totalLessons > 0 ? Math.round((s.completedItems.size / totalLessons) * 100) : 0;
                return `
                <tr style="border-bottom: 1px solid #f0f0f0;">
                    <td style="padding: 16px 24px; font-weight: 600; color: #333;">${s.id}</td>
                    <td style="padding: 16px 24px; font-weight: 500; color: #555;">${s.name}</td>
                    <td style="padding: 16px 24px; color: #666;">${s.timeSpent} mins</td>
                    <td style="padding: 16px 24px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="flex: 1; height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; background: var(--primary); width: ${progressPct}%;"></div>
                            </div>
                            <span style="font-size: 0.8rem; font-weight: 700; color: #555; width: 35px;">${progressPct}%</span>
                        </div>
                    </td>
                </tr>
                `;
            }).join('');

            // Bar Graph
            const ctx = document.getElementById('attemptsBarChart').getContext('2d');
            if (attemptsChart) attemptsChart.destroy();

            const labels = studentsList.map(s => s.name);
            const data = studentsList.map(s => s.timeSpent);

            attemptsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Time Spent (mins)',
                        data: data,
                        backgroundColor: '#DE6834',
                        borderRadius: 4
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: 'Minutes' } }
                    }
                }
            });
        }
        
        function getActiveModules() {
            if (currentActiveTab === 'assignments') {
                if (!courseData.assignments) courseData.assignments = [];
                return courseData.assignments;
            }
            if (!courseData.modules) courseData.modules = [];
            return courseData.modules;
        }

                function switchDashboardTab(tab, el) {
            if (tab === currentActiveTab) return;
            currentActiveTab = tab;
            
            document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
            el.classList.add('active');
            
            document.getElementById('welcomeState').style.display = 'block';
            document.getElementById('lessonEditor').style.display = 'none';
            
            document.getElementById('modulesContainer').style.display = 'none';
            document.getElementById('attemptsView').style.display = 'none';
            document.getElementById('digitalLibraryView').style.display = 'none';

            if (tab === 'attempts') {
                document.getElementById('attemptsView').style.display = 'block';
                renderAttempts();
            } else if (tab === 'digital_library') {
                document.getElementById('digitalLibraryView').style.display = 'block';
                renderLibrary();
            } else {
                currentModuleIndex = -1;
                document.getElementById('modulesContainer').style.display = 'block';
                renderCurriculum();
            }
        }
        let currentModuleIndex = -1;
        let currentLessonType = '';
        let quillEditor = null;
        let inlineAceEditors = {};
        let editingId = null;

        window.onload = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const courseId = urlParams.get('id');

            if (courseId) {
                const course = db.getCourseById(courseId);
                if (course) {
                    editingId = courseId;
                    courseData = course;
                    renderCurriculum();
                    return;
                }
            }

            const saved = localStorage.getItem('current_editing_course');
            if (saved) {
                try {
                    courseData = JSON.parse(saved);
                    editingId = courseData.id || null;
                    renderCurriculum();
                } catch (e) {
                    console.error("Error parsing saved course", e);
                    localStorage.removeItem('current_editing_course');
                    loadDefaultCourse();
                }
            } else {
                loadDefaultCourse();
            }
        };

        function loadDefaultCourse() {
            courseData = { title: 'Untitled Course', summary: '', category: 'Engineering & Technology', modules: [{ title: 'Introduction', lessons: [] }], assignments: [] };
            renderCurriculum();
        }

        function initMonaco() {
            if (window.monacoLoaded) return;
            window.monacoLoaded = true;

            require.config({
                paths: {
                    'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
                }
            });
        }

        function renderCurriculum() {
            const list = document.getElementById('curriculumList');
            const carousel = document.getElementById('moduleCarousel');
            const lessonList = document.getElementById('dashLessonList');

            list.innerHTML = '';
            carousel.innerHTML = '';

            document.getElementById('dashCourseTitle').innerText = courseData.title || 'Untitled Course';

            getActiveModules().forEach((mod, mIdx) => {
                // Sidebar List
                const card = document.createElement('div');
                card.className = `module-card ${currentModuleIndex === mIdx ? 'active' : ''}`;
                card.innerHTML = `
                    <div class="module-head" onclick="selectModule(${mIdx})">
                        <div class="module-info">
                            <div class="module-index">${mIdx + 1}</div>
                            <span class="module-title">${mod.title}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="delete-action" title="Delete Module" onclick="event.stopPropagation(); confirmDeleteModule(${mIdx})">
                                <i class="fas fa-trash-alt"></i>
                            </div>
                            <i class="fas fa-chevron-down" style="font-size: 0.8rem; color: #ccc;"></i>
                        </div>
                    </div>
                `;
                list.appendChild(card);

                // Dashboard Carousel Card
                const dashCard = document.createElement('div');
                dashCard.className = `dash-mod-card ${currentModuleIndex === mIdx ? 'active' : ''}`;
                dashCard.onclick = () => selectModule(mIdx);

                const artCount = (mod.lessons || []).filter(l => l.type === 'reading' || l.type === 'video').length;
                const qCount = (mod.lessons || []).filter(l => !['reading', 'video'].includes(l.type)).length;

                dashCard.innerHTML = `
                    <div class="mod-dash-idx">${mIdx + 1}</div>
                    <div class="mod-dash-stat">ACTIVE</div>
                    <span class="mod-dash-title">${mod.title}</span>
                    <div class="mod-dash-counts">
                        <div style="display:flex; align-items:center; gap:6px;"><i class="far fa-file-alt"></i> ${artCount}</div>
                        <div style="display:flex; align-items:center; gap:6px;"><i class="far fa-question-circle"></i> ${qCount}</div>
                    </div>
                `;
                carousel.appendChild(dashCard);
            });

            // If a module is selected, render its detailed lessons
            if (currentModuleIndex !== -1) {
                document.getElementById('moduleDetailedView').style.display = 'block';
                document.getElementById('dashEmptyState').style.display = 'none';
                const mod = getActiveModules()[currentModuleIndex];
                document.getElementById('selectedModName').innerText = mod.title;

                lessonList.innerHTML = mod.lessons.map((less, lIdx) => `
                    <div class="dash-lesson-item" onclick="editLesson(${currentModuleIndex}, ${lIdx})">
                        <span class="dl-idx">${lIdx + 1}</span>
                        <span class="dl-type">${less.type}</span>
                        <span class="dl-title">${less.title}</span>
                        <div class="dl-actions">
                            <button class="btn-fullscreen-toggle" style="background:transparent; border:none;" onclick="event.stopPropagation(); deleteLesson(${currentModuleIndex}, ${lIdx})"><i class="fas fa-trash-alt"></i></button>
                            <i class="fas fa-chevron-right" style="color:#eee"></i>
                        </div>
                    </div>
                `).join('');

                if (mod.lessons.length === 0) {
                    lessonList.innerHTML = `<div style="padding:40px; text-align:center; color:#ccc; font-style:italic;">No lessons architecture yet. Start by adding intellectual content.</div>`;
                }
            } else {
                document.getElementById('moduleDetailedView').style.display = 'none';
                document.getElementById('dashEmptyState').style.display = 'block';
            }
        }

        function selectModule(idx) {
            currentModuleIndex = idx;
            document.getElementById('welcomeState').style.display = 'block';
            document.getElementById('lessonEditor').style.display = 'none';
            renderCurriculum();
        }

        function confirmDeleteModule(mIdx) {
            if (confirm(`Confirm: Removal of module "${getActiveModules()[mIdx].title}" will also delete all associated nested content.`)) {
                getActiveModules().splice(mIdx, 1);
                if (currentModuleIndex >= getActiveModules().length) {
                    currentModuleIndex = -1;
                }
                renderCurriculum();
                saveToLocal();
                showToast("Module archived.");
            }
        }

        function deleteLesson(mIdx, lIdx) {
            const mod = getActiveModules()[mIdx];
            const less = mod.lessons[lIdx];
            if (confirm(`Delete lesson "${less.title}"?`)) {
                mod.lessons.splice(lIdx, 1);
                saveToLocal();
                renderCurriculum();
                showToast("Lesson deleted");
            }
        }

        function getIcon(t) {
            const map = {
                video: '<i class="fas fa-play-circle"></i>',
                reading: '<i class="fas fa-book-open"></i>',
                coding: '<img src="https://course.testpad.chitkara.edu.in/icons/playground.svg" style="width:18px;height:18px;">',
                mcq: '<img src="https://course.testpad.chitkara.edu.in/icons/quiz.svg" style="width:18px;height:18px;">',
                drawing: '<i class="fas fa-paint-brush"></i>',
                assertion: '<i class="fas fa-balance-scale"></i>',
                diagram: '<i class="fas fa-project-diagram"></i>',
                quiz: '<i class="fas fa-tasks"></i>'
            };
            return map[t] || '<i class="fas fa-circle"></i>';
        }

        function toggleModule(idx) {
            currentModuleIndex = currentModuleIndex === idx ? -1 : idx;
            renderCurriculum();
        }

        function addNewModule() {
            showPrompt("New Module", "Enter module title:", "e.g. Fundamentals", (t) => {
                getActiveModules().push({ title: t, lessons: [] });
                renderCurriculum();
                saveToLocal();
            });
        }

        let currentLessonId = null;

        function toggleAddContentDropdown(e) {
            if(e) e.stopPropagation();
            document.getElementById('addContentDropdown').classList.toggle('show');
        }

        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key.toLowerCase() === 'n') {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    if (currentActiveTab === 'modules') {
                        addNewModule();
                    } else if (currentActiveTab === 'assignments') {
                        addNewAssignment();
                    }
                }
            }
        });

        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('addContentDropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });

        function startNewLessonWithType(type) {
            document.getElementById('addContentDropdown').classList.remove('show');
            startNewLesson(currentModuleIndex);
            initLessonType(type);
        }

        function openPoolImporterForCurrentModule() {
            const dropdown = document.getElementById('addContentDropdown');
            if (dropdown) dropdown.classList.remove('show');
            
            if (typeof db === 'undefined' || !db.getQuestionPool) {
                return showToast('Database not available');
            }
            
            const pool = db.getQuestionPool();
            if (!pool || pool.length === 0) {
                return showToast('Question Pool is currently empty');
            }
            
            const html = `
                <div style="margin-bottom: 20px; display: flex; gap: 15px; align-items: center; background: #fdf8f5; padding: 15px; border-radius: 12px; border: 1px solid #ffe8dd;">
                    <div style="flex: 1; position: relative;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--primary); opacity: 0.6;"></i>
                        <input type="text" id="cPoolSearchInput" placeholder="Search by title (e.g. cn/)..." 
                               style="width: 100%; padding: 12px 12px 12px 45px; border-radius: 10px; border: 1.5px solid #eee; font-size: 0.95rem; outline: none; transition: all 0.2s;"
                               oninput="filterCoursePoolModal(this.value)">
                    </div>
                    <button class="btn btn-ghost" onclick="importAllFilteredToCourse()" id="importAllCPoolBtn" style="height: 48px; border-color: var(--primary); color: var(--primary); font-weight: 700;">IMPORT ALL</button>
                    <button class="btn btn-run" onclick="importSelectedToCourse()" id="importSelectedCPoolBtn" style="height: 48px; padding: 0 30px;">IMPORT SELECTED (0)</button>
                </div>
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px; padding: 0 10px;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: #666; cursor: pointer;">
                        <input type="checkbox" id="cPoolSelectAll" onchange="toggleCPoolSelectAll(this.checked)" style="width: 18px; height: 18px;">
                        SELECT ALL
                    </label>
                    <span id="cPoolMatchCount" style="font-size: 0.75rem; color: #999; font-weight: 600;">Showing ${pool.length} questions</span>
                </div>
                <div id="cPoolModalList" style="max-height: 450px; overflow-y: auto; border: 1px solid #eee; border-radius: 12px; background: #fcfcfc;">
                    ${pool.map(q => {
                        const heading = q.heading || q.title || 'Untitled Question';
                        const dateStr = q.addedAt ? new Date(q.addedAt).toDateString() : '';
                        return `
                        <div class="c-pool-item" data-heading="${heading.toLowerCase()}" data-id="${q.poolId}" style="padding: 15px 20px; border-bottom: 1px solid #f0f0f0; display: flex; gap: 15px; align-items: center; background: #fff; transition: all 0.2s;">
                            <input type="checkbox" class="c-pool-item-check" value="${q.poolId}" onchange="updateCPoolSelectedCount()" style="width: 20px; height: 20px; cursor: pointer;">
                            <div style="flex:1;">
                                <div style="font-weight: 800; font-size: 1rem; color: #1a1a1b;">${heading}</div>
                                <div style="font-size: 0.75rem; color: #666; text-transform: uppercase; font-weight: 700; margin-top:4px; display: flex; align-items: center; gap: 10px;">
                                    <span style="color: var(--primary); background: #fff5f0; padding: 2px 8px; border-radius: 4px;">${q.type || 'MCQ'}</span>
                                    <span><i class="fas fa-star" style="margin-right: 4px; color: #fbbf24;"></i> ${q.marks || 0} Marks</span>
                                </div>
                                ${dateStr ? `<div style="font-size: 0.65rem; color: #bbb; margin-top: 6px; font-weight:500;"><i class="far fa-calendar-alt"></i> Stored: ${dateStr}</div>` : ''}
                            </div>
                            <button class="btn btn-ghost" onclick="importSingleQuestionToCurrentModule('${q.poolId}')" style="height: 36px; font-size: 0.75rem; padding: 0 20px; width:auto; border-radius: 8px;">IMPORT</button>
                        </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            showModal({
                title: 'Global Question Pool',
                desc: 'Search and select multiple questions to instantly architect your assessment timeline.',
                body: html,
                confirmText: 'Close',
                onConfirm: () => { closeModal(); }
            });
        }
        
        window.filterCoursePoolModal = (query) => {
            const q = query.toLowerCase();
            const items = document.querySelectorAll('.c-pool-item');
            let count = 0;
            items.forEach(item => {
                const heading = item.getAttribute('data-heading');
                const isVisible = heading.includes(q);
                item.style.display = isVisible ? 'flex' : 'none';
                if (isVisible) count++;
            });
            document.getElementById('cPoolMatchCount').textContent = `Showing ${count} questions`;
            document.getElementById('importAllCPoolBtn').textContent = q ? `IMPORT ALL MATCHING` : 'IMPORT ALL';
        };

        window.toggleCPoolSelectAll = (checked) => {
            const visibleChecks = Array.from(document.querySelectorAll('.c-pool-item')).filter(i => i.style.display !== 'none').map(i => i.querySelector('.c-pool-item-check'));
            visibleChecks.forEach(c => c.checked = checked);
            updateCPoolSelectedCount();
        };

        window.updateCPoolSelectedCount = () => {
            const checked = document.querySelectorAll('.c-pool-item-check:checked').length;
            const btn = document.getElementById('importSelectedCPoolBtn');
            if (btn) btn.textContent = `IMPORT SELECTED (${checked})`;
        };

        window.importSelectedToCourse = () => {
            const checked = Array.from(document.querySelectorAll('.c-pool-item-check:checked')).map(c => c.value);
            if (checked.length === 0) return showToast('No questions selected');
            
            checked.forEach(id => importSingleQuestionToCurrentModule(id, true));
            showToast(`Bulk imported ${checked.length} questions`);
            closeModal();
            
            if (document.getElementById('lessonEditor').style.display === 'block') {
                goBackToOverview();
            }
        };

        window.importAllFilteredToCourse = () => {
            const visibleItems = Array.from(document.querySelectorAll('.c-pool-item')).filter(i => i.style.display !== 'none');
            const ids = visibleItems.map(i => i.getAttribute('data-id'));
            
            if (ids.length === 0) return showToast('No matching questions to import');
            
            ids.forEach(id => importSingleQuestionToCurrentModule(id, true));
            showToast(`Imported all ${ids.length} matching questions`);
            closeModal();
            
            if (document.getElementById('lessonEditor').style.display === 'block') {
                goBackToOverview();
            }
        };
        
        window.importSingleQuestionToCurrentModule = (poolId, isSilent = false) => {
            const pool = db.getQuestionPool();
            const q = pool.find(x => x.poolId === poolId);
            if (!q) return showToast('Question not found');
            
            if (currentModuleIndex === -1) {
                if (getActiveModules().length === 0) return showToast('Create a module first.');
                currentModuleIndex = 0;
            }
            
            const lesson = {
                id: 'less_' + Date.now() + Math.random(),
                title: q.heading || 'Imported Question',
                type: q.type || 'coding',
                data: {}
            };
            
            if (q.type === 'coding') {
                lesson.data.description = q.title;
                lesson.data.languages = Object.keys(q.code || {});
                lesson.data.code = q.code;
                lesson.data.testCases = q.testCases;
            } else if (q.type === 'mcq') {
                lesson.data.question = q.title;
                lesson.data.options = q.options;
                lesson.data.correct = q.correct;
            } else {
                lesson.data.question = q.title;
            }
            
            if (!getActiveModules()[currentModuleIndex].lessons) getActiveModules()[currentModuleIndex].lessons = [];
            getActiveModules()[currentModuleIndex].lessons.push(lesson);
            
            saveToLocal();
            renderCurriculum();
            if (!isSilent) {
                closeModal();
                showToast("Question imported successfully!");
                
                if (document.getElementById('lessonEditor').style.display === 'block') {
                    goBackToOverview();
                }
            }
        };

        function startNewLesson(mIdx) {
            currentModuleIndex = mIdx;
            currentLessonId = null;
            destroyQuills(); // Clean up previous editors
            inlineAceEditors = {}; // Reset ace refs
            document.getElementById('welcomeState').style.display = 'none';
            document.getElementById('lessonEditor').style.display = 'block';
            document.getElementById('typeSelector').style.display = 'none';
            document.getElementById('formContainer').innerHTML = '';
            document.getElementById('lTitle').value = '';
        }

        let inlineMonacoEditors = {};
        let activeQuills = {};

        function initQuill(id, content = '') {
            const el = document.getElementById(id);
            if (!el) return;

            // If already exists, just update content and return
            if (activeQuills[id]) {
                if (content) activeQuills[id].root.innerHTML = content;
                return activeQuills[id];
            }

            const editor = new Quill('#' + id, {
                theme: 'snow',
                placeholder: 'Type content here...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['code-block', 'link', 'image'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['clean']
                    ]
                }
            });

            if (content) editor.root.innerHTML = content;
            activeQuills[id] = editor;
            
            // Fix: Ensure the editor is focusable and interactive
            editor.root.setAttribute('spellcheck', 'false');
            editor.on('selection-change', (range) => {
                if (range) {
                    el.style.borderColor = 'var(--primary)';
                } else {
                    el.style.borderColor = '#e0e0e0';
                }
            });

            return editor;
        }

        function destroyQuills() {
            activeQuills = {};
        }

        function initLessonType(type) {
            destroyQuills();
            currentLessonType = type;
            document.getElementById('typeSelector').style.display = 'none';
            const container = document.getElementById('formContainer');
            container.innerHTML = '';

            if (type === 'video') {
                container.innerHTML = `
                    <div class="field-group"><label class="field-label">Video URL</label><input type="text" id="vUrl" class="standard-input" placeholder="YouTube or direct link..."></div>
                    <div class="field-group"><label class="field-label">Notes</label><div id="q-video" style="height:300px"></div></div>
                `;
                setTimeout(() => initQuill('q-video'), 50);
            } else if (type === 'reading') {
                container.innerHTML = `<div class="field-group"><label class="field-label">Article</label><div id="q-read" style="height:600px"></div></div>`;
                setTimeout(() => initQuill('q-read'), 50);
            } else if (type === 'coding') {
                container.innerHTML = `
                    <div class="split-builder">
                        <!-- Left: Problem Statement -->
                        <div class="builder-left">
                            <div class="question-id-wrapper" style="margin-bottom: 30px;">
                                <div class="section-tag" style="margin-bottom: 8px; font-size: 0.75rem; font-weight: 700; color: #DE6834; text-transform: uppercase; letter-spacing: 1px;">LESSON STATEMENT</div>
                                <input type="text" class="clean-input" value="Problem Statement" style="border-bottom: none; font-size: 1.8rem; letter-spacing: -0.5px; color: #1a1a1b; padding: 12px 0; width: 100%; font-weight: 600; outline: none; background: transparent; font-family: 'Hind', sans-serif;" readonly>
                                <div class="tri-orange-line" style="width: 250px; margin-bottom: 24px; height: 4px; border-radius: 2px; display: flex; overflow: hidden;">
                                    <div style="flex:1; background:#DE6834; opacity:0.2;"></div>
                                    <div style="flex:1; background:#DE6834; opacity:0.5;"></div>
                                    <div style="flex:1; background:#DE6834; opacity:1.0;"></div>
                                </div>
                            </div>
                            <div class="field-group">
                                <label class="field-label" style="display:flex; justify-content:space-between; align-items:center;">
                                    Editor Content
                                    <span style="font-size:0.7rem; color:var(--primary); font-weight:700;">QUILL EDITOR ACTIVE</span>
                                </label>
                                <div id="q-code" class="editor-workspace"></div>
                            </div>
                        </div>

                        <!-- Right: Logic & Code Templates -->
                        <div class="builder-right">
                            <div class="field-group">
                                <label class="field-label">Configure Logic</label>
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                    <span style="font-size:0.8rem; color:#666;">Allowed Languages</span>
                                    <button class="btn btn-ghost" style="font-size:0.7rem;" onclick="toggleAllLangs()">Select All</button>
                                </div>
                                <div class="type-grid" id="langSelectorGrid" style="grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); margin-top:0;"></div>
                            </div>

                            <div id="languageCodeTemplates" style="margin-top:24px;"></div>

                            <div class="field-group" style="margin-top:32px; border-top:1px dashed #ddd; padding-top:24px;">
                                <label class="field-label">Validation Suite</label>
                                <div id="testCasesContainer"></div>
                                <div style="display: flex; gap: 12px; margin-top: 12px;">
                                    <button class="btn btn-ghost" style="flex:1; border:1px dashed #ddd; background:#fff;" onclick="cloneTestCase(true)">+ Clone Sample Test</button>
                                    <button class="btn btn-ghost" style="flex:1; border:1px dashed #ddd; background:#fff;" onclick="cloneTestCase(false)">+ Clone Hidden Test Case</button>
                                </div>
                                <button class="btn btn-ghost" style="width:100%; border:1px dashed #10a37f; color:#10a37f; margin-top:12px;" onclick="document.getElementById('excelUploadCode').click()"><i class="fas fa-file-excel"></i> Bulk Upload Coding Tests (Excel)</button>
                                <button class="btn btn-ghost" style="width:100%; border:1px dashed #D96C33; color:#D96C33; margin-top:12px;" onclick="location.href='./exceluploadmodule.html'"><i class="fas fa-external-link-alt"></i> Upload Bulk Questions via Portal Page</button>
                                <input type="file" id="excelUploadCode" accept=".csv, .xlsx" style="display:none;" onchange="handleExcelUpload(event, 'coding')">
                            </div>
                        </div>
                    </div>
                `;
                setTimeout(() => {
                    initQuill('q-code');
                    populateLanguages();
                    addTestCaseRow('// Input', '// Output', true);
                }, 50);
            } else if (type === 'assertion') {
                container.innerHTML = `
                    <div class="field-group">
                        <label class="field-label">Assertion (Statement A)</label>
                        <div id="q-assertion" class="editor-workspace" style="height:150px"></div>
                    </div>
                    <div class="field-group">
                        <label class="field-label">Reason (Statement R)</label>
                        <div id="q-reason" class="editor-workspace" style="height:150px"></div>
                    </div>
                    <div class="field-group">
                        <label class="field-label">Answer Pattern</label>
                        <select id="arAns" class="standard-input">
                            <option value="1">Both A & R true, R is correct explanation</option>
                            <option value="2">Both true, R not correct explanation</option>
                            <option value="3">A is true, R is false</option>
                            <option value="4">A is false, R is true</option>
                        </select>
                    </div>
                `;
                setTimeout(() => {
                    initQuill('q-assertion');
                    initQuill('q-reason');
                }, 50);
            } else if (type === 'diagram') {
                container.innerHTML = `
                    <div class="field-group"><label class="field-label">Reference Image URL</label><input type="text" id="diagUrl" class="standard-input" placeholder="https://..."></div>
                    <label class="field-label">Question Text</label>
                    <div id="q-diag" class="editor-workspace" style="height:200px"></div>
                    <div id="diagOptions" style="margin-top:20px; display:flex; flex-direction:column; gap:16px;"></div>
                    <button class="btn btn-ghost" style="width:100%; border:1px dashed #ddd; margin-top:12px;" onclick="addDiagOpt()">+ Add Option</button>
                `;
                setTimeout(() => initQuill('q-diag'), 50);
                addDiagOpt(); addDiagOpt();
            } else if (type === 'mcq') {
                container.innerHTML = `
                    <div class="field-group">
                        <label class="field-label">Question Text</label>
                        <div id="q-mcq" class="editor-workspace" style="height:250px"></div>
                    </div>
                    <div id="mcqOptions" style="display:flex; flex-direction:column; gap:16px;"></div>
                    <button class="btn btn-ghost" style="width:100%; border:1px dashed #ddd; margin-top:12px;" onclick="addMcqOpt()">+ Add Option (Pick one correct)</button>
                    <button class="btn btn-ghost" style="width:100%; border:1px dashed #10a37f; color:#10a37f; margin-top:12px;" onclick="document.getElementById('excelUploadMcq').click()"><i class="fas fa-file-excel"></i> Bulk Upload MCQs (Excel)</button>
                    <button class="btn btn-ghost" style="width:100%; border:1px dashed #D96C33; color:#D96C33; margin-top:12px;" onclick="location.href='./exceluploadmodule.html'"><i class="fas fa-external-link-alt"></i> Upload Bulk MCQ via Portal Page</button>
                    <input type="file" id="excelUploadMcq" accept=".csv, .xlsx" style="display:none;" onchange="handleExcelUpload(event, 'mcq')">
                `;
                setTimeout(() => initQuill('q-mcq'), 50);
                addMcqOpt(); addMcqOpt(); addMcqOpt(); addMcqOpt();
            } else if (type === 'drawing') {
                container.innerHTML = `
                    <div class="field-group">
                        <label class="field-label">Instruction / Problem Statement</label>
                        <div id="drawing-editor" class="editor-workspace"></div>
                    </div>
                `;
                setTimeout(() => initQuill('drawing-editor'), 50);
            } else if (type === 'quiz') {
                container.innerHTML = `
                    <div class="field-group">
                        <label class="field-label">Quiz Question</label>
                        <div id="q-quiz" class="editor-workspace" style="height:200px"></div>
                    </div>
                    <div id="quizOptions" style="display:flex; flex-direction:column; gap:16px;"></div>
                    <button class="btn btn-ghost" style="width:100%; border:1px dashed #ddd; margin-top:12px;" onclick="addQuizOpt()">+ Add Option</button>
                `;
                setTimeout(() => initQuill('q-quiz'), 50);
                addQuizOpt(); addQuizOpt();
            }
        }

        function handleExcelUpload(event, type) {
            const file = event.target.files[0];
            if (file) {
                showToast(`Processing ${file.name}...`, "info");
                setTimeout(() => {
                    const dummyCount = Math.floor(Math.random() * 5) + 2;
                    for (let i = 0; i < dummyCount; i++) {
                        getActiveModules()[currentModuleIndex].lessons.push({
                            id: 'bulk_' + Date.now() + i,
                            type: type,
                            title: `Imported ${type.toUpperCase()} from Excel ${i + 1}`,
                            data: {}
                        });
                    }
                    saveToLocal();
                    renderCurriculum();
                    goBackToOverview();
                    showToast(`Successfully imported bulk ${type} questions!`);
                }, 1000);
            }
        }

        function addMcqOpt() {
            const id = 'opt_' + Math.random().toString(36).substr(2, 9);
            const div = document.createElement('div');
            div.className = 'mcq-option';
            div.innerHTML = `
                <div class="opt-check" onclick="setMcqCorrect(this)"></div>
                <div>
                   <label style="font-size:0.65rem; font-weight:800; color:#999; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block;">Choice Content</label>
                   <div id="${id}" class="editor-workspace" style="height:140px; min-height:140px; border:none; background:transparent;"></div>
                </div>
                <div style="display:flex; justify-content:center;">
                    <i class="fas fa-trash-alt delete-action" style="font-size:1rem;" onclick="this.parentElement.parentElement.remove()"></i>
                </div>
            `;
            document.getElementById('mcqOptions').appendChild(div);
            setTimeout(() => initQuill(id), 50);
        }

        function setMcqCorrect(el) {
            document.querySelectorAll('#mcqOptions .mcq-option').forEach(o => o.classList.remove('correct'));
            el.parentElement.parentElement.parentElement.classList.add('correct');
        }

        function applyCodingTemplate() {
            const langs = Array.from(document.querySelectorAll('#langSelectorGrid input:checked')).map(c => c.value);
            if (langs.length === 0) return showToast("Select languages first");

            const templates = {
                python: {
                    prefix: "# Import necessary modules\nimport math\n",
                    middle: "def solution(n):\n    # Write your logic here\n    return n\n",
                    suffix: "# Test Execution\nif __name__ == '__main__':\n    import sys\n    input_val = sys.stdin.read().strip()\n    print(solution(int(input_val)))\n"
                },
                javascript: {
                    prefix: "// Global utilities\nconst _ = require('lodash');\n",
                    middle: "function solution(n) {\n    // Write your logic here\n    return n;\n}\n",
                    suffix: "// Execution logic\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim();\nconsole.log(solution(parseInt(input)));\n"
                },
                cpp: {
                    prefix: "#include <iostream>\n#include <vector>\nusing namespace std;\n",
                    middle: "int solution(int n) {\n    // Write your code here\n    return n;\n}\n",
                    suffix: "int main() {\n    int n;\n    cin >> n;\n    cout << solution(n) << endl;\n    return 0;\n}\n"
                },
                java: {
                    prefix: "import java.util.*;\n",
                    middle: "class Solution {\n    public int solve(int n) {\n        // Your code here\n        return n;\n    }\n}\n",
                    suffix: "public class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        System.out.println(new Solution().solve(n));\n    }\n}\n"
                }
            };

            langs.forEach(l => {
                const t = templates[l];
                if (t && inlineAceEditors[`code_prefix_${l}`]) {
                    inlineAceEditors[`code_prefix_${l}`].setValue(t.prefix, -1);
                    inlineAceEditors[`code_middle_${l}`].setValue(t.middle, -1);
                    inlineAceEditors[`code_suffix_${l}`].setValue(t.suffix, -1);
                }
            });
            showToast("Boilerplate templates applied!");
        }

        function populateLanguages() {
            const grid = document.getElementById('langSelectorGrid');
            if (!grid) {
                console.error("Language Grid not found in DOM!");
                return;
            }
            const langs = [
                { id: 'python', name: 'Python' }, 
                { id: 'javascript', name: 'JavaScript' }, 
                { id: 'java', name: 'Java' }, 
                { id: 'cpp', name: 'C++' },
                { id: 'c', name: 'C' }
            ];
            grid.innerHTML = langs.map(l => `
                <label class="lang-check" style="min-width:120px; border:1px solid #ddd; background:#fff; padding:12px; border-radius:8px; display:flex; align-items:center; gap:8px;">
                    <input type="checkbox" value="${l.id}" onchange="updateLanguages()" style="width:18px; height:18px;">
                    <span style="font-weight:700;">${l.name}</span>
                </label>
            `).join('');
            console.log("Languages Populated");
        }

        function toggleAllLangs() {
            const checks = document.querySelectorAll('#langSelectorGrid input');
            const anyUnchecked = Array.from(checks).some(c => !c.checked);
            checks.forEach(c => c.checked = anyUnchecked);
            updateLanguages();
        }

        let activeAceEditor = null;
        let aceTargetId = null;

        function updateLanguages(savedCodes = null) {
            const langs = Array.from(document.querySelectorAll('#langSelectorGrid input:checked')).map(c => c.value);
            const container = document.getElementById('languageCodeTemplates');

            // Dispose existing
            Object.values(inlineAceEditors).forEach(ed => ed.destroy());
            inlineAceEditors = {};

            container.innerHTML = langs.map(l => {
                const prefixId = `code_prefix_${l}`;
                const middleId = `code_middle_${l}`;
                const suffixId = `code_suffix_${l}`;

                return `
                <div class="code-workspace-block">
                    <div class="workspace-lang-title">${l.toUpperCase()} WORKSPACE</div>
                    <div class="code-sub-container">
                        <div class="code-header-row">
                            <span class="code-label-main">HEADER (HIDDEN FROM STUDENT)</span>
                            <div class="code-controls">
                                <button class="btn-fullscreen-toggle" onclick="openEditorOverlay('${prefixId}', '${l}', 'HEADER')">[ FULLSCREEN ]</button>
                                <label style="font-size:0.75rem; color:#666; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="lock_prefix_${l}" checked> Locked</label>
                                <label style="font-size:0.75rem; color:#666; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="hide_prefix_${l}"> Visible to student</label>
                            </div>
                        </div>
                        <div id="${prefixId}" style="height:100px; width: 100%;"></div>
                    </div>
                    <div class="code-sub-container" style="margin-top:16px;">
                        <div class="code-header-row">
                            <span class="code-label-main">CODE TEMPLATE (STUDENT EDITOR)</span>
                            <div class="code-controls">
                                <button class="btn-fullscreen-toggle" onclick="openEditorOverlay('${middleId}', '${l}', 'TEMPLATE')">[ FULLSCREEN ]</button>
                            </div>
                        </div>
                        <div id="${middleId}" style="height:200px; width: 100%;"></div>
                    </div>
                    <div class="code-sub-container" style="margin-top:16px; margin-bottom:0;">
                        <div class="code-header-row">
                            <span class="code-label-main">FOOTER (READ-ONLY)</span>
                            <div class="code-controls">
                                <button class="btn-fullscreen-toggle" onclick="openEditorOverlay('${suffixId}', '${l}', 'FOOTER')">[ FULLSCREEN ]</button>
                                <label style="font-size:0.75rem; color:#666; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="lock_suffix_${l}" checked> Locked</label>
                                <label style="font-size:0.75rem; color:#666; display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="hide_suffix_${l}"> Visible to student</label>
                            </div>
                        </div>
                        <div id="${suffixId}" style="height:100px; width: 100%;"></div>
                    </div>
                </div>
                `;
            }).join('');

            langs.forEach(l => {
                const code = savedCodes ? savedCodes[l] : null;
                initAceInline(`code_prefix_${l}`, l, code ? code.prefix : '// Setup...');
                initAceInline(`code_middle_${l}`, l, code ? code.middle : '// Your code here...');
                initAceInline(`code_suffix_${l}`, l, code ? code.suffix : '// Execution...');

                if (code) {
                    document.getElementById(`lock_prefix_${l}`).checked = code.lockPrefix;
                    document.getElementById(`lock_suffix_${l}`).checked = code.lockSuffix;
                    document.getElementById(`hide_prefix_${l}`).checked = code.hidePrefix;
                    document.getElementById(`hide_suffix_${l}`).checked = code.hideSuffix;
                }
            });
        }

        function getAceMode(lang) {
            if (lang === 'python') return 'ace/mode/python';
            if (lang === 'cpp' || lang === 'c') return 'ace/mode/c_cpp';
            if (lang === 'java') return 'ace/mode/java';
            return 'ace/mode/javascript';
        }

        function openEditorOverlay(sourceId, lang, title) {
            aceTargetId = sourceId;
            document.getElementById('overlayTitle').textContent = `${lang.toUpperCase()} ARCHITECT - ${title}`;
            document.getElementById('editorOverlay').style.display = 'flex';

            const initialValue = inlineAceEditors[sourceId] ? inlineAceEditors[sourceId].getValue() : '';

            if (!activeAceEditor) {
                activeAceEditor = window.ace.edit('monaco-container');
                activeAceEditor.setTheme('ace/theme/textmate');
                activeAceEditor.session.setMode(getAceMode(lang));
                activeAceEditor.setOptions({
                    fontSize: "18px",
                    fontFamily: "Consolas",
                    enableBasicAutocompletion: false,
                    enableLiveAutocompletion: false,
                    enableSnippets: false
                });
                activeAceEditor.session.setUseWorker(false);
                activeAceEditor.setValue(initialValue, -1);
            } else {
                activeAceEditor.session.setMode(getAceMode(lang));
                activeAceEditor.setValue(initialValue, -1);
            }
        }

        function closeEditorOverlay() {
            if (activeAceEditor && aceTargetId) {
                if (inlineAceEditors[aceTargetId]) {
                    inlineAceEditors[aceTargetId].setValue(activeAceEditor.getValue(), -1);
                }
            }
            document.getElementById('editorOverlay').style.display = 'none';
            aceTargetId = null;
        }

        function initAceInline(id, lang, val) {
            const editor = window.ace.edit(id);
            editor.setTheme('ace/theme/textmate');
            editor.session.setMode(getAceMode(lang));
            editor.setOptions({
                fontSize: "14px",
                fontFamily: "Consolas",
                enableBasicAutocompletion: false,
                enableLiveAutocompletion: false,
                enableSnippets: false,
                showGutter: true,
                maxLines: Infinity,
                minLines: 5
            });
            editor.session.setUseWorker(false);
            editor.setValue(val, -1);
            inlineAceEditors[id] = editor;
        }

        function cloneTestCase(isSample) {
            const container = document.getElementById('testCasesContainer');
            const cards = Array.from(container.querySelectorAll('.test-case-card'));
            let lastInput = '';
            let lastOutput = '';
            
            for (let i = cards.length - 1; i >= 0; i--) {
                const cardIsSample = cards[i].querySelector('.t-sample').checked;
                if (cardIsSample === isSample) {
                    lastInput = cards[i].querySelector('.t-input').value;
                    lastOutput = cards[i].querySelector('.t-output').value;
                    break;
                }
            }
            
            addTestCaseRow(lastInput, lastOutput, isSample);
        }

        function addTestCaseRow(input = '', output = '', isSample = false) {
            const container = document.getElementById('testCasesContainer');
            const div = document.createElement('div');
            div.className = 'test-case-card';
            div.innerHTML = `
                <span class="remove-case" onclick="this.parentElement.remove()">&times;</span>
                <div class="test-case-input-group">
                    <label class="field-label" style="color:#666;">${isSample ? 'SAMPLE' : 'HIDDEN'} INPUT</label>
                    <textarea class="standard-input t-input" style="font-family:'JetBrains Mono'; height:80px;">${input}</textarea>
                </div>
                <div class="test-case-input-group">
                    <label class="field-label" style="color:#666;">EXPECTED OUTPUT</label>
                    <textarea class="standard-input t-output" style="font-family:'JetBrains Mono'; height:80px;">${output}</textarea>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; cursor:pointer;">
                        <input type="checkbox" class="t-sample" ${isSample ? 'checked' : ''}> Mark as Sample
                    </label>
                </div>
            `;
            container.appendChild(div);
        }

        function addDiagOpt() {
            const id = 'opt_diag_' + Math.random().toString(36).substr(2, 9);
            const div = document.createElement('div');
            div.className = 'mcq-option';
            div.innerHTML = `
                <div class="opt-check" onclick="setDiagCorrect(this)"></div>
                <div>
                   <label style="font-size:0.65rem; font-weight:800; color:#999; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block;">Choice Content</label>
                   <div id="${id}" class="editor-workspace" style="height:140px; min-height:140px; border:none; background:transparent;"></div>
                </div>
                <div style="display:flex; justify-content:center;">
                    <i class="fas fa-trash-alt delete-action" style="font-size:1rem;" onclick="this.parentElement.parentElement.remove()"></i>
                </div>
            `;
            document.getElementById('diagOptions').appendChild(div);
            setTimeout(() => initQuill(id), 50);
        }

        function setDiagCorrect(el) {
            document.querySelectorAll('#diagOptions .mcq-option').forEach(o => o.classList.remove('correct'));
            el.parentElement.parentElement.parentElement.classList.add('correct');
        }

        function addQuizOpt() {
            const id = 'opt_quiz_' + Math.random().toString(36).substr(2, 9);
            const div = document.createElement('div');
            div.className = 'mcq-option';
            div.innerHTML = `
                <div class="opt-check" onclick="setQuizCorrect(this)"></div>
                <div>
                   <label style="font-size:0.65rem; font-weight:800; color:#999; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; display:block;">Choice Content</label>
                   <div id="${id}" class="editor-workspace" style="height:140px; min-height:140px; border:none; background:transparent;"></div>
                </div>
                <div style="display:flex; justify-content:center;">
                    <i class="fas fa-trash-alt delete-action" style="font-size:1rem;" onclick="this.parentElement.parentElement.remove()"></i>
                </div>
            `;
            document.getElementById('quizOptions').appendChild(div);
            setTimeout(() => initQuill(id), 50);
        }

        function setQuizCorrect(el) {
            document.querySelectorAll('#quizOptions .mcq-option').forEach(o => o.classList.remove('correct'));
            el.parentElement.parentElement.parentElement.classList.add('correct');
        }



        function editLesson(mIdx, lIdx) {
            const less = getActiveModules()[mIdx].lessons[lIdx];
            currentModuleIndex = mIdx;
            currentLessonId = less.id;
            startNewLesson(mIdx);
            currentLessonId = less.id; // ensure ID is preserved
            document.getElementById('lTitle').value = less.title;
            initLessonType(less.type);

            // Polling to ensure Quill is ready
            const setContent = (id, content) => {
                const wait = setInterval(() => {
                    if (activeQuills[id]) {
                        activeQuills[id].root.innerHTML = content;
                        clearInterval(wait);
                    }
                }, 50);
                setTimeout(() => clearInterval(wait), 2000); // Guard
            };

            if (less.type === 'video') {
                document.getElementById('vUrl').value = less.data.url || '';
                setContent('q-video', less.data.notes || '');
            } else if (less.type === 'reading') {
                setContent('q-read', less.data.content || '');
            } else if (less.type === 'coding') {
                setContent('q-code', less.data.description || '');
                const checks = document.querySelectorAll('#langSelectorGrid input');
                checks.forEach(c => c.checked = less.data.languages?.includes(c.value));
                updateLanguages(less.data.code);
                document.getElementById('testCasesContainer').innerHTML = '';
                (less.data.testCases || []).forEach(tc => addTestCaseRow(tc.input, tc.output, tc.isSample));
            } else if (less.type === 'assertion') {
                setContent('q-assertion', less.data.assertion || '');
                setContent('q-reason', less.data.reason || '');
                document.getElementById('arAns').value = less.data.correct || '1';
            } else if (less.type === 'mcq') {
                setContent('q-mcq', less.data.question || '');
                document.getElementById('mcqOptions').innerHTML = '';
                (less.data.options || []).forEach(o => {
                    const optId = 'opt_' + Math.random().toString(36).substr(2, 9);
                    const div = document.createElement('div');
                    div.className = `mcq-option ${o === less.data.correct ? 'correct' : ''}`;
                    div.style = "display:flex; flex-direction:column; gap:8px; border:1px solid #eee; padding:16px; border-radius:12px; background:#fff; margin-bottom:12px;";
                    div.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div class="opt-check" onclick="setMcqCorrect(this)"></div>
                                <span style="font-size:0.75rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:0.5px;">Choice Content</span>
                            </div>
                            <i class="fas fa-trash" style="color:#F04438; cursor:pointer; font-size:0.9rem;" onclick="this.parentElement.parentElement.remove()"></i>
                        </div>
                        <div id="${optId}" class="editor-workspace" style="height:140px; min-height:140px; border:none;"></div>
                    `;
                    document.getElementById('mcqOptions').appendChild(div);
                    setTimeout(() => {
                        initQuill(optId);
                        setContent(optId, o);
                    }, 50);
                });
            } else if (less.type === 'drawing') {
                setContent('drawing-editor', less.data.instruction || '');
            } else if (less.type === 'diagram') {
                document.getElementById('diagUrl').value = less.data.url || '';
                setContent('q-diag', less.data.desc || '');
                document.getElementById('diagOptions').innerHTML = '';
                (less.data.options || []).forEach(o => {
                    const optId = 'opt_diag_' + Math.random().toString(36).substr(2, 9);
                    const div = document.createElement('div');
                    div.className = `mcq-option ${o === less.data.correct ? 'correct' : ''}`;
                    div.style = "display:flex; flex-direction:column; gap:8px; border:1px solid #eee; padding:16px; border-radius:12px; background:#fff; margin-bottom:12px;";
                    div.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div class="opt-check" onclick="setDiagCorrect(this)"></div>
                                <span style="font-size:0.75rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:0.5px;">Choice Content</span>
                            </div>
                            <i class="fas fa-trash" style="color:#F04438; cursor:pointer;" onclick="this.parentElement.parentElement.remove()"></i>
                        </div>
                        <div id="${optId}" class="editor-workspace" style="height:140px; min-height:140px; border:none;"></div>
                    `;
                    document.getElementById('diagOptions').appendChild(div);
                    setTimeout(() => {
                        initQuill(optId);
                        setContent(optId, o);
                    }, 50);
                });
            } else if (less.type === 'quiz') {
                setContent('q-quiz', less.data.question || '');
                document.getElementById('quizOptions').innerHTML = '';
                (less.data.options || []).forEach(o => {
                    const optId = 'opt_quiz_' + Math.random().toString(36).substr(2, 9);
                    const div = document.createElement('div');
                    div.className = `mcq-option ${o === less.data.correct ? 'correct' : ''}`;
                    div.style = "display:flex; flex-direction:column; gap:8px; border:1px solid #eee; padding:16px; border-radius:12px; background:#fff; margin-bottom:12px;";
                    div.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:12px;">
                                <div class="opt-check" onclick="setQuizCorrect(this)"></div>
                                <span style="font-size:0.75rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:0.5px;">Choice Content</span>
                            </div>
                            <i class="fas fa-trash" style="color:#F04438; cursor:pointer;" onclick="this.parentElement.parentElement.remove()"></i>
                        </div>
                        <div id="${optId}" class="editor-workspace" style="height:140px; min-height:140px; border:none;"></div>
                    `;
                    document.getElementById('quizOptions').appendChild(div);
                    setTimeout(() => {
                        initQuill(optId);
                        setContent(optId, o);
                    }, 50);
                });
            }
        }

        function saveLessonDraft() {
            saveCurrentLesson(true);
        }

        function saveCurrentLesson(isDraft = false) {
            const title = document.getElementById('lTitle').value;
            if (!title) return showToast("Enter title");

            const lesson = { id: currentLessonId || ('less_' + Date.now()), title, type: currentLessonType, data: {} };

            if (currentLessonType === 'video') {
                lesson.data.url = document.getElementById('vUrl').value;
                lesson.data.notes = activeQuills['q-video'] ? activeQuills['q-video'].root.innerHTML : '';
            } else if (currentLessonType === 'reading') {
                lesson.data.content = activeQuills['q-read'] ? activeQuills['q-read'].root.innerHTML : '';
            } else if (currentLessonType === 'coding') {
                lesson.data.description = activeQuills['q-code'] ? activeQuills['q-code'].root.innerHTML : '';
                lesson.data.languages = Array.from(document.querySelectorAll('#langSelectorGrid input:checked')).map(c => c.value);
                lesson.data.code = {};
                lesson.data.languages.forEach(l => {
                    lesson.data.code[l] = {
                        prefix: inlineAceEditors[`code_prefix_${l}`] ? inlineAceEditors[`code_prefix_${l}`].getValue() : '',
                        middle: inlineAceEditors[`code_middle_${l}`] ? inlineAceEditors[`code_middle_${l}`].getValue() : '',
                        suffix: inlineAceEditors[`code_suffix_${l}`] ? inlineAceEditors[`code_suffix_${l}`].getValue() : '',
                        lockPrefix: document.getElementById(`lock_prefix_${l}`)?.checked || false,
                        lockSuffix: document.getElementById(`lock_suffix_${l}`)?.checked || false,
                        hidePrefix: document.getElementById(`hide_prefix_${l}`)?.checked || false,
                        hideSuffix: document.getElementById(`hide_suffix_${l}`)?.checked || false
                    };
                });
                lesson.data.testCases = Array.from(document.querySelectorAll('.test-case-card')).map(card => ({
                    input: card.querySelector('.t-input').value,
                    output: card.querySelector('.t-output').value,
                    marks: 0,
                    isSample: card.querySelector('.t-sample').checked
                }));

                if (lesson.data.testCases.length === 0) {
                    return showToast("At least 1 test case is mandatory for coding questions", "error");
                }

            } else if (currentLessonType === 'assertion') {
                lesson.data.assertion = activeQuills['q-assertion'] ? activeQuills['q-assertion'].root.innerHTML : '';
                lesson.data.reason = activeQuills['q-reason'] ? activeQuills['q-reason'].root.innerHTML : '';
                lesson.data.correct = document.getElementById('arAns').value;
                lesson.data.desc = "Choose the correct option based on the Assertion and Reason provided:";
            } else if (currentLessonType === 'mcq') {
                lesson.data.question = activeQuills['q-mcq'] ? activeQuills['q-mcq'].root.innerHTML : '';
                lesson.data.options = [];
                document.querySelectorAll('#mcqOptions .mcq-option').forEach(node => {
                    const editorId = node.querySelector('.editor-workspace').id;
                    if (activeQuills[editorId]) {
                        lesson.data.options.push(activeQuills[editorId].root.innerHTML);
                    }
                });
                const correctEl = document.querySelector('#mcqOptions .mcq-option.correct');
                if (correctEl) {
                    const edId = correctEl.querySelector('.editor-workspace').id;
                    lesson.data.correct = activeQuills[edId].root.innerHTML;
                } else {
                    return showToast("Picking a right option is mandatory for MCQ", "error");
                }
            } else if (currentLessonType === 'diagram') {
                lesson.data.url = document.getElementById('diagUrl').value;
                lesson.data.desc = activeQuills['q-diag'] ? activeQuills['q-diag'].root.innerHTML : '';
                lesson.data.options = [];
                document.querySelectorAll('#diagOptions .mcq-option').forEach(node => {
                    const editorId = node.querySelector('.editor-workspace').id;
                    if (activeQuills[editorId]) {
                        lesson.data.options.push(activeQuills[editorId].root.innerHTML);
                    }
                });
                const correctEl = document.querySelector('#diagOptions .mcq-option.correct');
                if (correctEl) {
                    const edId = correctEl.querySelector('.editor-workspace').id;
                    lesson.data.correct = activeQuills[edId].root.innerHTML;
                } else {
                    return showToast("Picking a right option is mandatory", "error");
                }
            } else if (currentLessonType === 'quiz') {
                lesson.data.question = activeQuills['q-quiz'] ? activeQuills['q-quiz'].root.innerHTML : '';
                lesson.data.options = [];
                document.querySelectorAll('#quizOptions .mcq-option').forEach(node => {
                    const editorId = node.querySelector('.editor-workspace').id;
                    if (activeQuills[editorId]) {
                        lesson.data.options.push(activeQuills[editorId].root.innerHTML);
                    }
                });
                const correctEl = document.querySelector('#quizOptions .mcq-option.correct');
                if (correctEl) {
                    const edId = correctEl.querySelector('.editor-workspace').id;
                    lesson.data.correct = activeQuills[edId].root.innerHTML;
                } else {
                    return showToast("Picking a right option is mandatory", "error");
                }
            }

            // UNIFIED QUESTION POOL SYNC
            if (['coding', 'mcq', 'assertion', 'diagram', 'quiz'].includes(currentLessonType)) {
                let pMarks = 0;
                let pTitle = '';

                if (currentLessonType === 'coding') {
                    pMarks = 0; // Practice course
                    pTitle = lesson.data.description;
                } else {
                    pMarks = 10; // Default marks for course questions
                    pTitle = lesson.data.question || lesson.data.desc || lesson.title;
                }

                const poolQ = {
                    id: 'q_' + Date.now(),
                    type: currentLessonType,
                    heading: title,
                    title: pTitle,
                    marks: pMarks,
                    section: 'General',
                    timer: 0,
                    // Assessment specific data
                    languages: lesson.data.languages || [],
                    code: lesson.data.code || null,
                    testCases: lesson.data.testCases || [],
                    options: lesson.data.options || [],
                    correct: lesson.data.correct || null,
                    assertion: lesson.data.assertion || null,
                    reason: lesson.data.reason || null
                };

                if (window.db && window.db.addToQuestionPool) {
                    window.db.addToQuestionPool(poolQ);
                }
            }

            // Check if editing
            const mod = getActiveModules()[currentModuleIndex];
            const existingIdx = currentLessonId ? mod.lessons.findIndex(l => l.id === currentLessonId) : -1;
            if (existingIdx !== -1) mod.lessons[existingIdx] = lesson;
            else mod.lessons.push(lesson);

            saveToLocal();
            renderCurriculum();
            if (!isDraft) {
                selectModule(currentModuleIndex); // Stay in module view
                showToast("Lesson built!");
            } else {
                currentLessonId = lesson.id; // Store ID in case it was a new draft
                showToast("Lesson saved as draft");
            }
        }

        function goBackToOverview() {
            document.getElementById('lessonEditor').style.display = 'none';
            document.getElementById('welcomeState').style.display = 'block';
            currentModuleIndex = -1;
            renderCurriculum();
        }

        function editCourseIdentity() {
            const safeTitle = (courseData.title || '').replace(/"/g, '&quot;');
            const safeSummary = (courseData.summary || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            showModal({
                title: "Course Identity Architect",
                desc: "Update the core proposition and branding of this course.",
                body: `
                    <div class="field-group">
                        <label class="field-label">Course Proposition</label>
                        <input type="text" id="editTitle" class="standard-input" value="${safeTitle}" placeholder="Enter Title...">
                    </div>
                    <div class="field-group">
                        <label class="field-label">Executive Summary</label>
                        <textarea id="editSummary" class="standard-input" rows="4" placeholder="Description...">${safeSummary}</textarea>
                    </div>
                    <div class="field-group">
                        <label class="field-label">Category</label>
                        <select id="editCategory" class="standard-input">
                            <option ${courseData.category === 'Engineering & Technology' ? 'selected' : ''}>Engineering & Technology</option>
                            <option ${courseData.category === 'Data Science & AI' ? 'selected' : ''}>Data Science & AI</option>
                            <option ${courseData.category === 'Management & Business' ? 'selected' : ''}>Management & Business</option>
                            <option ${courseData.category === 'Creative Arts & Design' ? 'selected' : ''}>Creative Arts & Design</option>
                        </select>
                    </div>
                `,
                confirmText: "SYNC CHANGES",
                onConfirm: () => {
                    courseData.title = document.getElementById('editTitle').value;
                    courseData.summary = document.getElementById('editSummary').value;
                    courseData.description = courseData.summary;
                    courseData.category = document.getElementById('editCategory').value;
                    renderCurriculum();
                    saveToLocal();
                    closeModal();
                }
            });
        }

        function saveToLocal() {
            localStorage.setItem('current_editing_course', JSON.stringify(courseData));
        }

        function showModal({ title, desc, body, confirmText, onConfirm }) {
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalDesc').innerText = desc;
            document.getElementById('modalBody').innerHTML = body;
            const confirmBtn = document.getElementById('modalConfirmBtn');
            confirmBtn.style.display = 'block';
            confirmBtn.innerText = confirmText || 'Confirm';
            confirmBtn.onclick = onConfirm;
            document.getElementById('modalOverlay').classList.add('active');
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }

        function publishCourse() {
            saveToLocal();
            if (!courseData.title) return showToast("Enter course title");
            courseData.status = 'published';
            saveToDB();
        }

        function saveDraft() {
            saveToLocal();
            if (!courseData.title) return showToast("Enter course title");

            // If the course is already published, keep it published when saving changes
            if (courseData.status !== 'published') {
                courseData.status = 'draft';
            }

            saveToDB();
        }

        function saveToDB() {
            showProcessing();
            setTimeout(() => {
                const user = auth.getCurrentUser();
                // Check if updating
                const urlParams = new URLSearchParams(window.location.search);
                const editingId = urlParams.get('id');

                if (editingId) {
                    db.updateCourse(editingId, courseData);
                } else {
                    const newCourse = db.createCourse(courseData, user.id);
                    editingId = newCourse.id;
                    // Update URL without reload to prevent re-creation on refresh
                    window.history.replaceState(null, '', `?id=${editingId}`);
                }

                hideLoader();
                showSuccessModal(courseData.status === 'draft' ? "DRAFT SAVED" : "COURSE DEPLOYED");
                localStorage.removeItem('current_editing_course');
            }, 1000);
        }

        function showProcessing() {
            document.getElementById('modalOverlay').classList.add('active');
            document.getElementById('modalTitle').innerText = "Processing Curriculum...";
            document.getElementById('modalDesc').innerText = "Syncing with the global network.";
            document.getElementById('modalBody').innerHTML = `<div style="text-align:center; padding:20px;"><i class="fas fa-circle-notch fa-spin" style="font-size:2rem; color:var(--primary);"></i></div>`;
            document.getElementById('modalFooter').style.display = 'none';
        }

        function hideLoader() {
            document.getElementById('modalOverlay').classList.remove('active');
        }

        function showSuccessModal(title) {
            document.getElementById('modalOverlay').classList.add('active');
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalDesc').innerText = title.includes('SAVED') ? "Your draft has been securely stored." : "Your curriculum is now live and available for enrollment.";
            document.getElementById('modalBody').innerHTML = `<div style="background:#f9f9f9; padding:20px; border-radius:12px; border:1px solid #eee; text-align:center; font-weight:700; color:var(--primary);">${courseData.title}</div>`;

            document.getElementById('modalFooter').style.display = 'flex';
            const footer = document.getElementById('modalFooter');
            footer.innerHTML = `<button class="btn btn-primary" onclick="location.href='./teacher-dashboard.html'">Return to Dashboard</button>`;
        }

        function showPrompt(title, desc, placeholder, onConfirm) {
            const overlay = document.getElementById('modalOverlay');
            overlay.classList.add('active');
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalDesc').innerText = desc;
            document.getElementById('modalBody').innerHTML = `<input type="text" id="promptInput" class="standard-input" placeholder="${placeholder}">`;

            document.getElementById('modalFooter').style.display = 'flex';
            document.getElementById('modalCancelBtn').style.display = 'block';

            const btn = document.getElementById('modalConfirmBtn');
            btn.style.display = 'block';
            btn.innerText = "Save Module";
            btn.onclick = () => {
                const val = document.getElementById('promptInput').value;
                if (val) {
                    onConfirm(val);
                    closeModal();
                }
            };
            
            // Add enter key support
            const inputField = document.getElementById('promptInput');
            if (inputField) {
                inputField.focus();
                inputField.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        btn.click();
                    }
                });
            }
        }

        function closeModal() {
            document.getElementById('modalOverlay').classList.remove('active');
        }

        function showToast(m) {
            const c = document.getElementById('toast-container');
            const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `<i class="fas fa-check-circle"></i> ${m}`;
            c.appendChild(t); setTimeout(() => t.remove(), 3000);
        }
        function switchSidebar(view, el) {
            document.querySelectorAll('.rail-item').forEach(i => i.classList.remove('active'));
            if (el) el.classList.add('active');

            document.getElementById('viewCurriculumSidebar').style.display = 'none';
            document.getElementById('viewCurriculumContent').style.display = 'none';
            document.getElementById('viewPool').style.display = 'none';
            document.getElementById('viewAnalytics').style.display = 'none';

            if (view === 'curriculum') {
                document.getElementById('viewCurriculumSidebar').style.display = 'flex';
                document.getElementById('viewCurriculumContent').style.display = 'block';
            } else if (view === 'pool') {
                document.getElementById('viewPool').style.display = 'block';
                loadQuestionPool();
            } else if (view === 'analytics') {
                document.getElementById('viewAnalytics').style.display = 'block';
                loadAnalytics();
            }
        }

        let analyticsChartsLoaded = false;

        function loadAnalytics() {
            const analyticsContainer = document.getElementById('viewAnalytics');
            const chartsGrid = document.getElementById('analyticsChartsGrid');

            // Cleanup previous messages
            const existingMsg = document.getElementById('analyticsNoDataMsg');
            if (existingMsg) existingMsg.remove();

            // Fetch real progress
            const progressData = JSON.parse(localStorage.getItem('TESTPAD_course_progress') || '[]');
            const courseProgress = progressData.filter(p => p.courseId === (courseData.id || 'N/A'));

            if (courseProgress.length === 0) {
                chartsGrid.style.display = 'none';
                const msg = document.createElement('div');
                msg.id = 'analyticsNoDataMsg';
                msg.innerHTML = `
                    <div style="text-align: center; padding: 100px 40px; background: #fff; border-radius: 20px; border: 1px dashed #e2e8f0; margin-top: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="width: 80px; height: 80px; background: #f8fafc; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                            <img src="https://course.testpad.chitkara.edu.in/icons/statistics-active.svg" style="width: 40px; opacity: 0.3; filter: grayscale(1);">
                        </div>
                        <h3 style="font-family: 'Outfit'; color: #334155; font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">No Participation Detected</h3>
                        <p style="color: #64748b; font-size: 0.95rem; max-width: 400px; line-height: 1.6;">Your curriculum is live, but no students have engaged with the content yet. Once students begin, real-time telemetry will appear here.</p>
                        <button class="btn btn-primary" style="margin-top: 32px;" onclick="switchSidebar('curriculum', document.querySelector('.rail-item'))">Manage Curriculum</button>
                    </div>
                `;
                analyticsContainer.appendChild(msg);
                return;
            }

            chartsGrid.style.display = 'grid';
            if (analyticsChartsLoaded) return;

            // Calculate Metrics
            const totalStudents = courseProgress.length;
            const totalLessons = getActiveModules().reduce((sum, m) => sum + (m.lessons ? m.lessons.length : 0), 0);

            const completedCount = courseProgress.filter(p => p.completedItems.length >= totalLessons && totalLessons > 0).length;
            const inProgressCount = totalStudents - completedCount;

            const pieCtx = document.getElementById('completionPieChart').getContext('2d');
            new Chart(pieCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Completed', 'In Progress'],
                    datasets: [{
                        data: [completedCount, inProgressCount],
                        backgroundColor: ['#10b981', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    plugins: {
                        legend: { position: 'bottom', labels: { font: { family: 'Outfit', weight: 600 } } }
                    },
                    cutout: '75%'
                }
            });

            const modLabels = getActiveModules().map(m => m.title);
            const modData = getActiveModules().map(m => {
                const lessonIds = (m.lessons || []).map(l => l.id);
                if (lessonIds.length === 0) return 0;
                let totalCompletions = 0;
                courseProgress.forEach(p => {
                    const finishedInMod = p.completedItems.filter(cid => lessonIds.includes(cid)).length;
                    totalCompletions += (finishedInMod / lessonIds.length) * 100;
                });
                return (totalCompletions / totalStudents).toFixed(1);
            });

            const barCtx = document.getElementById('performanceBarChart').getContext('2d');
            new Chart(barCtx, {
                type: 'bar',
                data: {
                    labels: modLabels,
                    datasets: [{
                        label: 'Completion %',
                        data: modData,
                        backgroundColor: '#D96C33',
                        borderRadius: 6
                    }]
                },
                options: {
                    scales: {
                        y: { beginAtZero: true, max: 100, grid: { borderDash: [5, 5] }, ticks: { font: { family: 'Outfit' } } },
                        x: { ticks: { font: { family: 'Outfit' } } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
            analyticsChartsLoaded = true;
        }

        function loadQuestionPool() {
            const tbody = document.getElementById('poolTableBody');
            const pool = (window.db && window.db.getQuestionPool) ? window.db.getQuestionPool() : [];

            if (pool.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="padding: 24px; text-align: center; color: #888;">No questions in global pool yet. Create coding lessons to populate.</td></tr>';
                return;
            }

            tbody.innerHTML = pool.map(q => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 16px; font-weight: 600; font-family: monospace; color: #666;">${(q.id || q.poolId || '').substring(0, 8)}</td>
                    <td style="padding: 16px;"><span style="background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${q.type}</span></td>
                    <td style="padding: 16px;">
                        <div style="font-weight: 600; color: #111;">${q.heading || 'Untitled'}</div>
                        <div style="font-size: 0.8rem; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px;">${(q.title || '').replace(/<[^>]+>/g, '')}</div>
                    </td>
                    <td style="padding: 16px; font-weight: 600; color: #059669;">${q.marks} pts</td>
                    <td style="padding: 16px;"><button class="btn btn-ghost" style="padding: 4px 12px; border: 1px solid #ddd; font-size: 0.75rem;" onclick="importFromPool('${q.id || q.poolId}')">Import</button></td>
                </tr>
            `).join('');
        }

        function importFromPool(qId) {
            const pool = (window.db && window.db.getQuestionPool) ? window.db.getQuestionPool() : [];
            const q = pool.find(x => (x.id || x.poolId) === qId);
            if (!q) return showToast('Question not found');

            if (getActiveModules().length === 0) {
                return showToast('Create a module first to import questions.');
            }

            let optionsHtml = getActiveModules().map((m, idx) => `<option value="${idx}" ${idx === currentModuleIndex ? 'selected' : ''}>${m.title}</option>`).join('');

            document.getElementById('modalOverlay').classList.add('active');
            document.getElementById('modalTitle').innerText = "Import to Module";
            document.getElementById('modalDesc').innerText = "Select where to add: " + (q.heading || 'Question');
            document.getElementById('modalBody').innerHTML = `
                <div class="field-group">
                    <label class="field-label">Target Module</label>
                    <select id="importModuleSelect" class="standard-input">
                        ${optionsHtml}
                    </select>
                </div>
            `;

            document.getElementById('modalFooter').style.display = 'flex';
            document.getElementById('modalCancelBtn').style.display = 'block';

            const btn = document.getElementById('modalConfirmBtn');
            btn.style.display = 'block';
            btn.innerText = "Import Question";
            btn.onclick = () => {
                const mIdx = parseInt(document.getElementById('importModuleSelect').value);

                const lesson = {
                    id: 'less_' + Date.now(),
                    title: q.heading || 'Imported Question',
                    type: q.type || 'coding',
                    data: {}
                };

                if (q.type === 'coding') {
                    lesson.data.description = q.title;
                    lesson.data.languages = Object.keys(q.code || {});
                    lesson.data.code = q.code;
                    lesson.data.testCases = q.testCases;
                } else if (q.type === 'mcq') {
                    lesson.data.question = q.title;
                    lesson.data.options = q.options;
                    lesson.data.correct = q.correct;
                } else {
                    lesson.data.question = q.title;
                }

                if (!getActiveModules()[mIdx].lessons) getActiveModules()[mIdx].lessons = [];
                getActiveModules()[mIdx].lessons.push(lesson);

                saveToLocal();
                closeModal();
                showToast("Question imported successfully!");

                // Switch back
                switchSidebar('curriculum', document.querySelector('.rail-item[title="Curriculum Builder"]'));
                renderCurriculum();
            };
        }
    