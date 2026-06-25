const params = new URLSearchParams(window.location.search);
        let courseId = params.get('courseId');
        const user = auth.getCurrentUser();

        function init() {
            const courses = db.getAllCourses();
            if (!courses || courses.length === 0) return;

            // Default to the first course if courseId is not in the URL
            if (!courseId) {
                courseId = courses[0].id;
            }

            const select = document.getElementById('courseSelect');
            select.innerHTML = courses.map(c => `
                <option value="${c.id}" ${c.id === courseId ? 'selected' : ''}>${c.title}</option>
            `).join('');

            select.onchange = (e) => {
                courseId = e.target.value;
                renderAttempts();
            };

            renderAttempts();
        }

        function renderAttempts() {
            const course = db.getCourseById(courseId);
            if (!course) return;

            const allLessons = course.modules.flatMap(m => m.lessons || []).filter(l => l.type === 'coding' || l.type === 'mcq');
            
            const body = document.getElementById('attemptsBody');
            
            if (allLessons.length === 0) {
                body.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 40px; color:#888;">No lessons found for this course.</td></tr>`;
                return;
            }

            body.innerHTML = allLessons.map((less, i) => {
                const historyStr = localStorage.getItem('TESTPAD_attempts_' + less.id);
                let history = [];
                if (historyStr) {
                    try { history = JSON.parse(historyStr); } catch(e) {}
                }

                let typeLabel = 'Coding';
                if (less.type === 'mcq') typeLabel = 'MCQ';

                const isSubmitted = history.length > 0;
                const statusLabel = isSubmitted ? 'Submitted' : 'Not Submitted';
                
                let detailsHTML = '';
                if (isSubmitted) {
                    const allCount = history.length;
                    const successCount = history.filter(h => h.status === 'success').length;
                    const failCount = history.filter(h => h.status === 'failed').length;
                    const errCount = history.filter(h => h.status === 'error').length;

                    detailsHTML = `
                        <tr id="details-${less.id}" style="display: none; background: #fff; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                            <td colspan="3" style="padding: 24px 40px; border-bottom: 1px solid #f0f0f0;">
                                <div style="display: flex; gap: 24px; align-items: center; justify-content: center; margin-bottom: 24px; font-size: 0.95rem; color: #888;">
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="radio" name="filter-${less.id}" checked> ALL (${allCount})
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="radio" name="filter-${less.id}"> Failed (${failCount})
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="radio" name="filter-${less.id}"> Successful (${successCount})
                                    </label>
                                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                        <input type="radio" name="filter-${less.id}"> Compile error (${errCount})
                                    </label>
                                </div>
                                
                                <table style="width: 100%; border-collapse: collapse; text-align: center;">
                                    <thead>
                                        <tr>
                                            <th style="padding-bottom: 16px; font-weight: 600; font-size: 1.15rem; color: #111; text-align: center; background: none; border: none;">Attempts</th>
                                            <th style="padding-bottom: 16px; font-weight: 600; font-size: 1.15rem; color: #111; text-align: center; background: none; border: none;">Test cases</th>
                                            <th style="padding-bottom: 16px; font-weight: 600; font-size: 1.15rem; color: #111; text-align: center; background: none; border: none;">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${history.map(att => {
                                            const d = new Date(att.date);
                                            const dateStr = d.toLocaleDateString('en-GB') + ' | ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                            
                                            let statColor = '#555';
                                            let displayStatus = att.status;
                                            
                                            if (att.status === 'success') {
                                                statColor = '#027A48';
                                            } else if (att.status === 'failed') {
                                                statColor = '#B42318';
                                            } else if (att.status === 'error') {
                                                statColor = '#DE6834';
                                            }

                                            let tcases = 'N/A';
                                            if (att.type === 'coding' && att.status !== 'error') {
                                                tcases = att.passed + '/' + att.total;
                                            }

                                            return `
                                                <tr>
                                                    <td style="padding: 16px 0; color: #333; font-size: 1.05rem; border: none;">${dateStr}</td>
                                                    <td style="padding: 16px 0; color: #333; font-size: 1.05rem; border: none;">${tcases}</td>
                                                    <td style="padding: 16px 0; color: ${statColor}; font-size: 1.05rem; border: none;">${displayStatus}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    `;
                }

                return `
                    <tr style="cursor: pointer; transition: background 0.2s;" onclick="const el = document.getElementById('details-${less.id}'); if(el) el.style.display = el.style.display === 'none' ? 'table-row' : 'none';" onmouseover="this.style.background='#fafafa'" onmouseout="this.style.background='transparent'">
                        <td>
                            <div class="q-name">
                                <span class="q-index">${i + 1}.</span>
                                <span class="q-title">${less.title}</span>
                            </div>
                        </td>
                        <td><span class="type-badge">${typeLabel}</span></td>
                        <td>
                            <div class="status-cell" style="justify-content: flex-start; gap: 12px;">
                                <span class="status-text" style="font-weight: 400; color: #333;">
                                    ${statusLabel}
                                </span>
                                ${isSubmitted ? '<i class="fas fa-caret-down" style="color: #DE6834; font-size: 1rem;"></i>' : ''}
                            </div>
                        </td>
                    </tr>
                    ${detailsHTML}
                `;
            }).join('');
        }

        function goBack() {
            window.location.href = `./course-dashboard.html?courseId=${courseId}`;
        }

        function showToast(msg, type = 'info') {
            const container = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.className = 'toast';
            if (type === 'error') toast.style.borderLeft = '4px solid #D92D20';
            toast.textContent = msg;
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        init();
    
