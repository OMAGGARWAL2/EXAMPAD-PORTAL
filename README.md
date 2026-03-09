# EXAMPAD - Secure Online Examination Platform

**EXAMPAD** is a comprehensive, feature-rich online examination platform designed for OM AGGARWAL Classes. It supports multiple question types, security features, and both teacher and student dashboards.

## 🎯 Features

### Teacher Features
- ✅ Create exams with multiple question types (MCQ, True/False, Subjective, Coding)
- ✅ Section management with section lock (enforce sequential attempt)
- ✅ Multiple programming languages support (JavaScript, Python, C++, Java)
- ✅ Fixed code templates (upper/lower) with editable middle sections
- ✅ Test cases for coding problems
- ✅ Exam scheduling
- ✅ WiFi restriction (restrict exams to specific networks)
- ✅ Negative marking configuration
- ✅ Real-time exam monitoring with student dashboards
- ✅ Share exam via Test ID and Passcode
- ✅ Download exam reports

### Student Features
- ✅ Join exam by Test ID or Direct Link
- ✅ Multiple question types support
- ✅ Exam timer with warning
- ✅ Question palette for quick navigation
- ✅ Flag questions for review
- ✅ Code editor with language switching
- ✅ One-time attempt policy
- ✅ Detailed feedback after submission
- ✅ Performance analytics
- ✅ Download performance report

### Security Features
- 🔒 Copy-Paste Prevention
- 🔒 Tab-Switch Detection & Alerting
- 🔒 Developer Tools Disabled (F12, Inspect Element, etc.)
- 🔒 Malpractice Logging (Tab switches, Copy-paste attempts recorded)
- 🔒 Session Management
- 🔒 WiFi Restriction Option
- 🔒 One-time Attempt Only
- 🔒 OTP Confirmation for Section Submission (Ready for Integration)

### User Interface
- 🎨 Beautiful Orange & White Theme
- 📱 Fully Responsive Design
- ⚡ Smooth Animations & Transitions
- 🌐 Professional Modern UI

## 📁 Project Structure

```
EXAMPAD/
├── index.html                          # Landing page
├── css/
│   └── styles.css                      # Global styles (Orange/White theme)
├── js/
│   ├── db.js                          # LocalStorage database management
│   ├── auth.js                        # Authentication & session management
│   ├── security.js                    # Security features (copy-paste, tab-switch, etc)
│   └── utils.js                       # Helper functions
├── pages/
│   ├── login.html                     # Login/Signup page
│   ├── teacher-dashboard.html         # Teacher main dashboard
│   ├── exam-creator.html              # Exam creation interface
│   ├── exam-monitor.html              # Real-time student monitoring
│   ├── student-dashboard.html         # Student main dashboard
│   ├── exam-attempt.html              # Active exam interface
│   └── feedback.html                  # Post-exam feedback & results
└── README.md                           # This file
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Basic understanding of HTML/CSS/JavaScript
- Internet connection for initial loading

### Installation

1. **Clone/Download the project:**
   ```bash
   git clone https://github.com/omagg/exampad.git
   cd EXAMPAD
   ```

2. **No installation required!** EXAMPAD uses:
   - **Frontend:** Vanilla HTML, CSS, JavaScript
   - **Database:** Browser LocalStorage (client-side)
   - **No Backend:** Fully client-side application

3. **Run locally:**
   - Option A: Open `index.html` directly in your browser
   - Option B: Use a local server (recommended)
   
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Access the application:**
   ```
   http://localhost:8000/index.html
   ```

## 📖 User Guide

### For Teachers

#### 1. **Create an Account**
- Go to landing page
- Click "Login / Signup" under Teacher
- Create a new account with email, name, and password

#### 2. **Create an Exam**
- From Teacher Dashboard, click "Create New Exam"
- Fill in basic details (title, description, duration, total marks)
- Set up sections (if needed)
- Add questions:
  - **MCQ:** Multiple choice with single correct answer
  - **True/False:** Boolean questions
  - **Subjective:** Text-based with keyword matching
  - **Coding:** With language selection and test cases
- Configure negative marking (optional)
- Schedule exam date/time (optional)
- Enable WiFi restriction if needed
- Save as Draft or Publish

#### 3. **Publish Exam**
- Click "Publish Exam" to make it live
- System auto-generates Test ID (e.g., TST9B2K3L) and Passcode
- Share Test ID and Passcode with students

#### 4. **Monitor Exam**
- From dashboard, click "Monitor" on any live exam
- View real-time student progress
- See scores, time spent, and malpractice detection (tab switches)
- Auto-refreshes every 5 seconds

#### 5. **View Results**
- After exam ends, view individual student feedback
- Download performance reports

### For Students

#### 1. **Create Account**
- Go to landing page
- Click "Login / Signup" under Student
- Create account with email, name, password, and role

#### 2. **Join Exam**
Two options:
- **By Test ID:** Enter Test ID and Passcode
- **By Invite Link:** Paste the shared exam link

#### 3. **Attempt Exam**
- Read questions carefully
- Answer options appear based on question type:
  - MCQ: Select one option
  - True/False: Select True or False
  - Subjective: Type your answer
  - Coding: Write code, switch languages, run test cases
- Use question palette to navigate
- Flag questions for review
- Watch the timer (warnings at 5 min)

#### 4. **Submit Exam**
- Click "Submit Exam" when done
- Confirm submission (cannot be undone)
- Auto-submitted when time expires

#### 5. **View Feedback**
- See your score and percentage
- View question-by-question review
- Check your answers vs correct answers
- See performance analytics

## 🔐 Security Measures

### Copy-Paste Prevention
- Disabled `Ctrl+C`, `Ctrl+V`, `Ctrl+X`
- Disabled right-click context menu
- Disabled drag-and-drop

### Tab-Switch Detection
- Detected via `visibilitychange` and `blur` events
- Count logged and displayed in feedback
- Alerts student of violations

### Developer Tools
- Blocked F12
- Blocked Ctrl+Shift+I
- Blocked Ctrl+Shift+J
- Blocked document inspection

### Malpractice Logging
- Records all tab switches
- Records copy-paste attempts
- Displays warnings in student feedback

### Session Management
- Login/Logout functionality
- Session persistence
- Active exam protection (prevents accidental close)

## 💾 Data Storage

EXAMPAD uses **Browser LocalStorage** for all data:
- Users database
- Exams and questions
- Student attempts
- Responses and scores
- Sessions

### Storage Keys:
```javascript
exampad_users        // User accounts
exampad_exams        // All exams
exampad_attempts     // Student attempts
exampad_sessions     // Active sessions
```

**⚠️ Note:** Data is deleted if browser cache is cleared. For production, implement a real backend database.

## 🎨 Customization

### Change Colors
Edit `css/styles.css`:
```css
:root {
    --primary-orange: #FF8C00;
    --light-orange: #FFA500;
    --dark-orange: #E67E00;
    /* ... other colors ... */
}
```

### Change Font
Update font-family in `styles.css`:
```css
body {
    font-family: 'Your Font Name', sans-serif;
}
```

### Add Logo
Replace "OM AGGARWAL Classes" in `index.html` with:
```html
<img src="path/to/logo.png" alt="Logo" style="height: 50px;">
```

## 🔧 Advanced Features

### Section Lock
When enabled, students must complete sections sequentially:
1. Can only answer questions in current section
2. Must submit section before moving to next
3. Cannot go back to previous sections

### Multiple Language Support (Coding)
Add as many languages as needed:
- JavaScript
- Python
- C++
- Java

Each language has its own template (upper/middle/lower code)

### WiFi Restriction
Restrict exam to specific network:
```
Settings → WiFi Restriction → Enable
Enter WiFi SSID → Save
```

### Test Cases
For coding problems, add test cases:
```
Input1 | Expected Output1
Input2 | Expected Output2
```

## 🚀 API Reference

### Database Functions

```javascript
// Users
db.addUser(userData)
db.getUser(email)
db.authenticateUser(email, password)

// Exams
db.createExam(examData, teacherId)
db.getExamById(examId)
db.getTeacherExams(teacherId)
db.updateExam(examId, updateData)

// Attempts
db.startAttempt(examId, studentId)
db.getAttempt(attemptId)
db.updateAttemptResponse(attemptId, questionId, response)
db.submitAttempt(attemptId)

// Sessions
db.createSession(userId, role)
db.getActiveSession()
db.endSession(sessionId)
```

## 🐛 Troubleshooting

### Issue: Exams not saving
**Solution:** Check browser's LocalStorage limit. Clear old data if needed.

### Issue: Timer not updating
**Solution:** Refresh page or check browser console for errors.

### Issue: Can't join exam
**Solution:** Verify Test ID and Passcode are correct.

### Issue: Copy-paste still works
**Solution:** Some browsers may have additional security. Try different browser or disable extensions.

## 📋 Test Data

To populate test data, run in browser console:

```javascript
// Create a teacher account
auth.signup('teacher@example.com', 'John Teacher', 'password123', 'password123', 'teacher');

// Create exam
const result = db.createExam({
    title: 'JavaScript Basics',
    description: 'Test your JS knowledge',
    duration: 30,
    totalMarks: 50,
    questions: [{
        id: 'q1',
        type: 'mcq',
        title: 'What is JavaScript?',
        marks: 5,
        options: ['Language', 'Browser', 'Library'],
        correctAnswer: 'Language'
    }]
}, auth.getCurrentUser().id);
```

## 📱 Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome  | ✅ Full |
| Firefox | ✅ Full |
| Safari  | ✅ Full |
| Edge    | ✅ Full |
| IE 11   | ❌ Not supported |

## 📝 License

This project is proprietary software for OM AGGARWAL Classes. All rights reserved.

## 🤝 Support

For issues or feature requests, contact the development team.

## 🔄 Future Enhancements

- [ ] Backend database (MongoDB/PostgreSQL)
- [ ] User authentication (OAuth)
- [ ] Real-time code execution
- [ ] Video proctoring integration
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard
- [ ] Certificate generation
- [ ] API for 3rd party integrations

---

**Created with ❤️ for OM AGGARWAL Classes**
**EXAMPAD v1.0** | 2026
