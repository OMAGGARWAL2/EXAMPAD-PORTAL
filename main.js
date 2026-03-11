/**
 * EXAMPAD MAIN PROCESS
 * Environment: Node.js (Electron Main)
 * Role: Desktop Controller / Secure Server
 */

const { app, BrowserWindow, ipcMain, globalShortcut, dialog, Menu, desktopCapturer, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');

// AI Integration imports
require('dotenv').config();

let mainWindow;

// --- DEEP LINKING SUPPORT ---
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('exampad', process.execPath, [path.resolve(process.argv[1])]);
    }
} else {
    app.setAsDefaultProtocolClient('exampad');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();

            // Handle the URL from the command line (for Windows)
            const url = commandLine.pop();
            if (url && url.startsWith('exampad://')) {
                handleIncomingURL(url);
            }
        }
    });

    app.whenReady().then(() => {
        Menu.setApplicationMenu(null); // Remove default menu bar
        createWindow();
        registerSecurityShortcuts();

        // Check if app was opened via protocol (on startup)
        const url = process.argv.find(arg => arg.startsWith('exampad://'));
        if (url) {
            setTimeout(() => handleIncomingURL(url), 1500);
        }

        app.on('activate', function () {
            if (BrowserWindow.getAllWindows().length === 0) createWindow();
        });
    });
}

function handleIncomingURL(url) {
    try {
        const fullUrl = new URL(url);
        const examId = fullUrl.searchParams.get('id');
        if (examId && mainWindow) {
            // Signal renderer to navigate to this exam
            mainWindow.webContents.send('open-exam-intent', { examId });
        }
    } catch (e) {
        console.error('Failed to parse deep link URL:', url, e);
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        backgroundColor: '#f4f5f7',
        title: "EXAMPAD COMMAND CENTER",
        icon: path.join(__dirname, 'logo.jpg'), // Use Chitkara logo as app icon
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            devTools: false // Disable DevTools internally
        },
        show: false
    });

    mainWindow.loadFile('index.html'); // Load root index.html to fix relative paths

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // SILENTLY close devtools if they try to open (secondary guard)
    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.closeDevTools();
    });

    // Prevent window closing during session if in kiosk
    mainWindow.on('close', (e) => {
        if (mainWindow && mainWindow.isKiosk()) {
            e.preventDefault();
        }
    });

    // Prevent minimizing
    mainWindow.on('minimize', (e) => {
        e.preventDefault();
        mainWindow.restore();
    });

    // --- TAB SWITCHING CONTROL ---
    mainWindow.on('blur', () => {
        mainWindow.webContents.send('proctor-event', {
            type: 'FOCUS_LOST',
            severity: 'CRITICAL',
            message: 'User navigated away from the application workspace.'
        });

        if (mainWindow.isKiosk()) {
            mainWindow.focus();
            mainWindow.setAlwaysOnTop(true, 'screen-saver');
        }
    });

    mainWindow.on('focus', () => {
        mainWindow.webContents.send('proctor-event', {
            type: 'FOCUS_REGAINED',
            message: 'Session resumed.'
        });
    });

    // AGGRESSIVE DESKTOP LOCK: Prevent escape via Virtual Desktops (Win+Tab / Touchpad Swipes)
    mainWindow.on('visibility-change', (event, state) => {
        if (state === 'hidden' && mainWindow.isKiosk()) {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    mainWindow.on('leave-full-screen', () => {
        if (mainWindow.isKiosk()) {
            mainWindow.setFullScreen(true);
        }
    });
}

function registerSecurityShortcuts() {
    const blockedKeys = [
        'Escape',
        'PrintScreen',
        'CommandOrControl+Shift+4',
        'CommandOrControl+Shift+3',
        'Alt+Tab',
        'Alt+Shift+Tab',
        'Alt+F4',
        'Alt+Esc',
        'Alt+Space',
        'Control+Esc',
        'Super',         // Windows Key
        'Meta',          // Windows Key
        'CommandOrControl+Tab',
        'CommandOrControl+H',
        'CommandOrControl+Q',
        'CommandOrControl+W',
        'CommandOrControl+R',
        'CommandOrControl+Shift+I',
        'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
        'Meta+D',
        'Meta+Tab',
        'Meta+L',
        'Meta+I',
        'Meta+A',
        'Meta+S',
        'Meta+Control+D',
        'Meta+Control+Left',
        'Meta+Control+Right'
    ];

    blockedKeys.forEach(key => {
        try {
            globalShortcut.register(key, () => {
                // SILENT BLOCKING: Sends event for counting, but clears clipboard for PrintScreen.
                if (mainWindow) {
                    mainWindow.webContents.send('proctor-event', {
                        type: 'ILLEGAL_INPUT',
                        message: `Action blocked: ${key}`
                    });

                    if (key === 'PrintScreen') {
                        clipboard.clear();
                    }
                }
            });
        } catch (e) {
            console.error(`Error registering ${key}:`, e);
        }
    });
}

// --- IPC HANDLERS ---
ipcMain.on('window-control', (event, action) => {
    switch (action) {
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
            mainWindow.setSkipTaskbar(true); // Hide from taskbar to block swipe-up/Win+Tab
            mainWindow.setResizable(false);
            mainWindow.setClosable(false);
            // STICKY WINDOW: The window follows the user to any virtual desktop
            // This effectively "blocks" switching because they see the same exam everywhere.
            mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        } else {
            mainWindow.setKiosk(false);
            mainWindow.setAlwaysOnTop(false);
            mainWindow.setFullScreen(false);
            mainWindow.setSkipTaskbar(false);
            mainWindow.setResizable(true);
            mainWindow.setClosable(true);
            mainWindow.setVisibleOnAllWorkspaces(false);
        }
    }
});

ipcMain.handle('take-forced-screenshot', async (event, filename) => {
    try {
        const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
        const primary = sources[0];
        const screenshotPath = path.join(app.getPath('userData'), 'audit', filename);

        if (!fs.existsSync(path.dirname(screenshotPath))) {
            fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
        }

        fs.writeFileSync(screenshotPath, primary.thumbnail.toPNG());
        return { success: true, path: screenshotPath };
    } catch (e) {
        return { success: false, error: e.message };
    }
});

// AI Controller Bridge
const aiController = require('./controllers/aiController');
ipcMain.handle('ask-ai', async (event, prompt) => {
    return await aiController.generateAIResponse(prompt);
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
