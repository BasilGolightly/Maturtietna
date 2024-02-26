//const{ contextBridge } = require('electron');
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

            //"return" the result when the action finish
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

                <div class="accountWrap">
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

    let newMailFrame = document.getElementById('newMailFrame');
    let generatedFrame = document.getElementById('generatedFrame');
    let contactsFrame = document.getElementById('contactsFrame');
    let settingsFrame = document.getElementById('settingsFrame');
    let backgroundNavColor = "rgb(35, 35, 35)";

    //reset navbar, such that no list item is glowing
    for(let i = 0; i < navItems.length; i++){
        navItems[i].style.backgroundColor = "transparent";
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
            generatedFrame.style.display = "none";
            contactsFrame.style.display = "none";
            settingsFrame.style.display = "none";
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

            document.getElementById('generatedWrap').style.display = "flex";
            newMailFrame.style.display = "none";
            contactsFrame.style.display = "none";
            settingsFrame.style.display = "none";
            document.getElementById('generatedNavItem').style.backgroundColor = backgroundNavColor;
            break;
        //contacts
        case 2:
            //alert('2');
            displayModeId = 2;
            contactsFrame.style.display = "flex";
            newMailFrame.style.display = "none";
            generatedFrame.style.display = "none";
            settingsFrame.style.display = "none";
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
            contactsFrame.style.display = "none";
            newMailFrame.style.display = "none";
            generatedFrame.style.display = "none";
            document.getElementById('settingsNavItem').style.backgroundColor = backgroundNavColor;
            break;
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


        }
        //unsuccessful read
        else{
            window.location = "login.html";
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
    catch(error){
        alert(error);
        window.location = "login.html";
    }
}

// 0 = ADD, 1 = MODIFY
let contactMode = 0;
let contactHiddenId = -1;

//SUBMIT CONTACT - INSERT / MODIFY
async function submitContact(){
    
    //INSERT INTO
    if(contactHiddenId < 0){
        /*---TO DO---*/
    }

    //MODIFY
    else{
        /*---TO DO---*/
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

        //change value of button to ADD CONTACT
        addBtn.innerHTML = "Add contact";

        //display add contact, hide contact list 
        document.getElementById('contactList').style.display = 'none';
        document.getElementById('addContact').style.display = 'flex';

        //set contact mode to 0 - ADD MODE
        contactMode = 0;

        //set selected contact ID to -1¸
        contactHiddenId = -1;
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
                document.getElementById('contactsHeadTitleText').innerHTML = `<a class='titleLink' href='#' onclick='displayMode(2)'>Contacts</a> >${row.name + " " + row.surname}`;

                //change value of button to SAVE CHANGES
                addBtn.innerHTML = "Save changes";

                //at the end, display modify contact screen
                document.getElementById('contactList').style.display = 'none';
                document.getElementById('addContact').style.display = 'flex';

                //set contact mode to 1 - MODIFY MODE
                contactMode = 1;

                //set selected contact id 
                contactHiddenId = contactId;
            }

            //query not successful
            else{
                alert("Error finding contact info");
                contactMode = 0;
                contactHiddenId = -1;
            }
        }
        //data not found
        catch(error){
            console.log(error);
            contactMode = 0;
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
        selectedMail.style.borderLeft = "5px solid gray";

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
                            ${row.date_generated}
                        </div>
                    </div>
                    <!--mail title-->

                    <!--mail content-->
                    <div class="selectedMailMiddle">
                        ${row.content}
                    </div>
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


/*-------------------------------------HOMEPAGE-------------------------------------*/
