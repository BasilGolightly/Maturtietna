//const { count } = require('console');
const { clipboard, desktopCapturer } = require('electron');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const ApiKey = "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";

const { OpenAI } = require("openai");
//const openai = new OpenAI({ apiKey: ApiKey, dangerouslyAllowBrowser: true });

/*------------------------REQUIRE-----------------------*/

//connect to sql DB
/*
let db = new sqlite3.Database('./DB/data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    else {
        console.log('Connected to the local DB.');
    }
});
*/
/*
const databaseDir = __dirname + './DB/data.db';
const jsonDir = __dirname + "./DB/login.json";
*/
const databaseDir = __dirname + './data.db';
const jsonDir = __dirname + "./login.json";

let db = new sqlite3.Database(databaseDir, (err) => {
    if (err) {
        console.error(err.message);
    }
    else {
        console.log('Connected to the local DB.');
    }
});

//CREATE TABLES
async function setupDb() {
    try {
        await SqlRunPromise(`CREATE TABLE IF NOT EXISTS Users(
            id_user INTEGER PRIMARY KEY AUTOINCREMENT,
            username NVARCHAR(50) UNIQUE NOT NULL,
            password NVARCHAR(255) NOT NULL,
            lang NVARCHAR(50) NOT NULL CHECK(lang IN('en', 'sl')),
            firstTime INTEGER NOT NULL CHECK (firstTime IN('0', '1')),
            firstName NVARCHAR(50) NOT NULL,
            lastName NVARCHAR(50) NOT NULL,
            date_registered DATE,
            apiKey TEXT
        );`);
        await SqlRunPromise(`CREATE TABLE IF NOT EXISTS Contacts(
            id_contact INTEGER PRIMARY KEY AUTOINCREMENT,
            id_user INTEGER NOT NULL,
            name NVARCHAR(50) NOT NULL,
            surname NVARCHAR(50) NOT NULL,
            dob DATETIME NOT NULL,
            relation NVARCHAR(50) NOT NULL,
            bio TEXT,
            gender NVARCHAR(10) NOT NULL CHECK(gender IN('m', 'f')),
            date_created DATETIME,
            CONSTRAINT FK_CONTACTS_ID_USER FOREIGN KEY(id_user) REFERENCES Users(id_user)
        );`);
        await SqlRunPromise(`CREATE TABLE IF NOT EXISTS Mails(
            id_mail INTEGER PRIMARY KEY AUTOINCREMENT,
            id_contact INTEGER NOT NULL,
            id_user INTEGER NOT NULL,
            title NVARCHAR(50) NOT NULL,
            date_generated DATE NOT NULL,
            content TEXT NOT NULL,
            type NVARCHAR(50) NOT NULL,
            reason TEXT NOT NULL,
            formality NVARCHAR(25) NOT NULL CHECK(formality IN('Formal', 'Informal', 'informal', 'formal')),
            CONSTRAINT FK_MAILS_ID_CONTACT FOREIGN KEY(id_contact) REFERENCES Contacts(id_contact),
            CONSTRAINT FK_MAILS_ID_USER FOREIGN KEY(id_user) REFERENCES Users(id_user)
        );`);
    }
    catch (err) {
        console.log(err);
    }
    /*
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Users(
            id_user INTEGER PRIMARY KEY AUTOINCREMENT,
            username NVARCHAR(50) UNIQUE NOT NULL,
            password NVARCHAR(255) NOT NULL,
            lang NVARCHAR(50) NOT NULL CHECK(lang IN('en', 'sl')),
            firstTime INTEGER NOT NULL CHECK (firstTime IN('0', '1')),
            firstName NVARCHAR(50) NOT NULL,
            lastName NVARCHAR(50) NOT NULL,
            date_registered DATETIME,
            apiKey TEXT
        );`, (err) => {
            if (err) {
                console.error(err.message);
            }
            else {
                console.log("Users table created / already exists.");
            }
        })
        .run(`CREATE TABLE IF NOT EXISTS Contacts(
            id_contact INTEGER PRIMARY KEY AUTOINCREMENT,
            id_user INTEGER NOT NULL,
            name NVARCHAR(50) NOT NULL,
            surname NVARCHAR(50) NOT NULL,
            dob DATETIME NOT NULL,
            relation NVARCHAR(50) NOT NULL,
            bio TEXT,
            gender NVARCHAR(10) NOT NULL CHECK(gender IN('m', 'f')),
            date_created DATETIME,
            CONSTRAINT FK_CONTACTS_ID_USER FOREIGN KEY(id_user) REFERENCES Users(id_user)
        );`, (err) => {
            if (err) {
                console.error(err.message);
            }
            else {
                console.log("Contacts table created / already exists.");
            }
        })
        .run(`CREATE TABLE IF NOT EXISTS Mails(
            id_mail INTEGER PRIMARY KEY AUTOINCREMENT,
            id_contact INTEGER NOT NULL,
            id_user INTEGER NOT NULL,
            title NVARCHAR(50) NOT NULL,
            date_generated DATE NOT NULL,
            content TEXT NOT NULL,
            type NVARCHAR(50) NOT NULL,
            reason TEXT NOT NULL,
            formality NVARCHAR(25) NOT NULL CHECK(formality IN('Formal', 'Informal', 'informal', 'formal')),
            CONSTRAINT FK_MAILS_ID_CONTACT FOREIGN KEY(id_contact) REFERENCES Contacts(id_contact),
            CONSTRAINT FK_MAILS_ID_USER FOREIGN KEY(id_user) REFERENCES Users(id_user)
        );`, (err) => {
            if (err) {
                console.error(err.message);
            }
            else {
                console.log("Mails table created / already exists.");
            }
        })
    })
    */
}

/*-------------------------------------SQL FUNCTIONS-------------------------------------*/

//GET SINGLE ROW
function SqlGetPromise(query) {
    return new Promise((resolve, reject) => {

        db.get(query, (err, rows) => {
            //failed query
            if (err) {
                reject(err);
            }

            // "return" the result when the action finish
            resolve(rows);
        })
    })
}

//EXECUTE DML STATEMENT
function SqlRunPromise(query) {
    return new Promise((resolve, reject) => {

        db.run(query, (err) => {
            //failed DML
            if (err) {
                reject(err);
            }

            //"return" the inserted id when the action is finished
            resolve(this.lastId);
        })
    })
}

//SELECT MULTIPLE ROWS
function SqlEachPromise(query) {
    return new Promise((resolve, reject) => {
        let rows = new Array();
        db.each(query, (err, row) => {
            //failed query
            if (err) {
                reject(err);
            }
            else {
                rows.push(row);
            }
            // "return" the result when the action finish

        })
        resolve(rows);
    })
}

//SELECT ALL ROWS
function SqlAllPromise(query) {
    return new Promise((resolve, reject) => {

        db.all(query, (err, rows) => {
            //failed query
            if (err) {
                reject(err);
            }
            resolve(rows);
        })

    })
}

//EXECUTE INSERT INTO FOR NEW USER AND RETURN THE NEW ID IF SUCCESSFUL
function SqlRegisterPromise(query) {
    return new Promise((resolve, reject) => {

        db.run(query, function (err) {
            //failed DML
            if (err) {
                reject(err);
            }

            resolve(this.lastID);
        })
    })
}

function SqlRegisterPromise(query, arr) {
    return new Promise((resolve, reject) => {

        db.run(query, arr, function (err) {
            //failed DML
            if (err) {
                reject(err);
            }

            resolve(this.lastID);
        })
    })
}

//PREPARE 
/*
function SqlPreparePromise(query){
    return new Promise((resolve, reject) => {
        db.prepare(query, (err, result) => {

        }
    })
}
*/

/*-------------------------------------SQL FUNCTIONS-------------------------------------*/

/*-------------------------------------REGISTER-------------------------------------*/

function RegisterDisplayMode(mode) {
    let regWindow = document.getElementById('mainRegister');
    let apiWindow = document.getElementById('apiMain');

    //main register
    if (mode == 0) {
        apiWindow.style.display = "none";
        regWindow.style.display = "grid";
    }
    //api register
    else if (mode == 1) {
        regWindow.style.display = "none";
        apiWindow.style.display = "grid";
    }
}

//CHECK REGISTER FORM DATA
async function registerCheck() {
    //set error display to empty string
    let errorHTML = document.getElementById('error');
    errorHTML.innerHTML = "";
    let error = "";

    //get user input data
    let allgood = true;
    let username = document.getElementById('newUsername').value.trim();
    let password = document.getElementById('passwordtextBox1').value.trim();
    let firstName = document.getElementById('newFirstName').value.trim();
    let lastName = document.getElementById('newLastName').value.trim();
    //let repeatPass = document.getElementById('passwordtextBox2').value.trim();

    //username check
    if (username == "") {
        error = "Username cannot be empty.<br>";
        allgood = false;
    }
    else {
        for (let i = 0; i < username.length; i++) {
            if (username[i] === ' ') {
                error += "Username cannot contain spaces.<br>";
                allgood = false;
                break;
            }
        }
    }

    //pass check
    if (password == "") {
        error += "Password cannot be empty.<br>";
        allgood = false;
    }
    else {
        if (password.length < 12) {
            error += "Password has to be at least 12 characters long.<br>";
            allgood = false;
        }
        else {
            for (let i = 0; i < password.length; i++) {
                if (password[i] === ' ') {
                    error += "Password cannot contain spaces.<br>";
                    allgood = false;
                    break;
                }
            }
        }
    }

    //fullname check
    if (firstName == "" || lastName == "") {
        allgood = false;
    }

    //if all is in proper format, proceed with register, show API section
    if (allgood) {
        try {
            let query = `SELECT id_user
            FROM Users
            WHERE username = '${username}'`;
            const takenUsers = await SqlAllPromise(query);

            if (takenUsers.length == 0) {
                RegisterDisplayMode(1);
            }
            else {
                document.getElementById('error').innerHTML = "Username already taken.";
            }
        }
        catch (err) {
            console.log(err);
            document.getElementById('error').innerHTML = "Register could not be carried out.";
        }
    }
    //if not, output error
    else {
        document.getElementById('error').innerHTML = error;
    }
}

async function registerSkipApi() {
    let username = document.getElementById('newUsername').value.trim();
    let password = document.getElementById('passwordtextBox1').value.trim();
    let firstName = document.getElementById('newFirstName').value.trim();
    let lastName = document.getElementById('newLastName').value.trim();
    await register(username, password, firstName, lastName, "");
}

async function registerCheckApi() {
    let apiKey = document.getElementById('apiKeyRegister');
    let apiKeyText = apiKey.value.trim();
    let apiError = document.getElementById('apiError');

    apiError.innerHTML = "";

    if (apiKeyText != "") {
        let apiBtn = document.getElementById('registerApiBtn');
        apiBtn.innerHTML = "Checking key <img src='pictures/loading_icon_2.gif' id='apiBtnImg'>";

        try {
            const testKey = new OpenAI({ apiKey: apiKeyText, dangerouslyAllowBrowser: true });
            const testKeyResponse = await testKey.chat.completions.create({
                messages: [{ role: "system", content: "Test" }],
                model: "gpt-3.5-turbo"
            });

            if (testKeyResponse != null || testKeyResponse != undefined) {
                let username = document.getElementById('newUsername').value.trim();
                let password = document.getElementById('passwordtextBox1').value.trim();
                let firstName = document.getElementById('newFirstName').value.trim();
                let lastName = document.getElementById('newLastName').value.trim();
                await register(username, password, firstName, lastName, apiKeyText);
            }
        }
        catch (err) {
            console.log(err);
            apiError.innerHTML = "Your API key is invalid. Please double check it.";
        }
        finally {
            apiBtn.innerHTML = "Register";
        }
    }
    else {
        apiError.innerHTML = "Please enter the API key";
    }
}

//INSERT INTO USERS 
async function register(username, password, firstName, lastName, apiKey) {
    try {
        //insert into users table
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        let query = `INSERT INTO Users VALUES(null, ?, ?, 'en', '1', ?, ?, ?, ?)`
        const id = await SqlRegisterPromise(query, [`${username}`, `${password}`, `${firstName}`, `${lastName}`, `${year}-${month}-${day}`, `${apiKey}`]);
        console.log("New account ID: " + id);

        //write to intermediary JSON file
        const Writesuccess = await writeToLoginfile(username, "", id)
        //success - go straight to homepage
        if (Writesuccess) {
            window.location = "index.html";
        }
        //fail - you have to login manually to get data to JSON file
        else {
            window.location = "login.html";
        }
    }
    catch (error) {
        console.log(error);
        document.getElementById('error').innerHTML += "The register action could not be carried out. <br>";
    }
}

async function checkExistingAccounts() {
    await setupDb();

    try {
        const rows = await SqlAllPromise("SELECT id_user FROM Users");

        if (rows.length >= 5) {
            window.location = "login.html";
        }
    }
    catch (error) {
        console.log(error);
    }
}

/*-------------------------------------REGISTER-------------------------------------*/

/*-------------------------------------LOGIN-------------------------------------*/

//CHECK IF LOGIN PASSWORD IS CORRECT
function loginCheck() {
    let password = document.getElementById('passwordTextField').value.trim();
    let username = document.getElementById('loginName').innerHTML.trim();

    if (password != "" && username != "") {
        login(username, password);
    }
    else {
        document.getElementById('errorLogin').innerHTML = "Password cannot be empty";
    }
}

//LOGIN - WRITE TO JSON AND REDIRECT
async function login(username, password) {
    try {
        const row = await SqlGetPromise(`SELECT id_user, username, password FROM Users WHERE username = '${username}' AND password = '${password}'`);

        //password correct
        if (row != null) {
            //write to JSON intermediate file
            const WriteLoginSuccess = await writeToLoginfile(username, "", row.id_user);

            //JSON WRITE SUCCESS - go to index.html
            if (WriteLoginSuccess) {
                window.location = "index.html";
            }

            //JSON WRITE FAIL - show error
            else {
                document.getElementById('errorLogin').innerHTML = "Login action could not be carried out <br>";
            }
        }

        //password invalid
        else {
            document.getElementById('errorLogin').innerHTML = "Invalid password / credentials. <br>";
        }
    }
    //query error
    catch (error) {
        document.getElementById('errorLogin').innerHTML = "Login action could not be carried out <br>";
        console.log(error);
    }

}

//DISPLAY EXISTING ACCOUNTS
async function loginDisplayAccounts() {
    await setupDb();

    //attempt query
    try {
        const rows = await SqlAllPromise(`SELECT id_user, username FROM Users`);

        //found accounts
        if (rows.length > 0) {

            //IF THERE ALREADY ARE MORE THAN 5 ACCOUNTS - HIDE REGISTER LINK
            if (rows.length >= 5) {
                document.getElementById('registerLink').innerHTML = "";
            }

            //DISPLAY ACCOUNTS
            for (let i = 0; i < rows.length; i++) {
                document.getElementById('accountsList').innerHTML += `

                <div class="accountWrap" onclick="loginDisplay(1, ${rows[i].id_user});">
                    <div class="accountInner">
                        <div class="accountName" id="accountName${rows[i].id_user}">
                            ${rows[i].username.trim()}
                        </div>
                        <div class="accountArrowWrap">
                            <button class="accountArrow" onclick="loginDisplay(1, ${rows[i].id_user});">
                                <img src="pictures/arrow_circle_icon.png" class="arrowIcon">
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }
        }

        //no accounts found
        else {
            window.location = "register.html";
        }
    }

    //failed query
    catch (error) {
        window.location = "register.html";
    }
}

/*-------------------------------------LOGIN-------------------------------------*/

/*-------------------------------------JSON-------------------------------------*/

//WRITE TO TEMPORARY JSON FILE
function writeToLoginfile(username, pass, id) {

    const obj = {
        UserName: username,
        Pass: pass,
        Id: id
    };

    return new Promise((resolve, reject) => {

        /*
        fs.writeFile('DB/login.json', JSON.stringify(obj), (err) => {
            if (err) {
                reject(false);
            }

            resolve(true);
        })
        */
        fs.writeFile(jsonDir, JSON.stringify(obj), (err) => {
            if (err) {
                reject(false);
            }

            resolve(true);
        })
    })
}

//READ FROM FILE
function readLoginFile() {
    return new Promise((resolve, reject) => {
        /*
        fs.readFile('DB/login.json', (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                let obj;
                obj = JSON.parse(data);
                resolve(obj);
            }
        })
        */
        fs.readFile(jsonDir, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                let obj;
                obj = JSON.parse(data);
                resolve(obj);
            }
        })
    })
}

/*-------------------------------------JSON-------------------------------------*/

/*-------------------------------------HOMEPAGE-------------------------------------*/

let displayModeId = 0;
let selectedMailId = 0;
let isFullScreen = true;

//let isAddConact = false;

async function displayMode(mode) {
    selectedMailId = 0;
    contactHiddenId = 0;
    let idUser = document.getElementById('globalIdUser').innerHTML.trim();

    let navItems = document.getElementsByClassName('listItem');
    let Windowframes = document.getElementsByClassName('windowFrame');

    let newMailFrame = document.getElementById('newMailFrame');
    let generatedFrame = document.getElementById('generatedFrame');
    let contactsFrame = document.getElementById('contactsFrame');
    let settingsFrame = document.getElementById('settingsFrame');
    let searchFrame = document.getElementById('searchFrame');
    let homeFrame = document.getElementById('homeFrame');
    let backgroundNavColor = "rgb(35, 35, 35)";

    //reset navbar, such that no list item is glowing
    for (let i = 0; i < navItems.length; i++) {
        navItems[i].style.backgroundColor = "transparent";
    }

    //hide all frames
    for (let i = 0; i < Windowframes.length; i++) {
        Windowframes[i].style.display = "none";
    }

    //hide new mail window if it is in fullscreen mode
    if (isFullScreen && newMailFrame.style.display != 'none') {
        newMailFrame.style.display = 'none';
    }

    //quick fix: not able to focus on elements sometimes
    document.activeElement.blur();

    //check which panel to show
    switch (mode) {
        //new email
        case 0:
            let contactsString = ``;
            await loadContacts();
            fullScreenNewMails();
            break;
        //generated
        case 1:
            //alert('1');
            displayModeId = 1;
            generatedFrame.style.display = "flex";
            document.getElementById('generatedTitleText').innerHTML = "Generated mails <span class='generatedTitleCount' id='generatedTitleCount'></span>";
            let generatedMails = document.getElementsByClassName('generatedLetter');
            document.getElementById('generatedTitleCount').innerHTML = "(" + generatedMails.length + ")";

            document.getElementById('generatedMailWrap').innerHTML = `<!--no mail selected-->
            <div class="noMailSelectedWrap">
                <div class="noMailSelectedInner">
                    <div>
                        <img src="pictures/generated_mail_icon_empty.png" class="noMailSelectedImg">
                    </div>
                    <div>No mail selected</div>
                </div>
            </div>
            <!--no mail selected-->`;

            let mails = document.getElementsByClassName('generatedLetter');
            for (let i = 0; i < mails.length; i++) {
                mails[i].style.borderLeft = "3px solid gray";
            }

            loadMails();

            document.getElementById('generatedWrap').style.display = "flex";

            document.getElementById('generatedNavItem').style.backgroundColor = backgroundNavColor;
            break;
        //contacts
        case 2:
            //alert('2');
            displayModeId = 2;

            contactsFrame.style.display = "flex";

            await loadContacts();

            let contacts = document.getElementsByClassName('contactFrame');
            document.getElementById('countContacts').innerHTML = contacts.length;
            document.getElementById('contactImg').src = "pictures/white_pfp.png";
            document.getElementById('contactsNavItem').style.backgroundColor = backgroundNavColor;
            document.getElementById('contactsHeadTitleText').innerHTML = "Contacts";
            //document.getElementById('selectedContact').style.display = 'none';
            document.getElementById('addContact').style.display = 'none';
            document.getElementById('contactList').style.display = 'flex';

            //hide copy and delete buttons
            document.getElementById('TopDeleteBtn').style.display = "none";
            document.getElementById('TopCopyBtn').style.display = "none";
            document.getElementById('TopMailBtn').style.display = "none";

            break;
        //settings
        case 3:
            //alert('3');
            displayModeId = 3;

            settingsFrame.style.display = "flex";

            //searchBarDisplayMode(0);

            //document.getElementById('settingsNavItem').style.backgroundColor = backgroundNavColor;
            break;
        //search Results 
        case 4:
            searchFrame.style.display = "flex";

            break;
        //home 
        case 5:
            displayModeId = 5;

            homeFrame.style.display = "flex";

            document.getElementById('homeNavItem').style.backgroundColor = backgroundNavColor;

            break;
    }
}

function fullScreenNewMails() {
    let screenBtn = document.getElementById('fullscreenBtn');
    let newMailFrame = document.getElementById('newMailFrame');
    let newMailHead = document.getElementById('newMailHead');
    let newMailChapters = document.getElementsByClassName('newMailCh');
    //minimize
    if (isFullScreen) {
        screenBtn.style.backgroundImage = "url('pictures/full_icon.png')";
        newMailFrame.style.cssText = `
        display: flex;
        float: right;
        position: absolute;
        bottom: 4vh;
        right: 0px;
        width: 20vw;
        height: auto;
        flex-direction: column;
        font-family: 'Kanit', sans-serif;;
        background-color: rgb(15, 15, 15);
        border-radius: 15px;
        border: 1px solid white;
        `;
        newMailHead.style.padding = '15px 1vw 0 15px';
        for (let i = 0; i < newMailChapters.length; i++) {
            newMailChapters[i].style.fontSize = '16px';
        }
        newMailFrame.style.display = 'flex';

        isFullScreen = false;

        if (displayModeId != 0) {
            displayMode(displayModeId);
        }
    }
    //fullscreen
    else {
        screenBtn.style.backgroundImage = "url('pictures/minimize_icon.png')";
        newMailFrame.style.cssText = `
        display: flex;
        float: none;
        position: static;
        bottom: 0;
        right: 0;
        width: 100%;
        height: auto;
        flex-direction: column;
        font-family: 'Kanit', sans-serif;;
        background-color: transparent;
        border-radius: 15px;
        border: none;
        `;
        newMailHead.style.padding = '0 15px 15px 0';
        let Windowframes = document.getElementsByClassName('windowFrame');

        for (let i = 0; i < newMailChapters.length; i++) {
            newMailChapters[i].style.fontSize = '18px';
        }

        //hide all frames
        for (let i = 0; i < Windowframes.length; i++) {
            Windowframes[i].style.display = "none";
        }
        newMailFrame.style.display = 'flex';

        isFullScreen = true;
    }

    /*
    if(isAddConact && !isFullScreen){
        if(!isFullScreen){
            displayModeAddContacts(contactHiddenId);
        }
        
        isAddConact = false;
    }*/
}

function exitNewMails() {
    document.getElementById('newMailFrame').style.display = 'none';

    isFullScreen = true;

    if (displayModeId === 0) displayMode(5);
    else displayMode(displayModeId);
}

/*--------------------------SEARCH BAR--------------------------*/

//controls searchbar display, and button placement on the navbar, depending on the display mode (func. displayMode()) 
function searchBarCheckInput() {
    let searchBarDiv = document.getElementById('searchBarWrap');
    let searchBar = document.getElementById('searchTopTextBox');
    let searchBtn = document.getElementById('searchTopBtn');
    let navBtns = document.getElementsByClassName('rightTopBtn');

    //get search text
    let searchString = searchBar.value.trim();

    if (searchString.length > 0) {
        document.getElementById('clearBtnDiv').style.display = 'flex';
    }
    else {
        document.getElementById('clearBtnDiv').style.display = 'none';
    }
}

function searchBarClear() {
    let searchBar = document.getElementById('searchTopTextBox');
    let navBtns = document.getElementsByClassName('rightTopBtn');
    searchBar.value = "";
    document.getElementById('clearBtnDiv').style.display = 'none';
    displayMode(displayModeId);
    searchBar.focus();

    for (let i = 0; i < navBtns.length; i++) {
        navBtns[i].style.display = "none";
    }
}

async function searchBarDelete() {
    //delete mail
    if (selectedMailId > 0) {
        let query = `DELETE FROM Mails
        WHERE id_mail = ?`;
        try {
            const deleteMailresult = await SqlRegisterPromise(query, [`${selectedMailId}`]);
            await loadMails();
            displayMode(1);
        }
        catch (err) {
            alert("Mail failed to delete");
            console.log(err);
        }
    }
    //delete contact
    else if (contactHiddenId > 0) {
        let query = `DELETE FROM Contacts
        WHERE id_contact = ?`;
        try {
            const deleteContactResult = await SqlRegisterPromise(query, [`${contactHiddenId}`]);
            await loadContacts();
            displayMode(2);
        }
        catch (err) {
            alert("Contact could not be deleted");
            console.log(err);
        }
    }
}

async function searchBarCopy() {
    //copy mail
    if (selectedMailId > 0) {
        let mailContent = document.getElementById('selectedMailMiddle').innerHTML.trim();
        await navigator.clipboard.writeText(mailContent);
        alert("Mail copied");
    }
    //copy contact
    else if (contactHiddenId > 0) {
        let contactQuery = `SELECT name, surname, gender, relation FROM Contacts WHERE id_contact = '${contactHiddenId}'`;
        try {
            const contactResult = await SqlGetPromise(contactQuery);
            if (contactResult != null) {
                let fullName = `${contactResult.name} ${contactResult.surname}`;
                let relation = `${contactResult.relation}`;
                let gender = `male`;
                if (contactResult.gender == 'f') gender = `female`;
                let copyText = `${fullName}, ${gender}, ${relation}`;
                await navigator.clipboard.writeText(copyText);
                alert("Contact copied: " + copyText);
            }
            else alert("Contact could not be copied");
        }
        catch (err) {
            console.log(err);
            alert("Contact could not be copied");
        }
    }
}

function searchBarMore() {

}

//show results of search - found contact names, mails
async function searchBarSubmit() {
    let searchBar = document.getElementById('searchTopTextBox');
    let searchString = searchBar.value.trim();
    searchBar.value = searchString;
    let mailResultCountItem = document.getElementById('mailResultsCount');
    let contactResultCountItem = document.getElementById('contactsResultCount');
    let totalCountItem = document.getElementById('totalCountOutput');
    let mailResultCount = 0, contactResultCount = 0, totalCount = 0;

    if (searchString.length > 0) {
        //alert(searchString);

        document.getElementById('searchMailResultsWrap').innerHTML = '';
        document.getElementById('searchContactsResultWrap').innerHTML = '';

        //get mails
        try {
            let MailsSearchQuery = `SELECT id_mail, m.id_contact, m.id_user, title, date_generated, content, name, surname, type
            FROM Mails m JOIN Contacts c
                ON m.id_contact = c.id_contact
            WHERE title LIKE '%${searchString}%' OR type LIKE '%${searchString}%'`;
            //MailsSearchQuery = db.prepare(MailsSearchQuery);

            const MailsRows = await SqlAllPromise(MailsSearchQuery);

            if (MailsRows != null) {
                mailResultCount = MailsRows.length;
                totalCount += mailResultCount;

                document.getElementById('searchMailResultsWrap').innerHTML = "";

                //display found mails
                for (let i = 0; i < MailsRows.length; i++) {
                    const tempDate = new Date();
                    let day = tempDate.getDate();
                    let month = tempDate.getMonth() + 1;
                    let year = tempDate.getFullYear();

                    document.getElementById('searchMailResultsWrap').innerHTML += `
                        <!--Mail result-->
                            <div class="searchMailResultFrame" onclick="displayModeGenerated(${MailsRows[i].id_mail})" onmouseover="hoverMailResult()" onmouseout="exitMailResult()">
                                <div class="searchMailResultInner">
                                    <div class="mailResultLeft">
                                        <div class="mailResultTop">
                                            <div class="mailResultTitle">
                                                ${MailsRows[i].title}
                                            </div>
                                        </div>
                                        <div class="mailResultBottom" onclick="displayModeAddContacts(${MailsRows[i].id_contact})">
                                            <div>
                                                to <a href="#" class="resultContactLink">${MailsRows[i].name} ${MailsRows[i].surname}</a>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mailResultRight">
                                        <div class="mailResultExtra">
                                            <div class="mailResultDate">
                                                ${day}. ${month}. ${year}
                                            </div>
                                            <div>
                                                ${MailsRows[i].type}
                                            </div>
                                        </div>
                                        <div class="mailResultArrow">
                                            <img src="pictures/generated_mail_icon_neutral.png" id="mailResultIcon" class="mailResultIcon">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <!--Mail result-->
                    `;
                }
            }

        }
        catch (error) {
            console.log(error);
        }

        //get contacts
        try {
            let ContactsSearchQuery = `SELECT id_contact, id_user, name, surname, dob, relation, bio, name + ' ' + surname AS full_name, gender
            FROM Contacts
            WHERE name LIKE '%${searchString}%' OR surname LIKE '%${searchString}%' 
            OR full_name LIKE '%${searchString}%' OR relation LIKE '%${searchString}%'`;
            //ContactsSearchQuery = db.prepare(ContactsSearchQuery);
            const Contactrows = await SqlAllPromise(ContactsSearchQuery);

            if (Contactrows != null) {
                contactResultCount = Contactrows.length;
                totalCount += contactResultCount;

                document.getElementById('searchContactsResultWrap').innerHTML = "";

                //console.log(Contactrows);
                //display found contacts
                for (let i = 0; i < Contactrows.length; i++) {
                    let gender = "Male";
                    if (Contactrows[i].gender == 'f' || Contactrows[i].gender == 'F') gender = "Female";

                    document.getElementById('searchContactsResultWrap').innerHTML += `
                        <!--Contact result-->
                            <div class="searchContactResultFrame" onclick="displayModeAddContacts(${Contactrows[i].id_contact})">
                                <div class="searchContactResultFrameInner">
                                    <div class="contactResultLeft">
                                        <div class="contactResultTop">
                                            <div class="contactResulTitle">
                                                ${Contactrows[i].name} ${Contactrows[i].surname}
                                            </div>
                                        </div>
                                        <div class="contactResultBottom">
                                            <div>
                                                ${Contactrows[i].relation}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="contactResultRight">
                                        <div class="contactResultExtra">
                                            ${gender}
                                        </div>
                                        <div class="contactResultArrow">
                                            <img src="pictures/white_pfp.png" class="contactResultIcon" id="contactResultIcon">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <!--Contact result-->
                    `;
                }
            }
        }
        catch (error2) {
            console.log(error2);
        }


        document.getElementById('searchStringOutput').innerHTML = searchString;

        totalCountItem.innerHTML = totalCount;
        mailResultCountItem.innerHTML = `(${mailResultCount})`;
        contactResultCountItem.innerHTML = `(${contactResultCount})`;

        displayMode(4);
    }

}

/*--------------------------SEARCH BAR--------------------------*/

//load ALL mails
async function loadMails() {
    //get logged in user's ID from hidden <span> element
    let idUser = document.getElementById('globalIdUser').innerHTML;

    try {
        let query = `SELECT id_mail, id_contact, id_user, title, date_generated, content 
        FROM Mails
        WHERE id_user = '${idUser}'
        `;
        const rows = await SqlAllPromise(query);

        //successfull query
        if (rows != null) {
            if (rows.length == 0) {
                document.getElementById('generatedWrap').innerHTML = `
                <div class="generatedLetterEmpty" id="generatedLetterEmpty">
                    <div class="generatedLetterEmptyInner">
                        No mails found.
                    </div>
                </div>
                `;
            }
            else {
                document.getElementById('generatedWrap').innerHTML = "";

                //loop through all rows and write mails to list
                for (let i = 0; i < rows.length; i++) {

                    let content = rows[i].content;
                    let quick_content = content.substring(0, 30) + '...';

                    let dateArr = (rows[i].date_generated).split('-');
                    let dateYear = dateArr[0];
                    let dateMonth = dateArr[1];
                    let dateDay = dateArr[2];
                    let formattedDate = `${dateDay}.${dateMonth}.${dateYear}`;

                    document.getElementById('generatedWrap').innerHTML += `

                    <div class="generatedLetter" onclick="displayModeGenerated(${rows[i].id_mail})" id="generatedLetter${rows[i].id_mail}">
                        <div class="generatedLetterInner">
                            <div class="generatedLetterTitle" id="titleMail${rows[i].id_mail}">
                                ${rows[i].title}
                            </div>
                            <div class="generatedLetterDate" id="dateMail${rows[i].id_mail}">
                                ${formattedDate}
                            </div>
                        </div>

                        <!--quick peek content-->
                        <div class="generatedLetterContent">
                            ${quick_content}
                        </div>
                        <!--quick peek content-->
                    </div>

                    `;
                }
            }
        }
        //unsuccessfull query
        else {
            alert("Mails could not be loaded");
        }
    }
    //unsuccessfull query
    catch (error) {
        console.log(error);
        alert("Mails could not be loaded");
    }
}

//load ALL contacts into contact list
async function loadContacts() {
    //get logged in user's ID from hidden <span> element
    let idUser = document.getElementById('globalIdUser').innerHTML;

    //SUCCESSFULL QUERY
    try {
        let query = `SELECT id_contact, id_user, name, surname, dob, relation, bio
        FROM Contacts
        WHERE id_user = '${idUser}'
        ORDER BY id_contact DESC
        `;
        const rows = await SqlAllPromise(query);

        //SUCCESSFULL QUERY  
        if (rows != null) {

            //display contact count
            document.getElementById('contactList').innerHTML = `
            <!--contact count-->
                <div class="contactsListHead">
                    <div class="contactsListHeadCount">
                        <span id="countContacts">${rows.length}</span> contact(s)
                    </div>  
                    <div class="contactsListHeadAdd">
                        <button class="contactsListHeadBtnAdd" onclick="displayModeAddContacts(-1)"><img src="pictures/white_pfp_hover.png" class="contactsAddBtnImg"> <span class="contactAddBtnText"></span></button>
                    </div>
                </div>
            <!--contact count-->
            `;

            //if no were contacts found, show 'no contacts found' section
            if (rows.length <= 0) {
                document.getElementById('contactList').innerHTML += `
                <!--no contacts found-->
                <div class="contactListEmpty">
                    <div class="contactListEmptyImgWrap">
                        <img src="pictures/contacts_icon_empty.png" class="contactListEmptyImg">
                    </div>
                    <div class="contactListEmptyText">
                        No contacts found.
                    </div>
                </div>
                <!--no contacts found-->
                `;
            }

            //if contacts were found, display them
            else {
                let tempVal = document.getElementById('newRecipentDropDown').value;
                //loop through contacts and display them
                for (let i = 0; i < rows.length; i++) {


                    if (i == 0) {
                        document.getElementById('newRecipentDropDown').innerHTML = `<option value="0">Select recipient</option>`;
                    }
                    //display contact
                    document.getElementById('contactList').innerHTML += `

                        <!--contact-->
                        <div class="contactFrame">
                            <div class="contactName" id="contact${rows[i].id_contact}" onclick="displayModeAddContacts('${rows[i].id_contact}')">
                                ${rows[i].name} ${rows[i].surname}
                            </div>
                            <div class="contactArrow">
                                <div class="contactArrowLeft">
                                    <button class="contactMenuMailBtn" onclick="mailContact(${rows[i].id_contact})"></button>
                                </div>
                                <div class="contactArrowRight" onclick="displayModeAddContacts(${rows[i].id_contact})">
                                >
                                </div>
                            </div>
                        </div>
                        <!--contact-->

                    `;

                    document.getElementById('newRecipentDropDown').innerHTML += `
                        <option value="${rows[i].id_contact}">${rows[i].name} ${rows[i].surname}</option>
                    `;

                    document.getElementById('newRecipentDropDown').value = tempVal;
                }
            }
        }

        //UNSUCCESSFULL QUERY
        else {
            alert("Contact list could not be loaded");
        }
    }

    //UNSUCCESSFULL QUERY
    catch (error) {
        console.log(error);
        alert("Contact list could not be loaded");
    }
}

async function mailContact(contactId) {
    await displayMode(0);
    document.getElementById('newRecipentDropDown').value = contactId;
}

async function mailSelectedContact() {
    await displayMode(0);
    document.getElementById('newRecipentDropDown').value = contactHiddenId;
}

async function homeLoadMails() {
    let dateDropDown = document.getElementById('homeMailDateSelect');
    let typeDropDown = document.getElementById('homeMailTypeSelect');

    try {
        let idUser = document.getElementById('globalIdUser').innerHTML;
        let daysAgo = dateDropDown.value;
        let type = typeDropDown.value;

        let date = new Date();
        /*
        let dToday = date.getDate(), mToday = date.getMonth() + 1, yToday = date.getFullYear();
        */

        /*
        if(dToday < 10) dToday = '0' + dToday;
        if(mToday < 10) mToday = '0' + mToday;
        if(yToday < 10) yToday = '0' + yToday;
        */

        date.setDate(date.getDate() - daysAgo);

        let d = date.getDate(), m = date.getMonth() + 1, y = date.getFullYear();

        /*
        if(d < 10) d = '0' + d;
        if(m < 10) m = '0' + m;
        if(y < 10) y = '0' + y;
        */

        let query = `SELECT id_mail, m.id_contact, m.id_user, title, date_generated, type, formality, name, surname
        FROM Mails m JOIN Contacts c
            ON m.id_contact = c.id_contact
        WHERE m.id_user = '${idUser}'
        AND date_generated >= '${y}-${m}-${d}'`;

        if (type != '0') {
            query += `AND type='${type}'`;
        }

        query += `
        ORDER BY date_generated DESC
        `;

        let outputHTML = document.getElementById('recentMailsOutput');
        outputHTML.innerHTML = "";

        const returnedMails = await SqlAllPromise(query);

        if (returnedMails.length > 0) {
            for (let i = 0; i < returnedMails.length; i++) {
                let tempDate = (returnedMails[i].date_generated).split("-");

                outputHTML.innerHTML += `
                <!--Mail frame-->
                <div class="homeMailFrame" onmouseover="hoverHomeMail()" onmouseout="exitHomeMail()">
                    <div class="homeMailInner">
                        <div class="homeMailLeft">
                            <div class="homeMailTitle" onclick="displayModeGenerated(${returnedMails[i].id_mail})">
                                ${returnedMails[i].title}
                            </div>
                            <div class="homeMailRecipient">
                                to <a href="#" onclick="displayModeAddContacts(${returnedMails[i].id_contact})" class="homeMailLink">${returnedMails[i].name} ${returnedMails[i].surname}</a>
                            </div>
                        </div>
                        <div class="homeMailRight" onclick="displayModeGenerated(${returnedMails[i].id_mail})">
                            <div class="homeMailExtra">
                                <div class="homeMailDate">
                                    ${tempDate[2]}. ${tempDate[1]}. ${tempDate[0]}
                                </div>
                                <div class="homeMailApology">
                                    ${returnedMails[i].type} - ${returnedMails[i].formality}
                                </div>
                            </div>
                            <div class="homeMailIcons">
                                <div class="homeMailIconWrap">
                                    <div>
                                        <img src="pictures/generated_mail_icon_neutral.png" id="homeMailImg">
                                    </div>
                                </div>
                                <div class="homeMailArrow" onclick="displayModeGenerated(${returnedMails[i].id_mail})">
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!--Mail frame-->    
                `;
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

//load all of user's info by reading ID from JSON and querying for data
async function loadUserProfile() {
    try {
        const obj = await readLoginFile();

        //successful read
        if (obj.Id != "" && obj.UserName != "") {
            //alert("success");
            document.getElementById('navAccName').innerHTML = obj.UserName.trim();
            document.getElementById('globalIdUser').innerHTML = obj.Id;


            //fill account settings - username and password field
            document.getElementById('accSettingsUsernameTextField').value = obj.UserName;

            try {
                let query = `SELECT password, firstName, lastName, apiKey  
                FROM Users
                WHERE id_user = '${obj.Id}'`;
                const row = await SqlGetPromise(query);

                //successful query for password
                if (row != null) {
                    document.getElementById('accSettingsPasswordTextField').value = row.password;
                    document.getElementById('globalFirstName').innerHTML = row.firstName;
                    document.getElementById('globalLastName').innerHTML = row.lastName;
                    document.getElementById('changeFirstNameField').value = row.firstName;
                    document.getElementById('changeLastNameField').value = row.lastName;
                    document.getElementById('apiKeyTextField').value = row.apiKey;
                }
            }
            catch (error) {
                console.log(error);
            }

            await loadContacts();
            await loadMails();
            /*
            document.getElementById('homeMailDateSelect').value = '7';
            document.getElementById('homeMailTypeSelect').value = '0';
            await homeLoadMails();
            */

            //at the end, delete contents of JSON, to avoid unintended access to user info
            //try{
            ///const deleteJSONsuccess = await writeToLoginfile("", "", "");

            //delete could not be carried out
            ///if(!deleteJSONsuccess){
            ///window.location = "login.html";
            ///}
            ///}
            //if data delete could not go through, go back to login
            ///catch(error){
            ///console.log("JSON Delete error: " + error);
            ///}
        }
        //unsuccessful read
        else {
            window.location = "login.html";
        }
    }
    catch (error) {
        alert(error);
        window.location = "login.html";
    }
}

let changePassStage = 0;
let oldPass = "";

//change password
async function changePassClick() {
    if (changePassStage == 0) {
        EnterPass();
    }
    else if (changePassStage == 1) {
        EditPass();
    }
    else if (changePassStage == 2) {
        await submitPass();
    }
}

function resetPassword() {
    let password = document.getElementById('accSettingsPasswordTextField');
    let btn = document.getElementById('changePassBtn');
    let cancelBtn = document.getElementById('changePassBtnCancel');

    changePassStage = 0;
    btn.innerHTML = "Edit";
    password.value = oldPass;
    password.disabled = true;
    cancelBtn.style.display = "none";
    document.getElementById('deleteAccBtn').innerHTML = "Delete account";
    document.getElementById('deleteAccBtn').disabled = false;
    deleteInProgress = false;
}

function EnterPass() {
    let password = document.getElementById('accSettingsPasswordTextField');
    let btn = document.getElementById('changePassBtn');
    let cancelBtn = document.getElementById('changePassBtnCancel');

    oldPass = password.value.trim();

    btn.innerHTML = "Enter";
    password.disabled = false;
    password.value = "";
    password.placeholder = "enter password...";
    cancelBtn.style.display = "inline-block";
    password.focus();

    changePassStage++;
}

function EditPass() {
    let password = document.getElementById('accSettingsPasswordTextField');
    let btn = document.getElementById('changePassBtn');

    if (password.value.trim() == oldPass) {
        if (deleteInProgress) {
            deleteStage++;
            deleteAcc();
        }
        else {
            btn.innerHTML = "Save";
            password.placeholder = "min. 12 char, no spaces";
            password.value = "";

            changePassStage++;

            password.focus();
        }

    }
    else {
        password.focus();
    }
}

async function submitPass() {
    let password = document.getElementById('accSettingsPasswordTextField');

    if (password.value.trim() != "") {
        if ((password.value.trim()).length >= 12 && !(password.value.trim()).includes(" ")) {
            try {
                let userId = document.getElementById('globalIdUser').innerHTML;

                let query = `UPDATE Users
                SET password = ?
                WHERE id_user = ?`;

                const updatedId = await SqlRegisterPromise(query, [`${password.value.trim()}`, `${userId}`]);

                oldPass = password.value.trim();

                resetPassword();
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            password.focus();
        }
    }
    else {
        password.focus();
    }
}

let changeUserNameStage = 0;
let oldUsername = "";

//change username
async function changeUsernameClick() {
    if (changeUserNameStage == 0) {
        EditUsername();
    }
    else if (changeUserNameStage == 1) {
        await changeUsername();
    }
}

function EditUsername() {
    let userNameText = document.getElementById('accSettingsUsernameTextField');
    let btn = document.getElementById('changeUsernameBtn');
    let btn2 = document.getElementById('changeUsernameCancelBtn');

    userNameText.disabled = false;
    userNameText.placeholder = "enter username";
    btn.innerHTML = "Save";
    btn2.style.display = "inline-block";

    changeUserNameStage++;
    oldUsername = userNameText.value.trim();

    userNameText.focus();
}

function ResetUsername() {
    let userNameText = document.getElementById('accSettingsUsernameTextField');
    let btn = document.getElementById('changeUsernameBtn');
    let btn2 = document.getElementById('changeUsernameCancelBtn');

    userNameText.disabled = true;
    btn.innerHTML = "Edit";
    btn2.style.display = "none";

    changeUserNameStage = 0;

    userNameText.value = oldUsername;
    oldUsername = "";

    //userNameText.blur();
}

async function changeUsername() {
    let userNameText = document.getElementById('accSettingsUsernameTextField');
    let btn = document.getElementById('changeUsernameBtn');

    userNameText.disabled = true;

    if (userNameText.value.trim() != "") {
        try {
            const existingUsernames = await SqlAllPromise(`SELECT id_user FROM Users WHERE Username = '${userNameText.value.trim()}'`);

            if (existingUsernames.length < 1) {
                try {
                    let userId = document.getElementById('globalIdUser').innerHTML;
                    let query = `UPDATE users
                    SET username = ?
                    WHERE id_user = ?`;
                    const insertedId = await SqlRegisterPromise(query, [`${userNameText.value.trim()}`, `${userId}`]);

                    oldUsername = userNameText.value.trim();

                    ResetUsername();
                }
                catch (err2) {
                    console.log(err2);
                    ResetUsername();
                }
            }
            else {
                alert("Username taken");
                userNameText.disabled = false;
                userNameText.focus();
            }
        }
        catch (err) {
            console.log(err);
            ResetUsername();
        }
    }
    else {
        userNameText.disabled = false;
        userNameText.focus();
    }
}

let nameStage = 0;

async function EditNameClick() {
    if (nameStage == 0) {
        EditFullName();
        nameStage++;
    }
    else if (nameStage == 1) {
        await UpdateFullName();
    }
}

function EditFullName() {
    let btn = document.getElementById('changeAccFullNameBtn');
    let cancelBtn = document.getElementById('changeAccFullNameCancelBtn');
    let firstName = document.getElementById('changeFirstNameField');
    let lastName = document.getElementById('changeLastNameField');
    cancelBtn.style.display = "inline-block";
    btn.innerHTML = "Save";
    firstName.disabled = false;
    lastName.disabled = false;
    firstName.focus();
}

function ResetName() {
    let btn = document.getElementById('changeAccFullNameBtn');
    let cancelBtn = document.getElementById('changeAccFullNameCancelBtn');
    let firstName = document.getElementById('changeFirstNameField');
    let lastName = document.getElementById('changeLastNameField');

    cancelBtn.style.display = "none";
    btn.innerHTML = "Edit";
    firstName.disabled = true;
    lastName.disabled = true;
    nameStage = 0;
    firstName.blur();
    lastName.blur();
}

async function UpdateFullName() {
    let firstName = document.getElementById('changeFirstNameField');
    let lastName = document.getElementById('changeLastNameField');

    if (firstName.value.trim() != "" || lastName.value.trim() != "") {
        let userId = document.getElementById('globalIdUser').innerHTML;
        try {
            let query = `UPDATE Users
            SET firstName = ?, lastName = ?
            WHERE id_user = ?`;

            const updatedId = await SqlRegisterPromise(query, [`${firstName.value.trim()}`, `${lastName.value.trim()}`, `${userId}`]);

            firstName.value = firstName.value.trim();
            lastName.value = lastName.value.trim();

            firstName.disabled = true;
            lastName.disabled = true;

            ResetName();
        }
        catch (err) {
            console.log(err);
            ResetName();
        }
    }
    else {
        firstName.focus();
    }
}

let apiKeyStage = 0;
let oldApiKey = "";

async function changeAPIClick() {
    if (apiKeyStage == 0) {
        EditAPIKey();
        apiKeyStage++;
    }
    else if (apiKeyStage == 1) {
        await ChangeAPIKey();
    }
}

function EditAPIKey() {
    let apiKey = document.getElementById('apiKeyTextField');
    let btn = document.getElementById('apiKeyChangeBtn');
    let btn2 = document.getElementById('apiKeyChangeCancelBtn');
    let copyBtn = document.getElementById('apiKeyCopyBtn');

    apiKey.disabled = false
    apiKey.type = "text";
    apiKey.placeholder = "Enter API key";
    btn.innerHTML = "Change";
    btn2.style.display = "inline-block";
    copyBtn.style.display = "none";

    apiKey.focus();

    oldApiKey = apiKey.value.trim();

    apiKey.blur();
}

async function ChangeAPIKey() {
    let apiKey = document.getElementById('apiKeyTextField');
    let btn = document.getElementById('apiKeyChangeBtn');

    apiKey.disabled = true;

    if (apiKey.value.trim() != "") {
        console.log(1);
        const tempKey = apiKey.value.trim();

        try {
            btn.innerHTML = "Checking Key <img src='pictures/loading_icon_2.gif' class='apiSettingsLoadingIcon'>";

            const testKey = new OpenAI({ apiKey: tempKey, dangerouslyAllowBrowser: true });
            const testKeyResponse = await testKey.chat.completions.create({
                messages: [{ role: "system", content: "Test" }],
                model: "gpt-3.5-turbo"
            });

            try {
                let userId = document.getElementById('globalIdUser').innerHTML;
                let query = `UPDATE Users
                SET apiKey = ?
                WHERE id_user = ?`;
                const updateApiKey = await SqlRegisterPromise(query, [`${tempKey}`, `${userId}`]);
                resetAPIKey();
            }
            catch (err2) {
                console.log(err2);
                alert("Failed to change API key. We apologize for the inconvenience");
                resetAPIKey();
            }
        }
        catch (err) {
            console.log(err);
            alert("Your API key is invalid. Please double check it.");
            btn.innerHTML = "Change";
            apiKey.focus();
            apiKey.disabled = false;
        }
    }
    else {
        apiKey.focus();
        apiKey.disabled = false;
    }
}

function resetAPIKey() {
    let apiKey = document.getElementById('apiKeyTextField');
    let btn = document.getElementById('apiKeyChangeBtn');
    let btn2 = document.getElementById('apiKeyChangeCancelBtn');
    let copyBtn = document.getElementById('apiKeyCopyBtn');

    apiKey.disabled = true;
    apiKey.type = "password";
    apiKey.placeholder = "API key";
    apiKey.value = oldApiKey;

    btn.innerHTML = "Edit";
    btn2.style.display = "none";
    copyBtn.style.display = "inline-block";

    oldApiKey = "";

    apiKeyStage = 0;
}

async function copyAPIKey() {
    let apiKey = document.getElementById('apiKeyTextField');

    try {
        let copyText = apiKey.value.trim();
        await navigator.clipboard.writeText(copyText);
    }
    catch (err) {
        console.log(err);
    }
}

let deleteStage = 0;
let deleteInProgress = false;

async function deleteAcc() {
    let btn = document.getElementById('deleteAccBtn');

    if (deleteStage == 0) {

        alert("0");
        btn.disabled = true;
        btn.innerHTML = "In progress";

        deleteInProgress = true;
        resetPassword();
        EnterPass();
    }

    else if (deleteStage == 1) {
        const accId = document.getElementById('globalIdUser').innerHTML.trim();

        alert("1");
        try {
            let deleteMailQuery = `DELETE FROM Mails
            WHERE id_user = ?`;
            await SqlRegisterPromise(deleteMailQuery, [`${accId}`]);

            let deleteContactQuery = `DELETE FROM Contacts
            WHERE id_user = ?`;
            await SqlRegisterPromise(deleteContactQuery, [`${accId}`]);

            let deleteUserQuery = `DELETE FROM Users
            WHERE id_user = ?`;
            await SqlRegisterPromise(deleteUserQuery, [`${accId}`]);

            deleteInProgress = false;

            db.close();

            window.location = "register.html";

        }
        catch (err) {
            console.log(err);
            deleteInProgress = false;
            btn.innerHTML = "Delete Account";
        }
    }
}

// 0 = ADD, 1 = MODIFY
let contactHiddenId = -1;

//SUBMIT CONTACT - INSERT / UPDATE
async function submitContact() {
    //get logged in user's ID from hidden <span> element
    let idUser = document.getElementById('globalIdUser').innerHTML;

    //get data from text fields
    let firstName = document.getElementById('addContactFirstName');
    let lastName = document.getElementById('addContactLastName');
    let dob = document.getElementById('addContactDOB');
    let relation = document.getElementById('addContactRelation');
    let bio = document.getElementById('addContactBio');
    let gender = document.getElementById('genderSelect');

    let allgood = true;

    if (firstName.value.trim() == "" || lastName.value.trim() == "") {
        allgood = false;
    }

    if (relation.value == "") {
        allgood = false;
    }

    if (dob.value == "") {
        allgood = false;
    }

    /*if (bio.innerHTML.trim() == "") {
        allgood = false;
    }*/

    //check if all inputs were correctly filled out
    if (allgood) {
        let firstNameVar = firstName.value.trim();
        let lastNameVar = lastName.value.trim();
        let relationVar = relation.value;
        let bioVar = bio.value.trim();
        let dobVar = dob.value.trim();
        let genderVar = gender.value.trim();

        //INSERT INTO - contact id is -1 or less
        if (contactHiddenId < 0) {
            console.log("add");
            //try INSERT
            try {
                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                //let query = `INSERT INTO Contacts VALUES(NULL, '${idUser}', '${firstNameVar}', '${lastNameVar}', '${dobVar}', '${relationVar}', '${bioVar}', '${genderVar}')`;
                let query = `INSERT INTO Contacts VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const InsertedContactId = await SqlRegisterPromise(query, [`${idUser}`, `${firstNameVar}`, `${lastNameVar}`, `${dobVar}`, `${relationVar}`, `${bioVar}`, `${genderVar}`, `${year}-${month}-${day}`]);
                //console.log(InsertedContactId);
                console.log(InsertedContactId);
                //successful query
                if (InsertedContactId != undefined) {
                    //after insert, clear fields and display contact
                    firstName.value = "";
                    lastName.value = "";
                    relation.value = 'sibling';
                    bio.innerHTML = "";
                    gender.value = 'm';

                    displayModeAddContacts(InsertedContactId);
                }
                //unsuccessful
                else {
                    alert("Contact could not be created.");
                }
            }

            //unsuccessful INSERT
            catch (error) {
                console.log(error);
                alert("Contact could not be created.");
            }

        }

        //UPDATE - contact id is 0 or more
        else {
            console.log("edit");
            //try UPDATE
            try {
                let date = new Date();
                let year = date.getFullYear();
                let month = date.getMonth() + 1;
                let day = date.getDate();
                let query = `UPDATE Contacts
                SET name = ?, surname = ?, dob = ?, relation = ?, bio = ?, gender = ?, date_created = ?
                WHERE id_contact = '${contactHiddenId}'`;
                const UpdatedContactId = await SqlRegisterPromise(query, [`${firstNameVar}`, `${lastNameVar}`, `${dobVar}`, `${relationVar}`, `${bioVar}`, `${genderVar}`, `${year}-${month}-${day}`]);
                //console.log(UpdatedContactId);

                console.log(UpdatedContactId);

                //successful update
                /*
                if (UpdatedContactId == undefined) {
                    alert("Contact changes successfully saved.");
                }
                */
            }

            //unsuccessful UPDATE
            catch (error) {
                console.log(error);
                alert("Contact changes could not be saved.");
            }
        }

    }
    //if not display error
    else {
        alert("All inputs have to be filled out properly.");
    }
}

//DELETE CONTACT
async function deleteContact() {
    //make sure a contact is even selected
    if (contactHiddenId > 0) {
        try {
            let query = `DELETE FROM Contacts
            WHERE id_contact = '${contactHiddenId}'`;
            const deletedId = await SqlRunPromise(query);

            //contact deleted, go back to contact list
            if (deletedId == undefined) {
                displayMode(2);
            }
            //contact could not be deleted
            else {
                alert("Contact could not be deleted. We apologize for the inconvenience.");
            }
        }
        catch (error) {
            console.log(error);
            alert("Contact could not be deleted. We apologize for the inconvenience.");
        }
    }
}

//ADD, MODIFY CONTACTS
async function displayModeAddContacts(contactId) {
    await displayMode(2);
    let firstName = document.getElementById('addContactFirstName');
    let lastName = document.getElementById('addContactLastName');
    let dob = document.getElementById('addContactDOB');
    let relation = document.getElementById('addContactRelation');
    let addBtn = document.getElementById('addContactSubmitBtn');
    let bio = document.getElementById('addContactBio');
    let delBtn = document.getElementById('deleteWrap');
    let gender = document.getElementById('genderSelect');

    dob.value = '';
    gender.value = 'm';
    //ADD contact
    if (contactId < 0) {
        //rewrite title text to "contacts > add"
        document.getElementById('contactsHeadTitleText').innerHTML = "<a class='titleLink' href='#' onclick='displayMode(2)'>Contacts</a> > Add";

        //change title icon to add contact
        document.getElementById('contactImg').src = "pictures/white_pfp_hover.png";

        //empty inputs, to enable add contact
        firstName.value = "";
        lastName.value = "";
        bio.innerHTML = "";
        dob.value = "";
        relation.value = 'sibling';

        //change value of button to ADD CONTACT, hide DELETE BUTTON
        addBtn.innerHTML = "Add contact";
        delBtn.style.display = 'none';
        document.getElementById('contactMailWrap').style.display = 'none';


        //display add contact, hide contact list 
        document.getElementById('contactList').style.display = 'none';
        document.getElementById('addContact').style.display = 'flex';

        //set contact mode to 0 - ADD MODE
        //contactMode = 0;

        //set selected contact ID to -1¸
        contactHiddenId = -1;

        firstName.select();

        //isAddConact = true;
    }

    //MODIFY contact
    else {
        //get contact data from id
        try {
            let query = `SELECT id_contact, id_user, name, surname, dob, relation, bio, gender
            FROM Contacts 
            WHERE id_contact = '${contactId}'`;

            const row = await SqlGetPromise(query);

            //query successful - FILL FORM
            if (row != null) {
                firstName.value = row.name;
                lastName.value = row.surname;
                bio.innerHTML = row.bio;
                relation.value = row.relation;
                dob.value = row.dob;
                gender.value = row.gender;

                //rewrite title text to "Contacts > [name of contact]"
                document.getElementById('contactsHeadTitleText').innerHTML = `<a class='titleLink' href='#' onclick='displayMode(2)'>Contacts</a> > ${row.name + " " + row.surname}`;

                //change value of button to SAVE CHANGES, show delete button
                addBtn.innerHTML = "Save changes";
                delBtn.style.display = 'flex';

                //at the end, display modify contact screen
                document.getElementById('contactList').style.display = 'none';
                document.getElementById('addContact').style.display = 'flex';

                //set contact mode to 1 - MODIFY MODE
                //contactMode = 1;
                document.getElementById('contactMailWrap').style.display = 'inline';

                //set selected contact id 
                contactHiddenId = contactId;

                //display copy and delete buttons
                document.getElementById('TopDeleteBtn').style.display = "flex";
                document.getElementById('TopCopyBtn').style.display = "flex";
                document.getElementById('TopMailBtn').style.display = "flex";
            }

            //query not successful
            else {
                alert("Error finding contact info");
                //contactMode = 0;
                contactHiddenId = -1;
            }

            firstName.select();

            //isAddConact = true;
        }
        //data not found
        catch (error) {
            //contactMode = 0;
            contactHiddenId = -1;
        }
    }
}

//SELECT MAILS
async function displayModeGenerated(mailId) {
    displayMode(1);

    let mails = document.getElementsByClassName('generatedLetter');
    let selectedMail = document.getElementById('generatedLetter' + mailId);

    for (let i = 0; i < mails.length; i++) {
        mails[i].style.borderLeft = "3px solid gray";
    }

    //deselect - HIDE MAIL
    if (selectedMailId == mailId) {
        //console.log("deselect");
        selectedMail.style.borderLeft = "3px solid gray";
        selectedMailId = 0;

        let navBtns = document.getElementsByClassName('rightTopBtn');
        for (let i = 0; i < navBtns.length; i++) {
            navBtns[i].style.display = "none";
        }
    }

    //select mail - SHOW MAIL
    else {
        selectedMailId = mailId;

        //query for mail
        try {
            let query = `SELECT id_mail, id_contact, id_user, title, date_generated, content, type, reason, formality
            FROM Mails
            WHERE id_mail = '${mailId}'`;

            const row = await SqlGetPromise(query);

            //mail found - DISPLAY MAIL
            if (row != null) {

                //GET CONTACT NAME
                let contactName = "";

                try {
                    let contactQuery = `SELECT id_contact, id_user, name, surname, dob, relation, bio, gender 
                    FROM Contacts 
                    WHERE id_contact = '${row.id_contact}'`;

                    const contactRow = await SqlGetPromise(contactQuery);

                    //contact found - show contact as '[Name], [Surname]'
                    if (contactRow != null) {
                        contactName = contactRow.name + " " + contactRow.surname;
                    }

                    //contact not found - show contact as 'Contact X'
                    else {
                        contactName = "Contact " + row.id_contact;
                    }
                }
                //if name could not be resolved - show contact as 'Contact X'
                catch (error2) {
                    console.log("Contact name error: " + error2);
                    contactName = "Contact (ID: " + row.id_contact + ")";
                }

                let dateArr = (row.date_generated).split('-');
                let dateYear = dateArr[0];
                let dateMonth = dateArr[1];
                let dateDay = dateArr[2];
                let formattedDate = `${dateDay}.${dateMonth}.${dateYear}`;

                //FILL RIGHT WINDOW WITH MAIL CONTENT
                document.getElementById('generatedMailWrap').innerHTML = `
                <!--mail content-->
                <div class="selectedMailWrap">

                    <!--mail title-->
                    <div class="selectedMailTop">
                        <div class="selectedMailTopLeft">  
                            <div class="selectedMailTopTitle">
                                ${row.title} <span id="generatedTypeMail">(${row.type} - ${row.formality})</span>
                            </div>
                            <div class="selectedMailTopContact">
                                <span style="font-size: 13px">to</span> <a onclick="displayModeAddContacts(${row.id_contact})" href="#" class='generatedContactLink'>${contactName}</a>
                            </div>
                        </div>
                        <div class="selectedMailTopRight">
                            <div>
                                ${formattedDate}
                            </div>
                            <div>
                                <button id="generatedMailReasonBtn" class="generatedMailReasonBtn" onclick="showHideReason()">Show reason <img class="reasonImg" src="pictures/help_icon.png"></button>
                            </div>
                        </div>
                    </div>
                    <!--mail title-->

                    <!--mail content-->
                    <div class="selectedMailMiddle" id="selectedMailMiddle">${(row.content).trim()}</div>
                    <!--mail content-->

                    <!--mail reason-->
                    <div class="selectedMailReason" id="selectedMailReason">
                        <div class="selectedMailReasonTop">
                            Reason for writing mail
                        </div>
                        <div class="selectedMailReasonContent">&raquo;${row.reason}&laquo;</div>
                    </div>
                    <!--mail reason-->
                </div>
                `;

                //CHANGE HEAD TEXT TO 'Generated mail > [title of mail]'
                document.getElementById('generatedTitleText').innerHTML = `<a onclick='displayMode(1)' href='#' class='titleLink'>Generated mails</a> > ${row.title}`;

                //display copy and delete buttons
                document.getElementById('TopDeleteBtn').style.display = "flex";
                document.getElementById('TopCopyBtn').style.display = "flex";

                document.getElementById('generatedLetter' + selectedMailId).style.borderLeft = "5px solid gray";
            }

            //mail not found
            else {
                alert("Mail not found");
            }
        }

        //unsuccessful query
        catch (error) {
            console.log("Get mail error: " + error);
        }
    }

}

let formality = true;

function changeFormality() {
    //infromal
    if (formality) {
        formality = false;
        document.getElementById('newFormalityOutput').innerHTML = "Informal";
    }
    //formal
    else {
        formality = true;
        document.getElementById('newFormalityOutput').innerHTML = "Formal";
    }
    //alert(formality);
}

async function generateMail() {
    //1. get new mail form data

    let title = document.getElementById('newMailTextField');
    let recipient = document.getElementById('newRecipentDropDown');
    let purpose = document.getElementById('newMailPurpose');
    let reason = document.getElementById('newReasonTextArea');
    //let formalityItem = document.getElementById('newFormalityCheck').value;
    //let formalTextSlo = "";
    let formalTextEng = "";

    if (formality) {
        formalTextEng = "Formal";
        formalTextSlo = "Da";
    }
    else {
        formalTextEng = "Informal";
        formalTextSlo = "Ne";
    }

    let allgood = true;

    //2. check text fields if they are filled out (correctly)

    if (title.value.trim() == "") {
        allgood = false;
        console.log("title");
    }

    if (recipient.value == 0) {
        allgood = false;
        console.log("rec");
    }

    if (purpose.value == 0) {
        allgood = false;
        console.log("type");
    }

    if (reason.value.trim() == "") {
        allgood = false;
        console.log("reason / purpose for writing");
    }

    //3. insert data into prompt

    if (allgood) {
        recipient.disabled = true;
        title.disabled = true;
        purpose.disabled = true;
        reason.disabled = true;

        try {
            let firstName = document.getElementById('globalFirstName').innerHTML;
            let lastName = document.getElementById('globalLastName').innerHTML;
            let query = `SELECT id_contact, c.id_user, name, surname, dob, relation, bio, gender, apiKey
            FROM Contacts c JOIN Users u
            ON c.id_user = u.id_user
            WHERE id_contact = '${recipient.value}'`;
            const contactData = await SqlGetPromise(query);

            if (contactData != null) {
                let name = contactData.name, surname = contactData.surname;
                let dob = contactData.dob, relation = ", my " + contactData.relation;
                let bio = contactData.bio;
                let gender = 'male';

                if (contactData.gender == 'f') {
                    gender = 'female';
                }

                if (relation == "other") relation = "";

                let recipientDesc = `${name} ${surname}${relation}`;

                let EngPrompt = `Receiver: ${recipientDesc} (${gender}${relation})
                Date of birth of receiver (year/month/day): ${dob} 
                Extra info about receiver: ${bio}
                Formality: ${formalTextEng}
                Type of mail: ${purpose.value}
                Reason for writing mail: '${reason.value.trim()}'

                My name (sender name): ${firstName} ${lastName}

                With the data above, create an email, that is designed and tailored with the degree of formality mentioned above using the right style/type. 
                Use your creativity to connect the sender and receivers info into the email as needed and if it makes sense. 
                If the email was successfully created, make the last bit in the string of the output as the number 1 (add the number at the end).  
                If any information is missing, indicate it as '2' instead of '1' at the end of the output. 
                If the email is not making sense or is incomplete indicate with "3" instead of "1".
                `;
                console.log(EngPrompt);

                let generateBtn = document.getElementById('NewMailSubmitBtn');

                let apiKey = contactData.apiKey;

                try {

                    generateBtn.innerHTML = "Generating <img src='pictures/loading_icon_2.gif' id='generateLoadingImg'>"
                    const tempOpenAi = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
                    const generateRequest = await tempOpenAi.chat.completions.create({
                        messages: [{ role: "system", content: EngPrompt }],
                        model: "gpt-3.5-turbo"
                    });

                    let ReturnedMail = generateRequest.choices[0].message.content.trimEnd();
                    console.log(ReturnedMail);

                    //success
                    if (ReturnedMail.substring(ReturnedMail.length - 1) == '1') {
                        ReturnedMail = ReturnedMail.substring(0, ReturnedMail.length - 1).trimEnd();
                        console.log(ReturnedMail);
                        let idUser = document.getElementById('globalIdUser').innerHTML;
                        const date = new Date();
                        let day = date.getDate();
                        let month = date.getMonth() + 1;
                        let year = date.getFullYear();

                        /*let formal = '1';
                        if(!formality) formal = '0';*/

                        let saveQuery = `INSERT INTO Mails VALUES(NULL, ?, ?, ?, ?, ?, ?, ?, ?)`;

                        try {
                            const savedMail = await SqlRegisterPromise(saveQuery, [`${recipient.value}`, `${idUser}`, `${title.value}`, `${year}-${month}-${day}`, `${ReturnedMail}`, `${purpose.value}`, `${reason.value}`, `${formalTextEng}`]);

                            if (savedMail != null) {
                                recipient.value = 0;
                                title.value = "";
                                purpose.value = 0;
                                reason.value = "";

                                await loadMails();
                                await displayModeGenerated(savedMail);
                            }
                            else {
                                displayMode(1);
                            }
                        }
                        catch (error) {
                            console.log("insert mail error: " + error);
                            console.log(saveQuery);
                            alert("Mail could not be saved.");
                        }
                    }

                    //missing info
                    else if (ReturnedMail.substring(ReturnedMail.length - 1) == '2') {
                        alert("There is not enough information to generate the mail. Please provide the necessary info.");
                    }

                    //failed mail
                    else {
                        alert("The AI could not understand your inputs. Please double check them.");
                    }

                    generateBtn.innerHTML = "Generate";
                }
                catch (error) {
                    console.log(error);
                    generateBtn.innerHTML = "Generate";
                    alert("Mail could not be generated. We apologize for the inconvenience.");
                }
            }
        }
        catch (error) {
            console.log(error);
            alert("Mail could not be generated. We apologize for the inconvenience.");
        }
    }
    else {
        alert("All inputs have to be filled out properly.");
    }

    recipient.disabled = false;
    title.disabled = false;
    purpose.disabled = false;
    reason.disabled = false;
    title.focus();
}

/*-------------------------------------HOMEPAGE-------------------------------------*/
