# EXAMPAD PORTAL
## A Secure, High-Performance Online Examination Ecosystem

![Chitkara University Logo](https://raw.githubusercontent.com/OMAGGARWAL2/EXAMPAD-PORTAL/main/logo.jpg)

EXAMPAD is a comprehensive examination management system designed for **Chitkara University**. It provides a secure, OS-like environment for conducting academic assessments, specialized in proctoring, real-time monitoring, and seamless cross-platform functionality.

---

### Project Overview

The EXAMPAD platform is engineered to bridge the gap between traditional paper-based testing and modern digital assessments. By leveraging a custom proctoring engine, EXAMPAD ensures that academic integrity is maintained even in remote or high-stakes environments. The system is built with a focus on both the user experience (UX) for students and the administrative efficiency for faculty.

---

### Core System Features

#### 1. Security & Proctoring Infrastructure
The primary pillar of EXAMPAD is its security. The system implements multiple layers of protection to prevent malpractice:
*   **Tab-Switch Monitoring**: A low-latency tracking system that detects and logs any instance of the browser losing focus (visibility change).
*   **Action Restriction Engine**: Complete disabling of clipboard operations (Copy, Paste, Cut), right-click context menus, and drag-and-drop functionality.
*   **Developer Shield**: Detection and blocking of common browser inspection shortcuts, including F12, Ctrl+Shift+I, and Ctrl+Shift+J.
*   **Session Management**: Secure login and persistence logic to prevent unauthorized access or session hijacking during tests.

#### 2. Advanced Assessment Management
EXAMPAD supports a wide range of academic requirements:
*   **Multi-Format Question Bank**: Support for Multiple Choice Questions (MCQ), True/False, Subjective/Theory-based, and Coding-specific problems.
*   **Integrated Coding Environment**: A full-featured code editor supporting JavaScript, Python, C++, and Java, allowing students to run and test code within the portal.
*   **Section Control Logic**: Enabling faculty to lock sections sequentially, requiring OTP/Section-level submission before proceeding.
*   **Live Proctor Dashboard**: A real-time monitoring console for teachers that provides live statistics on student progress, score distribution, and malpractice alerts.

#### 3. Professional Interface Design
*   **Aesthetic & Ergonomics**: A clean, high-contrast orange and white theme designed for clarity during long testing sessions.
*   **Responsive Architecture**: Built using flexible layout systems to ensure operational consistency across desktop monitors and mobile devices.

---

### System Architecture

The project is structured according to modular design principles to facilitate scalability and maintainability:

*   **index.html**: The central entry portal for user authentication and redirection.
*   **pages/**: Contains specific functional modules including the Student Dashboard, Teacher Interface, Exam Creator, and the Active Attempt Environment.
*   **js/**: The core logic layer, comprising the authentication system (`auth.js`), security handlers (`security.js`), and the LocalStorage-based database management (`db.js`).
*   **css/**: A centralized styling directory that maintains the project's visual consistency.

---

### Deployment and Installation

#### Web Environment
To run the EXAMPAD portal in a web context, host the directory on a static server.
```bash
# Using a Node.js server
npx http-server

# Or open index.html directly for local testing
```

#### Desktop Environment (Electron)
For maximum security, the portal can be packaged as a standalone desktop application using Electron.
```bash
# Install dependencies
npm install

# Build and Start
npm start
```

---

### Development Team

The EXAMPAD Portal was developed by:
*   **YAKSHI BATISH**
*   **PARAS JINDAL**
*   **PIYUSH THAKUR**
*   **OM AGGARWAL**

**Chitkara University**
Department of Computer Science & Engineering
© 2026 EXAMPAD Engineering | All Rights Reserved.
