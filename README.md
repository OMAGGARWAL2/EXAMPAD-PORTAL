# EXAMPAD PORTAL
## Secure Examination System

<img src="https://upload.wikimedia.org/wikipedia/en/e/e0/Chitkara_University_logo.png" width="250">

EXAMPAD is a secure examination portal developed for managing and conducting assessments. It provides a robust proctoring environment with features to prevent unauthorized activities and ensure academic integrity.

---

### Core Functionality

#### Security and Proctoring
* Tab-Switch Monitoring: Detects and records any changes to browser focus.
* Action Restrictions: Disables clipboard interaction, right-click context menus, and developer tools.
* Shortcuts Blocking: Restricts keyboard shortcuts like F12 and Ctrl+Shift+I to prevent code inspection.

#### Assessment Management
* Question Formats: Support for Objective (MCQ, T/F), Subjective, and Technical (Coding) questions.
* Online Coding Environment: Integrated development environment for languages including Python, C++, Java, and JavaScript.
* Section Management: Conditional section progression with OTP validation for submission.
* Real-Time Monitoring: Administrative dashboard for tracking student status and performance in real-time.

#### Interface Design
* Professional layout with a clean orange and white theme.
* Responsive design compatible across mobile and desktop platforms.

---

### Project Structure

* index.html - Application entry point
* pages/ - Application modules for students and faculty
* js/ - Logic, Security, and Database management
* css/ - Styling and layout specifications

---

### Deployment

#### Web Access
To run the application locally, serve the root directory:
```bash
npx http-server
```

#### Desktop Application (Electron)
The project can be executed as a secure desktop application:
```bash
npm install
npm start
```

---

### Development Team

* YAKSHI BATISH
* PARAS JINDAL
* PIYUSH THAKUR
* OM AGGARWAL

**Chitkara University**
© 2026 EXAMPAD Engineering
