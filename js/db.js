// ===== EXAMPAD DATABASE (LocalStorage) =====

class ExampadDB {
    constructor() {
        this.initializeDB();
    }

    initializeDB() {
        if (!localStorage.getItem('exampad_users')) {
            localStorage.setItem('exampad_users', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_exams')) {
            localStorage.setItem('exampad_exams', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_attempts')) {
            localStorage.setItem('exampad_attempts', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_sessions')) {
            localStorage.setItem('exampad_sessions', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_question_pool')) {
            localStorage.setItem('exampad_question_pool', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_courses')) {
            localStorage.setItem('exampad_courses', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_course_progress')) {
            localStorage.setItem('exampad_course_progress', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_transactions')) {
            localStorage.setItem('exampad_transactions', JSON.stringify([]));
        }
        if (!localStorage.getItem('exampad_circulars')) {
            localStorage.setItem('exampad_circulars', JSON.stringify([]));
        }
    }

    // ===== CIRCULAR MANAGEMENT =====
    addCircular(circularData) {
        const circulars = JSON.parse(localStorage.getItem('exampad_circulars'));
        const circular = {
            ...circularData,
            id: 'CIRC_' + Date.now(),
            timestamp: new Date().toISOString()
        };
        circulars.push(circular);
        localStorage.setItem('exampad_circulars', JSON.stringify(circulars));
        return circular;
    }

    getCirculars() {
        return JSON.parse(localStorage.getItem('exampad_circulars'));
    }

    // ===== QUESTION POOL =====
    addToQuestionPool(question) {
        const pool = JSON.parse(localStorage.getItem('exampad_question_pool'));
        // Avoid duplicates by title/heading
        if (!pool.some(q => q.heading === question.heading)) {
            const poolItem = {
                ...question,
                poolId: 'qpool_' + Date.now(),
                addedAt: new Date().toISOString()
            };
            pool.push(poolItem);
            localStorage.setItem('exampad_question_pool', JSON.stringify(pool));
            return poolItem;
        }
        return null;
    }

    getQuestionPool() {
        return JSON.parse(localStorage.getItem('exampad_question_pool')) || [];
    }

    getQuestionFromPool(id) {
        const pool = this.getQuestionPool();
        return pool.find(q => q.id === id || q.poolId === id);
    }
    
    getQuestionById(questionId, examId) {
        // Try pool first
        let q = this.getQuestionFromPool(questionId);
        if (q) return q;
        
        // Try exam context
        if (examId) {
            const exam = this.getExamById(examId);
            if (exam) {
                return exam.questions.find(q => q.id === questionId);
            }
        }
        return null;
    }

    // ===== USER MANAGEMENT =====
    addUser(userData) {
        const users = JSON.parse(localStorage.getItem('exampad_users'));
        const id = 'user_' + Date.now();
        const user = {
            id,
            email: userData.email,
            rollNo: userData.rollNo || id.toUpperCase(),
            name: userData.name,
            password: this.hashPassword(userData.password),
            role: userData.role, // 'teacher' or 'student'
            createdAt: new Date().toISOString()
        };
        users.push(user);
        localStorage.setItem('exampad_users', JSON.stringify(users));
        return user;
    }

    updateUser(userId, updateData) {
        const users = JSON.parse(localStorage.getItem('exampad_users'));
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updateData };
            localStorage.setItem('exampad_users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    getUser(email) {
        const users = JSON.parse(localStorage.getItem('exampad_users'));
        return users.find(u => u.email === email);
    }

    getUserById(userId) {
        const users = JSON.parse(localStorage.getItem('exampad_users'));
        return users.find(u => u.id === userId);
    }

    getUserByRollNo(roll) {
        const users = JSON.parse(localStorage.getItem('exampad_users')) || [];
        return users.find(u => u.rollNo === roll);
    }

    authenticateUser(email, password) {
        const user = this.getUser(email);
        if (user && user.password === this.hashPassword(password)) {
            return user;
        }
        return null;
    }

    updatePassword(email, newPassword) {
        const users = JSON.parse(localStorage.getItem('exampad_users'));
        const index = users.findIndex(u => u.email === email);
        if (index !== -1) {
            users[index].password = this.hashPassword(newPassword);
            localStorage.setItem('exampad_users', JSON.stringify(users));
            return true;
        }
        return false;
    }

    // ===== EXAM MANAGEMENT =====
    createExam(examData, teacherId) {
        const exams = JSON.parse(localStorage.getItem('exampad_exams'));
        const id = 'exam_' + Date.now();
        const testId = this.generateTestId();
        const passcode = this.generatePasscode();

        const exam = {
            id,
            testId: examData.testId || this.generateTestId(),
            passcode: (examData.security && examData.security.passcode) || examData.passcode || this.generatePasscode(),
            teacherId,
            title: examData.title,
            description: examData.description,
            duration: examData.duration, // in minutes
            totalMarks: examData.totalMarks,
            negativeMarking: examData.negativeMarking || 0,
            credits: examData.credits || 1,
            questions: examData.questions || [],
            scheduledDate: examData.scheduledDate || null,
            wifiRestriction: examData.wifiRestriction || false,
            allowedWifi: examData.allowedWifi || null,
            sections: examData.sections || [],
            languages: examData.languages || ['JavaScript'], // for coding problems
            createdAt: new Date().toISOString(),
            status: examData.status || 'draft', // draft, live, completed
            security: examData.security || {}
        };

        exams.push(exam);
        localStorage.setItem('exampad_exams', JSON.stringify(exams));
        return exam;
    }

    getAllExams() {
        return JSON.parse(localStorage.getItem('exampad_exams')) || [];
    }

    getExamById(examId) {
        const exams = JSON.parse(localStorage.getItem('exampad_exams')) || [];
        return exams.find(e => e.id === examId);
    }

    getExamByTestId(testId) {
        const exams = JSON.parse(localStorage.getItem('exampad_exams')) || [];
        if (!testId) return null;
        const target = testId.trim().toUpperCase();
        return exams.find(e => e.testId && e.testId.toUpperCase() === target);
    }

    getTeacherExams(teacherId) {
        const exams = JSON.parse(localStorage.getItem('exampad_exams'));
        return exams.filter(e => e.teacherId === teacherId);
    }

    updateExam(examId, updateData) {
        const exams = JSON.parse(localStorage.getItem('exampad_exams'));
        const index = exams.findIndex(e => e.id === examId);
        if (index !== -1) {
            exams[index] = { ...exams[index], ...updateData };
            localStorage.setItem('exampad_exams', JSON.stringify(exams));
            return exams[index];
        }
        return null;
    }

    // ===== ATTEMPT/SESSION MANAGEMENT =====
    startAttempt(examId, studentId) {
        const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));

        // Check if student already attempted
        const existingAttempt = attempts.find(a => a.examId === examId && a.studentId === studentId);
        if (existingAttempt) {
            return { success: false, message: 'You have already attempted this exam' };
        }

        const id = 'attempt_' + Date.now();
        const exam = this.getExamById(examId);

        // --- RANDOMIZATION LOGIC ---
        let selectedQuestionIds = [];
        if (exam && exam.pools && Object.keys(exam.pools).length > 0) {
            // Group original questions by section
            const sectionsMap = {};
            exam.questions.forEach(q => {
                const s = q.section || 'General';
                if (!sectionsMap[s]) sectionsMap[s] = [];
                sectionsMap[s].push(q);
            });

            // For each section, pick random questions if pool size is set
            const sections = exam.sections.length > 0 ? exam.sections : ['General'];
            sections.forEach(sName => {
                const secPool = sectionsMap[sName] || [];
                const poolSize = parseInt(exam.pools[sName]) || 0;

                if (poolSize > 0 && poolSize < secPool.length) {
                    // Randomly shuffle and pick poolSize questions
                    const shuffled = [...secPool].sort(() => 0.5 - Math.random());
                    const picked = shuffled.slice(0, poolSize);
                    selectedQuestionIds.push(...picked.map(q => q.id));
                } else {
                    // Use all questions from this section
                    selectedQuestionIds.push(...secPool.map(q => q.id));
                }
            });
        }

        const attempt = {
            id,
            examId,
            studentId,
            startTime: new Date().toISOString(),
            endTime: null,
            responses: {}, // questionId -> response
            sectionStatus: {}, // track which sections are locked/completed
            submittedSections: [],
            tabSwitchCount: 0,
            tabInCount: 0,
            fsExitCount: 0,
            fsInCount: 0,
            copyPasteAttempts: 0,
            status: 'in-progress', // in-progress, submitted, reviewed
            score: null,
            feedback: null,
            selectedQuestionIds: selectedQuestionIds.length > 0 ? selectedQuestionIds : null
        };

        attempts.push(attempt);
        localStorage.setItem('exampad_attempts', JSON.stringify(attempts));
        return { success: true, attempt };
    }

    getAttempt(attemptId) {
        const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));
        return attempts.find(a => a.id === attemptId);
    }

    updateAttempt(attemptId, updateData) {
        const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));
        const index = attempts.findIndex(a => a.id === attemptId);
        if (index !== -1) {
            attempts[index] = { ...attempts[index], ...updateData };
            localStorage.setItem('exampad_attempts', JSON.stringify(attempts));
            return attempts[index];
        }
        return null;
    }

    updateAttemptResponse(attemptId, questionId, response) {
        const attempt = this.getAttempt(attemptId);
        if (attempt) {
            attempt.responses[questionId] = response;
            return this.updateAttempt(attemptId, { responses: attempt.responses });
        }
        return false;
    }

    submitAttempt(attemptId) {
        const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));
        const attempt = attempts.find(a => a.id === attemptId);
        if (attempt) {
            attempt.endTime = new Date().toISOString();
            attempt.status = 'submitted';
            attempt.score = this.calculateScore(attempt);
            localStorage.setItem('exampad_attempts', JSON.stringify(attempts));
            return attempt;
        }
        return null;
    }

    getStudentAttempts(studentId) {
        const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));
        return attempts.filter(a => a.studentId === studentId);
    }

    getExamAttempts(examId) {
        const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));
        return attempts.filter(a => a.examId === examId);
    }

    // ===== COURSE MANAGEMENT =====
    createCourse(courseData, teacherId) {
        const courses = JSON.parse(localStorage.getItem('exampad_courses'));
        const id = 'course_' + Date.now();
        const course = {
            id,
            teacherId,
            title: courseData.title,
            description: courseData.description,
            modules: courseData.modules || [], // Array of modules { title, items: [] }
            status: courseData.status || 'published',
            createdAt: new Date().toISOString(),
            studentCount: 0,
            avgProgress: 0
        };
        courses.push(course);
        localStorage.setItem('exampad_courses', JSON.stringify(courses));
        return course;
    }

    getAllCourses() {
        return JSON.parse(localStorage.getItem('exampad_courses')) || [];
    }

    getTeacherCourses(teacherId) {
        const courses = this.getAllCourses();
        return courses.filter(c => c.teacherId === teacherId);
    }

    getCourseById(courseId) {
        const courses = this.getAllCourses();
        return courses.find(c => c.id === courseId);
    }

    updateCourse(courseId, updateData) {
        const courses = this.getAllCourses();
        const index = courses.findIndex(c => c.id === courseId);
        if (index !== -1) {
            courses[index] = { ...courses[index], ...updateData };
            localStorage.setItem('exampad_courses', JSON.stringify(courses));
            return courses[index];
        }
        return null;
    }

    getCourseProgress(courseId, studentId) {
        const progresses = JSON.parse(localStorage.getItem('exampad_course_progress')) || [];
        return progresses.find(p => p.courseId === courseId && p.studentId === studentId);
    }

    updateCourseProgress(courseId, studentId, itemId, status = 'completed') {
        const progresses = JSON.parse(localStorage.getItem('exampad_course_progress')) || [];
        let pIndex = progresses.findIndex(p => p.courseId === courseId && p.studentId === studentId);

        if (pIndex === -1) {
            progresses.push({
                courseId,
                studentId,
                completedItems: [itemId],
                lastActivity: new Date().toISOString()
            });
        } else {
            if (!progresses[pIndex].completedItems.includes(itemId)) {
                progresses[pIndex].completedItems.push(itemId);
            }
            progresses[pIndex].lastActivity = new Date().toISOString();
        }

        localStorage.setItem('exampad_course_progress', JSON.stringify(progresses));
        return true;
    }

    // ===== SESSION MANAGEMENT =====
    createSession(userId, role) {
        const sessions = JSON.parse(localStorage.getItem('exampad_sessions'));
        // Deactivate old sessions
        sessions.forEach(s => s.isActive = false);

        const sessionId = 'session_' + Date.now();
        const session = {
            sessionId,
            userId,
            role,
            loginTime: new Date().toISOString(),
            lastActivityTime: new Date().toISOString(),
            isActive: true
        };
        sessions.push(session);
        localStorage.setItem('exampad_sessions', JSON.stringify(sessions));
        return session;
    }

    getActiveSession() {
        const sessions = JSON.parse(localStorage.getItem('exampad_sessions'));
        return sessions.find(s => s.isActive);
    }

    endSession(sessionId) {
        const sessions = JSON.parse(localStorage.getItem('exampad_sessions'));
        const session = sessions.find(s => s.sessionId === sessionId);
        if (session) {
            session.isActive = false;
            localStorage.setItem('exampad_sessions', JSON.stringify(sessions));
        }
    }

    // ===== UTILITY FUNCTIONS =====
    hashPassword(password) {
        // Simple hash for demo (in production use bcrypt or similar)
        return btoa(password);
    }

    generateTestId() {
        return 'TST' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    generatePasscode() {
        return Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    calculateScore(attempt) {
        const exam = this.getExamById(attempt.examId);
        if (!exam) return { score: 0, totalMarks: 0, percentage: 0 };

        let score = 0;
        let totalMarks = 0;
        let isPendingManualReview = false;
        const isManual = exam.security?.manualGrading;

        exam.questions.forEach(question => {
            const response = attempt.responses[question.id];

            // 1. Check if teacher has already assigned a manual mark
            if (response && response.manualMark !== undefined) {
                score += parseFloat(response.manualMark);
            } else {
                // 2. Otherwise, check if manual grading is enabled for this type
                const needsManual = isManual && (question.type === 'subjective' || question.type === 'file_upload');

                if (needsManual) {
                    isPendingManualReview = true;
                } else {
                    const isCorrect = this.checkAnswer(question, response);
                    if (isCorrect) {
                        score += question.marks;
                    } else if (exam.negativeMarking && !['subjective', 'coding', 'file_upload'].includes(question.type)) {
                        score -= (exam.negativeMarking / 100) * question.marks;
                    }
                }
            }

            totalMarks += question.marks;
        });

        return {
            score: Math.max(0, score),
            totalMarks,
            percentage: totalMarks > 0 ? (score / totalMarks * 100).toFixed(2) : 0,
            isPendingManualReview
        };
    }

    checkAnswer(question, rawResponse) {
        if (!rawResponse) return false;
        const response = (typeof rawResponse === 'object') ? rawResponse.value : rawResponse;

        switch (question.type) {
            case 'mcq':
            case 'true_false':
            case 'assertion_reason':
                return response === question.correctAnswer;
            case 'subjective':
                if (!question.keywords || question.keywords.length === 0) return true; // Minimal grade if no keywords defined
                return question.keywords.some(kw => response.toLowerCase().includes(kw.toLowerCase()));
            case 'single_integer':
                return parseInt(response) === parseInt(question.correctNumeric);
            case 'numeric':
                const val = parseFloat(response);
                const target = parseFloat(question.correctNumeric);
                const tol = parseFloat(question.tolerance || 0);
                return Math.abs(val - target) <= tol;
            case 'file_upload':
                return !!response; // If file is attached, it's considered "correct" for auto-scoring purposes or pending manual review
            case 'coding':
                return response && response.trim().length > 0;
        }
    }

    // ===== TRANSACTION MANAGEMENT =====
    addTransaction(transactionData) {
        const txs = JSON.parse(localStorage.getItem('exampad_transactions'));
        const tx = {
            ...transactionData,
            id: 'TXN_' + Date.now(),
            timestamp: new Date().toISOString()
        };
        txs.push(tx);
        localStorage.setItem('exampad_transactions', JSON.stringify(txs));
        return tx;
    }

    getStudentTransactions(studentId) {
        const txs = JSON.parse(localStorage.getItem('exampad_transactions'));
        return txs.filter(t => t.studentId === studentId);
    }
}

// Initialize global DB instance
const db = new ExampadDB();
