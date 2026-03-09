const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// AI Integration imports
require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let mainWindow;

/**
 * CORE COMMANDS:
 * 1. TAB_CONTROL: Disable Alt+Tab / Win+Tab (Simulated via focus enforcement)
 * 2. SCREENSHOT_BLOCK: Disable PrintScreen / Cmd+Shift+4
 * 3. PROCTOR_COMMANDS: Remote capture and session locking
 */

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#f4f5f7',
        title: "EXAMPAD COMMAND CENTER",
        icon: path.join(__dirname, 'logo.jpg'), // Chitkara APP ICON
        // titleBarStyle: 'hidden', // Removed to show standard OS buttons
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    // Load the ERP Home
    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // --- TAB SWITCHING CONTROL ---
    // In a real proctoring session, we enforce focus.
    mainWindow.on('blur', () => {
        // Send violation signal to frontend
        mainWindow.webContents.send('proctor-event', {
            type: 'FOCUS_LOST',
            severity: 'CRITICAL',
            message: 'User navigated away from the application workspace.'
        });
    });

    mainWindow.on('focus', () => {
        mainWindow.webContents.send('proctor-event', {
            type: 'FOCUS_REGAINED',
            message: 'Session resumed.'
        });
    });

    // --- SECURITY OVERRIDES ---
    mainWindow.on('close', (e) => {
        // Option: Block accidental close during exam if a flag is set
        // e.preventDefault();
    });
}

function registerSecurityShortcuts() {
    // Block common screenshot keys
    const screenshotKeys = ['PrintScreen', 'CommandOrControl+Shift+4', 'CommandOrControl+Shift+3'];

    screenshotKeys.forEach(key => {
        const res = globalShortcut.register(key, () => {
            mainWindow.webContents.send('proctor-event', {
                type: 'ILLEGAL_INPUT',
                message: `Screenshot attempt blocked: ${key}`
            });
        });
        if (!res) console.log(`Failed to register ${key}`);
    });
}

app.whenReady().then(() => {
    createWindow();
    registerSecurityShortcuts();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// --- IPC HANDLERS FOR WINDOW CONTROL ---
ipcMain.on('window-control', (event, action) => {
    switch (action) {
        case 'minimize':
            mainWindow.minimize();
            break;
        case 'maximize':
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
            break;
        case 'close':
            mainWindow.close();
            break;
    }
});

ipcMain.on('kiosk-mode', (event, enable) => {
    if (mainWindow) {
        if (enable) {
            mainWindow.setKiosk(true);
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
            mainWindow.setFullScreen(true);
        } else {
            mainWindow.setKiosk(false);
            mainWindow.setAlwaysOnTop(false);
            mainWindow.setFullScreen(false);
        }
    }
});

ipcMain.handle('take-forced-screenshot', async (event, filename) => {
    try {
        const image = await mainWindow.webContents.capturePage();
        const screenshotPath = path.join(app.getPath('userData'), 'audit_screens');

        if (!fs.existsSync(screenshotPath)) {
            fs.mkdirSync(screenshotPath, { recursive: true });
        }

        const fullPath = path.join(screenshotPath, filename || `audit_${Date.now()}.png`);
        fs.writeFileSync(fullPath, image.toPNG());

        return { success: true, path: fullPath };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// IPC Handler for AI Requests via Direct OpenAI API
ipcMain.handle('ask-ai', async (event, prompt) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "user", content: prompt }
            ]
        });
        return { success: true, reply: response.choices[0].message.content };
    } catch (err) {
        console.error("OpenAI Inference Error:", err);
        return { success: false, error: "AI Engine Offline. Check credentials." };
    }
});

// App lifecycle
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
