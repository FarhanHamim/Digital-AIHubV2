# Quick Start Guide

## ✅ Server is Running!

The development server should now be accessible at:
**http://localhost:5173**

## What Was Fixed

The issue was caused by the ampersand (`&`) in the directory name `Digital&AIHub_V2`. Windows was interpreting it as a command separator.

### Solution Applied:
1. Created `run-dev.js` wrapper script that properly handles paths with special characters
2. Updated `package.json` to use the wrapper script
3. Used `resolve()` for absolute paths and `shell: false` to avoid path interpretation issues

## Running the Server

Simply use:
```powershell
npm run dev
```

The server will start on `http://localhost:5173`

## Alternative Methods

If you still encounter issues, you can also use:

### Method 1: Direct Node execution
```powershell
node run-dev.js
```

### Method 2: Use the batch file
```powershell
.\dev.bat
```

### Method 3: Use PowerShell script
```powershell
.\dev.ps1
```

## Next Steps

1. **Open your browser** and go to `http://localhost:5173`
2. **Set up Firebase** (see `SETUP.md`)
3. **Create `.env` file** with your Firebase credentials
4. **Start adding content** through the admin dashboard

## Troubleshooting

If the server doesn't start:
1. Make sure port 5173 is not in use
2. Check that `node_modules` exists (run `npm install` if needed)
3. Try the alternative methods above

For more help, see `TROUBLESHOOTING.md`
