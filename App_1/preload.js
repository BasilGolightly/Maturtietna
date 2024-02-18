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
        relation TEXT NOT NULL,
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

//INSERT INTO USERS 
function register(username, password) {
    let id = 0;
    let success = true;

    db.run(
        `INSERT INTO Users VALUES(NULL, '${username}', '${password}', '1')`, (err) => {
            if (err != null) {
                console.log(err);
                success = false;
            }
            else {
                console.log("user " + username + " successfuly registered");
            }
        }
    );
    
    //if insert is successful, write data to JSON and redirect to homepage
    if(success){
        db.get(`
        SELECT id_user FROM Users WHERE username = '${username.trim()}' AND password = '${password.trim()}'
        `, (err, row) => {
            if(row != null){
                id = row.id_user;
            }
            else{
                success = false;
            }
        });
        if(success){
            db.close();
            writeToLoginfile(username, password, id);
            window.location = "index.html";
        }
        else{
            document.getElementById('error').innerHTML += "The register action could not be carried out. <br>";
        }
        
    }
    else{
        document.getElementById('error').innerHTML += "The register action could not be carried out. <br>";
    }
}


/*-------------------------------------REGISTER-------------------------------------*/



/*-------------------------------------LOGIN-------------------------------------*/



//CHECK IF LOGIN PASSWORD IS CORRECT
function loginCheck() {
    let password =  document.getElementById('passwordTextField').value.trim();
    let username = document.getElementById('loginName').innerHTML.trim();
    let success = true;

    if(password != "" && username != ""){
        login();
    }
    else{
        document.getElementById('errorLogin').innerHTML = "Password cannot be empty";
    }
}

//LOGIN - WRITE TO JSON AND REDIRECT
function login(){
    db.get(`
        SELECT id_user FROM Users WHERE
        username = '${username}' AND password = '${password}'
        `, (err, row) => {
            if(row != null){
                let id = row.id_user;                
            }
            else{
                document.getElementById('errorLogin').innerHTML = "Incorrect password";
                success = false;
            }
        });
}

let countAcc = 0;

//DISPLAY EXISTING ACCOUNTS
function loginDisplayAccounts(){
    countAcc = 0;
    db.each(
        "SELECT id_user, username FROM Users", (err, row) => {
            if(row != null){
                document.getElementById('accountsList').innerHTML += `

                <div class="accountWrap">
                    <div class="accountInner">
                        <div class="accountName" id="accountName${row.id_user}">
                            ${row.username.trim()}
                        </div>
                        <div class="accountArrowWrap">
                            <button class="accountArrow" onclick="loginDisplay(1, ${row.id_user});">
                                <img src="pictures/arrow_circle_icon.png" class="arrowIcon">
                            </button>
                        </div>
                    </div>
                </div>
                `;
                countAcc++;
                console.log(countAcc);
            }
        }
    )
    
    loginCheckAccountCount();
}

//CHECK NUM OF EXISTING ACCOUNTS
function loginCheckAccountCount(){
    if(countAcc === 0){
        document.getElementById('accountsList').innerHTML = "";
    }
}

//WRITE TO TEMPORARY JSON FILE
function writeToLoginfile(username, pass, id) {
    const obj = {
        UserName: username,
        Pass: pass,
        Id: id
    };
    fs.writeFile('DB/login.json', JSON.stringify(obj), (err) => {
        console.log(err);
    }
    );
}

function writeToLoginfile(username, pass, id, redirect){
    writeToLoginfile(username, pass, id);
    window.location = redirect;
}

//TEMPLATE - READ FROM JSON
/*
function readLoginfile(){
    let obj;
    fs.readFile("DB/login.json", "utf-8", (error, data) =>{
        console.log(JSON.parse(data));
    });
}
*/

/*-------------------------------------LOGIN-------------------------------------*/



/*-------------------------------------HOMEPAGE-------------------------------------*/

//load all of user's info by reading ID from JSON and querying for data
function loadUserProfile(){
    let id, username = "";

    //get ID from JSON
    fs.readFile("DB/login.json", "utf-8", (error, data) =>{
        let obj = JSON.parse(data);
        id = obj.Id;
        //username = obj.UserName
    });

    //query for user data via ID
    db.get(`
    SELECT username, password, firstTime
    FROM Users
    WHERE id_user = ${id} 
    `, (err, row) => {
        if(row == undefined || row == null){
            window.location = "login.html";
        }
        else{
            username = row.username;
        }
    });
    
    document.getElementById('navAccName').innerHTML = username.trim();

    //at the end, delete contents of JSON, to avoid unintended access to user info
    writeToLoginfile("", "", "");
}

function loadUserSettings(accId){
    
}
/*-------------------------------------HOMEPAGE-------------------------------------*/
