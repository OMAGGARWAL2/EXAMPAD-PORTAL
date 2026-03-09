// ===== EXAMPAD UI AUTHENTICATION LOGIC =====

const ADMIN_AUTHORIZATION_CODE = 'ADMIN2026';

function showMessage(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

function togglePass(id, icon) {
    const el = document.getElementById(id);
    if (el.type === 'password') {
        el.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        el.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function checkCaps(e) {
    const warning = document.getElementById(e.target.id === 'loginPassword' ? 'loginCaps' : 'signupCaps');
    if (!warning) return;
    if (e.getModifierState('CapsLock')) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}

function toggleAdminCode() {
    const role = document.getElementById('signupRole').value;
    const group = document.getElementById('adminCodeGroup');
    if (group) group.style.display = role === 'teacher' ? 'block' : 'none';
}

function handleForgot(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    if (!email) return showMessage('Enter your Identifier first');

    const res = auth.forgotPassword(email);
    showMessage(res.message);
}

function switchTab(tab) {
    const slider = document.getElementById('tabSlider');
    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');
    const loginBtn = document.getElementById('loginTab');
    const signupBtn = document.getElementById('signupTab');

    if (tab === 'login') {
        slider.style.transform = 'translateX(0)';
        loginSection.classList.add('active');
        signupSection.classList.remove('active');
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
    } else {
        slider.style.transform = 'translateX(100%)';
        loginSection.classList.remove('active');
        signupSection.classList.add('active');
        loginBtn.classList.remove('active');
        signupBtn.classList.add('active');
    }
}

// Event Listeners initialization
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // --- DETECT INBOUND TEST LINK (User Request) ---
    const urlParams = new URLSearchParams(window.location.search);
    const urlTestId = urlParams.get('testId') || urlParams.get('invite');
    const urlPasscode = urlParams.get('passcode');

    const testField = document.getElementById('loginTestCode');
    const testLabel = testField?.parentElement.querySelector('label');

    if (urlTestId) {
        if (testField) testField.value = urlTestId;
        if (testLabel) testLabel.innerHTML = 'ENTRY PASSCODE <i class="fas fa-lock" style="margin-left:4px; font-size:0.7rem;"></i>';
        if (testField) testField.placeholder = "Enter passcode for this link";
        if (urlPasscode && testField) testField.value = urlPasscode;
        console.log(`[SECURE LINK] Detected Test: ${urlTestId}`);
    }

    // --- AUTO-FILL SAVED IDENTITY ---
    const saved = auth.getSavedCredentials();
    if (saved && loginForm) {
        document.getElementById('loginEmail').value = saved.email;
        document.getElementById('loginPassword').value = saved.password;

        if (!urlTestId) {
            switchTab('login');
        }
        console.log(`[SYSTEM] Identity restored for: ${saved.email}`);

        const btn = document.getElementById('loginSubmitBtn');
        if (btn) btn.focus();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginSubmitBtn');
            const email = document.getElementById('loginEmail').value.trim();
            const pass = document.getElementById('loginPassword').value;
            const testCodeField = document.getElementById('loginTestCode');
            const testCode = testCodeField ? testCodeField.value.trim() : '';
            const remember = false;

            if (!email || !pass) return showMessage('Missing credentials');

            btn.disabled = true;
            btn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> VERIFYING...</span>';

            await new Promise(r => setTimeout(r, 800));

            const res = auth.login(email, pass, remember);

            if (res.success) {
                showMessage('Access Granted. Teleporting...');

                const suffix = testCode ? `?testId=${testCode}` : '';

                setTimeout(() => {
                    const target = res.user.role === 'teacher' ? './teacher-dashboard.html' : `./student-dashboard.html${suffix}`;
                    window.location.assign(target);
                }, 1000);
            } else {
                showMessage(res.message);
                btn.disabled = false;
                btn.innerHTML = '<span>sign in</span>';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('signupSubmitBtn');
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const role = document.getElementById('signupRole').value;
            const pass = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const adminCode = document.getElementById('adminCode').value;

            // --- VALIDATION ---
            if (!name || name.length < 2) return showMessage('Enter your full assigned name');
            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return showMessage('Invalid email format');

            if (role === 'teacher' && adminCode !== ADMIN_AUTHORIZATION_CODE) {
                return showMessage('Unauthorized Administrator Code');
            }

            if (pass.length < 6) return showMessage('Security Key must be 6+ characters');
            if (pass !== confirm) return showMessage('Security Keys do not match');

            btn.disabled = true;
            btn.innerHTML = '<span><i class="fas fa-spinner fa-spin"></i> INITIALIZING...</span>';

            await new Promise(r => setTimeout(r, 1200));

            const res = auth.signup(email, name, pass, confirm, role);

            if (res.success) {
                showMessage('Neural link established. Welcome.');

                // Preserve invite parameters for the dashboard
                const urlParams = new URLSearchParams(window.location.search);
                const invite = urlParams.get('invite') || urlParams.get('testId');
                const suffix = invite ? `?invite=${invite}` : '';

                setTimeout(() => {
                    const target = role === 'teacher' ? './teacher-dashboard.html' : `./student-dashboard.html${suffix}`;
                    window.location.assign(target);
                }, 1200);
            } else {
                showMessage(res.message);
                btn.disabled = false;
                btn.innerHTML = '<span>GENERATE IDENTITY</span>';
            }
        });
    }
});
// --- DIRECT JOIN LOGIC ---
function showJoinModal(e) {
    if (e) e.preventDefault();
    document.getElementById('joinModal').style.display = 'flex';
}

function closeJoinModal() {
    document.getElementById('joinModal').style.display = 'none';
}

function handleDirectJoin() {
    const testId = document.getElementById('directTestId').value.trim();
    const passcode = document.getElementById('directPasscode').value.trim();

    if (!testId) return showMessage('Test ID is required');

    // Store in session to carry over if login is needed
    sessionStorage.setItem('pending_test_id', testId);
    sessionStorage.setItem('pending_passcode', passcode);

    if (auth.isLoggedIn()) {
        const user = auth.getCurrentUser();
        if (user.role === 'teacher') {
            showMessage('Teachers cannot join exams as students');
            return;
        }
        // Redirect to dashboard with parameters
        window.location.href = `./student-dashboard.html?invite=${testId}&passcode=${passcode}`;
    } else {
        showMessage('Identity required. Please Sign In first.');
        closeJoinModal();
        // The student-dashboard will auto-populate these later
    }
}
/**
 * ERP AI ASSISTANT - UI INTEGRATION
 * Communicates directly with Electron Main Process via secure IPC bridge
 */
async function askAI(promptMessage) {
    try {
        if (!window.proctorBridge || typeof window.proctorBridge.askAI !== 'function') {
            throw new Error("ProctorBridge IPC (askAI) is not exposed or running outside Electron.");
        }

        const response = await window.proctorBridge.askAI(promptMessage);

        if (!response.success) {
            throw new Error(response.error || "Unknown Inference Error");
        }

        return response.reply;

    } catch (error) {
        console.error("AI Assistant IPC Failure:", error);
        return "ERROR: AI Inference Engine offline. Please ensure credentials are valid and you are running within the secure Electron environment.";
    }
}