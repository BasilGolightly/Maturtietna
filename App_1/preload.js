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
        const Writesuccess = await writeToLoginfile(username, password, id)
        
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
            const WriteLoginSuccess = await writeToLoginfile(username, password, row.id_user);

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

//load all of user's info by reading ID from JSON and querying for data
async function loadUserProfile(){
    try{
        let id = "", username = "", password = "";
        const obj = await readLoginFile();

        id = obj.Id;
        username = obj.UserName;
        password = obj.Pass;

        if(id != ""){
            alert("success");
            document.getElementById('navAccName').innerHTML = username.trim();
        }

        //at the end, delete contents of JSON, to avoid unintended access to user info
        try{
            const deleteJSONsuccess = await writeToLoginfile("", "", "");
            if(!deleteJSONsuccess){
                window.location = "login.html";
            }
        }
        //if data delete could not go through, go back to login
        catch(error){
            console.log("JSON Delete error: " + error);
        }
        
    }
    catch(error){
        window.location = "login.html";
    }
}

function loadUserSettings(accId){
    
}
/*-------------------------------------HOMEPAGE-------------------------------------*/
