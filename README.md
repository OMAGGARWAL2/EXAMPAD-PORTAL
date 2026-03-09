# 🚀 EXAMPAD-PORTAL
### *The Ultimate Secure OS-Style Examination Ecosystem*

![EXAMPAD Banner](logo.jpg)

**EXAMPAD** is a high-performance, secure, and feature-rich examination platform designed to provide a professional ERP-like experience. Built for **OM AGGARWAL Classes**, it combines a beautiful glassmorphic UI with robust proctoring capabilities.

---

## ✨ Key Features

### 🛡️ Ironclad Security (Zero-Malpractice Policy)
- **Anti-Tab Switching**: Real-time detection and logging of tab changes.
- **Copy-Paste Block**: Complete restriction of clipboard actions (Ctrl+C, Ctrl+V, right-click).
- **Proctoring Engine**: Integrated logging of all student activities.
- **Developer Shield**: Blocks F12, Inspect Element, and other dev tools.

### 📝 Exam Management
- **Versatile Question Types**: Support for MCQ, Subjective, True/False, and complex Coding problems.
- **Dynamic Coding Interface**: Full-featured code editor with multi-language support (JS, Python, C++, Java).
- **Section Lock**: Enforce sequential attempts with OTP-based section submission.
- **Real-Time Monitoring**: Live dashboard for teachers to track scores and student progress.

### 🎨 Premium UI/UX
- **Aesthetic Design**: Modern Orange & White theme with smooth micro-animations.
- **OS-Style Interface**: Intuitive navigation that feels like a desktop environment.
- **Fully Responsive**: Optimized for desktops, tablets, and smartphones.

---

## 📁 Project Architecture

```bash
EXAMPAD/
├── 🌐 index.html          # Landing Portal
├── 📁 pages/              # Module Pages
│   ├── exam-attempt.html  # Active Exam Environment
│   ├── teacher-dash.html  # Teacher Analytics
│   └── exam-creator.html  # Smart Question Builder
├── 📁 js/                 # Logic Core
│   ├── auth.js           # Secure Authentication
│   ├── security.js       # Anti-cheat Engine
│   └── database.js       # LocalStorage Management
└── 📁 css/                # Styling Tokens
    └── styles.css        # Premium CSS System
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/OMAGGARWAL2/EXAMPAD-PORTAL.git
cd EXAMPAD-PORTAL
```

### 2. Launch Local Server
No complex setup needed! Just serve the folder:
```bash
# Using Node.js
npx http-server

# Or open index.html directly in Chrome
```

### 3. Desktop Mode (Electron)
To run as a secure desktop application:
```bash
npm install
npm start
```

---

## 🛠️ Built With
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Desktop Core**: Electron.js
- **API**: Integration-ready for OpenAI (Automated Grading)
- **Database**: Advanced LocalStorage-based Persistent Storage

---

## 🏆 Future Roadmap
- [ ] **AI Proctoring**: Facial recognition and eye-tracking.
- [ ] **Cloud Sync**: MongoDB integration for global scalability.
- [ ] **PDF Generator**: Auto-generate beautiful result certificates.
- [ ] **Mobile App**: Native iOS/Android student portal.

---

**Created with ❤️ by OMAGGARWAL Engineering**
*Empowering education through secure technology.*
