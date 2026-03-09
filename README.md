# EXAMPAD-PORTAL
### Secure OS-Style Examination Ecosystem

EXAMPAD is a high-performance, secure, and professional examination portal designed for **OM AGGARWAL Classes**. It focuses on providing a desktop-like ERP experience with strict proctoring to ensure exam integrity.

---

## 🚀 Key Features

### 🛡️ Secure Proctoring
- **Tab-Switch Detection**: Monitors and logs when students switch tabs.
- **Strict Controls**: Prevents copy-pasting, right-clicking, and basic keyboard shortcuts.
- **DevTools Block**: Restricts access to F12 and inspection tools.

### 📝 Exam Management
- **Question Variety**: Support for MCQ, Subjective, True/False, and Coding questions.
- **Coding Problems**: Built-in editor supporting JS, Python, C++, and Java.
- **Section Workflow**: Enforced section sequence with OTP-based submissions.
- **Live Monitoring**: Real-time teacher dashboard to track progress.

### 🎨 User Experience
- **Interface**: Modern orange and white theme with a clean, professional layout.
- **Architecture**: Fast, responsive navigation across all devices.

---

## 📁 System Structure

```
EXAMPAD/
├── index.html           # Main Portal Entry
├── pages/               # Functional Modules
│   ├── exam-attempt.html  # Active Test Environment
│   ├── teacher-dashboard.html 
│   └── exam-creator.html
├── js/                  # Logic and Storage
│   ├── auth.js          
│   ├── security.js      # Anti-cheat Engine
│   └── db.js            # LocalStorage Logic
└── css/                 # Global Styling
```

---

## ⚙️ How to Run

### Web Access
Simply serve the root directory or open `index.html` in a modern browser.
```bash
npx http-server
```

### Desktop Version (Electron)
The portal is designed to run as a secure desktop App.
```bash
npm install
npm start
```

---

## 👥 Development Team
- **YAKSHI BATISH**
- **PARAS JINDAL**
- **PIYUSH THAKUR**
- **OM AGGARWAL**

**Built for OM AGGARWAL Classes**
© 2026 EXAMPAD Engineering
