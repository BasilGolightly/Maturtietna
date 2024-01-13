const path = require('path');
const { app, BrowserWindow } = require('electron');

//new window - MAIN
function createWindow1(){
    //window properties
    const mainWindow = new BrowserWindow({
        title: 'MMM E-mail client',
        width: 1280,
        height: 900,
        //minHeight: 500,
        //minWidth: 700,
        resizable: false,
    });

    //enable devtools and menubar if in development mode
    if(process.env.NODE_ENV !== "production"){
        mainWindow.menuBarVisible = true;
        //mainWindow.webContents.openDevTools();
    }
    //disable if not
    else{
        mainWindow.menuBarVisible = false;
        mainWindow.webContents.closeDevTools();
    }

    //pripni index.html v okno
    mainWindow.loadFile(path.join(__dirname, './html/index.html'));
}

app.whenReady().then(() => {
    createWindow1();
});