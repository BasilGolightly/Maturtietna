const path = require('path');
const fs = require('fs');
const { app, BrowserWindow } = require('electron');

//new window - MAIN
function createWindow1(){
    //window properties
    const mainWindow = new BrowserWindow({
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js')
        },
        title: 'M3 E-mail client',
        width: 1128,
        height: 768,
        minHeight: 600,
        minWidth: 750,
        resizable: true,
    });

    //enable devtools and menubar if in development mode
    if(process.env.NODE_ENV !== "production"){
        mainWindow.menuBarVisible = false;
    }

    //disable if not
    else{
        mainWindow.menuBarVisible = false;
        mainWindow.webContents.closeDevTools();
    }

    //pripni index.html v okno
    mainWindow.loadFile(path.join(__dirname, './login.html'));
}

app.allowRendererProcessReuse = false;

//app launch
app.whenReady().then(() => {
    createWindow1();
});