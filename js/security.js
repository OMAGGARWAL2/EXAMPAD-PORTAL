// ===== EXAMPAD SECURITY MODULE =====

class ExamSecurity {
    constructor(attemptId) {
        this.attemptId = attemptId;
        this.tabSwitchCount = 0;
        this.copyPasteCount = 0;
        this.init();
    }

    init() {
        this.disableCopyPaste();
        this.detectTabSwitch();
        this.detectWindowFocus();
        this.disableInspectElement();
        this.startSecurityMonitoring();
    }

    // ===== PRE-EXAM SYSTEM CHECKS =====
    async runPreExamChecks(options = { video: true, audio: true }) {
        const results = {
            vpn: false,
            media: false,
            error: null
        };

        try {
            // 1. VPN Check (Instant)
            results.vpn = await this.detectVPN();

            // 2. Combined Media Check (Fastest way to get permissions)
            if (options.video || options.audio) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: options.video,
                    audio: options.audio
                });

                // Keep the stream alive if needed (e.g. for webcam view)
                this.currentMediaStream = stream;
                results.media = true;
            } else {
                results.media = true; // No media required
            }

            return results;
        } catch (err) {
            results.error = err.message || "Permission Denied";
            return results;
        }
    }

    // ===== COPY-PASTE PREVENTION =====
    disableCopyPaste() {
        document.addEventListener('copy', (e) => {
            e.preventDefault();
            this.showAlert('❌ Copy-Paste is not allowed during exam');
            this.recordCopyPasteAttempt();
        });

        document.addEventListener('cut', (e) => {
            e.preventDefault();
            this.showAlert('❌ Cut operation is not allowed during exam');
            this.recordCopyPasteAttempt();
        });

        document.addEventListener('paste', (e) => {
            e.preventDefault();
            this.showAlert('❌ Paste operation is not allowed during exam');
            this.recordCopyPasteAttempt();
        });

        // Prevent right-click context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Disable drag and drop
        document.addEventListener('dragstart', (e) => e.preventDefault());
    }

    // ===== TAB SWITCH DETECTION =====
    detectTabSwitch() {
        // Browser level monitoring
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.tabSwitchCount++;
                this.recordTabSwitch();
                this.showAlert('⚠️ TAB SWITCH DETECTED! (Count: ' + this.tabSwitchCount + ')');
                this.logWarning('Student switched tabs/windows');
            }
        });

        // Desktop App (Electron) level monitoring
        if (window.proctorBridge) {
            window.proctorBridge.onSystemEvent((data) => {
                if (data.type === 'FOCUS_LOST') {
                    this.tabSwitchCount++;
                    this.recordTabSwitch();
                    this.showAlert(`🚩 DESKTOP VIOLATION: ${data.message}`);
                    this.showStickyLockscreen();
                } else if (data.type === 'ILLEGAL_INPUT') {
                    this.showAlert(`🛑 SECURITY BLOCK: ${data.message}`);
                }
            });
            console.log("Desktop Proctoring Active: FOCUS_LOCK / SHORTCUT_BLOCK");
        }
    }

    showStickyLockscreen() {
        if (document.getElementById('erp-lock-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'erp-lock-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 999999;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: white; font-family: 'Inter', sans-serif;
        `;
        overlay.innerHTML = `
            <i class="fas fa-lock" style="font-size: 4rem; color: #7b1e2b; margin-bottom: 20px;"></i>
            <h1 style="font-weight: 800; letter-spacing: 2px;">SESSION_LOCKED</h1>
            <p style="margin-top: 10px; color: #94a3b8;">Focus violation detected. Acknowledgment required.</p>
            <button id="unlock-btn" style="margin-top: 30px; background: #7b1e2b; color: white; border: none; padding: 12px 40px; border-radius: 4px; font-weight: 700; cursor: pointer;">ACKNOWLEDGE & RESUME</button>
        `;
        document.body.appendChild(overlay);

        document.getElementById('unlock-btn').onclick = () => {
            overlay.remove();
        };
    }

    // ===== WINDOW FOCUS DETECTION =====
    detectWindowFocus() {
        window.addEventListener('beforeunload', (e) => {
            if (document.querySelector('[data-exam-active="true"]')) {
                e.preventDefault();
                e.returnValue = 'Exam is in progress. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // ===== DISABLE DEVELOPER TOOLS =====
    disableInspectElement() {
        // Detect F12
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                e.preventDefault();
                this.showAlert('⚠️ Developer tools are disabled during exam');
                return false;
            }

            // Detect Ctrl+Shift+I (Inspect element)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                this.showAlert('⚠️ Inspect element is disabled during exam');
                return false;
            }

            // Detect Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.key === 'J') {
                e.preventDefault();
                return false;
            }

            // Detect Ctrl+S (Save page)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                return false;
            }
        });
    }

    // ===== MONITORING & LOGGING =====
    recordTabSwitch() {
        const attempt = db.getAttempt(this.attemptId);
        if (attempt) {
            attempt.tabSwitchCount = (attempt.tabSwitchCount || 0) + 1;
            const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));
            const index = attempts.findIndex(a => a.id === this.attemptId);
            if (index !== -1) {
                attempts[index] = attempt;
                localStorage.setItem('exampad_attempts', JSON.stringify(attempts));
            }
        }
    }

    recordCopyPasteAttempt() {
        const attempt = db.getAttempt(this.attemptId);
        if (attempt) {
            attempt.copyPasteAttempts = (attempt.copyPasteAttempts || 0) + 1;
            const attempts = JSON.parse(localStorage.getItem('exampad_attempts'));
            const index = attempts.findIndex(a => a.id === this.attemptId);
            if (index !== -1) {
                attempts[index] = attempt;
                localStorage.setItem('exampad_attempts', JSON.stringify(attempts));
            }
        }
    }

    startSecurityMonitoring() {
        // Periodic check for suspicious activity
        setInterval(() => {
            this.checkConnectionStatus();
        }, 30000); // Every 30 seconds
    }

    checkConnectionStatus() {
        // Simple connectivity check
        if (!navigator.onLine) {
            this.showAlert('⚠️ Internet connection lost! Please reconnect.');
        }
    }

    // ===== ALERTS =====
    showAlert(message) {
        if (typeof showToast === 'function') {
            showToast(message, 'error');
            return;
        }
        const t = document.createElement('div');
        t.style = "position:fixed; top:80px; left:50%; transform:translate(-50%, -10px); background:rgba(254, 243, 242, 0.95); color:#D92120; border:1px solid #FECDCA; padding:16px 40px; border-radius:12px; font-weight:500; z-index:100001; font-size:1.4rem; font-family:'Roboto', sans-serif; box-shadow:0 12px 32px rgba(0,0,0,0.08); opacity:0; transition:all 0.4s; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);";
        t.innerHTML = `<span>${message}</span>`;
        document.body.appendChild(t);
        requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translate(-50%, 0)'; });
        setTimeout(() => {
            if (t.parentElement) {
                t.style.opacity = '0';
                t.style.transform = 'translate(-50%, -10px)';
                setTimeout(() => t.remove(), 400);
            }
        }, 3500);
    }

    // ===== VPN DETECTION =====
    async detectVPN() {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Strategy 1: Check for known mismatch between browser and system time
        const now = new Date();
        const offset = now.getTimezoneOffset();

        // This is a common heuristic: Check if timezone matches common VPN patterns
        // In a real app, you might use a service like 'https://ipapi.co/json/' 
        // to check if the IP belongs to a hosting provider.

        console.log(`[SECURITY] Testing Environment... TZ: ${browserTimezone}, Offset: ${offset}`);

        // Simulation for the user: we detect it if the timezone doesn't match a "standard" one or if we find mismatches
        const isSuspicious = browserTimezone.includes('Etc/GMT') || browserTimezone.includes('UTC');

        if (isSuspicious) {
            this.showAlert('🚩 VPN / PROXY DETECTED! Security protocol requires direct connection.');
            this.logWarning('Student likely using VPN: ' + browserTimezone);
            return true;
        }
        return false;
    }

    logWarning(message) {
        console.warn('[EXAMPAD SECURITY]', message);
        // Could be sent to server for monitoring
    }
}

// Add CSS animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
