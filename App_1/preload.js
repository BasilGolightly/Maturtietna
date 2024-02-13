//const{ contextBridge } = require('electron');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

console.log('backend');

//connect to sql DB
let db = new sqlite3.Database('./DB/data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error(err.message);
    }
    else{
        console.log('Connected to the local DB.');

        //CREATE USERS TABLE
        db.run(`CREATE TABLE IF NOT EXISTS Users(
            id_user INTEGER PRIMARY KEY AUTOINCREMENT,
            username NVARCHAR(50) NOT NULL,
            password NVARCHAR(255) NOT NULL,
            firstTime INTEGER NOT NULL CHECK (firstTime IN('0', '1'))
        );`, (err) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log("Users table created / already exists.");
            }
        })

        /*
        db.run(`INSERT INTO Users VALUES(NULL, 'pimpek', 'lulek', '1')`, (err) => {
            if(err){
                console.error(err.message);
            }
            else{
                console.log("User inserted.");
            }
        })*/

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
            if(err){
                console.error(err.message);
            }
            else{
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
            if(err){
                console.error(err.message);
            }
            else{
                console.log("Mails table created / already exists.");
            }
        })
    }
});

/*-------------------------------------REGISTER-------------------------------------*/
function register(username, password){
    let sql = "";
    
    db.run(
        `INSERT INTO Users VALUES(NULL, '${username}', '${password}', '1')`, (err) => {
            if(err){
                console.log(err);
            }
            else{
                console.log("user " + username + "successfuly registered");
            }
        }
    );
}

function registerCheck(){
    //set error display to empty string
    let errorHTML =  document.getElementById('error');
    errorHTML.innerHTML = "";
    let error = "";

    //get user input data
    let allgood = true;
    let username = document.getElementById('newUsername').value.trim();
    let password = document.getElementById('passwordtextBox1').value.trim();
    let repeatPass = document.getElementById('passwordtextBox2"').value.trim();

    //username check
    if(username == ""){
        error = "Username cannot be empty.<br>";
        allgood = false;
    }
    else{
        for(let i = 0; i < username.length; i++){
            if(username[i] === ' '){
                error += "Username cannot contain spaces.<br>";
                allgood = false;
                break;
            }
        }
    }

    //pass check
    if(password == ""){
        error += "Password cannot be empty.<br>";
        allgood = false;
    }
    else{
        if(password.length < 12){
            error += "Password has to be at least 12 characters long.<br>";
            allgood = false;
        }
        else{
            for(let i = 0; i < password.length; i++){
                if(password[i] === ' '){
                    error += "Password cannot contain spaces.<br>";
                    allgood = false;
                    break;
                }
            }
        }
    }

    //repeat pass check
    if(repeatPass != password || repeatPass === ''){
        error += "Passwords do not match";
        allgood = false;
    }

    //proceed with register
    if(allgood){
        register(username, password);
    }
}
/*-------------------------------------REGISTER-------------------------------------*/

/*-------------------------------------LOGIN-------------------------------------*/
function loginCheck(){
    db.each(
        "SELECT id_user, username FROM Users", (err, row) => {
            console.log("ID: " + row.id_user + " Username: " + row.username);
        }
    )
}

function writeToLoginfile(username, pass, id){
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
/*-------------------------------------LOGIN-------------------------------------*/


