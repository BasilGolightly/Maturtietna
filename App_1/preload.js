//const{ contextBridge } = require('electron');
/*const openAIReq = require("openai");
const openai = new openAIReq.OpenAI();*/
const { count } = require('console');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();


//connect to sql DB
let db = new sqlite3.Database('./DB/data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    else {
        console.log('Connected to the local DB.');
    }
});

function setupDb() {
    //CREATE USERS TABLE
    db.run(`CREATE TABLE IF NOT EXISTS Users(
        id_user INTEGER PRIMARY KEY AUTOINCREMENT,
        username NVARCHAR(50) NOT NULL,
        password NVARCHAR(255) NOT NULL,
        firstTime INTEGER NOT NULL CHECK (firstTime IN('0', '1'))
    );`, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log("Users table created / already exists.");
        }
    })

    //CREATE CONTACTS TABLE
    db.run(`CREATE TABLE IF NOT EXISTS Contacts(
        id_contact INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user INTEGER NOT NULL,
        name NVARCHAR(50) NOT NULL,
        surname NVARCHAR(50) NOT NULL,
        dob DATE NOT NULL,
        relation INTEGER NOT NULL,
        bio TEXT,
        CONSTRAINT FK_CONTACTS_ID_USER FOREIGN KEY(id_user) REFERENCES Users(id_user)
    );`, (err) => {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log("Contacts table created / already exists.");
        }
    })

    //CREATE MAILS TABLE
    db.run(`CREATE TABLE IF NOT EXISTS Mails(
        id_mail INTEGER PRIMARY KEY AUTOINCREMENT,
        id_contact INTEGER NOT NULL,
        id_user INTEGER NOT NULL,
        title NVARCHAR(50) NOT NULL,
        date_generated DATE NOT NULL,
        content TEXT NOT NULL,
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
}

/*-------------------------------------SQL FUNCTIONS-------------------------------------*/

//GET SINGLE ROW
function SqlGetPromise(query) {
    return new Promise((resolve, reject) => {

        db.get(query, (err, rows) => {
            //failed query
            if(err) {
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
            if(err) {
                reject(err);
            }

            //"return" the inserted id when the action is finished
            resolve(this.lastId);
        })
    })
}

//SELECT MULTIPLE ROWS
function SqlEachPromise(query){
    return new Promise((resolve, reject) => {
        let rows = new Array();
        db.each(query, (err, row) => {
            //failed query
            if(err) {
                reject(err);
            }
            else{
                rows.push(row);
            }
            // "return" the result when the action finish
            
        })
        resolve(rows);
    })
}

//SELECT ALL ROWS
function SqlAllPromise(query){
    return new Promise((resolve, reject) => {
        
        db.all(query, (err, rows) => {
            //failed query
            if(err) {
                reject(err);
            }
            resolve(rows);
        })

    })
}

/*-------------------------------------SQL FUNCTIONS-------------------------------------*/

/*-------------------------------------REGISTER-------------------------------------*/

//CHECK REGISTER FORM DATA
function registerCheck() {
    //set error display to empty string
    let errorHTML = document.getElementById('error');
    errorHTML.innerHTML = "";
    let error = "";

    //get user input data
    let allgood = true;
    let username = document.getElementById('newUsername').value.trim();
    let password = document.getElementById('passwordtextBox1').value.trim();
    let repeatPass = document.getElementById('passwordtextBox2').value.trim();

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

    //repeat pass check
    if (repeatPass != password || repeatPass.trim() === '') {
        error += "Passwords do not match";
        allgood = false;
    }

    //if all is in proper format, proceed with register
    if (allgood) {
        register(username, password); 
    }
    //if not, output error
    else{
        document.getElementById('error').innerHTML = error;
    }   
}

//EXECUTE INSERT INTO FOR NEW USER AND RETURN THE NEW ID IF SUCCESSFUL
function SqlRegisterPromise(query) {
    return new Promise((resolve, reject) => {
        
        db.run(query, function(err){
            //failed DML
            if(err) {
                reject(err);
            }
            
            resolve(this.lastID);
        })
    })    
}

//INSERT INTO USERS 
async function register(username, password) {
    try{
        //insert into users table
        const id = await SqlRegisterPromise(`INSERT INTO Users VALUES(null, '${username}', '${password}', '1')`);
        console.log("New account ID: " + id);
        
        //write to intermediary JSON file
        const Writesuccess = await writeToLoginfile(username, "", id)
        
        //success - go straight to homepage
        if(Writesuccess){
            //alert("JSON write successful");
            window.location = "index.html";
        }
        //fail - you have to login manually to get data to JSON file
        else{
            window.location = "login.html";
        }
    }
    catch(error){
        console.log(error);
        document.getElementById('error').innerHTML += "The register action could not be carried out. <br>";
    }
}

async function checkExistingAccounts(){
    try{
        const rows = await SqlAllPromise("SELECT id_user FROM Users");

        if(rows.length >= 5){
            window.location = "login.html";
        }
    }
    catch(error){
        console.log(error);
    }
}

/*-------------------------------------REGISTER-------------------------------------*/

/*-------------------------------------LOGIN-------------------------------------*/

//CHECK IF LOGIN PASSWORD IS CORRECT
function loginCheck() {
    let password =  document.getElementById('passwordTextField').value.trim();
    let username = document.getElementById('loginName').innerHTML.trim();

    if(password != "" && username != ""){
        login(username, password);
    }
    else{
        document.getElementById('errorLogin').innerHTML = "Password cannot be empty";
    }
}

//LOGIN - WRITE TO JSON AND REDIRECT
async function login(username, password){
    try{
        const row = await SqlGetPromise(`SELECT id_user, username, password FROM Users WHERE username = '${username}' AND password = '${password}'`);

        //password correct
        if(row != null){
            //write to JSON intermediate file
            const WriteLoginSuccess = await writeToLoginfile(username, "", row.id_user);

            //JSON WRITE SUCCESS - go to index.html
            if(WriteLoginSuccess){
                window.location = "index.html";
            }
            
            //JSON WRITE FAIL - show error
            else{
                document.getElementById('errorLogin').innerHTML = "Login action could not be carried out <br>";
            }
        }

        //password invalid
        else{
            document.getElementById('errorLogin').innerHTML = "Invalid password / credentials. <br>";
        }
    }
    //query error
    catch(error){
        document.getElementById('errorLogin').innerHTML = "Login action could not be carried out <br>";
        console.log(error);
    }
    
}

//DISPLAY EXISTING ACCOUNTS
async function loginDisplayAccounts(){
    //attempt query
    try{
        const rows = await SqlAllPromise(`SELECT id_user, username FROM Users`);
        
        //found accounts
        if(rows.length > 0){
            
            //IF THERE ALREADY ARE MORE THAN 5 ACCOUNTS - HIDE REGISTER LINK
            if(rows.length >= 5){
                document.getElementById('registerLink').innerHTML = "";
            }

            //DISPLAY ACCOUNTS
            for(let i = 0; i < rows.length; i++){
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
        else{
            window.location = "register.html";
        }
    } 

    //failed query
    catch(error){
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

        fs.writeFile('DB/login.json', JSON.stringify(obj), (err) => {
            if(err){
                reject(false);
            }

            resolve(true);
        })

    })
}

//READ FROM FILE
function readLoginFile(){
    return new Promise((resolve, reject) => {
        fs.readFile('DB/login.json', (err, data) =>{
            if(err){
                reject(err);
            }
            else{
                let obj;
                obj = JSON.parse(data);
                resolve(obj);
            }
        })
    })
}

/*-------------------------------------JSON-------------------------------------*/

/*-------------------------------------HOMEPAGE-------------------------------------*/

let displayModeId = -1;
let selectedMailId = 0;

function displayMode(mode){
    let date = new Date();
    date.setFullYear(date.getFullYear() - 10);
    document.getElementById('addContactDOB').max = date.getFullYear + "-" + date.getMonth() + "-" + date.getDate();

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
    for(let i = 0; i < navItems.length; i++){
        navItems[i].style.backgroundColor = "transparent";
    }

    //hide all frames
    for(let i = 0; i < Windowframes.length; i++){
        Windowframes[i].style.display = "none";
    }

    //check which panel to show
    switch(mode){
        //new email
        case 0:
            //alert('0');
            displayModeId = 0;

            let contactsString = ``;
            let contactNames = document.getElementsByClassName('contactName');

            for(let i = -1; i < contactNames.length; i++){
                if(i == -1){
                    contactsString = `<option value="0">-Select recipient-</option>`;
                }
                else{
                    //id = 'contact1'
                    let contactId = contactNames[i].id;
                    contactId = contactId.substring(7, contactId.length);
                    contactsString += `
                    <option value="${contactId}">${contactNames[i].innerHTML.trim()}</option>
                    `;
                }
                
            }

            document.getElementById('newRecipentDropDown').innerHTML = contactsString;

            newMailFrame.style.display = "flex";
            
            /*document.getElementById('newMailNavItem').style.backgroundColor = backgroundNavColor;*/
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
            for(let i = 0; i < mails.length; i++){
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

            loadContacts();
            
            let contacts = document.getElementsByClassName('contactFrame');
            document.getElementById('countContacts').innerHTML = contacts.length;
            document.getElementById('contactImg').src = "pictures/white_pfp.png";
            document.getElementById('contactsNavItem').style.backgroundColor = backgroundNavColor;
            document.getElementById('contactsHeadTitleText').innerHTML = "Contacts";
            //document.getElementById('selectedContact').style.display = 'none';
            document.getElementById('addContact').style.display = 'none';
            document.getElementById('contactList').style.display = 'flex';
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
            displayModeId = 4;

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

//controls searchbar display, and button placement on the navbar, depending on the display mode (func. displayMode()) 
function searchBarDisplayMode(searchMode){
    let searchBarDiv = document.getElementById('searchBarWrap');
    let searchText = document.getElementById('searchTopTextBox');
    let searchBtn = document.getElementById('searchTopBtn');
    let navBtns = document.getElementsByClassName('rightTopBtn');

    //Only clear search bar
    if(searchMode < 0){
        searchText.value = "";
    }
    //Hide and disable search bar
    else if(searchMode == 0){
        searchBarDiv.style.display = "none";
        searchText.value = "";
        searchText.readOnly = true;
        searchBtn.disabled = true;
    }
    //Show and enable the searhcbar
    else if(searchMode > 0){
        searchBarDiv.style.display = "grid";
        searchText.readOnly = false;
        searchBtn.disabled = false;

        //hide all navbar buttons
        if(searchMode == 1){
            for(let i = 0; i < navBtns.length; i++){
                navBtns[i].style.display = "none";
            }
        }

        //show all navbar buttons
        else if(searchMode == 2){
            for(let i = 0; i < navBtns.length; i++){
                navBtns[i].style.display = "block";
            }
        }

        /*else{
           
        }*/
        
    }
}

//show results of search - found contact names, mails
async function searchBarSubmit(){
    let searchBar = document.getElementById('searchTopTextBox');
    let searchString = searchBar.value.trim();
    searchBar.value = searchString; 
    let mailResultCountItem = document.getElementById('mailResultsCount');
    let contactResultCountItem = document.getElementById('contactsResultCount');
    let totalCountItem = document.getElementById('totalCountOutput');
    let mailResultCount = 0, contactResultCount = 0, totalCount = 0;

    //get mails
    try{
        let MailsSearchQuery = `SELECT id_mail, id_contact, id_user, title, date_generated, content
        FROM Mails
        WHERE title LIKE '%˘${searchString}%'`;
        MailsSearchQuery = db.prepare(MailsSearchQuery);

        const MailsRows = await SqlAllPromise(MailsSearchQuery);

        if(MailsRows != null){
            mailResultCount = MailsRows.length;
            totalCount += mailResultCount;

            //display found mails
            for(let i = 0; i < MailsRows.length; i++){
                document.getElementById('searchMailResultsWrap').innerHTML += `
                <!--Mail result-->
                <div class="searchMailResultFrame">

                </div>
                <!--Mail result-->
                `;
            }
        }
    }
    catch(error){
        console.log(error);
    }

    //get contacts
    try{
        let ContactsSearchQuery = `SELECT id_contact, id_user, name + ' ' + surname AS fullName, dob, relation, bio
        FROM Contacts
        WHERE fullName LIKE '%${searchString}%'`;
        ContactsSearchQuery = db.prepare(ContactsSearchQuery);

        const Contactrows = await SqlAllPromise(ContactsSearchQuery);

        if(Contactrows != null){
            contactResultCount = Contactrows.length;
            totalCount += contactResultCount;

            //display found contacts
            for(let i = 0; i < Contactrows.length; i++){
                document.getElementById('searchMailResultsWrap').innerHTML += `
                <!--Contact result-->
                <div class="searchContactResultFrame">

                </div>
                <!--Contact result-->
                `;
            }
        }
    }
    catch(error2){
        console.log(error2);
    } 

    totalCountItem.innerHTML = totalCount;
    mailResultCountItem.innerHTML = `(${mailResultCount})`;
    contactResultCountItem.innerHTML = `(${contactResultCount})`;
}

//load ALL mails
async function loadMails(){
    //get logged in user's ID from hidden <span> element
    let idUser = document.getElementById('globalIdUser').innerHTML;
    
    try{
        let query = `SELECT id_mail, id_contact, id_user, title, date_generated, content 
        FROM Mails
        WHERE id_user = '${idUser}'
        `;
        const rows = await SqlAllPromise(query);

        //successfull query
        if(rows != null){
            if(rows.length == 0){
                document.getElementById('generatedWrap').innerHTML = `
                <div class="generatedLetterEmpty" id="generatedLetterEmpty">
                    <div class="generatedLetterEmptyInner">
                        No mails found.
                    </div>
                </div>
                `;
            }
            else{
                document.getElementById('generatedWrap').innerHTML = "";

                //loop through all rows and write mails to list
                for(let i = 0; i < rows.length; i++){
                    
                    let content = rows[i].content;
                    let quick_content = content.substring(0, 16) + '...';

                    document.getElementById('generatedWrap').innerHTML += `

                    <div class="generatedLetter" onclick="displayModeGenerated(${rows[i].id_mail})" id="generatedLetter${rows[i].id_mail}">
                        <div class="generatedLetterInner">
                            <div class="generatedLetterTitle" id="titleMail${rows[i].id_mail}">
                                ${rows[i].title}
                            </div>
                            <div class="generatedLetterDate" id="dateMail${rows[i].id_mail}">
                                ${(rows[i].date_generated).replaceAll("-", ".")}
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
        else{
            alert("Mails could not be loaded");
        }
    }
    //unsuccessfull query
    catch(error){
        console.log(error);
        alert("Mails could not be loaded");
    }
}

//load ALL contacts into contact list
async function loadContacts(){
    //get logged in user's ID from hidden <span> element
    let idUser = document.getElementById('globalIdUser').innerHTML;

    //SUCCESSFULL QUERY
    try{
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
            if(rows.length <= 0){
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
            else{
                //loop through contacts and display them
                for (let i = 0; i < rows.length; i++) {
                    //display contact
                    document.getElementById('contactList').innerHTML += `

                        <!--contact-->
                        <div class="contactFrame" onclick="displayModeAddContacts(${rows[i].id_contact})">
                            <div class="contactName" id="contact${rows[i].id_contact}">
                                ${rows[i].name} ${rows[i].surname}
                            </div>
                            <div class="contactArrow">
                                >
                            </div>
                        </div>
                        <!--contact-->

                        `;
                }
            }
        }

        //UNSUCCESSFULL QUERY
        else{
            alert("Contact list could not be loaded");
        }
    }

    //UNSUCCESSFULL QUERY
    catch(error){
        console.log(error);
        alert("Contact list could not be loaded");
    }
}

//load all of user's info by reading ID from JSON and querying for data
async function loadUserProfile(){
    try{
        const obj = await readLoginFile();

        //successful read
        if(obj.Id != "" && obj.UserName != ""){
            //alert("success");
            document.getElementById('navAccName').innerHTML = obj.UserName.trim();
            document.getElementById('globalIdUser').innerHTML = obj.Id;
            

            //fill account settings - username and password field
            document.getElementById('accSettingsUsernameTextField').value = obj.UserName;

            try{
                let query = `SELECT firstTime, password 
                FROM Users
                WHERE id_user = '${obj.Id}'`;
                const row = await SqlGetPromise(query);
                //console.log(row);

                //successful query for password
                if(row != null){
                    document.getElementById('accSettingsPasswordTextField').value = row.password;
                }
            }
            catch(error){
                console.log(error);
            }

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
        else{
            window.location = "login.html";
        }
    }
    catch(error){
        alert(error);
        window.location = "login.html";
    }
}

let changePassStage = 0;

//change password
async function changePass(){
    let oldPass = document.getElementById('accSettingsPasswordTextField');
    let enterPass = document.getElementById('accSettingsEnterPassTextField');
    let newPass = document.getElementById('accSettingsNewPassTextField');
    let btn = document.getElementById('changePassBtn');

    //0. default look, old password shown, button says 'edit'
    if(changePassStage == -1){
        newPass.style.display = "none";
        newPass.style.zIndex = -1;
        newPass.style.width = '0px';

        enterPass.style.display = "none";
        enterPass.style.zIndex = -1;
        enterPass.style.width = '0px';

        oldPass.style.display = "flex";
        oldPass.style.zIndex = 0;
        oldPass.style.width = 'auto';

        btn.innerHTML = "Edit";

        changePassStage = 0;
    }

    //1. enter password - hide old pass text field, show enter pass text field, make button say enter password
    else if(changePassStage == 0){
        oldPass.style.display = "none";
        oldPass.style.zIndex = -1;
        oldPass.style.width = '0px';

        newPass.style.display = "none";
        newPass.style.zIndex = -1;
        newPass.style.width = '0px';

        enterPass.style.display = "flex";
        enterPass.style.zIndex = 0;
        enterPass.style.width = 'auto';

        btn.innerHTML = "Enter password";

        newPass.value = "";
        enterPass.value = "";

        //enterPass.click();

        changePassStage = 1;
    }

    //2. submit old pass - check if the password matches
    else if(changePassStage == 1){
        //enterPass.click();

        enterPass.value = enterPass.value.trim();

        //password is not empty
        if(enterPass.value != ""){
            //passwords match
            if(oldPass.value == enterPass.value){
                //change username ready
                if(changeUserNameStage < 0){
                    changeUserNameStage = 1;
                    changeUsername();
                }
                //change pass functionality
                else{
                    oldPass.style.display = "none";
                    oldPass.style.zIndex = -1;
                    oldPass.style.width = '0px';

                    enterPass.style.display = "none";
                    enterPass.style.zIndex = -1;
                    enterPass.style.width = '0px';

                    newPass.style.display = "flex";
                    newPass.style.zIndex = 0;
                    newPass.style.width = 'auto';
                    
                    btn.innerHTML = "Change password";

                    changePassStage = 2;
                }
            }

            //passwords don't match
            else{
                alert("Password is incorrect.");
                //changePassStage = 1;
                //changePass();
            }
        }
        //password is empty
        else{
            alert("Password cannot be empty.");
            //changePassStage = 1;
            //changePass();
        }
    }

    //3. change password
    else{
        newPass.click();

        newPass.value = newPass.value.trim();
        
        //new password is not empty
        if(newPass.value != ""){
            //check that password is at least 12 chars
            if(newPass.value.length >= 12){
                //password includes spaces
                if(newPass.value.includes(" ")){
                    alert("New password cannot contain spaces.");
                    newPass.focus();
                }
                //password does not include spaces - attempt UPDATE
                else{
                    //get logged in user's ID from hidden <span> element
                    let idUser = document.getElementById('globalIdUser').innerHTML;

                    try{
                        let query = `UPDATE Users
                        SET password = '${newPass.value}'
                        WHERE id_user = '${idUser}'`;
                        const UpdateErr = await SqlRunPromise(query);

                        if(UpdateErr == undefined){
                            alert("Password changed successfully");
                            oldPass.value = newPass.value;
                            newPass.value = "";
                            enterPass.value = "";

                            changePassStage = -1;
                            changePass();
                        }

                        else{
                            alert("Password could not be changed. We apologize for the inconvenience");
                            changePassStage = -1;
                            changePass();
                        }
                    }
                    catch(error){
                        console.log(error);
                        alert("Password could not be changed. We apologize for the inconvenience");
                        changePassStage = -1;
                        changePass();
                    }
                }
            }
            //password is shorter than 12 characters
            else{
                alert("New password must be at least 12 characters long.");
            }
        }
        else{
            alert("New password cannot be empty.");
        }

        newPass.click();
    }
}

let changeUserNameStage = 0;

//change username
async function changeUsername(){
    let userNameText = document.getElementById('accSettingsUsernameTextField');
    let btn = document.getElementById('changeUsernameBtn');

    //0. set username text field to readonly, set button to say 'edit'
    if(changeUserNameStage == -1){
        userNameText.readOnly = true;

        btn.innerHTML = "Edit";

        changePassStage = -1;
        changePass();

        changeUserNameStage = 0;
    }

    //1. show enter password field via the changePassMethod
    else if(changeUserNameStage == 0){
        changePassStage = 0;
        changePass();

        let enterPass = document.getElementById('accSettingsEnterPassTextField');
        enterPass.click();
    }

    //2. password properly entered, make button say 'change Username', and enable username inputs, reset password to default 
    else if(changeUserNameStage == 1){
        userNameText.readOnly = false;

        btn.innerHTML = "Change username";

        changePassStage = -1;
        changePass();

        userNameText.click();
        changeUserNameStage = 2;
    } 

    //3. submit changed username, check if the format is correct
    else{
        //get logged in user's ID from hidden <span> element
        let idUser = document.getElementById('globalIdUser').innerHTML;
        userNameText.value = userNameText.value.trim();
        let username = userNameText.value;

        //username is not empty
        if(username != ""){
            //username includes spacebars
            if(username.includes(" ")){
                alert("New username cannot include spaces.");
                userNameText.click();
            }
            else{

                //check if another user with the same username exists
                try{
                    let query = `SELECT id_user FROM Users WHERE username = '${username}'`;
                    const row = await SqlGetPromise(query);
                    
                    //username free
                    if(row == undefined){
                        try{
                            let update = `UPDATE Users
                            SET username = '${username}'
                            WHERE id_user = '${idUser}'`;
                            const updatedId = await SqlRunPromise(update);

                            alert("Username succesfuly changed.");

                            changeUserNameStage = -1;
                            changeUsername();
                        }
                        catch(error2){
                            console.log(error2);
                            alert("Username could not be changed. We apologize for the inconvenience.");
                        }
                    }
                    //username taken
                    else{
                        alert("Username taken.");
                    }
                }
                catch(error){ 
                    console.log(error);
                    alert("Username could not be changed. We apologize for the inconvenience.");
                }
            }
        }
        //username empty
        else{
            alert("New username cannot be empty.");
            userNameText.click();
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

    let allgood = true;

    if (firstName.value.trim() == "" || lastName.value.trim() == "") {
        allgood = false;
    }

    if (relation.value == "") {
        allgood = false;
    }

    if (dob.value == ""){
        allgood = false;
    }

    /*if (bio.innerHTML.trim() == "") {
        allgood = false;
    }*/

    //check if all inputs were correctly filled out
    if (allgood) {
        firstName = firstName.value.trim();
        lastName = lastName.value.trim();
        relation = relation.value;
        bio = bio.innerHTML.trim();

        //INSERT INTO - contact id is -1 or less
        if (contactHiddenId < 0) {
            console.log("add");
            //try INSERT
            try {
                let query = `INSERT INTO Contacts VALUES(NULL, '${idUser}', '${firstName}', '${lastName}', '${dob}', '${relation}', '${bio}')`;
                const InsertedContactId = await SqlRunPromise(query);
                //console.log(InsertedContactId);

                //successful query
                if (InsertedContactId == undefined) {
                    //after insert, clear fields and display contact
                    firstName.value = "";
                    lastName.value = "";
                    relation.value = '0';
                    bio.innerHTML = "";

                    console.log(InsertedContactId);

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
            try{
                let query = `UPDATE Contacts
                SET name = '${firstName}', surname = '${lastName}', dob = '${dob}', relation = '${relation}', bio = '${bio}'
                WHERE id_contact = '${contactHiddenId}'`;
                const UpdatedContactId = await SqlRunPromise(query);
                //console.log(UpdatedContactId);

                //successful update
                if(UpdatedContactId == undefined){
                    alert("Contact changes successfully saved.");
                }
            }

            //unsuccessful UPDATE
            catch(error){
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
async function deleteContact(){
    //make sure a contact is even selected
    if(contactHiddenId > 0){
        try{
            let query = `DELETE FROM Contacts
            WHERE id_contact = '${contactHiddenId}'`;
            const deletedId = await SqlRunPromise(query);

            //contact deleted, go back to contact list
            if(deletedId == undefined){
                displayMode(2);
            }
            //contact could not be deleted
            else{
                alert("Contact could not be deleted. We apologize for the inconvenience.");
            }
        }
        catch(error){
            console.log(error);
            alert("Contact could not be deleted. We apologize for the inconvenience.");
        }
    }
}

//ADD, MODIFY CONTACTS
async function displayModeAddContacts(contactId){
    displayMode(2);
    let firstName = document.getElementById('addContactFirstName');
    let lastName = document.getElementById('addContactLastName');
    let dob = document.getElementById('addContactDOB');
    let relation = document.getElementById('addContactRelation');
    let addBtn = document.getElementById('addContactSubmitBtn');
    let bio = document.getElementById('addContactBio');
    let delBtn = document.getElementById('deleteWrap');

    //ADD contact
    if(contactId < 0){
        //rewrite title text to "contacts > add"
        document.getElementById('contactsHeadTitleText').innerHTML = "<a class='titleLink' href='#' onclick='displayMode(2)'>Contacts</a> > Add";

        //change title icon to add contact
        document.getElementById('contactImg').src = "pictures/white_pfp_hover.png";

        //empty inputs, to enable add contact
        firstName.value = "";
        lastName.value = "";
        bio.innerHTML = "";
        dob.value = "";
        relation.value = '0';

        //change value of button to ADD CONTACT, hide DELETE BUTTON
        addBtn.innerHTML = "Add contact";
        delBtn.style.display = 'none';

        //display add contact, hide contact list 
        document.getElementById('contactList').style.display = 'none';
        document.getElementById('addContact').style.display = 'flex';

        //set contact mode to 0 - ADD MODE
        //contactMode = 0;

        //set selected contact ID to -1¸
        contactHiddenId = -1;

        firstName.select();
    }

    //MODIFY contact
    else{
        //get contact data from id
        try{
            let query = `SELECT id_contact, id_user, name, surname, dob, relation, bio 
            FROM Contacts 
            WHERE id_contact = '${contactId}'`;

            const row = await SqlGetPromise(query);

            //query successful - FILL FORM
            if(row != null){
                alert("load contact success");

                firstName.value = row.name;
                lastName.value = row.surname;
                bio.innerHTML = row.bio;
                relation.value = row.relation;

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

                //set selected contact id 
                contactHiddenId = contactId;
            }

            //query not successful
            else{
                alert("Error finding contact info");
                //contactMode = 0;
                contactHiddenId = -1;
            }

            firstName.select();
        }
        //data not found
        catch(error){
            console.log(error);
            //contactMode = 0;
            contactHiddenId = -1;
            alert("Error loading contact info");
        }
    }
}

//SELECT MAILS
async function displayModeGenerated(mailId){
    displayMode(1);

    let mails = document.getElementsByClassName('generatedLetter');
    let selectedMail = document.getElementById('generatedLetter' + mailId);
    selectedMail.style.borderLeft = "5px solid gray";

    for(let i = 0; i < mails.length; i++){
        mails[i].style.borderLeft = "3px solid gray";
    }

    //deselect - HIDE MAIL
    if(selectedMailId == mailId){
        selectedMail.style.borderLeft = "3px solid gray";
        selectedMailId = 0;
    }

    //select mail - SHOW MAIL
    else{
        selectedMailId = mailId;
        //alert("ba");
        //selectedMail.style.borderLeft = "5px solid gray";

        //query for mail
        try{
            let query = `SELECT id_mail, id_contact, id_user, title, date_generated, content
            FROM Mails
            WHERE id_mail = '${mailId}'`;

            const row = await SqlGetPromise(query);

            //mail found - DISPLAY MAIL
            if(row != null){

                //GET CONTACT NAME
                let contactName = "";

                try{
                    let contactQuery = `SELECT id_contact, id_user, name, surname, dob, relation, bio 
                    FROM Contacts 
                    WHERE id_contact = '${row.id_contact}'`;

                    const contactRow = await SqlGetPromise(contactQuery);

                    //contact found - show contact as '[Name], [Surname]'
                    if(contactRow != null){
                        contactName = contactRow.name + " " + contactRow.surname;
                    }

                    //contact not found - show contact as 'Contact X'
                    else{
                        contactName = "Contact " +  row.id_contact;
                    }
                }
                //if name could not be resolved - show contact as 'Contact X'
                catch(error2){
                    console.log("Contact name error: " + error2);
                    contactName = "Contact " +  row.id_contact;
                }

                //FILL RIGHT WINDOW WITH MAIL CONTENT
                document.getElementById('generatedMailWrap').innerHTML = `
                <!--mail content-->
                <div class="selectedMailWrap">

                    <!--mail title-->
                    <div class="selectedMailTop">
                        <div class="selectedMailTopLeft">  
                            <div class="selectedMailTopTitle">
                                ${row.title}
                            </div>
                            <div class="selectedMailTopContact">
                                <span style="font-size: 13px">to</span> <a onclick="displayModeAddContacts(${row.id_contact})" href="#">${contactName}</a>
                            </div>
                        </div>
                        <div class="selectedMailTopRight">
                            ${(row.date_generated).replaceAll("-", ".")}
                        </div>
                    </div>
                    <!--mail title-->

                    <!--mail content-->
                    <div class="selectedMailMiddle">${(row.content).trim()}</div>
                    <!--mail content-->
                </div>
                `; 

                //CHANGE HEAD TEXT TO 'Generated mail > [title of mail]'
                document.getElementById('generatedTitleText').innerHTML = `<a onclick='displayMode(1)' href='#' class='titleLink'>Generated mails</a> > ${row.title}`;
            }

            //mail not found
            else{
                alert("Mail not found");
            }
        }

        //unsuccessful query
        catch(error){
            console.log("Get mail error: " + error);
        }
    }

}

let formality = true;

function changeFormality(){
    //infromal
    if(formality){
        formality = false;
        document.getElementById('newFormalityOutput').innerHTML = "Informal";
    }
    //formal
    else{
        formality = true;
        document.getElementById('newFormalityOutput').innerHTML = "Formal";
    }
    //alert(formality);
}

async function generateMail(){
    //1. get new mail form data

    let title = document.getElementById('newMailTextField');
    let recipient = document.getElementById('newRecipentDropDown');
    let purpose = document.getElementById('newMailPurpose');
    let reason = document.getElementById('newReasonTextArea');
    //let formalityItem = document.getElementById('newFormalityCheck').value;
    let formal = formality;
    let formalTextSlo = "";
    let formalTextEng = "";

    if(formal){
        formalTextEng = "Formal";
        formalTextSlo = "Da";
    }
    else{
        formalTextEng = "Informal";
        formalTextSlo = "Ne";
    }

    let allgood = true;

    //2. check text fields if they are filled out (correctly)

    if(title.value.trim() == ""){
        allgood = false;
    }

    if(recipient.selectedIndex == 0){
        allgood = false;
    }

    if(purpose.selectedIndex == 0){
        allgood = false;
    }

    if(reason.innerHTML.trim() == ""){
        allgood = false;
    }

    //3. insert data into prompt

    ////------- TO DO (SOVIČ, MAXI)
    /*
    let SloPrompt = `
    Posiljatel: [login_name] //change it to how u fetch the login name
    Naslovnik: [naslovnik]
    Zadeva: [zadeva]
    Formalnost: ${formalTextSlo}
    Stil: [stil]
    Dodatne informacije: ${reason}
    Informacije o posiljatelju: [info id=0] //for the guy sending the email ~required profile~
    Informacije o naslovniku: [info id=naslovnik] //you see the idea here

    Na osnovi zgoraj navedenih podatkov, prosim ustvari e-mail sporočilo, 
    ki je prilagojeno želeni stopnji formalnosti in stilu, 
    uporabi tudi kreativnost ter povezi informacije o uporabniku z sporocilom. 
    Ce je bilo sporocilo uspesno kreirano, kot zadnji bit verige tvojega izhodnega sporocila dodaj stevilo 1
    `;*/

    let EngPrompt = `
    Sender: 
    Receiver: ${recipient}
    Subject: ${purpose}
    Formality: ${formalTextEng}
    Style/Type: 
    Extra info: ${reason}

    Sender info:
    Reciever info:

    With the data above, create an email, that is designed and tailored with the degree of formality mentioned above using the right style/type. 
    Use your creativity to connect the sender and receivers info into the email as needed and if it makes sense. 
    If the email was successfully created, make the last bit in the string of the output as the number 1 (add the number at the end)
    `;

    //4. send request to openai via the API
    ////------- TO DO (SOVIČ, MAXI)
    try{
        const generateRequest = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo"
        });

        console.log(generateRequest);
    }
    catch(error){
        console.log(error);
        alert("Mail could not be generated. We apologize for the inconvenience.");
    }
    
    //check if the email is correct - whether chatGPT understood the prompt or not
        //understood - clear text fields, go to mail
        //didn't understand - display "Your input data could not be understood by the AI"
}


/*-------------------------------------HOMEPAGE-------------------------------------*/
